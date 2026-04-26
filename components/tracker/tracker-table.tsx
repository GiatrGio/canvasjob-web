"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/tracker/status-badge";
import { StatusSelect } from "@/components/tracker/status-select";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/lib/types";

type StatusFilter = "all" | ApplicationStatus;

export function TrackerTable({ initial }: { initial: ApplicationListItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  // Counts per status (from the unfiltered list) so the pills always show the
  // full picture, regardless of the active filter.
  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: items.length,
      saved: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0, withdrawn: 0,
    };
    for (const it of items) c[it.status] += 1;
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== "all" && it.status !== filter) return false;
      if (!q) return true;
      return (
        (it.title ?? "").toLowerCase().includes(q) ||
        (it.company ?? "").toLowerCase().includes(q) ||
        (it.location ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  async function updateStatus(id: string, next: ApplicationStatus) {
    // Optimistic update; revert on error.
    const prev = items;
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, status: next } : it)));
    try {
      const patch: { status: ApplicationStatus; applied_at?: string } = { status: next };
      // Auto-stamp applied_at when moving to "applied" if it's not set yet.
      const target = items.find((i) => i.id === id);
      if (next === "applied" && target && !target.applied_at) {
        patch.applied_at = new Date().toISOString();
      }
      await api.applications.update(id, patch);
      router.refresh();
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label="All"
          count={counts.all}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {APPLICATION_STATUSES.map((s) => (
          <FilterPill
            key={s}
            label={STATUS_LABELS[s]}
            count={counts[s]}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title, company, location"
            className="pl-8 w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((it) => (
              <tr
                key={it.id}
                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link href={`/app/jobs/${it.id}`} className="block">
                    <div className="font-medium">{it.title ?? "(untitled)"}</div>
                    <div className="text-xs text-muted-foreground">
                      {[it.company, it.location].filter(Boolean).join(" · ")}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusSelect
                      value={it.status}
                      onChange={(next) => updateStatus(it.id, next)}
                      className="h-8 w-36"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="capitalize">{it.source}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(it.updated_at), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-right">
                  {it.url ? (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Open original posting"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No matches.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-muted",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-xs",
          active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed bg-card p-12 text-center">
      <h3 className="text-lg font-semibold">No tracked jobs yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Click <span className="font-medium">Track this job</span> from the canvasjob Chrome
        extension on a LinkedIn job posting, or add one manually.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/pricing">See plans</Link>
        </Button>
      </div>
    </div>
  );
}
