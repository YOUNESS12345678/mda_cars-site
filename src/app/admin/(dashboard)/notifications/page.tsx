import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getNotificationsPage, getUnreadNotificationCount } from "@/lib/notifications";
import { isValidNotificationType, type NotificationType } from "@/lib/notification-constants";
import { NotificationRow, type NotificationListItem } from "./NotificationRow";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const metadata: Metadata = {
  title: "Notifications | MDA CAR Admin",
  // Admin-only feature, zero SEO surface — same posture as every other
  // /admin/(dashboard) page (see §38/§39 of the Phase 5 brief).
  robots: { index: false, follow: false },
};

type SearchParams = { page?: string };

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page: pageParam = "" } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);

  const [{ rows, total, totalPages }, unreadTotal] = await Promise.all([
    getNotificationsPage(page),
    getUnreadNotificationCount(),
  ]);

  const items: NotificationListItem[] = rows.map((row) => ({
    id: row.id,
    type: (isValidNotificationType(row.type) ? row.type : "new_reservation") as NotificationType,
    title: row.title,
    message: row.message,
    preview:
      row.customerName || row.vehicleLabel
        ? [row.customerName, row.vehicleLabel].filter(Boolean).join(" — ")
        : null,
    isRead: row.isRead,
    reservationId: row.reservationId,
    createdDate: new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(row.createdAt),
  }));

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/notifications?${qs}` : "/admin/notifications";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Notifications
          </h1>
          <p className="mt-1 text-[15px] text-steel">
            Alertes admin — nouvelles réservations et événements du tableau
            de bord.
          </p>
        </div>
        <MarkAllReadButton disabled={unreadTotal === 0} />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong bg-coal px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line-gold bg-night text-gold">
            <Bell className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-[15px] font-semibold text-white">
            Aucune notification.
          </p>
        </div>
      ) : (
        <>
          {unreadTotal === 0 && (
            <p className="text-[13px] text-steel-dark">
              Aucune nouvelle notification.
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] text-steel">
          <span>
            Page {page} sur {totalPages} — {total} notification{total > 1 ? "s" : ""}
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
