import type { ReactNode } from "react";
import type { ProjectArtVariant } from "@/data/projects";
import { cn } from "@/lib/utils/cn";

/**
 * Generated placeholder compositions for EXAMPLE portfolio slots and service previews.
 * Pure SVG (no network requests, no layout shift, crisp at any size). They depict the
 * *type* of work — never a real client. Replace with real project media in data/projects.ts.
 */

const C = {
  bg: "#0E1017",
  panel: "#151720",
  panel2: "#1B1E29",
  line: "rgba(255,255,255,0.09)",
  line2: "rgba(255,255,255,0.16)",
  fg: "#F8F9FD",
  fg2: "#AFB3C1",
  fg3: "#777C8D",
  violet: "#8755E8",
  bright: "#A855F7",
  blue: "#189BE8",
};

interface Props {
  variant: ProjectArtVariant;
  className?: string;
  /** Unique prefix for SVG ids when the same variant renders twice on one page */
  uid?: string;
  title?: string;
}

export function ProjectArt({ variant, className, uid = variant, title }: Props) {
  const id = (name: string) => `${uid}-${name}`;
  const bg = (name: string) => `${uid}-bg-${name}`;
  return (
    <div
      className={cn("theme-dark relative h-full w-full overflow-hidden bg-bg-2", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* Full-bleed backdrop: always covers the frame */}
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 block h-full w-full">
        <defs>
          <radialGradient id={bg("glow-tl")} cx="18%" cy="8%" r="75%">
            <stop offset="0" stopColor={C.violet} stopOpacity="0.32" />
            <stop offset="0.55" stopColor={C.violet} stopOpacity="0.04" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={bg("glow-br")} cx="92%" cy="100%" r="70%">
            <stop offset="0" stopColor={C.blue} stopOpacity="0.22" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
          <pattern id={bg("grid")} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="-400" y="-400" width="1600" height="1400" fill={C.bg} />
        <rect x="-400" y="-400" width="1600" height="1400" fill={`url(#${bg("grid")})`} />
        <rect x="-400" y="-400" width="1600" height="1400" fill={`url(#${bg("glow-tl")})`} />
        <rect x="-400" y="-400" width="1600" height="1400" fill={`url(#${bg("glow-br")})`} />
      </svg>

      {/* Composition: always fully visible, whatever the tile's aspect ratio */}
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 block h-full w-full">
        <defs>
          <radialGradient id={id("glow-tl")} cx="18%" cy="8%" r="75%">
            <stop offset="0" stopColor={C.violet} stopOpacity="0.32" />
            <stop offset="0.55" stopColor={C.violet} stopOpacity="0.04" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id("brand")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.blue} />
            <stop offset="1" stopColor={C.bright} />
          </linearGradient>
          <linearGradient id={id("area")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.bright} stopOpacity="0.45" />
            <stop offset="1" stopColor={C.bright} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1C1F2B" />
            <stop offset="1" stopColor="#12141C" />
          </linearGradient>
          <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3A3E4C" />
            <stop offset="0.45" stopColor="#1A1D26" />
            <stop offset="0.7" stopColor="#2A2E3A" />
            <stop offset="1" stopColor="#0F1117" />
          </linearGradient>
          <radialGradient id={id("lens")} cx="38%" cy="34%" r="70%">
            <stop offset="0" stopColor="#5B4A9A" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#1B1530" />
            <stop offset="1" stopColor="#05060A" />
          </radialGradient>
          <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#151720" />
            <stop offset="1" stopColor="#08090D" stopOpacity="0" />
          </linearGradient>
        </defs>

        {variant === "saas-dashboard" && <SaasDashboard id={id} />}
        {variant === "saas-flow" && <SaasFlow id={id} />}
        {variant === "product-studio" && <ProductStudio id={id} />}
        {variant === "product-exploded" && <ProductExploded id={id} />}
        {variant === "web-configurator" && <WebConfigurator id={id} />}
        {variant === "web-layers" && <WebLayers id={id} />}
        {variant === "edit-interview" && <EditInterview id={id} />}
        {variant === "edit-vertical" && <EditVertical id={id} />}
      </svg>
    </div>
  );
}

type IdFn = (name: string) => string;

