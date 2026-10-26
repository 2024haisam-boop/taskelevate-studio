"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const CHIPS: { label: string; tone: "solid" | "violet" | "glass" | "blue" }[] = [
  { label: "SaaS Animation", tone: "solid" },
  { label: "3D Product Films", tone: "violet" },
  { label: "Interactive Websites", tone: "glass" },
  { label: "Video Editing", tone: "blue" },
  { label: "Blender", tone: "glass" },
  { label: "WebGL", tone: "violet" },
  { label: "Launch Videos", tone: "glass" },
  { label: "UI Motion", tone: "solid" },
  { label: "Talking-head Edits", tone: "glass" },
  { label: "3D Showcases", tone: "blue" },
  { label: "Motion Graphics", tone: "glass" },
  { label: "Creative Dev", tone: "violet" },
];

const toneClass = {
  solid: "bg-fg text-bg",
  violet: "bg-gradient-to-br from-violet to-violet-bright text-white",
  blue: "bg-gradient-to-br from-blue to-[#3d6bff] text-white",
  glass: "border border-black/10 bg-white text-fg",
};

/**
 * A box of service chips with real physics (Matter.js, lazy-loaded when the box is 60% visible). Chips drop in;
 * grab and throw them. Only touches that start ON a chip drag it, so page scrolling is never hijacked.
 * Reduced motion → static layout.
 */
export function PhysicsChips({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [physics, setPhysics] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const Matter = (await import("matter-js")).default;
        if (cancelled) return;
        cleanup = startPhysics(Matter, box);
        setPhysics(true);
      },
      { threshold: 0.6 },
    );
    io.observe(box);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className={cn("relative h-[min(52svh,460px)] overflow-hidden rounded-[var(--radius-card)] border border-line bg-bg-2", className)}
      aria-label="Services, as playful chips"
      role="group"
    >
      <p className="label-mono pointer-events-none absolute left-5 top-5 z-10 text-fg-3">{physics ? "Grab & throw" : "What we make"}</p>
      <ul className={physics ? "" : "flex h-full flex-wrap content-end gap-3 p-6 pt-14"}>
        {CHIPS.map((c) => (
          <li
            key={c.label}
            data-chip
            className={`select-none whitespace-nowrap rounded-full px-5 py-3 font-display text-[clamp(0.95rem,1.6vw,1.35rem)] font-semibold tracking-[-0.01em] shadow-[0_14px_28px_-16px_rgb(0_0_0/0.45)] ${toneClass[c.tone]} ${
              physics ? "absolute left-0 top-0 cursor-grab touch-none active:cursor-grabbing" : "inline-block"
            }`}
          >
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type MatterNS = typeof import("matter-js");

function startPhysics(Matter: MatterNS, box: HTMLElement): () => void {
  const { Engine, Bodies, Body, Composite, Constraint } = Matter;
  const chips = Array.from(box.querySelectorAll<HTMLElement>("[data-chip]"));
  const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });
  const W = box.clientWidth;
  const H = box.clientHeight;
  const wallOpts = { isStatic: true, restitution: 0.3, friction: 0.4 };
  const T = 200;
  Composite.add(engine.world, [
    Bodies.rectangle(W / 2, H + T / 2, W * 3, T, wallOpts),
    Bodies.rectangle(-T / 2, H / 2, T, H * 4, wallOpts),
    Bodies.rectangle(W + T / 2, H / 2, T, H * 4, wallOpts),
  ]);

  const bodies = chips.map((el, i) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = Math.min(W - w / 2 - 8, Math.max(w / 2 + 8, (W * (0.15 + ((i * 0.37) % 0.7)))));
    const y = -h - i * (h * 0.9) - 20;
    const body = Bodies.rectangle(x, y, w, h, {
      chamfer: { radius: h / 2 },
      restitution: 0.35,
      friction: 0.2,
      frictionAir: 0.012,
      density: 0.0016,
      angle: (Math.random() - 0.5) * 0.6,
    });
    Composite.add(engine.world, body);
    return { el, body, w, h };
  });

  // Pointer dragging — only when the gesture starts on a chip (touch-action: none on chips only)
  let drag: { constraint: Matter.Constraint; pointerId: number } | null = null;
  const local = (e: PointerEvent) => {
    const r = box.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: PointerEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-chip]");
    const entry = bodies.find((b) => b.el === target);
    if (!entry) return;
    const p = local(e);
    const constraint = Constraint.create({
      pointA: p,
      bodyB: entry.body,
      pointB: { x: p.x - entry.body.position.x, y: p.y - entry.body.position.y },
      stiffness: 0.18,
      damping: 0.08,
      length: 0,
    });
    Composite.add(engine.world, constraint);
    drag = { constraint, pointerId: e.pointerId };
    target?.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.constraint.pointA = local(e);
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    Composite.remove(engine.world, drag.constraint);
    drag = null;
  };
  box.addEventListener("pointerdown", onDown);
  box.addEventListener("pointermove", onMove);
  box.addEventListener("pointerup", onUp);
  box.addEventListener("pointercancel", onUp);

  // Run only while visible
  let raf = 0;
  let last = performance.now();
  let visible = true;
  const step = () => {
    const now = performance.now();
    Engine.update(engine, Math.min(1000 / 30, now - last));
    last = now;
    for (const { el, body, w, h } of bodies) {
      if (body.position.y > H + 400) Body.setPosition(body, { x: W / 2, y: -h });
      el.style.transform = `translate3d(${(body.position.x - w / 2).toFixed(1)}px, ${(body.position.y - h / 2).toFixed(1)}px, 0) rotate(${body.angle.toFixed(3)}rad)`;
    }
    raf = visible ? requestAnimationFrame(step) : 0;
  };
  const io = new IntersectionObserver(([e]) => {
    visible = Boolean(e?.isIntersecting);
    if (visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  });
  io.observe(box);
  raf = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    box.removeEventListener("pointerdown", onDown);
    box.removeEventListener("pointermove", onMove);
    box.removeEventListener("pointerup", onUp);
    box.removeEventListener("pointercancel", onUp);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  };
}
