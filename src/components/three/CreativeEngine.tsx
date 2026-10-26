"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import { GlassTooltip } from "@/components/glass/GlassTooltip";
import { MotionScene } from "./MotionScene";
import { ProductStage, prefetchProductScene } from "./ProductStage";
import type { PointerState } from "./ProductScene";
import { SaaSScene } from "./SaaSScene";
import { WebScene } from "./WebScene";
import s from "./engine.module.css";

type Mode = "saas" | "product" | "web" | "motion";

const MODES: { id: Mode; index: string; label: string; title: string; description: string; tech: string; href: string; cta: string }[] = [
  {
    id: "saas",
    index: "01",
    label: "SaaS",
    title: "Layered product interface",
    description: "Dashboards, data and feature moments separated into depth — the raw material of a great SaaS explainer.",
    tech: "CSS 3D · 7 layers",
    href: "/services/saas-animation",
    cta: "SaaS Animation",
  },
  {
    id: "product",
    index: "02",
    label: "3D",
    title: "Bespoke product study",
    description: "A custom-modelled object rendered in real time. Switch between wireframe, material and final render.",
    tech: "WebGL · Three.js",
    href: "/services/3d-animation",
    cta: "3D Animation",
  },
  {
    id: "web",
    index: "03",
    label: "Web",
    title: "Spatial website",
    description: "Interface panels at real depth. Move across the viewport and watch every layer respond and settle.",
    tech: "CSS 3D · Pointer",
    href: "/services/interactive-websites",
    cta: "Interactive Websites",
  },
  {
    id: "motion",
    index: "04",
    label: "Motion",
    title: "Motion design environment",
    description: "Keyframes, easing curves and motion paths — the precision behind every frame we deliver.",
    tech: "Keyframes · 24 fps",
    href: "/services/video-editing",
    cta: "Video & Motion",
  },
];

