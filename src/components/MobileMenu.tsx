"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Phone, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { buildWhatsAppHref, type PublicSiteSettings } from "@/lib/business-settings-constants";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  settings: PublicSiteSettings;
};

export function MobileMenu({ open, onClose, settings }: MobileMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu mobile"
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex flex-col bg-night pt-[env(safe-area-inset-top)] transition-transform duration-300 ease-out lg:hidden ${
        open ? "translate-x-0" : "pointer-events-none translate-x-full"
      }`}
    >
      {/* Top bar — matches the site header height */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 sm:px-5">
        <Logo compact />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-cream transition-colors duration-200 hover:border-line-gold hover:text-gold"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Scrollable nav — compact rows sized for phones; centered when space allows,
          cleanly scrollable on short screens */}
      <nav
        aria-label="Navigation mobile"
        className="flex min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="my-auto w-full px-6 py-4">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${index * 45}ms` : "0ms" }}
              className={`flex min-h-12 items-center gap-4 border-b border-line text-lg font-semibold text-cream transition-all duration-300 hover:text-gold ${
                open ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
              }`}
            >
              <span className="text-[11px] font-semibold tracking-[0.22em] text-gold">
                0{index + 1}
              </span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Compact action block — side-by-side CTUs fit 320px widths */}
      <div className="shrink-0 border-t border-line px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={buildWhatsAppHref(settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-whatsapp/50 px-4 py-2.5 text-[14px] font-semibold text-cream transition-colors duration-200 hover:border-whatsapp"
          >
            <WhatsAppIcon className="h-[18px] w-[18px] text-whatsapp" />
            WhatsApp
          </a>
          <a
            href={settings.telHref}
            tabIndex={open ? 0 : -1}
            aria-label={`Appeler MDA CAR au ${settings.phoneDisplay}`}
            className="btn-sweep inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-[14px] font-semibold text-night transition-colors duration-200 hover:bg-gold-hover"
          >
            <Phone className="h-[18px] w-[18px]" aria-hidden />
            Appeler
          </a>
        </div>
        <SocialLinks
          instagramUrl={settings.instagramUrl}
          facebookUrl={settings.facebookUrl}
          className="mt-4 justify-center"
        />
      </div>
    </div>
  );
}
