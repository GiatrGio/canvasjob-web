import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { SubscribeButton } from "@/components/pricing/subscribe-button";
import { CheckoutStatusToast } from "@/components/pricing/checkout-status-toast";

const FREE_FEATURES = [
  "50 job evaluations / month",
  "Up to 5 job profiles",
  "10 filters per profile",
  "Track up to 5 jobs at the same time",
  "Chrome extension on supported sites",
];

// Pro is marketed as unlimited for tracked jobs. The backend still keeps a
// high abuse ceiling so one account cannot create unbounded storage growth.
const PRO_FEATURES = [
  "Unlimited job evaluations",
  "Up to 5 job profiles",
  "10 filters per profile",
  "Unlimited tracked jobs",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <CheckoutStatusToast />
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CanvasjobLogo markClassName="h-7 w-7" />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <SiteHeaderActions />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when the tracker needs room to grow.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Everything you need to try canvasjob.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <ul className="flex-1 space-y-2 text-sm">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">Get started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro</CardTitle>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              </div>
              <CardDescription>For active job hunters.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">€4.99</span>
                <span className="text-muted-foreground"> / month</span>
                <p className="mt-1 text-xs text-muted-foreground">VAT included.</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <ul className="flex-1 space-y-2 text-sm">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <SubscribeButton />
            </CardContent>
          </Card>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Secure checkout and billing management are handled by Stripe.
          Cancelling keeps Pro active until the end of the paid period.
        </p>
      </main>
    </div>
  );
}
