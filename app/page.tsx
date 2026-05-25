import Link from "next/link";
import Image from "next/image";
import {
  Check,
  X,
  HelpCircle,
  Filter,
  Briefcase,
  Sparkles,
  Clock,
  ArrowRight,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";
import { HeroIllustration } from "@/components/marketing/hero-illustration";

const SCREENSHOTS = {
  extensionFilterEvaluation: "/marketing/screenshots/extension-filter-evaluation.png",
  settingsFilters: "/marketing/screenshots/settings-filters.png",
  websiteJobPage: "/marketing/screenshots/website-job-page.png",
  extensionRightPanel: "/marketing/screenshots/extension-right-panel.png",
  websiteBoard: "/marketing/screenshots/website-board-view.png",
} as const;

const FEATURE_CARDS = [
  {
    icon: Filter,
    title: "AI job filter",
    body: "Free-text rules evaluated against the full description. ✅ pass, ❌ fail, or ❓ if the listing is silent — never a false negative.",
    visible: true,
  },
  {
    icon: Briefcase,
    title: "Application tracker",
    body: "One-click save from the side panel. Status board on the website. Notes, applied date, and a clean source-agnostic schema for jobs from anywhere.",
    tag: "Included free",
  },
];

function ProductScreenshot({
  src,
  alt,
  aspect = "16/10",
  className = "",
  imageClassName = "object-cover",
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  aspect?: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border bg-white shadow-sm ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className={imageClassName}
        style={{ objectPosition }}
      />
    </div>
  );
}

function ProblemVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-xl">
        <div className="absolute inset-x-5 bottom-5 top-5 overflow-hidden rounded-xl border bg-white">
          <Image
            src={SCREENSHOTS.websiteJobPage}
            alt="A detailed job page with a long job description"
            fill
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="object-cover opacity-95"
            style={{ objectPosition: "18% 12%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/90" />
        </div>
        <div className="absolute -right-5 bottom-9 top-9 w-[52%] overflow-hidden rounded-xl border bg-white shadow-2xl">
          <Image
            src={SCREENSHOTS.extensionRightPanel}
            alt="canvasjob side panel showing filter verdicts with evidence"
            fill
            sizes="(min-width: 1024px) 24vw, 60vw"
            className="object-cover"
            style={{ objectPosition: "top center" }}
          />
        </div>
        <div className="absolute bottom-7 left-7 max-w-[58%] rounded-lg border bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <span className="font-semibold">From long description</span>
          <span className="mx-2 text-muted-foreground">to</span>
          <span className="font-semibold text-emerald-700">clear verdict</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CanvasjobLogo markClassName="h-7 w-7" />
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link
              href="#how-it-works"
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
            >
              How it works
            </Link>
            <Link
              href="/job-tracker"
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
            >
              Job Tracker
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <SiteHeaderActions signupLabel="Get started" />
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 via-background to-background"
            aria-hidden
          />
          <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Now in beta · Chrome extension for LinkedIn
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                Stop reading job descriptions
                <br />
                that don&apos;t match.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Define your hard requirements once. canvasjob reads every LinkedIn job
                you open and gives you a <span className="font-semibold text-foreground">✅ / ❌ / ❓ verdict in five seconds</span> — with the exact quote from the description.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/signup">
                    <Chrome className="h-4 w-4" />
                    Add to Chrome — free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="#how-it-works">
                    See how it works
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free forever for 50 evaluations / month. No credit card.
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-5xl">
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  The problem
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  &ldquo;Remote-friendly&rdquo; isn&apos;t actually remote.
                  <br />
                  &ldquo;Competitive salary&rdquo; means &euro;3,000.
                </h2>
                <p className="mt-5 text-base text-muted-foreground">
                  LinkedIn&apos;s built-in filters are coarse. Everything that actually
                  matters — minimum salary, hiring countries, contract type, tech
                  stack, in-office days — lives in the description. Reading sixty of
                  those a week to find the three you&apos;d apply to is exhausting.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
                    <span>
                      <strong>4+ hours/week</strong> spent reading jobs that fail your
                      filters in the first paragraph.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="mt-0.5 h-4 w-4 flex-none text-rose-600" />
                    <span>
                      &ldquo;Remote&rdquo; postings that quietly require relocation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="mt-0.5 h-4 w-4 flex-none text-rose-600" />
                    <span>
                      Salary ranges hidden three scrolls into the description — or
                      missing entirely.
                    </span>
                  </li>
                </ul>
              </div>
              <ProblemVisual />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps. No spreadsheet.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Set your filters once. Open jobs normally. Track the ones worth your
                time.
              </p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-3">
              {[
                {
                  n: "01",
                  icon: Filter,
                  title: "Write your filters in plain English",
                  body: '"Must be fully remote inside the EU." "Salary at least €6,000/month." "Open to candidates based in Greece." Group them into named profiles for different roles.',
                  shot: SCREENSHOTS.settingsFilters,
                  alt: "canvasjob settings page with job profiles and plain-English filters",
                  position: "center top",
                  imageClassName: "object-cover",
                },
                {
                  n: "02",
                  icon: Sparkles,
                  title: "Open any LinkedIn job",
                  body: "The side panel reads the description and returns a verdict per filter — pass, fail, or unknown — with the exact quote from the listing as evidence. Cached after the first read.",
                  shot: SCREENSHOTS.extensionRightPanel,
                  alt: "canvasjob Chrome extension side panel showing evaluation results",
                  position: "top center",
                  imageClassName: "object-contain p-4",
                },
                {
                  n: "03",
                  icon: Briefcase,
                  title: "Track the ones that matter",
                  body: "One click saves the job to your tracker. Move it through Saved → Applied → Interviewing → Offer on the dashboard. Keep notes, dates, contacts, and every promising role organized.",
                  shot: SCREENSHOTS.websiteBoard,
                  alt: "canvasjob tracker board with job cards grouped by status",
                  position: "center top",
                  imageClassName: "object-cover",
                },
              ].map((step) => (
                <div key={step.n} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {step.n}
                    </span>
                    <step.icon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                  <ProductScreenshot
                    src={step.shot}
                    alt={step.alt}
                    aspect="4/3"
                    imageClassName={step.imageClassName}
                    objectPosition={step.position}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VERDICT EXAMPLE */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                What you actually see
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Three icons. One quote each. Done.
              </h2>
            </div>

            <Card className="mx-auto mt-10 max-w-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-semibold">Senior Backend Engineer</p>
                    <p className="text-xs text-muted-foreground">
                      Acme Corp · Remote, EU
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    2 of 3 match
                  </span>
                </div>

                <ul className="divide-y">
                  <li className="flex items-start gap-3 py-4">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">Must be fully remote</p>
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        &ldquo;100% remote within the EU, no in-office days
                        required.&rdquo;
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 py-4">
                    <X className="mt-0.5 h-5 w-5 flex-none text-rose-600" />
                    <div>
                      <p className="text-sm font-medium">Salary ≥ €6,000 / month</p>
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        &ldquo;Compensation: €4,200–€5,400 / month depending on
                        experience.&rdquo;
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 py-4">
                    <HelpCircle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Open to candidates based in Greece
                      </p>
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        Not mentioned in the description.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-2 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                  <span>Evaluated in 4.2s · Cached</span>
                  <span>12 / 50 this month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                What&apos;s included
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                A filter and a tracker.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to go from &ldquo;scrolling LinkedIn&rdquo; to
                &ldquo;sent the application.&rdquo;
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {FEATURE_CARDS.map((f) => (
                <Card key={f.title}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50">
                        <f.icon className="h-5 w-5 text-emerald-700" />
                      </span>
                      {"tag" in f && f.tag ? (
                        <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {f.tag}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.body}</p>
                    {f.title === "Application tracker" ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/job-tracker">
                          Explore tracker
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Common questions
              </h2>
            </div>

            <div className="mt-12 space-y-6">
              {[
                {
                  q: "Which sites does it work on?",
                  a: "LinkedIn at launch. Indeed, Wellfound, and Otta are next. The tracker is source-agnostic from day one — you can add jobs from anywhere manually.",
                },
                {
                  q: "Do I need to bring my own AI key?",
                  a: "No. The subscription includes the LLM cost — you never see or manage an API key. We use Claude Haiku 4.5 for evaluation.",
                },
                {
                  q: "What happens if a description doesn't mention something?",
                  a: 'You get a ❓ "unknown" — never a false ❌. We only fail a filter when the description actually contradicts it.',
                },
                {
                  q: "Is my data stored?",
                  a: "Job descriptions you evaluate are sent to the AI provider and may appear in restricted diagnostic records used to operate the feature. When you Track a job, the description is also saved in your tracker so you can revisit the original listing.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. Pro is monthly, no commitment. Your tracker and filters stay; you just drop back to the free 50 evaluations / month.",
                },
              ].map((item) => (
                <div key={item.q} className="rounded-lg border bg-card p-5">
                  <h3 className="font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t bg-emerald-950 text-emerald-50">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Stop reading. Start filtering.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-100/80">
              Install the extension, write three filters, and let canvasjob tell you
              which of the next ten jobs are worth your time.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-emerald-900 hover:bg-emerald-50 sm:w-auto"
              >
                <Link href="/signup">
                  <Chrome className="h-4 w-4" />
                  Add to Chrome — free
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-emerald-200/30 bg-transparent text-emerald-50 hover:bg-emerald-900 hover:text-emerald-50 sm:w-auto"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-emerald-200/70">
              50 free evaluations every month. No credit card required.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <CanvasjobLogo markClassName="h-6 w-6" />
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/job-tracker" className="hover:text-foreground">
              Job tracker
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
