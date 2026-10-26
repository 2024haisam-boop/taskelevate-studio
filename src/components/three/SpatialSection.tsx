import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpatialExperience } from "./SpatialExperience";

/** SECTION 5 — Signature spatial experience (brief §12). */
export function SpatialSection() {
  return (
    <section aria-labelledby="spatial-title" className="relative border-t border-line">
      <div className="container-x pt-[clamp(72px,10vw,152px)]">
        <SectionHeading
          id="spatial-title"
          label="04 / Immersive technology"
          headline={"BEYOND THE\nFLAT *SCREEN.*"}
          description="We create interactive experiences that transform passive viewing into active exploration."
        />
      </div>
      <SpatialExperience />
    </section>
  );
}
