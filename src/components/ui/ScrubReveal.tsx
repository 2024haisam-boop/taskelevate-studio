"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ease = (x: number) => x * x * (3 - 2 * x);

/** 0 when the element's top enters the bottom of the viewport → 1 when it reaches 20% from the top. */
export function scrubProgress(top: number, vh: number) {
  return Math.min(1, Math.max(0, (vh - top) / (vh * 0.8)));
}

/**
 * Scroll-scrubbed media reveal (one listener for the whole site). Every `[data-scrub]` element gets `--rv`
 * (0 → 1, eased) while it travels up through the viewport; CSS turns that into a top-to-bottom unmask with a
 * settling zoom (see "SCRUB REVEAL" in globals.css). It runs both ways, so scrolling back up closes it again.
 * Only elements near the viewport are measured. Reduced motion → everything fully shown.
 */
export function ScrubReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();
    const live = new Set<HTMLElement>();
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      live.forEach((el) => {
        const v = reduce ? 1 : ease(scrubProgress(el.getBoundingClientRect().top, vh));
        el.style.setProperty("--rv", v.toFixed(3));
      });
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) live.add(el);
          else {
            live.delete(el);
            // settle off-screen elements at their end state so nothing is left half-open
            el.style.setProperty("--rv", e.boundingClientRect.top < 0 ? "1" : "0");
          }
        });
        kick();
      },
      { rootMargin: "10% 0px 10% 0px" },
    );
    const scan = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>("[data-scrub]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan(document);
    const mo = new MutationObserver(() => scan(document));
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
