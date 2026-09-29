import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Car, Plane, Route } from "lucide-react";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { containerClass, sectionClass, btnBaseClass } from "@/lib/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { serviceJsonLd } from "@/lib/jsonld";
import { getSiteMediaMap } from "@/lib/site-media";
import { SeoKeyword } from "@/components/SeoKeyword";
import { RENTAL_POLICY_TEXT } from "@/lib/rental-policy";

const serviceData = {
  "location-voiture-agadir": {
    eyebrow: "Service 01 · Agadir",
    title: <>Se déplacer librement à <SeoKeyword keywordKey="home.agadir" fallback="Agadir" className="text-gold" /> et autour</>,
    seoTitle: "Location de voitures à Agadir | MDA CAR",
    seoDescription: "Location de voitures à Agadir pour vos déplacements, vos sorties et vos trajets dans la région, avec possibilité d’organisation à l’aéroport Agadir-Al Massira.",
    icon: <Car className="h-6 w-6" aria-hidden />,
    imageKey: "service.agadir",
    imageFallback: "https://cdn.getyourguide.com/image/format=avif%2Cfit=cover%2Cgravity=auto%2Cquality=60/dam/iStock-2171042803-HEADER-MOBILE.jpg",
    imageAlt: "La corniche d’Agadir et ses palmiers au coucher du soleil, face à l’océan",
    paragraphs: [
      <>
        <SeoKeyword keywordKey="home.agadir" fallback="Agadir" /> s’étend : entre la plage et la marina, les quartiers de Founty ou du Nouveau Talborjt et les communes voisines comme Inezgane ou Aït Melloul, les distances se comptent vite en kilomètres. Une <SeoKeyword keywordKey="service.agadir.vehicle" fallback="voiture de location à Agadir" /> reste le moyen le plus confortable pour profiter de la ville à son rythme.
      </>,
      <>
        C’est aussi un point de départ idéal pour explorer la région : Taghazout et le littoral au nord, la vallée du Paradis dans l’arrière-pays, ou encore la réserve de Souss-Massa au sud. Des excursions qui se font bien plus facilement au volant.
      </>,
      <>
        Vous arrivez par l’<SeoKeyword keywordKey="service.airport.agadir" fallback="aéroport Agadir-Al Massira" />, situé à une vingtaine de kilomètres de la ville ? Une livraison ou une remise du véhicule peut être organisée directement pour votre arrivée : indiquez vos dates et horaires dans votre message, l’équipe MDA CAR vous propose une organisation adaptée.
      </>,
      <>
        Besoin de la voiture ailleurs qu’à <SeoKeyword keywordKey="home.agadir" fallback="Agadir" /> ? MDA CAR peut aussi organiser la <SeoKeyword keywordKey="service.agadir.delivery" fallback="livraison du véhicule dans d’autres villes du Maroc" />, selon disponibilité.
      </>,
    ],
    caption: <>La corniche d’<SeoKeyword keywordKey="home.agadir" fallback="Agadir" />, entre plage, palmiers et marina.</>,
    reservation: "/?service=Location%20%C3%A0%20Agadir#reservation",
  },
  "livraison-voiture-maroc": {
    eyebrow: "Service 02 · Maroc",
    title: <>Livraison de voitures <SeoKeyword keywordKey="home.morocco" fallback="partout au Maroc" className="text-gold" /></>,
    seoTitle: "Livraison de voitures partout au Maroc | MDA CAR",
    seoDescription: "Service de livraison de voitures partout au Maroc selon la ville, les dates et la disponibilité du véhicule choisi.",
    icon: <Route className="h-6 w-6" aria-hidden />,
    imageKey: "service.delivery",
    imageFallback: "https://industries.ma/wp-content/uploads/2025/01/Le-Maroc-sur-la-voie-des-2000-km-dautoroute.jpg",
    imageAlt: "Route et autoroute au Maroc pour illustrer la livraison de voitures partout au Maroc",
    paragraphs: [
      <>
        Vous avez besoin d’une voiture dans une autre ville ? MDA CAR peut organiser une <SeoKeyword keywordKey="service.delivery.primary" fallback="livraison de voitures partout au Maroc" />, selon la destination, les dates et la disponibilité du véhicule choisi.
      </>,
      <>
        Lors de votre demande, indiquez simplement la <SeoKeyword keywordKey="service.delivery.city" fallback="ville" /> où vous souhaitez recevoir le véhicule. La destination est reprise dans votre demande afin de permettre à l’équipe MDA CAR de vérifier les modalités avant confirmation.
      </>,
      <>
        Le service est pensé pour rester simple : choisissez <SeoKeyword keywordKey="service.delivery.label" fallback="Livraison partout au Maroc" />, sélectionnez votre ville parmi les options proposées ou indiquez une autre ville du Maroc, puis envoyez votre demande de réservation.
      </>,
    ],
    caption: <>Route et autoroute au Maroc pour illustrer la <SeoKeyword keywordKey="service.delivery.primary" fallback="livraison de voitures partout au Maroc" />.</>,
    reservation: "/?service=Livraison%20partout%20au%20Maroc#reservation",
  },
  "location-voiture-aeroport": {
    eyebrow: "Service 03 · Aéroport",
    title: <>Location de voitures à l’<SeoKeyword keywordKey="service.airport.word" fallback="aéroport" className="text-gold" /></>,
    seoTitle: "Location de voitures à l’aéroport | MDA CAR",
    seoDescription: "Location de voitures à l’aéroport au Maroc, avec sélection de l’aéroport dans le formulaire et organisation de la remise selon disponibilité.",
    icon: <Plane className="h-6 w-6" aria-hidden />,
    imageKey: "service.airport",
    imageFallback: "https://media.istockphoto.com/id/619394704/fr/photo/un-jeune-homme-serein-regardant-lavion-avant-le-d%C3%A9part.jpg?s=612x612&w=0&k=20&c=TdzyGrHdDdao_JcLNjhDLc94qMODTyEJY1EWApjnn8A=",
    imageAlt: "Voyageur à l’aéroport avant son départ en avion",
    paragraphs: [
      <>
        Vous arrivez au Maroc par avion et souhaitez disposer d’une voiture ? Choisissez le service <SeoKeyword keywordKey="service.airport.primary" fallback="location de voitures à l’aéroport" /> dans le formulaire et sélectionnez l’<SeoKeyword keywordKey="service.airport.word" fallback="aéroport" /> correspondant à votre arrivée. Les aéroports proposés couvrent plusieurs destinations au Maroc.
      </>,
      <>
        Indiquez vos dates, horaires et informations de vol dans votre demande. MDA CAR vérifie ensuite les disponibilités et les modalités de remise du véhicule avant de confirmer la réservation.
      </>,
      <>
        Pour une arrivée à l’<SeoKeyword keywordKey="service.agadir.airport" fallback="aéroport Agadir-Al Massira" />, précisez votre horaire d’arrivée afin que l’organisation de la remise puisse être étudiée selon disponibilité.
      </>,
    ],
    caption: <>Voyageur à l’<SeoKeyword keywordKey="service.airport.word" fallback="aéroport" /> avant son départ en avion.</>,
    reservation: "/?service=Location%20%C3%A0%20l%E2%80%99a%C3%A9roport#reservation",
  },
} as const;

