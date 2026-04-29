"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Check, Columns3, ExternalLink, GripVertical, Search, Table2, Trash2, X } from "lucide-react";
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
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null);

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

  async function deleteItem(id: string) {
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== id));
    try {
      await api.applications.delete(id);
      toast.success("Removed.");
      router.refresh();
    } catch (err) {
      setItems(prev);
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

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
                      <div className="flex items-center justify-end gap-1">
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
                        <DeleteConfirmButton onConfirm={() => deleteItem(it.id)} />
                      </div>
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
          dragOverStatus={dragOverStatus}
          onDragStart={setDraggingId}
          onDragEnd={() => {
            setDraggingId(null);
            setDragOverStatus(null);
          }}
          onDragOverColumn={setDragOverStatus}
          onStatusChange={updateStatus}
          onDelete={deleteItem}
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
  dragOverStatus,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onStatusChange,
  onDelete,
}: {
  items: ApplicationListItem[];
  draggingId: string | null;
  dragOverStatus: ApplicationStatus | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverColumn: (status: ApplicationStatus | null) => void;
  onStatusChange: (id: string, next: ApplicationStatus) => void;
  onDelete: (id: string) => void;
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

  const isDragging = draggingId !== null;

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <GripVertical className="h-3.5 w-3.5" />
        Drag a card between columns to update its status.
      </p>

      <div className="grid gap-3 lg:grid-cols-4">
        {ACTIVE_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            items={byStatus[status]}
            draggingId={draggingId}
            isDragging={isDragging}
            isOver={dragOverStatus === status}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverColumn={onDragOverColumn}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
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
              isDragging={isDragging}
              isOver={dragOverStatus === status}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverColumn={onDragOverColumn}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
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
  isDragging,
  isOver,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onStatusChange,
  onDelete,
  closed = false,
}: {
  status: ApplicationStatus;
  items: ApplicationListItem[];
  draggingId: string | null;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverColumn: (status: ApplicationStatus | null) => void;
  onStatusChange: (id: string, next: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  closed?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex min-h-80 flex-col rounded-md border bg-card transition-all",
        closed && "bg-background/70",
        isDragging && "border-dashed",
        isOver && "border-solid border-primary bg-primary/5 ring-2 ring-primary/40",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (!isOver) onDragOverColumn(status);
      }}
      onDragLeave={(event) => {
        // Only clear when the cursor leaves the column itself, not when it
        // crosses into a child element.
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        onDragOverColumn(null);
      }}
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
            onDelete={onDelete}
          />
        ))}
        {items.length === 0 ? (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-md border border-dashed px-3 py-8 text-center text-xs transition-colors",
              isOver
                ? "border-primary bg-primary/5 text-primary"
                : "text-muted-foreground",
            )}
          >
            {isOver ? "Drop to move here" : isDragging ? "Drop here" : "No jobs"}
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
  onDelete,
}: {
  item: ApplicationListItem;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onStatusChange: (id: string, next: ApplicationStatus) => void;
  onDelete: (id: string) => void;
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
        "group relative cursor-grab select-none rounded-md border bg-background p-3 pl-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md active:cursor-grabbing",
        dragging && "rotate-1 opacity-50 shadow-lg",
      )}
      aria-roledescription="Draggable job card. Drag between columns to change status."
    >
      <span
        aria-hidden
        className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground"
        title="Drag to move"
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <Link
        href={`/app/jobs/${item.id}`}
        className="block cursor-pointer"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="line-clamp-2 text-sm font-medium">{item.title ?? "(untitled)"}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {[item.company, item.location].filter(Boolean).join(" · ") || "No company listed"}
        </p>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-1">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Open original posting"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
          <DeleteConfirmButton size="sm" onConfirm={() => onDelete(item.id)} />
        </div>
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

function DeleteConfirmButton({
  onConfirm,
  size = "md",
}: {
  onConfirm: () => void;
  size?: "sm" | "md";
}) {
  const [confirming, setConfirming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    function dismissOnOutside(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    }
    function dismissOnEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirming(false);
    }
    document.addEventListener("pointerdown", dismissOnOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [confirming]);

  const trigger = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const action = size === "sm" ? "h-6 w-6" : "h-7 w-7";

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setConfirming((c) => !c);
        }}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          trigger,
          confirming
            ? "bg-destructive/10 text-destructive"
            : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        )}
        aria-label="Remove from tracker"
        aria-expanded={confirming}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {confirming ? (
        <div
          className="absolute right-full top-1/2 z-20 mr-1 flex -translate-y-1/2 items-center gap-0.5 whitespace-nowrap rounded-md border border-destructive/40 bg-background px-1 py-0.5 shadow-md"
          role="group"
          aria-label="Confirm removal"
        >
          <span className="px-1 text-xs font-medium text-destructive">Delete?</span>
          <button
            type="button"
            autoFocus
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(false);
              onConfirm();
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-sm bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90",
              action,
            )}
            aria-label="Confirm delete"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(false);
            }}
            className={cn(
              "inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              action,
            )}
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
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
