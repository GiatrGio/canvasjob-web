import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normalizePlan } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/layout/plan-badge";

export async function SiteHeaderActions({ signupLabel = "Sign up" }: { signupLabel?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Button variant="ghost" asChild size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">{signupLabel}</Link>
        </Button>
      </>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = normalizePlan(profile?.plan);

  return (
    <>
      <PlanBadge plan={plan} href="/pricing" />
      <Button variant="outline" asChild size="sm">
        <Link href="/app">Open app</Link>
      </Button>
    </>
  );
}
