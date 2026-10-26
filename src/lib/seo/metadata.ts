import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";

interface PageMetaInput {
  title: string;
  description: string;
  /** Route path beginning with "/" — used for the canonical URL */
  path: string;
  /** Use the title as-is instead of applying the "%s | Taskelevate Studios" template */
  absoluteTitle?: boolean;
  noIndex?: boolean;
}

/** Consistent per-page metadata: canonical, Open Graph and X/Twitter cards. */
export function pageMetadata({ title, description, path, absoluteTitle, noIndex }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
