import Link from "next/link";
import { getProject } from "@/data/projects";
import { services } from "@/data/services";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { PillLink } from "./PillLink";
import { SectionHead } from "./SectionHead";

// Real project footage that shows each service best.
const WORK_FOR: Record<string, string> = {
  "saas-animation": "saas-launch-explainer",
  "3d-animation": "exploded-view-study",
  "interactive-websites": "interactive-product-configurator",
  "video-editing": "founder-story-edit",
};

/**
 * SERVICES — four tall paper cards in a row: name at the top, what it is at the bottom. On hover a card widens,
 * turns ink-black and its studio footage fades in behind the copy. Stacked on phones, each with its own link.
 */
export function ServiceCards() {
  return (
    <section id="services" aria-labelledby="services-title">
      <SectionHead
        id="services-title"
        title="Great creative work comes from the intersection of strategy, design, and technology — every project built to be memorable, functional, and beautifully executed."
        action={<PillLink href="/contact">Start a project</PillLink>}
      />
      <ul className="svc-row mt-10 flex flex-col gap-2 md:mt-12 md:h-[clamp(360px,30vw,440px)] md:flex-row md:gap-1.5">
        {services.map((s) => {
          const work = getProject(WORK_FOR[s.slug] ?? "");
          return (
            <li key={s.slug} className="svc-card">
              <Link href={s.href} data-card data-cursor="Explore" className="svc-link group">
                {work?.previewVideo && (
                  <span aria-hidden="true" className="svc-media">
                    <InViewVideo src={work.previewVideo} poster={work.thumbnail?.src ?? ""} hoverOnly />
                  </span>
                )}
                <span className="relative flex items-start justify-between gap-4">
                  <span className="font-display text-ed-title font-normal">{s.label}</span>
                  <span className="font-mono text-xs opacity-60">{s.index}</span>
                </span>
                <span className="relative mt-auto block pt-16">
                  <span className="block max-w-[38ch] text-[0.95rem] leading-relaxed opacity-80">{s.rowDescription}</span>
                  <span className="mt-5 flex flex-wrap gap-1.5">
                    {s.capabilities.slice(0, 3).map((c) => (
                      <span key={c} className="svc-chip chip">
                        {c}
                      </span>
                    ))}
                  </span>
                  <span className="mt-5 block font-mono text-ed-mono uppercase">
                    Explore {s.label} <span aria-hidden="true">↳</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
