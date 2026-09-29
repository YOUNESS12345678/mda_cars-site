import Image from "next/image";
import type { Metadata } from "next";
import { BadgeCheck, CarFront, MapPin, MessagesSquare } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { containerClass, sectionClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";
import { getSiteMediaMap } from "@/lib/site-media";

export const metadata: Metadata = buildMetadata({
  title: "À propos de MDA CAR | Location de voitures à Agadir",
  description:
    "MDA CAR, agence de location de voitures au Maroc : proximité, véhicules entretenus et contact direct à Agadir et dans la région de Souss-Massa.",
  path: "/a-propos",
  ogTitle: "À propos de MDA CAR",
});

const pillars = [
  {
    icon: MapPin,
    title: "Proximité locale",
    text: "Une agence proche de ses clients, facilement joignable avant, pendant et après la location, avec un service orienté vers Agadir et le Maroc.",
  },
  {
    icon: MessagesSquare,
    title: "Simplicité",
    text: "Pas de compte à créer : choisissez votre véhicule, remplissez le formulaire de réservation et MDA CAR vous contacte pour confirmer la demande.",
  },
  {
    icon: CarFront,
    title: "Véhicules entretenus",
    text: "Chaque voiture est préparée avant le départ — propre, vérifiée et prête à prendre la route.",
  },
  {
    icon: BadgeCheck,
    title: "Clarté",
    text: "Disponibilités, tarifs et modalités sont confirmés directement avec vous, sans frais cachés ni surprise.",
  },
];

export default async function AboutPage() {
  const media = await getSiteMediaMap();
  const aboutImage = media["about.body"]?.src || "/images/mda-car-a-propos-agence.webp";
  return (
    <>
      <PageHeader
        eyebrow="À propos"
        title="MDA CAR, agence de location de voitures à Agadir"
        description="Une agence de proximité au service d’Agadir, de Souss-Massa et des clients partout au Maroc."
        image={{
          src: media["about.header"]?.src || "/images/mda-car-a-propos-agence.webp",
          alt: "Agence MDA CAR, service de location de voitures à Agadir et au Maroc",
        }}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "À propos", href: "/a-propos" },
            ]}
          />
        }
      />

      <section aria-labelledby="qui-sommes-nous">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="space-y-5">
              <SectionHeading
                eyebrow="Qui sommes-nous"
                title="Louer une voiture ne devrait jamais être compliqué"
              />
              <p className="text-base leading-relaxed text-steel">
                MDA CAR est une agence de location de voitures qui accompagne ses clients à Agadir, dans la région de Souss-Massa et partout au Maroc. C’est cette conviction qui
                guide notre travail au quotidien : rendre la location simple,
                directe et sans mauvaise surprise.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Ici, pas de plateforme impersonnelle : vous envoyez directement votre
                demande à l’agence via le formulaire de réservation. Vous pouvez
                aussi nous contacter par téléphone ou sur WhatsApp si vous avez
                une question — l’équipe vous répond avec une proposition claire.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Nos véhicules sont préparés avant chaque location : propres,
                vérifiés et prêts à prendre la route, à Agadir et partout au Maroc,
                au-delà.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <figure className="overflow-hidden rounded-lg border border-line">
                <Image
                  src={aboutImage}
                  alt="Agence MDA CAR avec les véhicules de location devant l’agence"
                  width={1200}
                  height={750}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="aspect-[16/10] w-full object-cover"
                />
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="notre-approche" className="border-y border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Notre approche"
              title="Quatre principes, rien de superflu"
              description="Ce ne sont pas des slogans : c’est simplement la manière dont MDA CAR travaille avec chacun de ses clients."
            />
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 80}>
                <div className="flex h-full flex-col gap-4 border-t border-line-gold pt-6">
                  <pillar.icon className="h-7 w-7 text-gold" aria-hidden />
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-steel">
                    {pillar.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA
        title="Envie d’en savoir plus ?"
        text="Posez vos questions directement à l’équipe MDA CAR, par téléphone ou sur WhatsApp."
      />
    </>
  );
}
