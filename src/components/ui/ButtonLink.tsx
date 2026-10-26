import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "glass" | "accent";
type Size = "sm" | "md" | "lg";

interface Props extends Omit<ComponentProps<typeof Link>, "className" | "children"> {
  variant?: Variant;
  size?: Size;
  arrow?: "right" | "up-right" | false;
  className?: string;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  glass: "glass btn-glass",
  accent: "btn-accent",
};
const sizeClass: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

/**
 * AnimatedButton / GlassButton as a link. Every instance must receive a real `href`.
 * States: hover (sheen / tint), focus-visible (global ring), active (press scale),
 * reduced motion (transitions are opacity/colour only — no movement beyond 3px).
 */
export function ButtonLink({ variant = "primary", size = "md", arrow = "right", className, children, ...rest }: Props) {
  const Icon = ArrowUpRight;
  return (
    <Link
      {...rest}
      data-glass-reflect={variant === "glass" ? "" : undefined}
      className={cn("btn", variantClass[variant], sizeClass[size], className)}
    >
      {children}
      {arrow === "up-right" && <Icon className="btn-arrow size-4" aria-hidden="true" />}
      {arrow === "right" && (
        <span aria-hidden="true" className="btn-arrow text-[0.8em]">
          ↳
        </span>
      )}
    </Link>
  );
}
