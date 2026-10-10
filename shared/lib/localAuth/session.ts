import "server-only";

import { createPrivateKey, createPublicKey, randomUUID, sign } from "node:crypto";
import { cookies } from "next/headers";
import { authDb, getAccountById, type Account } from "./store";
import { digest, randomToken } from "./crypto";

export const SESSION_COOKIE = "rx_session";
const SESSION_MS = 14 * 24 * 60 * 60_000;

export function createSession(accountId: string): string {
  const token = randomToken();
  authDb().prepare("INSERT INTO sessions(token_hash, account_id, expires_at) VALUES (?, ?, ?)")
    .run(digest(token), accountId, Date.now() + SESSION_MS);
  return token;
}

export function accountForSession(token: string | undefined): Account | undefined {
  if (!token) return undefined;
  const row = authDb().prepare("SELECT account_id FROM sessions WHERE token_hash=? AND expires_at>?")
    .get(digest(token), Date.now()) as { account_id: string } | undefined;
  return row ? getAccountById(row.account_id) : undefined;
}

export async function currentAccount(): Promise<Account | undefined> {
  return accountForSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export function revokeSession(token: string | undefined): void {
  if (token) authDb().prepare("DELETE FROM sessions WHERE token_hash=?").run(digest(token));
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const,
    path: "/", maxAge: SESSION_MS / 1000 };
}

function privateKey() {
  const encoded = process.env.AUTH_JWT_PRIVATE_KEY;
  if (!encoded) throw new Error("AUTH_JWT_PRIVATE_KEY is required.");
  return createPrivateKey(Buffer.from(encoded, "base64").toString("utf8"));
}

export function publicJwk() {
  const jwk = createPublicKey(privateKey()).export({ format: "jwk" });
  return { ...jwk, use: "sig", alg: "RS256", kid: digest(JSON.stringify(jwk)).slice(0, 16) };
}

export function issueConvexToken(account: Account): string {
  const issuer = process.env.AUTH_ISSUER_URL?.replace(/\/$/, "");
  if (!issuer) throw new Error("AUTH_ISSUER_URL is required.");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: publicJwk().kid })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: issuer, aud: "reacher-x", sub: account.id,
    email: account.email, name: [account.first_name, account.last_name].filter(Boolean).join(" ") || account.email,
    iat: now, exp: now + 5 * 60, jti: randomUUID() })).toString("base64url");
  const signed = `${header}.${payload}`;
  return `${signed}.${sign("RSA-SHA256", Buffer.from(signed), privateKey()).toString("base64url")}`;
}
