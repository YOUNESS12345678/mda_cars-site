import Link from "next/link";
import {
  Car,
  CheckCircle2,
  Eye,
  CalendarClock,
  Inbox,
  BadgeCheck,
  Bell,
  PlusCircle,
  Settings as SettingsIcon,
  Trophy,
  ListChecks,
} from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cars, reservations } from "@/db/schema";
import {
  RESERVATION_STATUS_LABELS,
  formatDateOnly,
  type ReservationStatus,
} from "@/lib/reservation-constants";
import { ReservationStatusBadge } from "./reservations/ReservationStatusBadge";
import { getRecentNotifications } from "@/lib/notifications";
import { formatRelativeTime } from "@/lib/notification-constants";
import { openNotificationAction } from "./notifications/actions";
import { SubmitStatusButton } from "@/components/admin/SubmitStatusButton";
import {
  getBusinessInsights,
  getFleetStats,
  getMostReservedCar,
  getReservationStatusBreakdown,
} from "@/lib/dashboard";

async function getRecentReservations() {
  return db
    .select({
      id: reservations.id,
      customerName: reservations.customerName,
      status: reservations.status,
      notes: reservations.notes,
      pickupDate: reservations.pickupDate,
      returnDate: reservations.returnDate,
      createdAt: reservations.createdAt,
      carName: cars.name,
      carBrand: cars.brand,
      carModel: cars.model,
    })
    .from(reservations)
    .leftJoin(cars, eq(reservations.carId, cars.id))
    .orderBy(desc(reservations.createdAt))
    .limit(5);
}

function carLabel(row: {
  carName: string | null;
  carBrand: string | null;
  carModel: string | null;
  notes: string | null;
}): string {
  if (row.carName) {
    return [row.carBrand, row.carModel].filter(Boolean).join(" ") || row.carName;
  }
  const match = row.notes?.match(/^Véhicule demandé : (.+)$/m);
  return match ? match[1] : "Véhicule non précisé";
}

const STATUS_BAR_COLOR: Record<ReservationStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-amber-500",
  confirmed: "bg-emerald-500",
  cancelled: "bg-red-500",
  completed: "bg-steel-dark",
};

