import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "@/components/pricing/subscribe-button";

const FREE_FEATURES = [
  "200 job evaluations / month",
  "Unlimited filter profiles",
  "Application tracker",
  "Chrome extension on supported sites",
];

const PRO_FEATURES = [
  "Unlimited job evaluations",
  "Unlimited filter profiles",
  "Application tracker",
  "20 CV Tailorings / month",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-semibold">
            canvasjob
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when the tracker and CV tailoring earn their keep.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Everything you need to try canvasjob.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
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

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro</CardTitle>
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              </div>
              <CardDescription>For active job hunters.</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">€5</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
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
          Stripe billing isn&apos;t live yet — Subscribe shows a confirmation but
          doesn&apos;t charge. We&apos;ll email you before turning it on.
        </p>
      </main>
    </div>
  );
}
