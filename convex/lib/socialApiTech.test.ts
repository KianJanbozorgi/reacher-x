import { afterEach, expect, test, vi } from "vitest";
import { compactTwitterSearchResults } from "./twitterSearchResultCore";
import {
  fetchSocialApiTech,
  normalizeTechPosts,
  UnsupportedSocialApiOperation,
} from "./socialApiTech";

afterEach(() => vi.unstubAllEnvs());

test("search uses documented SocialAPI.tech contract and keeps posts usable for persistence", async () => {
  vi.stubEnv("SOCIALAPI_API_KEY", "test-key");
  const calls: URL[] = [];
  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    calls.push(url);
    expect(init?.headers).toMatchObject({ "X-API-Key": "test-key" });
    if (url.pathname === "/v1/search/advanced") {
      return Response.json({ status: "success", data: [{ id: "2078", text: "Need a new CRM", author: { username: "founder" } }], meta: { count: 1 } });
    }
    return Response.json({ status: "success", data: { id: "44", username: "founder", display_name: "Founder", created_at: "Tue Jun 02 2009", profile_image_url: "https://pbs.twimg.com/a.jpg" } });
  });
  const response = await fetchSocialApiTech("https://socialapi.tech/twitter/search?query=CRM%20since_time%3A1760000000&type=Latest", undefined, fetcher as typeof fetch);
  expect(response.ok).toBe(true);
  const payload = await response.json();
  const posts = compactTwitterSearchResults(payload.tweets);
  expect(posts).toHaveLength(1);
  expect(posts[0]?.id_str).toBe("2078");
  expect(posts[0]?.user.id_str).toBe("44");
  expect(posts[0]?.full_text).toBe("Need a new CRM");
  expect(calls.map((url) => url.pathname)).toEqual(["/v1/search/advanced", "/v1/user/info"]);
  expect(calls[0]?.searchParams.get("query")).toMatch(/since:2025-10-09/);
  expect(payload.next_cursor).toBeUndefined();
});

test("unsupported legacy operations fail before any request", async () => {
  vi.stubEnv("SOCIALAPI_API_KEY", "test-key");
  const fetcher = vi.fn();
  await expect(fetchSocialApiTech("https://socialapi.tech/monitors/search-query", { method: "POST" }, fetcher)).rejects.toBeInstanceOf(UnsupportedSocialApiOperation);
  await expect(fetchSocialApiTech("https://socialapi.tech/twitter/search?query=x&cursor=old", undefined, fetcher)).rejects.toBeInstanceOf(UnsupportedSocialApiOperation);
  expect(fetcher).not.toHaveBeenCalled();
});

test("retries a temporary SocialAPI.tech search failure", async () => {
  vi.stubEnv("SOCIALAPI_API_KEY", "test-key");
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
    .mockResolvedValueOnce(Response.json({
      status: "success",
      data: [{ id: "2078", text: "Need a CRM", author: { id: "44", username: "founder" } }],
      meta: { count: 1 },
    }));
  const response = await fetchSocialApiTech(
    "https://socialapi.tech/twitter/search?query=CRM&type=Latest",
    undefined,
    fetcher as typeof fetch
  );
  expect(response.ok).toBe(true);
  expect((await response.json()).tweets).toHaveLength(1);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
