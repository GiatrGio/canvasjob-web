"use client";

import { clearAnalyticsConsent } from "@/lib/analytics";

export function AnalyticsPreferencesButton() {
  function reopenPreferences() {
    clearAnalyticsConsent();
    window.location.reload();
  }

  return (
    <button
      type="button"
      className="font-medium text-foreground underline underline-offset-4"
      onClick={reopenPreferences}
    >
      Change analytics preferences
    </button>
  );
}
