import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, CarFront, MapPin, MessagesSquare } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { containerClass, sectionClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { LocationSection } from "@/components/LocationSection";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = buildMetadata({
  title: "À propos de MDA CAR | Location de voitures à Biougra",
  description:
    "MDA CAR, agence de location de voitures basée à Biougra : proximité, véhicules entretenus et contact direct. Biougra, Agadir, Souss-Massa.",
  path: "/a-propos",
  ogTitle: "À propos de MDA CAR",
});

const pillars = [
  {
    icon: MapPin,
    title: "Proximité locale",
    text: "Une agence installée à Biougra, qui connaît la région et reste facilement joignable avant, pendant et après la location.",
  },
  {
    icon: MessagesSquare,
    title: "Simplicité",
    text: "Pas de compte à créer ni de formulaire interminable : un appel ou un message WhatsApp suffit pour lancer une location.",
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

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="À propos"
        title="MDA CAR, agence de location de voitures à Biougra"
        description="Une agence de proximité au service de Biougra, Agadir et de la région de Souss-Massa."
        image={{
          src: "/images/mda-car-a-propos-agence-biougra.webp",
          alt: "Agence MDA CAR à Biougra, Souss-Massa",
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
                MDA CAR est une agence de location de voitures basée à Biougra,
                au cœur de la région de Souss-Massa. C’est cette conviction qui
                guide notre travail au quotidien : rendre la location simple,
                directe et sans mauvaise surprise.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Ici, pas de plateforme impersonnelle : vous parlez directement
                à l’agence, par téléphone ou sur WhatsApp. Vous décrivez votre
                besoin — un trajet professionnel, un déplacement en famille, un
                séjour dans la région — et l’équipe vous répond avec une
                proposition claire.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Nos véhicules sont préparés avant chaque location : propres,
                vérifiés et prêts à prendre la route, de Biougra à Agadir et
                au-delà.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <figure className="overflow-hidden rounded-lg border border-line">
                <Image
                  src="/images/mda-car-a-propos-agence-biougra.webp"
                  alt="Agence MDA CAR à Biougra avec les véhicules de location devant l’agence"
                  width={1360}
                  height={1020}
                  loading="lazy"
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

      <LocationSection />
      <BookingCTA
        title="Envie d’en savoir plus ?"
        text="Posez vos questions directement à l’équipe MDA CAR, par téléphone ou sur WhatsApp."
      />
    </>
  );
}
