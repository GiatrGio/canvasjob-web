"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bot, DatabaseZap, RefreshCcw, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminLLMCall,
  AdminLLMCallDetail,
  AdminLLMPricing,
  AdminLLMPricingModel,
  AdminLLMRange,
  AdminPlan,
  AdminUser,
} from "@/lib/types";

type AdminTab = "users" | "llm";

const PLAN_LABELS: Record<AdminPlan, string> = {
  free: "Free",
  pro: "Pro",
};

const LLM_RANGE_LABELS: Record<AdminLLMRange, string> = {
  "1h": "Past 1 hour",
  "24h": "Past 24 hours",
  "7d": "Past 7 days",
  "30d": "Past month",
};

const LLM_PRICING_CACHE_KEY = "canvasjob.admin.llmPricing.v1";
const LLM_PRICING_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">canvasjob</p>
            <h1 className="text-2xl font-semibold tracking-normal">Admin</h1>
          </div>
          <div className="inline-flex h-10 rounded-md border bg-muted p-1">
            <TabButton
              label="Users"
              icon={<Users className="h-4 w-4" />}
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            />
            <TabButton
              label="LLM"
              icon={<Bot className="h-4 w-4" />}
              active={activeTab === "llm"}
              onClick={() => setActiveTab("llm")}
            />
          </div>
        </header>

        {activeTab === "users" ? <UserAdminPanel /> : <LLMAdminPanel />}
      </div>
    </main>
  );
}

function UserAdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      return (user.email ?? "").toLowerCase().includes(q) || user.plan.includes(q);
    });
  }, [query, users]);

  const proCount = useMemo(() => users.filter((user) => user.plan === "pro").length, [users]);
  const freeCount = users.length - proCount;

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      setUsers(await api.admin.users.list());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }

  async function refreshUsers() {
    setLoading(true);
    try {
      setUsers(await api.admin.users.refresh());
      toast.success("User plans refreshed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh users");
    } finally {
      setLoading(false);
    }
  }

  async function updatePlan(userId: string, plan: AdminPlan) {
    const current = users.find((user) => user.id === userId);
    if (!current || current.plan === plan) return;

    const previous = users;
    setUpdatingIds((ids) => new Set(ids).add(userId));
    setUsers((rows) => rows.map((user) => (user.id === userId ? { ...user, plan } : user)));

    try {
      const updated = await api.admin.users.updatePlan(userId, plan);
      setUsers((rows) => rows.map((user) => (user.id === userId ? updated : user)));
      toast.success(`Plan set to ${PLAN_LABELS[plan]}.`);
    } catch (err) {
      setUsers(previous);
      toast.error(err instanceof Error ? err.message : "Could not update plan");
    } finally {
      setUpdatingIds((ids) => {
        const next = new Set(ids);
        next.delete(userId);
        return next;
      });
    }
  }

  async function deleteUser(user: AdminUser) {
    const label = user.email ?? user.id;
    if (!window.confirm(`Delete ${label}? This removes the Supabase auth user.`)) {
      return;
    }

    const previous = users;
    setDeletingIds((ids) => new Set(ids).add(user.id));
    setUsers((rows) => rows.filter((row) => row.id !== user.id));

    try {
      await api.admin.users.delete(user.id);
      toast.success("User deleted.");
    } catch (err) {
      setUsers(previous);
      toast.error(err instanceof Error ? err.message : "Could not delete user");
    } finally {
      setDeletingIds((ids) => {
        const next = new Set(ids);
        next.delete(user.id);
        return next;
      });
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Total" value={users.length} />
        <Metric label="Free" value={freeCount} />
        <Metric label="Pro" value={proCount} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users"
            className="w-full pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 sm:ml-auto"
          onClick={refreshUsers}
          disabled={loading}
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Limits</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{user.email ?? "(no email)"}</div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={user.plan}
                    onValueChange={(value) => updatePlan(user.id, value as AdminPlan)}
                    disabled={updatingIds.has(user.id) || deletingIds.has(user.id)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>
                    {formatNumber(user.evaluations_used)} /{" "}
                    {formatNumber(user.monthly_eval_limit)} evals
                  </div>
                  <div className="text-xs">
                    {formatNumber(user.tracked_jobs_count)} /{" "}
                    {formatNumber(user.tracked_jobs_limit)} tracked jobs
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(user.last_sign_in_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${user.email ?? user.id}`}
                    onClick={() => deleteUser(user)}
                    disabled={deletingIds.has(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && visibleUsers.length === 0 ? (
          <div className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
            No users found.
          </div>
        ) : null}
        {loading ? (
          <div className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
            Loading users...
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LLMAdminPanel() {
  const [range, setRange] = useState<AdminLLMRange>("24h");
  const [calls, setCalls] = useState<AdminLLMCall[]>([]);
  const [pricing, setPricing] = useState<AdminLLMPricing | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<AdminLLMCallDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    void loadPricing();
  }, []);

  useEffect(() => {
    void loadCalls(range);
  }, [range]);

  useEffect(() => {
    if (!selectedCallId) {
      setSelectedCall(null);
      return;
    }
    void loadCallDetail(selectedCallId);
  }, [selectedCallId]);

  async function loadCalls(nextRange = range) {
    setLoading(true);
    try {
      const rows = await api.admin.llmCalls.list(nextRange);
      setCalls(rows);
      if (selectedCallId && !rows.some((call) => call.id === selectedCallId)) {
        setSelectedCallId(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load LLM calls");
    } finally {
      setLoading(false);
    }
  }

  async function loadPricing() {
    const cached = readCachedPricing();
    if (cached) {
      setPricing(cached);
      return;
    }

    try {
      const fresh = await api.admin.llmPricing.get();
      setPricing(fresh);
      writeCachedPricing(fresh);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load LLM pricing");
    }
  }

  async function loadCallDetail(callId: string) {
    setDetailLoading(true);
    try {
      setSelectedCall(await api.admin.llmCalls.get(callId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load call detail");
    } finally {
      setDetailLoading(false);
    }
  }

  async function deleteCall(callId: string) {
    if (!window.confirm("Delete this LLM call log?")) return;
    try {
      await api.admin.llmCalls.delete(callId);
      setCalls((rows) => rows.filter((call) => call.id !== callId));
      setSelectedCallId(null);
      toast.success("LLM call deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete LLM call");
    }
  }

  async function deleteOlderThanRange() {
    if (!window.confirm(`Delete LLM call logs older than ${LLM_RANGE_LABELS[range].toLowerCase()}?`)) {
      return;
    }
    setPurging(true);
    try {
      const result = await api.admin.llmCalls.deleteOlderThan(range);
      toast.success(`Deleted ${result.deleted_count.toLocaleString()} old LLM call logs.`);
      await loadCalls(range);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete old LLM calls");
    } finally {
      setPurging(false);
    }
  }

  return (
    <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={range} onValueChange={(value) => setRange(value as AdminLLMRange)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LLM_RANGE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => loadCalls(range)}
            disabled={loading}
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="gap-2 sm:ml-auto"
            onClick={deleteOlderThanRange}
            disabled={purging}
          >
            <DatabaseZap className="h-4 w-4" />
            Delete Older
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Tokens</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const cost = getCallCost(call, pricing);

                return (
                  <tr
                    key={call.id}
                    className={cn(
                      "cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50",
                      selectedCallId === call.id && "bg-muted",
                    )}
                    onClick={() => setSelectedCallId(call.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatCallType(call.call_type)}</div>
                      <div className="text-xs text-muted-foreground">
                        {call.summary ?? call.status}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {call.user_email ?? "(unknown)"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{call.provider}</div>
                      <div className="text-xs">{call.model}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatNumber(call.tokens_input + call.tokens_output)}
                      <div className="text-xs">
                        {formatNumber(call.tokens_input)} in / {formatNumber(call.tokens_output)} out
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatCost(cost?.value ?? null)}
                      {cost?.estimated ? <div className="text-xs">estimated</div> : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {call.duration_ms == null ? "-" : `${formatNumber(call.duration_ms)} ms`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(call.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && calls.length === 0 ? (
            <div className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
              No LLM calls found.
            </div>
          ) : null}
          {loading ? (
            <div className="border-t px-4 py-10 text-center text-sm text-muted-foreground">
              Loading LLM calls...
            </div>
          ) : null}
        </div>
      </div>

      <aside className="rounded-md border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Call detail</h2>
            <p className="text-xs text-muted-foreground">
              {selectedCall ? formatCallType(selectedCall.call_type) : "No call selected"}
            </p>
          </div>
          {selectedCall ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete LLM call"
              onClick={() => deleteCall(selectedCall.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          ) : null}
        </div>

        <div className="space-y-4 p-4">
          {detailLoading ? (
            <div className="text-sm text-muted-foreground">Loading detail...</div>
          ) : selectedCall ? (
            <>
              {selectedCall.error ? (
                <DetailBlock title="Error" value={selectedCall.error} />
              ) : null}
              <DetailBlock title="Prompt" value={JSON.stringify(selectedCall.prompt, null, 2)} />
              <DetailBlock
                title="Response"
                value={JSON.stringify(selectedCall.response ?? null, null, 2)}
              />
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Select a call.</div>
          )}
        </div>
      </aside>
    </section>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-sm px-3 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatCost(value: number | null) {
  if (value == null) return "-";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(value / 1_000_000);
}

function getCallCost(
  call: AdminLLMCall,
  pricing: AdminLLMPricing | null,
): { value: number; estimated: boolean } | null {
  if (call.cost_usd_micros != null) {
    return { value: call.cost_usd_micros, estimated: false };
  }

  const modelPricing = findModelPricing(call, pricing);
  if (!modelPricing || modelPricing.source === "unavailable") {
    return null;
  }

  const value = Math.round(
    call.tokens_input * modelPricing.input_cost_usd_per_million +
      call.tokens_output * modelPricing.output_cost_usd_per_million,
  );
  return value > 0 ? { value, estimated: true } : null;
}

function findModelPricing(
  call: AdminLLMCall,
  pricing: AdminLLMPricing | null,
): AdminLLMPricingModel | null {
  if (!pricing) return null;
  const provider = call.provider.toLowerCase();
  const model = call.model.toLowerCase();

  return (
    pricing.models.find((item) => {
      if (item.provider.toLowerCase() !== provider) return false;
      const pricedModel = item.model.toLowerCase();
      return pricedModel === model || model.includes(pricedModel) || pricedModel.includes(model);
    }) ?? null
  );
}

function readCachedPricing(): AdminLLMPricing | null {
  try {
    const raw = window.localStorage.getItem(LLM_PRICING_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || typeof parsed.saved_at !== "number") return null;
    if (Date.now() - parsed.saved_at > LLM_PRICING_CACHE_MAX_AGE_MS) return null;

    return isAdminLLMPricing(parsed.pricing) ? parsed.pricing : null;
  } catch {
    return null;
  }
}

function writeCachedPricing(pricing: AdminLLMPricing) {
  try {
    window.localStorage.setItem(
      LLM_PRICING_CACHE_KEY,
      JSON.stringify({ saved_at: Date.now(), pricing }),
    );
  } catch {
    // Storage can be unavailable in private browsing; the UI can still use in-memory pricing.
  }
}

function isAdminLLMPricing(value: unknown): value is AdminLLMPricing {
  if (!isRecord(value)) return false;
  return (
    typeof value.active_provider === "string" &&
    typeof value.active_model === "string" &&
    typeof value.fetched_at === "string" &&
    Array.isArray(value.models)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const CALL_TYPE_LABELS: Record<string, string> = {
  dom_diagnostics: "DOM Diagnostics",
};

function formatCallType(value: string) {
  if (CALL_TYPE_LABELS[value]) return CALL_TYPE_LABELS[value];
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
        {value}
      </pre>
    </div>
  );
}
