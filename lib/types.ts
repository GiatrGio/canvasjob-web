/**
 * Types mirroring backend pydantic schemas in linkedin-job-filter-backend.
 * Keep in sync with app/schemas/application.py and app/schemas/user.py.
 */

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export interface ApplicationListItem {
  id: string;
  user_id: string;
  source: string;
  external_id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  url: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  deadline_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application extends ApplicationListItem {
  description: string | null;
}

export interface ApplicationCreateInput {
  source: string;
  external_id: string;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  url?: string | null;
  description?: string | null;
  status?: ApplicationStatus;
  applied_at?: string | null;
  deadline_at?: string | null;
  notes?: string | null;
}

export interface ApplicationUpdateInput {
  status?: ApplicationStatus;
  applied_at?: string | null;
  deadline_at?: string | null;
  notes?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  url?: string | null;
}

// Per-job contacts. Lightweight, not reusable across jobs.
export interface ApplicationContact {
  id: string;
  application_id: string;
  user_id: string;
  name: string;
  role: string | null;
  email: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationContactCreateInput {
  name: string;
  role?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  notes?: string | null;
}

export type ApplicationContactUpdateInput = Partial<ApplicationContactCreateInput>;

// Per-job interview rounds.
export type InterviewOutcome = "passed" | "failed" | "no_show" | "cancelled";

export const INTERVIEW_OUTCOMES: InterviewOutcome[] = [
  "passed",
  "failed",
  "no_show",
  "cancelled",
];

export const OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  passed: "Passed",
  failed: "Failed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

export interface ApplicationInterview {
  id: string;
  application_id: string;
  user_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  interviewer: string | null;
  notes: string | null;
  outcome: InterviewOutcome | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInterviewCreateInput {
  title: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string | null;
  interviewer?: string | null;
  notes?: string | null;
  outcome?: InterviewOutcome | null;
}

export type ApplicationInterviewUpdateInput = Partial<ApplicationInterviewCreateInput>;

export interface MeResponse {
  email: string;
  plan: "free" | "pro";
  usage: { used: number; limit: number; period: string; warning_threshold?: number };
  cover_letters: { used: number; limit: number; period: string; warning_threshold?: number };
}

export interface BillingSession {
  url: string;
}

export type AdminPlan = "free" | "pro";
export type AdminLLMRange = "1h" | "24h" | "7d" | "30d";

export interface AdminUser {
  id: string;
  email: string | null;
  plan: AdminPlan;
  evaluations_used: number;
  monthly_eval_limit: number;
  cover_letters_used: number;
  monthly_cover_letter_limit: number;
  tracked_jobs_count: number;
  tracked_jobs_limit: number;
  usage_period: string;
  created_at: string | null;
  last_sign_in_at: string | null;
}

export interface AdminLLMCall {
  id: string;
  user_email: string | null;
  call_type: string;
  provider: string;
  model: string;
  status: "success" | "error";
  source: string | null;
  external_id: string | null;
  summary: string | null;
  tokens_input: number;
  tokens_output: number;
  cost_usd_micros: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface AdminLLMCallDetail extends AdminLLMCall {
  prompt: Record<string, unknown>;
  response: unknown;
  error: string | null;
}

export interface AdminLLMPricingModel {
  provider: string;
  model: string;
  input_cost_usd_per_million: number;
  output_cost_usd_per_million: number;
  source: "env" | "default" | "unavailable" | string;
}

export interface AdminLLMPricing {
  active_provider: string;
  active_model: string;
  fetched_at: string;
  models: AdminLLMPricingModel[];
}

export interface AdminDeleteResult {
  deleted_count: number;
}

// ---------------------------------------------------------------------------
// Settings — filter profiles, job fit (CV), cover letter
//
// Mirrors app/schemas/{profile,filter,cv,cover_letter}.py. These moved here
// from the Chrome extension's options page when settings were consolidated
// into the web app; the extension's src/shared/types.ts keeps the copies it
// still needs for the side panel.
// ---------------------------------------------------------------------------

// Two filter shapes the backend distinguishes (see migration 0006).
export type FilterKind = "criterion" | "question";

// Caps must match app/schemas/profile.py and app/schemas/filter.py.
export const FILTER_TEXT_MAX = 200;
export const PROFILE_NAME_MAX = 50;
export const MAX_PROFILES_PER_USER = 5;
export const MAX_FILTERS_PER_PROFILE = 10;

// Marker for the auto-seeded starter profile. Must match the backend's
// STARTER_PROFILE_NAME in app/routers/profiles.py — the filters tab uses it to
// decide whether to show the "edit or delete me" banner.
export const STARTER_PROFILE_NAME = "Starter pack";

export interface UsageOut {
  used: number;
  limit: number;
  period: string; // 'YYYY-MM'
  warning_threshold?: number;
}

export interface FilterOut {
  id: string;
  user_id: string;
  profile_id: string;
  text: string;
  position: number;
  enabled: boolean;
  kind: FilterKind;
  created_at: string;
  updated_at: string;
}

export interface FilterCreate {
  text: string;
  position?: number;
  enabled?: boolean;
  kind?: FilterKind;
}

export interface FilterUpdate {
  text?: string;
  position?: number;
  enabled?: boolean;
  kind?: FilterKind;
}

export interface FilterProfileOut {
  id: string;
  user_id: string;
  name: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilterProfileWithFilters extends FilterProfileOut {
  filters: FilterOut[];
}

export interface FilterProfileCreate {
  name: string;
}

export interface FilterProfileUpdate {
  name?: string;
}

export interface ReorderRequest {
  ids: string[];
}

// Filter quality validation. The backend classifies a single user-supplied
// filter into one of three buckets so the UI can either accept silently
// (good), warn but allow (vague), or block (rejected).
export type FilterValidationVerdict = "good" | "vague" | "rejected";

export interface FilterValidationRequest {
  text: string;
}

// A ready-to-save rewrite the validator offers for a vague filter. Picking one
// saves it straight away — the validator wrote it, so it isn't checked again.
export interface SuggestedFilter {
  text: string;
  kind: FilterKind;
}

export interface FilterValidationResponse {
  verdict: FilterValidationVerdict;
  reason: string;
  suggestion: string | null;
  // Populated on vague verdicts only. Optional so an older backend that
  // doesn't send it still type-checks at the call site.
  suggested_filters?: SuggestedFilter[];
  kind: FilterKind;
  usage: UsageOut;
}

// --- CV profile (job fit) ---------------------------------------------------
// Only non-PII professional signal is stored; the uploaded file is parsed
// server-side and discarded (no name/email/phone).
export type Seniority = "junior" | "mid" | "senior" | "lead" | "principal" | "unknown";

export interface CvProfile {
  skills: string[];
  years_experience: number | null;
  seniority: Seniority;
  titles: string[];
  domains: string[];
  education: string[];
  languages: string[];
  summary: string;
}

export interface CvProfileResponse {
  profile: CvProfile;
  updated_at: string | null;
}

// --- Cover letter -----------------------------------------------------------
// The identity block IS stored server-side (the user's choice); only
// `instructions` reaches the LLM.
export const COVER_LETTER_INSTRUCTIONS_MAX = 2000;
export const COVER_LETTER_FULL_NAME_MAX = 120;
export const COVER_LETTER_EMAIL_MAX = 160;
export const COVER_LETTER_PHONE_MAX = 40;
export const COVER_LETTER_LOCATION_MAX = 160;

export interface CoverLetterSettings {
  // Single block: how the letter should read + any achievements to emphasize.
  instructions: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
}

export interface CoverLetterSettingsResponse {
  settings: CoverLetterSettings;
  updated_at: string | null;
}

export interface CoverLetterInstructionsValidationRequest {
  text: string;
}

export interface CoverLetterInstructionsValidationResponse {
  verdict: FilterValidationVerdict;
  reason: string;
  suggestion: string | null;
  usage: UsageOut;
}
