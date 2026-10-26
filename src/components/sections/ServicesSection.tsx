import { services } from "@/data/services";
import { serviceArt } from "@/lib/animations/serviceArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectArt } from "@/components/work/ProjectArt";
import { ServiceRows } from "./ServiceRows";

/** SECTION 4 — What we do (brief §11). */
export function ServicesSection() {
  const previews = services.map((s) => <ProjectArt key={s.slug} variant={serviceArt[s.visual]} uid={`svc-${s.slug}`} />);
  return (
    <section id="services" aria-labelledby="services-title" className="section-y relative">
      <div className="container-x">
        <SectionHeading
          id="services-title"
          label="03 / What we do"
          headline={"CREATIVITY,\n*ENGINEERED.*"}
          description="Four dedicated capabilities, one studio. Each is built on the same foundation: strategy first, precise craft, and technology used with purpose."
        />
        <div className="mt-16 md:mt-24">
          <ServiceRows
            services={services.map(({ slug, href, index, rowTitle, rowDescription, capabilities, label }) => ({
              slug,
              href,
              index,
              rowTitle,
              rowDescription,
              capabilities,
              label,
            }))}
            previews={previews}
          />
        </div>
      </div>
    </section>
  );
}
