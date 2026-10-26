import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import logoWhite from "../../../public/brand/taskelevate-logo-white.png";
import logoDark from "../../../public/brand/taskelevate-logo-dark.png";
import logoIcon from "../../../public/brand/taskelevate-icon.png";

/**
 * APPROVED LOGO USAGES (brief §04) — all use the ORIGINAL supplied artwork.
 *   1. "inline"  — full horizontal Taskelevate Studios lockup (wordmark + hairline + STUDIOS)
 *   2. "icon"    — icon only (favicon / compact UI)
 *   3. "stacked" — wordmark + unchanged gradient icon, STUDIOS beneath the wordmark
 * Each in the supplied dark (for light backgrounds) or white (for dark backgrounds) artwork — never recoloured.
 *
 * The icon and wordmark are never redrawn. "STUDIOS" is live text set beside or
 * beneath the artwork. Geometry constants come from measuring the PNG:
 * the wordmark text starts at 19.14% of the trimmed width; its baseline sits at 81% of the height.
 */

const WORDMARK_RATIO = logoWhite.width / logoWhite.height; // ≈ 3.46
const ICON_RATIO = logoIcon.width / logoIcon.height; // ≈ 0.744
const TEXT_START = 0.1914;

type Variant = "inline" | "stacked" | "icon";
/** "dark" = dark artwork for light backgrounds (header); "light" = white artwork for dark backgrounds (footer) */
type Tone = "dark" | "light";

interface BrandLogoProps {
  variant?: Variant;
  /** Rendered height of the logo artwork in px */
  height?: number;
  href?: string | null;
  className?: string;
  eager?: boolean;
  /** Hide the STUDIOS label below this breakpoint (inline variant) */
  labelClassName?: string;
  tone?: Tone;
}

export function BrandLogo({
  variant = "inline",
  height = 28,
  href = "/",
  className,
  eager = false,
  labelClassName,
  tone = "dark",
}: BrandLogoProps) {
  const art = tone === "dark" ? logoDark : logoWhite;
  const content = (() => {
    if (variant === "icon") {
      return (
        <Image
          src={logoIcon}
          alt="Taskelevate Studios"
          height={height}
          width={Math.round(height * ICON_RATIO)}
          loading={eager ? "eager" : "lazy"}
          className="block select-none"
          draggable={false}
        />
      );
    }

    const width = Math.round(height * WORDMARK_RATIO);
    const wordmark = (
      <Image
        src={art}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        className="block select-none"
        draggable={false}
      />
    );

    if (variant === "stacked") {
      return (
        <span className="relative inline-flex flex-col" style={{ width }}>
          {wordmark}
          <span
            aria-hidden="true"
            className={cn("block font-mono font-medium uppercase", tone === "dark" ? "text-fg-2" : "text-white/60")}
            style={{
              paddingLeft: `${TEXT_START * 100}%`,
              marginTop: `${-height * 0.1}px`,
              fontSize: `${Math.max(9, height * 0.2)}px`,
              letterSpacing: "0.62em",
              lineHeight: 1,
            }}
          >
            Studios
          </span>
          <span className="sr-only">Taskelevate Studios</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center">
        {wordmark}
        {/* Label band is aligned to the wordmark's letter zone (≈42%–84% of the artwork height) */}
        <span
          aria-hidden="true"
          className={cn("ml-3 box-border flex items-center gap-3", labelClassName)}
          style={{ height, paddingTop: height * 0.42, paddingBottom: height * 0.16 }}
        >
          <span className={cn("h-full w-px", tone === "dark" ? "bg-black/20" : "bg-white/25")} />
          <span className={cn("font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.3em]", tone === "dark" ? "text-fg-2" : "text-white/60")}>
            Studios
          </span>
        </span>
        <span className="sr-only">Taskelevate Studios</span>
      </span>
    );
  })();

  if (!href) return <span className={cn("inline-flex", className)}>{content}</span>;

  return (
    <Link
      href={href}
      aria-label="Taskelevate Studios — home"
      className={cn("inline-flex shrink-0 items-center rounded-lg", className)}
    >
      {content}
    </Link>
  );
}
