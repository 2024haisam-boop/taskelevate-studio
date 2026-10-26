"use client";

import { useRef } from "react";
import { useLazyGsap } from "@/lib/animations/useLazyGsap";

interface Step {
  title: string;
  description: string;
}

/**
 * Thin technical timeline with progressive line illumination (GSAP ScrollTrigger scrub).
 * Horizontal ≥1024px, vertical below. Native scroll only — nothing is pinned.
 * Reduced motion: fully lit, no scrub. GSAP loads on approach and is fully reverted on unmount.
 */
export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLazyGsap(root, ({ gsap }) => {
    const el = root.current;
    if (!el) return;
    const stepEls = gsap.utils.toArray<HTMLElement>("[data-step]", el);
    const mm = gsap.matchMedia();

    mm.add(
      { desktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        const fill = el.querySelector<HTMLElement>(desktop ? "[data-fill-x]" : "[data-fill-y]");
        if (!fill) return;
        const prop = desktop ? "scaleX" : "scaleY";

        if (reduce) {
          gsap.set(fill, { [prop]: 1 });
          stepEls.forEach((s) => s.setAttribute("data-active", "true"));
          return;
        }

        gsap.fromTo(
          fill,
          { [prop]: 0 },
          {
            [prop]: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: desktop ? "top 72%" : "top 70%",
              end: desktop ? "bottom 62%" : "bottom 65%",
              scrub: 0.5,
              onUpdate(self) {
                const p = self.progress;
                stepEls.forEach((s, i) => {
                  const threshold = desktop ? i / steps.length : i / (steps.length - 0.4);
                  s.setAttribute("data-active", String(p > threshold + 0.01 || p > 0.985));
                });
              },
            },
          },
        );
      },
    );

    return () => mm.revert();
  });

  return (
    <div ref={root} className="relative">
      {/* horizontal rail (desktop) */}
      <div aria-hidden="true" className="absolute left-0 right-0 top-[7px] hidden h-px bg-line lg:block">
        <div data-fill-x className="h-full origin-left bg-gradient-to-r from-violet-bright via-violet to-blue" />
      </div>
      {/* vertical rail (mobile/tablet) */}
      <div aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-line lg:hidden">
        <div data-fill-y className="h-full w-full origin-top bg-gradient-to-b from-violet-bright via-violet to-blue" />
      </div>

      <ol className="grid gap-14 lg:grid-cols-4 lg:gap-10">
        {steps.map((step, i) => (
          <li key={step.title} data-step className="group relative pl-12 lg:pl-0 lg:pt-16">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1 block size-[15px] rounded-full border border-black/25 bg-bg transition-[background-color,border-color,box-shadow] duration-500 group-data-[active=true]:border-violet-bright group-data-[active=true]:bg-violet-bright group-data-[active=true]:shadow-[0_0_0_5px_rgb(168_85_247/0.15),0_0_22px_rgb(168_85_247/0.6)] lg:top-0"
            />
            <span
              aria-hidden="true"
              className="block font-display text-[clamp(4rem,9vw,7.5rem)] font-bold leading-[0.85] tracking-[-0.05em] text-transparent transition-colors duration-700 [-webkit-text-stroke:1px_rgb(255_255_255/0.22)] group-data-[active=true]:text-fg group-data-[active=true]:[-webkit-text-stroke:1px_transparent]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="label-mono mt-6 text-[0.8rem] tracking-[0.2em] text-fg">
              <span className="text-fg-3">{String(i + 1).padStart(2, "0")} / </span>
              {step.title}
            </h3>
            <p className="mt-3 max-w-xs text-[0.975rem] leading-relaxed text-fg-2">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
