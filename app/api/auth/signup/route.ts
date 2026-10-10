import { NextRequest } from "next/server";
import { failure, normalizeEmail, safeRequest, signup } from "@/shared/lib/localAuth/http";

export async function POST(request: NextRequest) {
  if (!safeRequest(request)) return failure("Invalid request origin.", 403);
  try {
    const body = await request.json();
    return await signup(normalizeEmail(body.email), body.password, body.name);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not create account.", 400);
  }
}
