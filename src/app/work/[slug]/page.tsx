import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { categoryLabel, getProject, getRelatedProjects, projects, type ProjectCategory } from "@/data/projects";
import type { ServiceSlug } from "@/data/services";
import { TrackView } from "@/components/analytics/TrackView";
import { GlassProjectPanel } from "@/components/glass/GlassPanel";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { Headline } from "@/components/ui/Headline";
import { ProjectArt } from "@/components/work/ProjectArt";
import { ProjectCard } from "@/components/work/ProjectCard";
import { FilmWall } from "@/components/work/FilmWall";
import { saasFilms } from "@/data/saas-films";
import { pageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title} — ${categoryLabel(project.category)}`,
    description: project.description,
    path: `/work/${project.slug}`,
    // Example layouts shouldn't be indexed as real case studies.
    noIndex: project.isExample,
  });
}

const categoryToService: Record<ProjectCategory, ServiceSlug> = {
  "saas-animation": "saas-animation",
  "3d-animation": "3d-animation",
  "web-experiences": "interactive-websites",
  "video-editing": "video-editing",
};

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  // Size the player to the footage: vertical edits get a phone-shaped frame, landscape films their own ratio.
  const media = project.thumbnail;
  const mediaRatio = media ? media.width / media.height : undefined;
  const mediaPortrait = Boolean(media && media.height > media.width);

  const related = getRelatedProjects(project, 3);
  const meta = [
    project.client && { k: "Client", v: project.client },
    project.year && { k: "Year", v: String(project.year) },
    { k: "Discipline", v: categoryLabel(project.category) },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <>
      <TrackView event="project_opened" props={{ project: project.slug, category: project.category }} />

      <article>
        <header className="container-x pt-[calc(var(--nav-top)+var(--nav-h)+clamp(40px,7vw,96px))]">
          <Link href="/work" className="label-mono group inline-flex min-h-11 items-center gap-2 text-fg-3 transition-colors hover:text-fg">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            All work
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="chip text-fg">{categoryLabel(project.category)}</span>
            {project.isExample && <span className="chip border-dashed text-fg-2">Example</span>}
          </div>
          <Headline as="h1" id="page-title" text={project.title.toUpperCase()} entrance className="mt-6 max-w-5xl text-display-lg" />
          <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-12">
            <p className="text-lead text-fg-2 md:col-span-7">{project.description}</p>
            <GlassProjectPanel items={meta} className="md:col-span-5" />
          </div>
        </header>

        {project.isExample && (
          <div className="container-x mt-10">
            <p role="note" className="rounded-2xl border border-dashed border-black/15 px-5 py-4 text-[0.9rem] leading-relaxed text-fg-2">
              This is an example layout showing how a {categoryLabel(project.category).toLowerCase()} case study is presented.
              It does not describe a real client project.
            </p>
          </div>
        )}

        {/* Visual media */}
        <div className="container-x mt-10 md:mt-14">
          <div
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-card)] bg-bg-2",
              mediaPortrait ? "mx-auto w-[min(100%,440px)]" : !mediaRatio && "aspect-[4/3] md:aspect-[16/9]",
            )}
            style={mediaRatio ? { aspectRatio: mediaRatio } : undefined}
          >
            {project.fullVideo ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster={project.fullVideo.poster}
                className="absolute inset-0 h-full w-full bg-black object-contain"
              >
                <source src={project.fullVideo.src} />
                {project.fullVideo.captions && <track kind="captions" src={project.fullVideo.captions} srcLang="en" label="English" default />}
              </video>
            ) : project.thumbnail ? (
              <Image src={project.thumbnail.src} alt={project.thumbnail.alt} fill sizes="100vw" className="object-cover" loading="eager" />
            ) : (
              <ProjectArt variant={project.art ?? "saas-dashboard"} uid={`hero-${project.slug}`} title={`${project.title} — illustrative placeholder`} />
            )}
          </div>
        </div>

        {/* Overview + services */}
        {(project.overview || project.services?.length) && (
          <section aria-labelledby="overview-title" className="container-x section-y grid gap-10 lg:grid-cols-12">
            <h2 id="overview-title" className="label-mono text-fg-3 lg:col-span-3 lg:pt-2">
              Overview
            </h2>
            <div className="lg:col-span-9">
              {project.overview && (
                <p className="font-display text-[clamp(1.35rem,2.6vw,2.25rem)] font-medium leading-[1.22] tracking-[-0.02em] text-fg" data-reveal suppressHydrationWarning>
                  {project.overview}
                </p>
              )}
              {project.services?.length ? (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label="Services" data-reveal suppressHydrationWarning>
                  {project.services.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        )}

        {project.objectives?.length ? (
          <section aria-labelledby="objectives-title" className="container-x grid gap-10 border-t border-line py-[clamp(56px,7vw,100px)] lg:grid-cols-12">
            <h2 id="objectives-title" className="label-mono text-fg-3 lg:col-span-3">
              Objectives
            </h2>
            <ul className="grid gap-4 lg:col-span-9">
              {project.objectives.map((o) => (
                <li key={o} className="text-lead text-fg-2">
                  {o}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.films === "saas" && (
          <section aria-labelledby="films-title" className="container-x section-y border-t border-line">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="films-title" className="label-mono text-fg-3">
                The films · {saasFilms.length}
              </h2>
              <p className="max-w-[52ch] text-[0.9rem] text-fg-3">Tap a film to watch it with sound. Pieces tagged “Concept” are self-initiated and were not made for the brand shown.</p>
            </div>
            <FilmWall films={saasFilms} className="mt-10" />
          </section>
        )}

        {project.process?.length ? (
          <section aria-labelledby="approach-title" className="border-t border-line bg-bg-2/40">
            <div className="container-x section-y grid gap-10 lg:grid-cols-12">
              <h2 id="approach-title" className="label-mono text-fg-3 lg:col-span-3">
                {project.isExample ? "Typical approach" : "Creative approach"}
              </h2>
              <ol className="grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-3 lg:col-span-9">
                {project.process.map((step, i) => (
                  <li key={step.title} className="bg-bg p-7" data-reveal suppressHydrationWarning>
                    <span className="label-mono text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-8 font-display text-xl font-semibold tracking-[-0.02em] text-fg">{step.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-fg-2">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {/* Final showcase — real media only */}
        {project.gallery?.length ? (
          <section aria-labelledby="showcase-title" className="container-x section-y">
            <h2 id="showcase-title" className="label-mono text-fg-3">
              Final showcase
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {project.gallery.map((img, i) => (
                <div key={img.src} className={i % 3 === 0 ? "md:col-span-2" : undefined} data-reveal="card" suppressHydrationWarning>
                  <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 768px) 50vw, 100vw" className="h-auto w-full rounded-[22px] border border-line" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {project.outcome && (
          <section aria-labelledby="outcome-title" className="container-x grid gap-10 border-t border-line py-[clamp(56px,7vw,100px)] lg:grid-cols-12">
            <h2 id="outcome-title" className="label-mono text-fg-3 lg:col-span-3">
              Outcome
            </h2>
            <p className="text-lead text-fg lg:col-span-9">{project.outcome}</p>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line">
          <div className="container-x section-y">
            <h2 id="related-title" className="label-mono text-fg-3">
              Related projects
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
              {related.map((p) => (
                <div key={p.slug} data-reveal="card" suppressHydrationWarning>
                  <ProjectCard project={p} shape="square" sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactCTA
        label="Next project"
        headline={"HAVE SOMETHING\n*SIMILAR?*"}
        service={categoryToService[project.category]}
        location="project_cta"
      />
    </>
  );
}
