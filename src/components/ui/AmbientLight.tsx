"use client";

import { useEffect, useRef } from "react";

/**
 * Restrained blue/violet ambient lighting that drifts gently toward the pointer.
 * Writes two registered custom properties (--lx/--ly, see globals.css @property) on
 * its parent; CSS transitions do the smoothing. Disabled for touch & reduced motion.
 */
export function AmbientLight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!last) return;
      const r = host.getBoundingClientRect();
      const x = ((last.clientX - r.left) / r.width) * 100;
      const y = ((last.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--lx", `${Math.min(80, Math.max(20, x)).toFixed(1)}%`);
      el.style.setProperty("--ly", `${Math.min(85, Math.max(25, y)).toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`ambient-light pointer-events-none absolute inset-0 -z-10 ${className ?? ""}`}
    />
  );
}