function Window({ x, y, w, h, id, children }: { x: number; y: number; w: number; h: number; id: IdFn; children?: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="14" fill={`url(#${id("panel")})`} stroke={C.line2} />
      <rect x="0.5" y="0.5" width={w - 1} height="30" rx="13.5" fill="rgba(255,255,255,0.025)" />
      <circle cx="18" cy="15.5" r="4" fill="rgba(255,255,255,0.16)" />
      <circle cx="32" cy="15.5" r="4" fill="rgba(255,255,255,0.1)" />
      <circle cx="46" cy="15.5" r="4" fill="rgba(255,255,255,0.07)" />
      <line x1="0" y1="31" x2={w} y2="31" stroke={C.line} />
      {children}
    </g>
  );
}

function Bars({ x, y, widths, color = "rgba(255,255,255,0.12)", gap = 12, h = 6 }: { x: number; y: number; widths: number[]; color?: string; gap?: number; h?: number }) {
  return (
    <g>
      {widths.map((w, i) => (
        <rect key={i} x={x} y={y + i * gap} width={w} height={h} rx={h / 2} fill={color} />
      ))}
    </g>
  );
}

/* --------------------------------------------------------------------- */

function SaasDashboard({ id }: { id: IdFn }) {
  return (
    <g>
      <Window x={110} y={92} w={560} h={380} id={id}>
        {/* sidebar */}
        <rect x="14" y="46" width="118" height="320" rx="10" fill="rgba(255,255,255,0.025)" />
        <rect x="26" y="60" width="22" height="22" rx="7" fill={`url(#${id("brand")})`} />
        <Bars x={26} y={102} widths={[84, 66, 76, 58, 70]} gap={22} />
        <rect x="22" y="96" width="102" height="18" rx="7" fill="rgba(168,85,247,0.16)" />
        {/* KPIs */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${148 + i * 134} 46)`}>
            <rect width="124" height="70" rx="10" fill="rgba(255,255,255,0.035)" stroke={C.line} />
            <rect x="12" y="14" width="44" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
            <rect x="12" y="32" width={i === 1 ? 70 : 58} height="14" rx="4" fill={i === 0 ? C.fg : "rgba(255,255,255,0.45)"} opacity={i === 0 ? 0.9 : 1} />
            <path d={`M78 ${56 - i * 3} l10 -6 l10 4 l14 -12`} fill="none" stroke={i === 2 ? C.blue : C.bright} strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
        {/* chart */}
        <g transform="translate(148 130)">
          <rect width="392" height="236" rx="12" fill="rgba(255,255,255,0.02)" stroke={C.line} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="16" x2="376" y1={52 + i * 44} y2={52 + i * 44} stroke="rgba(255,255,255,0.05)" />
          ))}
          <path d="M16 196 C60 186 76 150 118 152 S180 112 220 120 S290 70 330 74 S366 52 376 46 L376 220 L16 220Z" fill={`url(#${id("area")})`} />
          <path d="M16 196 C60 186 76 150 118 152 S180 112 220 120 S290 70 330 74 S366 52 376 46" fill="none" stroke={C.bright} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="330" cy="74" r="6" fill={C.bg} stroke={C.fg} strokeWidth="2" />
          <rect x="16" y="16" width="90" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
        </g>
      </Window>
      {/* floating depth card */}
      <g transform="translate(560 330)">
        <rect width="170" height="128" rx="16" fill="#191C27" stroke={C.line2} />
        <rect width="170" height="128" rx="16" fill="rgba(255,255,255,0.03)" />
        <circle cx="52" cy="64" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx="52" cy="64" r="30" fill="none" stroke={`url(#${id("brand")})`} strokeWidth="10" strokeDasharray="130 189" strokeLinecap="round" transform="rotate(-90 52 64)" />
        <Bars x={98} y={46} widths={[52, 38, 46]} gap={16} />
      </g>
      {/* feature marker */}
      <g transform="translate(470 196)">
        <circle r="16" fill="rgba(168,85,247,0.16)" />
        <circle r="5" fill={C.bright} />
      </g>
      {/* cursor */}
      <path d="M612 238 l0 30 l8 -8 l6 14 l6 -3 l-6 -13 l11 0z" fill={C.fg} stroke={C.bg} strokeWidth="1.5" />
    </g>
  );
}

function SaasFlow({ id }: { id: IdFn }) {
  const cards = [
    { x: 92, y: 210, t: "01" },
    { x: 318, y: 132, t: "02" },
    { x: 544, y: 236, t: "03" },
  ];
  return (
    <g>
      <path d="M262 292 C300 292 290 214 318 214" fill="none" stroke={C.line2} strokeWidth="2" strokeDasharray="5 7" />
      <path d="M488 214 C520 214 512 318 544 318" fill="none" stroke={C.line2} strokeWidth="2" strokeDasharray="5 7" />
      {cards.map((c, i) => (
        <g key={c.t} transform={`translate(${c.x} ${c.y})`}>
          <rect width="170" height="170" rx="18" fill={`url(#${id("panel")})`} stroke={i === 1 ? "rgba(168,85,247,0.55)" : C.line2} />
          <text x="18" y="32" fill={C.fg3} fontFamily="monospace" fontSize="12" letterSpacing="2">
            STEP {c.t}
          </text>
          <rect x="18" y="52" width="96" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
          <Bars x={18} y={76} widths={[134, 110, 122]} gap={14} />
          {/* toggle */}
          <rect x="18" y="128" width="44" height="24" rx="12" fill={i === 1 ? C.bright : "rgba(255,255,255,0.1)"} />
          <circle cx={i === 1 ? 50 : 30} cy="140" r="8" fill={C.fg} />
          {i === 2 && (
            <g transform="translate(124 124)">
              <circle r="16" fill="rgba(24,155,232,0.2)" />
              <path d="M-7 0 l5 5 l9 -10" stroke={C.blue} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>
      ))}
      <circle cx="318" cy="214" r="5" fill={C.bright} />
      <circle cx="544" cy="318" r="5" fill={C.blue} />
      {/* motion trail */}
      <path d="M300 470 C380 430 440 500 520 452" fill="none" stroke={`url(#${id("brand")})`} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {[300, 360, 420, 480, 520].map((x, i) => (
        <rect key={x} x={x - 4} y={[466, 446, 468, 462, 448][i]! - 4} width="8" height="8" transform={`rotate(45 ${x} ${[466, 446, 468, 462, 448][i]})`} fill={i === 4 ? C.fg : "rgba(255,255,255,0.35)"} />
      ))}
    </g>
  );
}

function CameraBody({ id, x, y, s = 1 }: { id: IdFn; x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* top dial + button */}
      <rect x="-118" y="-112" width="56" height="20" rx="6" fill="#20232E" stroke={C.line2} />
      <rect x="44" y="-104" width="34" height="12" rx="5" fill="#2A2E3B" />
      {/* body */}
      <rect x="-170" y="-94" width="340" height="188" rx="34" fill={`url(#${id("metal")})`} stroke="rgba(255,255,255,0.14)" />
      <rect x="-170" y="-94" width="340" height="60" rx="30" fill="rgba(255,255,255,0.045)" />
      <path d="M-140 -92 H140" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      {/* grip texture */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={-158 + i * 6} y1="-40" x2={-158 + i * 6} y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
      ))}
      {/* lens rings */}
      <circle cx="18" cy="4" r="82" fill="#0C0D12" stroke="rgba(255,255,255,0.18)" />
      <circle cx="18" cy="4" r="72" fill="#14161E" stroke="rgba(135,85,232,0.7)" strokeWidth="2" />
      <circle cx="18" cy="4" r="60" fill="#0B0C11" stroke="rgba(255,255,255,0.1)" />
      <circle cx="18" cy="4" r="46" fill={`url(#${id("lens")})`} />
      <circle cx="18" cy="4" r="20" fill="#06070B" />
      <ellipse cx="2" cy="-14" rx="14" ry="8" fill="rgba(255,255,255,0.35)" transform="rotate(-30 2 -14)" />
      <circle cx="40" cy="24" r="3" fill="rgba(168,85,247,0.8)" />
      {/* status LED */}
      <circle cx="140" cy="-62" r="3.5" fill={C.bright} />
    </g>
  );
}

