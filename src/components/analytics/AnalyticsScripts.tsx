"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { siteConfig } from "@/data/site-config";
import { CONSENT_EVENT, readConsent, writeConsent, type ConsentState } from "@/lib/analytics/consent";

function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};

/**
 * Loads an analytics provider ONLY when configured.
 * - plausible: cookie-less, loads directly.
 * - ga4: loads only after explicit consent (banner shown until the visitor chooses).
 */
export function AnalyticsScripts() {
  const { provider, plausibleDomain, plausibleScriptSrc, ga4Id } = siteConfig.analytics;
  const consent = useSyncExternalStore<ConsentState | "unknown">(subscribeConsent, readConsent, () => "unknown");
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (provider === "plausible" && plausibleDomain) {
    return (
      <>
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible = window.plausible || function(){(window.plausible.q = window.plausible.q || []).push(arguments)}`}
        </Script>
        <Script src={plausibleScriptSrc} data-domain={plausibleDomain} strategy="afterInteractive" />
      </>
    );
  }

  if (provider !== "ga4" || !ga4Id) return null;

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', ${JSON.stringify(ga4Id)}, { anonymize_ip: true });`}
          </Script>
        </>
      )}
      {hydrated && consent === null && <ConsentBanner />}
    </>
  );
}

function ConsentBanner() {
  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="glass glass-strong fixed bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] left-4 right-4 z-[60] max-w-md rounded-[var(--radius-glass)] p-5 sm:left-6 sm:right-auto"
    >
      <p className="text-sm leading-relaxed text-fg-2">
        May we use analytics to understand which pages are useful? No advertising, and nothing is collected unless you
        agree.{" "}
        <a href="/privacy" className="text-fg underline underline-offset-4">
          Privacy policy
        </a>
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn btn-primary btn-sm flex-1" onClick={() => writeConsent("granted")}>
          Allow analytics
        </button>
        <button type="button" className="btn glass btn-glass btn-sm flex-1" onClick={() => writeConsent("denied")}>
          Decline
        </button>
      </div>
    </div>
  );
}
