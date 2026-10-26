"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for every `[data-reveal]` element on the page.
 * Server components stay server components — they only add the attribute.
 * Sets `data-revealed` (an attribute React never manages, so re-renders can't wipe it).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const selector = "[data-reveal]:not([data-revealed])";

    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => el.setAttribute("data-revealed", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const scan = (root: ParentNode) => root.querySelectorAll<HTMLElement>(selector).forEach((el) => io.observe(el));
    scan(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(selector)) io.observe(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
