"use client";

import { useEffect, useRef } from "react";
import { ACTS, world, type ActName } from "@/components/world/world";

const LABELS: Record<ActName, string> = {
  hero: "Enter",
  descent: "Descend",
  reel: "Reel",
  services: "Studio",
  work: "Work",
  finale: "Create",
};

/**
 * Where am I? A slim chapter rail on the right edge (≥lg): the current place lights up and a bar fills with
 * progress through it. Each tick jumps to its chapter (the camera flies there).
 */
export function ChapterRail() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const items = Array.from(nav.querySelectorAll<HTMLElement>("[data-chapter]"));
    let raf = 0;
    let last = -1;
    const read = () => {
      raf = 0;
      const y = window.scrollY + world.vh * 0.5;
      let active = 0;
      ACTS.forEach((name, i) => {
        const r = world.ranges[name];
        if (r && y >= r.top) active = i;
      });
      const r = world.ranges[ACTS[active]!];
      const p = r ? Math.min(1, Math.max(0, (y - r.top) / Math.max(1, r.height))) : 0;
      nav.style.setProperty("--chapter-p", p.toFixed(3));
      if (active !== last) {
        last = active;
        items.forEach((el, i) => {
          el.dataset.on = String(i === active);
          if (i === active) el.setAttribute("aria-current", "step");
          else el.removeAttribute("aria-current");
        });
      }
      const end = world.ranges.finale;
      nav.dataset.hidden = String(Boolean(end && window.scrollY > end.top + end.height));
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

  const go = (name: ActName) => {
    const r = world.ranges[name];
    if (r) window.scrollTo({ top: r.top + (name === "hero" ? 0 : 2), behavior: "smooth" });
  };

  return (
    <nav ref={ref} aria-label="Chapters" className="chapter-rail world-on-only">
      <ol>
        {ACTS.map((name, i) => (
          <li key={name}>
            <button type="button" data-chapter data-on={i === 0} onClick={() => go(name)} className="chapter-tick">
              <span className="chapter-num">{String(i).padStart(2, "0")}</span>
              <span className="chapter-label">{LABELS[name]}</span>
              <span aria-hidden="true" className="chapter-bar" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
