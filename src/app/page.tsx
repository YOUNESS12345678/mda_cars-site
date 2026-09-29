import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Car, Phone } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/business-settings";
import { getPublishedCars } from "@/lib/cars";
import { containerClass, sectionClass, btnBaseClass } from "@/lib/ui";
import { Hero } from "@/components/Hero";
import { BookingForm } from "@/components/BookingForm";
import { VehicleGrid } from "@/components/VehicleGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustSection } from "@/components/TrustSection";
import { HowItWorks } from "@/components/HowItWorks";
import { BookingCTA } from "@/components/BookingCTA";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PhoneButton } from "@/components/PhoneButton";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LuxuryBackdrop } from "@/components/LuxuryBackdrop";
import { ReviewsSection } from "@/components/ReviewsSection";
import { HOME_HEADLINE } from "@/lib/seo-keyword-constants";

export async function generateMetadata(): Promise<Metadata> {
  const headline = `${HOME_HEADLINE.primary} & ${HOME_HEADLINE.secondary}`;
  return buildMetadata({
    title: `${headline} | MDA CAR`,
    description: `MDA CAR : location de voiture depuis Agadir, aéroport Al Massira inclus, livraison possible ${HOME_HEADLINE.secondary}. Réservation en ligne, confirmation directe.`,
    path: "/",
    ogTitle: headline,
  });
}

const reassurances = [
  {
    icon: WhatsAppIcon,
    text: "Réponse directe de l’agence, par WhatsApp ou par appel.",
  },
  {
    icon: Car,
    text: "Véhicules propres et préparés avant chaque départ.",
  },
  {
    icon: BadgeCheck,
    text: "Disponibilités et tarifs confirmés avec vous, sans surprise.",
  },
];

/** PHASE 7: now an async Server Component reading the published fleet and
 *  business settings from the database instead of the static lib/vehicles
 *  sample and the static lib/site.ts constant. */
export default async function HomePage() {
  const [cars, settings] = await Promise.all([getPublishedCars(), getSiteSettings()]);
  return (
    <>
      <LuxuryBackdrop />
      <Hero />

      {/* Quick booking request — immediately under the hero */}
      <section id="reservation" aria-labelledby="reservation-title" className="scroll-mt-24 bg-obsidian">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <Reveal className="flex flex-col gap-6">
              <SectionHeading
                eyebrow="Demande de location"
                title="Réservez votre voiture à Agadir"
                description="Remplissez cette demande en une minute : votre réservation est enregistrée directement, puis l’équipe MDA CAR vous contacte rapidement pour confirmer la disponibilité du véhicule, à l’aéroport Agadir Al Massira, à Agadir ou pour une livraison ailleurs au Maroc."
              />
              <ul className="space-y-4">
                {reassurances.map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <item.icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                      aria-hidden
                    />
                    <span className="text-[15px] leading-relaxed text-steel">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
                <PhoneButton variant="outline" showNumber />
                <WhatsAppButton />
              </div>
              <p className="text-[13px] text-steel-dark">
                {settings.phoneDisplay} — Agadir, aéroport Al Massira &amp; livraison au Maroc
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-lg border border-line bg-coal p-5 sm:p-8">
                <BookingForm
                  vehicles={cars.map((v) => ({ slug: v.slug, name: v.name }))}
                  source="homepage"
                  idPrefix="rq"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured vehicles */}
      <section aria-labelledby="flotte-title" className="border-t border-line bg-obsidian">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Notre flotte"
              title="Nos voitures à louer à Agadir"
              description="Citadines, berlines et SUV : chaque fiche détaille le véhicule. Cliquez sur « Réserver cette voiture » pour accéder directement au formulaire de réservation."
            />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <VehicleGrid vehicles={cars} />
          </Reveal>
          <Reveal className="mt-10 text-center">
            <Link
              href="/nos-voitures"
              className={`${btnBaseClass} border border-line-strong text-cream hover:border-line-gold hover:text-gold`}
            >
              Voir toute la flotte
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      <TrustSection />
      <HowItWorks />
      <ReviewsSection />

      <BookingCTA />
    </>
  );
}
