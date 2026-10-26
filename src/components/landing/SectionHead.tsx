import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { DecodeText } from "@/components/ui/DecodeText";
import { RevealWords } from "./RevealWords";

interface Props {
  title: string;
  id?: string;
  eyebrow?: string;
  action?: ReactNode;
  /** hairline above the row (every section except the first) */
  rule?: boolean;
  className?: string;
}

/**
 * The reference layout's section header on a 12-column grid: optional mono eyebrow (3 cols), a large medium-weight
 * statement (6 or 9 cols) and the section's pill CTA aligned right.
 */
export function SectionHead({ title, id, eyebrow, action, rule = true, className }: Props) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:gap-6", rule && "border-t border-bg-2 pt-6 md:pt-7", className)}>
      {eyebrow && <DecodeText as="p" text={eyebrow} className="label-mono text-fg-3 md:col-span-3 md:pt-2" />}
      <RevealWords
        as="h2"
        id={id}
        text={title}
        className={cn("font-display text-ed-lead font-medium text-fg", eyebrow ? "md:col-span-6" : "md:col-span-9")}
      />
      {action && <div className="md:col-span-3 md:justify-self-end md:pt-1">{action}</div>}
    </div>
  );
}
