import "server-only";

import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { cars, leads, reservations } from "@/db/schema";
import { RESERVATION_STATUSES, type ReservationStatus } from "./reservation-constants";

/**
 * PHASE 6 — admin dashboard overview.
 *
 * All aggregation lives here (not inline in the page) following the same
 * per-domain lib split used since Phase 2 (cars.ts, reservations.ts,
 * notifications.ts): the dashboard page stays a thin Server Component that
 * calls these in parallel via Promise.all, and every query here is a real
 * database read — no hardcoded numbers, no fake data.
 */

export type FleetStats = {
  total: number;
  available: number;
  unavailable: number;
  published: number;
  hidden: number;
};

/** Counts for the fleet: total, availability split, publication split.
 *  Only two queries run — unavailable/hidden are derived from the total
 *  rather than queried separately, since they are exact complements of
 *  available/published for the same table. */
export async function getFleetStats(): Promise<FleetStats> {
  const [totalRow, availableRow, publishedRow] = await Promise.all([
    db.select({ value: count() }).from(cars),
    db.select({ value: count() }).from(cars).where(eq(cars.isAvailable, true)),
    db.select({ value: count() }).from(cars).where(eq(cars.isHidden, false)),
  ]);

  const total = totalRow[0]?.value ?? 0;
  const available = availableRow[0]?.value ?? 0;
  const published = publishedRow[0]?.value ?? 0;

  return {
    total,
    available,
    unavailable: total - available,
    published,
    hidden: total - published,
  };
}

export type ReservationStatusCount = { status: ReservationStatus; count: number };

/** Reservation counts grouped by status, in one query. Every status from
 *  RESERVATION_STATUSES is always present in the result (with count 0 if
 *  no rows exist yet) so the dashboard never has to guess at a missing
 *  key. `total` is the sum of the breakdown, so it always matches exactly
 *  — no separate "total reservations" query needed. */
export async function getReservationStatusBreakdown(): Promise<{
  breakdown: ReservationStatusCount[];
  total: number;
}> {
  const rows = await db
    .select({ status: reservations.status, value: count() })
    .from(reservations)
    .groupBy(reservations.status);

  const countByStatus = new Map(rows.map((row) => [row.status, row.value]));
  const breakdown = RESERVATION_STATUSES.map((status) => ({
    status,
    count: countByStatus.get(status) ?? 0,
  }));
  const total = breakdown.reduce((sum, row) => sum + row.count, 0);

  return { breakdown, total };
}

/** Monday 00:00 in server-local time — no dedicated business timezone
 *  config exists in the project yet (createdAt everywhere is written with
 *  `defaultNow()` in server-local terms), so this matches that same
 *  convention rather than introducing a new timezone system. */
function startOfWeek(now: Date): Date {
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export type BusinessInsights = {
  reservationsThisWeek: number;
  reservationsThisMonth: number;
  confirmedThisMonth: number;
  completedTotal: number;
  websiteLeads: number;
};

/** Only metrics reliably computable from existing columns — no revenue,
 *  since reservations have no price/payment field (pricePerDay lives on
 *  the car, not the booking, and is never assumed to equal revenue). */
export async function getBusinessInsights(): Promise<BusinessInsights> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [weekRow, monthRow, confirmedMonthRow, completedRow, leadsRow] = await Promise.all([
    db
      .select({ value: count() })
      .from(reservations)
      .where(gte(reservations.createdAt, weekStart)),
    db
      .select({ value: count() })
      .from(reservations)
      .where(gte(reservations.createdAt, monthStart)),
    db
      .select({ value: count() })
      .from(reservations)
      .where(and(gte(reservations.createdAt, monthStart), eq(reservations.status, "confirmed"))),
    db.select({ value: count() }).from(reservations).where(eq(reservations.status, "completed")),
    db.select({ value: count() }).from(leads),
  ]);

  return {
    reservationsThisWeek: weekRow[0]?.value ?? 0,
    reservationsThisMonth: monthRow[0]?.value ?? 0,
    confirmedThisMonth: confirmedMonthRow[0]?.value ?? 0,
    completedTotal: completedRow[0]?.value ?? 0,
    websiteLeads: leadsRow[0]?.value ?? 0,
  };
}

export type MostReservedCar = {
  carId: number;
  label: string;
  reservationCount: number;
} | null;

/** The car with the most reservations, real fleet only (inner join drops
 *  reservations whose carId never resolved to a fleet row — see
 *  resolveCarId's doc comment in reservations.ts for why that happens).
 *  Returns null when there is not enough linked data yet, which the page
 *  renders as an empty state rather than a misleading zero. */
export async function getMostReservedCar(): Promise<MostReservedCar> {
  const rows = await db
    .select({
      carId: reservations.carId,
      carName: cars.name,
      carBrand: cars.brand,
      carModel: cars.model,
      value: count(),
    })
    .from(reservations)
    .innerJoin(cars, eq(reservations.carId, cars.id))
    .groupBy(reservations.carId, cars.name, cars.brand, cars.model)
    .orderBy(desc(count()))
    .limit(1);

  const row = rows[0];
  if (!row || row.carId === null) return null;

  const label = [row.carBrand, row.carModel].filter(Boolean).join(" ") || row.carName;
  return { carId: row.carId, label, reservationCount: row.value };
}
