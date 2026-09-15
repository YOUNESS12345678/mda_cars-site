import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Fuel, Settings2, Users } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";
import { WhatsAppButton } from "./WhatsAppButton";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const href = `/nos-voitures/${vehicle.slug}`;
  const image = vehicle.images[0];

  return (
    <article className={`group flex flex-col overflow-hidden rounded-lg border ${vehicle.isAvailable === false ? "border-red-500/40" : "border-line"} bg-coal transition-all duration-300 hover:border-line-gold hover:shadow-[0_18px_50px_-20px_rgba(212,175,55,0.25)]`}>
      <div className="relative">
      <Link
        href={href}
        aria-label={`Voir la fiche de ${vehicle.name}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          loading="lazy"
          sizes="(min-width: 1440px) 30vw, (min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute bottom-3 right-3 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-line-strong bg-night/70 text-gold opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </Link>
      {vehicle.isAvailable === false && (
        <span className="absolute left-3 top-3 rounded-full border border-red-400/50 bg-red-950/90 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.08em] text-red-200">
          Indisponible
        </span>
      )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">
            <span className="hairline-gold" aria-hidden />
            {vehicle.category}
          </p>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-white">
            <Link
              href={href}
              className="transition-colors duration-200 hover:text-gold"
            >
              {vehicle.name}
            </Link>
          </h3>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-medium text-steel">
          <li className="inline-flex items-center gap-1.5">
            <Settings2 className="h-4 w-4 text-gold/80" aria-hidden />
            {vehicle.transmission}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Fuel className="h-4 w-4 text-gold/80" aria-hidden />
            {vehicle.fuel}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gold/80" aria-hidden />
            {vehicle.seats} places
          </li>
        </ul>

        <div className="mt-auto space-y-4 border-t border-line pt-4">
          <p className="text-[14px] text-steel">
            Prix / jour :{" "}
            {vehicle.pricePerDay ? (
              <span className="font-semibold text-gold">
                {vehicle.pricePerDay}
              </span>
            ) : (
              <span className="inline-block rounded border border-line-gold px-2 py-0.5 text-[12px] font-semibold text-gold">
                Sur demande
              </span>
            )}
          </p>
          <div className="flex flex-col gap-2.5">
            {vehicle.isAvailable === false ? (
              <span className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-red-500/40 px-5 py-2 text-[14px] font-semibold text-red-200">
                Véhicule indisponible
              </span>
            ) : (
              <WhatsAppButton
                label="Réserver cette voiture"
                variant="gold"
                message={`Bonjour MDA CAR, je souhaite réserver la ${vehicle.name}. Est-elle disponible ? Merci.`}
                className="w-full"
              />
            )}
            <Link
              href={href}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line-strong px-5 py-2 text-[14px] font-semibold text-cream transition-colors duration-200 hover:border-line-gold hover:text-gold"
            >
              Voir les détails
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
