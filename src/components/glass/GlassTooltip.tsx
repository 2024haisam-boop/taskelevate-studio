"use client";

import { useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  content: ReactNode;
  children: (props: { "aria-describedby": string; onFocus: () => void; onBlur: () => void; onPointerEnter: () => void; onPointerLeave: () => void }) => ReactElement;
  side?: "top" | "bottom";
  align?: "center" | "end";
  className?: string;
}

/**
 * GlassTooltip — shows on hover AND keyboard focus, dismissible with Escape,
 * linked via aria-describedby. Supplementary only: never the sole carrier of meaning.
 */
export function GlassTooltip({ content, children, side = "top", align = "center", className }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      {children({
        "aria-describedby": id,
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        onPointerEnter: () => setOpen(true),
        onPointerLeave: () => setOpen(false),
      })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "glass glass-strong pointer-events-none absolute z-30 w-max max-w-[220px] rounded-xl px-3 py-2 text-xs leading-snug text-fg-2",
          align === "center" ? "left-1/2 -translate-x-1/2" : "right-0",
          "transition-[opacity,translate] duration-150 motion-reduce:transition-none",
          side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
