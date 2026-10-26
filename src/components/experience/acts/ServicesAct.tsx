"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { getClip } from "@/data/media";
import { services } from "@/data/services";
import { scrollForTrack, stepped } from "@/components/world/world";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { useAct } from "../useAct";

const SERVICE_CLIP: Record<string, string> = {
  "saas-animation": "saas-dashboard",
  "3d-animation": "product-turntable",
  "interactive-websites": "web-layers",
  "video-editing": "edit-timeline",
};

/**
 * ACT 4 — THE STUDIO. Through the pool and into the studio: a carousel of four screens turns one service at a
 * time into the spotlight (3D), while its story appears here. Every service stays in the DOM and focusable —
 * tabbing to one scrolls the carousel to it.
 */
export function ServicesAct() {
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const n = services.length;

  useAct("services", ref, (ap) => {
    const list = listRef.current;
    const section = ref.current;
    if (!list || !section) return;
    const active = Math.round(stepped(ap * (n - 1) * 0.999));
    const key = String(active);
    if (section.dataset.active !== key) {
      section.dataset.active = key;
      list.querySelectorAll<HTMLElement>("[data-step]").forEach((el, i) => (el.dataset.on = String(i === active)));
      section.querySelectorAll<HTMLElement>("[data-dot]").forEach((el, i) => (el.dataset.on = String(i === active)));
    }
  });

  const focusStep = (i: number) => {
    if (document.documentElement.dataset.world === "off") return;
    window.scrollTo({ top: scrollForTrack("services", i / (n - 1)), behavior: "smooth" });
  };

  return (
    <section ref={ref} id="services" data-act="services" aria-labelledby="services-title" className="act relative h-[380svh]" data-active="0">
      <div className="act-stage pointer-events-none sticky top-0 flex h-[100svh] flex-col justify-end pb-[calc(env(safe-area-inset-bottom,0px)+28px)] md:justify-center md:pb-0">
        <div aria-hidden="true" className="world-on-only absolute inset-x-0 bottom-0 -z-[1] h-[58%] bg-gradient-to-t from-bg via-bg/80 to-transparent md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[56%] md:bg-gradient-to-r md:from-bg/90 md:via-bg/50" />
        <div className="container-x">
          <div className="max-w-[520px]">
            <p className="label-mono flex items-center gap-3 text-fg-2">
              <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-violet-bright to-blue" />
              03 / Services
            </p>
            <h2 id="services-title" className="sr-only">
              Services
            </h2>
            <ol ref={listRef} className="services-steps relative mt-6 md:mt-8">
              {services.map((s, i) => {
                const clip = getClip(SERVICE_CLIP[s.slug] ?? "saas-dashboard");
                return (
                  <li key={s.slug} data-step data-on={i === 0} className="service-step" onFocus={() => focusStep(i)}>
                    <div className="world-off-only mb-5 aspect-video overflow-hidden rounded-[22px] border border-white/10">
                      <InViewVideo src={clip.src} poster={clip.poster} />
                    </div>
                    <p className="font-mono text-sm text-violet-bright">{s.index}</p>
                    <h3 className="mt-2 font-display text-[clamp(2.2rem,5.4vw,4.4rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-fg">
                      {s.rowTitle}
                    </h3>
                    <p className="mt-4 max-w-[44ch] text-[1.02rem] leading-relaxed text-fg-2 md:text-lead">{s.rowDescription}</p>
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${s.label} capabilities`}>
                      {s.capabilities.map((c) => (
                        <li key={c} className="chip glass glass-subtle border-0 text-fg">
                          {c}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={s.href}
                      data-cursor="Explore"
                      className="pointer-events-auto mt-6 inline-flex min-h-11 items-center gap-2 rounded-full text-[0.95rem] font-semibold text-fg underline-offset-4 hover:underline"
                    >
                      Explore {s.label}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ol>
            <div aria-hidden="true" className="world-on-only mt-8 flex items-center gap-3">
              {services.map((s, i) => (
                <span key={s.slug} data-dot data-on={i === 0} className="service-dot label-mono">
                  {s.index}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
