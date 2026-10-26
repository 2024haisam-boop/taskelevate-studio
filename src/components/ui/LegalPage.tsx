import type { ReactNode } from "react";
import { PageHero } from "./PageHero";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero label={`Legal / Last updated ${updated}`} headline={title} headlineClassName="text-display-lg" />
      <div className="container-x pb-32">
        <div className="max-w-3xl space-y-10 text-[1rem] leading-relaxed text-fg-2 [&_a]:text-fg [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-fg [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </>
  );
}
