"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { getClip } from "@/data/media";
import { categoryLabel, hasOnlyExampleProjects, projects } from "@/data/projects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Headline } from "@/components/ui/Headline";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectArt } from "@/components/work/ProjectArt";

/**
 * BEAT 5 — work on a 3D rail. Desktop: vertical scroll drives a horizontal track (sticky stage, native scroll).
 * Mobile: native horizontal swipe with snap. Cards turn toward you as they pass the centre (coverflow depth).
 */
export function WorkRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  // Layout is chosen by CSS media queries (identical on server and client → no layout shift);
  // this only decides whether the JS scroll-driven travel runs.
  const desktop = useMediaQuery("(min-width: 768px)", false);
  const reduce = useReducedMotion();
  const pinned = desktop && !reduce;
  const items = [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-rail-card]"));
    let raf = 0;

    const layout = () => {
      // Desktop: the section is exactly tall enough to scroll the whole track past once.
      section.style.height = pinned ? `${window.innerHeight + Math.max(0, track.scrollWidth - viewport.clientWidth)}px` : "";
    };

    const read = () => {
      raf = 0;
      if (pinned) {
        const total = Math.max(1, section.offsetHeight - window.innerHeight);
        const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
        track.style.transform = `translate3d(${(-p * Math.max(0, track.scrollWidth - viewport.clientWidth)).toFixed(1)}px,0,0)`;
      }
      const vw = viewport.clientWidth;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const o = Math.max(-1.2, Math.min(1.2, (r.left + r.width / 2 - vw / 2) / (vw / 2)));
        c.style.setProperty("--o", o.toFixed(3));
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    const onResize = () => {
      layout();
      on();
    };
    layout();
    read();
    window.addEventListener("scroll", on, { passive: true });
    viewport.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", on);
      viewport.removeEventListener("scroll", on);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      section.style.height = "";
      track.style.transform = "";
    };
  }, [pinned]);

  return (
    <section ref={sectionRef} id="work" aria-labelledby="work-title" className="relative">
      <div className="py-[clamp(72px,10vw,140px)] md:sticky md:top-0 md:flex md:h-[100svh] md:flex-col md:justify-center md:overflow-hidden md:py-0 md:motion-reduce:static md:motion-reduce:h-auto md:motion-reduce:py-[clamp(72px,10vw,140px)]">
        <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5">
            <SectionLabel>02 / Selected work</SectionLabel>
            <Headline id="work-title" text={"PROOF IS IN\nTHE *PIXELS.*"} className="text-display-lg" />
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <p className="label-mono text-fg-3">
              <span className="md:hidden">Swipe to explore →</span>
              <span className="hidden md:inline">Scroll to travel →</span>
            </p>
            <ButtonLink href="/work" variant="glass" size="sm">
              View all work
            </ButtonLink>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="no-scrollbar mt-8 snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:mt-12 md:snap-none md:overflow-visible md:motion-reduce:snap-x md:motion-reduce:overflow-x-auto"
        >
          <ul ref={trackRef} className="flex w-max gap-5 px-5 [perspective:1600px] md:gap-8 md:px-[8vw] md:will-change-transform">
            {items.map((p) => {
              const clip = p.clip ? getClip(p.clip) : null;
              return (
                <li key={p.slug} data-rail-card className="w-[82vw] shrink-0 snap-center [--o:0] sm:w-[60vw] md:w-[min(40vw,600px)]">
                  <Link
                    href={`/work/${p.slug}`}
                    data-card
                    data-cursor="View"
                    className="group block rounded-[26px] [transform-style:preserve-3d]"
                    style={{
                      transform:
                        "rotateY(calc(var(--o) * -14deg)) translateZ(calc(max(var(--o), calc(var(--o) * -1)) * -70px)) scale(calc(1 - max(var(--o), calc(var(--o) * -1)) * 0.05))",
                    }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/10 bg-bg-2">
                      {clip ? (
                        <InViewVideo src={clip.src} poster={clip.poster} className="transition-transform duration-[1000ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
                      ) : (
                        <ProjectArt variant={p.art ?? "saas-dashboard"} uid={`rail-${p.slug}`} />
                      )}
                      <div className="absolute left-4 top-4 flex gap-2">
                        <span className="chip glass glass-subtle border-0 text-fg">{categoryLabel(p.category)}</span>
                        {p.isExample && <span className="chip border-dashed border-white/25 bg-bg/60 text-fg-2">Example</span>}
                      </div>
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-fg md:text-2xl">{p.title}</h3>
                        <p className="mt-1.5 line-clamp-2 max-w-[46ch] text-[0.95rem] text-fg-2">{p.description}</p>
                      </div>
                      <ArrowUpRight className="mt-1 size-5 shrink-0 text-fg-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {hasOnlyExampleProjects && (
          <p className="container-x label-mono mt-6 normal-case tracking-[0.04em] text-fg-3">
            Tiles marked “Example” show the case-study format while published client work is being prepared.
          </p>
        )}
      </div>
    </section>
  );
}
