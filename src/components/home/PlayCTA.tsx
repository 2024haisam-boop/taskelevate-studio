"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { AmbientLight } from "@/components/ui/AmbientLight";
import { BookingLink } from "@/components/ui/BookingLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Headline } from "@/components/ui/Headline";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PhysicsChips } from "@/components/experience/PhysicsChips";

/**
 * BEAT 7 (v2 home) — "Let's create something extraordinary" + the physics chips box + CTA panel.
 */
export function PlayCTA() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden border-t border-line">
      <AmbientLight />
      <div className="container-x section-y">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-7">
            <SectionLabel>03 / Next project</SectionLabel>
            <Headline
              id="cta-title"
              text={"LET'S CREATE\nSOMETHING\n*EXTRAORDINARY.*"}
              className="text-[clamp(2.1rem,9.6vw,9rem)] leading-[0.9] tracking-[-0.045em] [&_em]:bg-gradient-to-r [&_em]:from-violet-bright [&_em]:via-[#b78bff] [&_em]:to-violet [&_em]:bg-clip-text [&_em]:pr-[0.08em] [&_em]:text-transparent"
            />
          </div>
          <Link href="/contact" data-cursor="Let's talk" aria-label="Start a project" className="group hidden shrink-0 text-fg lg:inline-flex">
            <RotatingBadge text="Start a project" size={170}>
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-violet to-violet-bright text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45">
                <ArrowUpRight className="size-8" aria-hidden="true" />
              </span>
            </RotatingBadge>
          </Link>
        </div>

        <PhysicsChips className="mt-12 md:mt-16" />

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
      </div>
    </section>
  );
}
