"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Mock Subscribe button. Replace with a Stripe Checkout redirect once billing
 * is wired (see CLAUDE.md §9). The mock click is intentionally observable —
 * a toast — so visitors see something happen and we can tell from analytics
 * how often the button is clicked before launch.
 */
export function SubscribeButton() {
  return (
    <Button
      className="w-full"
      onClick={() => {
        toast.info("Stripe billing isn't live yet — we'll email you when it is.");
      }}
    >
      Subscribe — €5 / month
    </Button>
  );
}
