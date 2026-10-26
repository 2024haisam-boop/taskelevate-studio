"use client";

import { ArrowUpRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { siteConfig } from "@/data/site-config";
import { BookingLink } from "@/components/ui/BookingLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
import { PhysicsChips } from "../PhysicsChips";
import { useAct } from "../useAct";

export const REENTER_EVENT = "tes:reenter";

const LINES = ["LET'S CREATE", "SOMETHING", "EXTRAORDINARY."];

/**
 * ACT 6 — THE PORTAL. At the end of the hall a ring of light waits behind the closing line; below it, the
 * physics chips, the project CTA, and "Re-enter the studio", which loops the visitor back to the entrance.
 */
export function FinaleAct() {
  const ref = useRef<HTMLElement>(null);
  useAct("finale", ref);

  return (
    <>
      <section ref={ref} data-act="finale" aria-labelledby="cta-title" className="act relative h-[200svh]">
        <div className="act-stage pointer-events-none sticky top-0 flex h-[100svh] flex-col items-center justify-center text-center">
          <p className="label-mono mb-8 flex items-center gap-3 text-fg-2" style={{ opacity: "clamp(0, calc(var(--ap) * 6 - 0.4), 1)" }}>
            <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-violet-bright to-blue" />
            05 / Next project
          </p>
          <h2 id="cta-title" className="font-display text-[clamp(2.3rem,10vw,9.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.045em] text-fg">
            <span className="sr-only">Let&apos;s create something extraordinary.</span>
            {LINES.map((line, i) => (
              <span
                key={line}
                aria-hidden="true"
                className={i === 2 ? "finale-line finale-em" : "finale-line"}
                style={{ "--o": `clamp(0, calc((var(--ap) - ${0.1 + i * 0.09}) * 4.5), 1)` } as CSSProperties}
              >
                {line}
              </span>
            ))}
          </h2>
          <Link
            href="/contact"
            data-cursor="Let's talk"
            aria-label="Start a project"
            className="group pointer-events-auto mt-10 inline-flex text-fg"
            style={{ opacity: "clamp(0, calc((var(--ap) - 0.45) * 4), 1)" }}
          >
            <RotatingBadge text="Start a project" size={150}>
              <span className="inline-flex size-[72px] items-center justify-center rounded-full bg-gradient-to-br from-violet to-violet-bright text-white shadow-[0_0_44px_8px_rgb(135_85_232/0.45)] transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110">
                <ArrowUpRight className="size-7" aria-hidden="true" />
              </span>
            </RotatingBadge>
          </Link>
        </div>
      </section>

      <section aria-label="Start a project" className="relative z-10 pb-[clamp(72px,10vw,140px)]">
        <div className="container-x">
          <PhysicsChips className="bg-bg-2/70 backdrop-blur-sm" />

          <div className="glass glass-strong mt-8 flex flex-col items-start gap-6 rounded-[28px] p-6 sm:p-8 md:flex-row md:items-center md:justify-between" data-glass-reflect>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-fg">
              Tell us what you&apos;re building. We&apos;ll help you explore what&apos;s possible.
              {siteConfig.contactEmail && (
                <a href={`mailto:${siteConfig.contactEmail}`} className="mt-2 block text-sm text-fg-2 hover:text-fg">
                  {siteConfig.contactEmail}
                </a>
              )}
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/contact" variant="accent" size="lg">
                Start Your Project
              </ButtonLink>
              <BookingLink location="home_cta" />
            </div>
          </div>

          <div className="mt-[clamp(64px,9vw,120px)] flex flex-col items-center gap-4 text-center">
            <p className="label-mono text-fg-3">That was the studio. Again?</p>
            <button
              type="button"
              data-cursor="Re-enter"
              onClick={() => window.dispatchEvent(new Event(REENTER_EVENT))}
              className="reenter group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-display text-lg font-semibold text-fg backdrop-blur-md transition-colors hover:border-violet-bright/60 hover:bg-violet/15"
            >
              <RotateCcw className="size-5 transition-transform duration-700 group-hover:-rotate-[360deg]" aria-hidden="true" />
              Re-enter the studio
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
