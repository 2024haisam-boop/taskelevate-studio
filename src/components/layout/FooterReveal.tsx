"use client";

import { useEffect, useRef } from "react";

/**
 * For the footer reveal (`.footer-reveal` in globals.css): publishes the footer's height as `--footer-h`, so a footer
 * taller than the screen waits with its top in view, and marks it `data-far` while the end of the page sheet is more
 * than a screen below the viewport (it is invisible then — nothing can flash through an overscroll bounce).
 */
export function FooterReveal() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = ref.current?.closest("footer");
    if (!footer) return;
    const size = () => footer.style.setProperty("--footer-h", `${footer.offsetHeight}px`);
    const ro = new ResizeObserver(size);
    ro.observe(footer);
    size();

    const end = document.querySelector("[data-sheet-end]");
    // far = the sheet's end is still more than a screen below the viewport (once it is above, the footer is on screen)
    const io = end
      ? new IntersectionObserver(([e]) => e && (footer.dataset.far = String(!e.isIntersecting && e.boundingClientRect.top > 0)), { rootMargin: "0px 0px 100% 0px" })
      : null;
    if (end) io?.observe(end);
    return () => {
      ro.disconnect();
      io?.disconnect();
    };
  }, []);

  return <span ref={ref} hidden />;
}
