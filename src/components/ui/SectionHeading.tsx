import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Headline } from "./Headline";
import { SectionLabel } from "./SectionLabel";

interface Props {
  label: string;
  headline: string;
  description?: ReactNode;
  /** "split": headline left, description bottom-right (desktop). "stacked": everything in one column. */
  layout?: "split" | "stacked" | "center";
  className?: string;
  headlineClassName?: string;
  id?: string;
}

export function SectionHeading({
  label,
  headline,
  description,
  layout = "split",
  className,
  headlineClassName,
  id,
}: Props) {
  return (
    <div
      className={cn(
        layout === "split" && "grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10",
        layout === "stacked" && "flex flex-col gap-7",
        layout === "center" && "flex flex-col items-center gap-7 text-center",
        className,
      )}
    >
      <div className={cn(layout === "split" && "lg:col-span-8", "flex flex-col gap-6", layout === "center" && "items-center")}>
        <SectionLabel>{label}</SectionLabel>
        <Headline id={id} text={headline} className={cn("text-display-xl", headlineClassName)} />
      </div>
      {description && (
        <div
          className={cn(
            layout === "split" && "lg:col-span-4 lg:pb-3",
            layout === "center" && "max-w-xl",
            layout === "stacked" && "max-w-xl",
          )}
          data-reveal suppressHydrationWarning
          style={{ "--reveal-delay": "180ms" } as CSSProperties}
        >
          <p className="text-lead text-fg-2">{description}</p>
        </div>
      )}
    </div>
  );
}
