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
  title: "Location de voitures à Agadir | MDA CAR Souss-Massa",
  description:
    "Besoin d’une voiture à Agadir ? MDA CAR, agence basée à Biougra, sert Agadir et sa région. Organisation simple par WhatsApp ou téléphone.",
  path: "/location-voiture-agadir",
  ogTitle: "Location de voitures à Agadir",
});

const faqs = [
  {
    question: "MDA CAR est-elle située à Agadir ?",
    answer:
      "L’agence est basée à Biougra, à environ 40 km d’Agadir, et sert toute la région. Le contact se fait par téléphone ou WhatsApp ; les modalités de remise du véhicule à Agadir se règlent directement avec l’équipe lors de la réservation.",
  },
  {
    question: "Quelle voiture choisir pour un séjour à Agadir ?",
    answer:
      "Une citadine suffit pour circuler en ville ; une berline automatique apporte plus de confort sur les longues distances ; un SUV est appréciable pour l’arrière-pays. Décrivez votre programme à l’équipe, elle vous orientera.",
  },
  {
    question: "Comment obtenir le tarif pour Agadir ?",
    answer: `Les tarifs définitifs seront publiés prochainement. En attendant, envoyez vos dates et le véhicule souhaité sur WhatsApp : l’équipe vous répond avec le prix correspondant.`,
  },
];

/** PHASE 7: "suggested" cars are now the first three published cars from
 *  the database, instead of a hardcoded slug list from the old static
 *  sample — those exact slugs (e.g. "hyundai-tucson") aren't guaranteed to
 *  exist among admin-entered cars, whose slugs are generated from the
 *  brand/model/year the admin actually typed in. */
export default async function LocationAgadirPage() {
  const suggested = (await getPublishedCars()).slice(0, 3);
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHeader
        eyebrow="Agadir · Souss-Massa"
        title="Location de voitures à Agadir"
        description="Vous cherchez une voiture de location à Agadir ? MDA CAR sert toute la région depuis Biougra — l’organisation se fait simplement, par téléphone ou WhatsApp."
        image={{
          src: "/images/mda-car-agadir-corniche-location-voiture.jpg",
          alt: "Location de voiture MDA CAR sur la corniche d'Agadir",
        }}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              {
                label: "Location voiture Agadir",
                href: "/location-voiture-agadir",
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

      <section aria-labelledby="se-deplacer-agadir">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal className="order-2 space-y-5 lg:order-1">
              <SectionHeading
                eyebrow="Pourquoi une voiture à Agadir"
                title="Se déplacer librement à Agadir et autour"
              />
              <p className="text-base leading-relaxed text-steel">
                Agadir s’étend : entre la plage et la marina, les quartiers de
                Founty ou du Nouveau Talborjt et les communes voisines comme
                Inezgane ou Aït Melloul, les distances se comptent vite en
                kilomètres. Une voiture de location reste le moyen le plus
                confortable pour profiter de la ville à son rythme.
              </p>
              <p className="text-base leading-relaxed text-steel">
                C’est aussi un point de départ idéal pour explorer la région :
                Taghazout et le littoral au nord, la vallée du Paradis dans
                l’arrière-pays, ou encore la réserve de Souss-Massa au sud. Des
                excursions qui se font bien plus facilement au volant.
              </p>
              <p className="text-base leading-relaxed text-steel">
                Vous arrivez par l’aéroport Agadir-Al Massira, situé à une
                vingtaine de kilomètres de la ville ? Indiquez vos dates et
                horaires dans votre message : l’équipe MDA CAR vous proposera
                une organisation de remise adaptée à votre arrivée.
              </p>
            </Reveal>
            <Reveal delay={100} className="order-1 lg:order-2">
              <figure className="overflow-hidden rounded-lg border border-line">
                <Image
                  src="/images/mda-car-agadir-corniche-location-voiture.jpg"
                  alt="La corniche d’Agadir et ses palmiers au coucher du soleil, face à l’océan"
                  width={1280}
                  height={800}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <figcaption className="border-t border-line bg-coal px-5 py-3 text-[13px] text-steel">
                  La corniche d’Agadir, entre plage, palmiers et marina.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="comment-avec-mda" className="border-y border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Organisation"
              title="Comment ça se passe avec MDA CAR"
            />
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 lg:gap-10">
            {[
              {
                title: "Vous envoyez un message",
                text: "Dates du séjour, type de véhicule, lieu d’arrivée à Agadir : un message WhatsApp suffit.",
              },
              {
                title: "L’équipe vous répond",
                text: "Disponibilités, tarif et point de remise à Agadir sont confirmés avec vous directement.",
              },
              {
                title: "Vous récupérez la voiture",
                text: "Le véhicule est préparé avant la remise des clés — vous profitez d’Agadir en toute liberté.",
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

      <section aria-labelledby="flotte-agadir">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="La flotte"
              title="Des voitures adaptées à Agadir"
              description="SUV confortables, berlines automatiques et citadines économiques : toute la flotte MDA CAR est disponible pour Agadir selon les dates. Trois exemples ci-dessous."
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
              Voir tous les véhicules
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="faq-agadir" className="border-t border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Questions fréquentes"
              title="Location de voiture à Agadir : vos questions"
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
        title="Votre voiture pour Agadir vous attend"
        text="Écrivez à MDA CAR sur WhatsApp avec vos dates et votre lieu d’arrivée : l’équipe organise la suite avec vous."
      />
    </>
  );
}
