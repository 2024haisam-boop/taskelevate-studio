import type { ProjectArtVariant } from "@/data/projects";
import type { ServiceVisual } from "@/data/services";

/** Which generated composition previews each service. */
export const serviceArt: Record<ServiceVisual, ProjectArtVariant> = {
  saas: "saas-dashboard",
  product: "product-studio",
  web: "web-layers",
  edit: "edit-interview",
};
