"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { deviceTier } from "@/lib/device";
import { cn } from "@/lib/utils/cn";
import { detectWebGL } from "@/components/three/ProductStage";
import { WebScene } from "@/components/three/WebScene";
import { HOTSPOTS, type CaseFinish, type DialColor, type DragState, type StrapColor, type WatchConfig } from "@/components/three/watchConfig";
import s from "@/components/three/engine.module.css";
import { SceneViewport } from "./SceneViewport";

// Heavy 3D bundle: this page only, client-only, its own chunk.
const WatchScene = dynamic(() => import("@/components/three/WatchScene"), { ssr: false });

const FINISHES: { id: CaseFinish; label: string; swatch: string }[] = [
  { id: "steel", label: "Steel", swatch: "linear-gradient(135deg,#f4f5f8,#9ea3ad)" },
  { id: "gold", label: "Gold", swatch: "linear-gradient(135deg,#ffe4a3,#b8862f)" },
  { id: "ceramic", label: "Ceramic", swatch: "linear-gradient(135deg,#3a3a44,#0c0c10)" },
];
const DIALS: { id: DialColor; label: string; swatch: string }[] = [
  { id: "midnight", label: "Midnight", swatch: "radial-gradient(circle at 35% 30%,#3b56b8,#101a45)" },
  { id: "ivory", label: "Ivory", swatch: "radial-gradient(circle at 35% 30%,#fffaf0,#d9cdb3)" },
  { id: "emerald", label: "Emerald", swatch: "radial-gradient(circle at 35% 30%,#2bb38a,#0a4434)" },
  { id: "violet", label: "Violet", swatch: "radial-gradient(circle at 35% 30%,#9b6bff,#3a148f)" },
];
const STRAPS: { id: StrapColor; label: string; swatch: string }[] = [
  { id: "tan", label: "Tan leather", swatch: "linear-gradient(135deg,#c08552,#6e4122)" },
  { id: "rubber", label: "Black rubber", swatch: "linear-gradient(135deg,#3a3a40,#0e0e11)" },
  { id: "lilac", label: "Lilac weave", swatch: "linear-gradient(135deg,#e2d6ff,#a58ae6)" },
];

/**
 * Interactive Websites' signature visual: a website you can play with, right on the service page — a real-time 3D
 * product configurator (WatchScene). Drag to turn it (vertical swipes still scroll the page on touch), choose the
 * case / dial / strap, explode it into its layers, or open it full screen. WebGL mounts once the frame is near and
 * the page has settled, and renders only while visible. Without WebGL: the earlier CSS depth study.
 */
