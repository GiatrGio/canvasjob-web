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
