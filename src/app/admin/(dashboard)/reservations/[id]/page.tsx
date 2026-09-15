import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Phone,
  Car as CarIcon,
  CalendarClock,
  MessageSquareText,
} from "lucide-react";
import { db } from "@/db";
import { cars, reservations } from "@/db/schema";
import {
  formatDateOnly,
  normalizeMoroccanPhone,
  type ReservationStatus,
} from "@/lib/reservation-constants";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ReservationStatusBadge } from "../ReservationStatusBadge";
import { ReservationStatusForm } from "../ReservationStatusForm";

export const metadata: Metadata = {
  title: "Détail de la réservation | MDA CAR Admin",
  robots: { index: false, follow: false },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-steel-dark">
        {label}
      </span>
      <span className="text-[15px] text-white">{value}</span>
    </div>
  );
}

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservationId = Number(id);

  // Never trust a client-supplied id: validate shape, then verify
  // existence server-side before rendering anything derived from it.
  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    notFound();
  }

  const [row] = await db
    .select({
      id: reservations.id,
      customerName: reservations.customerName,
      customerPhone: reservations.customerPhone,
      customerCity: reservations.customerCity,
      pickupDate: reservations.pickupDate,
      returnDate: reservations.returnDate,
      status: reservations.status,
      notes: reservations.notes,
      source: reservations.source,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
      carId: reservations.carId,
      carName: cars.name,
      carBrand: cars.brand,
      carModel: cars.model,
      carYear: cars.year,
    })
    .from(reservations)
    .leftJoin(cars, eq(reservations.carId, cars.id))
    .where(eq(reservations.id, reservationId))
    .limit(1);

  if (!row) {
    notFound();
  }

  const status = row.status as ReservationStatus;

  // Best-effort: preserved in `notes` when the requested vehicle couldn't
  // be matched to a fleet row — see lib/reservations.ts's resolveCarId.
  const requestedVehicleMatch = row.notes?.match(/^Véhicule demandé : (.+)$/m);
  const carLabel = row.carId
    ? [row.carBrand, row.carModel].filter(Boolean).join(" ") ||
      row.carName ||
      "Véhicule"
    : requestedVehicleMatch?.[1] ?? null;
  const message = row.notes?.replace(/^Véhicule demandé : .+$/m, "").trim() || null;

  const normalizedPhone = normalizeMoroccanPhone(row.customerPhone);
  const telHref = `tel:+${normalizedPhone ?? row.customerPhone.replace(/[^0-9]/g, "")}`;
  const whatsappHref = normalizedPhone
    ? `https://wa.me/${normalizedPhone}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/reservations"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Retour aux réservations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {row.customerName}
          </h1>
          <ReservationStatusBadge status={status} />
        </div>
        <p className="mt-1 text-[15px] text-steel">
          Réservation reçue le {formatDateOnly(row.createdAt.toISOString().slice(0, 10))}.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-white">Client</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow label="Nom" value={row.customerName} />
              <InfoRow label="Téléphone" value={row.customerPhone} />
              <InfoRow label="Ville" value={row.customerCity ?? "Non précisée"} />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-white">Location</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow
                label="Véhicule"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CarIcon className="h-4 w-4 text-gold" aria-hidden />
                    {carLabel ?? "Non précisé"}
                    {row.carId && row.carYear ? ` (${row.carYear})` : ""}
                  </span>
                }
              />
              <InfoRow
                label="Dates"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4 text-gold" aria-hidden />
                    Du {formatDateOnly(row.pickupDate)} au {formatDateOnly(row.returnDate)}
                  </span>
                }
              />
            </div>
            {!row.carId && (
              <p className="mt-3 text-[13px] text-steel-dark">
                Ce véhicule ne correspond à aucune fiche du catalogue admin — la
                demande reste rattachée au client, pas au parc.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-white">
              <MessageSquareText className="h-4 w-4 text-gold" aria-hidden />
              Message du client
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-steel">
              {message || "Aucun message."}
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-white">Statut</h2>
            <div className="mt-4">
              <ReservationStatusForm reservationId={row.id} status={status} />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-steel-dark">
              Dernière mise à jour :{" "}
              {formatDateOnly(row.updatedAt.toISOString().slice(0, 10))}
            </p>
          </section>

          <section className="flex flex-col gap-2.5 rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-white">
              Contacter le client
            </h2>
            <a
              href={telHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong px-4 text-[14px] font-medium text-cream hover:border-line-gold hover:text-gold"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Appeler {row.customerPhone}
            </a>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong px-4 text-[14px] font-medium text-cream hover:border-whatsapp/60"
              >
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                WhatsApp
              </a>
            )}
            <p className="mt-1 text-[11px] leading-relaxed text-steel-dark">
              Ces actions utilisent les coordonnées du client, jamais celles de
              MDA CAR.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
