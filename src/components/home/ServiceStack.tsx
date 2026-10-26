"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { getClip } from "@/data/media";
import { services } from "@/data/services";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { Headline } from "@/components/ui/Headline";
import { SectionLabel } from "@/components/ui/SectionLabel";

const CLIP_FOR: Record<string, string> = {
  "saas-animation": "saas-dashboard",
  "3d-animation": "product-turntable",
  "interactive-websites": "web-layers",
  "video-editing": "edit-timeline",
};

const TINT: Record<string, string> = {
  "saas-animation": "rgb(24 155 232 / 0.16)",
  "3d-animation": "rgb(168 85 247 / 0.2)",
  "interactive-websites": "rgb(99 102 241 / 0.18)",
  "video-editing": "rgb(236 72 153 / 0.12)",
};

/**
 * BEAT 4 — services as cards that stack while you scroll (CSS sticky). Each card eases back and dims as the
 * next one slides over it (transform/opacity only). One card = one service: easy to understand at a glance.
 */
export function ServiceStack() {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-stack-card]"));
    let raf = 0;
    const read = () => {
      raf = 0;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return card.style.setProperty("--cover", "0");
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const cover = Math.min(1, Math.max(0, 1 - (b.top - a.top) / Math.max(1, a.height)));
        card.style.setProperty("--cover", cover.toFixed(3));
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="services" aria-labelledby="services-title" className="relative pb-[12vh] pt-[clamp(72px,10vw,140px)]">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <SectionLabel>01 / Services</SectionLabel>
            <Headline id="services-title" text={"CREATIVITY,\n*ENGINEERED.*"} className="text-display-xl" />
          </div>
          <p className="max-w-sm text-lead text-fg-2" data-reveal suppressHydrationWarning>
            Four crafts, one studio. Scroll through them — every card opens the full story.
          </p>
        </div>

        <ol ref={listRef} className="mt-14 flex flex-col gap-[6vh] md:mt-20">
          {services.map((s, i) => {
            const clip = getClip(CLIP_FOR[s.slug] ?? "saas-dashboard");
            return (
              <li
                key={s.slug}
                data-stack-card
                className="sticky [--cover:0]"
                style={{ top: `calc(var(--nav-top) + var(--nav-h) + 14px + ${i * 14}px)` } as CSSProperties}
              >
                <Link
                  href={s.href}
                  data-card
                  data-cursor={`Explore ${s.label}`}
                  className="group relative grid min-h-[min(74svh,640px)] origin-top overflow-hidden rounded-[28px] border border-white/10 bg-bg-2 shadow-[0_-30px_80px_-40px_rgb(0_0_0/0.9)] transition-[border-color] duration-300 hover:border-white/20 md:grid-cols-12 md:rounded-[36px]"
                  style={{
                    transform: "scale(calc(1 - var(--cover) * 0.06))",
                    backgroundImage: `radial-gradient(120% 90% at 0% 0%, ${TINT[s.slug]}, transparent 60%)`,
                  }}
                >
                  {/* dims the card as the next one covers it — opacity only, composited */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-20 bg-bg"
                    style={{ opacity: "calc(var(--cover) * 0.55)" }}
                  />
                  <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 md:col-span-5 md:p-10 lg:p-12">
                    <div>
                      <span className="label-mono text-fg-3">
                        <span className="text-violet-bright">{s.index}</span> / 04
                      </span>
                      <h3 className="mt-6 font-display text-[clamp(2rem,4.6vw,4rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em] text-fg">
                        {s.rowTitle}
                      </h3>
                      <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-fg-2">{s.rowDescription}</p>
                    </div>
                    <div>
                      <ul className="flex flex-wrap gap-2" aria-label={`${s.label} capabilities`}>
                        {s.capabilities.map((c) => (
                          <li key={c} className="chip">
                            {c}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-8 inline-flex items-center gap-3 text-[0.95rem] font-semibold text-fg">
                        <span className="inline-flex size-11 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45">
                          <ArrowUpRight className="size-5" aria-hidden="true" />
                        </span>
                        Explore {s.label}
                      </span>
                    </div>
                  </div>
                  <div className="relative min-h-[34svh] md:col-span-7 md:min-h-0">
                    <div className="absolute inset-3 overflow-hidden rounded-[22px] border border-white/10 md:inset-5 md:rounded-[26px]">
                      <InViewVideo
                        src={clip.src}
                        poster={clip.poster}
                        className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      />
                      <span className="label-mono absolute bottom-4 left-4 rounded-full bg-bg/70 px-3 py-1.5 text-fg-2 backdrop-blur-sm">
                        {clip.label}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
