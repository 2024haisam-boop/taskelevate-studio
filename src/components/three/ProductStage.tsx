"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils/cn";
import { ProjectArt } from "@/components/work/ProjectArt";
import type { PointerState, ProductView } from "./ProductScene";

// Heavy 3D bundle: client-only and split into its own chunk.
const ProductScene = dynamic(() => import("./ProductScene"), {
  ssr: false,
  loading: () => <ProductSkeleton />,
});

/** Warm the 3D chunk without mounting a WebGL context. */
export function prefetchProductScene() {
  void import("./ProductScene");
}

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const VIEWS: { id: ProductView; label: string; hint: string }[] = [
  { id: "wireframe", label: "Wireframe", hint: "Topology & hard edges" },
  { id: "clay", label: "Material", hint: "Clay sculpt for reading form" },
  { id: "final", label: "Final", hint: "Physically based materials & studio light" },
];

interface Props {
  /** Engine mode is "product" */
  selected: boolean;
  /** Section on screen + tab visible + not globally paused */
  running: boolean;
  pointer: RefObject<PointerState>;
  reducedMotion: boolean;
  /** Mount the canvas (first time the 3D mode is requested) */
  mount: boolean;
  quality: "high" | "low";
  className?: string;
  /** Show the representation toggle (always true in the engine) */
  showControls?: boolean;
  initialView?: ProductView;
  /** Controlled representation (overrides the internal toggle), e.g. for recording or scripted sequences */
  view?: ProductView;
  /** Camera framing multiplier passed to the scene (>1 = closer) */
  zoom?: number;
}

export function ProductStage({
  selected,
  running,
  pointer,
  reducedMotion,
  mount,
  quality,
  className,
  showControls = true,
  initialView = "final",
  view: controlledView,
  zoom,
}: Props) {
  const [internalView, setView] = useState<ProductView>(initialView);
  const view = controlledView ?? internalView;
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mount || webgl !== null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe runs once, client-only
    setWebgl(detectWebGL());
  }, [mount, webgl]);

  // Horizontal drag rotates the product on touch; vertical gestures keep scrolling the page.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let startX = 0;
    let base = 0;
    let dragging = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      dragging = true;
      startX = e.clientX;
      base = pointer.current?.dragYaw ?? 0;
    };
    const move = (e: PointerEvent) => {
      if (!dragging || !pointer.current) return;
      pointer.current.dragYaw = base + (e.clientX - startX) * 0.012;
    };
    const up = () => {
      dragging = false;
    };
    el.addEventListener("pointerdown", down, { passive: true });
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [pointer]);

  const active = selected && running;

  return (
    <div ref={stageRef} className={cn("absolute inset-0", className)}>
      {mount && webgl === true && (
        <ProductScene view={view} active={active} pointer={pointer} reducedMotion={reducedMotion} quality={quality} zoom={zoom} />
      )}
      {mount && webgl === false && <StaticProduct view={view} />}
      {!mount && <ProductSkeleton />}

      {showControls && (
        <div className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center px-4">
          <div role="group" aria-label="Product representation" className="glass glass-strong inline-flex gap-1 rounded-full p-1">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                title={v.hint}
                onClick={() => setView(v.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[0.8rem] font-medium transition-colors duration-200 sm:px-4 sm:text-[0.85rem]",
                  view === v.id ? "bg-fg text-bg" : "text-fg-2 hover:text-fg",
                )}
              >
                <ViewGlyph view={v.id} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {`Showing ${VIEWS.find((v) => v.id === view)?.label} view: ${VIEWS.find((v) => v.id === view)?.hint}.`}
        {webgl === false ? " Interactive 3D is not supported on this device; showing a static preview." : ""}
      </p>
    </div>
  );
}

function ViewGlyph({ view }: { view: ProductView }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      {view === "wireframe" && (
        <>
          <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" />
          <path d="M8 1.5v13M2 5l12 6M14 5 2 11" opacity="0.6" />
        </>
      )}
      {view === "clay" && (
        <>
          <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" fill="currentColor" fillOpacity="0.25" />
          <path d="M2 5l6 3.5L14 5M8 8.5v6" />
        </>
      )}
      {view === "final" && (
        <>
          <path d="M8 1.5 14 5v6l-6 3.5L2 11V5z" fill="currentColor" fillOpacity="0.55" />
          <path d="M5 4.5 9 3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Real loading state for the 3D chunk — a blueprint outline, not a fake progress sequence. */
function ProductSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 400 260" className="w-[56%] max-w-[520px] animate-pulse opacity-60" fill="none" stroke="rgba(179,166,255,0.55)" strokeWidth="1.2">
        <rect x="40" y="60" width="320" height="170" rx="30" />
        <rect x="70" y="40" width="150" height="20" rx="6" />
        <circle cx="225" cy="148" r="78" />
        <circle cx="225" cy="148" r="58" />
        <circle cx="225" cy="148" r="38" />
        <path d="M0 252 H400" strokeDasharray="4 6" opacity="0.5" />
      </svg>
    </div>
  );
}

/** Attractive no-WebGL fallback; the representation toggle still works. */
function StaticProduct({ view }: { view: ProductView }) {
  return (
    <div className="absolute inset-0">
      <div className={cn("absolute inset-0 transition-opacity duration-500", view === "wireframe" ? "opacity-100" : "opacity-0")}>
        <ProjectArt variant="product-exploded" uid="fallback-wire" />
      </div>
      <div className={cn("absolute inset-0 grayscale transition-opacity duration-500", view === "clay" ? "opacity-100" : "opacity-0")}>
        <ProjectArt variant="product-studio" uid="fallback-clay" />
      </div>
      <div className={cn("absolute inset-0 transition-opacity duration-500", view === "final" ? "opacity-100" : "opacity-0")}>
        <ProjectArt variant="product-studio" uid="fallback-final" />
      </div>
    </div>
  );
}
