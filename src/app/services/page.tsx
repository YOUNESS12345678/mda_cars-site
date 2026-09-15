import type { Metadata } from "next";
import { Briefcase, Car, Compass } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { serviceJsonLd } from "@/lib/jsonld";
import { containerClass, sectionClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceCard } from "@/components/ServiceCard";
import { SectionHeading } from "@/components/SectionHeading";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Location de voitures & livraison au Maroc | MDA CAR",
  description:
    "MDA CAR propose la location de voitures à Biougra, Agadir et partout au Maroc, avec livraison du véhicule selon disponibilité et modalités confirmées.",
  path: "/services",
  ogTitle: "Les services MDA CAR à Biougra",
});

const audiences = [
  {
    icon: Car,
    title: "Particuliers",
    text: "Un rendez-vous à Agadir, un week-end en famille, une voiture en remplacement : louez le temps qu’il vous faut.",
  },
  {
    icon: Briefcase,
    title: "Professionnels",
    text: "Déplacements de travail entre Biougra, Agadir et la région : une voiture fiable, réservée en un message.",
  },
  {
    icon: Compass,
    title: "Visiteurs de la région",
    text: "De passage dans le Souss-Massa ? Repartez librement à la découverte des souks, plages et campagnes d’arganiers.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Location de voitures et livraison au Maroc",
          description:
            "Location de voitures à Biougra et Agadir avec possibilité d’organiser la livraison ou la remise du véhicule partout au Maroc, selon disponibilité et modalités confirmées.",
          path: "/services",
        })}
      />
      <PageHeader
        eyebrow="Services MDA CAR"
        title="Location de voitures et livraison partout au Maroc"
        description="MDA CAR loue des voitures à Biougra et Agadir et peut organiser la livraison ou la remise du véhicule partout au Maroc, selon disponibilité et modalités confirmées avant la réservation."
        image={{
          src: "/images/mda-car-services-road-trip-agadir.webp",
          alt: "Voyageuse profitant de la route et des montagnes, symbole de liberté offerte par la location de voiture MDA CAR",
        }}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
            ]}
          />
        }
      />

      {/* Confirmed services: vehicle rental and nationwide vehicle delivery. */}
      <section aria-labelledby="service-location">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-7">
            <Reveal>
              <ServiceCard
                icon={<Car className="h-6 w-6" aria-hidden />}
                title="Location de voitures"
                description="Citadines, berlines et SUV disponibles à la location à Biougra, Agadir et dans toute la région de Souss-Massa. Chaque véhicule est préparé avant le départ ; les disponibilités et les tarifs sont confirmés directement par téléphone ou WhatsApp."
                href="/nos-voitures"
                ctaLabel="Voir nos voitures disponibles"
              />
            </Reveal>
            <Reveal delay={90}>
              <ServiceCard
                icon={<Compass className="h-6 w-6" aria-hidden />}
                title="Livraison du véhicule partout au Maroc"
                description="Vous n’êtes pas à Biougra ou Agadir ? MDA CAR peut organiser la livraison ou la remise du véhicule dans différentes villes du Maroc, selon la disponibilité du véhicule et les modalités convenues avant la réservation."
                href="/livraison-voiture-maroc"
                ctaLabel="Voir les modalités de livraison"
              />
            </Reveal>
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-steel-dark">
            Conditions de location communiquées par l’agence, avant
            confirmation de la réservation.
          </p>
        </div>
      </section>

      <section aria-labelledby="pour-qui" className="border-t border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Pour qui ?"
              title="Une location pensée pour vos besoins réels"
              description="Ni contrats incompréhensibles ni démarches interminables : vous décrivez votre besoin, MDA CAR vous répond avec une solution concrète."
            />
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {audiences.map((audience, index) => (
              <Reveal key={audience.title} delay={index * 80}>
                <div className="flex h-full flex-col gap-4 border-t border-line-gold pt-6">
                  <audience.icon className="h-7 w-7 text-gold" aria-hidden />
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {audience.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-steel">
                    {audience.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA
        title="Un besoin particulier ?"
        text="Décrivez votre trajet ou votre contrainte à MDA CAR : l’équipe vous répond directement, sans formulaire interminable."
      />
    </>
  );
}