function ProductStudio({ id }: { id: IdFn }) {
  return (
    <g>
      {/* cyclorama floor */}
      <path d="M0 430 Q400 380 800 430 V600 H0Z" fill={`url(#${id("floor")})`} />
      <path d="M0 430 Q400 380 800 430" fill="none" stroke="rgba(255,255,255,0.06)" />
      {/* key light */}
      <path d="M250 0 L550 0 L470 420 L330 420Z" fill="rgba(255,255,255,0.018)" />
      <ellipse cx="400" cy="440" rx="220" ry="22" fill="#000" opacity="0.6" />
      <ellipse cx="400" cy="440" rx="140" ry="10" fill="#000" opacity="0.6" />
      <CameraBody id={id} x={400} y={318} s={1.02} />
      {/* rim light */}
      <path d="M572 236 Q580 318 572 400" stroke="rgba(168,85,247,0.5)" strokeWidth="2" fill="none" />
      <text x="400" y="560" textAnchor="middle" fill={C.fg3} fontFamily="monospace" fontSize="12" letterSpacing="3">
        LOOKDEV / KEY 5600K / F2.8
      </text>
    </g>
  );
}

function ProductExploded({ id }: { id: IdFn }) {
  // Isometric plates
  const plate = (y: number) => `M400 ${y} L560 ${y + 70} L400 ${y + 140} L240 ${y + 70}Z`;
  const layers = [
    { y: 70, label: "01  SHELL", fill: "#232633", stroke: "rgba(255,255,255,0.2)" },
    { y: 170, label: "02  OPTICS", fill: "#1A1530", stroke: "rgba(168,85,247,0.6)" },
    { y: 270, label: "03  BOARD", fill: "#111C26", stroke: "rgba(24,155,232,0.55)" },
    { y: 370, label: "04  BASE", fill: "#1B1E29", stroke: "rgba(255,255,255,0.16)" },
  ];
  return (
    <g>
      {[240, 400, 560].map((x) => (
        <line key={x} x1={x} y1="140" x2={x} y2="510" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />
      ))}
      {[...layers].reverse().map((l) => (
        <g key={l.label}>
          <path d={plate(l.y + 10)} fill="#000" opacity="0.35" />
          <path d={plate(l.y)} fill={l.fill} stroke={l.stroke} strokeWidth="1.5" />
          <path d={`M240 ${l.y + 70} L240 ${l.y + 80} L400 ${l.y + 150} L560 ${l.y + 80} L560 ${l.y + 70}`} fill="none" stroke="rgba(255,255,255,0.08)" />
          <line x1="560" y1={l.y + 70} x2="640" y2={l.y + 70} stroke="rgba(255,255,255,0.18)" />
          <circle cx="560" cy={l.y + 70} r="3" fill={C.fg2} />
          <text x="650" y={l.y + 74} fill={C.fg2} fontFamily="monospace" fontSize="12" letterSpacing="2">
            {l.label}
          </text>
        </g>
      ))}
      {/* optics ring on layer 2 */}
      <ellipse cx="400" cy="240" rx="54" ry="27" fill="none" stroke={`url(#${id("brand")})`} strokeWidth="3" />
      <ellipse cx="400" cy="240" rx="30" ry="15" fill="#06070B" />
      {/* board traces */}
      <path d="M330 340 h40 l20 10 h40 M350 352 h30 l20 10 h50" stroke="rgba(24,155,232,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="388" y="330" width="26" height="14" rx="2" fill="rgba(24,155,232,0.35)" transform="skewX(-20)" />
    </g>
  );
}

