import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { pageMetadata } from "@/lib/seo/metadata";
import { HeroStory } from "@/components/landing/HeroStory";
import { WhatWeDo } from "@/components/landing/WhatWeDo";
import { WorkGrid } from "@/components/landing/WorkGrid";
import { ApproachSlider } from "@/components/landing/ApproachSlider";
import { PlayChips } from "@/components/landing/PlayChips";
import { StudioNotes } from "@/components/landing/StudioNotes";
import { NewsToast } from "@/components/landing/NewsToast";

export const metadata: Metadata = pageMetadata({
  title: "Taskelevate Studios | SaaS Animation, 3D & Creative Technology",
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

/**
 * Home v4 — editorial (client request 2026-10-26: the afternow.co format, our own content):
 * drone-shot hero (studio layer) → what we do (statement fill + capability wheel) → work grid → approach slider →
 * physics chips → studio notes.
 * (v3's 3D world lives on in components/world + components/experience; see docs/REDESIGN-v3.md.)
 */
export default function HomePage() {
  return (
    <>
      <HeroStory />
      <WhatWeDo />
      <div className="shell flex flex-col gap-[clamp(88px,9vw,140px)] pb-[clamp(88px,9vw,140px)] pt-[clamp(40px,4vw,64px)]">
        <WorkGrid />
        <ApproachSlider />
        <PlayChips />
        <StudioNotes />
      </div>
      <NewsToast />
    </>
  );
}
