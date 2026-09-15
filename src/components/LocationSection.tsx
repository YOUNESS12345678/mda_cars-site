import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { containerClass, sectionClass } from "@/lib/ui";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const areas = [
  {
    href: "/location-voiture-biougra",
    title: "Location de voitures à Biougra",
    text: "La ville d’attache de MDA CAR : louez votre véhicule directement à Biougra, au cœur de la région de Souss-Massa.",
  },
  {
    href: "/location-voiture-agadir",
    title: "Location de voitures à Agadir",
    text: "MDA CAR sert également Agadir et ses environs, avec la même simplicité : un message et l’équipe s’occupe du reste.",
  },
];

export function LocationSection() {
  return (
    <section
      aria-labelledby="zone-desservie"
      className="border-y border-line bg-coal"
    >
      <div className={`${containerClass} ${sectionClass}`}>
        <Reveal>
          <SectionHeading
            eyebrow="Zone desservie"
            title="Location de voitures à Biougra, Agadir et dans le Souss-Massa"
            description="Basée à Biougra, MDA CAR accompagne ses clients dans toute la région : déplacements du quotidien, trajets professionnels, départs en vacances ou arrivées à Agadir."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-7">
          {areas.map((area, index) => (
            <Reveal key={area.href} delay={index * 90}>
              <Link
                href={area.href}
                className="group flex h-full flex-col gap-4 rounded-lg border border-line bg-surface p-6 transition-colors duration-200 hover:border-line-gold sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-gold" aria-hidden />
                  <h3 className="text-xl font-semibold tracking-tight text-white transition-colors duration-200 group-hover:text-gold">
                    {area.title}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-steel">
                  {area.text}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[14px] font-semibold text-gold">
                  Découvrir la page
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
