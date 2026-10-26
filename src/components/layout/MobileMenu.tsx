"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { primaryNav, serviceLinks } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  pathname: string;
}

/**
 * Menu sheet — a white panel that drops below the header on every screen size (the dot-grid button).
 * Large display links, the four services, and the project CTA. Closes on link, Escape, outside tap and route
 * change; while open the page is `inert` and scroll is locked.
 */
export function MobileMenu({ open, onClose, buttonRef, pathname }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main-content");
    const footer = document.getElementById("site-footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, buttonRef]);

  const stagger = (i: number) => ({ transitionDelay: open ? `${70 + i * 40}ms` : "0ms" });
  const itemMotion = cn(
    "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
  );
  const big =
    "group flex items-center justify-between border-b border-line py-3 font-display text-[clamp(2rem,6vw,4.25rem)] font-medium leading-[1.05] tracking-[-0.04em] text-fg transition-colors hover:text-fg-2";

  return (
    <div data-state={open ? "open" : "closed"}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn("fixed inset-0 z-40 bg-black/25 transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <div
        id="site-menu"
        ref={panelRef}
        className={cn(
          "fixed inset-x-0 top-0 z-[45] max-h-[100svh] overflow-y-auto overscroll-contain rounded-b-[12px] bg-bg",
          "pb-[calc(env(safe-area-inset-bottom,0px)+28px)] pt-[calc(env(safe-area-inset-top,0px)+84px)]",
          "duration-500 ease-[var(--ease-out-expo)]",
          open
            ? "visible translate-y-0 transition-[translate] motion-reduce:transition-none"
            : "invisible -translate-y-full transition-[translate,visibility] motion-reduce:transition-none",
        )}
      >
        <div className="shell grid gap-10 md:grid-cols-12">
          <nav aria-label="Menu" className="md:col-span-7">
            <ul>
              {[primaryNav.work, primaryNav.studio, primaryNav.contact].map((l, i) => (
                <li key={l.href} className={itemMotion} style={stagger(i)}>
                  <Link href={l.href} className={big} onClick={onClose} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
                    {l.label}
                    <ArrowUpRight className="size-7 text-fg-3 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={cn(itemMotion, "md:col-span-5")} style={stagger(3)}>
            <p className="label-mono text-fg-3">Services</p>
            <ul className="mt-4 grid gap-2">
              {serviceLinks.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={onClose}
                    aria-current={pathname === s.href ? "page" : undefined}
                    className="flex items-baseline justify-between gap-4 rounded-[8px] bg-bg-2 px-4 py-3 transition-colors hover:bg-bg-3"
                  >
                    <span className="font-display text-[1.15rem] font-medium tracking-[-0.02em] text-fg">{s.label}</span>
                    <span className="font-mono text-xs text-fg-3">{s.index}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={primaryNav.cta.href} onClick={onClose} className="btn btn-primary btn-lg">
                {primaryNav.cta.label} <span aria-hidden="true">↳</span>
              </Link>
              {siteConfig.bookingUrl && (
                <a
                  href={siteConfig.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn glass btn-glass btn-lg"
                  onClick={() => {
                    track("booking_clicked", { location: "menu" });
                    onClose();
                  }}
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Book a Discovery Call
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
