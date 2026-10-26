import { siteConfig } from "@/data/site-config";
import { attributionEventProps } from "./attribution";
import { readConsent } from "./consent";

/** The only events this site records (brief §21). */
export type AnalyticsEvent =
  | "work_viewed"
  | "service_viewed"
  | "project_opened"
  | "project_inquiry_started"
  | "project_inquiry_submitted"
  | "booking_clicked";

export type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function compact(props: EventProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined) out[k] = v;
  return out;
}

/**
 * Provider-agnostic event tracking.
 * - provider "none": no network calls (events are logged in development only)
 * - "plausible": cookie-less, sent when the Plausible script is loaded
 * - "ga4": sent only after the visitor has granted consent
 */
export function track(event: AnalyticsEvent, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  const payload = compact({ ...props, ...attributionEventProps() });
  const { provider } = siteConfig.analytics;

  try {
    if (provider === "plausible" && typeof window.plausible === "function") {
      window.plausible(event, { props: payload });
    } else if (provider === "ga4" && readConsent() === "granted" && typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }
  } catch {
    /* analytics must never break the page */
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event, payload);
  }
  window.dispatchEvent(new CustomEvent("tes:analytics", { detail: { event, props: payload } }));
}
