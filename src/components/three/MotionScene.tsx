"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { GlassMediaControls } from "@/components/glass/GlassMediaControls";
import s from "./engine.module.css";

const LOOP_MS = 4800;
const FPS = 24;

interface Props {
  active: boolean;
  playing: boolean;
  onTogglePlay: () => void;
}

/**
 * MODE 4 — motion-design environment: preview artboard with a motion path and
 * onion-skin ghosts, a keyframe timeline, and floating editor panels. The playhead
 * and timecode read the REAL CSS animation clock (Web Animations API), so they're
 * always frame-accurate with the composition.
 */
export function MotionScene({ active, playing, onTogglePlay }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const [path, setPath] = useState<{ d: string; w: number; h: number } | null>(null);

  // Responsive motion path (offset-path needs px coordinates).
  useEffect(() => {
    const el = artboardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      const d = `M ${w * 0.1} ${h * 0.82} C ${w * 0.22} ${h * 0.2}, ${w * 0.34} ${h * 0.92}, ${w * 0.5} ${h * 0.48} S ${w * 0.62} ${h * 0.2}, ${w * 0.42} ${h * 0.3}`;
      setPath({ d, w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Timecode synced to the playhead animation.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !active) return;
    let raf = 0;
    const tick = () => {
      const anim = root
        .querySelector(`.${CSS.escape(s.playheadLine ?? "")}`)
        ?.getAnimations()[0];
      const t = typeof anim?.currentTime === "number" ? anim.currentTime % LOOP_MS : 0;
      if (timeRef.current) {
        const secs = Math.floor(t / 1000);
        const frames = Math.floor(((t % 1000) / 1000) * FPS);
        timeRef.current.textContent = `00:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Reduced motion: hold a composed frame instead of looping.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.getAnimations({ subtree: true }).forEach((a) => {
      a.currentTime = 3800;
      a.pause();
    });
  }, [path]);

  const restart = () => {
    rootRef.current?.getAnimations({ subtree: true }).forEach((a) => {
      a.currentTime = 0;
    });
  };

  const motionPath = path ? ({ "--motion-path": `path("${path.d}")` } as CSSProperties) : undefined;

  return (
    <div ref={rootRef} className={s.scene} style={{ perspective: "none" }}>
      <div className={s.motionWrap}>
        <div ref={artboardRef} className={s.artboard} style={motionPath}>
          <span className={`${s.mono} ${s.artboardLabel}`}>Comp 01 · 1920×1080 · 24fps</span>
          {path && (
            <svg className={s.pathSvg} viewBox={`0 0 ${path.w} ${path.h}`} aria-hidden="true">
              <path d={path.d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeDasharray="4 6" />
            </svg>
          )}
          {/* onion-skin ghosts placed along the same path */}
          {path &&
            [18, 42, 70].map((pct) => (
              <div
                key={pct}
                aria-hidden="true"
                style={{ position: "absolute", left: 0, top: 0, width: "4px", offsetPath: `path("${path.d}")`, offsetDistance: `${pct}%`, offsetRotate: "0deg" } as CSSProperties}
              >
                <span className={s.key} style={{ position: "absolute", opacity: 0.55, background: "var(--color-violet-bright)" }} />
              </div>
            ))}
          {/* Always mounted so its CSS clock starts with the playhead's (frame-accurate sync) */}
          {(
            <div className={s.mover}>
              <div className={`${s.panel} ${s.moverCard}`}>
                <span className={s.moverBadge}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <span style={{ display: "grid", gap: "0.5cqw", flex: 1 }}>
                  <span className={s.bar} style={{ width: "90%", background: "rgb(255 255 255 / 0.7)" }} />
                  <span className={s.bar} style={{ width: "60%" }} />
                </span>
              </div>
            </div>
          )}
          <div className={s.title} aria-hidden="true">
            <span className={s.titleMask}>
              <span className={s.titleLine}>Ship it</span>
            </span>
            <span className={s.titleMask}>
              <span className={`${s.titleLine} ${s.titleEm}`}>beautifully.</span>
            </span>
          </div>

          <div className={`${s.panel} ${s.floatPanel} ${s.easePanel}`}>
            <span className={s.mono}>Easing</span>
            <svg viewBox="0 0 100 70" aria-hidden="true" style={{ width: "100%" }}>
              <rect x="0.5" y="0.5" width="99" height="69" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" />
              <path d="M8 62 C 24 4, 40 6, 92 8" fill="none" stroke="#A855F7" strokeWidth="2" />
              <path d="M8 62 L24 4 M92 8 L40 6" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 3" />
              <circle cx="24" cy="4" r="3" fill="#189BE8" />
              <circle cx="40" cy="6" r="3" fill="#189BE8" />
            </svg>
            <span className={s.field}>
              cubic <b>.16, 1, .3, 1</b>
            </span>
          </div>

          <div className={`${s.panel} ${s.floatPanel} ${s.transformPanel}`}>
            <span className={s.mono}>Transform</span>
            {[
              ["Pos X", "960"],
              ["Pos Y", "540"],
              ["Scale", "108%"],
              ["Rotate", "0°"],
            ].map(([k, val]) => (
              <span key={k} className={s.field}>
                {k} <b>{val}</b>
              </span>
            ))}
          </div>
        </div>

        <div className={`${s.panel} ${s.timeline}`}>
          <div className={s.ruler}>
            <span className={s.mono}>Layers</span>
            <span className={s.rulerTicks}>
              {["0s", "1s", "2s", "3s", "4s"].map((t) => (
                <span key={t} className={s.mono}>
                  {t}
                </span>
              ))}
            </span>
          </div>
          {[
            { name: "Card · Position", keys: [0, 62], seg: [0, 62] },
            { name: "Card · Scale", keys: [0, 62, 70], seg: [0, 70] },
            { name: "Badge · Scale", keys: [60, 70, 76], seg: [60, 76] },
            { name: "Title · Reveal", keys: [52, 66, 90], seg: [52, 90] },
          ].map((track) => (
            <div key={track.name} className={s.track}>
              <span className={s.mono} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {track.name}
              </span>
              <span className={s.lane}>
                <span className={s.segment} style={{ left: `${track.seg[0]}%`, width: `${track.seg[1]! - track.seg[0]!}%` }} />
                {track.keys.map((k) => (
                  <span key={k} className={s.key} style={{ left: `${k}%` }} />
                ))}
              </span>
            </div>
          ))}
          <div className={s.playhead} aria-hidden="true">
            <span className={s.playheadLine} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[calc(5%+1cqw)] right-[calc(4%+1cqw)] z-10 max-[640px]:hidden">
        <GlassMediaControls playing={playing} onToggle={onTogglePlay} onRestart={restart} timeRef={timeRef} label="composition" />
      </div>
    </div>
  );
}
