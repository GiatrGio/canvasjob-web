"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  CircleArrowUp,
  CircleUser,
  LogOut,
  PenLine,
  Settings,
  type LucideProps,
} from "lucide-react";
import type { Plan } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/components/layout/app-settings";

export type AccountMenuMetrics = {
  evaluations: {
    used: number;
    limit: number;
    period: string;
  };
  coverLetters: {
    used: number;
    limit: number;
  };
  trackedJobs: {
    used: number;
    limit: number | null;
  };
};

type MenuIcon = ComponentType<LucideProps>;

export function AccountMenu({
  userEmail,
  plan,
  metrics,
  onSignOut,
}: {
  userEmail: string;
  plan: Plan;
  metrics: AccountMenuMetrics;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showBreakdown, setShowBreakdown } = useAppSettings();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        onClick={() => setOpen((current) => !current)}
        className="h-9 w-9 rounded-full"
      >
        <CircleUser className="h-5 w-5" aria-hidden="true" />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="User settings"
          className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border bg-popover p-3 text-popover-foreground shadow-xl"
        >
          <p className="truncate px-2 pb-3 text-sm font-medium text-muted-foreground">
            {userEmail}
          </p>

          <MenuSection>
            <MetricRow
              icon={ChartNoAxesColumnIncreasing}
              label="Job evaluations"
              used={metrics.evaluations.used}
              limit={plan === "pro" ? null : metrics.evaluations.limit}
              unlimitedLabel="Unlimited this month"
            />
            <MetricRow
              icon={PenLine}
              label="Cover letters"
              used={metrics.coverLetters.used}
              limit={metrics.coverLetters.limit}
              unlimitedLabel="Unlimited this month"
            />
            <MetricRow
              icon={BriefcaseBusiness}
              label="Jobs tracking"
              used={metrics.trackedJobs.used}
              limit={metrics.trackedJobs.limit}
              unlimitedLabel="Unlimited tracked jobs"
            />
            <MenuLink href="/pricing" icon={CircleArrowUp} onNavigate={() => setOpen(false)}>
              Upgrade plan
            </MenuLink>
          </MenuSection>

          <MenuSection>
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={showBreakdown}
              className="flex h-11 w-full items-center gap-3 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">Show breakdown</span>
              <Switch checked={showBreakdown} />
            </button>
          </MenuSection>

          <MenuSection>
            <button
              type="button"
              role="menuitem"
              className="flex h-11 w-full items-center gap-3 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={async () => {
                setOpen(false);
                await onSignOut();
              }}
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </MenuSection>
        </div>
      ) : null}
    </div>
  );
}

function MenuSection({ children }: { children: ReactNode }) {
  return <div className="border-t py-2 first:border-t-0 first:pt-0 last:pb-0">{children}</div>;
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onNavigate,
}: {
  href: string;
  icon: MenuIcon;
  children: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex h-11 items-center gap-3 rounded-md px-2 text-sm transition-colors hover:bg-accent"
      onClick={onNavigate}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

function MetricRow({
  icon: Icon,
  label,
  used,
  limit,
  unlimitedLabel,
}: {
  icon: MenuIcon;
  label: string;
  used: number;
  limit: number | null;
  unlimitedLabel: string;
}) {
  const hasLimit = typeof limit === "number";
  const progress = hasLimit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="rounded-md px-2 py-2">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm">{label}</span>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {hasLimit ? `${used} / ${limit}` : `${used} used`}
            </span>
          </div>
          {hasLimit ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">{unlimitedLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </span>
  );
}
