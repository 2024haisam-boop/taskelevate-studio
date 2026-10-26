"use client";

import { AnimatePresence, LazyMotion, m, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Project, ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils/cn";
import { ProjectCard, type CardShape } from "./ProjectCard";
import { ProjectFilters, type FilterValue } from "./ProjectFilters";

interface Props {
  projects: Project[];
  /** Max items shown for the active filter (homepage) */
  limit?: number;
  /** Mirror the active filter in ?category= (work index) */
  syncUrl?: boolean;
  headingLevel?: "h2" | "h3";
}

// Motion's layout/animation features load asynchronously — only the tiny `m` core ships up front.
const loadMotionFeatures = () => import("@/lib/animations/motion-features").then((mod) => mod.default);

const isCategory = (v: string | null, list: Project[]): v is ProjectCategory =>
  !!v && list.some((p) => p.category === v);

/**
 * Editorial, masonry-inspired grid. Rows alternate large (7/12) and medium (5/12) tiles,
 * with the right-hand tile offset for rhythm. Motion owns ONLY the outer <li>
 * (layout reflow + exit); the CSS reveal owns the inner wrapper — never the same element.
 */
export function ProjectGallery({ projects, limit, syncUrl = false, headingLevel = "h3" }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [interacted, setInteracted] = useState(false);
  const reduce = useReducedMotion();

  // Deep link support (/work?category=3d-animation) without making the page dynamic.
  useEffect(() => {
    if (!syncUrl) return;
    const initial = new URLSearchParams(window.location.search).get("category");
    if (isCategory(initial, projects)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
      setFilter(initial);
    }
  }, [syncUrl, projects]);

  const counts = useMemo(() => {
    const c = { all: projects.length } as Record<FilterValue, number>;
    for (const p of projects) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [projects]);

  const visible = useMemo(() => {
    const list = filter === "all" ? projects : projects.filter((p) => p.category === filter);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [filter, projects, limit]);

  const onChange = (next: FilterValue) => {
    setInteracted(true);
    setFilter(next);
    if (syncUrl) {
      const url = new URL(window.location.href);
      if (next === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", next);
      window.history.replaceState(null, "", url);
    }
  };

  const layoutFor = (i: number): { span: string; shape: CardShape; offset: string } => {
    const pos = i % 4;
    const large = pos === 0 || pos === 3;
    return {
      span: large ? "lg:col-span-7" : "lg:col-span-5",
      shape: large ? "landscape" : "portrait",
      offset: pos === 1 || pos === 3 ? "lg:mt-28" : "",
    };
  };

  return (
    <div>
      <ProjectFilters value={filter} onChange={onChange} counts={counts} />

      <p className="sr-only" aria-live="polite">
        {`Showing ${visible.length} ${visible.length === 1 ? "project" : "projects"}`}
      </p>

      <LazyMotion features={loadMotionFeatures} strict>
      <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:mt-16 md:grid-cols-2 md:gap-y-16 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => {
            const l = layoutFor(i);
            return (
              <m.li
                key={project.slug}
                layout={!reduce}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(l.span, l.offset)}
              >
                <div data-reveal={interacted ? undefined : "card"} suppressHydrationWarning style={{ ["--reveal-delay" as string]: `${(i % 2) * 90}ms` }}>
                  <ProjectCard
                    project={project}
                    shape={l.shape}
                    headingLevel={headingLevel}
                    sizes={l.shape === "landscape" ? "(min-width: 1024px) 56vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"}
                  />
                </div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>
      </LazyMotion>
    </div>
  );
}
