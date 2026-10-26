import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Props extends Omit<ComponentProps<typeof Link>, "className" | "children"> {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}

/** Compact glassy lilac (or white) pill with a ↳ arrow — the CTA used across the site. */
export function PillLink({ children, className, tone = "dark", ...rest }: Props) {
  return (
    <Link {...rest} className={cn("btn btn-sm", tone === "dark" ? "btn-primary" : "btn-invert", className)}>
      {children}
      <span aria-hidden="true" className="btn-arrow">
        ↳
      </span>
    </Link>
  );
}