function WebConfigurator({ id }: { id: IdFn }) {
  return (
    <g>
      <Window x={80} y={70} w={640} h={460} id={id}>
        <rect x="16" y="44" width="608" height="28" rx="8" fill="rgba(255,255,255,0.025)" />
        <rect x="28" y="54" width="64" height="8" rx="4" fill="rgba(255,255,255,0.25)" />
        <Bars x={420} y={55} widths={[40]} />
        <Bars x={474} y={55} widths={[40]} />
        <rect x="540" y="50" width="72" height="16" rx="8" fill={C.fg} opacity="0.85" />
        {/* stage */}
        <rect x="16" y="84" width="400" height="360" rx="12" fill="rgba(255,255,255,0.015)" stroke={C.line} />
        <ellipse cx="216" cy="380" rx="140" ry="16" fill="#000" opacity="0.55" />
        <g transform="translate(216 270) scale(0.62)">
          <CameraBody id={id} x={0} y={0} />
        </g>
        {/* orbit control */}
        <path d="M96 404 A140 36 0 0 0 336 404" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 6" />
        <path d="M330 398 l8 6 l-9 4" fill="none" stroke={C.fg2} strokeWidth="1.5" />
        <text x="32" y="112" fill={C.fg3} fontFamily="monospace" fontSize="11" letterSpacing="2">
          360° · DRAG TO ROTATE
        </text>
        {/* options panel */}
        <g transform="translate(432 84)">
          <rect width="192" height="360" rx="12" fill="rgba(255,255,255,0.03)" stroke={C.line} />
          <rect x="16" y="20" width="90" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
          <text x="16" y="62" fill={C.fg3} fontFamily="monospace" fontSize="10" letterSpacing="2">
            FINISH
          </text>
          {["#2A2E3A", "#D9DCE5", "#5B3FA8", "#0F4E78"].map((c, i) => (
            <g key={c} transform={`translate(${30 + i * 40} 88)`}>
              <circle r="14" fill={c} stroke={i === 2 ? C.fg : "rgba(255,255,255,0.15)"} strokeWidth={i === 2 ? 2 : 1} />
            </g>
          ))}
          <text x="16" y="140" fill={C.fg3} fontFamily="monospace" fontSize="10" letterSpacing="2">
            LENS
          </text>
          {[0, 1].map((i) => (
            <rect key={i} x={16 + i * 84} y="154" width="76" height="34" rx="9" fill={i === 0 ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)"} stroke={i === 0 ? "rgba(168,85,247,0.6)" : C.line} />
          ))}
          <Bars x={16} y={214} widths={[150, 124, 140]} gap={16} />
          <rect x="16" y="300" width="160" height="40" rx="20" fill={`url(#${id("brand")})`} />
        </g>
      </Window>
    </g>
  );
}

