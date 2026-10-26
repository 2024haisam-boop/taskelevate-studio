import { services } from "./services";
import { siteConfig } from "./site-config";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export const primaryNav = {
  work: { label: "Work", href: "/work" },
  services: { label: "Services" },
  studio: { label: "Studio", href: "/about" },
  contact: { label: "Contact", href: "/contact" },
  cta: { label: "Start a Project", href: "/contact" },
} as const;

export const serviceLinks = services.map((s) => ({
  label: s.label,
  href: s.href,
  blurb: s.blurb,
  icon: s.icon,
  index: s.index,
}));

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Work", href: "/work" },
      { label: "Studio", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: services.map((s) => ({ label: s.label, href: s.href })),
  },
  {
    title: "Connect",
    // Only configured channels appear — nothing is invented.
    links: [
      ...(siteConfig.social.instagram ? [{ label: "Instagram", href: siteConfig.social.instagram, external: true }] : []),
      ...(siteConfig.social.linkedin ? [{ label: "LinkedIn", href: siteConfig.social.linkedin, external: true }] : []),
      ...(siteConfig.contactEmail ? [{ label: "Email", href: `mailto:${siteConfig.contactEmail}`, external: true }] : []),
      { label: "Start a Project", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Taskelevate", href: siteConfig.parentBrand.url, external: true },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
