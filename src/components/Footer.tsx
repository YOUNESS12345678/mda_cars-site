import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { navLinks, site } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { buildWhatsAppHref, getTodayOpeningHours } from "@/lib/business-settings-constants";
import { containerClass } from "@/lib/ui";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { getMediaSrc } from "@/lib/site-media";

/** PHASE 7: now an async Server Component reading the database-backed
 *  business settings directly (cached via getSiteSettings()) instead of
 *  the static lib/site.ts constant. Rendered from the root layout (a
 *  Server Component), so it keeps its server-only capabilities even
 *  though it's placed inside the client SiteChrome tree — see
 *  layout.tsx / SiteChrome.tsx. */
export async function Footer() {
  const [settings, logoSrc] = await Promise.all([getSiteSettings(), getMediaSrc("logo", "/images/mda-car-logo.webp")]);
  const todayHours = getTodayOpeningHours(settings.openingHours);
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-obsidian">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
      <div className={`${containerClass} grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-12`}>
        <div className="space-y-5">
          <Logo src={logoSrc} />
          <p className="max-w-sm text-[15px] leading-relaxed text-steel">
            Location de voitures au service d’Agadir, de l’aéroport Agadir Al
            Massira et de toute la région de Souss-Massa, avec livraison de
            véhicule possible partout au Maroc.
          </p>
          <SocialLinks instagramUrl={settings.instagramUrl} facebookUrl={settings.facebookUrl} />
        </div>

        <nav aria-label="Navigation de pied de page">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-gold">
            Navigation
          </h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[15px] text-cream transition-colors duration-200 hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}

          </ul>
        </nav>

        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-gold">
            Contact
          </h2>
          <ul className="mt-5 space-y-4 text-[15px]">
            <li>
              <a
                href={settings.telHref}
                className="group inline-flex items-center gap-3 text-cream transition-colors duration-200 hover:text-gold"
              >
                <Phone className="h-4 w-4 text-gold" aria-hidden />
                {settings.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={buildWhatsAppHref(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-cream transition-colors duration-200 hover:text-gold"
              >
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                WhatsApp : {settings.phoneDisplay}
              </a>
            </li>
            <li className="flex items-start gap-3 text-steel">
              <MapPin
                className="mt-1 h-4 w-4 shrink-0 text-gold"
                aria-hidden
              />
              <a
                href={site.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-gold"
              >
                {settings.city || site.baseCity} · {site.region} · {site.country}
              </a>
            </li>
            <li className="flex items-start gap-3 text-steel">
              <Clock className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span className="text-[15px] font-semibold text-cream">
                {todayHours ? `${todayHours.day} : ${todayHours.hours}` : site.hoursLabel}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div
          className={`${containerClass} flex flex-col items-center justify-between gap-2 py-6 text-center text-[13px] text-steel-dark sm:flex-row sm:text-left`}
        >
          <p>
            © {year} {settings.businessName} — Location de voitures à Agadir,
            livraison partout au Maroc.
          </p>
          <a
            href={buildWhatsAppHref(settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-gold"
          >
            Contacter MDA CAR sur WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
