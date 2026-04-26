import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Marketing landing — placeholder. Full content (hero, screenshots, FAQ,
 * testimonials) is deferred. This page must still ship a working header
 * with login/signup links and a pointer to the pricing page so clicks from
 * the extension's "Sign in" button land somewhere useful.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-semibold">
            canvasjob
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Filter, track, and tailor — all in one place.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            canvasjob evaluates every job posting you open against your custom criteria,
            tracks your applications across stages, and (soon) tailors your CV to each
            role with one click.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get started — free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-16 text-xs uppercase tracking-wider text-muted-foreground">
            Marketing content coming soon — this page is a placeholder.
          </p>
        </div>
      </main>
    </div>
  );
}
