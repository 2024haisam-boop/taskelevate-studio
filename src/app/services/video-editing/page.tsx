import { ServicePageTemplate } from "@/components/services/ServicePageTemplate";
import { serviceMetadata } from "@/lib/seo/service-metadata";

export const metadata = serviceMetadata("video-editing");

export default function Page() {
  return <ServicePageTemplate slug="video-editing" />;
}
