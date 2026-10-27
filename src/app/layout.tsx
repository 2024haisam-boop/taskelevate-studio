import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { siteConfig } from "@/data/site-config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/landing/Preloader";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { StudioCanvas } from "@/components/studio/StudioCanvas";
import { ScrubReveal } from "@/components/ui/ScrubReveal";
import { GlassPointerTracker } from "@/components/glass/GlassPointerTracker";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import "./globals.css";

// Display face: a condensed editorial serif (roman + italic) for headlines and statements.
const displaySerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display-serif",
  display: "swap",
});

// Text face: a refined grotesk for body copy, lists and buttons.
const textSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-text-sans",
  display: "swap",
});

// Technical labels (pills, captions, counters) — above the fold in the hero, so preloaded too.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const homeTitle = "Taskelevate Studios | SaaS Animation, 3D & Creative Technology";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: homeTitle, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.parentBrand.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: homeTitle,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
  colorScheme: "light",
};

/** Organization structured data — verified details only (no invented address/phone/ratings). */
function organizationJsonLd() {
  const sameAs = [siteConfig.social.instagram, siteConfig.social.linkedin].filter(Boolean);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/taskelevate-icon.png`,
    description: siteConfig.description,
    slogan: "Crafting the unexpected.",
    parentOrganization: {
      "@type": "Organization",
      name: siteConfig.parentBrand.name,
      url: siteConfig.parentBrand.url,
    },
  };
  if (sameAs.length) data.sameAs = sameAs;
  if (siteConfig.contactEmail) data.email = siteConfig.contactEmail;
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displaySerif.variable} ${textSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint: enables JS-only animation states (content stays visible without JS) and, on a hard
            load of the home page, starts the landing intro — `preloading` (scroll lock, hero held) is released when
            the curtain is up. Reduced motion never gets the intro. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&scrollY<10){d.classList.add('intro','preloading');setTimeout(function(){d.classList.remove('preloading')},2250)}}catch(e){}})()",
          }}
        />
      </head>
      <body className="font-sans text-fg antialiased">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-full bg-fg px-5 py-3 text-sm font-semibold text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {/* Landing intro — rendered for every route but only shown with html.intro (hard load of "/") */}
        <Preloader />
        <Navbar />
        {/* The page sits on a sheet with rounded bottom corners that lifts off the footer waiting underneath. */}
        <main id="main-content" tabIndex={-1} className="site-sheet outline-none">
          {/* the living layer under every page: liquid ink + the studio figure (anchored by [data-figure]) */}
          <StudioCanvas />
          {children}
          <div aria-hidden="true" data-sheet-end="" />
        </main>
        <Footer />
        {/* Before first paint: anything already in the viewport is shown immediately (no fade) and never waits
            for hydration — protects LCP. Re-checked when web fonts finish loading, since the swap can shift
            layout. Only content further down the page animates in on scroll. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){function r(){var h=window.innerHeight,s=[];document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach(function(e){if(e.getBoundingClientRect().top<h)s.push(e)});s.forEach(function(e){e.setAttribute('data-instant','');e.setAttribute('data-revealed','')});document.querySelectorAll('[data-scrub]').forEach(function(e){var p=Math.min(1,Math.max(0,(h-e.getBoundingClientRect().top)/(h*0.8)));e.style.setProperty('--rv',(p*p*(3-2*p)).toFixed(3))})}r();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(r)})()",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd() }} />
        <RevealObserver />
        <ScrubReveal />
        <GlassPointerTracker />
        <CustomCursor />
        <AttributionCapture />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
