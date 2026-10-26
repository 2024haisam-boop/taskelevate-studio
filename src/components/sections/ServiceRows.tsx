"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";
import { cn } from "@/lib/utils/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  services: Pick<Service, "slug" | "href" | "index" | "rowTitle" | "rowDescription" | "capabilities" | "label">[];
  /** Server-rendered preview art, one per service (same order) */
  previews: ReactNode[];
}

/**
 * Full-width service rows. On fine pointers a contextual preview follows the cursor
 * (transform-only, rAF-lerped, no layout work). On touch devices each row shows its
 * preview inline and an always-visible link — no hover dependency.
 */
export function ServiceRows({ services, previews }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  const reduce = useReducedMotion();
  const fine = finePointer && !reduce;

  useEffect(() => {
    if (!fine) return;
    const list = listRef.current;
    const el = floatRef.current;
    if (!list || !el) return;

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.16;
      pos.current.y += (target.current.y - pos.current.y) * 0.16;
      el.style.transform = `translate3d(${pos.current.x.toFixed(1)}px, ${pos.current.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      raf.current = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const rect = list.getBoundingClientRect();
      target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onEnter = (e: PointerEvent) => {
      const rect = list.getBoundingClientRect();
      target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      pos.current = { ...target.current };
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      setActive(null);
    };
    list.addEventListener("pointermove", onMove, { passive: true });
    list.addEventListener("pointerenter", onEnter);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerenter", onEnter);
      list.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [fine]);

  return (
    <ul ref={listRef} className="relative border-b border-line">
      {services.map((s, i) => (
        <li key={s.slug} className="border-t border-line" data-reveal suppressHydrationWarning style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
          <Link
            href={s.href}
            onPointerEnter={() => fine && setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="group relative grid grid-cols-[auto_1fr_auto] gap-x-5 gap-y-5 py-9 outline-offset-[-2px] md:py-11 lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:py-12"
          >
            {/* hover wash */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-5 -right-5 bg-gradient-to-r from-black/[0.035] via-black/[0.015] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:-left-8 md:-right-8"
            />
            <span className="label-mono pt-2 text-fg-3 transition-colors group-hover:text-violet-bright lg:col-span-1 lg:pt-0">
              {s.index}
            </span>

            <h3 className="col-span-1 font-display text-[clamp(1.75rem,5.4vw,4.25rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em] text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0 lg:col-span-6">
              {s.rowTitle}
            </h3>

            <span
              aria-hidden="true"
              className="inline-flex size-12 items-center justify-center self-start rounded-full border border-line-strong text-fg transition-[background-color,color,border-color] duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg lg:order-last lg:col-span-1 lg:justify-self-end lg:self-center"
            >
              <ArrowUpRight className="size-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
            </span>

            <div className="col-span-3 lg:col-span-4">
              <p className="max-w-md text-[1rem] leading-relaxed text-fg-2">{s.rowDescription}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${s.label} capabilities`}>
                {s.capabilities.map((c) => (
                  <li key={c} className="chip">
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Inline preview for touch / smaller screens */}
            <div className="col-span-3 overflow-hidden rounded-2xl border border-line lg:hidden">
              <div className="aspect-[16/9]">{previews[i]}</div>
            </div>
            <span className="label-mono col-span-3 inline-flex items-center gap-2 text-fg lg:hidden">
              Explore {s.label}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}

      {/* Cursor-following contextual preview (desktop, fine pointer) */}
      {fine && (
        <div
          ref={floatRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 w-[340px]"
          style={{ transform: "translate3d(-999px,-999px,0)" }}
        >
          <div
            className={cn(
              "glass glass-strong overflow-hidden rounded-[22px] p-1.5 transition-[opacity,scale] duration-300 ease-[var(--ease-out-expo)]",
              active === null ? "scale-90 opacity-0" : "scale-100 opacity-100",
            )}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[17px]">
              {previews.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 transition-[opacity,scale] duration-500 ease-[var(--ease-out-expo)]",
                    active === i ? "scale-100 opacity-100" : "scale-105 opacity-0",
                  )}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ul>
  );
}
