/**
 * Campaign attribution (brief §21).
 *
 * Privacy: only UTM values, the landing path and the referring *hostname* are
 * kept, in sessionStorage (cleared when the tab session ends). No cookies, no
 * identifiers, no personal data. Attribution is attached to the inquiry the
 * visitor chooses to send, and nowhere else.
 */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landingPath?: string;
  referrerHost?: string;
  capturedAt?: string;
}

const STORAGE_KEY = "tes.attribution.v1";
const MAX_LEN = 120;

function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const v = value.trim().slice(0, MAX_LEN).replace(/[^\w\-.~+%@:/ ]/g, "");
  return v.length ? v : undefined;
}

function safeStorage(): Storage | null {
  try {
    const s = window.sessionStorage;
    const probe = "__tes_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/**
 * Called on every navigation. Stores attribution when the URL carries UTM
 * parameters (latest campaign wins). Without UTMs, an existing record is kept;
 * if none exists, the landing path + referrer host are recorded once so organic
 * inquiries still show which page they started on.
 */
export function captureAttribution(href: string): void {
  const storage = safeStorage();
  if (!storage) return;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return;
  }

  const utms: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const v = clean(url.searchParams.get(key));
    if (v) utms[key] = v;
  }

  const hasUtm = Object.keys(utms).length > 0;
  const existing = readAttribution();
  if (!hasUtm && existing) return;

  let referrerHost: string | undefined;
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.host !== url.host) referrerHost = ref.hostname;
    }
  } catch {
    /* ignore */
  }

  const record: Attribution = {
    ...utms,
    landingPath: url.pathname.slice(0, MAX_LEN),
    referrerHost,
    capturedAt: new Date().toISOString(),
  };

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* storage full or blocked — attribution is best-effort */
  }
}

/** Minimal UTM subset attached to analytics events. */
export function attributionEventProps(): Record<string, string> {
  const a = readAttribution();
  if (!a) return {};
  const props: Record<string, string> = {};
  if (a.utm_source) props.utm_source = a.utm_source;
  if (a.utm_medium) props.utm_medium = a.utm_medium;
  if (a.utm_campaign) props.utm_campaign = a.utm_campaign;
  return props;
}
