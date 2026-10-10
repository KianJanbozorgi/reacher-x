import { NextRequest } from "next/server";
import { confirmReset, failure, normalizeEmail, safeRequest } from "@/shared/lib/localAuth/http";

export async function POST(request: NextRequest) {
  if (!safeRequest(request)) return failure("Invalid request origin.", 403);
  try {
    const body = await request.json();
    return await confirmReset(normalizeEmail(body.email), body.code, body.password);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not reset password.");
  }
}
