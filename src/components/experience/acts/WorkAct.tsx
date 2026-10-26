"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { getClip } from "@/data/media";
import { categoryLabel, hasOnlyExampleProjects, projects } from "@/data/projects";
import { scrollForTrack, stepped } from "@/components/world/world";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { useAct } from "../useAct";

/**
 * ACT 5 — THE GALLERY HALL. Project screens hang on both walls; the camera walks the hall and turns to each one
 * while its title, category and link appear here. The index on the right jumps straight to any project.
 */
export function WorkAct() {
  const ref = useRef<HTMLElement>(null);
  const n = projects.length;

  useAct("work", ref, (ap) => {
    const section = ref.current;
    if (!section) return;
    const active = Math.round(stepped(ap * (n - 1) * 0.999));
    const key = String(active);
    if (section.dataset.active === key) return;
    section.dataset.active = key;
    section.querySelectorAll<HTMLElement>("[data-step]").forEach((el, i) => (el.dataset.on = String(i === active)));
    section.querySelectorAll<HTMLElement>("[data-index]").forEach((el, i) => (el.dataset.on = String(i === active)));
  });

  const jump = (i: number) => {
    if (document.documentElement.dataset.world === "off") return;
    window.scrollTo({ top: scrollForTrack("work", i / (n - 1)), behavior: "smooth" });
  };

  return (
    <section ref={ref} id="work" data-act="work" aria-labelledby="work-title" className="act relative h-[420svh]" data-active="0">
      <div className="act-stage pointer-events-none sticky top-0 flex h-[100svh] flex-col justify-end pb-[calc(env(safe-area-inset-bottom,0px)+28px)] md:pb-12">
        <div aria-hidden="true" className="world-on-only absolute inset-x-0 bottom-0 -z-[1] h-[52%] bg-gradient-to-t from-bg via-bg/75 to-transparent" />
        <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-[620px] flex-1">
            <p className="label-mono flex items-center gap-3 text-fg-2">
              <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-violet-bright to-blue" />
              04 / Selected work
            </p>
            <h2 id="work-title" className="sr-only">
              Selected work
            </h2>
            <ol className="work-steps relative mt-5">
              {projects.map((p, i) => {
                const clip = p.clip ? getClip(p.clip) : null;
                return (
                  <li key={p.slug} data-step data-on={i === 0} className="service-step" onFocus={() => jump(i)}>
                    {clip && (
                      <div className="world-off-only mb-5 aspect-video overflow-hidden rounded-[22px] border border-white/10">
                        <InViewVideo src={clip.src} poster={clip.poster} />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip glass glass-subtle border-0 text-fg">{categoryLabel(p.category)}</span>
                      {p.isExample && <span className="chip border-dashed border-white/25 bg-bg/60 text-fg-2">Example</span>}
                    </div>
                    <h3 className="mt-3 font-display text-[clamp(1.9rem,4.6vw,3.6rem)] font-bold uppercase leading-[0.95] tracking-[-0.035em] text-fg">
                      {p.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 max-w-[48ch] text-[0.98rem] text-fg-2">{p.description}</p>
                    <Link
                      href={`/work/${p.slug}`}
                      data-cursor="View"
                      className="pointer-events-auto mt-4 inline-flex min-h-11 items-center gap-2 rounded-full text-[0.95rem] font-semibold text-fg underline-offset-4 hover:underline"
                    >
                      View case
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="world-on-only flex shrink-0 flex-col items-start gap-5 md:items-end">
            <ol aria-label="Jump to project" className="pointer-events-auto hidden flex-col items-end gap-1 md:flex">
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <button type="button" data-index data-on={i === 0} onClick={() => jump(i)} className="work-index">
                    <span className="font-mono text-[0.7rem]">{String(i + 1).padStart(2, "0")}</span>
                    {p.title}
                  </button>
                </li>
              ))}
            </ol>
            <ButtonLink href="/work" variant="glass" size="sm" className="pointer-events-auto">
              View all work
            </ButtonLink>
          </div>
        </div>
        {hasOnlyExampleProjects && (
          <p className="container-x label-mono mt-5 normal-case tracking-[0.04em] text-fg-3">
            Screens marked “Example” show the case-study format while published client work is being prepared.
          </p>
        )}
      </div>
    </section>
  );
}
