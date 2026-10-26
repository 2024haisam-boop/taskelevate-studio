import logoDark from "../../../public/brand/taskelevate-logo-dark.png";

const SLICES = 12;
const LOGO_H = 42; // must match the header logo height (Navbar)
const LOGO_W = Math.round(LOGO_H * (logoDark.width / logoDark.height));

/**
 * Landing intro (the reference site's sequence, our artwork):
 *  1. white screen, the logo sits at the vertical middle on the left and assembles slice by slice;
 *     a black dot slides in on the right
 *  2. both glide up to their places in the header while the white curtain retracts upward
 *  3. the dot hands over to the menu button and the navigation expands out of it (≥lg), then the hero animates in.
 * Pure CSS timeline (starts at first paint, no hydration wait). The head script adds `html.intro` on a hard load of
 * "/" (not for reduced motion) and releases `html.preloading` (scroll lock + held hero) when the curtain is up.
 * The logo is the supplied artwork, only masked into slices — never redrawn.
 */
export function Preloader() {
  // Lives in the root layout (never remounts), so client-side navigation back home never replays it.
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-bg" />
      <div className="preloader-row shell flex items-center justify-between pt-[calc(env(safe-area-inset-top,0px)+10px)] md:pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <span className="relative flex items-center" style={{ height: LOGO_H }}>
          <span className="preloader-logo relative block" style={{ width: LOGO_W, height: LOGO_H }}>
            {Array.from({ length: SLICES }, (_, i) => (
              <span
                key={i}
                className="preloader-slice"
                style={{
                  left: `${(i / SLICES) * 100}%`,
                  width: `${100 / SLICES + 0.4}%`,
                  ["--i" as string]: i,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- same artwork as the header, masked per slice */}
                <img src={logoDark.src} alt="" width={LOGO_W} height={LOGO_H} style={{ width: LOGO_W, height: LOGO_H, left: `${-(i / SLICES) * LOGO_W}px` }} />
              </span>
            ))}
          </span>
          {/* same "STUDIOS" label as the header lockup (BrandLogo inline) */}
          <span
            className="preloader-label ml-3 box-border flex items-center gap-3 max-sm:hidden"
            style={{ height: LOGO_H, paddingTop: LOGO_H * 0.42, paddingBottom: LOGO_H * 0.16 }}
          >
            <span className="h-full w-px bg-black/20" />
            <span className="font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.3em] text-fg-2">Studios</span>
          </span>
        </span>
        <span className="p-1">
          <span className="preloader-dot">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="block size-[5px] rounded-full bg-white" />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
