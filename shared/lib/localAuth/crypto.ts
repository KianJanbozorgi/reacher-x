import "server-only";

import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

function scrypt(password: string, salt: string, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) => scryptCallback(password, salt, length,
    { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
    (error, key) => error ? reject(error) : resolve(key)));
}

export function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 1024) throw new Error("Password must be 12–1024 characters.");
  const salt = randomBytes(32).toString("base64url");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$32768$${salt}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, work, salt, value] = stored.split("$");
  if (scheme !== "scrypt" || work !== "32768" || !salt || !value) return false;
  const expected = Buffer.from(value, "base64url");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hashCode(email: string, purpose: string, code: string): string {
  const secret = process.env.AUTH_CODE_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_CODE_SECRET must contain at least 32 characters.");
  return createHmac("sha256", secret).update(`${email}:${purpose}:${code}`).digest("hex");
}

export function equalDigest(a: string, b: string): boolean {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}
