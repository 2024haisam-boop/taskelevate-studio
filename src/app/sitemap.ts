import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${siteConfig.url}${path}`;
  return [
    { url: url("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: url("/work"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...services.map((s) => ({ url: url(s.href), lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: url("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    // Example layouts are noindex — only real case studies belong in the sitemap.
    ...projects.filter((p) => !p.isExample).map((p) => ({ url: url(`/work/${p.slug}`), lastModified: now, priority: 0.7 })),
    { url: url("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: url("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
