import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminPanel } from "@/components/admin/admin-panel";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fadmin");
  }

  const requestHeaders = await headers();
  const hostname = getHostname(requestHeaders.get("host") ?? "");

  if (!isLocalhost(hostname) && (!user.email || !getAdminEmails().has(user.email.toLowerCase()))) {
    notFound();
  }

  return <AdminPanel />;
}

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isLocalhost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function getHostname(host: string) {
  if (host.startsWith("[")) {
    const closingBracketIndex = host.indexOf("]");
    return closingBracketIndex === -1 ? host : host.slice(1, closingBracketIndex);
  }

  return host.split(":")[0] ?? host;
}
