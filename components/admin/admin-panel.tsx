"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { RefreshCcw, Search, Shield, Trash2, Users } from "lucide-react";
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
import type { AdminPlan, AdminUser } from "@/lib/types";

type AdminTab = "users" | "operations";

const PLAN_LABELS: Record<AdminPlan, string> = {
  free: "Free",
  pro: "Pro",
};

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
              label="Operations"
              icon={<Shield className="h-4 w-4" />}
              active={activeTab === "operations"}
              onClick={() => setActiveTab("operations")}
            />
          </div>
        </header>

        {activeTab === "users" ? <UserAdminPanel /> : <OperationsPanel />}
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
      return (
        (user.email ?? "").toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        user.plan.includes(q)
      );
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
          onClick={loadUsers}
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
                  <div className="max-w-64 truncate text-xs text-muted-foreground">{user.id}</div>
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
                    {formatNumber(user.cv_tailorings_used)} /{" "}
                    {formatNumber(user.monthly_cv_tailoring_limit)} tailorings
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

function OperationsPanel() {
  return <section className="min-h-64 rounded-md border bg-card" />;
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
