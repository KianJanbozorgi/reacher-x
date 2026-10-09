import { authkit, handleAuthkitProxy } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { isPrivateUser } from "@/shared/lib/privateAccess";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (/^\/(?:home|blog|pricing|markdown|demo)(?:\/|$)/.test(path) ||
      path === "/agent/setup/preview" || path.startsWith("/post/linkedin/")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const { session, headers, authorizationUrl } = await authkit(request);
  if (/^\/(?:login|signup|callback|logout(?:\/complete)?)$/.test(path)) {
    return handleAuthkitProxy(request, headers);
  }
  if (!session.user && authorizationUrl) {
    return handleAuthkitProxy(request, headers, { redirect: authorizationUrl });
  }
  if (!isPrivateUser(session.user?.email, process.env.PRIVATE_ALLOWED_EMAILS)) {
    return new NextResponse("This application is private. Sign in with an authorized account.", { status: 403 });
  }
  const response = handleAuthkitProxy(request, headers);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
