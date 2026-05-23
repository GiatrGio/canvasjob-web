"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Manual "Add job" — for jobs the user found outside a supported job board
 * (direct careers pages, recruiter emails, …). The extension's "Track this
 * job" button takes care of supported sites.
 *
 * `external_id` for manual adds is generated client-side as a uuid so
 * (source='manual', external_id=uuid) never collides with anything else.
 */
export function AddApplicationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add job.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add job
        </Button>
      </DialogTrigger>
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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add to tracker"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
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
