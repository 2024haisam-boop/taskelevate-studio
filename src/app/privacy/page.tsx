import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";
import { LegalPage } from "@/components/ui/LegalPage";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Taskelevate Studios handles information submitted through studio.taskelevate.com.",
  path: "/privacy",
});

// NOTE FOR THE BUSINESS: this describes what the site's code actually does. Have it reviewed
// for your jurisdiction(s) before launch, and update it if you enable analytics or new tools.
export default function PrivacyPage() {
  const analytics = siteConfig.analytics.provider;
  return (
    <LegalPage title={"PRIVACY\n*POLICY.*"} updated="21 October 2026">
      <section>
        <h2>Who we are</h2>
        <p className="mt-3">
          This website is operated by Taskelevate Studios, the creative studio of{" "}
          <a href={siteConfig.parentBrand.url}>Taskelevate</a>. This policy explains what information the site collects and
          why.
        </p>
      </section>
      <section>
        <h2>Information you send us</h2>
        <p className="mt-3">When you submit the project inquiry form we receive:</p>
        <ul>
          <li>your name, work email and (optionally) company or brand;</li>
          <li>the service, budget range, timeline and project description you choose to share;</li>
          <li>
            campaign information, if you arrived through a tagged link (UTM source, medium, campaign, content and term), the
            first page you visited and the referring website&apos;s domain.
          </li>
        </ul>
        <p className="mt-3">
          We use this only to respond to your inquiry and to understand which channels bring us enquiries. It is delivered to
          our inbox by our email provider (Resend) and is not sold or shared for advertising.
        </p>
      </section>
      <section>
        <h2>Campaign attribution</h2>
        <p className="mt-3">
          If you arrive through a tagged link, the campaign values are kept in your browser&apos;s session storage for the
          current visit so they can be attached to an inquiry you choose to send. They are cleared when the browsing session
          ends. No cookies are used for this.
        </p>
      </section>
      <section>
        <h2>Analytics</h2>
        <p className="mt-3">
          {analytics === "none" &&
            "This site currently does not load any third-party analytics or advertising trackers."}
          {analytics === "plausible" &&
            "We use Plausible Analytics, a privacy-focused service that does not use cookies or collect personal data, to count page views and a small set of events (such as viewing a service page or sending an inquiry)."}
          {analytics === "ga4" &&
            "With your consent, we use Google Analytics to understand how pages are used. Analytics only loads after you choose “Allow analytics”, and you can decline."}
        </p>
      </section>
      <section>
        <h2>Hosting and security</h2>
        <p className="mt-3">
          The site is hosted on Vercel. Like most web servers, the hosting platform processes technical data such as IP
          addresses to deliver pages and protect the service; our inquiry endpoint uses the IP address briefly to limit abuse
          (rate limiting).
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p className="mt-3">
          You can ask us to access, correct or delete the information you sent us
          {siteConfig.contactEmail ? (
            <>
              {" "}
              by emailing <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </>
          ) : (
            <>
              {" "}
              through our <Link href="/contact">contact page</Link>
            </>
          )}
          .
        </p>
      </section>
    </LegalPage>
  );
}
