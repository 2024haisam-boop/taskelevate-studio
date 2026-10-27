"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { filmLength, filmMedia, type Film } from "@/data/saas-films";
import { cn } from "@/lib/utils/cn";

const ASPECT: Record<Film["shape"], number> = { landscape: 16 / 9, portrait: 9 / 16, square: 1, classic: 4 / 3 };

/**
 * A wall of short films: each card loops a muted preview while it is on screen (nothing loads until it is near),
 * and opens the full film with sound in a player (a native <dialog>: Esc closes, ← / → step through, focus returns
 * to the card). Concept pieces carry a "Concept" tag and the brand they are built around.
 */
export function FilmWall({ films, className }: { films: Film[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const show = useCallback((i: number, trigger?: HTMLButtonElement) => {
    if (trigger) triggerRef.current = trigger;
    setOpen(i);
  }, []);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + films.length) % films.length)), [films.length]);

  // the dialog follows `open`
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open === null) {
      if (dlg.open) dlg.close();
      return;
    }
    if (!dlg.open) dlg.showModal();
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => undefined);
    }
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => {
      videoRef.current?.pause();
      setOpen(null);
      triggerRef.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    dlg.addEventListener("close", onClose);
    dlg.addEventListener("keydown", onKey);
    return () => {
      dlg.removeEventListener("close", onClose);
      dlg.removeEventListener("keydown", onKey);
    };
  }, [step]);

  const film = open === null ? null : films[open];
  const media = film ? filmMedia(film.id) : null;

  return (
    <>
      <ul className={cn("film-wall", className)}>
        {films.map((f, i) => {
          const m = filmMedia(f.id);
          return (
            <li key={f.id} className="film-card">
              <button
                type="button"
                className="group block w-full text-left"
                aria-label={`Play “${f.title}” (${filmLength(f.seconds)})${f.concept ? `, a concept piece for ${f.brand}` : ""}`}
                onClick={(e) => show(i, e.currentTarget)}
              >
                <span className="relative block overflow-hidden rounded-[var(--radius-card)] bg-bg-2" style={{ aspectRatio: ASPECT[f.shape] } as CSSProperties}>
                  <span className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]">
                    <InViewVideo src={m.preview} poster={m.poster} rootMargin="300px" />
                  </span>
                  {f.concept && (
                    <span className="chip absolute left-3 top-3 bg-white/90 backdrop-blur-sm">Concept</span>
                  )}
                  <span className="film-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="size-4 translate-x-px">
                      <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[0.7rem] text-white backdrop-blur-sm">
                    {filmLength(f.seconds)}
                  </span>
                </span>
                <span className="mt-3 block font-display text-[clamp(1.15rem,1rem+0.4vw,1.4rem)] font-medium leading-tight text-fg">{f.title}</span>
                <span className="mt-1 block font-mono text-[0.72rem] uppercase tracking-[0.01em] text-fg-3">
                  {f.concept ? `Concept · ${f.brand}` : f.kind}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog ref={dialogRef} className="film-dialog" aria-label={film ? film.title : "Film"} onClick={(e) => e.target === e.currentTarget && close()}>
        {film && media && (
          <div className="film-dialog-inner">
            <video
              ref={videoRef}
              key={film.id}
              src={media.full}
              poster={media.poster}
              controls
              playsInline
              preload="metadata"
              className="film-dialog-video"
              style={{ ["--ar" as string]: ASPECT[film.shape] } as CSSProperties}
            />
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 text-white">
              <div>
                <p className="font-display text-[clamp(1.3rem,1.1rem+0.6vw,1.8rem)] leading-tight">{film.title}</p>
                <p className="mt-1 font-mono text-[0.72rem] uppercase text-white/60">
                  {film.concept ? `Concept piece — self-initiated, not made for ${film.brand}` : film.kind} · {filmLength(film.seconds)}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="film-dialog-btn" onClick={() => step(-1)} aria-label="Previous film">
                  ←
                </button>
                <button type="button" className="film-dialog-btn" onClick={() => step(1)} aria-label="Next film">
                  →
                </button>
                <button type="button" className="film-dialog-btn" onClick={close} aria-label="Close">
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
