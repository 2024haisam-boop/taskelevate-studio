"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { serviceLinks } from "@/data/navigation";
import { cn } from "@/lib/utils/cn";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHighlight?: (el: HTMLElement | null) => void;
  active: boolean;
}

/**
 * GlassDropdown — disclosure-pattern navigation menu (WAI-ARIA APG recommends
 * disclosure over role="menu" for site navigation).
 * Keyboard: Enter/Space toggles · ArrowDown opens + focuses first item ·
 * Arrow keys / Home / End move between items · Escape closes and returns focus.
 * Pointer: hover intent on fine pointers, click/tap everywhere.
 */
export function ServicesDropdown({ open, onOpenChange, onHighlight, active }: Props) {
  const panelId = useId();
  const liRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>(0);
  const focusFirstOnOpen = useRef(false);

  const items = () => Array.from(liRef.current?.querySelectorAll<HTMLAnchorElement>("[data-dropdown-item]") ?? []);

  const clearTimer = () => window.clearTimeout(closeTimer.current);

  useEffect(() => {
    if (!open) return;
    if (focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      window.setTimeout(() => items()[0]?.focus(), 30);
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!liRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  useEffect(() => () => clearTimer(), []);

  const isFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open) items()[0]?.focus();
      else {
        focusFirstOnOpen.current = true;
        onOpenChange(true);
      }
    }
  };

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLAnchorElement);
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (index + 1) % list.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (index - 1 + list.length) % list.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = list.length - 1;
    if (next >= 0) {
      e.preventDefault();
      list[next]?.focus();
    }
  };

  return (
    <li
      ref={liRef}
      className="relative"
      onPointerEnter={(e) => {
        onHighlight?.(e.currentTarget);
        if (e.pointerType === "mouse" && isFinePointer()) {
          clearTimer();
          onOpenChange(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimer();
        closeTimer.current = window.setTimeout(() => onOpenChange(false), 160);
      }}
      onBlur={(e) => {
        if (!liRef.current?.contains(e.relatedTarget as Node)) {
          onOpenChange(false);
          onHighlight?.(null);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "relative z-10 inline-flex h-9 items-center gap-1.5 rounded-md px-3 font-mono text-ed-mono uppercase text-fg transition-colors duration-200 hover:bg-black/[0.05]",
          (open || active) && "bg-black/[0.05]",
        )}
        onClick={() => onOpenChange(!open)}
        onKeyDown={onButtonKeyDown}
        onFocus={(e) => onHighlight?.(e.currentTarget.parentElement)}
      >
        Services
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        data-state={open ? "open" : "closed"}
        onKeyDown={onPanelKeyDown}
        className={cn(
          "group/panel absolute right-0 top-[calc(100%+14px)] w-[min(520px,calc(100vw-48px))]",
          // invisible hover bridge across the gap
          "before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']",
          // instant visibility on open (focus can move in); delayed on close so the fade completes
          "data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:transition-[visibility] data-[state=closed]:duration-200",
        )}
      >
        {/* Opacity/scale live on the glass element itself so backdrop blur stays intact while fading */}
        <div
          className={cn(
            "origin-top rounded-[12px] border border-line bg-bg p-2 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)]",
            "transition-[opacity,translate,scale] duration-200 ease-[var(--ease-out-quart)]",
            "group-data-[state=closed]/panel:-translate-y-1.5 group-data-[state=closed]/panel:scale-[0.985] group-data-[state=closed]/panel:opacity-0",
            "motion-reduce:transition-opacity motion-reduce:group-data-[state=closed]/panel:translate-y-0 motion-reduce:group-data-[state=closed]/panel:scale-100",
          )}
        >
          <ul className="grid grid-cols-2 gap-1">
            {serviceLinks.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  data-dropdown-item
                  className="group/item flex h-full flex-col gap-3 rounded-[8px] bg-bg-2 p-4 transition-colors duration-200 hover:bg-bg-3 focus-visible:bg-bg-3"
                  onClick={() => onOpenChange(false)}
                >
                  <span className="flex items-center justify-between">
                    <span className="inline-flex size-9 items-center justify-center rounded-md bg-bg text-fg transition-colors group-hover/item:text-violet-bright">
                      <ServiceIcon name={s.icon} className="size-[18px]" />
                    </span>
                    <span className="label-mono text-fg-3">{s.index}</span>
                  </span>
                  <span>
                    <span className="block font-display text-[1.05rem] font-medium tracking-[-0.02em] text-fg">{s.label}</span>
                    <span className="mt-1 block text-[0.8rem] leading-snug text-fg-2">{s.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#services"
            data-dropdown-item
            className="mt-1 flex items-center justify-between rounded-[8px] px-4 py-3 text-fg-2 transition-colors hover:text-fg focus-visible:text-fg"
            onClick={() => onOpenChange(false)}
          >
            <span className="label-mono">All capabilities</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </li>
  );
}
