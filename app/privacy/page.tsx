import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How canvasjob collects, uses, stores, and shares data in its Chrome extension and web application.",
};

const LAST_UPDATED = "June 28, 2026";

const serviceProviders = [
  {
    name: "Supabase",
    data: "Account, authentication, profile, filter, application, evaluation, usage, and subscription records",
    purpose: "Authentication and application database infrastructure",
  },
  {
    name: "Anthropic or OpenAI",
    data: "Job description content and relevant filter text; filter text when filter validation is requested; your CV's text when you upload one (to extract a non-identifying professional profile and, if you use cover letters, your contact details for pre-fill); your CV profile and the job description when scoring how well you match a job; extraction diagnostics, including a sanitized job-posting snapshot with your identity excluded, when the extension cannot read a job page; and, when you generate a cover letter, the job description, your CV profile, and your writing instructions",
    purpose: "Generate AI evaluation, filter-validation, job-fit, and cover-letter results, and analyze extraction failures, through the active provider",
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

            <Definition title="CV and job-fit information">
              If you upload a CV for the job-fit feature, the backend sends its text to
              the configured AI provider, Anthropic or OpenAI, to extract a
              non-identifying professional profile — skills, years of experience,
              seniority, generic role titles, domains, education level, languages, and a
              short summary. We store only that profile. The uploaded file and its raw
              text are processed in memory and are not stored, and the profile
              deliberately excludes your name, contact details, and the names of specific
              employers or schools. When you open a job, your profile and the job
              description are sent to the provider to produce a match score with strengths
              and gaps, which we cache to avoid repeat AI calls. You can view, edit, or
              delete the profile at any time. If you also use the cover-letter feature,
              your CV&apos;s contact details may be read once to pre-fill the cover-letter
              fields you have left blank.
            </Definition>

            <Definition title="Diagnostic AI call records">
              To operate and troubleshoot the AI features, restricted backend diagnostic
              records may include the AI prompt and output, which can contain job
              descriptions, your filter text, your non-identifying CV profile, and your
              cover-letter instructions — your raw CV text and contact details are
              redacted — along with provider, model, cost, duration, status, and
              timestamp information.
            </Definition>

            <Definition title="Extraction diagnostics">
              Supported job pages change their layout frequently, which can stop the
              extension from reading a listing. When that happens, the extension
              automatically sends a diagnostic report so we can detect and fix the
              breakage quickly. The report contains technical telemetry — which page
              elements the extension could and could not read, the extractor version, the
              page address and title, and your browser&apos;s user-agent — together with a
              sanitized snapshot of the job-posting section of the page. That snapshot
              keeps the page structure and the listing&apos;s own text (the same kind of
              public job content already used to generate evaluations) so we can locate
              where the information moved, but it is processed on your device to exclude
              LinkedIn&apos;s navigation, feed, and messaging areas and to remove images
              and personal details — including your own name and profile, and any email
              addresses or phone numbers — before it is sent. At most one report is sent
              per browsing session. The backend analyzes the report with the active AI
              provider and stores the result in restricted diagnostic records for
              troubleshooting.
            </Definition>

            <Definition title="Tracked applications and information you add">
              When you click <span className="text-foreground">Track this job</span> or
              add a job manually, we store the job title, company, location, URL,
              source, original description, application status, dates and deadlines,
              notes, contact details you enter, and interview schedule details. This
              information powers your tracker, calendar, and job-detail views.
            </Definition>

            <Definition title="Cover-letter details and generated letters">
              If you use the cover-letter feature, we store the details you provide for it
              — your name, contact details, location, and your default writing instructions
              (which may include achievements you want emphasized) — so we can produce a
              complete, ready-to-send letter with your header and signature. To save you
              typing, when you upload a CV we may read its contact details to pre-fill any
              of these fields you have left blank. When you generate a letter, your job
              description, your stored CV profile, and your instructions are sent to the
              configured AI provider, Anthropic or OpenAI, to write it. The generated
              letter is returned to your browser for download and is not stored on
              canvasjob servers.
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
            <p>
              If a supported job page changes in a way that prevents the extension from
              reading it, the extension automatically sends us a diagnostic report so we
              can fix the breakage quickly. As described under{" "}
              <span className="text-foreground">Extraction diagnostics</span> above, that
              report contains technical telemetry plus a sanitized snapshot of the
              job-posting section — processed on your device to exclude LinkedIn&apos;s
              navigation, feed, and messaging, and to remove images and personal details
              such as your name, profile, and any emails or phone numbers — and is limited
              to at most one report per browsing session.
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
              interview records attached to that job. Your uploaded CV&apos;s
              professional profile and the job-fit results derived from it are kept until
              you delete your CV — which removes both — or your account. Cover-letter
              details you save are kept until you change or remove them; generated cover
              letters are not retained by canvasjob.
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
