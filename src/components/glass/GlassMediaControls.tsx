"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import type { RefObject } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  playing: boolean;
  onToggle: () => void;
  onRestart?: () => void;
  /** Optional live timecode element (text is written imperatively for perf) */
  timeRef?: RefObject<HTMLSpanElement | null>;
  label?: string;
  className?: string;
}

/**
 * GlassMediaControls — compact, accessible transport controls for loops & previews.
 * Satisfies WCAG 2.2.2 (pause moving content). 44px touch targets.
 */
export function GlassMediaControls({ playing, onToggle, onRestart, timeRef, label = "animation", className }: Props) {
  return (
    <div
      className={cn("glass glass-strong inline-flex items-center gap-1 rounded-full p-1", className)}
      role="group"
      aria-label={`${label} controls`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!playing}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className="inline-flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/10 active:scale-95"
      >
        {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
      </button>
      {onRestart && (
        <button
          type="button"
          onClick={onRestart}
          aria-label={`Restart ${label}`}
          className="inline-flex size-11 items-center justify-center rounded-full text-fg-2 transition-colors hover:bg-white/10 hover:text-fg active:scale-95"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      )}
      {timeRef && (
        <span ref={timeRef} className="min-w-[7.5ch] pr-3 font-mono text-[11px] tabular-nums tracking-[0.08em] text-fg-2" aria-hidden="true">
          00:00:00
        </span>
      )}
    </div>
  );
}
