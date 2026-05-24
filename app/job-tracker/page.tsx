import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookmarkPlus,
  CalendarDays,
  Chrome,
  ClipboardList,
  Clock3,
  Columns3,
  FileText,
  List,
  MessageSquareText,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { SiteHeaderActions } from "@/components/layout/site-header-actions";

export const metadata: Metadata = {
  title: "Job tracker",
  description:
    "Track applications in board, list, and calendar views with notes, interviews, contacts, deadlines, and saved job descriptions.",
};

const SCREENSHOTS = {
  board: "/marketing/screenshots/Version 0.1/Board View.png",
  list: "/marketing/screenshots/Version 0.1/List View.png",
  calendar: "/marketing/screenshots/Version 0.1/Calendar View.png",
  manualAdd: "/marketing/screenshots/Version 0.1/Add job manually.png",
  jobPage: "/marketing/screenshots/Version 0.1/Job Page.png",
  extension: "/marketing/screenshots/Version 0.1/Evaluate Job.png",
} as const;

const VIEW_MODES = [
  {
    icon: Columns3,
    title: "Board",
    body: "Move jobs through Saved, Applied, Interviewing, Offer, Rejected, and Withdrawn without losing context.",
    src: SCREENSHOTS.board,
    alt: "canvasjob tracker board view grouped by application status",
    aspect: "16/10",
  },
  {
    icon: List,
    title: "List",
    body: "Scan every role in a compact table, filter by status, search by title, company, or location, and update status inline.",
    src: SCREENSHOTS.list,
    alt: "canvasjob tracker list view with status filters and search",
    aspect: "16/10",
    imageClassName: "object-contain",
    objectPosition: "center",
  },
  {
    icon: CalendarDays,
    title: "Calendar",
    body: "See applied dates, deadlines, and interview rounds in one month view so follow-ups do not slip past you.",
    src: SCREENSHOTS.calendar,
    alt: "canvasjob tracker calendar view with application deadlines and interviews",
    aspect: "16/10",
  },
] as const;

const JOB_PAGE_FEATURES = [
  {
    icon: MessageSquareText,
    title: "Notes",
    body: "Keep recruiter context, prep thoughts, and next steps attached to the role.",
  },
  {
    icon: CalendarDays,
    title: "Deadlines",
    body: "Store application deadlines and applied dates alongside the current stage.",
  },
  {
    icon: Clock3,
    title: "Interview schedule",
    body: "Add rounds with times, links, contacts, and prep notes.",
  },
  {
    icon: Users,
    title: "Contacts",
    body: "Track the recruiter, hiring manager, or anyone else you speak with.",
  },
  {
    icon: ClipboardList,
    title: "Timeline",
    body: "See when the job was tracked, updated, and moved through stages.",
  },
  {
    icon: FileText,
    title: "Original description",
    body: "Keep the listing text available after the job board changes or removes it.",
  },
] as const;

function ScreenshotFrame({
  src,
  alt,
  aspect,
  className = "",
  imageClassName = "object-cover",
  objectPosition = "center top",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  aspect: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-white shadow-sm ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={imageClassName}
        style={{ objectPosition }}
        priority={priority}
      />
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
      {children}
    </p>
  );
}

export default function JobTrackerPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CanvasjobLogo markClassName="h-7 w-7" />
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <Link
              href="/#how-it-works"
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
            >
              AI filter
            </Link>
            <Link
              href="/pricing"
              className="hidden text-muted-foreground hover:text-foreground sm:inline"
            >
              Pricing
            </Link>
            <SiteHeaderActions signupLabel="Get started" />
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <SectionEyebrow>Job tracker</SectionEyebrow>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Keep every promising role moving.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground">
                The filter helps you decide what is worth attention. The tracker keeps
                the rest organized: saved jobs, applications, interviews, deadlines,
                notes, contacts, and the original description.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/signup">
                    <Chrome className="h-4 w-4" />
                    Start tracking jobs
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/pricing">
                    See pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-5xl">
              <ScreenshotFrame
                src={SCREENSHOTS.board}
                alt="canvasjob tracker board view with jobs grouped by application status"
                aspect="16/10"
                sizes="(min-width: 1024px) 960px, 100vw"
                priority
              />
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <SectionEyebrow>Views</SectionEyebrow>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Board, list, and calendar. Same jobs, different lens.
                </h2>
              </div>
              <p className="text-muted-foreground">
                Use the board when you are moving work forward, the list when you need
                fast scanning, and the calendar when deadlines and interviews matter
                most.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {VIEW_MODES.map((view) => (
                <div key={view.title} className="flex flex-col gap-4">
                  <ScreenshotFrame
                    src={view.src}
                    alt={view.alt}
                    aspect={view.aspect}
                    imageClassName={
                      "imageClassName" in view ? view.imageClassName : undefined
                    }
                    objectPosition={
                      "objectPosition" in view ? view.objectPosition : undefined
                    }
                    sizes="(min-width: 1024px) 32vw, 100vw"
                  />
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <view.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{view.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{view.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow>Add jobs</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Save from the extension, or add any role manually.
              </h2>
              <p className="mt-4 text-muted-foreground">
                LinkedIn roles can come straight from the side panel. Jobs from other
                boards, recruiter emails, or company career pages can be added with a
                short manual form.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                      <BookmarkPlus className="h-5 w-5" />
                    </span>
                    <h3 className="font-semibold">Track from the extension</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    After an evaluation, save the job with one click. The title,
                    company, location, URL, source, and description follow it into
                    the tracker.
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                      <Plus className="h-5 w-5" />
                    </span>
                    <h3 className="font-semibold">Add jobs manually</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Paste in a role from any source and keep it in the same workflow
                    as extension-tracked LinkedIn jobs.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[0.82fr_1.18fr]">
                <ScreenshotFrame
                  src={SCREENSHOTS.extension}
                  alt="canvasjob Chrome extension side panel with a Track this job button"
                  aspect="744/1110"
                  imageClassName="object-cover"
                  sizes="(min-width: 1024px) 30vw, 100vw"
                />
                <ScreenshotFrame
                  src={SCREENSHOTS.manualAdd}
                  alt="canvasjob manual add job form"
                  aspect="1024/1270"
                  imageClassName="object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <SectionEyebrow>Job page</SectionEyebrow>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  One page for the details that decide the next move.
                </h2>
              </div>
              <p className="text-muted-foreground">
                Every tracked job opens into a workspace for the full application
                context, from interview prep and contacts to the saved description.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <ScreenshotFrame
                src={SCREENSHOTS.jobPage}
                alt="canvasjob job detail page with notes, interview schedule, timeline, contacts, and job description"
                aspect="16/11"
                sizes="(min-width: 1024px) 58vw, 100vw"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {JOB_PAGE_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <feature.icon className="h-4 w-4" />
                      </span>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-emerald-950 text-emerald-50">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Turn promising jobs into a clean pipeline.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-emerald-100/80">
              Start with the Chrome extension, save the roles worth pursuing, and
              manage every next step in the canvasjob tracker.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-emerald-900 hover:bg-emerald-50 sm:w-auto"
              >
                <Link href="/signup">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-emerald-200/30 bg-transparent text-emerald-50 hover:bg-emerald-900 hover:text-emerald-50 sm:w-auto"
              >
                <Link href="/">Back to overview</Link>
              </Button>
            </div>
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
            <Link href="/" className="hover:text-foreground">
              Overview
            </Link>
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
