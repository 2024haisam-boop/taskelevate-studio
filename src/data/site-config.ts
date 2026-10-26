/**
 * Site-wide configuration.
 *
 * Every optional business detail is read from environment variables so nothing
 * is invented. A value that is missing simply hides the related UI (booking
 * buttons, social links, email links). See `.env.example`.
 */

function readUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function readEmail(value: string | undefined): string | null {
  if (!value) return null;
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export type AnalyticsProvider = "none" | "plausible" | "ga4";

function readAnalyticsProvider(value: string | undefined): AnalyticsProvider {
  return value === "plausible" || value === "ga4" ? value : "none";
}

const siteUrl = (readUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://studio.taskelevate.com").replace(/\/$/, "");

export const siteConfig = {
  name: "Taskelevate Studios",
  shortName: "Taskelevate Studios",
  parentBrand: {
    name: "Taskelevate",
    url: "https://taskelevate.com",
  },
  url: siteUrl,
  tagline: "CRAFTING THE UNEXPECTED.",
  description:
    "Taskelevate Studios creates premium SaaS animations, cinematic 3D visuals, interactive websites, and professional video content for ambitious brands.",
  footerDescription: "Creative technology, motion, and digital experiences.",
  locale: "en_US",

  /** Calendly (or other) scheduling link. Book-a-call buttons render ONLY when set. */
  bookingUrl: readUrl(process.env.NEXT_PUBLIC_BOOKING_URL),

  /** Public contact email. Email links render ONLY when set. */
  contactEmail: readEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),

  /** Social profiles. Each link renders ONLY when its URL is set. */
  social: {
    instagram: readUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    linkedin: readUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL),
  },

  /** Showreel video. The hero "Watch Reel" control renders ONLY when set. */
  showreel: {
    src: readUrl(process.env.NEXT_PUBLIC_SHOWREEL_URL) ?? (process.env.NEXT_PUBLIC_SHOWREEL_PATH || null),
    poster: process.env.NEXT_PUBLIC_SHOWREEL_POSTER || null,
  },

  analytics: {
    provider: readAnalyticsProvider(process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER),
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || null,
    plausibleScriptSrc: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC || "https://plausible.io/js/script.js",
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID || null,
  },

  /**
   * Trust & proof content. These sections stay hidden until REAL material is
   * supplied — never fill them with invented content. See ASSETS_NEEDED.md.
   */
  proof: {
    team: [] as TeamMember[],
    clientReferences: [] as ClientReference[],
  },
} as const;

export interface TeamMember {
  name: string;
  role: string;
  /** Path under /public, e.g. "/team/jane.jpg" */
  photo: string;
  photoAlt: string;
}

export interface ClientReference {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Written permission obtained to publish this reference. */
  approved: true;
}

export type SiteConfig = typeof siteConfig;
