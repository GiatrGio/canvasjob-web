"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/core";

// What the user is told will go. Mirrors the cascade in the backend's
// AccountService — keep the two in step if a user-owned table is added.
const DELETED_DATA = [
  "Your filter profiles and every filter in them",
  "Your CV profile and all job fit results",
  "Your cover letter details and instructions",
  "Every tracked job, plus its contacts and interviews",
  "Your usage history and your sign-in itself",
];

export function AccountPanel({
  userEmail,
  onDeleted,
}: {
  userEmail: string;
  // Runs once the account is gone: clears the local session and leaves /app,
  // which no longer has an account behind it.
  onDeleted: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing the address beats an "are you sure?" here — this cannot be undone
  // and the dialog is two clicks away from anywhere in the app.
  const confirmed = typed.trim().toLowerCase() === userEmail.trim().toLowerCase();

  async function deleteAccount() {
    if (!confirmed || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteAccount();
    } catch (err) {
      setDeleting(false);
      setError(err instanceof ApiError ? err.message : String(err));
      return;
    }
    await onDeleted();
  }

  return (
    <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <Trash2 size={18} className="text-destructive" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">Delete account</h2>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Permanently delete <span className="font-medium text-foreground">{userEmail}</span> and
        everything stored against it. This cannot be undone, and we can&apos;t recover it for you
        afterwards.
      </p>

      <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={15}
            className="mt-0.5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">What gets deleted</p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
              {DELETED_DATA.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              An active subscription is cancelled first, so you won&apos;t be charged again.
              Invoices already issued stay with our payment provider, which is required to keep
              them for tax purposes.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {confirming ? (
        <div className="mt-4">
          <label className="block">
            <span className="mb-1 block text-sm text-foreground">
              Type <span className="font-medium">{userEmail}</span> to confirm
            </span>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={userEmail}
              autoComplete="off"
              spellCheck={false}
              className="h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
            />
          </label>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={deleteAccount}
              disabled={!confirmed || deleting}
              className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setTyped("");
                setError(null);
              }}
              disabled={deleting}
              className="rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={14} aria-hidden="true" /> Delete account
        </button>
      )}
    </div>
  );
}
