"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics/track";

interface Props {
  event: AnalyticsEvent;
  props?: Record<string, string | number | boolean>;
}

/** Fires an analytics event once when the page/component mounts. */
export function TrackView({ event, props }: Props) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    track(event, JSON.parse(key) as Record<string, string | number | boolean>);
  }, [event, key]);
  return null;
}
