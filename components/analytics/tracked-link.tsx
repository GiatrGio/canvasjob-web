"use client";

import { forwardRef, type ComponentProps } from "react";
import Link from "next/link";
import {
  trackAnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsEventParams,
} from "@/lib/analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  analyticsEvent: AnalyticsEventName;
  analyticsParams?: AnalyticsEventParams;
};

export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  function TrackedLink(
    { analyticsEvent, analyticsParams, onClick, ...props },
    ref,
  ) {
    return (
      <Link
        {...props}
        ref={ref}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            trackAnalyticsEvent(analyticsEvent, analyticsParams);
          }
        }}
      />
    );
  },
);
