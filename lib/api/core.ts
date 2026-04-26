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
  ApplicationCreateInput,
  ApplicationListItem,
  ApplicationUpdateInput,
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
      throw new ApiError(res.status, body?.detail || body?.error || res.statusText, body);
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
  };
}
