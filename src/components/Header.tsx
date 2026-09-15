"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { navLinks } from "@/lib/site";
import { buildWhatsAppHref, type PublicSiteSettings } from "@/lib/business-settings-constants";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** PHASE 7: `settings` is resolved server-side (from the database-backed
 *  business settings, see lib/business-settings.ts) by the root layout and
 *  passed down here as plain props — navLinks stay a static import since
 *  they aren't admin-managed content. */
export function Header({ settings }: { settings: PublicSiteSettings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pre-existing behavior (unrelated to Phase 7): close the mobile menu on
  // route change. Rewritten from a `useEffect` to the React-recommended
  // "adjust state during render" pattern — setState directly inside an
  // effect body causes an extra cascading render and is flagged by the
  // project's own `npm run lint` (react-hooks/set-state-in-effect); this
  // was the only lint failure in the whole repo, so fixing it here was the
  // sole change needed for `npm run lint` to pass as required.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-all duration-300 ${
          scrolled || menuOpen
            ? "border-b border-line bg-night/80 shadow-[0_1px_0_0_rgba(212,175,55,0.08)] backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-night/50 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-5 md:h-16 md:px-8 lg:px-16 xl:px-20 min-[1440px]:max-w-[1400px]">
          <Logo />

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-7 lg:flex"
          >
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative py-1 text-[14px] font-medium tracking-[0.02em] transition-colors duration-200 ${
                    active ? "text-gold" : "text-cream hover:text-gold"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300 ease-out ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Kept visible in the collapsed mobile header per spec */}
            <a
              href={buildWhatsAppHref(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacter MDA CAR sur WhatsApp"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-whatsapp transition-colors duration-200 hover:border-whatsapp/60 lg:hidden"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <Link
              href="/#reservation"
              className="btn-sweep hidden min-h-11 items-center justify-center rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold tracking-[0.01em] text-night transition-colors duration-200 hover:bg-gold-hover sm:inline-flex"
            >
              Réserver
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-cream transition-colors duration-200 hover:border-line-gold hover:text-gold lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} settings={settings} />
    </>
  );
}
