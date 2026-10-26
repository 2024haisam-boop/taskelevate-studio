import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  text: string;
  children?: ReactNode;
  className?: string;
  size?: number;
}

/** Circular text that slowly rotates around a centre icon — the classic studio "popup rotator". */
export function RotatingBadge({ text, children, className, size = 140 }: Props) {
  const id = `badge-${text.replace(/[^a-z]/gi, "").toLowerCase()}`;
  const repeated = `${text} • ${text} • `;
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="badge-spin absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <path id={id} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text fill="currentColor" fontFamily="var(--font-mono)" fontSize="9.6" letterSpacing="3.2">
          <textPath href={`#${id}`}>{repeated.toUpperCase()}</textPath>
        </text>
      </svg>
      <span className="relative inline-flex items-center justify-center">{children}</span>
    </span>
  );
}
