import { PhysicsChips } from "@/components/experience/PhysicsChips";
import { PillLink } from "./PillLink";
import { SectionHead } from "./SectionHead";

/** The playful bit (kept by request): everything we make as chips with real physics — grab and throw them. */
export function PlayChips() {
  return (
    <section aria-labelledby="play-title">
      <SectionHead
        eyebrow="What we make"
        id="play-title"
        title="Motion, 3D, websites and video. Go on — pick one up and throw it."
        action={<PillLink href="/contact">Start a project</PillLink>}
      />
      <PhysicsChips className="mt-10 border-0 bg-bg-2 md:mt-12" />
    </section>
  );
}
