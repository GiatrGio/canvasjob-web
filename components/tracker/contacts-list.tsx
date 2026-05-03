"use client";

import { useState } from "react";
import { Linkedin, Mail, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type {
  ApplicationContact,
  ApplicationContactCreateInput,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactsList({
  applicationId,
  initial,
}: {
  applicationId: string;
  initial: ApplicationContact[];
}) {
  const [items, setItems] = useState<ApplicationContact[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(body: ApplicationContactCreateInput) {
    try {
      const created = await api.contacts.create(applicationId, body);
      setItems((prev) => [...prev, created]);
      setAdding(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add contact");
    }
  }

  async function handleUpdate(id: string, body: Partial<ApplicationContactCreateInput>) {
    try {
      const updated = await api.contacts.update(id, body);
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this contact?")) return;
    try {
      await api.contacts.delete(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Contacts</CardTitle>
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {adding ? (
          <ContactForm
            onCancel={() => setAdding(false)}
            onSubmit={handleCreate}
          />
        ) : null}

        {items.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground">
            Add the recruiter, hiring manager, or anyone else you&rsquo;re
            talking to about this role.
          </p>
        ) : null}

        <ul className="space-y-2">
          {items.map((c) =>
            editingId === c.id ? (
              <li key={c.id}>
                <ContactForm
                  initial={c}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(body) => handleUpdate(c.id, body)}
                />
              </li>
            ) : (
              <ContactRow
                key={c.id}
                contact={c}
                onEdit={() => setEditingId(c.id)}
                onDelete={() => handleDelete(c.id)}
              />
            ),
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function ContactRow({
  contact,
  onEdit,
  onDelete,
}: {
  contact: ApplicationContact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-md border bg-card/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="font-medium leading-tight">{contact.name}</div>
          {contact.role ? (
            <div className="text-xs text-muted-foreground">{contact.role}</div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1 text-xs text-foreground hover:underline"
              >
                <Mail className="h-3 w-3" />
                {contact.email}
              </a>
            ) : null}
            {contact.linkedin_url ? (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-foreground hover:underline"
              >
                <Linkedin className="h-3 w-3" />
                LinkedIn
              </a>
            ) : null}
          </div>
          {contact.notes ? (
            <p className="pt-1 text-xs text-muted-foreground whitespace-pre-wrap">
              {contact.notes}
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
    </li>
  );
}

function ContactForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: ApplicationContact;
  onCancel: () => void;
  onSubmit: (body: ApplicationContactCreateInput) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        role: role.trim() || null,
        email: email.trim() || null,
        linkedin_url: linkedin.trim() || null,
        notes: notes.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-md border bg-card/40 p-3"
    >
      <div>
        <Label htmlFor="c-name" className="mb-1 inline-block text-xs">Name</Label>
        <Input
          id="c-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="c-role" className="mb-1 inline-block text-xs">Role</Label>
        <Input
          id="c-role"
          placeholder="Recruiter, Hiring Manager, …"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="c-email" className="mb-1 inline-block text-xs">Email</Label>
        <Input
          id="c-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="c-linkedin" className="mb-1 inline-block text-xs">
          LinkedIn URL
        </Label>
        <Input
          id="c-linkedin"
          type="url"
          placeholder="https://www.linkedin.com/in/…"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="c-notes" className="mb-1 inline-block text-xs">Notes</Label>
        <Textarea
          id="c-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving…" : initial ? "Save" : "Add"}
        </Button>
      </div>
    </form>
  );
}
