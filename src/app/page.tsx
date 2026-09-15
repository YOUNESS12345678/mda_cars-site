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
import { ServiceCard } from "@/components/ServiceCard";
import { TrustSection } from "@/components/TrustSection";
import { HowItWorks } from "@/components/HowItWorks";
import { LocationSection } from "@/components/LocationSection";
import { BookingCTA } from "@/components/BookingCTA";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PhoneButton } from "@/components/PhoneButton";
import { Reveal } from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { LuxuryBackdrop } from "@/components/LuxuryBackdrop";
import { ReviewsSection } from "@/components/ReviewsSection";

export const metadata: Metadata = buildMetadata({
  title: "Location de voitures à Biougra, Agadir & Maroc | MDA CAR",
  description:
    "MDA CAR : location de voitures à Biougra, près d’Agadir. Réservation simple par téléphone ou WhatsApp. Biougra, Agadir et partout au Maroc.",
  path: "/",
  ogTitle: "Location de voitures à Biougra, Agadir & Maroc",
});

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
                title="Réservez votre voiture à Biougra"
                description="Remplissez cette demande en une minute : votre réservation est enregistrée directement, puis l’équipe MDA CAR vous contacte rapidement pour confirmer la disponibilité du véhicule."
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
                {settings.phoneDisplay} — Biougra, Souss-Massa, Maroc
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
              title="Nos voitures à louer à Biougra"
              description="Citadines, berlines et SUV : chaque fiche détaille le véhicule, et la réservation se fait directement avec l’agence par WhatsApp ou par téléphone."
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

      {/* Confirmed services: vehicle rental and nationwide vehicle delivery. */}
      <section aria-labelledby="services-title" className="bg-obsidian">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title="Location de voitures et livraison partout au Maroc"
              description="MDA CAR propose la location de voitures à Biougra et Agadir, avec possibilité d’organiser la livraison ou la remise du véhicule partout au Maroc selon disponibilité et modalités confirmées."
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-7">
            <Reveal>
              <ServiceCard
                icon={<Car className="h-6 w-6" aria-hidden />}
                title="Location de voitures"
                description="Location de voitures pour particuliers et professionnels, à Biougra, Agadir et dans toute la région de Souss-Massa. Disponibilités et tarifs confirmés directement par téléphone ou WhatsApp."
                href="/nos-voitures"
                ctaLabel="Voir nos voitures disponibles"
              />
            </Reveal>
            <Reveal delay={90}>
              <ServiceCard
                icon={<Phone className="h-6 w-6" aria-hidden />}
                title="Livraison du véhicule partout au Maroc"
                description="MDA CAR peut organiser la livraison ou la remise du véhicule dans différentes villes du Maroc. Les modalités, délais et éventuels frais sont confirmés directement avec vous avant la réservation."
                href="/livraison-voiture-maroc"
                ctaLabel="Découvrir la livraison au Maroc"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <LocationSection />
      <BookingCTA />
    </>
  );
}
