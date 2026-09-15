import { CarFront, MapPin, MessagesSquare, Phone } from "lucide-react";
import { containerClass, sectionClass } from "@/lib/ui";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const trustPoints = [
  {
    icon: MapPin,
    title: "Une agence basée à Biougra",
    text: "Une équipe locale qui connaît Biougra, Agadir et la région de Souss-Massa — et qui y est réellement joignable.",
  },
  {
    icon: Phone,
    title: "Un contact direct",
    text: "Vous échangez avec MDA CAR par téléphone ou WhatsApp, sans plateforme ni intermédiaire.",
  },
  {
    icon: CarFront,
    title: "Des voitures entretenues",
    text: "Chaque véhicule est préparé avant la location : propre, vérifié et prêt à prendre la route.",
  },
  {
    icon: MessagesSquare,
    title: "Une communication flexible",
    text: "Une question, un imprévu, un ajustement de dates ? Un simple message suffit pour s’organiser.",
  },
];

export function TrustSection() {
  return (
    <section
      aria-labelledby="pourquoi-mda-car"
      className="border-y border-line bg-coal"
    >
      <div className={`${containerClass} ${sectionClass}`}>
        <Reveal>
          <SectionHeading
            eyebrow="Pourquoi MDA CAR"
            title="Une agence locale, un contact direct"
            description="Pas de promesses impossibles : une agence de proximité, des voitures propres et entretenues, et des échanges simples du premier message à la remise des clés."
          />
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {trustPoints.map((point, index) => (
            <Reveal key={point.title} delay={index * 80}>
              <div className="flex h-full flex-col gap-4 border-t border-line-gold pt-6">
                <point.icon className="h-7 w-7 text-gold" aria-hidden />
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {point.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-steel">
                  {point.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
