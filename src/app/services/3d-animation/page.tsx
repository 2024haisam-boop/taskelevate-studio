import { ServicePageTemplate } from "@/components/services/ServicePageTemplate";
import { serviceMetadata } from "@/lib/seo/service-metadata";

export const metadata = serviceMetadata("3d-animation");

export default function Page() {
  return <ServicePageTemplate slug="3d-animation" />;
}
