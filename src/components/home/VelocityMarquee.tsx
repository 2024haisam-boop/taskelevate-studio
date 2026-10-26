"use client";

import { useEffect, useRef } from "react";

const ROW_A = ["SaaS animation", "3D product films", "Interactive websites", "Video editing"];
const ROW_B = ["Blender", "WebGL", "Motion design", "Launch films", "UI motion", "Creative development"];

/**
 * BEAT 6 — two rows of oversized words drifting in opposite directions. They skew with scroll velocity
 * and spring back when you stop. Decorative (aria-hidden); paused off-screen; static for reduced motion.
 */
export function VelocityMarquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let skew = 0;
    let target = 0;
    let raf = 0;
    let visible = false;

    const tick = () => {
      skew += (target - skew) * 0.12;
      target *= 0.9;
      el.style.setProperty("--skew", `${skew.toFixed(2)}deg`);
      raf = visible && (Math.abs(skew) > 0.02 || Math.abs(target) > 0.02) ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      const now = performance.now();
      const v = (window.scrollY - lastY) / Math.max(1, now - lastT); // px per ms
      lastY = window.scrollY;
      lastT = now;
      target = Math.max(-10, Math.min(10, v * -6));
      if (visible && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      el.dataset.paused = visible ? "false" : "true";
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const row = (words: string[], dir: 1 | -1, outline: boolean) => (
    <div className="overflow-hidden py-1">
      <div className="marquee-track" data-dir={dir} style={{ transform: "skewX(var(--skew, 0deg))" }}>
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0 items-center">
            {words.map((w) => (
              <span key={w} className="flex items-center">
                <span
                  className={`whitespace-nowrap px-[0.35em] font-display text-[clamp(3rem,10vw,9.5rem)] font-bold uppercase leading-[1] tracking-[-0.05em] ${
                    outline ? "text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.5)]" : "text-fg"
                  }`}
                >
                  {w}
                </span>
                <span className="text-[clamp(1.5rem,4vw,3.5rem)] text-violet-bright">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section aria-hidden="true" className="relative overflow-hidden border-y border-line py-[clamp(48px,7vw,96px)]">
      <div ref={ref} className="flex flex-col gap-2 [--skew:0deg]" style={{ rotate: "-2deg" }}>
        {row(ROW_A, 1, false)}
        {row(ROW_B, -1, true)}
      </div>
    </section>
  );
}