type Slug = keyof typeof serviceData;

export function generateStaticParams() {
  return Object.keys(serviceData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceData[slug as Slug];
  if (!service) return {};
  return buildMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/services/${slug}`,
    ogTitle: service.seoTitle,
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceData[slug as Slug];
  if (!service) notFound();
  const media = await getSiteMediaMap();
  const imageSrc = media[service.imageKey]?.src || service.imageFallback;

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: service.seoTitle.replace(" | MDA CAR", ""),
          description: service.seoDescription,
          path: `/services/${slug}`,
        })}
      />

      <main>
        <section className="border-b border-line bg-night">
          <div className={`${containerClass} py-8 sm:py-10`}>
            <Breadcrumbs
              items={[
                { label: "Accueil", href: "/" },
                { label: "Services", href: "/services" },
                { label: service.eyebrow.split("·")[1]?.trim() ?? "Détail", href: `/services/${slug}` },
              ]}
            />
            <div className="mt-8 max-w-4xl">
              <div className="mb-5 flex items-center gap-3 text-sm font-semibold tracking-normal text-gold">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-gold bg-surface">{service.icon}</span>
                {service.eyebrow}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-normal text-white sm:text-4xl lg:text-5xl">
                {service.title}
              </h1>
            </div>
          </div>
        </section>

        <section>
          <div className={`${containerClass} ${sectionClass}`}>
            <article className="mx-auto max-w-5xl rounded-2xl border border-line bg-coal p-6 shadow-xl sm:p-8 lg:p-10">
              <div className="grid gap-9 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
                <div className="space-y-5 text-[16px] leading-8 tracking-normal text-steel">
                  {service.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  <div className="rounded-xl border border-line bg-surface p-5">
                    <h2 className="text-base font-semibold text-white">À savoir avant la réservation</h2>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-steel">
                      <li><strong className="text-white">Kilométrage :</strong> {RENTAL_POLICY_TEXT.kilometers}</li>
                      <li><strong className="text-white">Assurance :</strong> {RENTAL_POLICY_TEXT.insurance}</li>
                      <li><strong className="text-white">Prolongation :</strong> {RENTAL_POLICY_TEXT.extension}</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={service.reservation}
                      className={`${btnBaseClass} inline-flex w-fit whitespace-nowrap bg-gold text-night hover:bg-gold-hover`}
                    >
                      Réserver maintenant
                      <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
                    </Link>
                  </div>
                </div>

                <figure className="overflow-hidden rounded-xl border border-line-gold/50 bg-surface">
                  <Image
                    src={imageSrc}
                    alt={service.imageAlt}
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="h-auto w-full object-cover"
                  />
                  <figcaption className="border-t border-line px-4 py-3 text-sm leading-relaxed tracking-normal text-steel-dark">
                    {service.caption}
                  </figcaption>
                </figure>
              </div>
            </article>

            <div className="mt-8">
              <Link href="/services" className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-normal text-gold hover:text-white">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Retour aux services
              </Link>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}
