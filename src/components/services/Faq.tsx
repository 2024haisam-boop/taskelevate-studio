import { Plus } from "lucide-react";
import type { ServiceFaq } from "@/data/services";

/** Native <details>/<summary> accordion — keyboard and screen-reader accessible by default. */
export function Faq({ items }: { items: ServiceFaq[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group py-1" data-reveal suppressHydrationWarning>
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left font-display text-lg font-semibold tracking-[-0.015em] text-fg marker:hidden md:text-xl [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong transition-[transform,background-color] duration-300 group-open:rotate-45 group-open:bg-black/5">
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 pr-14 text-[1rem] leading-relaxed text-fg-2">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
