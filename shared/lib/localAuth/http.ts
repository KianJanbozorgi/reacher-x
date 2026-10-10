import "server-only";

import { createHmac, randomInt, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isPrivateUser } from "@/shared/lib/privateAccess";
import { allowAttempt, authDb, getAccount } from "./store";
import { digest, equalDigest, hashCode, hashPassword, randomToken, verifyPassword } from "./crypto";
import { createSession, issueConvexToken, SESSION_COOKIE, sessionCookieOptions } from "./session";
import { bootstrapPostAuthSetup } from "@/shared/lib/auth/postAuthBootstrap";

type Purpose = "reset";

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

export function authorizedEmail(email: string): boolean {
  return isPrivateUser(email, process.env.PRIVATE_ALLOWED_EMAILS);
}

async function sendCode(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY and AUTH_EMAIL_FROM are required for account email.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject: "Reset your Reacher X password",
      text: `Your one-time code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.` }),
  });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status}).`);
}

export async function createAndSendCode(email: string, purpose: Purpose, passwordHash?: string): Promise<void> {
  if (!allowAttempt(`send:${purpose}:${email}`, 3, 60 * 60_000)) throw new Error("Too many requests. Try again later.");
  const code = randomInt(0, 100_000_000).toString().padStart(8, "0");
  authDb().prepare("INSERT INTO codes(email,purpose,code_hash,password_hash,expires_at,attempts) VALUES (?,?,?,?,?,0) ON CONFLICT(email,purpose) DO UPDATE SET code_hash=excluded.code_hash,password_hash=excluded.password_hash,expires_at=excluded.expires_at,attempts=0")
    .run(email, purpose, hashCode(email, purpose, code), passwordHash ?? null, Date.now() + 10 * 60_000);
  try {
    await sendCode(email, code);
  } catch (error) {
    authDb().prepare("DELETE FROM codes WHERE email=? AND purpose=?").run(email, purpose);
    throw error;
  }
}

export function consumeCode(email: string, purpose: Purpose, code: string): string | null | undefined {
  const db = authDb();
  const row = db.prepare("SELECT code_hash,password_hash,expires_at,attempts FROM codes WHERE email=? AND purpose=?")
    .get(email, purpose) as { code_hash: string; password_hash: string | null; expires_at: number; attempts: number } | undefined;
  if (!row || row.expires_at < Date.now() || row.attempts >= 5 || !/^\d{8}$/.test(code)) return undefined;
  db.prepare("UPDATE codes SET attempts=attempts+1 WHERE email=? AND purpose=?").run(email, purpose);
  if (!equalDigest(row.code_hash, hashCode(email, purpose, code))) return undefined;
  db.prepare("DELETE FROM codes WHERE email=? AND purpose=?").run(email, purpose);
  return row.password_hash;
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

export async function signup(email: string, password: string, inviteCode: string) {
  if (!email || !authorizedEmail(email)) return failure("This application is private.", 403);
  if (!allowAttempt(`signup:${email}`, 5, 60 * 60_000)) return failure("Too many attempts. Try again later.", 429);
  const master = process.env.AUTH_INVITE_CODE;
  const expected = master && master.length >= 32
    ? createHmac("sha256", master).update(email).digest("hex") : "";
  if (!expected || typeof inviteCode !== "string" || !equalDigest(digest(inviteCode), digest(expected)))
    return failure("Invalid invitation code.", 403);
  if (getAccount(email)) return failure("An account already exists for this email.", 409);
  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  try {
    authDb().prepare("INSERT INTO accounts(id,email,password_hash,created_at) VALUES (?,?,?,?)")
      .run(id, email, passwordHash, Date.now());
  } catch {
    return failure("An account already exists for this email.", 409);
  }
  const recoveryCodes = Array.from({ length: 8 }, () => randomToken(12));
  const insertCode = authDb().prepare("INSERT INTO recovery_codes(account_id,code_hash) VALUES (?,?)");
  for (const code of recoveryCodes) insertCode.run(id, digest(code));
  return completeLogin(id, { recoveryCodes });
}

export async function login(email: string, password: string) {
  if (!email || !authorizedEmail(email) || !allowAttempt(`login:${email}`, 10, 15 * 60_000))
    return failure("Invalid email or password.", 401);
  const account = getAccount(email);
  if (!account || !(await verifyPassword(password, account.password_hash)))
    return failure("Invalid email or password.", 401);
  return completeLogin(account.id);
}

export async function requestReset(email: string) {
  if (!process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM)
    return failure("Email recovery is unavailable. Use a saved recovery code.", 503);
  if (email && authorizedEmail(email) && getAccount(email)) await createAndSendCode(email, "reset");
  return NextResponse.json({ ok: true });
}

export async function confirmReset(email: string, code: string, password: string) {
  if (!email || !authorizedEmail(email)) return failure("Invalid or expired reset code.");
  if (!allowAttempt(`confirm:reset:${email}`, 10, 15 * 60_000)) return failure("Too many attempts. Try again later.", 429);
  const passwordHash = await hashPassword(password);
  const account = getAccount(email);
  if (!account) return failure("Invalid or expired reset code.");
  let valid = false;
  if (/^\d{8}$/.test(code)) valid = consumeCode(email, "reset", code) !== undefined;
  else if (typeof code === "string" && /^[A-Za-z0-9_-]{16}$/.test(code)) {
    const deleted = authDb().prepare("DELETE FROM recovery_codes WHERE account_id=? AND code_hash=?")
      .run(account.id, digest(code));
    valid = deleted.changes === 1;
  }
  if (!valid) return failure("Invalid or expired reset code.");
  authDb().prepare("UPDATE accounts SET password_hash=? WHERE id=?").run(passwordHash, account.id);
  authDb().prepare("DELETE FROM sessions WHERE account_id=?").run(account.id);
  return completeLogin(account.id);
}
