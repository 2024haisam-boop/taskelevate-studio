import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { LegalPage } from "@/components/ui/LegalPage";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "Terms for using studio.taskelevate.com.",
  path: "/terms",
});

// NOTE FOR THE BUSINESS: website terms of use only — project work is governed by your proposal/contract.
// Have these reviewed before launch.
export default function TermsPage() {
  return (
    <LegalPage title={"TERMS OF\n*USE.*"} updated="21 October 2026">
      <section>
        <h2>Using this website</h2>
        <p className="mt-3">
          By using studio.taskelevate.com you agree to these terms. The site is provided to describe the services of
          Taskelevate Studios, a studio of <a href={siteConfig.parentBrand.url}>Taskelevate</a>.
        </p>
      </section>
      <section>
        <h2>Content and intellectual property</h2>
        <p className="mt-3">
          Unless stated otherwise, the design, code, text and visuals on this site belong to Taskelevate or are used with
          permission. Client work shown remains the property of its respective owners. You may not reuse site content without
          written permission.
        </p>
      </section>
      <section>
        <h2>Inquiries are not contracts</h2>
        <p className="mt-3">
          Sending an inquiry does not create an agreement. Scope, timelines, fees and rights for any project are set out in a
          separate written proposal or contract.
        </p>
      </section>
      <section>
        <h2>Accuracy and availability</h2>
        <p className="mt-3">
          We aim to keep information accurate and the site available, but it is provided “as is” and may change without
          notice. Example portfolio layouts are labelled as such and do not describe real client projects.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Questions about these terms? <Link href="/contact">Get in touch</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
