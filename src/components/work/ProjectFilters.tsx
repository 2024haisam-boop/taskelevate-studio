"use client";

import { useLayoutEffect, useRef } from "react";
import { projectCategories, type ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils/cn";

export type FilterValue = ProjectCategory | "all";

interface Props {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: Record<FilterValue, number>;
  className?: string;
}

/** Category filter — a toggle-button group with a sliding glass indicator. */
export function ProjectFilters({ value, onChange, counts, className }: Props) {
  const groupRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const indicator = indicatorRef.current;
    const active = group?.querySelector<HTMLButtonElement>(`[data-value="${value}"]`);
    if (!group || !indicator || !active) return;
    const place = () => {
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.transform = `translate3d(${active.offsetLeft}px,0,0)`;
      indicator.style.opacity = "1";
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(group);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div className={cn("no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0", className)}>
      <div
        ref={groupRef}
        role="group"
        aria-label="Filter projects by category"
        className="glass glass-subtle relative inline-flex min-w-max items-center gap-1 rounded-full p-1.5"
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1.5 h-[calc(100%-12px)] rounded-full bg-fg opacity-0 transition-[transform,width] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
        />
        {projectCategories.map((c) => {
          const active = c.id === value;
          const count = counts[c.id] ?? 0;
          return (
            <button
              key={c.id}
              type="button"
              data-value={c.id}
              aria-pressed={active}
              disabled={count === 0}
              onClick={() => onChange(c.id)}
              className={cn(
                "relative z-10 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.875rem] font-medium transition-colors duration-300 disabled:opacity-40",
                active ? "text-bg" : "text-fg-2 hover:text-fg",
              )}
            >
              {c.label}
              <span className={cn("font-mono text-[10px]", active ? "text-bg/60" : "text-fg-3")}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
