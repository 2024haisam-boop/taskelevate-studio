import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessTimeline } from "./ProcessTimeline";

export const studioProcess = [
  { title: "DISCOVER", description: "We understand your business, audience, objectives, and creative requirements." },
  { title: "CONCEPT", description: "We establish the visual direction, narrative, and production approach." },
  { title: "CREATE", description: "Our team develops, animates, refines, and tests the experience." },
  { title: "DELIVER", description: "We finalize, optimize, and prepare your creative assets for launch." },
];

/** SECTION 6 — Studio process (brief §13). */
export function ProcessSection() {
  return (
    <section aria-labelledby="process-title" className="section-y relative border-t border-line bg-bg-2/40">
      <div className="container-x">
        <SectionHeading
          id="process-title"
          label="05 / Our approach"
          headline={"FROM IDEA\nTO *IMPACT.*"}
          description="A thoughtful creative process, from the first conversation to the final delivery."
        />
        <div className="mt-16 md:mt-24">
          <ProcessTimeline steps={studioProcess} />
        </div>
      </div>
    </section>
  );
}
