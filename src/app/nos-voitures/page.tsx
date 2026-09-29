import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPublishedCars } from "@/lib/cars";
import { containerClass, sectionClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VehicleGrid } from "@/components/VehicleGrid";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";
import { getSiteMediaMap } from "@/lib/site-media";

export const metadata: Metadata = buildMetadata({
  title: "Nos voitures à louer à Agadir | Flotte MDA CAR",
  description:
    "La flotte MDA CAR à Agadir : citadines, berlines et SUV, avec livraison possible. Disponibilités et tarifs confirmés directement avec MDA CAR.",
  path: "/nos-voitures",
  ogTitle: "Nos voitures à louer à Agadir",
});

/** PHASE 7: now an async Server Component reading the published fleet
 *  from the database instead of the static lib/vehicles sample. */
export default async function FleetPage() {
  const [cars, media] = await Promise.all([getPublishedCars(), getSiteMediaMap()]);
  return (
    <>
      <PageHeader
        eyebrow="La flotte MDA CAR"
        title="Nos voitures à louer à Agadir"
        description="Citadines, berlines et SUV disponibles à la location à Agadir et pour des trajets partout au Maroc. Chaque fiche détaille le véhicule ; les disponibilités et les tarifs se confirment directement avec l’agence."
        image={{
          src: media["fleet.header"]?.src || "/images/mda-car-nos-voitures-route-montagne.webp",
          alt: "Vue depuis une voiture MDA CAR roulant sur une route de montagne, illustrant la liberté de conduire dans la région",
        }}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Nos voitures", href: "/nos-voitures" },
            ]}
          />
        }
      />

      <section aria-label="Liste des véhicules">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <VehicleGrid vehicles={cars} />
          </Reveal>
          <p className="mt-10 max-w-2xl text-[14px] leading-relaxed text-steel-dark">
            Les tarifs définitifs sont confirmés directement avec MDA CAR.
            Ouvrez la fiche d’un véhicule puis cliquez sur « Réserver cette voiture »
            pour accéder au formulaire de réservation.
          </p>
        </div>
      </section>

      <BookingCTA
        title="Besoin d’aide avant de réserver ?"
        text="Si vous avez une question sur un véhicule, une date ou un service, contactez directement MDA CAR par téléphone ou WhatsApp."
      />
    </>
  );
}
