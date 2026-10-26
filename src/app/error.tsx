"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-x flex min-h-[70svh] flex-col items-start justify-center pt-[calc(var(--nav-top)+var(--nav-h)+40px)] pb-24">
      <p className="label-mono text-fg-3">Something went wrong</p>
      <h1 className="mt-6 font-display text-display-lg font-bold uppercase">
        A frame <em className="text-violet-em">dropped.</em>
      </h1>
      <p className="mt-6 max-w-md text-lead text-fg-2">Please try again. If it keeps happening, you can still reach us from the contact page.</p>
      <div className="mt-10 flex flex-col gap-3 xs:flex-row">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/contact" className="btn glass btn-glass">
          Contact
        </Link>
      </div>
    </section>
  );
}
