import Image from "next/image";
import { siteConfig } from "@/data/site-config";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Headline } from "@/components/ui/Headline";
import { SectionLabel } from "@/components/ui/SectionLabel";

const pillars = [
  { index: "01", title: "Strategy", text: "A clear purpose before a single frame or pixel." },
  { index: "02", title: "Design", text: "Composition, type, colour and motion — every detail considered." },
  { index: "03", title: "Technology", text: "Engineered to perform, on every screen it reaches." },
];

/** SECTION 7 — Studio philosophy (brief §14). Proof blocks render only with REAL content. */
export function StudioSection() {
  const { team, clientReferences } = siteConfig.proof;

  return (
    <section aria-labelledby="studio-title" className="section-y relative overflow-hidden">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <SectionLabel>06 / The studio</SectionLabel>
            <Headline id="studio-title" text={"DETAIL IS\nEVERYTHING."} className="text-display-xl" />
          </div>
          <div className="lg:col-span-4 lg:pt-16" data-reveal suppressHydrationWarning>
            <PrecisionDrawing />
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-12">
          <p className="label-mono text-fg-3 lg:col-span-3 lg:pt-3" data-reveal suppressHydrationWarning>
            Manifesto — v1.0
          </p>
          <p
            className="font-display text-[clamp(1.45rem,3.1vw,2.75rem)] font-medium leading-[1.18] tracking-[-0.025em] text-fg lg:col-span-9"
            data-reveal suppressHydrationWarning
          >
            We believe great creative work comes from the intersection of{" "}
            <span className="text-violet-bright">strategy, design, and technology.</span>{" "}
            <span className="text-fg-2">
              Every project is approached with a clear purpose: to create something memorable, functional, and
              beautifully executed.
            </span>
          </p>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:mt-24 md:grid-cols-3">
          {pillars.map((p, i) => (
            <li
              key={p.index}
              className="bg-bg p-7 md:p-9"
              data-reveal suppressHydrationWarning
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <span className="label-mono text-fg-3">{p.index}</span>
              <h3 className="mt-10 font-display text-2xl font-semibold tracking-[-0.02em] text-fg">{p.title}</h3>
              <p className="mt-3 text-[0.975rem] leading-relaxed text-fg-2">{p.text}</p>
            </li>
          ))}
        </ul>

        {team.length > 0 && (
          <div className="mt-20">
            <h3 className="label-mono text-fg-3">The team</h3>
            <ul className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {team.map((m) => (
                <li key={m.name}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
                    <Image src={m.photo} alt={m.photoAlt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <p className="mt-3 font-medium text-fg">{m.name}</p>
                  <p className="text-sm text-fg-2">{m.role}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {clientReferences.length > 0 && (
          <ul className="mt-20 grid gap-6 md:grid-cols-2">
            {clientReferences.map((r) => (
              <li key={r.name} className="glass rounded-[22px] p-8">
                <blockquote className="text-lg leading-relaxed text-fg">“{r.quote}”</blockquote>
                <p className="mt-6 text-sm text-fg-2">
                  {r.name} — {r.role}, {r.company}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 flex justify-start md:mt-20" data-reveal suppressHydrationWarning>
          <ButtonLink href="/about" variant="glass" size="lg">
            More About the Studio
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** Restrained technical drawing: a measured frame, baseline grid and a bezier with handles. */
function PrecisionDrawing() {
  return (
    <figure className="corner-frame relative aspect-[5/4] w-full p-6" aria-hidden="true">
      <svg viewBox="0 0 500 400" className="h-full w-full" fill="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1="0" x2="500" y1={40 + i * 40} y2={40 + i * 40} stroke="rgba(255,255,255,0.05)" />
        ))}
        <rect x="70" y="80" width="300" height="200" stroke="rgba(255,255,255,0.22)" />
        <rect x="70" y="80" width="300" height="200" fill="url(#pd-fill)" />
        {/* dimension lines */}
        <path d="M70 312 H370 M70 304 V320 M370 304 V320" stroke="rgba(255,255,255,0.3)" />
        <text x="220" y="336" textAnchor="middle" fill="#777C8D" fontFamily="monospace" fontSize="11" letterSpacing="2">
          300.00
        </text>
        <path d="M402 80 V280 M394 80 H410 M394 280 H410" stroke="rgba(255,255,255,0.3)" />
        <text x="424" y="184" fill="#777C8D" fontFamily="monospace" fontSize="11" letterSpacing="2">
          200.00
        </text>
        {/* bezier with handles */}
        <path d="M70 260 C150 260 170 120 250 120 S330 100 370 96" stroke="#A855F7" strokeWidth="2" />
        <path d="M70 260 L150 260 M250 120 L170 120 M250 120 L330 120" stroke="rgba(255,255,255,0.28)" strokeDasharray="3 4" />
        {[
          [70, 260],
          [250, 120],
          [370, 96],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x! - 5} y={y! - 5} width="10" height="10" fill="#08090D" stroke="#F8F9FD" strokeWidth="1.5" />
        ))}
        {[
          [150, 260],
          [170, 120],
          [330, 120],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#189BE8" />
        ))}
        {/* crosshair */}
        <path d="M440 40 V52 M434 46 H446" stroke="rgba(255,255,255,0.35)" />
        <text x="70" y="62" fill="#777C8D" fontFamily="monospace" fontSize="11" letterSpacing="2">
          EASE · CUBIC-BEZIER(0.16, 1, 0.3, 1)
        </text>
        <defs>
          <linearGradient id="pd-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8755E8" stopOpacity="0.08" />
            <stop offset="1" stopColor="#189BE8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </figure>
  );
}
