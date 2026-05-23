"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleArrowUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/core";
import { FREE_TRACKED_JOB_LIMIT } from "@/lib/limits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MeResponse } from "@/lib/types";

/**
 * Manual "Add job" — for jobs the user found outside a supported job board
 * (direct careers pages, recruiter emails, …). The extension's "Track this
 * job" button takes care of supported sites.
 *
 * `external_id` for manual adds is generated client-side as a uuid so
 * (source='manual', external_id=uuid) never collides with anything else.
 */
export function AddApplicationDialog({
  plan,
  trackedJobCount,
}: {
  plan: MeResponse["plan"];
  trackedJobCount: number;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isAtFreeLimit = plan === "free" && trackedJobCount >= FREE_TRACKED_JOB_LIMIT;

  function openAddFlow() {
    if (isAtFreeLimit) {
      setLimitOpen(true);
      return;
    }
    setFormOpen(true);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title || !company) {
      toast.error("Title and company are required.");
      setSubmitting(false);
      return;
    }

    try {
      await api.applications.create({
        source: "manual",
        external_id: crypto.randomUUID(),
        title,
        company,
        location: location || null,
        url: url || null,
        description: description || null,
      });
      toast.success("Job added to tracker.");
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      if (isTrackedJobLimitError(err)) {
        setFormOpen(false);
        setLimitOpen(true);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to add job.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={openAddFlow}>
        <Plus className="h-4 w-4" />
        Add job
      </Button>

      <TrackedJobLimitDialog open={limitOpen} onOpenChange={setLimitOpen} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a job manually</DialogTitle>
            <DialogDescription>
              For jobs from sites we don&apos;t yet support. Use the Chrome extension to
              track from LinkedIn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <Field name="title" label="Title" required />
            <Field name="company" label="Company" required />
            <Field name="location" label="Location" placeholder="Remote, EU" />
            <Field name="url" label="URL" type="url" placeholder="https://…" />
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Paste the job description here so it stays with this tracked job."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Add to tracker"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TrackedJobLimitDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CircleArrowUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>You&apos;ve reached the Free plan tracking limit</DialogTitle>
          <DialogDescription>
            Free includes {FREE_TRACKED_JOB_LIMIT} tracked jobs at once. Remove a job from your
            tracker, or upgrade to Pro for unlimited tracked jobs and evaluations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild>
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isTrackedJobLimitError(err: unknown): boolean {
  if (!(err instanceof ApiError) || err.status !== 402) return false;
  const body = err.body as { detail?: unknown; error?: unknown } | null | undefined;
  const detail = body?.detail as { error?: unknown } | string | null | undefined;
  if (typeof detail === "object" && detail?.error === "tracked_job_limit_exceeded") {
    return true;
  }
  return body?.error === "tracked_job_limit_exceeded" || detail === "tracked_job_limit_exceeded";
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}
