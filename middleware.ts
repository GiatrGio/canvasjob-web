import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (isAdminRoute(request.nextUrl.pathname) && !isLocalhost(getRequestHostname(request))) {
    return new NextResponse(null, { status: 404 });
  }

  return updateSession(request);
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isLocalhost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getRequestHostname(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;

  if (host.startsWith("[")) {
    const closingBracketIndex = host.indexOf("]");
    return closingBracketIndex === -1 ? host : host.slice(1, closingBracketIndex);
  }

  return host.split(":")[0] ?? host;
}

export const config = {
  matcher: [
    // Run on every request except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
