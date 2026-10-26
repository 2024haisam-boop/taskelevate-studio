"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { usePageVisible } from "@/hooks/usePageVisible";
import { cn } from "@/lib/utils/cn";
import s from "@/components/three/engine.module.css";

interface Props {
  children: ReactNode;
  label: string;
  caption?: string;
  className?: string;
  /** Aspect classes for the frame */
  aspect?: string;
}

/**
 * Framed technical viewport for a single CSS-3D scene (service pages).
 * Layers lift into depth when the frame enters view; pointer parallax on fine
 * pointers; loops pause off-screen or in a hidden tab.
 */
export function SceneViewport({ children, label, caption, className, aspect = "aspect-[4/5] xs:aspect-square sm:aspect-[4/3] lg:aspect-[16/11]" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { rootMargin: "0px", threshold: 0.2 });
  const visible = usePageVisible();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.085;
      cur.y += (target.y - cur.y) * 0.085;
      el.style.setProperty("--px", cur.x.toFixed(4));
      el.style.setProperty("--py", cur.y.toFixed(4));
      el.style.setProperty("--spread", (1 + Math.min(1, Math.hypot(cur.x, cur.y)) * 0.4).toFixed(3));
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.0008 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <figure className={cn("m-0", className)}>
      <div
        ref={ref}
        className={cn(s.viewport, "theme-dark relative w-full rounded-[var(--radius-card)] border border-line", aspect)}
        data-paused={!(inView && visible)}
      >
        <div className={s.grid} aria-hidden="true" />
        <div className={s.ticksTop} aria-hidden="true" />
        <div className={s.ticksLeft} aria-hidden="true" />
        <div className={s.mode} data-active={inView} aria-hidden="true">
          {children}
        </div>
        <div aria-hidden="true" className="corner-frame pointer-events-none absolute inset-3 md:inset-4" />
        <span aria-hidden="true" className="label-mono pointer-events-none absolute left-5 top-5 text-fg-2 md:left-7 md:top-6">
          {label}
        </span>
      </div>
      {caption && <figcaption className="mt-4 text-sm text-fg-3">{caption}</figcaption>}
    </figure>
  );
}
