import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revokeSession, SESSION_COOKIE } from "@/shared/lib/localAuth/session";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin)
    return new NextResponse("Invalid origin", { status: 403 });
  const jar = await cookies();
  revokeSession(jar.get(SESSION_COOKIE)?.value);
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
