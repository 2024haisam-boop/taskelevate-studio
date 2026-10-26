import { Box, Clapperboard, LayoutDashboard, MousePointerClick, type LucideProps } from "lucide-react";
import type { ServiceIcon as ServiceIconName } from "@/data/services";

const icons = {
  "layout-dashboard": LayoutDashboard,
  box: Box,
  "mouse-pointer-click": MousePointerClick,
  clapperboard: Clapperboard,
} as const;

export function ServiceIcon({ name, ...props }: { name: ServiceIconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" strokeWidth={1.5} {...props} />;
}
