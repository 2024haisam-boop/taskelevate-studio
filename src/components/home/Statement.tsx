"use client";

import { useRef } from "react";
import { getClip } from "@/data/media";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { InViewVideo } from "@/components/ui/InViewVideo";

type Part = { w: string } | { clip: string };

// One sentence, four services, four inline video pills.
const PARTS: Part[] = [
  { w: "We" }, { w: "make" }, { w: "software" }, { w: "feel" }, { clip: "saas-dashboard" }, { w: "simple," },
  { w: "products" }, { w: "feel" }, { clip: "product-turntable" }, { w: "real," },
  { w: "websites" }, { w: "feel" }, { clip: "web-layers" }, { w: "alive" }, { w: "—" },
  { w: "and" }, { w: "every" }, { w: "frame" }, { clip: "edit-timeline" }, { w: "count." },
];

const PLAIN = PARTS.filter((p): p is { w: string } => "w" in p).map((p) => p.w).join(" ");

/**
 * BEAT 2 — Statement. Words light up one by one as you scroll (sticky stage, native scroll);
 * inline video pills grow open as their word lights. Fully readable without JS.
 */
export function Statement() {
  const trackRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useScrollProgress(trackRef, (p) => {
    const el = textRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-i]");
    const lit = p * 1.15 * items.length;
    items.forEach((node, i) => {
      const v = Math.min(1, Math.max(0, lit - i));
      node.style.setProperty("--lit", v.toFixed(3));
    });
  });

  return (
    <section id="statement" ref={trackRef} aria-label="What we do" className="relative h-[210svh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-[100svh] items-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-32">
        <div className="container-x">
          <p className="label-mono mb-8 flex items-center gap-3 text-fg-3 md:mb-12">
            <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-violet-bright to-blue" />
            What we do
          </p>
          <p className="sr-only">{PLAIN}</p>
          <p
            ref={textRef}
            aria-hidden="true"
            className="statement max-w-[1180px] font-display text-[clamp(2rem,6.2vw,5.6rem)] font-semibold leading-[1.06] tracking-[-0.035em]"
          >
            {PARTS.map((part, i) =>
              "w" in part ? (
                <span key={i} data-i className="statement-word">
                  {part.w}{" "}
                </span>
              ) : (
                <span key={i} data-i className="statement-pill">
                  <span className="statement-pill-inner">
                    <InViewVideo src={getClip(part.clip).srcSmall} poster={getClip(part.clip).poster} />
                  </span>{" "}
                </span>
              ),
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