function WebLayers({ id }: { id: IdFn }) {
  const layer = (dy: number, opacity: number, accent: string, children: ReactNode, key: string) => (
    <g key={key} transform={`translate(0 ${dy})`} opacity={opacity}>
      <path d="M400 120 L660 240 L400 360 L140 240Z" fill="#161925" stroke={accent} strokeWidth="1.5" />
      {children}
    </g>
  );
  return (
    <g>
      <ellipse cx="400" cy="470" rx="260" ry="40" fill="#000" opacity="0.4" />
      {layer(150, 0.65, "rgba(255,255,255,0.12)", <path d="M260 250 L400 315 L540 250" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" strokeLinecap="round" />, "base")}
      {layer(
        75,
        0.85,
        "rgba(24,155,232,0.5)",
        <g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${250 + i * 70} ${236 + i * 32} l56 26 l-40 19 l-56 -26z`} fill="rgba(24,155,232,0.16)" stroke="rgba(24,155,232,0.5)" />
          ))}
        </g>,
        "cards",
      )}
      {layer(
        0,
        1,
        "rgba(168,85,247,0.7)",
        <g>
          <path d="M300 196 L470 275 L440 289 L270 210Z" fill="rgba(255,255,255,0.28)" />
          <path d="M290 222 L420 282 L400 291 L270 231Z" fill="rgba(255,255,255,0.12)" />
          <path d="M455 246 L520 276 L490 290 L425 260Z" fill={`url(#${id("brand")})`} />
        </g>,
        "hero",
      )}
      {[
        { y: 240, t: "UI / 03" },
        { y: 315, t: "CARDS / 02" },
        { y: 390, t: "BASE / 01" },
      ].map((l) => (
        <g key={l.t}>
          <line x1="660" y1={l.y} x2="700" y2={l.y} stroke="rgba(255,255,255,0.2)" />
          <text x="708" y={l.y + 4} fill={C.fg3} fontFamily="monospace" fontSize="11" letterSpacing="2">
            {l.t}
          </text>
        </g>
      ))}
    </g>
  );
}

function Timeline({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="118" rx="12" fill="rgba(255,255,255,0.025)" stroke={C.line} />
      {["V2", "V1", "A1"].map((t, i) => (
        <text key={t} x="12" y={30 + i * 32} fill={C.fg3} fontFamily="monospace" fontSize="10" letterSpacing="1.5">
          {t}
        </text>
      ))}
      {/* V2 graphics */}
      <rect x="120" y="16" width="90" height="20" rx="5" fill="rgba(24,155,232,0.35)" />
      <rect x="330" y="16" width="70" height="20" rx="5" fill="rgba(24,155,232,0.35)" />
      {/* V1 clips */}
      {[
        [40, 110],
        [154, 140],
        [298, 96],
        [398, w - 410],
      ].map(([cx, cw], i) => (
        <rect key={i} x={cx} y="48" width={cw} height="22" rx="5" fill={i % 2 ? "rgba(168,85,247,0.4)" : "rgba(135,85,232,0.25)"} stroke="rgba(168,85,247,0.5)" />
      ))}
      {/* A1 waveform */}
      {Array.from({ length: Math.floor((w - 50) / 6) }).map((_, i) => {
        // Rounded so server and client render identical attribute strings (no hydration mismatch)
        const h = Math.round((4 + Math.abs(Math.sin(i * 0.7) * 10 + Math.sin(i * 0.23) * 6)) * 10) / 10;
        return <rect key={i} x={40 + i * 6} y={Math.round((92 - h / 2) * 10) / 10} width="3" height={h} rx="1.5" fill="rgba(175,179,193,0.45)" />;
      })}
      {/* playhead */}
      <line x1={w * 0.58} y1="6" x2={w * 0.58} y2="112" stroke={C.fg} strokeWidth="1.5" />
      <path d={`M${w * 0.58 - 6} 4 h12 l-6 8z`} fill={C.fg} />
    </g>
  );
}

function EditInterview({ id }: { id: IdFn }) {
  return (
    <g>
      <g transform="translate(110 60)">
        <rect width="580" height="326" rx="14" fill="#0B0C11" stroke={C.line2} />
        {/* soft key light */}
        <rect width="580" height="326" rx="14" fill={`url(#${id("glow-tl")})`} />
        {/* abstract subject */}
        <ellipse cx="330" cy="140" rx="46" ry="54" fill="#2A2D39" />
        <path d="M222 326 C230 238 280 212 330 212 C380 212 430 238 440 326Z" fill="#232633" />
        <path d="M290 110 C300 92 330 84 352 96" stroke="rgba(255,255,255,0.18)" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* thirds guides */}
        {[193, 387].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="326" stroke="rgba(255,255,255,0.05)" />
        ))}
        {[109, 217].map((y) => (
          <line key={y} x1="0" y1={y} x2="580" y2={y} stroke="rgba(255,255,255,0.05)" />
        ))}
        {/* lower third */}
        <rect x="28" y="244" width="4" height="46" fill={C.bright} />
        <rect x="42" y="248" width="150" height="14" rx="3" fill="rgba(255,255,255,0.85)" />
        <rect x="42" y="272" width="104" height="10" rx="3" fill="rgba(255,255,255,0.35)" />
        {/* caption */}
        <rect x="190" y="296" width="200" height="16" rx="4" fill="rgba(0,0,0,0.55)" />
        <rect x="200" y="301" width="180" height="6" rx="3" fill="rgba(255,255,255,0.8)" />
        <text x="18" y="28" fill={C.fg2} fontFamily="monospace" fontSize="11" letterSpacing="2">
          ● REC  00:14:32:08
        </text>
      </g>
      <Timeline x={110} y={414} w={580} />
    </g>
  );
}

