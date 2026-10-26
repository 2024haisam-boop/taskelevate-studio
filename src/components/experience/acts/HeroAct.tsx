"use client";

import { useRef, type CSSProperties } from "react";
import { clips } from "@/data/media";
import { siteConfig } from "@/data/site-config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { KineticHeadline } from "@/components/hero/KineticHeadline";
import { ShowreelButton } from "@/components/hero/ShowreelButton";
import { useAct } from "../useAct";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * ACT 1 — THE WELL. The headline sits over the 3D well (fixed canvas behind the page); scrolling flies the camera
 * over the rim and tips it down the shaft while the copy grows and lifts away. Server-rendered for SEO/LCP.
 */
export function HeroAct() {
  const ref = useRef<HTMLElement>(null);
  useAct("hero", ref);

  return (
    <section ref={ref} data-act="hero" aria-labelledby="hero-title" className="act relative h-[200svh] md:h-[220svh] [--ap:0]">
      <div className="act-stage sticky top-0 isolate h-[100svh] touch-pan-y overflow-hidden" data-drag-zone>
        <PosterRing />

        {/* legibility: dark core behind the type + soft floor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_52%_46%_at_50%_54%,rgb(8_9_13/0.82),rgb(8_9_13/0.36)_58%,transparent_82%)]"
          style={{ opacity: "calc(1 - var(--ap) * 1.6)" }}
        />

        <div
          className="container-x pointer-events-none relative flex h-full flex-col items-center justify-center pt-[calc(var(--nav-top)+var(--nav-h))] text-center"
          style={{
            transform: "translate3d(0, calc(var(--ap) * -9vh), 0) scale(calc(1 + var(--ap) * 0.55))",
            opacity: "clamp(0, calc(1 - var(--ap) * 2.6), 1)",
          }}
        >
          <p className="hero-fade label-mono flex items-center gap-2.5 whitespace-nowrap text-[10px] tracking-[0.13em] text-fg-2 sm:gap-3 sm:text-micro sm:tracking-[0.16em]" style={d(0)}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-violet-bright shadow-[0_0_10px_2px_rgb(168_85_247/0.6)]" />
            Independent Creative Technology Studio
          </p>
          <div className="mt-6 md:mt-8">
            <KineticHeadline />
          </div>
          <p className="hero-fade-up mt-6 max-w-[600px] text-lead text-fg-2 md:mt-8" style={d(1050)}>
            We craft striking SaaS animations, cinematic 3D visuals, and immersive digital experiences for brands that
            refuse to blend in.
          </p>
          <div className="hero-fade-up pointer-events-auto mt-8 flex w-full flex-col items-stretch justify-center gap-3 xs:w-auto xs:flex-row xs:items-center" style={d(1200)}>
            <ButtonLink href="/work" size="lg">
              Explore Our Work
            </ButtonLink>
            <ButtonLink href="/contact" variant="glass" size="lg">
              Start a Project
            </ButtonLink>
            {siteConfig.showreel.src && <ShowreelButton src={siteConfig.showreel.src} poster={siteConfig.showreel.poster} />}
          </div>
        </div>

        <div
          className="hero-fade container-x absolute inset-x-0 bottom-0 flex items-end justify-center pb-[calc(env(safe-area-inset-bottom,0px)+22px)] sm:justify-between md:pb-8"
          style={{ ...d(1300), opacity: "clamp(0, calc(1 - var(--ap) * 3), 1)" }}
        >
          <p className="label-mono hidden text-fg-3 sm:block">
            <span className="world-on-only">Drag to spin · Click a screen</span>
            <span className="world-off-only">Design / Motion / Technology</span>
          </p>
          <a href="#statement" className="label-mono group pointer-events-auto flex min-h-11 items-center gap-3 rounded-full text-fg-3 transition-colors hover:text-fg">
            Scroll to enter
            <span aria-hidden="true" className="scroll-cue-track block h-9 w-px bg-white/10" />
          </a>
        </div>

        <p className="sr-only">
          Behind the headline, an interactive 3D well of studio footage — SaaS motion, 3D product renders, interactive web
          and video edits. Selecting a screen opens the matching service page; scrolling travels down the well into the
          studio. All services and work are also listed as links below.
        </p>
      </div>
    </section>
  );
}

/** No-WebGL / reduced-motion stand-in: a tilted ring of posters in CSS 3D (shown only when the world is off). */
function PosterRing() {
  const items = [...clips, ...clips].slice(0, 10);
  return (
    <div aria-hidden="true" className="world-off-only pointer-events-none absolute inset-0 -z-10 items-center justify-center opacity-70 [perspective:1400px]">
      <div className="relative h-[40vh] w-[min(1100px,140vw)] [transform-style:preserve-3d] [transform:rotateX(58deg)_translateY(-6vh)]">
        {items.map((c, i) => {
          const a = (i / items.length) * 360;
          return (
            // eslint-disable-next-line @next/next/no-img-element -- decorative, tiny posters
            <img
              key={i}
              src={c.poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute left-1/2 top-1/2 h-[22vh] w-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 object-cover"
              style={{ transform: `rotateZ(${a}deg) translateY(-34vh) rotateX(-90deg)` }}
            />
          );
        })}
      </div>
    </div>
  );
}
