import type { CSSProperties } from "react";

const LINE_ONE = "CRAFTING THE";
const LINE_TWO = "UNEXPECTED.";

/**
 * Hero headline — exact wording per brief. Server-rendered and animated with the
 * CSS timeline in globals.css (starts at first paint; no hydration wait, no loader).
 *
 * Accessibility: screen readers get one plain sentence (sr-only); the per-glyph
 * spans are aria-hidden so the text is never read letter-by-letter or twice.
 * Words are kept unbreakable while still allowing wrapping *between* words on very
 * narrow screens.
 */
export function KineticHeadline({ id = "hero-title" }: { id?: string }) {
  let i = 0;
  const lineOneWords = LINE_ONE.split(" ");

  return (
    <h1
      id={id}
      className="font-display font-bold uppercase [--hero-l2:clamp(2.6rem,13.6vw,12rem)]"
    >
      <span className="sr-only">Crafting the unexpected.</span>
      <span aria-hidden="true" className="block">
        <span className="line-mask text-[length:calc(var(--hero-l2)*0.66)] leading-[0.95] tracking-[-0.04em] text-fg">
          {lineOneWords.map((word, w) => (
            <span key={word}>
              <span className="inline-block whitespace-nowrap">
                {word.split("").map((ch) => {
                  const idx = i++;
                  return (
                    <span key={idx} className="hero-char" style={{ "--i": idx } as CSSProperties}>
                      {ch}
                    </span>
                  );
                })}
              </span>
              {w < lineOneWords.length - 1 && " "}
            </span>
          ))}
        </span>
        <span className="line-mask mt-[0.02em] px-[0.2em] mx-[-0.2em] text-[length:var(--hero-l2)] leading-[0.9] tracking-[-0.045em] text-violet-bright">
          <span className="em inline-block whitespace-nowrap">
            {LINE_TWO.split("").map((ch, idx) => (
              <span key={idx} className="hero-em-char" data-char={ch} style={{ "--i": idx } as CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      </span>
    </h1>
  );
}
