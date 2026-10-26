import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { GlassSurface } from "./GlassSurface";

interface Props {
  children: ReactNode;
  className?: string;
  tone?: "default" | "strong" | "subtle";
  as?: "div" | "section" | "aside" | "article";
  reveal?: boolean;
}

/** GlassPanel — large rounded glass container for grouped content. */
export function GlassPanel({ children, className, tone = "strong", as = "div", reveal = false }: Props) {
  return (
    <GlassSurface as={as} tone={tone} reflect className={cn("rounded-[28px] p-6 sm:p-8 md:p-10", className)} data-reveal={reveal ? "" : undefined} suppressHydrationWarning>
      {children}
    </GlassSurface>
  );
}

/** GlassContactPanel — the conversion panel used beneath contact headlines. */
export function GlassContactPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <GlassPanel reveal className={cn("flex w-full max-w-3xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:gap-8 md:text-left", className)}>
      {children}
    </GlassPanel>
  );
}

/** GlassProjectPanel — project metadata / facts panel on case-study pages. */
export function GlassProjectPanel({ items, className }: { items: { k: string; v: string }[]; className?: string }) {
  return (
    <GlassSurface as="dl" tone="subtle" className={cn("grid grid-cols-2 gap-6 rounded-[22px] p-6 sm:grid-cols-3", className)}>
      {items.map((m) => (
        <div key={m.k}>
          <dt className="label-mono text-fg-3">{m.k}</dt>
          <dd className="mt-2 text-[0.95rem] text-fg">{m.v}</dd>
        </div>
      ))}
    </GlassSurface>
  );
}
