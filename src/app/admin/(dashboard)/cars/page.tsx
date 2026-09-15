import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Car, Plus, Search } from "lucide-react";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { CATEGORIES } from "@/lib/cars";
import { CarRowActions } from "./CarRowActions";

export const metadata: Metadata = {
  title: "Voitures | MDA CAR Admin",
  robots: { index: false, follow: false },
};

type SearchParams = {
  q?: string;
  availability?: string;
  published?: string;
};

function Badge({ tone, children }: { tone: "green" | "red" | "gray"; children: React.ReactNode }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : tone === "red"
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : "border-line-strong bg-graphite text-steel";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "", availability = "", published = "" } = await searchParams;

  const conditions = [];
  const query = q.trim();
  if (query) {
    conditions.push(
      or(ilike(cars.brand, `%${query}%`), ilike(cars.model, `%${query}%`), ilike(cars.name, `%${query}%`)),
    );
  }
  if (availability === "available") conditions.push(eq(cars.isAvailable, true));
  if (availability === "unavailable") conditions.push(eq(cars.isAvailable, false));
  if (published === "published") conditions.push(eq(cars.isHidden, false));
  if (published === "hidden") conditions.push(eq(cars.isHidden, true));

  const rows = await db
    .select()
    .from(cars)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(cars.createdAt));

  const hasFilters = Boolean(query || availability || published);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Voitures</h1>
          <p className="mt-1 text-[15px] text-steel">
            Ajout, modification, prix et disponibilité des véhicules.
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-night transition-colors duration-200 hover:bg-gold-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter un véhicule
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-lg border border-line bg-coal p-4 sm:flex-row sm:items-center" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark" aria-hidden />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Rechercher un véhicule…"
            className="w-full rounded-lg border border-line bg-night py-2.5 pl-9 pr-3.5 text-[15px] text-white placeholder:text-steel-dark focus:border-line-gold focus:outline-none"
          />
        </div>
        <select
          name="availability"
          defaultValue={availability}
          className="rounded-lg border border-line bg-night px-3.5 py-2.5 text-[14px] text-white focus:border-line-gold focus:outline-none"
        >
          <option value="">Toutes disponibilités</option>
          <option value="available">Disponible</option>
          <option value="unavailable">Indisponible</option>
        </select>
        <select
          name="published"
          defaultValue={published}
          className="rounded-lg border border-line bg-night px-3.5 py-2.5 text-[14px] text-white focus:border-line-gold focus:outline-none"
        >
          <option value="">Publié + masqué</option>
          <option value="published">Publié</option>
          <option value="hidden">Masqué</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line-gold px-4 text-[14px] font-medium text-gold hover:bg-graphite/60"
        >
          Filtrer
        </button>
        {hasFilters && (
          <Link
            href="/admin/cars"
            className="inline-flex h-11 items-center justify-center px-2 text-[13px] font-medium text-steel hover:text-white"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong bg-coal px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line-gold bg-night text-gold">
            <Car className="h-6 w-6" aria-hidden />
          </span>
          {hasFilters ? (
            <p className="text-[15px] font-semibold text-white">Aucun véhicule ne correspond à ces critères.</p>
          ) : (
            <>
              <p className="text-[15px] font-semibold text-white">
                Vous n&apos;avez encore aucun véhicule.
              </p>
              <Link
                href="/admin/cars/new"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-night hover:bg-gold-hover"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Ajouter un véhicule
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((car) => (
            <div
              key={car.id}
              className="flex flex-col gap-4 rounded-lg border border-line bg-coal p-4 sm:flex-row sm:items-center"
            >
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg border border-line bg-night sm:h-20 sm:w-28">
                {car.imageUrl ? (
                  // Admin-pasted URLs aren't known ahead of time, so a plain
                  // <img> is used here rather than next/image (which would
                  // require allow-listing every possible source domain).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand ?? ""} ${car.model ?? car.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-steel-dark">
                    <Car className="h-6 w-6" aria-hidden />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[16px] font-semibold text-white">
                    {car.brand} {car.model}
                    {car.year ? ` (${car.year})` : ""}
                  </span>
                  <Badge tone={car.isAvailable ? "green" : "red"}>
                    {car.isAvailable ? "Disponible" : "Indisponible"}
                  </Badge>
                  <Badge tone={car.isHidden ? "gray" : "green"}>
                    {car.isHidden ? "Masqué" : "Publié"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-steel">
                  <span>{car.pricePerDay != null ? `${car.pricePerDay} MAD/jour` : "Prix non défini"}</span>
                  {car.transmission && <span>{car.transmission}</span>}
                  {car.fuelType && <span>{car.fuelType}</span>}
                  {car.seats != null && <span>{car.seats} places</span>}
                  {car.category && CATEGORIES.includes(car.category as (typeof CATEGORIES)[number]) && (
                    <span>{car.category}</span>
                  )}
                  <span className="text-steel-dark">
                    Ajouté le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(car.createdAt)}
                  </span>
                </div>
              </div>

              <CarRowActions
                carId={car.id}
                isAvailable={car.isAvailable}
                isHidden={car.isHidden}
                carLabel={`${car.brand ?? ""} ${car.model ?? car.name}${car.year ? ` (${car.year})` : ""}`.trim()}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
