"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Columns3, ExternalLink, Search, Table2 } from "lucide-react";
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
type TrackerView = "list" | "board";

const ACTIVE_STATUSES: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer"];
const CLOSED_STATUSES: ApplicationStatus[] = ["rejected", "withdrawn"];

export function TrackerTable({ initial }: { initial: ApplicationListItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<TrackerView>("board");
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
      if (view === "list" && filter !== "all" && it.status !== filter) return false;
      if (!q) return true;
      return (
        (it.title ?? "").toLowerCase().includes(q) ||
        (it.company ?? "").toLowerCase().includes(q) ||
        (it.location ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, query, view]);

  async function updateStatus(id: string, next: ApplicationStatus) {
    const current = items.find((i) => i.id === id);
    if (!current || current.status === next) return;

    // Optimistic update; revert on error.
    const prev = items;
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, status: next } : it)));
    try {
      const patch: { status: ApplicationStatus; applied_at?: string } = { status: next };
      // Auto-stamp applied_at when moving to "applied" if it's not set yet.
      if (next === "applied" && !current.applied_at) {
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-10 rounded-md border bg-muted p-1">
          <ViewButton
            label="Board"
            icon={<Columns3 className="h-4 w-4" />}
            active={view === "board"}
            onClick={() => setView("board")}
          />
          <ViewButton
            label="List"
            icon={<Table2 className="h-4 w-4" />}
            active={view === "list"}
            onClick={() => setView("list")}
          />
        </div>
        <div className="relative w-full sm:ml-auto sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title, company, location"
            className="w-full pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {view === "list" ? (
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
          </div>

          <div className="overflow-x-auto rounded-md border bg-card">
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
                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
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
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No matches.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <KanbanBoard
          items={visible}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}

function ViewButton({
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
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-3 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-pressed={active}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function KanbanBoard({
  items,
  draggingId,
  onDragStart,
  onDragEnd,
  onStatusChange,
}: {
  items: ApplicationListItem[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onStatusChange: (id: string, next: ApplicationStatus) => void;
}) {
  const byStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, ApplicationListItem[]> = {
      saved: [],
      applied: [],
      interviewing: [],
      offer: [],
      rejected: [],
      withdrawn: [],
    };

    for (const item of items) {
      grouped[item.status].push(item);
    }

    return grouped;
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-4">
        {ACTIVE_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={byStatus[status]}
            draggingId={draggingId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <div className="rounded-md border border-dashed bg-muted/30 p-3">
        <div className="mb-3 flex items-center">
          <h2 className="text-sm font-medium text-muted-foreground">Closed out</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {CLOSED_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              items={byStatus[status]}
              draggingId={draggingId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onStatusChange={onStatusChange}
              closed
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  items,
  draggingId,
  onDragStart,
  onDragEnd,
  onStatusChange,
  closed = false,
}: {
  status: ApplicationStatus;
  items: ApplicationListItem[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onStatusChange: (id: string, next: ApplicationStatus) => void;
  closed?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex min-h-80 flex-col rounded-md border bg-card",
        closed && "bg-background/70",
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain") || draggingId;
        if (id) onStatusChange(id, status);
        onDragEnd();
      }}
      aria-label={`${STATUS_LABELS[status]} jobs`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {items.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            dragging={draggingId === item.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onStatusChange={onStatusChange}
          />
        ))}
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed px-3 py-8 text-center text-xs text-muted-foreground">
            No jobs
          </div>
        ) : null}
      </div>
    </section>
  );
}

function KanbanCard({
  item,
  dragging,
  onDragStart,
  onDragEnd,
  onStatusChange,
}: {
  item: ApplicationListItem;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onStatusChange: (id: string, next: ApplicationStatus) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-md border bg-background p-3 shadow-sm transition-opacity",
        dragging && "opacity-50",
      )}
    >
      <Link href={`/app/jobs/${item.id}`} className="block">
        <h3 className="line-clamp-2 text-sm font-medium">{item.title ?? "(untitled)"}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {[item.company, item.location].filter(Boolean).join(" · ") || "No company listed"}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
        </span>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Open original posting"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
      <div className="mt-3">
        <StatusSelect
          value={item.status}
          onChange={(next) => onStatusChange(item.id, next)}
          className="h-8"
        />
      </div>
    </article>
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
