"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useLazyGsap } from "@/lib/animations/useLazyGsap";
import { cn } from "@/lib/utils/cn";
import s from "./spatial.module.css";

const STAGES = [
  { title: "Flat interface", text: "A finished, realistic product page — exactly as a visitor sees it today." },
  { title: "Layers separate", text: "Every part of the interface lifts onto its own plane." },
  { title: "Perspective", text: "The camera turns and the structure underneath becomes visible." },
  { title: "Interactive", text: "Components wake up. Try the finish swatches on the top layer." },
  { title: "Dimensional", text: "The composition settles into its final, explorable form." },
];

const LAYERS = ["Base", "Layout", "Media", "Type", "Interaction"] as const;
const ACCENTS = [
  { id: "violet", label: "Violet finish", color: "#a855f7" },
  { id: "blue", label: "Blue finish", color: "#189be8" },
  { id: "white", label: "Silver finish", color: "#e9ebf2" },
] as const;

type Accent = (typeof ACCENTS)[number]["id"];

/**
 * SIGNATURE EXPERIENCE (brief §12). Native scrolling over a tall track drives a GSAP
 * scrub while a sticky stage stays in view — nothing is pinned, locked or snapped and
 * touch gestures are never intercepted. When the sequence completes, the visitor can
 * explore: pointer tilt, a depth slider and layer focus. Reduced motion → final state
 * immediately, no scroll-driven animation, controls available.
 */
