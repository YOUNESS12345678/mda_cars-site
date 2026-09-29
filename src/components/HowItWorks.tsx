import { BadgeCheck, CarFront, KeyRound, MessageCircle } from "lucide-react";
import { containerClass, sectionClass } from "@/lib/ui";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const steps = [
  {
    icon: CarFront,
    title: "Choisissez votre voiture",
    text: "Parcourez les véhicules MDA CAR et trouvez celui qui correspond à votre trajet.",
  },
  {
    icon: MessageCircle,
    title: "Remplissez le formulaire",
    text: "Choisissez votre service, vos dates et votre véhicule, puis envoyez votre demande de réservation.",
  },
  {
    icon: BadgeCheck,
    title: "Confirmez votre location",
    text: "L’équipe confirme avec vous la disponibilité, les dates et les modalités.",
  },
  {
    icon: KeyRound,
    title: "Profitez de votre véhicule",
    text: "Récupérez votre voiture et prenez la route, à Agadir, à l’aéroport Al Massira ou au-delà.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="comment-ca-marche">
      <div className={`${containerClass} ${sectionClass}`}>
        <Reveal>
          <SectionHeading
            eyebrow="Comment ça marche"
            title="Louer votre voiture en 4 étapes"
            description="Un parcours volontairement simple : pas de compte à créer, pas de formulaire interminable — un échange direct avec l’agence."
          />
        </Reveal>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {steps.map((step, index) => (
            <li key={step.title} className="h-full">
              <Reveal delay={index * 80} className="h-full">
              <div className="flex h-full flex-col gap-4 border-t border-line-gold pt-6">
                <span
                  aria-hidden
                  className="text-4xl font-extrabold tracking-tight text-gold/90"
                >
                  0{index + 1}
                </span>
                <div className="flex min-h-14 items-start gap-3">
                  <step.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" aria-hidden />
                  <h3 className="text-lg font-semibold leading-7 tracking-tight text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-steel">
                  {step.text}
                </p>
              </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
