"use client";

import { Play, X } from "lucide-react";
import { useRef } from "react";

interface Props {
  src: string;
  poster?: string | null;
}

/**
 * Renders ONLY when a real showreel is configured (siteConfig.showreel.src).
 * Uses the native <dialog> element: focus trapping, Escape-to-close and
 * background inertness come from the platform.
 */
export function ShowreelButton({ src, poster }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const open = () => {
    dialogRef.current?.showModal();
    void videoRef.current?.play().catch(() => undefined);
  };
  const close = () => {
    videoRef.current?.pause();
    dialogRef.current?.close();
  };

  return (
    <>
      <button type="button" onClick={open} className="btn glass btn-glass" data-glass-reflect>
        <Play className="size-4" aria-hidden="true" />
        Watch Reel
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Showreel"
        onClose={() => videoRef.current?.pause()}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(1100px,calc(100vw-32px))] bg-transparent p-0 text-fg backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="glass glass-strong overflow-hidden rounded-[var(--radius-panel)] p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="label-mono text-fg-2">Showreel</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close showreel"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <video
            ref={videoRef}
            src={src}
            poster={poster ?? undefined}
            controls
            playsInline
            preload="none"
            className="aspect-video w-full rounded-[calc(var(--radius-panel)-8px)] bg-black"
          />
        </div>
      </dialog>
    </>
  );
}
