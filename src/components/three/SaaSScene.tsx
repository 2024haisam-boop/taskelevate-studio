import type { CSSProperties } from "react";
import s from "./engine.module.css";

const z = (depth: number, i = 0) => ({ "--z": depth, "--i": i }) as CSSProperties;

/**
 * MODE 1 — layered SaaS application. Pure DOM + CSS 3D: every panel sits at its own
 * depth (translateZ) and lifts off the base when the mode is selected; pointer
 * parallax rotates the stage (vars written by CreativeEngine).
 */
export function SaaSScene() {
  return (
    <div className={s.scene}>
      <div className={`${s.stage} ${s.saasStage}`}>
        {/* Base application window */}
        <div className={`${s.layer} ${s.panel} ${s.saasWindow}`} style={z(0)}>
          <div className={s.winBar}>
            <i />
            <i />
            <i />
            <span className={s.url} />
          </div>
          <div className={s.winBody}>
            <aside className={s.side}>
              <span className={s.logoChip} />
              {["Overview", "Analytics", "Customers", "Billing", "Settings"].map((label, i) => (
                <span key={label} className={s.navItem} data-on={i === 1}>
                  <span className={s.navDot} />
                  <span className={s.mono} style={{ color: i === 1 ? "var(--color-fg)" : undefined }}>
                    {label}
                  </span>
                </span>
              ))}
            </aside>
            <div className={s.main}>
              <div className={s.kpis}>
                {[
                  { k: "Active users", v: "12,480", d: "▲ 8.2%" },
                  { k: "Conversion", v: "4.6%", d: "▲ 0.9%" },
                  { k: "Avg. session", v: "6m 12s", d: "▲ 12s" },
                ].map((kpi) => (
                  <div key={kpi.k} className={s.kpi}>
                    <span className={s.mono}>{kpi.k}</span>
                    <span className={s.value}>{kpi.v}</span>
                    <span className={s.delta}>{kpi.d}</span>
                  </div>
                ))}
              </div>
              <div className={s.chart}>
                <svg className={s.chartSvg} viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="eng-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#A855F7" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#A855F7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[40, 80, 120].map((y) => (
                    <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" vectorEffect="non-scaling-stroke" />
                  ))}
                  <path
                    className={s.chartArea}
                    d="M0 132 C40 126 58 100 96 102 S150 72 190 80 S260 40 300 46 S370 22 400 18 L400 160 L0 160Z"
                    fill="url(#eng-area)"
                  />
                  <path
                    d="M0 132 C40 126 58 100 96 102 S150 72 190 80 S260 40 300 46 S370 22 400 18"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
              <div className={s.rows}>
                {[62, 48, 55].map((w, i) => (
                  <div key={i} className={s.row}>
                    <span className={s.avatar} />
                    <span className={s.bar} style={{ width: `${w}%` }} />
                    <span className={s.status} />
                    <span className={s.bar} style={{ width: "70%" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating, depth-separated panels */}
        <div className={`${s.layer} ${s.panel} ${s.progressCard}`} style={z(70, 1)}>
          <span className={s.mono}>Onboarding</span>
          <span className={s.value}>78%</span>
          <span className={s.progressTrack}>
            <span className={s.progressFill} />
          </span>
        </div>

        <div className={`${s.layer} ${s.panel} ${s.revenueCard}`} style={z(110, 2)}>
          <span className={s.mono}>Monthly revenue</span>
          <span className={s.value}>$48.2k</span>
          <svg className={s.spark} viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M0 24 L18 20 L32 22 L48 14 L64 16 L82 8 L100 10 L120 3"
              fill="none"
              stroke="#189BE8"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className={`${s.layer} ${s.panel} ${s.toast}`} style={z(150, 3)}>
          <span className={s.toastIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span style={{ display: "grid", gap: "0.45cqw", flex: 1 }}>
            <span className={s.value} style={{ fontSize: "max(10px, 1.05cqw)" }}>
              Workspace ready
            </span>
            <span className={s.bar} style={{ width: "80%" }} />
          </span>
        </div>

        <div className={`${s.layer} ${s.marker} ${s.m1}`} style={z(130, 4)}>
          <span className={s.markerDot} />
          <span className={`${s.mono} ${s.markerLabel}`}>Live analytics</span>
        </div>
        <div className={`${s.layer} ${s.marker} ${s.m2}`} style={z(130, 5)}>
          <span className={s.markerDot} />
          <span className={`${s.mono} ${s.markerLabel}`}>Smart onboarding</span>
        </div>

        <div className={`${s.layer} ${s.cursor}`} style={z(190, 6)}>
          <div className={s.cursorInner}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 2.5v17.2l4.7-4.4 3.1 6.9 3.2-1.4-3.1-6.8h6.5z" fill="#F8F9FD" stroke="#08090D" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
