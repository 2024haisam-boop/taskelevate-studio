import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

/**
 * GlassButton (action) — for links use `ButtonLink variant="glass"`.
 * States: hover tint, focus-visible ring (global), active press, disabled.
 */
export function GlassButton({ size = "md", className, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      data-glass-reflect=""
      className={cn("btn glass btn-glass disabled:opacity-50", size === "sm" && "btn-sm", size === "lg" && "btn-lg", className)}
      {...rest}
    />
  );
}
