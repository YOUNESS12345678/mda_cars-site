import "server-only";

import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { cars, reservations } from "@/db/schema";
import { ACTIVE_RESERVATION_STATUSES } from "./reservation-constants";

// Re-exported so server files (API route, actions.ts, pages) can import
// everything from one place. Client components must import directly from
// "@/lib/reservation-constants" instead — this module pulls in the database
// driver via "@/db" and would break the client bundle otherwise.
export * from "./reservation-constants";

export type ReservationRow = typeof reservations.$inferSelect;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Best-effort match between the requested vehicle (from the public site's
 * static catalog, see lib/vehicles.ts) and a real fleet row in the `cars`
 * table (managed in /admin/cars, Phase 2).
 *
 * IMPORTANT — these two catalogs are not the same data source today: the
 * public site intentionally still uses static sample vehicles (Phase 4's
 * brief explicitly forbids forcing a migration of public car data just
 * because reservations now use the Car database — a future phase can
 * unify them). So a reservation frequently will not resolve to a carId,
 * and that is expected, not an error: `carId` stays null and the admin
 * still sees exactly which vehicle was requested via the reservation's
 * notes (see the API route). Only an exact slug or name match (case/accent
 * insensitive) links the two.
 */
export async function resolveCarId(input: {
  carSlug?: string | null;
  vehicleLabel?: string | null;
}): Promise<number | null> {
  const bySlug = input.carSlug ? slugify(input.carSlug) : "";
  const byName = input.vehicleLabel ? slugify(input.vehicleLabel) : "";
  if (!bySlug && !byName) return null;

  const rows = await db
    .select({ id: cars.id, slug: cars.slug, name: cars.name })
    .from(cars);

  const match = rows.find((row) => {
    const rowSlug = slugify(row.slug);
    const rowName = slugify(row.name);
    return (bySlug && rowSlug === bySlug) || (byName && rowName === byName);
  });

  return match?.id ?? null;
}

/**
 * Date-range overlap check for a single car, limited to reservations still
 * considered "active" (new/contacted/confirmed) — cancelled/completed
 * reservations never block anything. Both dates are required on both sides:
 * a reservation missing either date is a flexible inquiry and is never
 * treated as a scheduling conflict. Excludes `excludeReservationId` so an
 * admin can re-confirm the reservation being checked against itself.
 */
export async function hasOverlappingActiveReservation(params: {
  carId: number;
  startDate: string;
  endDate: string;
  excludeReservationId?: number;
}): Promise<boolean> {
  const { carId, startDate, endDate, excludeReservationId } = params;

  const rows = await db
    .select({
      id: reservations.id,
      pickupDate: reservations.pickupDate,
      returnDate: reservations.returnDate,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.carId, carId),
        or(...ACTIVE_RESERVATION_STATUSES.map((s) => eq(reservations.status, s))),
        excludeReservationId ? ne(reservations.id, excludeReservationId) : undefined,
      ),
    );

  return rows.some((row) => {
    if (!row.pickupDate || !row.returnDate) return false;
    // Proper range overlap: NOT (other ends before this starts, or other
    // starts after this ends) — never just compares start dates.
    return !(row.returnDate < startDate || row.pickupDate > endDate);
  });
}
