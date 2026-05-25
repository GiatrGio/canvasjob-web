import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How canvasjob collects, uses, stores, and shares data in its Chrome extension and web application.",
};

const LAST_UPDATED = "May 25, 2026";

const serviceProviders = [
  {
    name: "Supabase",
    data: "Account, authentication, profile, filter, application, evaluation, usage, and subscription records",
    purpose: "Authentication and application database infrastructure",
  },
  {
    name: "Anthropic or OpenAI",
    data: "Job description content and relevant filter text; filter text when filter validation is requested",
    purpose: "Generate AI evaluation and filter-validation results through the active provider",
  },
  {
    name: "Stripe",
    data: "Email, customer identifier, subscription status, and billing information you provide to Stripe",
    purpose: "Checkout, subscription management, invoices, and payment processing for Pro accounts",
  },
  {
    name: "Vercel and Fly.io",
    data: "Requests to the website or API and ordinary technical connection information",
    purpose: "Host and deliver the website and backend service",
  },
  {
    name: "Google",
    data: "Authentication information when you choose Continue with Google",
    purpose: "Provide the optional Google sign-in flow",
  },
] as const;

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t pt-9">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function Definition({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1">{children}</p>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CanvasjobLogo markClassName="h-7 w-7" />
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/job-tracker" className="hidden hover:text-foreground sm:inline">
              Job tracker
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[220px_minmax(0,720px)] lg:py-16">
        <aside className="hidden lg:block">
          <nav className="sticky top-10 space-y-3 text-sm text-muted-foreground">
            <p className="pb-2 font-medium text-foreground">On this page</p>
            <a href="#scope" className="block hover:text-foreground">
              Scope
            </a>
            <a href="#information" className="block hover:text-foreground">
              Information we handle
            </a>
            <a href="#extension" className="block hover:text-foreground">
              Chrome extension
            </a>
            <a href="#sharing" className="block hover:text-foreground">
              Sharing and processors
            </a>
            <a href="#retention" className="block hover:text-foreground">
              Retention and controls
            </a>
            <a href="#limited-use" className="block hover:text-foreground">
              Limited Use
            </a>
            <a href="#contact" className="block hover:text-foreground">
              Contact
            </a>
          </nav>
        </aside>

        <article className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-7 text-base leading-8 text-muted-foreground">
            canvasjob helps users evaluate job postings against their preferences and
            keep track of applications. This policy explains how the canvasjob website
            and Chrome extension handle information.
          </p>

          <PolicySection id="scope" title="1. Scope and contact">
            <p>
              This Privacy Policy applies to the canvasjob Chrome extension and the
              web application available at{" "}
              <a
                href="https://www.canvasjob.com"
                className="font-medium text-foreground underline underline-offset-4"
              >
                https://www.canvasjob.com
              </a>
              .
            </p>
            <p>
              For privacy requests or questions, contact{" "}
              <a
                href="mailto:canvasjob@gmail.com"
                className="font-medium text-foreground underline underline-offset-4"
              >
                canvasjob@gmail.com
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection id="information" title="2. Information we handle and why">
            <Definition title="Account and authentication information">
              We process your email address, account identifier, login method, and
              authentication session information so you can create an account, sign in,
              and securely access your data. Authentication is provided through
              Supabase. If you choose Google sign-in, Google participates in that
              sign-in flow.
            </Definition>

            <Definition title="Filter profiles and preferences">
              We store the profile names and free-text job criteria you create, their
              order, active status, and enabled state so canvasjob can apply your chosen
              criteria to job postings.
            </Definition>

            <Definition title="Job evaluation information">
              When the extension evaluates a supported job page, it processes the job
              source and identifier, title, company, location, URL, description, your
              applicable filter criteria, and the generated results. The backend sends
              the job description and criteria to the configured AI provider, Anthropic
              or OpenAI, to produce the verdicts and evidence shown in the side panel.
              We store evaluation results, job metadata, usage counts, and caching
              information to operate the feature and avoid unnecessary repeat AI calls.
            </Definition>

            <Definition title="Diagnostic AI call records">
              To operate and troubleshoot the AI feature, restricted backend diagnostic
              records may include the AI prompt and output, which can contain job
              descriptions and your filter text, along with provider, model, cost,
              duration, status, and timestamp information.
            </Definition>

            <Definition title="Tracked applications and information you add">
              When you click <span className="text-foreground">Track this job</span> or
              add a job manually, we store the job title, company, location, URL,
              source, original description, application status, dates and deadlines,
              notes, contact details you enter, and interview schedule details. This
              information powers your tracker, calendar, and job-detail views.
            </Definition>

            <Definition title="Plan, usage, and billing information">
              We store your plan, monthly usage totals, and subscription status to apply
              account limits and provide Pro access. If you choose a paid subscription,
              Stripe processes payment and billing details; canvasjob stores associated
              Stripe customer and subscription identifiers and billing status.
            </Definition>

            <Definition title="Technical information">
              The website and API hosting providers may process standard technical
              information associated with requests, such as IP address, browser or
              device information, request time, and diagnostic logs, in order to
              provide, protect, and troubleshoot the service.
            </Definition>
          </PolicySection>

          <PolicySection id="extension" title="3. Chrome extension disclosures">
            <p>
              The Chrome extension runs on supported LinkedIn job pages at{" "}
              <span className="text-foreground">https://www.linkedin.com/jobs/*</span>.
              It reads the visible job-listing information needed for its user-facing
              job evaluation and tracking features. canvasjob does not use that access
              to build a general browsing-history profile or to serve advertisements.
            </p>
            <p>
              The extension uses Chrome local storage to keep your authentication
              session, onboarding preferences, and the most recent evaluation shown in
              the side panel. That most recent local evaluation can include the scraped
              job information and its results. Local extension data remains in your
              browser until it is replaced, cleared, or the extension is removed.
            </p>
          </PolicySection>

          <PolicySection id="sharing" title="4. Service providers and sharing">
            <p>
              We disclose information to the following service providers only as needed
              to provide, secure, support, and bill for canvasjob:
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-[640px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Information involved</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceProviders.map((provider) => (
                    <tr key={provider.name} className="border-b last:border-b-0">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                        {provider.name}
                      </td>
                      <td className="px-4 py-3 align-top">{provider.data}</td>
                      <td className="px-4 py-3 align-top">{provider.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              We may also disclose information when required by law, to protect the
              security and integrity of canvasjob or its users, or in connection with a
              merger, acquisition, financing, or sale of assets subject to appropriate
              protections.
            </p>
            <p>
              We do not sell your personal information. We do not use or transfer your
              job, filter, or application information for personalized advertising,
              retargeting, creditworthiness, or lending purposes.
            </p>
          </PolicySection>

          <PolicySection id="retention" title="5. Retention, deletion, and security">
            <p>
              Your account, saved filters, tracker data, and related application
              records are kept while your account is active or until you remove them.
              You can delete tracked jobs, contacts, and interview records from the web
              application. Deleting a tracked job also removes the contacts and
              interview records attached to that job.
            </p>
            <p>
              Evaluation cache records and diagnostic AI call records are retained on
              canvasjob systems until they are deleted administratively or as part of
              account deletion. Stripe and other service providers may retain records
              under their own legal and operational retention obligations.
            </p>
            <p>
              You may request access, correction, or deletion of your account and
              associated data by emailing{" "}
              <a
                href="mailto:canvasjob@gmail.com"
                className="font-medium text-foreground underline underline-offset-4"
              >
                canvasjob@gmail.com
              </a>
              .
            </p>
            <p>
              canvasjob uses HTTPS in transit, authenticated access to account
              features, and database access controls intended to limit each user to
              their own application data. No internet service can guarantee absolute
              security.
            </p>
          </PolicySection>

          <PolicySection id="limited-use" title="6. Chrome Web Store Limited Use disclosure">
            <p className="font-medium text-foreground">
              The use of information received from Google APIs will adhere to the
              Chrome Web Store User Data Policy, including the Limited Use requirements.
            </p>
            <p>
              Data collected through the extension is used only to provide or improve
              its user-facing job evaluation, filter-management, account, and
              application-tracking functions. Human access to user data is limited to
              cases where you give consent for support, where access is necessary for
              security or abuse investigation, where required by law, or where data has
              been aggregated and anonymized for internal operations.
            </p>
          </PolicySection>

          <PolicySection id="children" title="7. Children">
            <p>
              canvasjob is a job-search productivity service and is not directed to
              children under 13. We do not knowingly collect personal information from
              children under 13.
            </p>
          </PolicySection>

          <PolicySection id="updates" title="8. Changes to this policy">
            <p>
              We may update this Privacy Policy as canvasjob evolves. We will post the
              updated version on this page and change the last updated date above. If
              a change materially affects how user information is handled, we will
              provide additional notice where appropriate.
            </p>
          </PolicySection>

          <PolicySection id="contact" title="9. Contact">
            <p>
              Questions or privacy requests can be sent to{" "}
              <a
                href="mailto:canvasjob@gmail.com"
                className="font-medium text-foreground underline underline-offset-4"
              >
                canvasjob@gmail.com
              </a>
              .
            </p>
          </PolicySection>
        </article>
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <CanvasjobLogo markClassName="h-6 w-6" />
          <nav className="flex items-center gap-5">
            <Link href="/" className="hover:text-foreground">
              Overview
            </Link>
            <Link href="/job-tracker" className="hover:text-foreground">
              Job tracker
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
