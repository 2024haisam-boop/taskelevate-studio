"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import icon from "../../../public/brand/taskelevate-icon.png";

const KEY = "tes-toast-studio-v1";

/**
 * A small dismissible announcement card under the header (≥md, home page): the studio itself is the news.
 * Slides in after a moment; dismissal is remembered on this device.
 */
export function NewsToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(KEY) === "1";
    } catch {
      /* storage blocked */
    }
    if (dismissed) return;
    const intro = document.documentElement.classList.contains("intro") && performance.now() < 4000;
    const t = window.setTimeout(() => setShow(true), intro ? 3600 : 2600);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked */
    }
  };

  return (
    <aside
      aria-label="Announcement"
      data-show={show}
      className="news-toast fixed right-[var(--shell-pad)] top-[62px] z-40 hidden w-[min(420px,calc(100vw-48px))] gap-4 rounded-[10px] bg-bg-2/95 p-2 pr-3 backdrop-blur-md md:flex"
    >
      <div className="flex size-[120px] shrink-0 items-center justify-center rounded-[8px] bg-lilac">
        <Image src={icon} alt="" className="h-14 w-auto" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-2">
        <p className="pr-8 text-[1.02rem] text-fg">Taskelevate Studios is here</p>
        <p className="mt-1.5 text-[0.88rem] leading-snug text-fg-2">The creative arm of Taskelevate — animation, 3D, websites and video under one roof.</p>
        <Link href="/about" className="mt-auto pt-3 font-mono text-ed-mono uppercase text-fg hover:underline" onClick={dismiss}>
          Meet the studio <span aria-hidden="true">↳</span>
        </Link>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss announcement" className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-bg-3/70 hover:bg-bg-3">
        <X className="size-4" aria-hidden="true" />
      </button>
    </aside>
  );
}
