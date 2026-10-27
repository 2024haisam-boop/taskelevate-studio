import type { ServiceVisual as Visual } from "@/data/services";
import { SaaSScene } from "@/components/three/SaaSScene";
import { EditScene } from "./EditScene";
import { ProductShowcase } from "./ProductShowcase";
import { SceneViewport } from "./SceneViewport";
import { WebShowcase } from "./WebShowcase";

/** Each service gets its own signature visual — related system, never a clone. */
export function ServiceVisual({ visual, caption }: { visual: Visual; caption?: string }) {
  switch (visual) {
    case "saas":
      return (
        <SceneViewport label="Interface study / Layers 07" caption={caption}>
          <SaaSScene />
        </SceneViewport>
      );
    case "web":
      // a website you can play with: the live 3D configurator (falls back to the CSS depth study without WebGL)
      return <WebShowcase caption={caption} />;
    case "product":
      return (
        <figure className="m-0">
          <ProductShowcase />
          {caption && <figcaption className="mt-4 text-sm text-fg-3">{caption}</figcaption>}
        </figure>
      );
    case "edit":
      return (
        <div>
          <EditScene />
          {caption && <p className="mt-3 text-sm text-fg-3">{caption}</p>}
        </div>
      );
  }
}
