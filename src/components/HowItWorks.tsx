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
    title: "Contactez MDA CAR",
    text: "Un appel ou un message WhatsApp suffit pour demander les disponibilités.",
  },
  {
    icon: BadgeCheck,
    title: "Confirmez votre location",
    text: "L’équipe confirme avec vous la disponibilité, les dates et les modalités.",
  },
  {
    icon: KeyRound,
    title: "Profitez de votre véhicule",
    text: "Récupérez votre voiture et prenez la route, à Biougra, Agadir ou au-delà.",
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
            <Reveal key={step.title} delay={index * 80}>
              <li className="flex h-full flex-col gap-4 border-t border-line-gold pt-6">
                <span
                  aria-hidden
                  className="text-4xl font-extrabold tracking-tight text-gold/90"
                >
                  0{index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <step.icon className="h-6 w-6 text-gold" aria-hidden />
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-steel">
                  {step.text}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
