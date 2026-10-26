import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "default" | "strong" | "subtle";

type Props<T extends ElementType> = {
  as?: T;
  tone?: Tone;
  /** Enable the extremely subtle cursor-tracked reflection (fine pointers only) */
  reflect?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const toneClass: Record<Tone, string> = { default: "", strong: "glass-strong", subtle: "glass-subtle" };

/**
 * GlassSurface — the base liquid-glass material (see globals.css `.glass`):
 * translucent tint · backdrop blur + saturation · directional inner light ·
 * masked edge reflection · cursor reflection · opaque fallback without backdrop-filter.
 */
export function GlassSurface<T extends ElementType = "div">({ as, tone = "default", reflect = false, className, children, ...rest }: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag {...rest} data-glass-reflect={reflect ? "" : undefined} className={cn("glass", toneClass[tone], className)}>
      {children}
    </Tag>
  );
}
