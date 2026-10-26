"use client";

import { useEffect } from "react";

/**
 * Drives the extremely subtle cursor-responsive reflection on liquid-glass
 * surfaces marked `data-glass-reflect`. One passive, rAF-throttled listener for
 * the whole document; only on fine pointers. Writes CSS variables only.
 */
export function GlassPointerTracker() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let current: HTMLElement | null = null;
    let last: PointerEvent | null = null;
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!last) return;
      const target = (last.target as Element | null)?.closest?.<HTMLElement>("[data-glass-reflect]") ?? null;
      if (current && current !== target) current.setAttribute("data-glass-active", "false");
      current = target;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--gx", `${(last.clientX - rect.left).toFixed(1)}px`);
      target.style.setProperty("--gy", `${(last.clientY - rect.top).toFixed(1)}px`);
      target.setAttribute("data-glass-active", "true");
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onLeave = () => {
      if (current) current.setAttribute("data-glass-active", "false");
      current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
