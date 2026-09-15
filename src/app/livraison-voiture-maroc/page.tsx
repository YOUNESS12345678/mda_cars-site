import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Car, MapPin, Phone } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { serviceJsonLd } from "@/lib/jsonld";
import { containerClass, sectionClass, btnBaseClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Livraison de voitures de location partout au Maroc | MDA CAR",
  description:
    "MDA CAR peut organiser la livraison ou la remise d’une voiture de location au Maroc, selon la destination, la disponibilité et les modalités confirmées avant réservation.",
  path: "/livraison-voiture-maroc",
  ogTitle: "Livraison de voitures de location partout au Maroc",
});

export default function LivraisonVoitureMarocPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Livraison de voitures de location partout au Maroc",
          description:
            "Livraison ou remise du véhicule de location dans différentes villes du Maroc, selon disponibilité et modalités confirmées avec le client.",
          path: "/livraison-voiture-maroc",
          areaServed: ["Maroc", "Biougra", "Agadir", "Souss-Massa"],
        })}
      />
      <PageHeader
        eyebrow="Service MDA CAR · Maroc"
        title="Livraison de voitures de location partout au Maroc"
        description="Vous n’êtes pas à Biougra ou Agadir ? MDA CAR peut organiser la livraison ou la remise du véhicule dans différentes villes du Maroc. Les modalités sont confirmées avec vous avant la réservation."
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
              { label: "Livraison au Maroc", href: "/livraison-voiture-maroc" },
            ]}
          />
        }
      >
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton label="Demander une livraison" variant="gold" />
          <Link
            href="/nos-voitures"
            className={`${btnBaseClass} border border-line-strong text-cream hover:border-line-gold hover:text-gold`}
          >
            Voir les voitures
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </PageHeader>

      <section aria-labelledby="livraison-comment" className="bg-obsidian">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Destination au Maroc",
                text: "Indiquez simplement la ville ou la destination où vous souhaitez recevoir ou remettre le véhicule.",
              },
              {
                icon: Car,
                title: "Livraison à organiser",
                text: "L’équipe MDA CAR vérifie la possibilité de livraison pour votre destination et le véhicule choisi.",
              },
              {
                icon: Phone,
                title: "Modalités confirmées",
                text: "Les délais, conditions et éventuels frais sont confirmés directement avec vous avant toute réservation.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 80}>
                <div className="h-full border-t border-line-gold pt-6">
                  <Icon className="h-7 w-7 text-gold" aria-hidden />
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">{title}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-steel">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="zones-livraison" className="border-t border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <h2 id="zones-livraison" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Une demande depuis n’importe quelle ville du Maroc
            </h2>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-steel">
              MDA CAR est basée à Biougra, dans le Souss-Massa, et sert notamment Biougra et Agadir. Pour une autre ville au Maroc, envoyez votre destination, vos dates et le véhicule souhaité : l’équipe vous confirme directement si la livraison ou la remise peut être organisée.
            </p>
          </Reveal>
        </div>
      </section>

      <BookingCTA
        title="Besoin d’une livraison au Maroc ?"
        text="Envoyez votre ville, vos dates et le véhicule souhaité à MDA CAR par WhatsApp. L’équipe vous confirme les possibilités et les modalités avant la réservation."
      />
    </>
  );
}
