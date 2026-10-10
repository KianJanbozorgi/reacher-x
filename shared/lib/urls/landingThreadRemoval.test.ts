import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../../proxy";

const auth = vi.hoisted(() => ({ account: null as null | { email: string } }));
vi.mock("@/shared/lib/localAuth/session", () => ({
  SESSION_COOKIE: "rx_session",
  accountForSession: () => auth.account,
}));

beforeEach(() => {
  auth.account = null;
  process.env.PRIVATE_ALLOWED_EMAILS = "tester@example.test";
});

test.each(["/home", "/pricing", "/blog", "/demo", "/post/linkedin/123"])(
  "retired public route %s stays hidden",
  async (path) => {
    const response = await proxy(new NextRequest(`https://app.example.test${path}`));
    expect(response.status).toBe(404);
  }
);

test.each(["/login", "/signup", "/forgot-password", "/reset-password", "/api/auth/login"])(
  "local auth route %s is reachable without a session",
  async (path) => {
    const response = await proxy(new NextRequest(`https://app.example.test${path}`));
    expect(response.headers.get("location")).toBeNull();
  }
);

test("private routes redirect anonymous visitors to local login", async () => {
  const response = await proxy(new NextRequest("https://app.example.test/agent/setup"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://app.example.test/login?returnTo=%2Fagent%2Fsetup");
});

test("allowed local accounts can access the application", async () => {
  auth.account = { email: "tester@example.test" };
  const response = await proxy(new NextRequest("https://app.example.test/agent"));
  expect(response.status).toBe(200);
  expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
});

test("accounts removed from the allowlist lose access", async () => {
  auth.account = { email: "other@example.test" };
  const response = await proxy(new NextRequest("https://app.example.test/agent"));
  expect(response.status).toBe(403);
});
