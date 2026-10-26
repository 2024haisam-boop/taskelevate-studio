import type { CSSProperties } from "react";
import { siteConfig } from "@/data/site-config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { KineticHeadline } from "./KineticHeadline";
import { ShowreelButton } from "./ShowreelButton";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** SECTION 1 — Cinematic, typography-first hero (brief §08). No 3D object here by design. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate grid min-h-[100svh] grid-rows-[1fr_auto] overflow-hidden">
      {/* Background — near-invisible technical grid, horizon hairline, restrained ambient light */}
      <div aria-hidden="true" className="hero-fade pointer-events-none absolute inset-0 -z-10" style={d(0)}>
        <div className="tech-grid absolute inset-0 [mask-image:radial-gradient(ellipse_72%_58%_at_50%_44%,#000_10%,transparent_72%)]" />
        <div className="noise absolute inset-0 opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(ellipse_46%_55%_at_50%_100%,rgb(135_85_232/0.13),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[radial-gradient(ellipse_30%_45%_at_62%_100%,rgb(24_155_232/0.07),transparent_70%)]" />
        <div className="absolute left-1/2 top-[76%] h-px w-[min(1120px,92vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.13] to-transparent" />
        {/* Precision markers */}
        <span className="absolute left-[8%] top-[22%] hidden font-mono text-[10px] tracking-[0.2em] text-white/20 md:block">+ 00.00 / 00.00</span>
        <span className="absolute right-[8%] top-[22%] hidden font-mono text-[10px] tracking-[0.2em] text-white/20 md:block">TES—01</span>
      </div>

      <div className="container-x flex flex-col items-center justify-center pb-16 pt-[calc(var(--nav-top)+var(--nav-h)+48px)] text-center md:pb-20">
        <p className="hero-fade label-mono flex items-center gap-2.5 whitespace-nowrap text-[10px] tracking-[0.13em] text-fg-2 sm:gap-3 sm:text-micro sm:tracking-[0.16em]" style={d(0)}>
          <span aria-hidden="true" className="relative flex size-1.5">
            <span className="absolute inset-0 rounded-full bg-violet-bright shadow-[0_0_10px_2px_rgb(168_85_247/0.6)]" />
          </span>
          Independent Creative Technology Studio
        </p>

        <div className="mt-7 md:mt-9">
          <KineticHeadline />
        </div>

        <p className="hero-fade-up mt-8 max-w-[660px] text-lead text-fg-2 md:mt-10" style={d(1050)}>
          We craft striking SaaS animations, cinematic 3D visuals, and immersive digital experiences for brands that
          refuse to blend in.
        </p>

        <div
          className="hero-fade-up mt-9 flex w-full flex-col items-stretch justify-center gap-3 xs:w-auto xs:flex-row xs:items-center md:mt-11"
          style={d(1200)}
        >
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
        className="hero-fade container-x flex items-end justify-center pb-[calc(env(safe-area-inset-bottom,0px)+24px)] sm:justify-between md:pb-8"
        style={d(1300)}
      >
        <p className="label-mono hidden text-fg-3 sm:block">Design / Motion / Technology</p>
        <a
          href="#capabilities"
          className="label-mono group flex min-h-11 items-center gap-3 rounded-full text-fg-3 transition-colors hover:text-fg"
        >
          Scroll to explore
          <span aria-hidden="true" className="scroll-cue-track block h-9 w-px bg-white/10" />
        </a>
      </div>
    </section>
  );
}
