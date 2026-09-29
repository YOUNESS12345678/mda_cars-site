/**
 * Client-safe notification constants, types, and formatting.
 *
 * Deliberately has NO `server-only` import and NO database import — same
 * split Phase 2/3/4 used for cars/business-settings/reservations
 * (`*-constants.ts` vs. the database-touching module). Anything that
 * touches the database lives in `notifications.ts` instead.
 */

/** Controlled set of notification types. Phase 5 only ever creates
 *  "new_reservation" — the union type exists so a future phase can add a
 *  new event without loosening this to an arbitrary string. */
export const NOTIFICATION_TYPES = ["new_reservation"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_reservation: "Nouvelle réservation",
};

export function isValidNotificationType(
  value: unknown,
): value is NotificationType {
  return (
    typeof value === "string" &&
    (NOTIFICATION_TYPES as readonly string[]).includes(value)
  );
}

/** French, admin-facing copy for the one event this phase implements. */
export const NEW_RESERVATION_NOTIFICATION = {
  title: "Nouvelle réservation",
  message: "Une nouvelle demande de réservation a été reçue.",
} as const;

/** Short relative-time label ("Il y a 2 minutes") for the dropdown/list.
 *  Falls back to a plain date once it's more than a day old, so old
 *  notifications don't show an absurd "Il y a 3200 minutes". */
export function formatRelativeTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  }
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    date,
  );
}

/** Caps the unread badge so it never grows unbounded in the UI. */
export function formatUnreadCount(count: number): string {
  const safe = Math.max(0, count);
  return safe > 99 ? "99+" : String(safe);
}
