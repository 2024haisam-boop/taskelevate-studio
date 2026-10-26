import { hasOnlyExampleProjects, projects } from "@/data/projects";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectGallery } from "@/components/work/ProjectGallery";

/** SECTION 3 — Selected work (brief §10). */
export function SelectedWork() {
  const ordered = [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return (
    <section id="work" aria-labelledby="work-title" className="section-y relative">
      <div className="container-x">
        <SectionHeading
          id="work-title"
          label="02 / Selected work"
          headline={"PROOF IS\nIN THE *PIXELS.*"}
          description="Every frame, every interaction, every detail—crafted with intention."
        />
        {hasOnlyExampleProjects && (
          <p className="label-mono mt-10 max-w-2xl normal-case tracking-[0.04em] text-fg-3" data-reveal suppressHydrationWarning>
            Tiles marked “Example” show the case-study format while published work is being prepared.
          </p>
        )}
        <div className="mt-10 md:mt-14">
          <ProjectGallery projects={ordered} limit={6} />
        </div>
        <div className="mt-16 flex justify-center md:mt-24" data-reveal suppressHydrationWarning>
          <ButtonLink href="/work" variant="glass" size="lg">
            View All Work
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
