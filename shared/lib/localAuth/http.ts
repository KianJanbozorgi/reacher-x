import "server-only";

import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { allowAttempt, authDb, getAccount } from "./store";
import { hashPassword, verifyPassword } from "./crypto";
import { createSession, issueConvexToken, SESSION_COOKIE, sessionCookieOptions } from "./session";
import { bootstrapPostAuthSetup } from "@/shared/lib/auth/postAuthBootstrap";

export function safeRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  return !!origin && !!expected && origin === new URL(expected).origin;
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function failure(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function completeLogin(accountId: string, extra: Record<string, unknown> = {}): Promise<NextResponse> {
  const account = authDb().prepare("SELECT * FROM accounts WHERE id=?").get(accountId) as ReturnType<typeof getAccount>;
  if (!account) return failure("Account not found", 404);
  const token = createSession(accountId);
  const response = NextResponse.json({ ok: true, ...extra });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  try {
    await bootstrapPostAuthSetup({ accessToken: issueConvexToken(account), user: {
      id: account.id, email: account.email, firstName: account.first_name, lastName: account.last_name,
      profilePictureUrl: null,
    } });
  } catch {
    // The client-side user provisioning path retries after login.
  }
  return response;
}

export async function signup(email: string, password: string, name: string) {
  if (!email) return failure("Enter a valid email address.");
  if (typeof name !== "string" || !name.trim() || name.trim().length > 120)
    return failure("Enter your name (up to 120 characters).");
  if (!allowAttempt(`signup:${email}`, 5, 60 * 60_000)) return failure("Too many attempts. Try again later.", 429);
  if (getAccount(email)) return failure("An account already exists for this email.", 409);
  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  const [firstName, ...lastName] = name.trim().replace(/\s+/g, " ").split(" ");
  try {
    authDb().prepare("INSERT INTO accounts(id,email,password_hash,first_name,last_name,created_at) VALUES (?,?,?,?,?,?)")
      .run(id, email, passwordHash, firstName, lastName.join(" ") || null, Date.now());
  } catch {
    return failure("An account already exists for this email.", 409);
  }
  return completeLogin(id);
}

export async function login(email: string, password: string) {
  if (!email || !allowAttempt(`login:${email}`, 10, 15 * 60_000))
    return failure("Invalid email or password.", 401);
  const account = getAccount(email);
  if (!account || !(await verifyPassword(password, account.password_hash)))
    return failure("Invalid email or password.", 401);
  return completeLogin(account.id);
}
