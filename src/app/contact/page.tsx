import type { Metadata } from "next";
import { Clock, MapPin, MapPinned, MessageCircle, Phone } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { site, DEFAULT_WA_MESSAGE } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { buildWhatsAppHref, getTodayOpeningHours } from "@/lib/business-settings-constants";
import { containerClass, sectionClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const metadata: Metadata = buildMetadata({
  title: "Contact MDA CAR | Location de voitures à Biougra",
  description:
    "Contactez MDA CAR à Biougra par téléphone ou WhatsApp : 06 50 91 11 22. L’agence est aussi sur Instagram et Facebook. Contact direct et simple.",
  path: "/contact",
  ogTitle: "Contacter MDA CAR",
});

/** PHASE 7: now an async Server Component reading the database-backed
 *  business settings (phone, WhatsApp, address, opening hours, social
 *  links) instead of the static lib/site.ts constant. */
export default async function ContactPage() {
  const settings = await getSiteSettings();
  const todayHours = getTodayOpeningHours(settings.openingHours);
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contacter MDA CAR"
        description="Une question, une demande de disponibilité ou de tarif ? Choisissez le canal qui vous arrange — l’agence vous répond directement."
        image={{
          src: "/images/mda-car-contact-navigation-bg.webp",
          mobileSrc: "/images/mda-car-contact-navigation-mobile.webp",
          alt: "Illustration de navigation et de localisation pour MDA CAR, avec une voiture sur une carte et des repères de localisation",
        }}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Contact", href: "/contact" },
            ]}
          />
        }
      />

      <section aria-label="Coordonnées et formulaire">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <Reveal className="space-y-4">
              <a
                href={settings.telHref}
                className="group flex items-center gap-4 rounded-lg border border-line bg-coal p-5 transition-colors duration-200 hover:border-line-gold"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line-gold bg-surface text-gold">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[13px] font-medium uppercase tracking-[0.14em] text-steel">
                    Téléphone
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-white transition-colors duration-200 group-hover:text-gold">
                    {settings.phoneDisplay}
                  </span>
                </span>
              </a>

              <a
                href={buildWhatsAppHref(settings.whatsappNumber, DEFAULT_WA_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-lg border border-line bg-coal p-5 transition-colors duration-200 hover:border-whatsapp/60"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-whatsapp/40 bg-surface text-whatsapp">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[13px] font-medium uppercase tracking-[0.14em] text-steel">
                    WhatsApp
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-white transition-colors duration-200 group-hover:text-gold">
                    Écrire à MDA CAR
                  </span>
                </span>
              </a>

              <div className="flex items-center gap-4 rounded-lg border border-line bg-coal p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line-gold bg-surface text-gold">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium uppercase tracking-[0.14em] text-steel">
                    Réseaux sociaux
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-white">
                    Instagram &amp; Facebook
                  </span>
                </span>
                <SocialLinks
                  instagramUrl={settings.instagramUrl}
                  facebookUrl={settings.facebookUrl}
                />
              </div>

              <a
                href={site.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-lg border border-line bg-coal p-5 transition-colors duration-200 hover:border-line-gold"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line-gold bg-surface text-gold">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[13px] font-medium uppercase tracking-[0.14em] text-steel">
                    Adresse
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-white transition-colors duration-200 group-hover:text-gold">
                    {settings.address || `${settings.city}, Souss-Massa, Maroc`}
                  </span>
                  <span className="mt-1 block text-[13px] text-steel-dark">
                    Voir sur Google Maps
                  </span>
                </span>
              </a>

              <div className="flex items-start gap-4 rounded-lg border border-line bg-coal p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line-gold bg-surface text-gold">
                  <Clock className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-medium uppercase tracking-[0.14em] text-steel">
                    Horaires d’ouverture
                  </span>
                  {todayHours && (
                    <span className="mt-1 block text-[15px] font-semibold text-white">
                      Aujourd’hui ({todayHours.day}) : {todayHours.hours}
                    </span>
                  )}
                  <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-steel-dark sm:grid-cols-1">
                    {settings.openingHours.map((item) => (
                      <li key={item.day} className="flex justify-between gap-3 sm:justify-start">
                        <span className="text-steel">{item.day}</span>
                        <span className="text-white">{item.hours}</span>
                      </li>
                    ))}
                  </ul>
                </span>
              </div>
            </Reveal>

            <Reveal delay={120} className="flex flex-col gap-6">
              <div className="rounded-lg border border-line bg-coal p-5 sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Écrire à l’agence
                </h2>
                <p className="mb-6 mt-2 text-[14px] leading-relaxed text-steel">
                  Ce formulaire prépare un message WhatsApp avec vos
                  informations — l’agence vous recontacte ensuite directement.
                </p>
                <ContactForm whatsappNumber={settings.whatsappNumber} />
              </div>
            </Reveal>
          </div>

          <div className="mt-12 overflow-hidden rounded-lg border border-line bg-coal">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <MapPinned className="h-5 w-5 text-gold" aria-hidden />
              <p className="text-[15px] font-semibold text-white">
                MDA CAR sur Google Maps — Biougra, Souss-Massa
              </p>
            </div>
            <iframe
              title="Localisation MDA CAR sur Google Maps"
              src="https://maps.google.com/maps?cid=15736903763679957559&output=embed"
              className="aspect-[16/6] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="border-t border-line px-5 py-4">
              <a
                href={site.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-semibold text-gold transition-colors duration-200 hover:text-gold-light"
              >
                Ouvrir l’itinéraire dans Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
