"use client";

import { useState, type ComponentType } from "react";
import { CircleUser, ListChecks, PenLine, Target, type LucideProps } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FiltersPanel } from "@/components/settings/filters-panel";
import { CvPanel } from "@/components/settings/cv-panel";
import { CoverLetterPanel } from "@/components/settings/cover-letter-panel";
import { AccountPanel } from "@/components/settings/account-panel";

export type SettingsTab = "filters" | "fit" | "cover" | "account";

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: ComponentType<LucideProps> }[] = [
  { id: "filters", label: "Job filters", icon: ListChecks },
  { id: "fit", label: "Job fit", icon: Target },
  { id: "cover", label: "Cover letter", icon: PenLine },
  { id: "account", label: "Account", icon: CircleUser },
];

export function isSettingsTab(value: string | null | undefined): value is SettingsTab {
  return SETTINGS_TABS.some((t) => t.id === value);
}

/**
 * The single settings surface for canvasjob. Previously the Chrome extension
 * carried its own options page; having two of them confused people, so the
 * tabs live here and the extension deep-links into this dialog.
 */
export function SettingsDialog({
  open,
  onOpenChange,
  initialTab = "filters",
  userEmail,
  onAccountDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: SettingsTab;
  userEmail: string;
  onAccountDeleted: () => Promise<void>;
}) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Re-entering always lands on the tab the caller asked for, rather
        // than wherever the user happened to leave off last time.
        if (next) setTab(initialTab);
        onOpenChange(next);
      }}
    >
      {/* The panels are plain <button>s, which browsers give an arrow cursor.
          One scoped rule beats repeating cursor-pointer on every control (and
          covers whatever the Account tab grows into). Disabled controls are
          excluded so they keep their own not-allowed cursor. */}
      <DialogContent
        aria-describedby={undefined}
        className="flex h-[85vh] max-h-[85vh] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 [&_button:not(:disabled)]:cursor-pointer"
      >
        <div className="shrink-0 border-b px-6 pt-5">
          <DialogTitle className="mb-3">Settings</DialogTitle>
          {/* Tabs stay scrollable on a narrow viewport, but the bar itself is
              hidden — macOS "always show scroll bars" otherwise draws a track
              across the full width of the tab strip. */}
          <nav
            className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Settings sections"
          >
            {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} aria-hidden="true" /> {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-6">
          {tab === "filters" && <FiltersPanel />}
          {tab === "fit" && <CvPanel />}
          {tab === "cover" && <CoverLetterPanel />}
          {tab === "account" && (
            <AccountPanel userEmail={userEmail} onDeleted={onAccountDeleted} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
