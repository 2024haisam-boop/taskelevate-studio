import type { Metadata } from "next";
import { getService, type ServiceSlug } from "@/data/services";
import { pageMetadata } from "./metadata";

export function serviceMetadata(slug: ServiceSlug): Metadata {
  const s = getService(slug);
  return pageMetadata({ title: s.page.metaTitle, description: s.page.metaDescription, path: s.href });
}
