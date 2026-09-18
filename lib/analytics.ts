"use client";

import { sendGAEvent } from "@next/third-parties/google";

export const ANALYTICS_CONSENT_KEY = "canvasjob.analytics-consent";

export type AnalyticsConsent = "granted" | "denied";

export type AnalyticsEventName =
  | "extension_install_clicked"
  | "sign_up_started"
  | "login_started"
  | "begin_checkout"
  | "billing_portal_opened";

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | undefined
>;

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveAnalyticsConsent(consent: AnalyticsConsent) {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // Storage may be unavailable in private browsing. The in-memory consent
    // state still controls analytics for the current page.
  }
}

export function clearAnalyticsConsent() {
  try {
    window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  } catch {
    // A reload still reopens the banner when storage is unavailable.
  }
}

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  params: AnalyticsEventParams = {},
) {
  if (readAnalyticsConsent() !== "granted") return;
  sendGAEvent("event", name, params);
}
