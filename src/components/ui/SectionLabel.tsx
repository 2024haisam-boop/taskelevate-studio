import { cn } from "@/lib/utils/cn";

/** Technical micro-label, e.g. "01 / OUR CAPABILITIES". */
export function SectionLabel({ children, className }: { children: string; className?: string }) {
  const [index, ...rest] = children.split(" / ");
  const hasIndex = rest.length > 0;
  return (
    <p className={cn("label-mono flex items-center gap-3 text-fg-3", className)} data-reveal="fade" suppressHydrationWarning>
      {hasIndex ? (
        <span>
          <span className="text-fg">{index}</span>
          <span className="mx-2 text-fg-3">/</span>
          {rest.join(" / ")}
        </span>
      ) : (
        <span>{children}</span>
      )}
    </p>
  );
}
