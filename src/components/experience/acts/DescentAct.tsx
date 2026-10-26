"use client";

import { useRef } from "react";
import { useAct } from "../useAct";

// One sentence, four services; the emphasised words glow when they light up.
const WORDS: { w: string; em?: boolean }[] = [
  { w: "We" }, { w: "make" }, { w: "software" }, { w: "feel" }, { w: "simple,", em: true },
  { w: "products" }, { w: "feel" }, { w: "real,", em: true },
  { w: "websites" }, { w: "feel" }, { w: "alive", em: true }, { w: "—" },
  { w: "and" }, { w: "every" }, { w: "frame" }, { w: "count.", em: true },
];
const PLAIN = WORDS.map((x) => x.w).join(" ");

/**
 * ACT 2 — THE DESCENT. The camera falls down the shaft of screens while the sentence lights up word by word.
 * Readable without JS (words start lit), and as one plain sentence for screen readers.
 */
export function DescentAct() {
  const ref = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useAct("descent", ref, (ap) => {
    const items = textRef.current?.querySelectorAll<HTMLElement>("[data-i]");
    if (!items) return;
    const lit = (ap * 1.25 - 0.08) * items.length;
    items.forEach((node, i) => node.style.setProperty("--lit", Math.min(1, Math.max(0, lit - i)).toFixed(3)));
  });

  return (
    <section id="statement" ref={ref} data-act="descent" aria-label="What we do" className="act relative h-[260svh]">
      <div className="act-stage pointer-events-none sticky top-0 flex h-[100svh] items-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-[1] bg-[radial-gradient(ellipse_62%_52%_at_50%_50%,rgb(8_9_13/0.78),rgb(8_9_13/0.25)_62%,transparent_85%)]"
        />
        <div className="container-x">
          <p className="label-mono mb-8 flex items-center gap-3 text-fg-2 md:mb-12">
            <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-violet-bright to-blue" />
            01 / What we do
          </p>
          <p className="sr-only">{PLAIN}</p>
          <p
            ref={textRef}
            aria-hidden="true"
            className="statement max-w-[1180px] font-display text-[clamp(2.1rem,6.6vw,6rem)] font-semibold leading-[1.04] tracking-[-0.035em]"
          >
            {WORDS.map((x, i) => (
              <span key={i} data-i className={x.em ? "statement-word statement-em" : "statement-word"}>
                {x.w}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
