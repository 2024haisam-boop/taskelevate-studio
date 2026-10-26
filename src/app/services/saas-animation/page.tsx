import { ServicePageTemplate } from "@/components/services/ServicePageTemplate";
import { serviceMetadata } from "@/lib/seo/service-metadata";

export const metadata = serviceMetadata("saas-animation");

export default function Page() {
  return <ServicePageTemplate slug="saas-animation" />;
}
