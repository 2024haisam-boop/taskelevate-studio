import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { ProjectInquiryForm } from "@/components/forms/ProjectInquiryForm";
import { BookingLink } from "@/components/ui/BookingLink";
import { PageHero } from "@/components/ui/PageHero";
import { isDeliveryConfigured } from "@/lib/forms/delivery";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Start a Project",
  description:
    "Tell Taskelevate Studios about your SaaS animation, 3D product animation, interactive website or video editing project.",
  path: "/contact",
});

const steps = [
  { title: "We read your brief", text: "Every inquiry is reviewed by the people who would work on it." },
  { title: "We reply by email", text: "With questions, first thoughts, or an invitation to a short discovery call." },
  { title: "You get a clear proposal", text: "Scope, approach, timeline and investment — agreed before anything starts." },
];

export default function ContactPage() {
  const deliveryAvailable = isDeliveryConfigured();
  return (
    <>
      <PageHero
        label="Contact / New project"
        headline={"TELL US\nWHAT'S *NEXT.*"}
        description="Share your idea, challenge, or upcoming project. We'll take it from there."
      />
      <section aria-label="Project inquiry" className="pb-[clamp(72px,10vw,152px)]">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-10">
          <aside className="order-2 lg:order-1 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-top)+var(--nav-h)+32px)]">
              <h2 className="label-mono text-fg-3">What happens next</h2>
              <ol className="mt-6 flex flex-col">
                {steps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-line py-6">
                    <span className="label-mono pt-1 text-violet-bright">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-fg">{s.title}</h3>
                      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-fg-2">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {(siteConfig.contactEmail || siteConfig.bookingUrl) && (
                <div className="mt-4 flex flex-col gap-3 border-t border-line pt-6">
                  <p className="label-mono text-fg-3">Prefer to talk?</p>
                  {siteConfig.contactEmail && (
                    <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex min-h-11 items-center gap-2 text-fg-2 transition-colors hover:text-fg">
                      <Mail className="size-4" aria-hidden="true" />
                      {siteConfig.contactEmail}
                    </a>
                  )}
                  <BookingLink location="contact_aside" size="md" />
                </div>
              )}
            </div>
          </aside>
          <div className="order-1 lg:order-2 lg:col-span-8">
            <ProjectInquiryForm deliveryAvailable={deliveryAvailable} contactEmail={siteConfig.contactEmail} />
          </div>
        </div>
      </section>
    </>
  );
}
