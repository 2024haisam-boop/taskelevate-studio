"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { services } from "@/data/services";
import { PillLink } from "./PillLink";

const STATEMENT =
  "Taskelevate Studios is the creative arm of Taskelevate. We make the animations, 3D films, interactive websites and videos ambitious brands launch with — planned, designed and produced by one team, so every frame supports the story.";

// every capability, in service order, linking to its service page
const ITEMS = services.flatMap((s) => s.capabilities.map((c) => ({ label: c, service: s.label, href: s.href })));

const FILL_END = 0.34; // share of the pinned scroll spent filling the statement
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * WHAT WE DO — pinned. The statement fills from faint to ink word by word as you scroll; then the capability wheel
 * turns: the current line sits dark with an arrow, the others fade with distance, and each one links to its
 * service. Reduced motion: everything is shown, no pin.
 */
export function WhatWeDo() {
  const trackRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const track = trackRef.current, para = wordsRef.current, list = listRef.current;
    if (!track || !para || !list) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const words = Array.from(para.querySelectorAll<HTMLElement>("[data-w]"));
    const rows = Array.from(list.children) as HTMLElement[];
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!motion.matches) {
        words.forEach((w) => (w.style.opacity = "1"));
        return;
      }
      const vh = window.innerHeight;
      const r = track.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, r.height - vh));
      // the statement starts filling as it rises into view and finishes early in the pin
      const lead = clamp01((vh * 0.85 - r.top) / (vh * 0.85));
      const fill = clamp01(lead * 0.45 + clamp01(p / FILL_END) * 0.55);
      const n = words.length;
      words.forEach((w, i) => (w.style.opacity = (0.16 + 0.84 * clamp01((fill * (n + 4) - i) / 4)).toFixed(3)));

      // the wheel
      const t = clamp01((p - FILL_END) / (1 - FILL_END)) * (rows.length - 1);
      const h = rows[0]?.offsetHeight ?? 40;
      list.style.transform = `translate3d(0, ${(-t * h).toFixed(1)}px, 0)`;
      rows.forEach((row, i) => {
        const d = i - t;
        const a = d < 0 ? 1 - Math.min(1, -d / 2.2) : 1 - Math.min(1, d / 5.5);
        row.style.opacity = Math.max(0.04, a).toFixed(3);
        row.dataset.active = Math.abs(d) < 0.5 ? "true" : "false";
      });
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    motion.addEventListener("change", kick);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      motion.removeEventListener("change", kick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={trackRef} aria-labelledby="wwd-title" className="wwd-track">
      <div className="wwd-stage shell">
        <div className="wwd-copy">
          <h2 id="wwd-title" className="sr-only">
            What we do
          </h2>
          <p ref={wordsRef} className="wwd-statement font-display">
            <span aria-hidden="true" className="tag-pill wwd-pill">
              What we do
            </span>
            <span aria-hidden="true" className="wwd-arrow">
              ↳
            </span>
            {STATEMENT.split(" ").map((w, i) => (
              <Fragment key={i}>
                <span data-w="">{w}</span>{" "}
              </Fragment>
            ))}
          </p>
        </div>
        <PillLink href="/about" className="wwd-more">
          More about us
        </PillLink>

        <div className="wwd-wheel" aria-label="What we make">
          <ol ref={listRef} className="wwd-list">
            {ITEMS.map((it, i) => (
              <li key={it.label} className="wwd-row">
                <Link href={it.href} className="wwd-link">
                  <span className="wwd-num font-mono">
                    <span className="wwd-mark" aria-hidden="true">
                      ↳
                    </span>
                    <span className="wwd-idx">({String(i + 1).padStart(3, "0")})</span>
                  </span>
                  <span className="wwd-name">{it.label}</span>
                  <span className="sr-only"> — {it.service}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
