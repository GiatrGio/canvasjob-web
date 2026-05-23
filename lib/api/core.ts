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
  MeResponse,
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
    const body = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw new ApiError(res.status, errorMessageFromBody(body, res.statusText), body);
    }

    return body as T;
  }

  return {
    me: () => request<MeResponse>("/me"),
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
  };
}

function errorMessageFromBody(body: unknown, fallback: string): string {
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
