import Link from "next/link";
import type { CSSProperties } from "react";
import { getClip } from "@/data/media";
import { categoryLabel, hasOnlyExampleProjects, projects, type Project } from "@/data/projects";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { ProjectArt } from "@/components/work/ProjectArt";
import { PillLink } from "./PillLink";

/** 12-column span + media aspect per position: one wide feature beside two, then rows of three. An unfinished last
 *  row is completed by the start-a-project tile (a lone card sits on the right, the tile beside it). */
const FIRST_ROW: { span: string; aspect: number }[] = [
  { span: "md:col-span-6", aspect: 16 / 11 },
  { span: "md:col-span-3", aspect: 5 / 4 },
  { span: "md:col-span-3", aspect: 1 },
];
const ROW_ASPECTS = [4 / 5, 1, 4 / 5];

function slotFor(i: number, n: number) {
  if (i < 3) return FIRST_ROW[i]!;
  const rest = (n - 3) % 3;
  if (rest === 1 && i === n - 1) return { span: "md:col-span-4 md:col-start-9", aspect: 4 / 5 };
  return { span: "md:col-span-4", aspect: ROW_ASPECTS[(i - 3) % 3]! };
}
/** the tile that completes the last row (none when it is full) */
const tileSpan = (n: number) => (n <= 3 ? null : ["", "md:col-span-8 md:col-start-1", "md:col-span-4"][(n - 3) % 3] || null);

/** Portrait footage never goes into a landscape slot (and vice versa) — the slot follows the media. */
function aspectFor(p: Project, slot: number) {
  const t = p.thumbnail;
  if (!t) return slot;
  const portrait = t.height > t.width;
  if (portrait && slot > 1) return 4 / 5;
  if (!portrait && slot < 1) return 1;
  return slot;
}

/**
 * Selected work as a staggered editorial grid of real project films. Each card's media unmasks from top to bottom
 * as it scrolls in (ScrubReveal), plays while visible, and carries its service tags; title, line and category follow.
 */
export function WorkGrid() {
  return (
    <div>
      <h2 className="sr-only">Selected work</h2>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-flow-row-dense md:grid-cols-12 md:gap-y-14">
        {projects.map((p, i) => {
          const l = slotFor(i, projects.length);
          const clip = !p.previewVideo && p.clip ? getClip(p.clip) : null;
          return (
            <li key={p.slug} className={l.span}>
              <Link href={`/work/${p.slug}`} data-card data-cursor="View" className="group block">
                <div data-scrub suppressHydrationWarning>
                  <div className="scrub-mask relative overflow-hidden rounded-[var(--radius-card)] bg-bg-2" style={{ aspectRatio: aspectFor(p, l.aspect) } as CSSProperties}>
                    <div className="scrub-zoom">
                      <div className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]">
                        {p.previewVideo ? (
                          <InViewVideo src={p.previewVideo} poster={p.thumbnail?.src ?? ""} rootMargin="300px" />
                        ) : clip ? (
                          <InViewVideo src={clip.src} poster={clip.poster} />
                        ) : (
                          <ProjectArt variant={p.art ?? "saas-dashboard"} uid={`grid-${p.slug}`} />
                        )}
                      </div>
                    </div>
                    {p.services && (
                      <ul className="absolute left-3 top-3 flex max-w-[80%] flex-wrap gap-1.5" aria-label="Services">
                        {p.services.slice(0, 3).map((s) => (
                          <li key={s} className="chip bg-white/90 backdrop-blur-sm">
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="scrub-text">
                    <h3 className="mt-4 font-display text-ed-title font-medium text-fg">{p.title}</h3>
                    <p className="mt-1.5 max-w-[46ch] text-[0.95rem] leading-snug text-fg-2">{p.description}</p>
                    <p className="mt-3 flex flex-wrap gap-1.5">
                      <span className="chip">{categoryLabel(p.category)}</span>
                      {p.isExample && <span className="chip bg-lilac">Example</span>}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {tileSpan(projects.length) && (
          <li className={tileSpan(projects.length)!}>
            <div className="flex h-full min-h-[280px] flex-col justify-between gap-10 rounded-[var(--radius-card)] bg-lilac p-6 md:p-8">
              <p className="label-mono text-fg-2">Next up</p>
              <div>
                <p className="max-w-[24ch] font-display text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.025em] text-fg">Have a launch coming up? Let’s make it the one people remember.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <PillLink href="/contact">Start a project</PillLink>
                </div>
              </div>
            </div>
          </li>
        )}
      </ul>
      <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        {hasOnlyExampleProjects ? (
          <p className="max-w-[60ch] text-[0.9rem] text-fg-3">
            Cards marked “Example” show the case-study format with studio renders while published client work is being prepared.
          </p>
        ) : (
          <span />
        )}
        <PillLink href="/work">See all work</PillLink>
      </div>
    </div>
  );
}
