import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { DecodeText } from "./DecodeText";
import { Headline } from "./Headline";

interface Props {
  label: string;
  headline: string;
  description?: ReactNode;
  children?: ReactNode;
  /** Visual rendered beside (desktop) / below (mobile) the copy */
  visual?: ReactNode;
  className?: string;
  headlineClassName?: string;
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Inner-page hero: label, display h1 (CSS entrance), description, actions and optional visual. */
export function PageHero({ label, headline, description, children, visual, className, headlineClassName }: Props) {
  return (
    <section className={cn("relative isolate overflow-hidden", className)} aria-labelledby="page-title">
      <div className="shell pb-16 pt-[clamp(120px,14vw,200px)] md:pb-24">
        <p className="hero-fade label-mono flex items-center gap-3 text-fg-3" style={d(0)}>
          <DecodeText text={label} />
        </p>
        <Headline
          as="h1"
          id="page-title"
          text={headline}
          entrance
          className={cn("mt-7 text-display-xl md:mt-9", headlineClassName)}
        />
        {(description || children || visual) && (
          <div className={cn("mt-10 md:mt-14", Boolean(visual) && "grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-10")}>
            <div className={cn(Boolean(visual) && "lg:col-span-5 xl:col-span-4")}>
              {description && (
                <p className="hero-fade-up max-w-xl text-lead text-fg-2" style={d(450)}>
                  {description}
                </p>
              )}
              {children && (
                <div className="hero-fade-up mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap" style={d(600)}>
                  {children}
                </div>
              )}
            </div>
            {visual && (
              <div className="hero-fade-up lg:col-span-7 xl:col-span-8" style={d(500)}>
                {visual}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