/** SIGNATURE INTERACTIVE CREATIVE ENGINE (brief §09). */
export function CreativeEngine() {
  const [mode, setMode] = useState<Mode>("saas");
  const [paused, setPaused] = useState(false);
  const [mountProduct, setMountProduct] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ saas: null, product: null, web: null, motion: null });
  const pointer = useRef<PointerState>({ x: 0, y: 0, dragYaw: 0 });

  const inView = useInView(viewportRef, { rootMargin: "120px" });
  const near = useInView(viewportRef, { rootMargin: "900px", once: true });
  const pageVisible = usePageVisible();
  const reduce = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const running = inView && pageVisible && !paused;

  // Warm the WebGL chunk only once the visitor is engaged (first scroll / pointer / key / touch)
  // AND the engine is approaching — never during the initial page load.
  useEffect(() => {
    if (!near) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const events = ["scroll", "pointermove", "pointerdown", "keydown", "touchstart"] as const;
    const warm = () => {
      events.forEach((ev) => window.removeEventListener(ev, warm));
      if (w.requestIdleCallback) w.requestIdleCallback(prefetchProductScene);
      else window.setTimeout(prefetchProductScene, 300);
    };
    events.forEach((ev) => window.addEventListener(ev, warm, { once: true, passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, warm));
  }, [near]);

  // Controlled pointer parallax — rAF-lerped CSS variables, no React renders per frame.
  useEffect(() => {
    const el = viewportRef.current;
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
      pointer.current.x = cur.x;
      pointer.current.y = cur.y;
      if (coordsRef.current) {
        coordsRef.current.textContent = `X ${cur.x >= 0 ? "+" : "−"}${Math.abs(cur.x).toFixed(3)}  Y ${cur.y <= 0 ? "+" : "−"}${Math.abs(cur.y).toFixed(3)}`;
      }
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.0008 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const select = (next: Mode) => {
    setMode(next);
    if (next === "product") setMountProduct(true);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % MODES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + MODES.length) % MODES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = MODES.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const m = MODES[next]!;
    select(m.id);
    tabRefs.current[m.id]?.focus();
  };

  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* Mode selector */}
      <div role="tablist" aria-label="Creative engine modes" className="grid grid-cols-4 gap-1.5 md:gap-2">
        {MODES.map((m, i) => {
          const selected = m.id === mode;
          return (
            <button
              key={m.id}
              ref={(el) => {
                tabRefs.current[m.id] = el;
              }}
              id={`engine-tab-${m.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`engine-panel-${m.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(m.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              onPointerEnter={() => m.id === "product" && prefetchProductScene()}
              className={cn(
                "group relative flex min-h-[60px] flex-col items-start justify-center gap-1 overflow-hidden rounded-2xl border px-3 py-3 text-left transition-[border-color,background-color] duration-300 md:min-h-[76px] md:flex-row md:items-center md:justify-start md:gap-4 md:px-5",
                selected ? "border-white/20 bg-white/[0.06]" : "border-line bg-transparent hover:border-white/15 hover:bg-white/[0.025]",
              )}
            >
              <span className={cn("label-mono transition-colors", selected ? "text-violet-bright" : "text-fg-3")}>{m.index}</span>
              <span
                className={cn(
                  "font-display text-[0.95rem] font-semibold uppercase tracking-[-0.01em] transition-colors md:text-xl",
                  selected ? "text-fg" : "text-fg-2 group-hover:text-fg",
                )}
              >
                {m.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 bottom-0 h-px origin-left bg-gradient-to-r from-violet-bright to-blue transition-transform duration-500 ease-[var(--ease-out-expo)] md:inset-x-5",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Technical viewport */}
      <div
        ref={viewportRef}
        className={cn(
          s.viewport,
          "relative aspect-[4/5] w-full rounded-[22px] border border-line shadow-[0_40px_120px_-50px_rgb(0_0_0/0.95)] xs:aspect-square sm:aspect-[4/3] md:rounded-[28px] lg:aspect-[16/9]",
        )}
        data-paused={!running}
      >
        <div className={s.grid} aria-hidden="true" />
        <div className={`${s.axis} ${s.axisX}`} aria-hidden="true" />
        <div className={`${s.axis} ${s.axisY}`} aria-hidden="true" />
        <div className={s.ticksTop} aria-hidden="true" />
        <div className={s.ticksLeft} aria-hidden="true" />

        {MODES.map((m) => {
          const selected = m.id === mode;
          return (
            <div
              key={m.id}
              id={`engine-panel-${m.id}`}
              role="tabpanel"
              aria-labelledby={`engine-tab-${m.id}`}
              aria-describedby="engine-caption"
              inert={!selected}
              data-active={selected}
              className={s.mode}
            >
              {m.id === "saas" && <SaaSScene />}
              {m.id === "web" && <WebScene />}
              {m.id === "motion" && <MotionScene active={selected && running} playing={!paused} onTogglePlay={() => setPaused((p) => !p)} />}
              {m.id === "product" && (
                <ProductStage
                  selected={selected}
                  running={running}
                  pointer={pointer}
                  reducedMotion={reduce}
                  mount={mountProduct}
                  quality={compact ? "low" : "high"}
                />
              )}
            </div>
          );
        })}

        {/* Frame chrome — precision labels & tiny indicators */}
        <div aria-hidden="true" className="corner-frame pointer-events-none absolute inset-3 md:inset-4" />
        <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 md:left-7 md:top-6">
          <span className="label-mono text-fg-2">
            Viewport <span className="text-fg-3">/</span> {current.index} — {current.label}
          </span>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-3 md:right-4 md:top-4">
          <span ref={coordsRef} aria-hidden="true" className="label-mono hidden tabular-nums text-fg-3 lg:inline">
            X +0.000  Y +0.000
          </span>
          <GlassTooltip content={paused ? "Resume all motion in the viewport" : "Pause all motion in the viewport"} side="bottom" align="end">
            {(tip) => (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={paused ? "Resume animations" : "Pause animations"}
                className="glass glass-subtle inline-flex size-11 items-center justify-center rounded-full text-fg-2 transition-colors hover:text-fg"
                {...tip}
              >
                {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              </button>
            )}
          </GlassTooltip>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-5 hidden items-center gap-2 md:bottom-6 md:left-7 md:flex">
          <span className={cn("size-1.5 rounded-full", running ? "bg-violet-bright shadow-[0_0_8px_rgb(168_85_247/0.9)]" : "bg-fg-3")} />
          <span className="label-mono text-fg-3">{running ? "Real-time" : "Paused"} · {current.tech}</span>
        </div>
      </div>

      {/* Caption */}
      <div className="grid gap-4 md:grid-cols-12 md:items-start md:gap-8">
        <p id="engine-caption" className="md:col-span-8" aria-live="polite">
          <span className="block font-display text-xl font-semibold tracking-[-0.02em] text-fg md:text-2xl">{current.title}</span>
          <span className="mt-2 block max-w-2xl text-[0.975rem] leading-relaxed text-fg-2">{current.description}</span>
        </p>
        <div className="md:col-span-4 md:flex md:justify-end">
          <Link
            href={current.href}
            className="label-mono group inline-flex min-h-11 items-center gap-2 rounded-full text-fg transition-colors hover:text-violet-bright"
          >
            Explore {current.cta}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
