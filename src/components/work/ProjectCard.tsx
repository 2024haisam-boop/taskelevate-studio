import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryLabel, type Project } from "@/data/projects";
import { cn } from "@/lib/utils/cn";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { ProjectArt } from "./ProjectArt";

export type CardShape = "landscape" | "portrait" | "wide" | "square";

const shapeClass: Record<CardShape, string> = {
  landscape: "aspect-[4/3] lg:aspect-[16/11]",
  portrait: "aspect-[4/3] md:aspect-[4/5]",
  wide: "aspect-[4/3] md:aspect-[21/10]",
  square: "aspect-square",
};

interface Props {
  project: Project;
  shape?: CardShape;
  headingLevel?: "h2" | "h3";
  sizes?: string;
  className?: string;
}

/** Project tile. No hover dependency: the whole card is one link and all info is always visible. */
export function ProjectCard({ project, shape = "landscape", headingLevel = "h3", sizes, className }: Props) {
  const Heading = headingLevel;
  // vertical footage always gets a portrait frame, whatever slot the grid gives it
  const portraitMedia = Boolean(project.thumbnail && project.thumbnail.height > project.thumbnail.width);
  return (
    <article data-card className={cn("group relative", className)}>
      <Link href={`/work/${project.slug}`} data-cursor="View" className="block rounded-[var(--radius-card)] focus-visible:outline-offset-4">
        <div data-scrub suppressHydrationWarning>
          <div
            className={cn(
              "scrub-mask relative overflow-hidden rounded-[var(--radius-card)] bg-bg-2",
              portraitMedia ? "aspect-[4/5]" : shapeClass[shape],
            )}
          >
            <div className="scrub-zoom">
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail.src}
                    alt={project.thumbnail.alt}
                    fill
                    sizes={sizes ?? "(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"}
                    className="object-cover"
                  />
                ) : (
                  <ProjectArt variant={project.art ?? "saas-dashboard"} uid={`card-${project.slug}`} />
                )}
                {project.previewVideo && <InViewVideo src={project.previewVideo} poster={project.thumbnail?.src ?? ""} rootMargin="300px" className="absolute inset-0" />}
              </div>
            </div>

            {/* lighting response */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgb(255_255_255/0.08),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2 md:left-5 md:top-5">
              <span className="chip bg-white/90">{categoryLabel(project.category)}</span>
              {project.isExample && (
                <span className="chip bg-lilac" title="Placeholder — replace with a real project">
                  Example
                </span>
              )}
            </div>

            <span
              aria-hidden="true"
              className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white text-fg md:right-5 md:top-5"
            >
              <ArrowUpRight className="size-[18px] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="scrub-text mt-5 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <Heading className="font-display text-ed-title font-medium text-fg">
                {project.title}
              </Heading>
              <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-relaxed text-fg-2">{project.description}</p>
            </div>
            <span className="label-mono mt-1.5 hidden shrink-0 items-center gap-1.5 text-fg-3 transition-colors group-hover:text-fg sm:inline-flex">
              Explore Project
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
