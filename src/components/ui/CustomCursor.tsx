"use client";

import { useEffect, useRef, useState } from "react";

export interface CursorInfo {
  label: string;
  hint?: string;
}

const EVENT = "tes:cursor";

/** Show (or clear) a contextual label next to the pointer — e.g. from a WebGL hover. */
export function setCursor(info: CursorInfo | null) {
  window.dispatchEvent(new CustomEvent<CursorInfo | null>(EVENT, { detail: info }));
}

/**
 * Contextual cursor companion (fine pointers only). The native cursor stays visible for accessibility;
 * a ring follows it and expands with a label over interactive things:
 *   - any element with `data-cursor="View"` (text) shows that label
 *   - WebGL scenes call setCursor({ label })
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [info, setInfo] = useState<CursorInfo | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(mql.matches);
    const raf = requestAnimationFrame(sync);
    mql.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      mql.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current;
    if (!ring) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { x: -100, y: -100 };
    const cur = { x: -100, y: -100 };
    let raf = 0;
    let fromAttr: CursorInfo | null = null;
    let fromEvent: CursorInfo | null = null;
    const apply = () => setInfo(fromEvent ?? fromAttr);

    const tick = () => {
      const k = reduce ? 1 : 0.2;
      cur.x += (pos.x - cur.x) * k;
      cur.y += (pos.y - cur.y) * k;
      ring.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0)`;
      raf = Math.abs(pos.x - cur.x) + Math.abs(pos.y - cur.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      ring.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-cursor]");
      const next = el ? { label: el.dataset.cursor ?? "" } : null;
      if ((next?.label ?? null) !== (fromAttr?.label ?? null)) {
        fromAttr = next;
        apply();
      }
    };
    const onEvent = (e: Event) => {
      fromEvent = (e as CustomEvent<CursorInfo | null>).detail;
      apply();
    };
    const leave = () => {
      ring.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener(EVENT, onEvent);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener(EVENT, onEvent);
      document.documentElement.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ringRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90] opacity-0 transition-opacity duration-200">
      <div
        className={`flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,translate] duration-300 ease-[var(--ease-out-expo)] ${
          info
            ? "h-auto min-h-9 w-auto translate-x-3 translate-y-3 border-transparent bg-fg px-3.5 py-2"
            : "size-2 -translate-x-1/2 -translate-y-1/2 border-transparent bg-transparent opacity-0"
        }`}
      >
        {info && (
          <span className="whitespace-nowrap font-mono text-[0.8rem] uppercase text-bg">
            {info.label}
            {info.hint && <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bg/60">{info.hint} ↗</span>}
          </span>
        )}
      </div>
    </div>
  );
}
