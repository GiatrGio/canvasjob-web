import Link from "next/link";
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

function ScreenshotPlaceholder({
  label,
  aspect = "16/10",
  className = "",
}: {
  label: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span className="rounded-full bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Screenshot placeholder
        </span>
        <span className="max-w-md text-sm text-muted-foreground">{label}</span>
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
            <span className="inline-block h-6 w-6 rounded-md bg-emerald-700" aria-hidden />
            canvasjob
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link
              href="#how-it-works"
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
            >
              How it works
            </Link>
            <Link
              href="#compare"
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
            >
              Compare
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
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
                Free forever for 200 evaluations / month. No credit card.
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-5xl">
              <ScreenshotPlaceholder
                label="Hero shot — LinkedIn job page open with the canvasjob side panel docked on the right, showing a checklist of filter results (✅ Fully remote, ❌ Salary below €6k, ❓ Visa sponsorship not mentioned) and the 'Track this job' button."
                aspect="16/9"
              />
            </div>

            {/* Comparison strip */}
            <div className="mx-auto mt-12 max-w-4xl">
              <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
                Job-search tools you&apos;ve seen — at a glance
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                {[
                  { name: "Teal", price: "$29/mo" },
                  { name: "Huntr", price: "$40/mo" },
                  { name: "Simplify", price: "$40/mo" },
                  { name: "Jobscan", price: "$50/mo" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-baseline justify-center gap-2 rounded-md border bg-card px-3 py-2"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      {c.price}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-sm text-foreground">
                canvasjob is <span className="font-semibold">€7.99/month</span> — and the only tool that decides for you whether a job is even worth reading.
              </p>
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
              <ScreenshotPlaceholder
                label="Before/after split: a long LinkedIn job description on the left, the canvasjob side panel verdict on the right summarising the same job in three lines."
                aspect="4/3"
              />
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
                  shot: "Filter editor with three free-text filter rules and a profile dropdown.",
                },
                {
                  n: "02",
                  icon: Sparkles,
                  title: "Open any LinkedIn job",
                  body: "The side panel reads the description and returns a verdict per filter — pass, fail, or unknown — with the exact quote from the listing as evidence. Cached after the first read.",
                  shot: "Side panel showing checklist with evidence quotes expanded.",
                },
                {
                  n: "03",
                  icon: Briefcase,
                  title: "Track the ones that matter",
                  body: "One click saves the job to your tracker. Move it through Saved → Applied → Interviewing → Offer on the dashboard. Notes, applied date, and (soon) one-click CV tailoring per role.",
                  shot: "Tracker dashboard with kanban-style columns and one job card highlighted.",
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
                  <ScreenshotPlaceholder label={step.shot} aspect="4/3" />
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
                  <span>12 / 200 this month</span>
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
                A filter, a tracker, and a tailor.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to go from &ldquo;scrolling LinkedIn&rdquo; to
                &ldquo;sent the application.&rdquo;
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Filter,
                  title: "AI job filter",
                  body: "Free-text rules evaluated against the full description. ✅ pass, ❌ fail, or ❓ if the listing is silent — never a false negative.",
                  tag: "Headline feature",
                },
                {
                  icon: Briefcase,
                  title: "Application tracker",
                  body: "One-click save from the side panel. Status board on the website. Notes, applied date, and a clean source-agnostic schema for jobs from anywhere.",
                  tag: "Included free",
                },
                {
                  icon: Sparkles,
                  title: "CV tailoring",
                  body: "Upload your base CV once. Open any tracked job, click Tailor, get a version rewritten for that role's keywords and requirements. Pro plan.",
                  tag: "Coming soon",
                },
              ].map((f) => (
                <Card key={f.title}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50">
                        <f.icon className="h-5 w-5 text-emerald-700" />
                      </span>
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section id="compare" className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                How we compare
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Cheaper than every alternative — and we read the job for you.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Other tools focus on autofill, resume tailoring, and kanban boards.
                Nobody else tells you whether a job is even worth opening.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto rounded-xl border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-5 py-3 font-semibold">&nbsp;</th>
                    <th className="px-5 py-3 font-semibold text-emerald-800">
                      canvasjob
                    </th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Teal</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">
                      Huntr
                    </th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">
                      Simplify
                    </th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">
                      Jobscan
                    </th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)]:border-b">
                  <tr>
                    <td className="px-5 py-3 font-medium">Paid plan</td>
                    <td className="px-5 py-3 font-semibold text-emerald-800">€7.99/mo</td>
                    <td className="px-5 py-3 text-muted-foreground">$29/mo</td>
                    <td className="px-5 py-3 text-muted-foreground">$40/mo</td>
                    <td className="px-5 py-3 text-muted-foreground">$40/mo</td>
                    <td className="px-5 py-3 text-muted-foreground">$50/mo</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">
                      AI verdict on each job (✅/❌/❓)
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Free-text custom filters</td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Application tracker</td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">CV tailoring</td>
                    <td className="px-5 py-3 text-muted-foreground">Coming soon</td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                    <td className="px-5 py-3">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Free tier</td>
                    <td className="px-5 py-3 text-emerald-800">200 evals/mo</td>
                    <td className="px-5 py-3 text-muted-foreground">Tracking only</td>
                    <td className="px-5 py-3 text-muted-foreground">~40–100 jobs</td>
                    <td className="px-5 py-3 text-muted-foreground">Autofill only</td>
                    <td className="px-5 py-3 text-muted-foreground">5 scans/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Competitor pricing as of April 2026. Sources: Teal, Huntr, Simplify,
              Jobscan public pricing pages.
            </p>
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
                  a: "Job descriptions you evaluate are sent to the LLM but not stored. Descriptions are only saved when you explicitly Track a job — needed later for CV tailoring.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. Pro is monthly, no commitment. Your tracker and filters stay; you just drop back to the free 200 evaluations / month.",
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
              200 free evaluations every month. No credit card required.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-md bg-emerald-700" aria-hidden />
            <span className="font-semibold text-foreground">canvasjob</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
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
