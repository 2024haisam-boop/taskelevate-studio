import Image from "next/image";
import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";
import { FooterReveal } from "./FooterReveal";
import logoDark from "../../../public/brand/taskelevate-logo-dark.png";

const linkClass = "group inline-flex min-h-8 max-w-full flex-wrap items-baseline gap-x-2 font-mono text-[0.8125rem] uppercase tracking-[0.01em] text-fg transition-colors hover:text-violet-bright";

/**
 * Closing footer on lilac paper: a pill, the big serif sign-off and the CTA on the left; a line, then numbered mono
 * link columns on the right; logo and the legal line below. It waits under the page and the page sheet lifts off
 * it as you reach the end, on every screen size (`.site-sheet` / `.footer-reveal` in globals.css, FooterReveal).
 * Only configured channels are linked.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className="footer-reveal bg-[#ece5fc] text-fg">
      <FooterReveal />
      <div className="shell flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-[clamp(64px,7vw,112px)]">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="tag-pill">Get in touch</p>
            <p className="mt-6 font-display text-[clamp(3rem,1.4rem+5.6vw,7rem)] uppercase leading-[0.9]">
              <span className="normal-case italic">Let&rsquo;s</span> explore
              <br />
              <span aria-hidden="true" className="mr-[0.3em] align-[0.25em] font-sans text-[0.4em] normal-case">
                ↳
              </span>
              what&rsquo;s next
            </p>
            <Link href="/contact" className="btn btn-primary mt-9">
              Start a project <span aria-hidden="true" className="btn-arrow">↳</span>
            </Link>
            {siteConfig.contactEmail && (
              <a href={`mailto:${siteConfig.contactEmail}`} className="mt-5 block w-fit font-mono text-sm uppercase text-fg-2 underline-offset-4 hover:text-fg hover:underline">
                {siteConfig.contactEmail}
              </a>
            )}
          </div>

          <div className="lg:col-span-6">
            <p className="max-w-[46ch] font-mono text-[0.8125rem] uppercase leading-[1.45] text-fg-2">
              Tell us what you&rsquo;re launching — we&rsquo;ll help you make it the one people remember.
            </p>
            <nav aria-label="Footer" className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {footerNav.map((column) => (
                <div key={column.title}>
                  <h2 className="font-sans text-[0.95rem] text-fg-3">
                    {column.title} <span aria-hidden="true">↓</span>
                  </h2>
                  <ul className="mt-3 flex flex-col">
                    {column.links.map((link, i) => {
                      const num = <span className="text-[0.7rem] text-fg-3">({String(i + 1).padStart(2, "0")})</span>;
                      return (
                        <li key={link.label}>
                          {link.external ? (
                            <a href={link.href} {...(link.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })} className={linkClass}>
                              {num}
                              {link.label}
                              <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <Link href={link.href} className={linkClass}>
                              {num}
                              {link.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-[clamp(64px,9vw,140px)] flex flex-col gap-8 border-t border-line-strong pt-6 md:flex-row md:items-center md:justify-between">
          <Image src={logoDark} alt="Taskelevate" className="h-9 w-auto self-start select-none md:self-auto" draggable={false} sizes="160px" />
          <p className="font-mono text-[0.75rem] uppercase text-fg-2">
            ©Taskelevate Studios {year} — a{" "}
            <a href={siteConfig.parentBrand.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-fg">
              Taskelevate
            </a>{" "}
            company
          </p>
          <div className="flex gap-6 font-mono text-[0.75rem] uppercase text-fg-2">
            <Link href="/privacy" className="hover:text-fg">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-fg">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
