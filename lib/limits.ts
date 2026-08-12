/**
 * Free-tier allowances, shown on the marketing pages and used as the fallback
 * when a profile row hasn't got its own limit yet.
 *
 * These MIRROR the backend — they don't drive it. The enforced numbers live in
 * the API's FREE_TIER_MONTHLY_LIMIT / FREE_TRACKED_JOBS_LIMIT /
 * FREE_TIER_MONTHLY_COVER_LETTER_LIMIT (and, for evaluations and cover letters,
 * on each profile row). Change a limit in both places or the site will quote a
 * number the API won't honour.
 *
 * NEXT_PUBLIC_* is inlined at BUILD time, so the site needs a rebuild — not
 * just a restart — to pick up a new value.
 */
function envInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export const FREE_EVALUATION_LIMIT = envInt(
  process.env.NEXT_PUBLIC_FREE_EVALUATION_LIMIT,
  200,
);
export const FREE_TRACKED_JOB_LIMIT = envInt(
  process.env.NEXT_PUBLIC_FREE_TRACKED_JOB_LIMIT,
  20,
);
export const FREE_COVER_LETTER_LIMIT = envInt(
  process.env.NEXT_PUBLIC_FREE_COVER_LETTER_LIMIT,
  5,
);
export const PRO_COVER_LETTER_LIMIT = envInt(
  process.env.NEXT_PUBLIC_PRO_COVER_LETTER_LIMIT,
  25,
);
