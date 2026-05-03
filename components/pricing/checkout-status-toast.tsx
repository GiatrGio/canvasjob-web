"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CheckoutStatusToast() {
  const router = useRouter();

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      toast.success("Payment received. Your Pro plan will appear as soon as Stripe confirms it.");
      router.replace("/pricing");
    } else if (checkout === "cancelled") {
      toast.info("Checkout cancelled.");
      router.replace("/pricing");
    }
  }, [router]);

  return null;
}
