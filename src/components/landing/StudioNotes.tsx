import Link from "next/link";
import { getClip } from "@/data/media";
import { getService } from "@/data/services";
import { cn } from "@/lib/utils/cn";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { PillLink } from "./PillLink";
import { SectionHead } from "./SectionHead";

// Real in-house studio renders (src/data/media.ts, kind "studio-render") — labelled as such, never as client work.
const NOTES = [
  { clip: "product-turntable", tint: "bg-lilac", tags: ["3D", "Studio render"] },
  { clip: "web-layers", tint: "bg-sky", tags: ["WebGL", "Studio render"] },
  { clip: "motion-comp", tint: "bg-peach", tags: ["Motion", "Studio render"] },
  { clip: "product-scan", tint: "bg-mint", tags: ["3D", "Process"] },
];

/** From the studio — four pastel cards, each framing a piece of real in-house footage like a screen on a desk. */
export function StudioNotes() {
  return (
    <section aria-labelledby="notes-title">
      <SectionHead id="notes-title" title="Renders, experiments, and the things we’re obsessing over." action={<PillLink href="/about">Meet the studio</PillLink>} />
      <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
        {NOTES.map((n) => {
          const clip = getClip(n.clip);
          return (
            <li key={n.clip}>
              <Link href={getService(clip.service).href} data-card data-cursor="Open" data-scrub className="group block" suppressHydrationWarning>
                <div className={cn("scrub-mask relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[var(--radius-card)]", n.tint)}>
                  <div className="relative aspect-video w-[78%] overflow-hidden rounded-[8px] shadow-[0_24px_50px_-22px_rgb(0_0_0/0.55)] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-rotate-1 group-hover:scale-[1.05]">
                    <InViewVideo src={clip.srcSmall} poster={clip.poster} hoverOnly />
                  </div>
                  <span aria-hidden="true" className="absolute bottom-3 right-3 inline-flex size-10 items-center justify-center rounded-full bg-white text-sm transition-transform duration-500 group-hover:rotate-45">
                    ↗
                  </span>
                </div>
                <p className="scrub-text mt-4 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </p>
                <h3 className="scrub-text mt-3 font-display text-ed-title font-normal text-fg">{clip.label}</h3>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
