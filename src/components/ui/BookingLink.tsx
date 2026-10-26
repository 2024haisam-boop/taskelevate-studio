"use client";

import { CalendarDays } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils/cn";

interface Props {
  location: string;
  className?: string;
  label?: string;
  variant?: "glass" | "primary";
  size?: "md" | "lg";
}

/**
 * "Book a Discovery Call" — renders NOTHING unless a real booking URL is configured
 * (NEXT_PUBLIC_BOOKING_URL). Opens the genuine scheduling page in a new tab.
 */
export function BookingLink({ location, className, label = "Book a Discovery Call", variant = "glass", size = "lg" }: Props) {
  if (!siteConfig.bookingUrl) return null;
  return (
    <a
      href={siteConfig.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-glass-reflect={variant === "glass" ? "" : undefined}
      className={cn("btn", variant === "glass" ? "glass btn-glass" : "btn-primary", size === "lg" && "btn-lg", className)}
      onClick={() => track("booking_clicked", { location })}
    >
      <CalendarDays className="size-4" aria-hidden="true" />
      {label}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
