"use client";

import { useRef, useState } from "react";
import { format, isPast } from "date-fns";
import { CalendarPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { parseIcs } from "@/lib/ics";
import {
  type ApplicationInterview,
  type ApplicationInterviewCreateInput,
  type InterviewOutcome,
  INTERVIEW_OUTCOMES,
  OUTCOME_LABELS,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NO_OUTCOME = "__none__";

const OUTCOME_BADGE: Record<InterviewOutcome, "offer" | "rejected" | "withdrawn"> = {
  passed: "offer",
  failed: "rejected",
  no_show: "withdrawn",
  cancelled: "withdrawn",
};

export function InterviewSchedule({
  applicationId,
  initial,
}: {
  applicationId: string;
  initial: ApplicationInterview[];
}) {
  const [items, setItems] = useState<ApplicationInterview[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Seeds the add-form when a round is imported from an .ics invite. `formKey`
  // forces a fresh mount so a new import replaces whatever was seeded before.
  const [prefill, setPrefill] = useState<Partial<ApplicationInterviewCreateInput> | null>(null);
  const [formKey, setFormKey] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function sortedItems() {
    return [...items].sort((a, b) =>
      a.scheduled_at < b.scheduled_at ? -1 : a.scheduled_at > b.scheduled_at ? 1 : 0,
    );
  }

  function openAdd(seed: Partial<ApplicationInterviewCreateInput> | null) {
    setPrefill(seed);
    setFormKey((k) => k + 1);
    setAdding(true);
  }

  function closeAdd() {
    setAdding(false);
    setPrefill(null);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the user re-pick the same file later
    if (!file) return;
    try {
      const parsed = parseIcs(await file.text());
      if (!parsed) {
        toast.error("Couldn't find an event in that .ics file.");
        return;
      }
      openAdd({
        title: parsed.title ?? "",
        scheduled_at: parsed.scheduledAt ?? undefined,
        duration_minutes: parsed.durationMinutes ?? 60,
        location: parsed.location,
        interviewer: parsed.interviewer,
        notes: parsed.notes,
      });
      if (parsed.scheduledAt) {
        toast.success("Imported from invite — review the details and save.");
      } else {
        toast.warning("Imported, but couldn't read the date — please set it.");
      }
    } catch {
      toast.error("Couldn't read that file.");
    }
  }

  async function handleCreate(body: ApplicationInterviewCreateInput) {
    try {
      const created = await api.interviews.create(applicationId, body);
      setItems((prev) => [...prev, created]);
      closeAdd();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add interview");
    }
  }

  async function handleUpdate(id: string, body: Partial<ApplicationInterviewCreateInput>) {
    try {
      const updated = await api.interviews.update(id, body);
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this interview round?")) return;
    try {
      await api.interviews.delete(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Interview schedule</CardTitle>
        {!adding ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              title="Import a round from a calendar invite (.ics)"
            >
              <CalendarPlus className="h-4 w-4" />
              Import .ics
            </Button>
            <Button size="sm" variant="outline" onClick={() => openAdd(null)}>
              <Plus className="h-4 w-4" />
              Add round
            </Button>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept=".ics,text/calendar"
          className="hidden"
          onChange={handleImportFile}
        />
        {adding ? (
          <InterviewForm
            key={formKey}
            prefill={prefill ?? undefined}
            onCancel={closeAdd}
            onSubmit={handleCreate}
          />
        ) : null}

        {items.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground">
            No rounds yet. Add one when you have an interview scheduled.
          </p>
        ) : null}

        <ul className="space-y-2">
          {sortedItems().map((it) =>
            editingId === it.id ? (
              <li key={it.id}>
                <InterviewForm
                  initial={it}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(body) => handleUpdate(it.id, body)}
                />
              </li>
            ) : (
              <InterviewRow
                key={it.id}
                interview={it}
                onEdit={() => setEditingId(it.id)}
                onDelete={() => handleDelete(it.id)}
                onSetOutcome={(outcome) => handleUpdate(it.id, { outcome })}
              />
            ),
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function InterviewRow({
  interview,
  onEdit,
  onDelete,
  onSetOutcome,
}: {
  interview: ApplicationInterview;
  onEdit: () => void;
  onDelete: () => void;
  onSetOutcome: (outcome: InterviewOutcome | null) => void;
}) {
  const date = new Date(interview.scheduled_at);
  const past = isPast(date);
  return (
    <li className="rounded-md border bg-card/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{interview.title}</span>
            {interview.outcome ? (
              <Badge variant={OUTCOME_BADGE[interview.outcome]} className="text-[10px]">
                {OUTCOME_LABELS[interview.outcome]}
              </Badge>
            ) : past ? (
              <Badge variant="secondary" className="text-[10px]">Past</Badge>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(date, "PPp")} · {interview.duration_minutes} min
          </div>
          {interview.interviewer ? (
            <div className="text-xs text-muted-foreground">
              With {interview.interviewer}
            </div>
          ) : null}
          {interview.location ? (
            <div className="text-xs text-muted-foreground truncate">
              {/^https?:\/\//.test(interview.location) ? (
                <a
                  href={interview.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {interview.location}
                </a>
              ) : (
                interview.location
              )}
            </div>
          ) : null}
          {interview.notes ? (
            <p className="pt-1 text-xs text-muted-foreground whitespace-pre-wrap">
              {interview.notes}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {past ? (
        <div className="mt-2 flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Outcome</Label>
          <Select
            value={interview.outcome ?? NO_OUTCOME}
            onValueChange={(v) =>
              onSetOutcome(v === NO_OUTCOME ? null : (v as InterviewOutcome))
            }
          >
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue placeholder="Pending" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_OUTCOME}>Pending</SelectItem>
              {INTERVIEW_OUTCOMES.map((o) => (
                <SelectItem key={o} value={o}>
                  {OUTCOME_LABELS[o]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </li>
  );
}

// Convert an ISO datetime string (with timezone) to the value format the
// browser's <input type="datetime-local"> expects: 'YYYY-MM-DDTHH:mm' in the
// user's local timezone. Returns "" for null/empty.
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function InterviewForm({
  initial,
  prefill,
  onCancel,
  onSubmit,
}: {
  initial?: ApplicationInterview;
  prefill?: Partial<ApplicationInterviewCreateInput>;
  onCancel: () => void;
  onSubmit: (body: ApplicationInterviewCreateInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? prefill?.title ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocal(initial?.scheduled_at ?? prefill?.scheduled_at),
  );
  const [duration, setDuration] = useState(
    initial?.duration_minutes ?? prefill?.duration_minutes ?? 60,
  );
  const [location, setLocation] = useState(initial?.location ?? prefill?.location ?? "");
  const [interviewer, setInterviewer] = useState(
    initial?.interviewer ?? prefill?.interviewer ?? "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? prefill?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) {
      toast.error("Title and date are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        // datetime-local is timezone-naive; treat as local and convert to ISO.
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        location: location.trim() || null,
        interviewer: interviewer.trim() || null,
        notes: notes.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-md border bg-card/40 p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="iv-title" className="mb-1.5 inline-block">Title</Label>
          <Input
            id="iv-title"
            placeholder="Phone screen, Tech round 2, …"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="iv-when" className="mb-1.5 inline-block">When</Label>
          <Input
            id="iv-when"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="iv-duration" className="mb-1.5 inline-block">
            Duration (min)
          </Label>
          <Input
            id="iv-duration"
            type="number"
            min={1}
            max={1440}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="iv-location" className="mb-1.5 inline-block">
            Location or link
          </Label>
          <Input
            id="iv-location"
            placeholder="https://meet.google.com/… or onsite address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="iv-interviewer" className="mb-1.5 inline-block">
            Interviewer(s)
          </Label>
          <Input
            id="iv-interviewer"
            placeholder="Alex (Engineering Manager)"
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="iv-notes" className="mb-1.5 inline-block">Notes</Label>
          <Textarea
            id="iv-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Prep topics, things to mention, links to share."
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save" : "Add round"}
        </Button>
      </div>
    </form>
  );
}
