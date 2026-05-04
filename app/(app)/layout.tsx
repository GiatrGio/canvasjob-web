import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePlan } from "@/lib/plan";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Auth guard for /app/*. Server-side check via supabase-ssr — if there's no
 * session, redirect to /login before rendering anything. The client-side
 * shell shows the persistent navigation.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = normalizePlan(profile?.plan);

  return (
    <AppShell userEmail={user.email ?? ""} plan={plan}>
      {children}
    </AppShell>
  );
}
