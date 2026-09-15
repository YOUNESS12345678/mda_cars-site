import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPublishedCars } from "@/lib/cars";
import { containerClass, sectionClass } from "@/lib/ui";
import { PageHeader } from "@/components/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VehicleGrid } from "@/components/VehicleGrid";
import { BookingCTA } from "@/components/BookingCTA";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = buildMetadata({
  title: "Nos voitures à louer à Biougra | Flotte MDA CAR",
  description:
    "La flotte MDA CAR à Biougra : citadines, berlines et SUV. Fiche détaillée par véhicule, disponibilités et tarifs confirmés par WhatsApp ou téléphone.",
  path: "/nos-voitures",
  ogTitle: "Nos voitures à louer à Biougra",
});

/** PHASE 7: now an async Server Component reading the published fleet
 *  from the database instead of the static lib/vehicles sample. */
export default async function FleetPage() {
  const cars = await getPublishedCars();
  return (
    <>
      <PageHeader
        eyebrow="La flotte MDA CAR"
        title="Nos voitures à Biougra"
        description="Citadines, berlines et SUV disponibles à la location à Biougra, Agadir et dans la région de Souss-Massa. Chaque fiche détaille le véhicule ; les disponibilités et les tarifs se confirment directement avec l’agence."
        image={{
          src: "/images/mda-car-nos-voitures-route-montagne.webp",
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
            Les tarifs définitifs seront affichés prochainement. En attendant,
            contactez MDA CAR sur WhatsApp ou par téléphone pour connaître le
            prix de location du véhicule qui vous intéresse.
          </p>
        </div>
      </section>

      <BookingCTA
        title="Une voiture vous plaît ?"
        text="Envoyez un message WhatsApp à MDA CAR avec le nom du véhicule : l’équipe vous répond avec les disponibilités et le tarif."
      />
    </>
  );
}
