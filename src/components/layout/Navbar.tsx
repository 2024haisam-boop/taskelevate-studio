"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { primaryNav } from "@/data/navigation";
import { BrandLogo } from "./BrandLogo";
import { MobileMenu } from "./MobileMenu";
import { ServicesDropdown } from "./ServicesDropdown";

/**
 * Editorial header — logo on the left, compact mono navigation on the right, a black pill CTA and a dot-grid
 * button that opens the full menu sheet (on every screen size). Fixed; once the page scrolls, the navigation
 * group sits on a soft paper surface so it stays readable over media.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close menus on route change (state derived during render — no effect needed)
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    raf = requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const linkClass =
    "nav-link inline-flex h-9 items-center rounded-md px-3 font-mono text-ed-mono uppercase text-fg transition-colors duration-200 hover:bg-black/[0.05] aria-[current=page]:underline aria-[current=page]:underline-offset-4";

  return (
    <>
      <header data-site-nav data-scrolled={scrolled} className="group/header pointer-events-none fixed inset-x-0 top-0 z-50">
        {/* phones: a white bar once the page moves, so the logo never sits on top of content */}
        <span
          aria-hidden="true"
          className="glass-clear absolute inset-x-0 top-0 h-full opacity-0 transition-opacity duration-300 group-data-[scrolled=true]/header:opacity-100 md:hidden"
        />
        <div className="shell relative flex items-center justify-between pb-2 pt-[calc(env(safe-area-inset-top,0px)+10px)] md:pb-0 md:pt-[calc(env(safe-area-inset-top,0px)+12px)]">
          <BrandLogo variant="inline" tone="dark" height={42} eager className="pointer-events-auto" labelClassName="max-sm:hidden" />

          <nav
            aria-label="Primary"
            data-scrolled={scrolled}
            className="nav-group pointer-events-auto flex items-center gap-1 rounded-[10px] p-1 transition-[background-color,box-shadow] duration-300"
          >
            <ul className="nav-links hidden items-center lg:flex">
              <li>
                <Link href={primaryNav.work.href} className={linkClass} aria-current={isActive(primaryNav.work.href) ? "page" : undefined}>
                  {primaryNav.work.label}
                </Link>
              </li>
              <ServicesDropdown open={servicesOpen} onOpenChange={setServicesOpen} active={pathname.startsWith("/services")} />
              <li>
                <Link href={primaryNav.studio.href} className={linkClass} aria-current={isActive(primaryNav.studio.href) ? "page" : undefined}>
                  {primaryNav.studio.label}
                </Link>
              </li>
            </ul>
            <Link href={primaryNav.cta.href} className="nav-cta btn btn-primary btn-sm ml-1 max-sm:hidden" aria-current={isActive(primaryNav.cta.href) ? "page" : undefined}>
              {primaryNav.cta.label}
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="menu-dots inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-black/[0.05]"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              data-open={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden="true" className="grid grid-cols-2 gap-[5px]">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="menu-dot block size-[5px] rounded-full bg-fg" />
                ))}
              </span>
            </button>
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} buttonRef={menuButtonRef} pathname={pathname} />
    </>
  );
}
