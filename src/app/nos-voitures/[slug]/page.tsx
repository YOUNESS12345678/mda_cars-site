import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getPublishedCarBySlug, getPublishedCars, getRelatedPublishedCars } from "@/lib/cars";
import { containerClass, sectionClass } from "@/lib/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VehicleGallery } from "@/components/VehicleGallery";
import { VehicleSpecs } from "@/components/VehicleSpecs";
import { VehicleGrid } from "@/components/VehicleGrid";
import { BookingForm } from "@/components/BookingForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PhoneButton } from "@/components/PhoneButton";
import { BookingCTA } from "@/components/BookingCTA";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

type VehiclePageProps = { params: Promise<{ slug: string }> };

/** PHASE 7: pre-renders known published cars at build time (when a
 *  database is available) for speed, but `dynamicParams` is left at its
 *  default (true) — unlike before, a car added or renamed from the admin
 *  dashboard after the last build/deploy is rendered on demand instead of
 *  404ing until the next deploy. */
export async function generateStaticParams() {
  try {
    const cars = await getPublishedCars();
    return cars.map((vehicle) => ({ slug: vehicle.slug }));
  } catch {
    // Keep production builds resilient if the database is temporarily
    // unavailable. dynamicParams remains true, so published cars can still
    // render on demand once the database is reachable.
    return [];
  }
}

export async function generateMetadata({
  params,
}: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getPublishedCarBySlug(slug);
  if (!vehicle) return {};
  return buildMetadata({
    title: `${vehicle.name} à louer à Biougra | MDA CAR`,
    description: `Louez une ${vehicle.name} (${vehicle.category.toLowerCase()}, ${vehicle.transmission.toLowerCase()}, ${vehicle.fuel.toLowerCase()}) chez MDA CAR à Biougra. Réservation par téléphone ou WhatsApp.`,
    path: `/nos-voitures/${vehicle.slug}`,
    ogTitle: `${vehicle.name} à louer à Biougra`,
  });
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const vehicle = await getPublishedCarBySlug(slug);
  if (!vehicle) notFound();

  const [related, allCars] = await Promise.all([
    getRelatedPublishedCars(vehicle.slug),
    getPublishedCars(),
  ]);
  return (
    <>
      <div className={`${containerClass} pt-20 md:pt-24`}>
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Nos voitures", href: "/nos-voitures" },
            { label: vehicle.name, href: `/nos-voitures/${vehicle.slug}` },
          ]}
        />
      </div>

      <section aria-labelledby="vehicle-title" className="bg-obsidian">
        <div className={`${containerClass} pb-14 pt-6 md:pb-20`}>
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <Reveal>
              <VehicleGallery images={vehicle.images} name={vehicle.name} />
            </Reveal>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
                  {vehicle.category} · {vehicle.transmission} · {vehicle.fuel}
                </p>
                <h1
                  id="vehicle-title"
                  className="mt-3 text-[28px] font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl"
                >
                  {vehicle.name}{" "}
                  <span className="text-gold">à louer à Biougra</span>
                </h1>
              </div>

              <p className="text-base leading-relaxed text-steel">
                {vehicle.description}
              </p>

              {vehicle.isAvailable === false ? (
                <p className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-950/30 px-5 py-4 text-[14px] font-semibold leading-relaxed text-red-200">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
                  Véhicule actuellement indisponible. Contactez MDA CAR pour connaître sa prochaine disponibilité.
                </p>
              ) : (
                <p className="flex items-start gap-3 rounded-lg border border-line bg-coal px-5 py-4 text-[14px] leading-relaxed text-steel">
                  <BadgeCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                    aria-hidden
                  />
                  Véhicule préparé et vérifié avant chaque location par l’équipe
                  MDA CAR.
                </p>
              )}

              <p className="text-[15px] text-steel">
                Prix par jour :{" "}
                {vehicle.pricePerDay ? (
                  <span className="text-xl font-semibold text-gold">
                    {vehicle.pricePerDay}
                  </span>
                ) : (
                  <span className="inline-block rounded border border-line-gold px-2.5 py-1 text-[13px] font-semibold text-gold">
                    Sur demande
                  </span>
                )}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#reservation"
                  className="btn-sweep inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 py-3 text-[15px] font-semibold tracking-[0.01em] text-night transition-colors duration-200 hover:bg-gold-hover"
                >
                  {vehicle.isAvailable === false ? "Demander sa disponibilité" : "Réserver cette voiture"}
                </a>
                <WhatsAppButton label="Contacter sur WhatsApp" />
                <PhoneButton variant="outline" showNumber />
              </div>

              <Link
                href="/nos-voitures"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-steel transition-colors duration-200 hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Voir toute la flotte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specs + booking request */}
      <section aria-labelledby="reservation-vehicule" className="border-t border-line bg-coal">
        <div className={`${containerClass} ${sectionClass}`}>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal className="flex flex-col gap-6">
              <SectionHeading
                eyebrow="Caractéristiques"
                title={`La ${vehicle.name} en détail`}
              />
              <VehicleSpecs vehicle={vehicle} />
            </Reveal>
            <Reveal delay={100} className="flex flex-col gap-6">
              <SectionHeading
                eyebrow="Disponibilités"
                title={`Demander la ${vehicle.name}`}
                description="Remplissez le formulaire de réservation. Votre demande sera enregistrée directement par MDA CAR, puis notre équipe vous contactera pour confirmer la disponibilité."
              />
              <div
                id="reservation"
                className="scroll-mt-24 rounded-lg border border-line bg-night p-5 sm:p-8"
              >
                <BookingForm
                  vehicles={allCars.map((v) => ({ slug: v.slug, name: v.name }))}
                  defaultVehicle={vehicle.name}
                  source={`vehicule:${vehicle.slug}`}
                  idPrefix="vh"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Related vehicles */}
      <section aria-labelledby="autres-vehicules" className="bg-obsidian">
        <div className={`${containerClass} ${sectionClass}`}>
          <Reveal>
            <SectionHeading
              eyebrow="Autres options"
              title="Autres voitures disponibles à Biougra"
            />
          </Reveal>
          <Reveal delay={90} className="mt-10">
            <VehicleGrid vehicles={related} />
          </Reveal>
        </div>
      </section>

      <BookingCTA />
    </>
  );
}