export function WebShowcase({ caption }: { caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { rootMargin: "200px", once: true });
  const inView = useInView(ref, { rootMargin: "50px" });
  const visible = usePageVisible();
  const reduce = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const [mount, setMount] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<WatchConfig>({ finish: "steel", dial: "violet", strap: "tan" });
  const [exploded, setExploded] = useState(false);
  const [full, setFull] = useState(false);
  const [touched, setTouched] = useState(false);
  const drag = useRef<DragState>({ yaw: 0, pitch: 0, last: -1e9 });
  const labels = useRef<(HTMLElement | null)[]>([]);

  // mount on the first interaction, or once the page has settled
  useEffect(() => {
    if (!near || mount) return;
    const events = ["scroll", "pointermove", "pointerdown", "keydown", "touchstart"] as const;
    const go = () => setMount(true);
    events.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    const id = window.setTimeout(go, 1200);
    return () => {
      window.clearTimeout(id);
      events.forEach((ev) => window.removeEventListener(ev, go));
    };
  }, [near, mount]);
  useEffect(() => {
    if (!mount || webgl !== null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe runs once, client-only
    setWebgl(detectWebGL());
  }, [mount, webgl]);

  // drag to turn, with a little inertia; horizontal on touch (vertical keeps scrolling the page)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false, lx = 0, ly = 0, vx = 0, vy = 0, raf = 0;
    const glide = () => {
      const d = drag.current;
      vx *= 0.92;
      vy *= 0.92;
      d.yaw += vx;
      d.pitch = Math.max(-0.6, Math.min(0.6, d.pitch + vy));
      d.last = performance.now();
      raf = Math.abs(vx) + Math.abs(vy) > 0.0005 ? requestAnimationFrame(glide) : 0;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("button")) return;
      down = true;
      lx = e.clientX;
      ly = e.clientY;
      vx = vy = 0;
      cancelAnimationFrame(raf);
      el.setPointerCapture(e.pointerId);
      setTouched(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const d = drag.current;
      vx = (e.clientX - lx) * 0.009;
      vy = e.pointerType === "touch" ? 0 : (e.clientY - ly) * 0.006;
      d.yaw += vx;
      d.pitch = Math.max(-0.6, Math.min(0.6, d.pitch + vy));
      d.last = performance.now();
      lx = e.clientX;
      ly = e.clientY;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      raf = requestAnimationFrame(glide);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // full screen: lock the page behind it; Esc closes
  useEffect(() => {
    if (!full) return;
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [full]);

  if (webgl === false)
    return (
      <SceneViewport label="Spatial web / Depth study" caption={caption}>
        <WebScene />
      </SceneViewport>
    );


  return (
    <figure className="m-0">
      <div
        ref={ref}
        className={cn(
          s.viewport,
          "web-showcase theme-dark relative w-full touch-pan-y select-none overflow-hidden border border-line",
          full ? "fixed inset-0 z-[70] rounded-none" : "aspect-[4/5] rounded-[var(--radius-card)] xs:aspect-square sm:aspect-[4/3] lg:aspect-[16/11]",
        )}
        role="group"
        aria-label="Interactive 3D product configurator (demo)"
      >
        <div className={s.grid} aria-hidden="true" />
        <div aria-hidden="true" className="web-showcase-glow" />
        {mount && webgl && (
          <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
            <WatchScene config={config} exploded={exploded} active={inView && visible} quality={compact || deviceTier() === "low" ? "low" : "high"} reducedMotion={reduce} drag={drag} labels={labels} onReady={() => setReady(true)} />
            {/* the exploded view's layer labels (positioned by the scene) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              {HOTSPOTS.map((h, i) => (
                <span key={h.key} ref={(el) => void (labels.current[i] = el)} className="watch-label" data-side={h.at[0] > 0 ? "right" : "left"} style={{ opacity: 0 }}>
                  {h.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {!ready && <div aria-hidden="true" className="web-showcase-skeleton" />}

        <span aria-hidden="true" className="label-mono pointer-events-none absolute left-5 top-5 text-fg-2 md:left-7 md:top-6">
          Live WebGL<span className="max-sm:hidden"> · Configurator</span>
        </span>
        <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6 md:top-5">
          <span aria-hidden="true" className={cn("web-showcase-hint label-mono", touched && "opacity-0")}>
            Drag to turn
          </span>
          <button type="button" className="web-showcase-btn" onClick={() => setFull((v) => !v)} aria-label={full ? "Exit full screen" : "Open full screen"}>
            {full ? "✕" : "⤢"}
          </button>
        </div>

        <div className="web-showcase-controls">
          <Swatches label="Case" items={FINISHES} value={config.finish} onPick={(finish) => setConfig((c) => ({ ...c, finish }))} />
          <Swatches label="Dial" items={DIALS} value={config.dial} onPick={(dial) => setConfig((c) => ({ ...c, dial }))} />
          <Swatches label="Strap" items={STRAPS} value={config.strap} onPick={(strap) => setConfig((c) => ({ ...c, strap }))} />
          <button type="button" className="web-showcase-explode" aria-pressed={exploded} onClick={() => setExploded((v) => !v)}>
            {exploded ? "Assemble" : "Explode"} <span aria-hidden="true">{exploded ? "◎" : "✦"}</span>
          </button>
        </div>
        <p className="web-showcase-note label-mono" aria-hidden="true">
          Demo product · <span className="max-sm:hidden">modelled &amp; </span>rendered live in your browser
        </p>
      </div>
      {caption && <figcaption className="mt-4 text-sm text-fg-3">{caption}</figcaption>}
    </figure>
  );
}

function Swatches<T extends string>({ label, items, value, onPick }: { label: string; items: { id: T; label: string; swatch: string }[]; value: T; onPick: (id: T) => void }) {
  return (
    <div className="web-showcase-group" role="radiogroup" aria-label={label}>
      <span className="label-mono" aria-hidden="true">
        {label}
      </span>
      <div className="flex gap-1.5">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            role="radio"
            aria-checked={value === it.id}
            aria-label={`${label}: ${it.label}`}
            title={it.label}
            className="web-showcase-swatch"
            style={{ background: it.swatch }}
            onClick={() => onPick(it.id)}
          />
        ))}
      </div>
    </div>
  );
}
