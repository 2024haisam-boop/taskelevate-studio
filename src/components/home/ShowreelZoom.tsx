"use client";

import { Play, X } from "lucide-react";
import { useRef } from "react";
import { reel } from "@/data/media";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { RotatingBadge } from "@/components/ui/RotatingBadge";

/**
 * BEAT 3 — the showreel grows from a small card to full screen while you scroll (sticky stage, transform-only),
 * with a rotating "Play reel" badge. Clicking opens the reel with sound controls in a native <dialog>.
 */
export function ShowreelZoom() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  useScrollProgress(trackRef, (p) => {
    const e = Math.min(1, p / 0.7); // finish growing at 70%, then hold full screen
    stageRef.current?.style.setProperty("--g", (e * e * (3 - 2 * e)).toFixed(4));
  });

  const open = () => {
    dialogRef.current?.showModal();
    void playerRef.current?.play().catch(() => undefined);
  };
  const close = () => {
    playerRef.current?.pause();
    dialogRef.current?.close();
  };

  return (
    <section ref={trackRef} aria-label="Showreel" className="relative h-[200svh] motion-reduce:h-auto">
      <div ref={stageRef} className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden [--g:0] motion-reduce:static motion-reduce:h-auto motion-reduce:py-24 motion-reduce:[--g:0.85]">
        {/* captions that part as the reel grows */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute left-[6vw] top-[22%] font-display text-[clamp(2.4rem,8vw,7.5rem)] font-bold uppercase leading-none tracking-[-0.05em] text-fg"
          style={{ transform: "translate3d(calc(var(--g) * -40vw), 0, 0)", opacity: "calc(1 - var(--g) * 1.4)" }}
        >
          See it
        </p>
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[22%] right-[6vw] font-display text-[clamp(2.4rem,8vw,7.5rem)] font-bold uppercase leading-none tracking-[-0.05em] text-violet-bright"
          style={{ transform: "translate3d(calc(var(--g) * 40vw), 0, 0)", opacity: "calc(1 - var(--g) * 1.4)" }}
        >
          <em>in motion.</em>
        </p>

        <button
          type="button"
          onClick={open}
          data-cursor="Play reel"
          aria-label="Play reel"
          className="group relative h-[100svh] w-screen overflow-hidden outline-offset-[-6px]"
          style={{
            transform: "scale(calc(0.36 + var(--g) * 0.64))",
            borderRadius: "calc((1 - var(--g)) * 64px)",
          }}
        >
          <InViewVideo src={reel.src} poster={reel.poster} className="absolute inset-0 scale-[1.02]" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/20" />
          <span className="absolute inset-0 flex items-center justify-center" style={{ transform: "scale(calc(1.8 - var(--g) * 0.8))" }}>
            <RotatingBadge text="Play reel" size={150} className="text-fg">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-fg text-bg transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 size-6" aria-hidden="true" />
              </span>
            </RotatingBadge>
          </span>
          <span aria-hidden="true" className="label-mono absolute bottom-6 left-6 text-fg-2" style={{ opacity: "var(--g)" }}>
            {reel.label}
          </span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Studio reel"
        onClose={() => playerRef.current?.pause()}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(1200px,calc(100vw-24px))] bg-transparent p-0 text-fg backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        <div className="glass glass-strong overflow-hidden rounded-[var(--radius-panel)] p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="label-mono text-fg-2">{reel.label}</span>
            <button type="button" onClick={close} aria-label="Close reel" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <video ref={playerRef} src={reel.src} poster={reel.poster} controls playsInline preload="none" className="aspect-video w-full rounded-[calc(var(--radius-panel)-8px)] bg-black" />
        </div>
      </dialog>
    </section>
  );
}