export default async function AdminOverviewPage() {
  const [fleet, statusData, insights, mostReservedCar, recentReservations, recentNotifications] =
    await Promise.all([
      getFleetStats(),
      getReservationStatusBreakdown(),
      getBusinessInsights(),
      getMostReservedCar(),
      getRecentReservations(),
      getRecentNotifications(5),
    ]);

  const newCount = statusData.breakdown.find((s) => s.status === "new")?.count ?? 0;
  const confirmedCount = statusData.breakdown.find((s) => s.status === "confirmed")?.count ?? 0;

  const statCards = [
    {
      label: "Total des voitures",
      value: fleet.total,
      icon: Car,
      note: "Ensemble du parc enregistré.",
    },
    {
      label: "Voitures disponibles",
      value: fleet.available,
      icon: CheckCircle2,
      note: "Prêtes à être réservées.",
    },
    {
      label: "Voitures publiées",
      value: fleet.published,
      icon: Eye,
      note: "Visibles sur le site public.",
    },
    {
      label: "Réservations",
      value: statusData.total,
      icon: CalendarClock,
      note: "Toutes les demandes reçues.",
    },
    {
      label: "Nouvelles réservations",
      value: newCount,
      icon: Inbox,
      note: "Demandes pas encore contactées.",
    },
    {
      label: "Réservations confirmées",
      value: confirmedCount,
      icon: BadgeCheck,
      note: "Confirmées avec le client.",
    },
  ];

  const quickActions = [
    { href: "/admin/cars/new", label: "Ajouter une voiture", icon: PlusCircle },
    { href: "/admin/reservations", label: "Voir les réservations", icon: CalendarClock },
    { href: "/admin/notifications", label: "Voir les notifications", icon: Bell },
    { href: "/admin/settings", label: "Modifier les paramètres", icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Tableau de bord
        </h1>
        <p className="mt-1 text-[15px] text-steel">
          Vue d’ensemble de votre activité MDA CAR.
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-lg border border-line bg-coal p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel-dark">
                {stat.label}
              </span>
              <stat.icon className="h-5 w-5 text-gold" aria-hidden />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              {stat.value}
            </span>
            <p className="text-[13px] leading-relaxed text-steel-dark">
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2 rounded-lg border border-line-strong bg-coal px-4 py-2.5 text-[13px] font-medium text-cream transition-colors duration-200 hover:border-line-gold hover:text-gold"
          >
            <action.icon className="h-4 w-4" aria-hidden />
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Reservation status overview */}
          <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gold" aria-hidden />
              <h2 className="text-[15px] font-semibold text-white">
                Statut des réservations
              </h2>
            </div>
            {statusData.total === 0 ? (
              <p className="mt-4 text-[14px] text-steel-dark">
                Aucune réservation pour le moment.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {statusData.breakdown.map((row) => {
                  const percent = Math.round((row.count / statusData.total) * 100);
                  return (
                    <li key={row.status}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-cream">
                          {RESERVATION_STATUS_LABELS[row.status]}
                        </span>
                        <span className="text-steel-dark">{row.count}</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-graphite">
                        <div
                          className={`h-full rounded-full ${STATUS_BAR_COLOR[row.status]}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Recent reservations */}
          <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">
                Réservations récentes
              </h2>
              <Link
                href="/admin/reservations"
                className="text-[13px] font-medium text-gold hover:text-gold-hover"
              >
                Voir tout
              </Link>
            </div>
            {recentReservations.length === 0 ? (
              <p className="mt-4 text-[14px] text-steel-dark">
                Aucune réservation pour le moment.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {recentReservations.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`/admin/reservations/${row.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-4 py-3 hover:border-line-gold"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[14px] text-white">
                          {row.customerName} — {carLabel(row)}
                        </span>
                        <span className="text-[12px] text-steel-dark">
                          {formatDateOnly(row.pickupDate)} → {formatDateOnly(row.returnDate)}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-[12px] text-steel-dark">
                          {formatDateOnly(row.createdAt.toISOString().slice(0, 10))}
                        </span>
                        <ReservationStatusBadge status={row.status as ReservationStatus} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          {/* Recent notifications */}
          <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">
                Notifications récentes
              </h2>
              <Link
                href="/admin/notifications"
                className="text-[13px] font-medium text-gold hover:text-gold-hover"
              >
                Voir tout
              </Link>
            </div>
            {recentNotifications.length === 0 ? (
              <p className="mt-4 text-[14px] text-steel-dark">
                Aucune notification.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {recentNotifications.map((item) => (
                  <li key={item.id} className="rounded-lg border border-line">
                    <form action={openNotificationAction}>
                      <input type="hidden" name="notificationId" value={item.id} />
                      <SubmitStatusButton
                        className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-graphite/60 ${
                          !item.isRead ? "bg-graphite/30" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {!item.isRead && (
                            <span
                              aria-hidden
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                            />
                          )}
                          <span
                            className={`text-[13px] ${!item.isRead ? "font-semibold text-white" : "font-medium text-steel"}`}
                          >
                            {item.title}
                          </span>
                        </span>
                        {(item.customerName || item.vehicleLabel) && (
                          <span className="pl-3.5 text-[12px] text-steel-dark">
                            {[item.customerName, item.vehicleLabel].filter(Boolean).join(" — ")}
                          </span>
                        )}
                        <span className="pl-3.5 text-[11px] text-steel-dark">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </SubmitStatusButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fleet overview */}
          <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-white">
              Aperçu du parc
            </h2>
            {fleet.total === 0 ? (
              <p className="mt-4 text-[14px] text-steel-dark">
                Aucune voiture enregistrée.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2 text-[13px]">
                <li className="flex items-center justify-between">
                  <span className="text-steel">Total</span>
                  <span className="font-medium text-white">{fleet.total}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-steel">Disponibles</span>
                  <span className="font-medium text-white">{fleet.available}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-steel">Indisponibles</span>
                  <span className="font-medium text-white">{fleet.unavailable}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-steel">Publiées</span>
                  <span className="font-medium text-white">{fleet.published}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-steel">Masquées</span>
                  <span className="font-medium text-white">{fleet.hidden}</span>
                </li>
              </ul>
            )}
          </div>

          {/* Business insights */}
          <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-white">
              Activité
            </h2>
            <ul className="mt-4 flex flex-col gap-2 text-[13px]">
              <li className="flex items-center justify-between">
                <span className="text-steel">Réservations cette semaine</span>
                <span className="font-medium text-white">{insights.reservationsThisWeek}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-steel">Réservations ce mois-ci</span>
                <span className="font-medium text-white">{insights.reservationsThisMonth}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-steel">Confirmées ce mois-ci</span>
                <span className="font-medium text-white">{insights.confirmedThisMonth}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-steel">Réservations terminées</span>
                <span className="font-medium text-white">{insights.completedTotal}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-steel">Demandes reçues (site)</span>
                <span className="font-medium text-white">{insights.websiteLeads}</span>
              </li>
            </ul>

            <div className="mt-4 border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gold" aria-hidden />
                <span className="text-[13px] font-medium text-cream">
                  Voiture la plus réservée
                </span>
              </div>
              {mostReservedCar ? (
                <p className="mt-1.5 text-[13px] text-steel">
                  {mostReservedCar.label} —{" "}
                  <span className="font-medium text-white">
                    {mostReservedCar.reservationCount} réservation
                    {mostReservedCar.reservationCount > 1 ? "s" : ""}
                  </span>
                </p>
              ) : (
                <p className="mt-1.5 text-[13px] text-steel-dark">
                  Pas encore assez de données.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
