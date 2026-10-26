"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import { ProductStage } from "@/components/three/ProductStage";
import type { PointerState } from "@/components/three/ProductScene";
import s from "@/components/three/engine.module.css";

/**
 * 3D Animation signature visual: the real-time product study in its own frame.
 * WebGL mounts only once the frame is near the viewport (after first paint), and
 * renders only while visible.
 */
export function ProductShowcase({ label = "Real-time study / Product 01" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, dragYaw: 0 });
  const near = useInView(ref, { rootMargin: "200px", once: true });
  const inView = useInView(ref, { rootMargin: "50px" });
  const visible = usePageVisible();
  const reduce = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const [mount, setMount] = useState(false);

  // Keep WebGL initialisation off the critical path: mount on the visitor's first interaction,
  // or once the page has settled — whichever comes first. The blueprint skeleton shows until then.
  useEffect(() => {
    if (!near || mount) return;
    const events = ["scroll", "pointermove", "pointerdown", "keydown", "touchstart"] as const;
    const go = () => setMount(true);
    events.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    const id = window.setTimeout(go, 2500);
    return () => {
      window.clearTimeout(id);
      events.forEach((ev) => window.removeEventListener(ev, go));
    };
  }, [near, mount]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        s.viewport,
        "theme-dark relative aspect-[4/5] w-full rounded-[var(--radius-card)] border border-line xs:aspect-square sm:aspect-[4/3] lg:aspect-[16/11]",
      )}
    >
      <div className={s.grid} aria-hidden="true" />
      <ProductStage
        selected
        running={inView && visible}
        pointer={pointer}
        reducedMotion={reduce}
        mount={mount}
        quality={compact ? "low" : "high"}
      />
      <div aria-hidden="true" className="corner-frame pointer-events-none absolute inset-3 md:inset-4" />
      <span aria-hidden="true" className="label-mono pointer-events-none absolute left-5 top-5 text-fg-2 md:left-7 md:top-6">
        {label}
      </span>
    </div>
  );
}
