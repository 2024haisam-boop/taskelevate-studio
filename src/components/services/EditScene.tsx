"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassMediaControls } from "@/components/glass/GlassMediaControls";
import { useInView } from "@/hooks/useInView";
import s from "./edit.module.css";

const FORMATS = [
  { id: "wide", label: "Long-form", ratio: "16:9" },
  { id: "vertical", label: "Short-form", ratio: "9:16" },
  { id: "square", label: "Square", ratio: "1:1" },
] as const;

type Format = (typeof FORMATS)[number]["id"];

/**
 * Video Editing signature visual — a program monitor with reframing guides and a
 * multi-track timeline. Real controls: switch delivery format (the frame re-crops)
 * and play/pause the edit.
 */
export function EditScene() {
  const [format, setFormat] = useState<Format>("wide");
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.15 });

  return (
    <figure className="m-0">
      <div
        ref={ref}
        className={cn(s.wrap, "theme-dark rounded-[var(--radius-card)] border border-line")}
        data-paused={!(playing && inView)}
      >
        {/* Program monitor */}
        <div className={s.monitor}>
          <div className={s.monitorChrome}>
            <span className="label-mono text-fg-2">Program · Edit_v07</span>
            <span className="label-mono text-fg-3">{FORMATS.find((f) => f.id === format)?.ratio}</span>
          </div>
          <div className={s.screen}>
            <div className={s.shot} aria-hidden="true">
              <div className={s.key} />
              <div className={s.subject}>
                <span className={s.head} />
                <span className={s.body} />
              </div>
              <div className={s.broll} />
            </div>
            {/* reframe mask */}
            <div className={s.crop} data-format={format} aria-hidden="true">
              <span className={s.cropFrame}>
                <span className={s.safe} />
                <span className={s.lowerThird}>
                  <i />
                  <b />
                </span>
                <span className={s.caption}>
                  <b />
                </span>
              </span>
            </div>
            <span className={`label-mono ${s.tc}`} aria-hidden="true">
              ● 00:14:32:08
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className={s.timeline} aria-hidden="true">
          {[
            { t: "V2", clips: [[18, 14, "gfx"], [52, 10, "gfx"]] },
            { t: "V1", clips: [[4, 22, "a"], [27, 18, "b"], [46, 12, "a"], [59, 26, "b"], [86, 11, "a"]] },
            { t: "A1", clips: [[4, 93, "wave"]] },
            { t: "A2", clips: [[10, 40, "music"], [55, 40, "music"]] },
          ].map((track) => (
            <div key={track.t} className={s.track}>
              <span className={s.trackName}>{track.t}</span>
              <span className={s.lane}>
                {track.clips.map(([left, width, kind], i) => (
                  <span
                    key={i}
                    className={cn(s.clip, s[`clip_${kind}` as keyof typeof s])}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                ))}
              </span>
            </div>
          ))}
          <span className={s.playhead} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Delivery format" className="glass glass-subtle inline-flex gap-1 rounded-full p-1">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={format === f.id}
              onClick={() => setFormat(f.id)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.85rem] font-medium transition-colors",
                format === f.id ? "bg-fg text-bg" : "text-fg-2 hover:text-fg",
              )}
            >
              {f.label}
              <span className={cn("font-mono text-[10px]", format === f.id ? "text-bg/60" : "text-fg-3")}>{f.ratio}</span>
            </button>
          ))}
        </div>
        <GlassMediaControls playing={playing} onToggle={() => setPlaying((p) => !p)} label="edit preview" />
      </div>
    </figure>
  );
}
