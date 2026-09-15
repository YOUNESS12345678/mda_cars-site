import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, or, count } from "drizzle-orm";
import { CalendarClock, Search, Phone, MapPin, Car as CarIcon } from "lucide-react";
import { db } from "@/db";
import { cars, reservations } from "@/db/schema";
import {
  formatDateOnly,
  isValidReservationStatus,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUSES,
  type ReservationStatus,
} from "@/lib/reservation-constants";
import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { ReservationStatusForm } from "./ReservationStatusForm";

export const metadata: Metadata = {
  title: "Réservations | MDA CAR Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "", status = "", page: pageParam = "" } = await searchParams;

  const query = q.trim();
  const statusFilter = isValidReservationStatus(status) ? status : "";
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  const conditions = [];
  if (query) {
    conditions.push(
      or(
        ilike(reservations.customerName, `%${query}%`),
        ilike(reservations.customerPhone, `%${query}%`),
        ilike(cars.name, `%${query}%`),
        ilike(cars.brand, `%${query}%`),
        ilike(cars.model, `%${query}%`),
      ),
    );
  }
  if (statusFilter) {
    conditions.push(eq(reservations.status, statusFilter));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: reservations.id,
        customerName: reservations.customerName,
        customerPhone: reservations.customerPhone,
        customerCity: reservations.customerCity,
        pickupDate: reservations.pickupDate,
        returnDate: reservations.returnDate,
        status: reservations.status,
        notes: reservations.notes,
        createdAt: reservations.createdAt,
        carName: cars.name,
        carBrand: cars.brand,
        carModel: cars.model,
      })
      .from(reservations)
      .leftJoin(cars, eq(reservations.carId, cars.id))
      .where(where)
      .orderBy(desc(reservations.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ value: count() })
      .from(reservations)
      .leftJoin(cars, eq(reservations.carId, cars.id))
      .where(where),
  ]);

  const total = totalRows[0]?.value ?? 0;
  const hasFilters = Boolean(query || statusFilter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusFilter) params.set("status", statusFilter);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/reservations?${qs}` : "/admin/reservations";
  }

  function carLabel(row: (typeof rows)[number]): string {
    if (row.carName) {
      return [row.carBrand, row.carModel].filter(Boolean).join(" ") || row.carName;
    }
    // Best-effort: the requested vehicle is preserved in `notes` when it
    // couldn't be matched to a fleet row — see lib/reservations.ts.
    const match = row.notes?.match(/^Véhicule demandé : (.+)$/m);
    return match ? match[1] : "Véhicule non précisé";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Réservations</h1>
        <p className="mt-1 text-[15px] text-steel">
          Suivi des demandes de réservation et des informations clients.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 rounded-lg border border-line bg-coal p-4 sm:flex-row sm:items-center"
        method="get"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark" aria-hidden />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Nom, téléphone ou véhicule…"
            className="w-full rounded-lg border border-line bg-night py-2.5 pl-9 pr-3.5 text-[15px] text-white placeholder:text-steel-dark focus:border-line-gold focus:outline-none"
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-lg border border-line bg-night px-3.5 py-2.5 text-[14px] text-white focus:border-line-gold focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          {RESERVATION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {RESERVATION_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line-gold px-4 text-[14px] font-medium text-gold hover:bg-graphite/60"
        >
          Filtrer
        </button>
        {hasFilters && (
          <Link
            href="/admin/reservations"
            className="inline-flex h-11 items-center justify-center px-2 text-[13px] font-medium text-steel hover:text-white"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong bg-coal px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line-gold bg-night text-gold">
            <CalendarClock className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-[15px] font-semibold text-white">
            {hasFilters
              ? "Aucune réservation ne correspond à ces critères."
              : "Aucune réservation pour le moment."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => {
            const status = row.status as ReservationStatus;
            return (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-lg border border-line bg-coal p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/admin/reservations/${row.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-1.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[16px] font-semibold text-white">
                      {row.customerName}
                    </span>
                    <ReservationStatusBadge status={status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-steel">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {row.customerPhone}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CarIcon className="h-3.5 w-3.5" aria-hidden />
                      {carLabel(row)}
                    </span>
                    <span>
                      Du {formatDateOnly(row.pickupDate)} au {formatDateOnly(row.returnDate)}
                    </span>
                    <span className="text-steel-dark">
                      Reçue le {formatDateOnly(row.createdAt.toISOString().slice(0, 10))}
                    </span>
                  </div>
                </Link>

                <ReservationStatusForm reservationId={row.id} status={status} compact />
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-steel">
          <span>
            Page {page} sur {totalPages} — {total} réservation{total > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-lg border border-line px-3 py-1.5 hover:border-line-gold hover:text-gold"
              >
                Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-lg border border-line px-3 py-1.5 hover:border-line-gold hover:text-gold"
              >
                Suivant
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
