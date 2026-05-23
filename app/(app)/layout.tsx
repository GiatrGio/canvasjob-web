import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePlan } from "@/lib/plan";
import { FALLBACK_EVALUATION_LIMIT, FREE_TRACKED_JOB_LIMIT } from "@/lib/limits";
import { AppShell } from "@/components/layout/app-shell";
import type { AccountMenuMetrics } from "@/components/layout/account-menu";

function currentUsagePeriod() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

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

  const period = currentUsagePeriod();
  const [{ data: profile }, { data: usage }, { count: trackedJobCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, monthly_eval_limit")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("usage_counters")
      .select("evaluations_used")
      .eq("user_id", user.id)
      .eq("year_month", period)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  const plan = normalizePlan(profile?.plan);
  const evaluationLimit =
    typeof profile?.monthly_eval_limit === "number"
      ? profile.monthly_eval_limit
      : FALLBACK_EVALUATION_LIMIT;
  const metrics: AccountMenuMetrics = {
    evaluations: {
      used: Number(usage?.evaluations_used ?? 0),
      limit: evaluationLimit,
      period,
    },
    trackedJobs: {
      used: trackedJobCount ?? 0,
      limit: plan === "free" ? FREE_TRACKED_JOB_LIMIT : null,
    },
  };

  return (
    <AppShell userEmail={user.email ?? ""} plan={plan} metrics={metrics}>
      {children}
    </AppShell>
  );
}
