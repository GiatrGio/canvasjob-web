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
  notes?: string | null;
}

export interface ApplicationUpdateInput {
  status?: ApplicationStatus;
  applied_at?: string | null;
  notes?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  url?: string | null;
}

export interface MeResponse {
  email: string;
  plan: "free" | "pro";
  usage: { used: number; limit: number; period: string };
}
