"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/lib/plan";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { PlanBadge } from "@/components/layout/plan-badge";
import { AccountMenu, type AccountMenuMetrics } from "@/components/layout/account-menu";
import {
  SettingsDialog,
  isSettingsTab,
  type SettingsTab,
} from "@/components/settings/settings-dialog";

export function AppShell({
  children,
  userEmail,
  plan,
  metrics,
}: {
  children: React.ReactNode;
  userEmail: string;
  plan: Plan;
  metrics: AccountMenuMetrics;
}) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("filters");

  // Deep link from the Chrome extension: /app?settings=fit opens the dialog on
  // that tab. Read from `window` rather than useSearchParams so this component
  // doesn't drag the route into a Suspense boundary, then strip the param so a
  // refresh (or a back navigation) doesn't reopen the dialog.
  useEffect(() => {
    const url = new URL(window.location.href);
    const requested = url.searchParams.get("settings");
    if (requested === null) return;
    setSettingsTab(isSettingsTab(requested) ? requested : "filters");
    setSettingsOpen(true);
    url.searchParams.delete("settings");
    window.history.replaceState(null, "", url.toString());
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // The account is already gone server-side, so signOut() is only here to drop
  // the now-orphaned cookie session. It can fail against a deleted user — that
  // must not strand someone on an /app they no longer have an account for.
  async function handleAccountDeleted() {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore: leaving is what matters, and the session is invalid regardless.
    }
    setSettingsOpen(false);
    router.push("/");
    router.refresh();
  }

  function openSettings(tab: SettingsTab = "filters") {
    setSettingsTab(tab);
    setSettingsOpen(true);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <Link href="/app" className="shrink-0 font-semibold">
              <CanvasjobLogo markClassName="h-7 w-7" />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <PlanBadge plan={plan} href="/pricing" />
            <AccountMenu
              userEmail={userEmail}
              plan={plan}
              metrics={metrics}
              onSignOut={handleSignOut}
              onOpenSettings={() => openSettings()}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        initialTab={settingsTab}
        userEmail={userEmail}
        onAccountDeleted={handleAccountDeleted}
      />
    </div>
  );
}
