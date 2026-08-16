# canvasjob-web

Marketing site + authenticated dashboard for **canvasjob**. Talks to the FastAPI backend (`linkedin-job-filter-backend`) and Supabase auth.

> Read the project-wide [`CLAUDE.md`](../CLAUDE.md) first. This README only covers what's specific to the website.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript, Tailwind CSS v4, shadcn-style components (hand-rolled, no CLI)
- `@supabase/ssr` + `@supabase/supabase-js` — auth via cookies, JWT passed to the backend as a bearer token
- `sonner` for toasts, `date-fns` for formatting, `lucide-react` for icons
- Deployed to Vercel at `https://www.canvasjob.com`; single domain (`/` marketing, `/app/*` dashboard)

## Routes

| Path | Auth | What it is |
|---|---|---|
| `/` | public | Marketing landing — placeholder. Real copy + screenshots later. |
| `/login`, `/signup` | public | Email + password (or magic link). |
| `/pricing` | public | Free + Pro tiers. Pro uses Stripe Checkout and the Stripe Customer Portal. |
| `/app` | required | **Tracker dashboard** — list of every saved/applied job. |
| `/app/jobs/[id]` | required | Individual job detail — generic, source-agnostic. |
| `/auth/extension` | one-time ticket | Exchanges an extension handoff and installs/reuses the website cookie session. |
| `/auth/extension/confirm` | one-time ticket | Account choice when extension and website users differ. |

The `/app/*` group lives under `app/(app)/` and is gated by `app/(app)/layout.tsx`, which redirects to `/login` if there's no Supabase session.

## Setup

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
# NEXT_PUBLIC_API_URL, and NEXT_PUBLIC_SITE_URL

npm install
npm run dev   # http://localhost:3000
```

The backend must be running on `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`) and must include the website origin in `ALLOWED_ORIGINS` (e.g. `chrome-extension://<id>,http://localhost:3000`).

## Auth flow

- The browser uses `@supabase/ssr`'s `createBrowserClient` to sign in / sign up. Tokens are persisted in cookies that Next.js can read server-side.
- Server components read the session with `createServerClient` (see `lib/supabase/server.ts`) and redirect when missing.
- Every API call goes through `lib/api.ts`, which pulls the access token off the current Supabase session and sends it as `Authorization: Bearer <jwt>`. The FastAPI backend verifies it via JWKS — same path the extension uses.
- Extension navigation enters through `/auth/extension?ticket=...`. The route exchanges the short-lived ticket with FastAPI server-to-server, verifies the returned Supabase email token hash when a website session is needed, and redirects to the backend-stored destination. Handoff redirects are non-cacheable and use a no-referrer policy. A different existing website user requires an explicit choice under `/auth/extension/confirm`.

## Conventions

- Server components do read-only data fetching; client components handle mutations and optimistic UI.
- Types in `lib/types.ts` mirror backend pydantic schemas. Update both when the schema changes.
- New shadcn primitives go under `components/ui/` and are written by hand (no CLI). Keep them minimal — only add variants we actually use.
- Pages stay thin; the work happens in components under `components/<area>/`.

## Deployment

Vercel project, set the `NEXT_PUBLIC_*` env vars including `NEXT_PUBLIC_SITE_URL=https://www.canvasjob.com`, push to `main`. The middleware refreshes the Supabase session cookie on every request, so server components always see fresh auth.
