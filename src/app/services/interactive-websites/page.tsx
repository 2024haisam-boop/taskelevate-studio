import { ServicePageTemplate } from "@/components/services/ServicePageTemplate";
import { serviceMetadata } from "@/lib/seo/service-metadata";

export const metadata = serviceMetadata("interactive-websites");

export default function Page() {
  return <ServicePageTemplate slug="interactive-websites" />;
}
