import { NextResponse } from "next/server";
import { safeInternalPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type HandoffExchange = {
  user_id: string;
  destination: string;
  token_hash: string | null;
};

function getBrowserOrigin(request: Request, url: URL) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return url.origin;
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

function privateRedirect(url: string | URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

function errorRedirect(origin: string, reason: "expired" | "failed") {
  return privateRedirect(`${origin}/auth/extension/error?reason=${reason}`);
}

function isPlausibleTicket(ticket: string | null): ticket is string {
  return Boolean(ticket && ticket.length >= 32 && ticket.length <= 256 && /^[A-Za-z0-9_-]+$/.test(ticket));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getBrowserOrigin(request, url);
  const ticket = url.searchParams.get("ticket");
  const switchAccount = url.searchParams.get("switch") === "1";
  if (!isPlausibleTicket(ticket)) {
    return errorRedirect(origin, "expired");
  }

  const supabase = await createClient();
  const {
    data: { user: websiteUser },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers({ "Content-Type": "application/json" });
  // On the first attempt, a verified website bearer lets the backend avoid
  // minting another session when both apps already use the same account. When
  // the user explicitly chooses the extension account, omit it intentionally.
  if (!switchAccount && websiteUser && session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  let exchangeResponse: Response;
  try {
    exchangeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/web-handoffs/exchange`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ ticket }),
        cache: "no-store",
      },
    );
  } catch {
    return errorRedirect(origin, "failed");
  }

  if (exchangeResponse.status === 409 && !switchAccount) {
    return privateRedirect(
      `${origin}/auth/extension/confirm?ticket=${encodeURIComponent(ticket)}`,
    );
  }
  if (!exchangeResponse.ok) {
    return errorRedirect(origin, exchangeResponse.status === 410 ? "expired" : "failed");
  }

  let exchange: HandoffExchange;
  try {
    exchange = (await exchangeResponse.json()) as HandoffExchange;
  } catch {
    return errorRedirect(origin, "failed");
  }

  if (exchange.token_hash) {
    if (switchAccount && websiteUser) {
      // Never revoke the other account's sessions globally. This removes only
      // this browser's website session before installing the extension account.
      await supabase.auth.signOut({ scope: "local" });
    }
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: exchange.token_hash,
      type: "email",
    });
    if (error || data.user?.id !== exchange.user_id) {
      return errorRedirect(origin, "failed");
    }
  } else if (!websiteUser || websiteUser.id !== exchange.user_id) {
    return errorRedirect(origin, "failed");
  }

  const destination = safeInternalPath(exchange.destination);
  return privateRedirect(`${origin}${destination}`);
}
