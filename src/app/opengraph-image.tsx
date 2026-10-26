import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Taskelevate Studios — Crafting the unexpected.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Original social preview built from the approved brand assets (real logo PNG, unmodified). */
export default async function OpengraphImage() {
  const [logo, bold, mono] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/taskelevate-logo-white.png")),
    readFile(join(process.cwd(), "src/assets/fonts/SpaceGrotesk-Bold.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/JetBrainsMono-Medium.woff")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#08090D",
          backgroundImage:
            "radial-gradient(ellipse 60% 55% at 50% 110%, rgba(135,85,232,0.32), transparent 70%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          color: "#F8F9FD",
          fontFamily: "Space Grotesk",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={logoSrc} width={194} height={56} alt="" />
            <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.25)", margin: "8px 18px 0" }} />
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 6, color: "#AFB3C1", marginTop: 8 }}>STUDIOS</div>
          </div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, letterSpacing: 4, color: "#777C8D" }}>STUDIO.TASKELEVATE.COM</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 100, fontWeight: 700, letterSpacing: -4, lineHeight: 0.95 }}>CRAFTING THE</div>
          <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: -7, lineHeight: 0.95, color: "#A855F7", transform: "skewX(-12deg)", marginLeft: 18 }}>
            UNEXPECTED.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontSize: 16, letterSpacing: 3, color: "#AFB3C1" }}>
          <div>SAAS ANIMATION · 3D · WEB · VIDEO</div>
          <div style={{ color: "#777C8D" }}>DESIGN / MOTION / TECHNOLOGY</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: bold, weight: 700, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
