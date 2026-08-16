import { NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * The origin the browser actually used. `request.url` is not it: Next rewrites
 * the host to `localhost` in dev, so a browser on `http://127.0.0.1:PORT` gets
 * redirected to `http://localhost:PORT` — a different cookie origin, which
 * drops the session cookies this handler just set and bounces back to /login.
 */
function getBrowserOrigin(request: Request, url: URL) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return url.origin;
  }
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getBrowserOrigin(request, url);
  const code = url.searchParams.get("code");
  const redirectPath = safeInternalPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }

    console.error("[auth/callback] code exchange failed", error.message);
  }

  return NextResponse.redirect(`${origin}/login?auth_error=oauth`);
}
