import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site-config";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { studioProcess } from "@/components/sections/ProcessSection";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About the Studio",
  description:
    "Taskelevate Studios is a creative technology studio where strategy, design and engineering meet — SaaS animation, 3D, interactive web and video.",
  path: "/about",
});

const principles = [
  { title: "Purpose before polish", text: "Every frame and interaction has to earn its place. If it doesn't help the story, it goes." },
  { title: "Motion with meaning", text: "Animation guides attention and explains. It is never decoration for its own sake." },
  { title: "Performance is design", text: "Fast, responsive and stable experiences are part of the craft — not an afterthought." },
  { title: "Accessible by default", text: "Readable contrast, keyboard access and reduced-motion support are built in from the start." },
];

const tooling = [
  { k: "3D", v: "Blender for modelling, look development, animation and rendering" },
  { k: "Real-time", v: "Three.js and React Three Fiber for WebGL in the browser" },
  { k: "Motion", v: "GSAP and CSS for precise, performant interface motion" },
  { k: "Web", v: "Next.js, React and TypeScript for production front-ends" },
];

export default function AboutPage() {
  const { team } = siteConfig.proof;
  return (
    <>
      <PageHero
        label="The studio"
        headline={"WHERE CREATIVITY\nMEETS *ENGINEERING.*"}
        headlineClassName="text-[clamp(2.25rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.045em]"
        description="Taskelevate Studios is the creative production studio of Taskelevate — built for brands that want motion, 3D and interactive work engineered to the same standard as it is designed."
      />

      {/* Philosophy */}
      <section aria-labelledby="philosophy" className="section-y border-t border-line">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <h2 id="philosophy" className="label-mono text-fg-3 lg:col-span-3 lg:pt-3" data-reveal suppressHydrationWarning>
            Philosophy
          </h2>
          <p className="font-display text-[clamp(1.45rem,3.1vw,2.75rem)] font-medium leading-[1.18] tracking-[-0.025em] text-fg lg:col-span-9" data-reveal suppressHydrationWarning>
            We believe great creative work comes from the intersection of{" "}
            <span className="text-violet-bright">strategy, design, and technology.</span>{" "}
            <span className="text-fg-2">
              Every project is approached with a clear purpose: to create something memorable, functional, and beautifully
              executed.
            </span>
          </p>
        </div>
      </section>

      {/* Disciplines */}
      <section aria-labelledby="disciplines-title" className="section-y border-t border-line bg-bg-2/40">
        <div className="container-x">
          <SectionHeading id="disciplines-title" label="Core disciplines" headline={"FOUR CRAFTS.\nONE *STANDARD.*"} />
          <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20">
            {services.map((s, i) => (
              <li key={s.slug} data-reveal suppressHydrationWarning style={{ ["--reveal-delay" as string]: `${(i % 2) * 80}ms` }}>
                <Link
                  href={s.href}
                  data-glass-reflect
                  className="glass glass-subtle group flex h-full flex-col gap-10 rounded-[24px] p-7 transition-colors hover:bg-black/[0.05] md:p-9"
                >
                  <span className="flex items-center justify-between">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-black/10 text-fg-2 transition-colors group-hover:text-violet-bright">
                      <ServiceIcon name={s.icon} className="size-5" />
                    </span>
                    <span className="label-mono text-fg-3">{s.index}</span>
                  </span>
                  <span>
                    <span className="flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.02em] text-fg md:text-3xl">
                      {s.label}
                      <ArrowUpRight className="size-5 text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
                    </span>
                    <span className="mt-3 block max-w-md text-[1rem] leading-relaxed text-fg-2">{s.rowDescription}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Methodology */}
      <section aria-labelledby="method-title" className="section-y border-t border-line">
        <div className="container-x">
          <SectionHeading id="method-title" label="Design methodology" headline={"PRINCIPLES WE\nDESIGN *BY.*"} />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {principles.map((p, i) => (
              <li key={p.title} className="bg-bg p-7 md:p-8" data-reveal suppressHydrationWarning style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
                <span className="label-mono text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 font-display text-xl font-semibold tracking-[-0.02em] text-fg">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-2">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Production approach */}
      <section aria-labelledby="production-title" className="section-y border-t border-line bg-bg-2/40">
        <div className="container-x">
          <SectionHeading
            id="production-title"
            label="Production approach"
            headline={"FROM IDEA\nTO *IMPACT.*"}
            description="A thoughtful creative process, from the first conversation to the final delivery."
          />
          <div className="mt-16 md:mt-24">
            <ProcessTimeline steps={studioProcess} />
          </div>
          <dl className="mt-20 grid gap-6 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {tooling.map((t) => (
              <div key={t.k} data-reveal suppressHydrationWarning>
                <dt className="label-mono text-fg-3">{t.k}</dt>
                <dd className="mt-3 text-[0.95rem] leading-relaxed text-fg-2">{t.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Team — rendered only when real photographs are supplied (site-config.ts → proof.team) */}
      {team.length > 0 && (
        <section aria-labelledby="team-title" className="section-y border-t border-line">
          <div className="container-x">
            <SectionHeading id="team-title" label="The team" headline={"THE PEOPLE\nBEHIND THE *WORK.*"} />
            <ul className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
              {team.map((m) => (
                <li key={m.name}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
                    <Image src={m.photo} alt={m.photoAlt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <p className="mt-3 font-medium text-fg">{m.name}</p>
                  <p className="text-sm text-fg-2">{m.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactCTA location="about_cta" />
    </>
  );
}
