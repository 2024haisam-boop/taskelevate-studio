import type { CSSProperties, ElementType } from "react";
import { cn } from "@/lib/utils/cn";
import { headlineToText, parseHeadline } from "@/lib/utils/headline";

interface Props {
  /** Markup: "\n" = line break, *word* = violet italic emphasis */
  text: string;
  as?: ElementType;
  className?: string;
  /** Masked line-by-line reveal on scroll (CSS-owned) */
  reveal?: boolean;
  delayMs?: number;
  id?: string;
  /** Above-the-fold: CSS entrance that runs at first paint (no JS needed) instead of scroll reveal */
  entrance?: boolean;
}

/**
 * Editorial display headline. Each line is masked so it can rise into place;
 * screen readers get the plain sentence once (via aria-label on the heading is
 * unreliable, so the visual lines are aria-hidden and an sr-only copy is provided).
 */
export function Headline({ text, as: Tag = "h2", className, reveal = true, delayMs = 0, id, entrance = false }: Props) {
  const lines = parseHeadline(text);
  return (
    <Tag
      id={id}
      className={cn("font-display font-medium", className)}
      data-reveal={reveal && !entrance ? "lines" : undefined} suppressHydrationWarning
      style={delayMs ? ({ "--reveal-delay": `${delayMs}ms` } as CSSProperties) : undefined}
    >
      <span className="sr-only">{headlineToText(text)}</span>
      <span aria-hidden="true" className="block">
        {lines.map((segments, i) => (
          <span key={i} className="line-mask">
            <span className={entrance ? "line-inner entrance-line" : "line-inner"} style={{ "--line": i } as CSSProperties}>
              {segments.map((seg, j) =>
                seg.em ? (
                  <em key={j} className="text-violet-em">
                    {seg.text}
                  </em>
                ) : (
                  <span key={j}>{seg.text}</span>
                ),
              )}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
