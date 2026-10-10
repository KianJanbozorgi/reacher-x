import { NextRequest } from "next/server";
import { failure, normalizeEmail, requestReset, safeRequest } from "@/shared/lib/localAuth/http";

export async function POST(request: NextRequest) {
  if (!safeRequest(request)) return failure("Invalid request origin.", 403);
  try {
    const body = await request.json();
    return await requestReset(normalizeEmail(body.email));
  } catch {
    return failure("Could not send reset email. Try again later.");
  }
}
