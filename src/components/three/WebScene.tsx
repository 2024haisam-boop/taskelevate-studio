import type { CSSProperties } from "react";
import s from "./engine.module.css";

const v = (depth: number, i = 0, extra: CSSProperties = {}) => ({ "--z": depth, "--i": i, ...extra }) as CSSProperties;

/**
 * MODE 3 — spatial website. Interface elements occupy different depths, slide in and
 * settle with spring easing when selected. Cards tilt individually with the pointer and
 * the stack spreads as the pointer moves away from centre (--spread).
 */
export function WebScene() {
  return (
    <div className={s.scene}>
      <div className={`${s.stage} ${s.webStage}`}>
        <div className={`${s.layer} ${s.webBase}`} style={v(0)} />

        <div className={`${s.layer} ${s.slideL} ${s.panel} ${s.webNav}`} style={v(40, 1)}>
          <span className={s.logoChip} style={{ margin: 0, width: "2cqw", height: "2cqw" }} />
          <span className={s.navPills}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={s.bar} style={{ width: "3.5cqw" }} />
            ))}
          </span>
          <span className={s.bar} style={{ width: "6cqw", height: "1.6cqw", background: "rgb(255 255 255 / 0.85)" }} />
        </div>

        <div className={`${s.layer} ${s.slideR} ${s.panel} ${s.webHero}`} style={v(90, 2)}>
          <span className={s.mono} style={{ color: "var(--color-violet-bright)" }}>
            New release
          </span>
          <span className={s.webHeroTitle} />
          <span className={s.webHeroTitle} style={{ width: "48%" }} />
          <span className={s.bar} style={{ width: "62%" }} />
        </div>

        <div className={`${s.layer} ${s.slideL} ${s.webCta}`} style={v(150, 3)} />

        <div className={`${s.layer} ${s.slideR} ${s.webCards}`} style={v(120, 4)}>
          {[1, 1.6, 2.2].map((k, i) => (
            <div key={i} className={`${s.panel} ${s.webCard}`} style={{ "--k": k } as CSSProperties}>
              <span className={s.webCardMedia} />
              <span className={s.bar} style={{ width: "70%", background: "rgb(255 255 255 / 0.5)" }} />
              <span className={s.bar} style={{ width: "45%" }} />
            </div>
          ))}
        </div>

        <div className={`${s.layer} ${s.slideL} ${s.panel} ${s.webFooterBar}`} style={v(60, 5)}>
          <span className={s.bar} style={{ width: "20%" }} />
          <span className={s.bar} style={{ width: "14%" }} />
          <span className={s.bar} style={{ width: "18%" }} />
        </div>

        {/* depth annotations */}
        <span className={`${s.layer} ${s.mono} ${s.webLabel}`} style={v(150, 6, { left: "79%", top: "13%" })}>
          z 150 · cta
        </span>
        <span className={`${s.layer} ${s.mono} ${s.webLabel}`} style={v(120, 6, { left: "79%", top: "60%" })}>
          z 120 · cards
        </span>
        <span className={`${s.layer} ${s.mono} ${s.webLabel}`} style={v(0, 6, { left: "79%", top: "86%" })}>
          z 000 · base
        </span>
      </div>
    </div>
  );
}
