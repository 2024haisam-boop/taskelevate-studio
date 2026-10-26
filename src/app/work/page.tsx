import type { Metadata } from "next";
import { hasOnlyExampleProjects, projects } from "@/data/projects";
import { TrackView } from "@/components/analytics/TrackView";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { PageHero } from "@/components/ui/PageHero";
import { ProjectGallery } from "@/components/work/ProjectGallery";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Work — SaaS Animation, 3D & Interactive Projects",
  description:
    "Selected work from Taskelevate Studios across SaaS animation, 3D product animation, interactive websites and video editing.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <TrackView event="work_viewed" />
      <PageHero
        label="Portfolio / All work"
        headline={"SELECTED\n*WORK.*"}
        description="Every frame, every interaction, every detail—crafted with intention."
      />
      <section aria-label="Projects" className="pb-[clamp(72px,10vw,152px)]">
        <div className="container-x">
          {hasOnlyExampleProjects && (
            <p className="mb-8 max-w-2xl rounded-2xl border border-dashed border-black/15 px-5 py-4 text-[0.9rem] leading-relaxed text-fg-2">
              Tiles marked <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg">Example</span> show how
              case studies are presented while published client work is being prepared.
            </p>
          )}
          <ProjectGallery projects={projects} syncUrl headingLevel="h2" />
        </div>
      </section>
      <ContactCTA location="work_cta" />
    </>
  );
}
