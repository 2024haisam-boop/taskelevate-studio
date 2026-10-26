/** Analytics consent record (only used by providers that require consent, e.g. GA4). */
export type ConsentState = "granted" | "denied" | null;

const KEY = "tes.analytics-consent.v1";
export const CONSENT_EVENT = "tes:consent-change";

export function readConsent(): ConsentState {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(state: Exclude<ConsentState, null>): void {
  try {
    window.localStorage.setItem(KEY, state);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}
