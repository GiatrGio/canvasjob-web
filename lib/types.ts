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
}

export interface BillingSession {
  url: string;
}
