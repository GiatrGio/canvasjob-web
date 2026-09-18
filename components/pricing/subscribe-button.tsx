"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { normalizePlan, type Plan } from "@/lib/plan";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics";

export function SubscribeButton() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | "signed-out" | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadPlan() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session) {
        setPlan("signed-out");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .maybeSingle();
      if (alive) setPlan(normalizePlan(profile?.plan));
    }
    void loadPlan();
    return () => {
      alive = false;
    };
  }, []);

  async function startCheckout() {
    trackAnalyticsEvent("begin_checkout", {
      currency: "EUR",
      value: 4.99,
      plan: "pro",
      account_state: plan === "signed-out" ? "signed_out" : "signed_in",
    });
    if (plan === "signed-out") {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    setBusy(true);
    try {
      const session = await api.billing.createCheckoutSession();
      window.location.href = session.url;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not start Stripe Checkout.";
      toast.error(message);
      setBusy(false);
    }
  }

  async function manageBilling() {
    trackAnalyticsEvent("billing_portal_opened", { plan: "pro" });
    setBusy(true);
    try {
      const session = await api.billing.createPortalSession();
      window.location.href = session.url;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not open Stripe billing.";
      toast.error(message);
      setBusy(false);
    }
  }

  if (plan === "pro") {
    return (
      <Button className="w-full" onClick={manageBilling} disabled={busy}>
        {busy ? "Opening billing…" : "Manage billing"}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      onClick={startCheckout}
      disabled
    >
      Coming soon...
    </Button>
  );
}
