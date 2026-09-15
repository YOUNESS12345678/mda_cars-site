import type { Vehicle } from "@/lib/vehicles";

/**
 * Specs block — only fields with real data are rendered; unknown values use
 * the mandated placeholders, nothing is ever invented.
 */
export function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Catégorie", value: vehicle.category },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Carburant", value: vehicle.fuel },
    { label: "Places", value: `${vehicle.seats} places` },
    {
      label: "Prix par jour",
      value: vehicle.pricePerDay ? (
        <span className="text-gold">{vehicle.pricePerDay}</span>
      ) : (
        <span className="inline-block rounded border border-line-gold px-2 py-0.5 text-[12px] font-semibold text-gold">
          Sur demande
        </span>
      ),
    },
  ];

  return (
    <div>
      <dl className="divide-y divide-line rounded-lg border border-line bg-coal">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <dt className="text-[13px] font-medium uppercase tracking-[0.14em] text-steel">
              {row.label}
            </dt>
            <dd className="text-right text-[15px] font-semibold text-white">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[13px] leading-relaxed text-steel-dark">
        Conditions de location communiquées par l’agence, avant confirmation
        de la réservation.
      </p>
    </div>
  );
}
