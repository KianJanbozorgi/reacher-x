import { NextResponse, type NextRequest } from "next/server";
import { isPrivateUser } from "@/shared/lib/privateAccess";
import { accountForSession, SESSION_COOKIE } from "@/shared/lib/localAuth/session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (/^\/(?:home|blog|pricing|markdown|demo)(?:\/|$)/.test(path) ||
      path === "/agent/setup/preview" || path.startsWith("/post/linkedin/")) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (/^\/(?:login|signup|callback|forgot-password|reset-password)(?:\/|$)/.test(path) ||
      path.startsWith("/api/auth/") || path === "/logout/complete") return NextResponse.next();
  const account = accountForSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!account) {
    const login = new URL("/login", request.url);
    login.searchParams.set("returnTo", path);
    return NextResponse.redirect(login);
  }
  if (!isPrivateUser(account.email, process.env.PRIVATE_ALLOWED_EMAILS)) {
    return new NextResponse("This application is private. Sign in with an authorized account.", { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
