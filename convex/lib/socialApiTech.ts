/** SocialAPI.tech contract: https://socialapi.tech/docs (2026-10-09).
 * Legacy paths are internal operation identifiers only. No request is sent to
 * those paths; this adapter owns endpoints, authentication and normalization.
 */
export const SOCIAL_API_TECH_BASE_URL = "https://socialapi.tech/v1";

type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue : {};
}
function string(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export class UnsupportedSocialApiOperation extends Error {
  constructor(operation: string) {
    super(`SocialAPI.tech does not document support for ${operation}.`);
    this.name = "UnsupportedSocialApiOperation";
  }
}

export function normalizeTechUser(value: unknown): RecordValue {
  const user = record(value);
  const username = string(user.username ?? user.screen_name);
  const id = string(user.id ?? user.user_id ?? user.id_str);
  if (!id || !username) throw new Error("SocialAPI.tech returned a profile without a string ID or username.");
  return {
    ...user,
    id_str: id,
    screen_name: username,
    name: user.display_name ?? user.name ?? username,
    description: user.bio ?? user.description ?? "",
    created_at: user.created_at ?? "",
    profile_image_url_https: user.profile_image_url_https ?? user.profile_image_url ?? user.avatar ?? "",
    friends_count: user.following_count ?? user.friends_count ?? 0,
    verified: user.blue_verified ?? user.verified ?? false,
  };
}

export function normalizeTechTweet(value: unknown): RecordValue {
  const tweet = record(value);
  const id = string(tweet.id ?? tweet.tweet_id ?? tweet.id_str);
  if (!id) throw new Error("SocialAPI.tech returned a post without a string ID.");
  const author = record(tweet.author ?? tweet.user);
  // Search can contain a sparse author. Preserve its handle without inventing a
  // numeric account ID; profile hydration resolves it before account operations.
  const username = string(author.username ?? author.screen_name);
  if (!username) throw new Error("SocialAPI.tech returned a post without an author handle.");
  const user = {
    ...author,
    id_str: string(author.id ?? author.user_id ?? author.id_str) ?? "",
    screen_name: username,
    name: author.display_name ?? author.name ?? username,
    description: author.bio ?? author.description ?? "",
    created_at: author.created_at ?? "",
    profile_image_url_https: author.profile_image_url_https ?? author.profile_image_url ?? author.avatar ?? "",
    verified: author.blue_verified ?? author.verified ?? false,
    friends_count: author.following_count ?? author.friends_count ?? 0,
  };
  return {
    ...tweet,
    id_str: id,
    full_text: tweet.text ?? tweet.full_text ?? "",
    favorite_count: tweet.like_count ?? tweet.favorite_count ?? 0,
    retweet_count: tweet.retweet_count ?? 0,
    reply_count: tweet.reply_count ?? 0,
    quote_count: tweet.quote_count ?? 0,
    views_count: tweet.view_count ?? tweet.views_count,
    user,
  };
}

type Envelope = { status: "success"; data: unknown; meta: RecordValue };
export function parseTechEnvelope(value: unknown): Envelope {
  const payload = record(value);
  if (payload.status !== "success" || !("data" in payload)) {
    throw new Error("SocialAPI.tech returned an unsuccessful or invalid response.");
  }
  return { status: "success", data: payload.data, meta: record(payload.meta) };
}

/** No search/timeline/thread cursor is documented. Never fabricate pagination. */
export function normalizeTechPosts(value: unknown) {
  const envelope = parseTechEnvelope(value);
  if (!Array.isArray(envelope.data)) throw new Error("SocialAPI.tech returned an invalid post list.");
  return { tweets: envelope.data.map(normalizeTechTweet) };
}

export async function fetchSocialApiTech(
  input: string | URL | Request,
  init?: RequestInit,
  fetcher: typeof fetch = fetch
): Promise<Response> {
  const operation = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
  if (operation.origin !== "https://socialapi.tech") throw new Error("Invalid SocialAPI operation origin.");
  const path = operation.pathname;
  // Fail before reading credentials or making requests for unsupported operations.
  if (init?.method && init.method !== "GET") throw new UnsupportedSocialApiOperation(path);
  if (path.startsWith("/monitors/") || /\/(similar|extended-bio|retweeted_by|commented_by)(\/|$)/.test(path)) {
    throw new UnsupportedSocialApiOperation(path);
  }
  if (operation.searchParams.has("cursor")) throw new UnsupportedSocialApiOperation(`cursor pagination for ${path}`);
  const apiKey = process.env.SOCIALAPI_API_KEY?.trim();
  if (!apiKey) throw new Error("Configure SOCIALAPI_API_KEY on the Convex backend.");
  const request = async (endpoint: string, params: Record<string, string>) => {
    const url = new URL(`${SOCIAL_API_TECH_BASE_URL}${endpoint}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return fetcher(url, {
      method: "GET",
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      signal: init?.signal ?? AbortSignal.timeout(30_000),
      redirect: "error",
    });
  };
  const getUsername = async (identifier: string) => {
    if (!/^\d+$/.test(identifier)) return identifier.replace(/^@/, "");
    const response = await request("/user/info_by_id", { user_id: identifier });
    if (!response.ok) throw new Error(`SocialAPI.tech profile lookup failed (${response.status}).`);
    const profile = parseTechEnvelope(await response.json());
    const username = string(record(profile.data).username);
    if (!username) throw new Error("SocialAPI.tech could not resolve the account handle.");
    return username;
  };
  let response: Response;
  let kind: "profile" | "posts" | "relationship";
  const profile = path.match(/^\/twitter\/user\/([^/]+)$/);
  const timeline = path.match(/^\/twitter\/user\/([^/]+)\/(tweets|tweets-and-replies)$/);
  const relationship = path.match(/^\/twitter\/user\/([^/]+)\/following\/([^/]+)$/);
  const thread = path.match(/^\/twitter\/thread\/([^/]+)$/);
  if (path === "/twitter/search") {
    const type = operation.searchParams.get("type") ?? "Latest";
    if (!["Latest", "Top", "Media"].includes(type)) throw new UnsupportedSocialApiOperation(`search product ${type}`);
    response = await request("/search/advanced", {
      query: operation.searchParams.get("query") ?? "",
      product: type,
      limit: "20",
    });
    kind = "posts";
  } else if (profile) {
    const identifier = decodeURIComponent(profile[1]);
    const byId = /^\d+$/.test(identifier);
    response = await request(byId ? "/user/info_by_id" : "/user/info", { [byId ? "user_id" : "username"]: identifier });
    kind = "profile";
  } else if (timeline) {
    const username = await getUsername(decodeURIComponent(timeline[1]));
    response = await request("/user/last_tweets", { username, limit: "20", ...(timeline[2] === "tweets" ? { exclude: "replies,retweets" } : {}) });
    kind = "posts";
  } else if (thread) {
    response = await request("/tweet/thread", { id: decodeURIComponent(thread[1]), limit: "50" });
    kind = "posts";
  } else if (relationship) {
    const source = await getUsername(decodeURIComponent(relationship[1]));
    const target = await getUsername(decodeURIComponent(relationship[2]));
    response = await request("/user/relationship", { source, target });
    kind = "relationship";
  } else {
    throw new UnsupportedSocialApiOperation(path);
  }
  if (!response.ok) {
    // Keep credentials and arbitrary upstream bodies out of application logs.
    return Response.json({ error: `SocialAPI.tech request failed (${response.status}).` }, { status: response.status });
  }
  const payload: unknown = await response.json();
  const envelope = parseTechEnvelope(payload);
  const normalized = kind === "posts" ? normalizeTechPosts(payload)
    : kind === "profile" ? normalizeTechUser(envelope.data)
    : { is_following: record(envelope.data).following === true };
  return Response.json(normalized);
}
