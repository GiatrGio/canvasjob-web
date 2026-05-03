"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SubscribeButton() {
  const router = useRouter();
  const [plan, setPlan] = useState<"free" | "pro" | "signed-out" | "loading">("loading");
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
      try {
        const me = await api.me();
        if (alive) setPlan(me.plan === "pro" ? "pro" : "free");
      } catch {
        if (alive) setPlan("free");
      }
    }
    void loadPlan();
    return () => {
      alive = false;
    };
  }, []);

  async function startCheckout() {
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
      disabled={busy || plan === "loading"}
    >
      {busy ? "Opening Checkout…" : "Subscribe — €7.99 / month"}
    </Button>
  );
}
