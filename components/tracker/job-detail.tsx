"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type {
  Application,
  ApplicationContact,
  ApplicationInterview,
  ApplicationStatus,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactsList } from "@/components/tracker/contacts-list";
import { InterviewSchedule } from "@/components/tracker/interview-schedule";
import { StatusSelect } from "@/components/tracker/status-select";

const NOTES_AUTOSAVE_MS = 800;

export function JobDetail({
  application,
  contacts,
  interviews,
}: {
  application: Application;
  contacts: ApplicationContact[];
  interviews: ApplicationInterview[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [appliedAt, setAppliedAt] = useState<string>(
    application.applied_at ? application.applied_at.slice(0, 10) : "",
  );
  const [deadlineAt, setDeadlineAt] = useState<string>(
    application.deadline_at ? application.deadline_at.slice(0, 10) : "",
  );
  const [notes, setNotes] = useState(application.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const notesTimer = useRef<NodeJS.Timeout | null>(null);
  const hasMounted = useRef(false);

  // Debounced autosave of the notes textarea. Skips the first render so we
  // don't write the loaded value back to the server on mount.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      setSavingNotes(true);
      try {
        await api.applications.update(application.id, { notes });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed");
      } finally {
        setSavingNotes(false);
      }
    }, NOTES_AUTOSAVE_MS);
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
  }, [notes, application.id]);

  async function handleStatus(next: ApplicationStatus) {
    const prev = status;
    const prevAppliedAt = appliedAt;
    setStatus(next);
    try {
      const patch: { status: ApplicationStatus; applied_at?: string } = { status: next };
      if (next === "applied" && !appliedAt) {
        const today = new Date().toISOString();
        patch.applied_at = today;
        setAppliedAt(today.slice(0, 10));
      }
      await api.applications.update(application.id, patch);
    } catch (err) {
      setStatus(prev);
      setAppliedAt(prevAppliedAt);
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleAppliedAt(value: string) {
    setAppliedAt(value);
    try {
      await api.applications.update(application.id, {
        applied_at: value ? new Date(value).toISOString() : null,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDeadlineAt(value: string) {
    setDeadlineAt(value);
    try {
      await api.applications.update(application.id, {
        // End of day in user's local timezone — feels right for a deadline.
        deadline_at: value
          ? new Date(`${value}T23:59:59`).toISOString()
          : null,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDelete() {
    if (!confirm("Remove this job from your tracker?")) return;
    try {
      await api.applications.delete(application.id);
      toast.success("Removed.");
      router.push("/app");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const sourceLabel =
    application.source === "manual"
      ? "Added manually"
      : `From ${application.source}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{application.title ?? "(untitled)"}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {[application.company, application.location].filter(Boolean).join(" · ")}
            </div>
            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
              <span>{sourceLabel}</span>
              {application.url ? (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground hover:underline"
                >
                  Open original
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes" className="mb-1.5 inline-block">
                Notes
                {savingNotes ? (
                  <span className="ml-2 text-xs text-muted-foreground">Saving…</span>
                ) : null}
              </Label>
              <Textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Recruiter contact, interview prep, anything you want to remember."
              />
            </div>
          </CardContent>
        </Card>

        <InterviewSchedule
          applicationId={application.id}
          initial={interviews}
        />

        {application.description ? (
          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {application.description}
              </pre>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 inline-block">Stage</Label>
              <StatusSelect value={status} onChange={handleStatus} />
            </div>
            <div>
              <Label htmlFor="applied_at" className="mb-1.5 inline-block">
                Applied date
              </Label>
              <Input
                id="applied_at"
                type="date"
                value={appliedAt}
                onChange={(e) => handleAppliedAt(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Auto-set when you move to <span className="font-medium">Applied</span>.
              </p>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="deadline_at">Application deadline</Label>
                <DeadlineBadge deadlineAt={deadlineAt} />
              </div>
              <Input
                id="deadline_at"
                type="date"
                value={deadlineAt}
                onChange={(e) => handleDeadlineAt(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Tracked" value={format(new Date(application.created_at), "PPP")} />
            <Row label="Updated" value={format(new Date(application.updated_at), "PPP")} />
            {appliedAt ? (
              <Row label="Applied" value={format(new Date(`${appliedAt}T00:00:00`), "PPP")} />
            ) : null}
            {deadlineAt ? (
              <Row label="Deadline" value={format(new Date(`${deadlineAt}T00:00:00`), "PPP")} />
            ) : null}
          </CardContent>
        </Card>

        <ContactsList
          applicationId={application.id}
          initial={contacts}
        />

        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Remove from tracker
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// Soft-warning chip next to the deadline input. Uses calendar-day diff so
// "tomorrow" reads as "1 day left" regardless of the time of day.
function DeadlineBadge({ deadlineAt }: { deadlineAt: string }) {
  if (!deadlineAt) return null;
  const days = differenceInCalendarDays(new Date(`${deadlineAt}T23:59:59`), new Date());
  if (days < 0) {
    return (
      <Badge variant="rejected" className="text-[10px]">
        Passed {Math.abs(days)}d ago
      </Badge>
    );
  }
  if (days === 0) {
    return (
      <Badge variant="rejected" className="text-[10px]">
        Today
      </Badge>
    );
  }
  if (days <= 3) {
    return (
      <Badge variant="interviewing" className="text-[10px]">
        {days}d left
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[10px]">
      {days}d left
    </Badge>
  );
}
