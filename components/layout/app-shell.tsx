"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { CanvasjobLogo } from "@/components/brand/canvasjob-logo";
import { PlanBadge } from "@/components/layout/plan-badge";
import { AccountMenu, type AccountMenuMetrics } from "@/components/layout/account-menu";
import { AppSettingsProvider } from "@/components/layout/app-settings";

const NAV = [
  { href: "/app", label: "Tracker", icon: Briefcase },
];

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
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <AppSettingsProvider>
      <div className="min-h-screen bg-muted/30">
        <header className="sticky top-0 z-30 border-b bg-background">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-6">
              <Link href="/app" className="shrink-0 font-semibold">
                <CanvasjobLogo markClassName="h-7 w-7" />
              </Link>
              <nav className="flex min-w-0 items-center gap-1">
                {NAV.map(({ href, label, icon: Icon }) => {
                  const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors sm:px-3",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <PlanBadge plan={plan} href="/pricing" />
              <AccountMenu
                userEmail={userEmail}
                plan={plan}
                metrics={metrics}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </AppSettingsProvider>
  );
}
