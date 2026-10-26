import { Fragment, type CSSProperties, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
}

/**
 * Editorial text that rises in word by word the first time it scrolls into view (CSS-owned via the shared
 * reveal observer). Words stay real text for screen readers and search; without JS everything is visible.
 */
export function RevealWords({ text, as: Tag = "p", className, id }: Props) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={cn("reveal-words", className)} data-reveal="words" suppressHydrationWarning>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="rw" style={{ "--i": i } as CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
