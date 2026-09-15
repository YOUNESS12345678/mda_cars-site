import "server-only";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { cars } from "@/db/schema";
import type { Vehicle, VehicleImage } from "@/lib/vehicles";
import { CATEGORIES, TRANSMISSIONS, FUEL_TYPES } from "./car-constants";

export type CarRow = typeof cars.$inferSelect;

// Re-exported so server files (actions.ts, page.tsx) can import everything
// from one place. CarForm.tsx (a client component) must import directly
// from "@/lib/car-constants" instead — this module pulls in the database
// driver via "@/db" and would break the client bundle otherwise.
export * from "./car-constants";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Generates a unique slug from brand + model + year, appending -2, -3, …
 *  on collision. Called only from server actions, inside the mutation. */
export async function generateUniqueCarSlug(
  brand: string,
  model: string,
  year: number,
): Promise<string> {
  const base = slugify(`${brand}-${model}-${year}`) || "vehicule";
  let candidate = base;
  let attempt = 1;
  // Small, bounded loop — the fleet size makes runaway collisions unrealistic.
  while (attempt < 50) {
    const existing = await db
      .select({ id: cars.id })
      .from(cars)
      .where(eq(cars.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

/* ------------------------------------------------------------------ */
/*  PHASE 7 — PUBLIC-SITE INTEGRATION                                   */
/*  Public read path for the `cars` table. Before this phase the public  */
/*  site rendered the unrelated static sample in lib/vehicles.ts and     */
/*  admin car edits never appeared publicly (see ADMIN-PHASE-7 report).  */
/*  These functions are the single public read path for the cars table:  */
/*  no second cars table, no duplicated car objects — same schema, same  */
/*  rows the admin dashboard manages.                                    */
/* ------------------------------------------------------------------ */

/** Maps a database car row onto the public site's existing `Vehicle`
 *  shape (src/lib/vehicles.ts) so VehicleCard/VehicleGrid/VehicleGallery/
 *  VehicleSpecs — and their design — don't need to change at all; only
 *  the data source feeding them does. Values are narrowed against the
 *  same CATEGORIES/TRANSMISSIONS/FUEL_TYPES the admin form already
 *  validates against, with a safe fallback for any row saved before that
 *  validation existed. */
function toPublicVehicle(row: CarRow): Vehicle {
  const category = CATEGORIES.includes(row.category as (typeof CATEGORIES)[number])
    ? (row.category as Vehicle["category"])
    : "Citadine";
  const transmission = TRANSMISSIONS.includes(
    row.transmission as (typeof TRANSMISSIONS)[number],
  )
    ? (row.transmission as Vehicle["transmission"])
    : "Manuelle";
  const fuel = FUEL_TYPES.includes(row.fuelType as (typeof FUEL_TYPES)[number])
    ? (row.fuelType as Vehicle["fuel"])
    : "Essence";

  const storedImages = (row.images ?? []).filter(Boolean);
  const urls = storedImages.length > 0 ? storedImages : row.imageUrl ? [row.imageUrl] : [];
  const images: VehicleImage[] =
    urls.length > 0
      ? urls.map((src) => ({
          src,
          alt: `${row.name} en location chez MDA CAR à Biougra et Agadir`,
        }))
      : [
          {
            // Defensive fallback only: the admin form doesn't currently
            // require at least one image, so a car saved without one must
            // still render (VehicleGallery indexes into this array) rather
            // than crash the public page.
            src: "/images/mda-car-biougra-route-souss-massa.jpg",
            alt: `${row.name} — photo à venir — MDA CAR Biougra`,
          },
        ];

  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? "",
    model: row.model ?? "",
    category,
    transmission,
    fuel,
    seats: row.seats ?? 5,
    pricePerDay: row.pricePerDay != null ? `${row.pricePerDay} MAD/jour` : null,
    shortDescription: (row.description ?? "").slice(0, 140),
    description: row.description ?? "",
    images,
    isAvailable: row.isAvailable,
  };
}

/** Public visibility rule (Phase 2's own convention — reused, not
 *  reinvented): `isHidden` is the public on/off switch, toggled from
 *  /admin/cars either directly or via the "publish" checkbox in
 *  CarForm (isPublished = !isHidden). `isAvailable` is a separate
 *  "currently available" flag the admin can toggle without unpublishing
 *  the car; the public fleet pages don't currently render a distinct
 *  "unavailable" state (no such design exists yet), so — per the brief's
 *  instruction not to invent new UI/business rules — it is not filtered
 *  on here, only exposed on the row for a future phase to use. */
async function fetchPublishedCars(): Promise<CarRow[]> {
  return db.select().from(cars).where(eq(cars.isHidden, false)).orderBy(cars.createdAt);
}

/** Cached, tagged read of the published fleet. The admin car mutations
 *  (create/update/delete/toggle availability/toggle visibility) call
 *  `updateTag("cars-public")` after a successful write, so public
 *  pages pick up the change without invalidating unrelated routes. */
export const getPublishedCars = unstable_cache(
  async (): Promise<Vehicle[]> => (await fetchPublishedCars()).map(toPublicVehicle),
  ["cars-public"],
  { tags: ["cars-public"] },
);

export async function getPublishedCarBySlug(slug: string): Promise<Vehicle | undefined> {
  const all = await getPublishedCars();
  return all.find((v) => v.slug === slug);
}

export async function getRelatedPublishedCars(
  slug: string,
  count = 3,
): Promise<Vehicle[]> {
  const all = await getPublishedCars();
  return all.filter((v) => v.slug !== slug).slice(0, count);
}
