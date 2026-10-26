"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

type Mode = "track" | "through";

/**
 * Calls `onProgress(p)` (0..1) as the page scrolls — rAF-batched, one passive listener.
 *  - "track":   sticky-track progress: 0 when the element's top hits the viewport top,
 *               1 when its bottom reaches the viewport bottom (for tall sections with a sticky stage)
 *  - "through": 0 when the element's top enters the bottom of the viewport, 1 when its bottom leaves the top
 */
export function useScrollProgress<T extends HTMLElement>(ref: RefObject<T | null>, onProgress: (p: number) => void, mode: Mode = "track") {
  const cb = useRef(onProgress);
  useLayoutEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        mode === "track"
          ? -r.top / Math.max(1, el.offsetHeight - vh)
          : (vh - r.top) / Math.max(1, r.height + vh);
      cb.current(Math.min(1, Math.max(0, p)));
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
  }, [ref, mode]);
}