function EditVertical({ id }: { id: IdFn }) {
  const phones = [
    { x: 160, r: -8, accent: C.blue },
    { x: 400, r: 0, accent: C.bright },
    { x: 640, r: 8, accent: C.violet },
  ];
  return (
    <g>
      {phones.map((p, i) => (
        <g key={i} transform={`translate(${p.x} 300) rotate(${p.r})`}>
          <rect x="-92" y="-196" width="184" height="372" rx="26" fill="#0B0C11" stroke={i === 1 ? "rgba(255,255,255,0.3)" : C.line2} strokeWidth={i === 1 ? 2 : 1} />
          <rect x="-82" y="-186" width="164" height="352" rx="18" fill={i === 1 ? "#171A25" : "#12141C"} />
          {/* progress segments */}
          {[0, 1, 2].map((s) => (
            <rect key={s} x={-72 + s * 50} y="-176" width="44" height="3" rx="1.5" fill={s <= i ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)"} />
          ))}
          {/* subject block */}
          <ellipse cx="0" cy="-40" rx="34" ry="40" fill="#2A2D39" />
          <path d="M-74 120 C-64 30 -30 10 0 10 C30 10 64 30 74 120Z" fill="#232633" />
          {/* hook caption */}
          <rect x="-66" y="-120" width="132" height="22" rx="6" fill={p.accent} opacity="0.92" />
          <rect x="-54" y="-112" width="108" height="6" rx="3" fill="rgba(255,255,255,0.9)" />
          <rect x="-60" y="68" width="120" height="10" rx="5" fill="rgba(255,255,255,0.85)" />
          <rect x="-44" y="86" width="88" height="10" rx="5" fill="rgba(255,255,255,0.5)" />
          {/* rail */}
          {[0, 1, 2].map((s) => (
            <circle key={s} cx="64" cy={-10 + s * 34} r="9" fill="rgba(255,255,255,0.12)" />
          ))}
        </g>
      ))}
      <text x="400" y="560" textAnchor="middle" fill={C.fg3} fontFamily="monospace" fontSize="12" letterSpacing="3">
        9:16 · HOOK / BODY / CTA
      </text>
      <line x1="230" y1="545" x2="570" y2="545" stroke={`url(#${id("brand")})`} strokeOpacity="0.4" />
    </g>
  );
}
