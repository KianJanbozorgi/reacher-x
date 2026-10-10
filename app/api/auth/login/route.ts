import { NextRequest } from "next/server";
import { failure, login, normalizeEmail, safeRequest } from "@/shared/lib/localAuth/http";

export async function POST(request: NextRequest) {
  if (!safeRequest(request)) return failure("Invalid request origin.", 403);
  try {
    const body = await request.json();
    return await login(normalizeEmail(body.email), body.password);
  } catch {
    return failure("Could not sign in.");
  }
}
