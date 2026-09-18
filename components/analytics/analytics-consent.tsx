"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Button } from "@/components/ui/button";
import {
  type AnalyticsConsent,
  readAnalyticsConsent,
  saveAnalyticsConsent,
} from "@/lib/analytics";

type ConsentState = AnalyticsConsent | "initializing" | "undecided";

export function AnalyticsConsentGate({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>("initializing");
  const privateRoute =
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth/");

  useEffect(() => {
    setConsent(readAnalyticsConsent() ?? "undecided");
  }, []);

  useEffect(() => {
    window[`ga-disable-${gaId}`] = consent !== "granted" || privateRoute;
  }, [consent, gaId, privateRoute]);

  function choose(nextConsent: AnalyticsConsent) {
    saveAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
  }

  return (
    <>
      {consent === "granted" && !privateRoute ? (
        <GoogleAnalytics gaId={gaId} />
      ) : null}

      {consent === "undecided" ? (
        <aside
          aria-label="Analytics preferences"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-xl border bg-background p-4 shadow-2xl sm:flex sm:items-center sm:gap-5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Help us improve canvasjob</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              With your permission, Google Analytics measures visits to public pages
              and actions such as opening the Chrome Web Store. We never send job,
              CV, filter, or account content. Read our{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                privacy policy
              </Link>
              .
            </p>
          </div>
          <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => choose("denied")}
            >
              Reject
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => choose("granted")}
            >
              Accept analytics
            </Button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
