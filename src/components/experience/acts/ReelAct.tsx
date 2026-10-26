"use client";

import { Play, X } from "lucide-react";
import { useRef } from "react";
import { reel } from "@/data/media";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
import { useAct } from "../useAct";

/**
 * ACT 3 — THE POOL. The bottom of the well plays the studio reel; a rotating "Play reel" badge opens it with
 * sound controls in a native <dialog>. Scrolling on plunges the camera through the surface into the studio.
 */
export function ReelAct() {
  const ref = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);
  useAct("reel", ref);

  const open = () => {
    dialogRef.current?.showModal();
    void playerRef.current?.play().catch(() => undefined);
  };
  const close = () => {
    playerRef.current?.pause();
    dialogRef.current?.close();
  };

  return (
    <section ref={ref} data-act="reel" aria-label="Showreel" className="act relative h-[180svh]">
      <div className="act-stage pointer-events-none sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <p
          aria-hidden="true"
          className="world-on-only absolute left-[6vw] top-[20%] font-display text-[clamp(2.4rem,8vw,7.5rem)] font-bold uppercase leading-none tracking-[-0.05em] text-fg"
          style={{ transform: "translate3d(calc(var(--ap) * -30vw), 0, 0)", opacity: "clamp(0, calc(1.25 - var(--ap) * 1.9), 1)" }}
        >
          See it
        </p>
        <p
          aria-hidden="true"
          className="world-on-only absolute bottom-[20%] right-[6vw] font-display text-[clamp(2.4rem,8vw,7.5rem)] font-bold uppercase leading-none tracking-[-0.05em] text-violet-bright"
          style={{ transform: "translate3d(calc(var(--ap) * 30vw), 0, 0)", opacity: "clamp(0, calc(1.25 - var(--ap) * 1.9), 1)" }}
        >
          <em>in motion.</em>
        </p>

        <button
          type="button"
          onClick={open}
          data-cursor="Play reel"
          aria-label="Play reel"
          className="reel-trigger group pointer-events-auto relative flex items-center justify-center rounded-full outline-offset-8"
          style={{
            transform: "scale(calc(0.7 + clamp(0, var(--ap) * 2.2, 1) * 0.3))",
            opacity: "clamp(0, calc(var(--ap) * 3.2 - 0.15), 1)",
          }}
        >
          {/* no-WebGL: the reel itself, as a card */}
          <span aria-hidden="true" className="world-off-only absolute left-1/2 top-1/2 h-[min(56vw,420px)] w-[min(88vw,740px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/10">
            <InViewVideo src={reel.src} poster={reel.poster} />
          </span>
          <span aria-hidden="true" className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgb(168_85_247/0.35),transparent_65%)] blur-xl" />
          <RotatingBadge text="Play reel" size={172} className="text-fg">
            <span className="inline-flex size-[68px] items-center justify-center rounded-full bg-fg text-bg shadow-[0_0_40px_6px_rgb(168_85_247/0.45)] transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 size-6" aria-hidden="true" />
            </span>
          </RotatingBadge>
        </button>

        <p aria-hidden="true" className="label-mono absolute inset-x-0 bottom-8 text-center text-fg-2" style={{ opacity: "clamp(0, calc(var(--ap) * 3 - 0.6), 1)" }}>
          02 / {reel.label}
        </p>
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
