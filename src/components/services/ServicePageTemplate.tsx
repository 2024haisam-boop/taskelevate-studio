import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjectsByCategory } from "@/data/projects";
import { getService, services, type ServiceSlug } from "@/data/services";
import { siteConfig } from "@/data/site-config";
import { TrackView } from "@/components/analytics/TrackView";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { BookingLink } from "@/components/ui/BookingLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Faq } from "./Faq";
import { ServiceVisual } from "./ServiceVisual";

/** Production service page (brief §17). All copy comes from data/services.ts. */
export function ServicePageTemplate({ slug }: { slug: ServiceSlug }) {
  const service = getService(slug);
  const work = getProjectsByCategory(service.projectCategory);
  const related = services.filter((s) => s.slug !== slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.label,
    description: service.page.metaDescription,
    url: `${siteConfig.url}${service.href}`,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    serviceType: service.label,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.page.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <TrackView event="service_viewed" props={{ service: slug }} />

      <PageHero
        label={`Service ${service.index} / ${service.label}`}
        headline={service.page.headline}
        headlineClassName="text-[clamp(2.2rem,12.2vw,10rem)] leading-[0.9] tracking-[-0.045em]"
        description={service.page.subheading}
        visual={<ServiceVisual visual={service.visual} caption={service.page.visualCaption} />}
      >
        <ButtonLink href={`/contact?service=${slug}`} size="lg">
          Start a Project
        </ButtonLink>
        <BookingLink location={`service_${slug}`} />
      </PageHero>

      {/* Specific description */}
      <section aria-labelledby="about-service" className="section-y border-t border-line">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <h2 id="about-service" className="label-mono text-fg-3 lg:col-span-3 lg:pt-3" data-reveal suppressHydrationWarning>
            {service.index} / What it is
          </h2>
          <div className="flex flex-col gap-8 lg:col-span-9">
            {service.page.intro.map((p, i) => (
              <p
                key={i}
                data-reveal suppressHydrationWarning
                className={
                  i === 0
                    ? "font-display text-[clamp(1.4rem,2.8vw,2.5rem)] font-medium leading-[1.2] tracking-[-0.025em] text-fg"
                    : "max-w-3xl text-lead text-fg-2"
                }
              >
                {p}
              </p>
            ))}
            <ul className="flex flex-wrap gap-2" aria-label="Capabilities" data-reveal suppressHydrationWarning>
              {service.capabilities.map((c) => (
                <li key={c} className="chip">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section aria-labelledby="deliverables-title" className="section-y border-t border-line bg-bg-2/40">
        <div className="container-x">
          <SectionHeading id="deliverables-title" label="Deliverables" headline={"WHAT YOU\n*RECEIVE.*"} />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {service.page.deliverables.map((d, i) => (
              <li key={d.title} className="flex flex-col bg-bg p-7 md:p-9" data-reveal suppressHydrationWarning style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}>
                <span className="label-mono text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-10 font-display text-xl font-semibold tracking-[-0.02em] text-fg md:text-2xl">{d.title}</h3>
                <p className="mt-3 text-[0.975rem] leading-relaxed text-fg-2">{d.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Work */}
      <section id="work" aria-labelledby="service-work-title" className="section-y border-t border-line">
        <div className="container-x">
          <SectionHeading
            id="service-work-title"
            label="Work"
            headline={"SELECTED\n*PROJECTS.*"}
            description={
              work.every((p) => p.isExample)
                ? "These slots are clearly marked examples showing how case studies will be presented."
                : "A selection of recent work in this discipline."
            }
          />
          <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-20">
            {work.map((p, i) => (
              <div key={p.slug} data-reveal="card" suppressHydrationWarning style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className={i % 2 === 1 ? "md:mt-20" : undefined}>
                <ProjectCard project={p} shape={i % 2 === 0 ? "landscape" : "portrait"} />
              </div>
            ))}
          </div>
          <div className="mt-14 flex justify-center" data-reveal suppressHydrationWarning>
            <ButtonLink href={`/work?category=${service.projectCategory}`} variant="glass">
              All {service.label} work
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Process */}
      <section aria-labelledby="service-process-title" className="section-y border-t border-line bg-bg-2/40">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-top)+var(--nav-h)+40px)]">
              <SectionHeading id="service-process-title" label="Process" headline={"HOW WE\n*WORK.*"} layout="stacked" headlineClassName="text-display-lg" />
            </div>
          </div>
          <ol className="flex flex-col lg:col-span-7">
            {service.page.process.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-[5rem_1fr] md:py-10" data-reveal suppressHydrationWarning>
                <span className="font-display text-3xl font-bold tracking-[-0.04em] text-fg-3 md:text-4xl">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-fg md:text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-[1rem] leading-relaxed text-fg-2">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="section-y border-t border-line">
        <div className="container-x">
          <SectionHeading
            id="faq-title"
            label="FAQ"
            headline={"GOOD\n*QUESTIONS.*"}
            description="Straight answers to what clients usually ask before starting. Anything else — just ask."
          />
          <div className="mt-12 md:mt-16 lg:ml-[calc((100%-11*2.5rem)/12*4+4*2.5rem)]">
            <Faq items={service.page.faqs} />
          </div>
        </div>
      </section>

      <ContactCTA
        label={`Start a ${service.label} project`}
        headline={"READY WHEN\n*YOU ARE.*"}
        service={slug}
        location={`service_${slug}_cta`}
      />

      {/* Related services */}
      <nav aria-labelledby="related-services" className="border-t border-line">
        <div className="container-x section-y">
          <h2 id="related-services" className="label-mono text-fg-3">
            Related services
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug} data-reveal suppressHydrationWarning>
                <Link
                  href={r.href}
                  className="glass glass-subtle group flex h-full flex-col justify-between gap-10 rounded-[22px] p-6 transition-colors hover:bg-black/[0.05] md:p-7"
                  data-glass-reflect
                >
                  <span className="flex items-center justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-black/10 text-fg-2 transition-colors group-hover:text-violet-bright">
                      <ServiceIcon name={r.icon} className="size-5" />
                    </span>
                    <ArrowUpRight className="size-5 text-fg-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="label-mono text-fg-3">{r.index}</span>
                    <span className="mt-2 block font-display text-2xl font-semibold tracking-[-0.02em] text-fg">{r.label}</span>
                    <span className="mt-2 block text-[0.95rem] text-fg-2">{r.rowDescription}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
