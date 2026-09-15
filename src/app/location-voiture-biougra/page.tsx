import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { faqJsonLd } from "@/lib/jsonld";
import { getPublishedCars } from "@/lib/cars";
import { containerClass, sectionClass, btnBaseClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { VehicleGrid } from "@/components/VehicleGrid";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PhoneButton } from "@/components/PhoneButton";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Location de voitures à Biougra | Agence MDA CAR",
  description:
    "Louez votre voiture à Biougra avec MDA CAR, agence locale : citadines, berlines et SUV. Demande de disponibilité en une minute par WhatsApp.",
  path: "/location-voiture-biougra",
  ogTitle: "Location de voitures à Biougra",
});

const faqs = [
  {
    question: "Quels types de voitures puis-je louer à Biougra ?",
    answer:
      "La flotte MDA CAR comprend des citadines économiques, des berlines et des SUV, en boîte manuelle ou automatique selon les modèles. Consultez la page de chaque véhicule pour le détail, ou demandez conseil directement à l’équipe.",
  },
  {
    question: "Comment connaître les tarifs de location ?",
    answer: `Les tarifs définitifs seront publiés prochainement. En attendant, envoyez simplement un message WhatsApp avec le véhicule et les dates souhaités : l’équipe vous répond avec le prix correspondant.`,
  },
  {
    question: "Faut-il créer un compte pour réserver ?",
    answer:
      "Non. Un appel ou un message WhatsApp suffit : vous indiquez vos dates et le véhicule souhaité, l’équipe confirme la disponibilité et organise la remise des clés avec vous.",
  },
];

/** PHASE 7: "suggested" cars are now the first three published cars from
 *  the database instead of a hardcoded slug list (see the Agadir page for
 *  the same change and rationale). */
export default async function LocationBiougraPage() {
  const suggested = (await getPublishedCars()).slice(0, 3);
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        eyebrow="Biougra · Souss-Massa"
        title="Location de voitures à Biougra"
        description="MDA CAR est installée à Biougra : louez votre voiture directement sur place, sans détour par Agadir, avec un interlocuteur local et joignable."
        image={{
          src: "/images/mda-car-biougra-route-souss-massa.webp",
          alt: "Route de la région de Biougra, Souss-Massa",
        }}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              {
                label: "Location voiture Biougra",
                href: "/location-voiture-biougra",
              },
            ]}
          />
        }
      >
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton label="Demander les disponibilités" variant="gold" />
          <Link
            href="/nos-voitures"
            className={`${btnBaseClass} border border-line-strong text-cream hover:border-line-gold hover:text-gold`}
          >
            Voir nos voitures
          </Link>
        </div>
      </PageHeader>

      <section aria-labelledby="louer-a-biougra">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <figure className="overflow-hidden rounded-lg border border-line">
                <Image
                  src="/images/mda-car-biougra-route-souss-massa.jpg"
                  alt="Route de campagne près de Biougra, dans la plaine agricole du Souss-Massa"
                  width={1280}
                  height={800}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <figcaption className="border-t border-line bg-coal px-5 py-3 text-[13px] text-steel">
                  Sur la route de Biougra, au cœur de la plaine du Souss-Massa.
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={100} className="space-y-5">
              <SectionHeading
                eyebrow="L’agence de la ville"
                title="Louer à Biougra : simple et pratique au quotidien"
              />
              <p className="text-base leading-relaxed text-steel">
                Installée en plein Biougra, MDA CAR est l’agence de location de
                proximité de la ville. Pas besoin de descendre sur Agadir pour
                trouver une voiture : tout se règle ici, de la demande de
                disponibilité à la remise des clés.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Biougra occupe une position pratique sur la N1, l’axe qui relie
                Agadir à Tiznit. La ville est aussi réputée pour son grand souk
                hebdomadaire et pour la plaine agricole qui l’entoure —
                agrumes, primeurs et arganiers. Pour circuler entre le
                centre-ville, les douars et les exploitations agricoles, la
                voiture reste le moyen le plus simple.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Côté distances : l’aéroport d’Agadir-Al Massira se situe à une
                vingtaine de kilomètres et le centre d’Agadir à une quarantaine
                — comptez entre une demi-heure et trois quarts d’heure de route
                selon votre destination.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="quelle-voiture" className="border-y border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="La flotte"
              title="Quelle voiture louer à Biougra ?"
              description="Une citadine économique pour la ville, une berline confortable pour la route Biougra–Agadir, un SUV pour les familles et les chemins de campagne : voici trois choix fréquents."
            />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <VehicleGrid vehicles={suggested} />
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

      <section aria-labelledby="reserver-biougra">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Réservation"
              title="Comment réserver votre voiture à Biougra"
            />
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 lg:gap-10">
            {[
              {
                title: "Envoyez votre demande",
                text: "Par WhatsApp ou par téléphone : dates, véhicule souhaité, durée de location.",
              },
              {
                title: "L’équipe confirme",
                text: "MDA CAR vous répond avec la disponibilité, le tarif et les modalités de remise.",
              },
              {
                title: "Récupérez les clés",
                text: "Votre voiture vous attend, préparée et vérifiée, pour prendre la route depuis Biougra.",
              },
            ].map((step, index) => (
              <Reveal key={step.title} delay={index * 80}>
                <li className="flex h-full flex-col gap-3 border-t border-line-gold pt-6">
                  <span
                    aria-hidden
                    className="text-3xl font-extrabold text-gold"
                  >
                    0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-steel">
                    {step.text}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton label="Réserver maintenant" variant="gold" />
            <PhoneButton variant="outline" />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="faq-biougra" className="border-t border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Questions fréquentes"
              title="Location de voiture à Biougra : vos questions"
            />
          </Reveal>
          <div className="mt-8 max-w-3xl">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-line py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-white transition-colors duration-200 hover:text-gold [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-gold transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="pt-3 text-[15px] leading-relaxed text-steel">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BookingCTA
        title="Une voiture à Biougra, dès aujourd’hui ?"
        text="Contactez MDA CAR sur WhatsApp avec vos dates : l’équipe vous répond directement avec les disponibilités."
      />
    </>
  );
}
