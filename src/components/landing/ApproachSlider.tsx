"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import { PillLink } from "./PillLink";
import { ProcessVisual } from "./ProcessVisual";
import { SectionHead } from "./SectionHead";

// The studio process (brief §13 copy). Shown in the slot the reference uses for testimonials — we only show
// real material, and these are our real steps.
const STEPS = [
  { n: "01", title: "Discover", text: "We understand your business, audience, objectives, and creative requirements." },
  { n: "02", title: "Concept", text: "We establish the visual direction, narrative, and production approach." },
  { n: "03", title: "Create", text: "Our team develops, animates, refines, and tests the experience." },
  { n: "04", title: "Deliver", text: "We finalize, optimize, and prepare your creative assets for launch." },
];

// Tools named in our own service descriptions — set as plain type (no third-party logos).
const TOOLS = ["Blender", "Three.js", "WebGL", "React", "Next.js", "GSAP"];

/**
 * OUR APPROACH — eyebrow / statement / CTA row, then the process card + a live render (ProcessVisual), which pin
 * while you scroll: each step gets an equal stretch of the track (see "approach-track" in globals.css), its tab
 * bar fills and the render morphs to that step. Scrolling back up steps back. The tabs jump to their step.
 * Followed by the row of tools we build with.
 */
export function ApproachSlider() {
  const [i, setI] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    let raf = 0;
    let stickyTop = 0;

    const measure = () => {
      stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    };
    const update = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const total = Math.max(1, r.height - stage.offsetHeight);
      const p = Math.min(1, Math.max(0, (stickyTop - r.top) / total));
      progress.current = p;
      track.style.setProperty("--ap", p.toFixed(4));
      setI(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const resize = () => {
      measure();
      kick();
    };

    measure();
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // scroll to the middle of a step's stretch of the track
  const jump = (k: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const total = track.offsetHeight - stage.offsetHeight;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: trackTop - stickyTop + ((k + 0.5) / STEPS.length) * total });
  };

  const step = STEPS[i]!;

  return (
    <section aria-labelledby="approach-title">
      <SectionHead
        eyebrow="Our approach"
        id="approach-title"
        title="A thoughtful creative process, from the first conversation to the final delivery."
        action={<PillLink href="/about">More about the studio</PillLink>}
      />

      <div ref={trackRef} className="approach-track mt-10 md:mt-14" style={{ "--steps": STEPS.length } as CSSProperties}>
        <div ref={stageRef} className="approach-stage grid gap-3 md:gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="flex min-h-[340px] flex-col rounded-[var(--radius-card)] bg-bg-2 p-6 md:p-8 lg:col-span-5 lg:min-h-[min(540px,calc(100svh-180px))]" aria-label="Our process" role="group">
            <div className="flex items-start justify-between gap-4">
              <div key={step.n} className="approach-text flex items-center gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-[8px] bg-violet-bright font-mono text-sm text-white">{step.n}</span>
                <p className="leading-tight">
                  <span className="block text-[1.05rem] text-fg">{step.title}</span>
                  <span className="block text-[0.9rem] text-fg-2">
                    Step {step.n} of {String(STEPS.length).padStart(2, "0")}
                  </span>
                </p>
              </div>
              <span className="label-mono text-fg-3">{i < STEPS.length - 1 ? "Scroll ↓" : "Process"}</span>
            </div>

            <p key={step.n} aria-live="polite" className="approach-text mt-auto pt-10 font-display text-[clamp(1.35rem,1.9vw,2rem)] font-normal leading-[1.25] tracking-[-0.025em] text-fg md:pt-16">
              {step.text}
            </p>

            <ol className="mt-6 grid grid-cols-4 gap-3 md:mt-8 md:gap-5">
              {STEPS.map((s, k) => (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => jump(k)}
                    aria-current={k === i ? "step" : undefined}
                    className={cn("group block w-full min-h-9 text-left transition-colors", k === i ? "text-fg" : "text-fg-3 hover:text-fg-2")}
                  >
                    <span aria-hidden="true" className="block h-[2px] overflow-hidden rounded-full bg-bg-3">
                      <span className="approach-bar block h-full bg-fg" style={{ "--k": k } as CSSProperties} />
                    </span>
                    <span className="mt-3 block font-display text-xl font-normal leading-none md:text-2xl">{s.n}</span>
                    <span className="mt-1 block text-[0.8rem] md:text-[0.85rem]">{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="approach-visual overflow-hidden rounded-[var(--radius-card)] lg:col-span-7">
            <ProcessVisual progress={progress} step={i} steps={STEPS.length} />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-12 md:items-center">
        <p className="label-mono text-fg-3 md:col-span-3">Built with</p>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-4 md:col-span-9 md:justify-between">
          {TOOLS.map((t) => (
            <li key={t} className="font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-fg-3">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
