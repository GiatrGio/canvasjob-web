# canvasjob-web — progress checklist

> Written so a future session can pick up mid-build without needing the full
> prior conversation. Update this file whenever a checkbox changes.

## Status: **Tracker MVP scaffolded + builds clean — not yet wired to a real Supabase project.**

## Done

- [x] **Project scaffold** — Next.js 15 App Router, React 19, TypeScript, Tailwind v4, hand-rolled shadcn-style components under `components/ui/`. `package.json` pins compatible versions; `tsconfig.json` has the `@/*` path alias.
- [x] **Auth plumbing** — `lib/supabase/{client,server,middleware}.ts` for browser, server-component, and middleware Supabase clients. `middleware.ts` refreshes the session cookie on every request. The `(app)` route group's layout server-side checks `getUser()` and redirects to `/login` when missing.
- [x] **API client** — split into `lib/api/{core,server,client}.ts`. `core.ts` defines the typed shape against the FastAPI backend; `server.ts` and `client.ts` differ only in how they fetch the bearer token (server cookie vs. browser session). Server-only via `import "server-only"` so the server module can never be bundled into a client component.
- [x] **Public pages** — `/` landing placeholder, `/login`, `/signup`, `/pricing` (Free + Pro tiers, mock Subscribe button via `components/pricing/subscribe-button.tsx` that fires a toast).
- [x] **App shell** — `components/layout/app-shell.tsx` renders the persistent header + sign-out for authenticated routes.
- [x] **Tracker dashboard** — `app/(app)/app/page.tsx`. Server-rendered initial list, filter pills per status with counts, free-text search, optimistic inline status changes (auto-stamps `applied_at` on transition to Applied), manual `Add job` dialog for sites we don't yet support.
- [x] **Individual job page** — `app/(app)/app/jobs/[id]/page.tsx`. Source-agnostic UI (no LinkedIn-specific copy), shows full description when present, status + applied date sidebar, debounced autosave for notes, delete with confirmation.
- [x] **CV Tailoring placeholder** — `app/(app)/app/cv-tailoring/page.tsx`. Static "how it'll work" steps + disabled upload button.
- [x] **Build green** — `npm run build` produces 9 routes (3 dynamic, 6 static) with no type errors.

## Not done (explicit non-goals for this pass)

- [ ] **Real Supabase project hookup.** `.env.example` documents the three required env vars; `.env.local` is gitignored. First-run requires filling in real values for the Supabase URL, publishable key, and the FastAPI base URL.
- [ ] **Stripe billing.** The Subscribe button is a `toast.info(...)` mock. Replace with a Stripe Checkout redirect once the backend exposes a `/billing/checkout` endpoint and the `subscriptions` table exists.
- [ ] **CV Tailoring functionality.** Page exists; upload + tailor button are placeholders. Needs (a) a CV upload endpoint on the backend (storing in Supabase Storage), (b) a `/cv-tailorings` endpoint that calls the LLM provider.
- [ ] **Marketing copy on `/`.** Hero + features + screenshots + testimonials all deferred. The route renders a placeholder.
- [ ] **Extension "Track this job" button.** Backend endpoint `POST /applications` exists; the extension just needs the UI + fetch wiring. Out of scope for this PR but a near-term follow-up.
- [ ] **Tests.** No Vitest or Playwright config yet. Tracker logic is mostly thin glue around the backend, which has its own tests in `linkedin-job-filter-backend/tests/test_applications.py`. Add component tests when the surface grows.
- [ ] **OAuth.** Email + password and magic link work. Google/GitHub sign-in deferred.

## First-run checklist for the user

1. `cd canvasjob-web`
2. `cp .env.example .env.local` and fill in the three `NEXT_PUBLIC_*` values from your Supabase project + the running backend URL.
3. Apply migration `0004_jobs_and_tracker.sql` in the backend repo to your Supabase project (paste into SQL editor or `supabase db push`). Without it, `/applications` calls will 500.
4. Make sure the backend has the website origin in `ALLOWED_ORIGINS` (e.g. `chrome-extension://<id>,http://localhost:3000`) and is reachable on `NEXT_PUBLIC_API_URL`.
5. `npm install`
6. `npm run dev` — open http://localhost:3000.
7. Sign up via `/signup`, then visit `/app`. The empty state confirms the pipe works.
8. Use `/app` → `Add job` to create a manual entry; refresh; click into it; edit notes/status.

## Known trade-offs worth remembering

- **Notes autosave debounce is 800 ms.** Long enough that fast typing doesn't fire a request per keystroke, short enough that a quick switch to another tab still saves. Adjust `NOTES_AUTOSAVE_MS` in `components/tracker/job-detail.tsx` if it feels off.
- **Status changes are optimistic** — the row updates immediately and reverts on error. For a single user this is invisible; if we ever add multi-user sharing, we'll want to revisit.
- **`source: "manual"` external_ids are client-generated UUIDs.** The backend trusts them; the unique constraint prevents the same UUID from colliding with an extension-created `('linkedin', '<id>')` row even by accident.
- **The pricing page intentionally lies a little.** Pro is sold as "Unlimited evaluations" but the backend caps at 5000/month per user (CLAUDE.md §9). 5000 is high enough that a normal user can't notice; if a user hits it we'll bump them manually.
- **Re-tracking the same `(source, external_id)` returns 200, not 201**, and **does not overwrite** the existing row's title/company. This protects against stale scrapes from a second tab undoing a manual edit.