export function SpatialExperience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(0);
  const [stage, setStage] = useState(0);
  const [complete, setComplete] = useState(false);
  const [depth, setDepth] = useState(50);
  const [focus, setFocus] = useState<number | null>(null);
  const [accent, setAccent] = useState<Accent>("violet");

  useLazyGsap(trackRef, ({ gsap, ScrollTrigger }) => {
    const box = boxRef.current;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!box || !root || !track) return;
    const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", root);
    const labels = gsap.utils.toArray<HTMLElement>("[data-label]", root);
    const hotspots = gsap.utils.toArray<HTMLElement>("[data-hotspot]", root);
    const unit = () => box.clientWidth / 1000; // scale depth with the composition

    const finalState = () => {
      gsap.set(root, { rotationX: 40, rotationZ: -24, scale: 0.82, yPercent: 5 });
      gsap.set(layers, { z: (i: number) => i * 48 * unit() });
      gsap.set(labels, { opacity: 1 });
      gsap.set(hotspots, { opacity: 1 });
    };

    const mm = gsap.matchMedia();
    mm.add({ reduce: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean };
      if (reduce) {
        finalState();
        setStage(4);
        setComplete(true);
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const next = Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length * 0.999 + 0.0001));
            if (next !== stageRef.current) {
              stageRef.current = next;
              setStage(next);
            }
            if (self.progress > 0.96) setComplete(true);
          },
        },
      });

      tl.to({}, { duration: 0.12 })
        // Stage 2 — layers separate through depth (a slight tilt makes the separation legible)
        .to(root, { rotationX: 16, scale: 0.95, yPercent: 2, duration: 0.2, ease: "power1.inOut" }, 0.14)
        .to(layers, { z: (i: number) => i * 26 * unit(), duration: 0.2, ease: "power1.inOut" }, 0.14)
        // Stage 3 — perspective becomes visible
        .to(root, { rotationX: 54, rotationZ: -34, scale: 0.76, yPercent: 7, duration: 0.24, ease: "power2.inOut" }, 0.36)
        .to(layers, { z: (i: number) => i * 60 * unit(), duration: 0.24, ease: "power2.inOut" }, 0.36)
        .to(labels, { opacity: 1, duration: 0.08, stagger: 0.02 }, 0.48)
        // Stage 4 — components become interactive (the interaction layer lifts toward you)
        .to(hotspots, { opacity: 1, duration: 0.06, stagger: 0.02 }, 0.6)
        .to(layers[4] ?? {}, { z: () => (4 * 60 + 28) * unit(), duration: 0.12, ease: "power2.out" }, 0.62)
        // Stage 5 — settle into a polished dimensional layout
        .to(root, { rotationX: 40, rotationZ: -24, scale: 0.82, yPercent: 5, duration: 0.2, ease: "power2.out" }, 0.8)
        .to(layers, { z: (i: number) => i * 48 * unit(), duration: 0.2, ease: "power2.out" }, 0.8);
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("orientationchange", onResize);
      mm.revert();
    };
  });

  // Pointer tilt for free exploration once the sequence is complete (fine pointers only)
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!complete || e.pointerType !== "mouse") return;
    const el = tiltRef.current;
    const box = boxRef.current;
    if (!el || !box) return;
    const r = box.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    el.style.setProperty("--tx", `${(x * 7).toFixed(2)}deg`);
    el.style.setProperty("--ty", `${(-y * 6).toFixed(2)}deg`);
  };
  const resetTilt = () => {
    tiltRef.current?.style.setProperty("--tx", "0deg");
    tiltRef.current?.style.setProperty("--ty", "0deg");
  };
  const resetAll = () => {
    setDepth(50);
    setFocus(null);
    setAccent("violet");
    resetTilt();
  };

  const explore = ((depth - 50) / 50).toFixed(3);

  return (
    <div
      ref={trackRef}
      className="relative h-[240vh] md:h-[280vh] lg:h-[300vh] motion-reduce:h-auto"
    >
      <a
        href="#process-title"
        className="sr-only z-20 rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip the interactive demo
      </a>
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-x-clip py-6 motion-reduce:static motion-reduce:min-h-0 motion-reduce:py-16">
        <div className="container-x grid w-full items-center gap-8 pt-[calc(var(--nav-top)+var(--nav-h))] lg:grid-cols-12 lg:gap-10 lg:pt-12">
          {/* Stage narrative — text, never animation alone, communicates each step */}
          <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3">
            <ol className="hidden flex-col gap-1 lg:flex" aria-label="Transformation stages">
              {STAGES.map((st, i) => (
                <li
                  key={st.title}
                  aria-current={i === stage ? "step" : undefined}
                  className={cn(
                    "rounded-2xl border px-4 py-3 transition-[border-color,background-color,opacity] duration-500",
                    i === stage ? "border-white/15 bg-white/[0.045]" : "border-transparent",
                  )}
                >
                  <span className={cn("label-mono", i === stage ? "text-fg" : "text-fg-3")}>
                    <span className={i <= stage ? "text-violet-bright" : undefined}>{String(i + 1).padStart(2, "0")}</span> / {st.title}
                  </span>
                  <span
                    className={cn(
                      "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
                      i === stage ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="block pt-2 text-[0.9rem] leading-relaxed text-fg-2">{st.text}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            {/* compact stage readout (mobile/tablet) */}
            <div className="lg:hidden" aria-live="polite">
              <div className="flex gap-1.5" aria-hidden="true">
                {STAGES.map((st, i) => (
                  <span key={st.title} className={cn("h-0.5 flex-1 rounded-full transition-colors duration-500", i <= stage ? "bg-violet-bright" : "bg-white/12")} />
                ))}
              </div>
              <p className="mt-4 label-mono text-fg-2">
                <span className="text-violet-bright">{String(stage + 1).padStart(2, "0")}</span> / {STAGES[stage]?.title}
              </p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-fg-2">{STAGES[stage]?.text}</p>
            </div>

            {/* Exploration controls */}
            <fieldset
              disabled={!complete}
              className={cn("mt-6 rounded-2xl border border-line p-4 transition-opacity duration-500 lg:mt-5", complete ? "opacity-100" : "opacity-40")}
            >
              <legend className="label-mono px-1 text-fg-3">Explore</legend>
              <label htmlFor="spatial-depth" className="flex items-center justify-between text-[0.85rem] text-fg-2">
                Layer depth <span className="font-mono text-[11px] text-fg-3">{depth}%</span>
              </label>
              <input
                id="spatial-depth"
                type="range"
                min={0}
                max={100}
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="mt-2 h-11 w-full cursor-pointer accent-[#a855f7]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Focus a layer">
                <FocusChip active={focus === null} onClick={() => setFocus(null)}>
                  All
                </FocusChip>
                {LAYERS.map((l, i) => (
                  <FocusChip key={l} active={focus === i} onClick={() => setFocus(focus === i ? null : i)}>
                    {l}
                  </FocusChip>
                ))}
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full text-[0.8rem] text-fg-3 transition-colors hover:text-fg"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" /> Reset view
              </button>
            </fieldset>
          </div>

          {/* The composition */}
          <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9">
            <p className="sr-only">
              Interactive demonstration: a flat product page separates into five layers — base, layout, media,
              typography and interaction — rotates into perspective and settles into a dimensional layout.
            </p>
            <div ref={boxRef} className={s.stageBox} onPointerMove={onPointerMove} onPointerLeave={resetTilt}>
              <div ref={tiltRef} className={s.tilt}>
                <div ref={rootRef} className={s.root} data-accent={accent}>
                  <Layer index={0} focus={focus} explore={explore} label="Base canvas">
                    <div className={s.base} />
                  </Layer>

                  <Layer index={1} focus={focus} explore={explore} label="Layout grid">
                    <div className={`${s.block} ${s.navBlock}`} aria-hidden="true">
                      <span className="flex items-center gap-[1cqw]">
                        <span className="block size-[2.2cqw] rounded-[0.6cqw] bg-gradient-to-br from-blue to-violet-bright" />
                        <span className={s.line} style={{ width: "6cqw" }} />
                      </span>
                      <span className="flex gap-[1.6cqw]">
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className={s.line} style={{ width: "4.5cqw" }} />
                        ))}
                      </span>
                      <span className="block size-[2.4cqw] rounded-full border border-white/20" />
                    </div>
                    <div className={`${s.block} ${s.mediaBlock}`} aria-hidden="true" />
                    <div className={`${s.block} ${s.infoBlock}`} aria-hidden="true" />
                  </Layer>

                  <Layer index={2} focus={focus} explore={explore} label="Media">
                    <div className={s.media} aria-hidden="true">
                      <ProductIllustration />
                    </div>
                  </Layer>

                  <Layer index={3} focus={focus} explore={explore} label="Typography">
                    <div className={s.type} aria-hidden="true">
                      <span className={s.eyebrow}>New · Studio series</span>
                      <span className={s.heading}>
                        Capture
                        <br />
                        the <em>light.</em>
                      </span>
                      <span className={s.body}>
                        <span className={s.line} style={{ width: "100%" }} />
                        <span className={s.line} style={{ width: "86%" }} />
                        <span className={s.line} style={{ width: "64%" }} />
                      </span>
                    </div>
                  </Layer>

                  <Layer index={4} focus={focus} explore={explore} label="Interaction">
                    <div className={s.controls}>
                      <div className={s.swatches} role="group" aria-label="Product finish (demo)">
                        {ACCENTS.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className={s.swatch}
                            style={{ background: a.color }}
                            aria-pressed={accent === a.id}
                            aria-label={a.label}
                            onClick={() => setAccent(a.id)}
                          />
                        ))}
                      </div>
                      <span className={s.buy} aria-hidden="true">
                        Add to bag
                      </span>
                      <span className={s.chips} aria-hidden="true">
                        <span className={s.chip}>4K · 60</span>
                        <span className={s.chip}>f/1.8</span>
                      </span>
                    </div>
                    <span data-hotspot className={s.hotspot} style={{ left: "63%", top: "68.5%" }} aria-hidden="true" />
                    <span data-hotspot className={s.hotspot} style={{ left: "88%", top: "80%" }} aria-hidden="true" />
                    <div className={s.cursor} aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M4 2.5v17.2l4.7-4.4 3.1 6.9 3.2-1.4-3.1-6.8h6.5z" fill="#F8F9FD" stroke="#08090D" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Layer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layer({
  index,
  focus,
  explore,
  label,
  children,
}: {
  index: number;
  focus: number | null;
  explore: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div data-layer className={s.layerOuter} data-dim={focus !== null && focus !== index}>
      <div className={s.layerInner} style={{ "--li": index, "--explore": explore } as CSSProperties}>
        {children}
        <span data-label className={s.label} aria-hidden="true">
          <span>
            <span className={s.labelIndex}>L{index}</span> · {label}
          </span>
        </span>
      </div>
    </div>
  );
}

function FocusChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3 text-[0.75rem] font-medium transition-colors duration-200",
        active ? "border-white/30 bg-white/10 text-fg" : "border-line text-fg-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function ProductIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none">
      <ellipse cx="200" cy="262" rx="150" ry="14" fill="#000" opacity="0.55" />
      <rect x="40" y="70" width="320" height="176" rx="32" fill="#1d1f27" stroke="rgba(255,255,255,0.16)" />
      <rect x="40" y="70" width="320" height="56" rx="28" fill="rgba(255,255,255,0.05)" />
      <rect x="70" y="52" width="120" height="20" rx="6" fill="#c9cdd6" opacity="0.85" />
      <rect x="292" y="58" width="34" height="14" rx="5" fill="#c9cdd6" opacity="0.85" />
      <circle cx="216" cy="160" r="76" fill="#0c0d12" stroke="rgba(255,255,255,0.2)" />
      <circle cx="216" cy="160" r="66" fill="#15171e" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="216" cy="160" r="50" fill="#07080c" />
      <circle cx="216" cy="160" r="34" fill="#151230" />
      <ellipse cx="200" cy="142" rx="13" ry="8" fill="rgba(255,255,255,0.4)" transform="rotate(-30 200 142)" />
      <circle cx="336" cy="98" r="4" fill="var(--accent)" />
    </svg>
  );
}
