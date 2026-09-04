/**
 * Shared FastAPI client. Environment-agnostic: callers pass a `getToken`
 * function that knows how to retrieve the current Supabase access token in
 * its context (server cookie vs. browser session).
 *
 * Two thin wrappers — `lib/api/server.ts` and `lib/api/client.ts` — bind
 * the right getter so call sites can write `api.applications.list()` without
 * thinking about it.
 */

import type {
  Application,
  ApplicationContact,
  ApplicationContactCreateInput,
  ApplicationContactUpdateInput,
  ApplicationCreateInput,
  ApplicationInterview,
  ApplicationInterviewCreateInput,
  ApplicationInterviewUpdateInput,
  ApplicationListItem,
  ApplicationUpdateInput,
  BillingSession,
  AdminDeleteResult,
  AdminLLMCall,
  AdminLLMCallDetail,
  AdminLLMPricing,
  AdminLLMRange,
  AdminPlan,
  AdminUser,
  CoverLetterInstructionsValidationRequest,
  CoverLetterInstructionsValidationResponse,
  CoverLetterSettings,
  CoverLetterSettingsResponse,
  CvProfile,
  CvProfileResponse,
  FilterCreate,
  FilterOut,
  FilterProfileCreate,
  FilterProfileOut,
  FilterProfileUpdate,
  FilterProfileWithFilters,
  FilterUpdate,
  FilterValidationRequest,
  FilterValidationResponse,
  MeResponse,
  ReorderRequest,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export type TokenGetter = () => Promise<string | null>;

export interface Api {
  me(): Promise<MeResponse>;
  // Irreversible: deletes the caller's auth user, which cascades every table
  // that references it. The account comes from the token, not an argument.
  deleteAccount(): Promise<void>;
  applications: {
    list(): Promise<ApplicationListItem[]>;
    get(id: string): Promise<Application>;
    create(body: ApplicationCreateInput): Promise<Application>;
    update(id: string, body: ApplicationUpdateInput): Promise<Application>;
    delete(id: string): Promise<void>;
  };
  contacts: {
    list(applicationId: string): Promise<ApplicationContact[]>;
    create(applicationId: string, body: ApplicationContactCreateInput): Promise<ApplicationContact>;
    update(id: string, body: ApplicationContactUpdateInput): Promise<ApplicationContact>;
    delete(id: string): Promise<void>;
  };
  interviews: {
    list(applicationId: string): Promise<ApplicationInterview[]>;
    create(applicationId: string, body: ApplicationInterviewCreateInput): Promise<ApplicationInterview>;
    update(id: string, body: ApplicationInterviewUpdateInput): Promise<ApplicationInterview>;
    delete(id: string): Promise<void>;
  };
  billing: {
    createCheckoutSession(): Promise<BillingSession>;
    createPortalSession(): Promise<BillingSession>;
  };
  admin: {
    users: {
      list(): Promise<AdminUser[]>;
      refresh(): Promise<AdminUser[]>;
      updatePlan(id: string, plan: AdminPlan): Promise<AdminUser>;
      delete(id: string): Promise<void>;
    };
    llmCalls: {
      list(range: AdminLLMRange): Promise<AdminLLMCall[]>;
      get(id: string): Promise<AdminLLMCallDetail>;
      delete(id: string): Promise<void>;
      deleteOlderThan(range: AdminLLMRange): Promise<AdminDeleteResult>;
    };
    llmPricing: {
      get(): Promise<AdminLLMPricing>;
    };
  };
  // --- Settings -------------------------------------------------------------
  // Filter profiles + their filters, the CV behind job fit, and the cover
  // letter defaults. All browser-side: the Settings dialog is a client
  // component, so these never run through lib/api/server.ts.
  profiles: {
    list(): Promise<FilterProfileWithFilters[]>;
    create(body: FilterProfileCreate): Promise<FilterProfileOut>;
    update(id: string, body: FilterProfileUpdate): Promise<FilterProfileOut>;
    delete(id: string): Promise<void>;
    activate(id: string): Promise<FilterProfileOut>;
    reorder(body: ReorderRequest): Promise<FilterProfileOut[]>;
  };
  filters: {
    create(profileId: string, body: FilterCreate): Promise<FilterOut>;
    update(id: string, body: FilterUpdate): Promise<FilterOut>;
    delete(id: string): Promise<void>;
    reorder(profileId: string, body: ReorderRequest): Promise<FilterOut[]>;
    validate(body: FilterValidationRequest): Promise<FilterValidationResponse>;
  };
  cv: {
    // 200 + null when the user has not uploaded a CV yet.
    get(): Promise<CvProfileResponse | null>;
    upload(file: File): Promise<CvProfileResponse>;
    update(profile: CvProfile): Promise<CvProfileResponse>;
    delete(): Promise<void>;
  };
  coverLetter: {
    getSettings(): Promise<CoverLetterSettingsResponse>;
    updateSettings(settings: CoverLetterSettings): Promise<CoverLetterSettingsResponse>;
    validateInstructions(
      body: CoverLetterInstructionsValidationRequest,
    ): Promise<CoverLetterInstructionsValidationResponse>;
  };
}

export function makeApi(getToken: TokenGetter): Api {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getToken();
    if (!token) {
      throw new ApiError(401, "not authenticated");
    }

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });

    if (res.status === 204) {
      return undefined as T;
    }

    const text = await res.text();
    const body = parseResponseBody(text);

    if (!res.ok) {
      throw new ApiError(res.status, errorMessageFromBody(body, res.statusText), body);
    }

    if (typeof body === "string") {
      throw new ApiError(res.status, "API returned a non-JSON response", body);
    }

    return body as T;
  }

  // Multipart upload (CV file). Deliberately does NOT set Content-Type — the
  // browser adds the multipart boundary itself.
  async function requestForm<T>(path: string, form: FormData): Promise<T> {
    const token = await getToken();
    if (!token) {
      throw new ApiError(401, "not authenticated");
    }

    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    const body = parseResponseBody(text);

    if (!res.ok) {
      throw new ApiError(res.status, errorMessageFromBody(body, res.statusText), body);
    }

    return body as T;
  }

  return {
    me: () => request<MeResponse>("/me"),
    deleteAccount: () => request<void>("/me", { method: "DELETE" }),
    applications: {
      list: () => request<ApplicationListItem[]>("/applications"),
      get: (id) => request<Application>(`/applications/${id}`),
      create: (body) =>
        request<Application>("/applications", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id, body) =>
        request<Application>(`/applications/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id) => request<void>(`/applications/${id}`, { method: "DELETE" }),
    },
    contacts: {
      list: (applicationId) =>
        request<ApplicationContact[]>(`/applications/${applicationId}/contacts`),
      create: (applicationId, body) =>
        request<ApplicationContact>(`/applications/${applicationId}/contacts`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id, body) =>
        request<ApplicationContact>(`/contacts/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id) => request<void>(`/contacts/${id}`, { method: "DELETE" }),
    },
    interviews: {
      list: (applicationId) =>
        request<ApplicationInterview[]>(`/applications/${applicationId}/interviews`),
      create: (applicationId, body) =>
        request<ApplicationInterview>(`/applications/${applicationId}/interviews`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id, body) =>
        request<ApplicationInterview>(`/interviews/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id) => request<void>(`/interviews/${id}`, { method: "DELETE" }),
    },
    billing: {
      createCheckoutSession: () =>
        request<BillingSession>("/billing/checkout-session", { method: "POST" }),
      createPortalSession: () =>
        request<BillingSession>("/billing/portal-session", { method: "POST" }),
    },
    admin: {
      users: {
        list: () => request<AdminUser[]>("/admin/users"),
        refresh: () => request<AdminUser[]>("/admin/users/refresh", { method: "POST" }),
        updatePlan: (id, plan) =>
          request<AdminUser>(`/admin/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ plan }),
          }),
        delete: (id) => request<void>(`/admin/users/${id}`, { method: "DELETE" }),
      },
      llmCalls: {
        list: (range) => request<AdminLLMCall[]>(`/admin/llm-calls?range=${range}`),
        get: (id) => request<AdminLLMCallDetail>(`/admin/llm-calls/${id}`),
        delete: (id) => request<void>(`/admin/llm-calls/${id}`, { method: "DELETE" }),
        deleteOlderThan: (range) =>
          request<AdminDeleteResult>(`/admin/llm-calls?older_than=${range}`, {
            method: "DELETE",
          }),
      },
      llmPricing: {
        get: () => request<AdminLLMPricing>("/admin/llm-pricing"),
      },
    },
    profiles: {
      list: () => request<FilterProfileWithFilters[]>("/profiles"),
      create: (body) =>
        request<FilterProfileOut>("/profiles", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id, body) =>
        request<FilterProfileOut>(`/profiles/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id) => request<void>(`/profiles/${id}`, { method: "DELETE" }),
      activate: (id) =>
        request<FilterProfileOut>(`/profiles/${id}/activate`, { method: "POST" }),
      reorder: (body) =>
        request<FilterProfileOut[]>("/profiles/reorder", {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
    },
    filters: {
      create: (profileId, body) =>
        request<FilterOut>(`/profiles/${profileId}/filters`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id, body) =>
        request<FilterOut>(`/filters/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      delete: (id) => request<void>(`/filters/${id}`, { method: "DELETE" }),
      reorder: (profileId, body) =>
        request<FilterOut[]>(`/profiles/${profileId}/filters/reorder`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      validate: (body) =>
        request<FilterValidationResponse>("/filters/validate", {
          method: "POST",
          body: JSON.stringify(body),
        }),
    },
    cv: {
      get: () => request<CvProfileResponse | null>("/cv"),
      upload: (file) => {
        const form = new FormData();
        form.append("file", file);
        return requestForm<CvProfileResponse>("/cv", form);
      },
      // Save a user-edited profile (e.g. added skills). Re-hashes server-side,
      // so the next job view re-evaluates fit against the edited profile.
      update: (profile) =>
        request<CvProfileResponse>("/cv", {
          method: "PUT",
          body: JSON.stringify(profile),
        }),
      delete: () => request<void>("/cv", { method: "DELETE" }),
    },
    coverLetter: {
      getSettings: () => request<CoverLetterSettingsResponse>("/cover-letter/settings"),
      updateSettings: (settings) =>
        request<CoverLetterSettingsResponse>("/cover-letter/settings", {
          method: "PUT",
          body: JSON.stringify(settings),
        }),
      validateInstructions: (body) =>
        request<CoverLetterInstructionsValidationResponse>(
          "/cover-letter/settings/validate-instructions",
          { method: "POST", body: JSON.stringify(body) },
        ),
    },
  };
}

function parseResponseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessageFromBody(body: unknown, fallback: string): string {
  if (typeof body === "string") return readableTextError(body, fallback);
  const parsed = body as { detail?: unknown; error?: unknown } | null | undefined;
  const detail = parsed?.detail;
  if (typeof detail === "string") return detail;
  if (
    detail &&
    typeof detail === "object" &&
    "error" in detail &&
    typeof detail.error === "string"
  ) {
    return detail.error;
  }
  if (typeof parsed?.error === "string") return parsed.error;
  return fallback;
}

function readableTextError(text: string, fallback: string): string {
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  return trimmed.length > 240 ? `${trimmed.slice(0, 240)}...` : trimmed;
}
