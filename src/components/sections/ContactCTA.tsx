import { siteConfig } from "@/data/site-config";
import { BookingLink } from "@/components/ui/BookingLink";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Headline } from "@/components/ui/Headline";

interface Props {
  label?: string;
  headline?: string;
  sentence?: string;
  /** Pre-select a service in the contact form (e.g. from a service page) */
  service?: string;
  location?: string;
}

/**
 * Closing call to action on inner pages — editorial: a hairline, a large statement, one supportive sentence and the
 * project pill (+ booking only when configured). The black footer follows right after.
 */
export function ContactCTA({
  label = "Next project",
  headline = "LET'S CREATE\nSOMETHING\n*EXTRAORDINARY.*",
  sentence = "Tell us what you're building. We'll help you explore what's possible.",
  service,
  location = "home_cta",
}: Props) {
  const contactHref = service ? `/contact?service=${service}` : "/contact";
  return (
    <section aria-labelledby={`${location}-title`} className="shell pb-[clamp(88px,9vw,140px)] pt-[clamp(56px,6vw,96px)]">
      <div className="grid gap-8 border-t border-bg-2 pt-7 md:grid-cols-12">
        <p className="label-mono text-fg-3 md:col-span-3 md:pt-2">{label.replace(/^\d+\s*\/\s*/, "")}</p>
        <div className="md:col-span-9">
          <Headline id={`${location}-title`} text={headline} className="text-display-lg" />
          <p className="mt-6 max-w-xl text-lead text-fg-2">{sentence}</p>
          {siteConfig.contactEmail && (
            <a href={`mailto:${siteConfig.contactEmail}`} className="mt-2 inline-block text-fg underline-offset-4 hover:underline">
              {siteConfig.contactEmail}
            </a>
          )}
          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href={contactHref} size="lg">
              Start your project
            </ButtonLink>
            <BookingLink location={location} />
          </div>
        </div>
      </div>
    </section>
  );
}
