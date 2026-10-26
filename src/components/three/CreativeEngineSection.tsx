import { SectionHeading } from "@/components/ui/SectionHeading";
import { CreativeEngine } from "./CreativeEngine";

/** SECTION 2 — Creative Engine (brief §09). */
export function CreativeEngineSection() {
  return (
    <section id="capabilities" aria-labelledby="engine-title" className="section-y relative">
      <div className="container-x">
        <SectionHeading
          id="engine-title"
          label="01 / Our capabilities"
          headline={"BUILT TO\nMOVE *MINDS.*"}
          description="Four disciplines. One obsession: making digital experiences unforgettable."
        />
        <div className="mt-14 md:mt-20" data-reveal suppressHydrationWarning>
          <CreativeEngine />
        </div>
      </div>
    </section>
  );
}
