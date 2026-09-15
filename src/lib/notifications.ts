import "server-only";

import { desc, eq, count, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cars, notifications, reservations } from "@/db/schema";
import { NEW_RESERVATION_NOTIFICATION } from "./notification-constants";

// Re-exported so server files (layout, page, actions) can import
// everything from one place. Any client component must import directly
// from "@/lib/notification-constants" instead — this module pulls in the
// database driver via "@/db" and would break the client bundle otherwise.
// Same split Phase 2/3/4 used for cars/business-settings/reservations.
export * from "./notification-constants";

export type NotificationRow = typeof notifications.$inferSelect;

/** A notification joined with just enough reservation/car context to
 *  render a preview ("Ahmed — Dacia Logan") without duplicating that data
 *  into the notifications table itself — the reservation stays the single
 *  source of truth (see schema.ts's comment on the notifications table). */
export type NotificationWithContext = NotificationRow & {
  customerName: string | null;
  vehicleLabel: string | null;
};

// Narrow structural type (just the one method this function needs) so it
// accepts either the plain `db` client or a db.transaction(...) handle
// interchangeably, without depending on drizzle's internal transaction
// type shape.
type InsertOnlyExecutor = Pick<typeof db, "insert">;

function vehicleLabelFor(row: {
  carName: string | null;
  carBrand: string | null;
  carModel: string | null;
  notes: string | null;
}): string | null {
  if (row.carName) {
    return [row.carBrand, row.carModel].filter(Boolean).join(" ") || row.carName;
  }
  const match = row.notes?.match(/^Véhicule demandé : (.+)$/m);
  return match ? match[1] : null;
}

/**
 * Creates the NEW_RESERVATION admin notification for a just-created
 * reservation. Server-only, never reachable from the browser — the public
 * reservation API route is the only caller (see api/reservations/route.ts),
 * and it always runs this inside the same db.transaction() as the
 * reservation insert so the two can never exist independently of each
 * other (see §8 of the Phase 5 brief).
 */
export async function createNewReservationNotification(
  executor: InsertOnlyExecutor,
  reservationId: number,
): Promise<void> {
  await executor.insert(notifications).values({
    type: "new_reservation",
    title: NEW_RESERVATION_NOTIFICATION.title,
    message: NEW_RESERVATION_NOTIFICATION.message,
    reservationId,
    isRead: false,
  });
}

/** Number of unread notifications. Always computed from the database,
 *  never cached/hard-coded — used for the bell badge. */
export async function getUnreadNotificationCount(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(notifications)
    .where(eq(notifications.isRead, false));
  return rows[0]?.value ?? 0;
}

async function withContext(rows: NotificationRow[]): Promise<NotificationWithContext[]> {
  if (rows.length === 0) return [];

  const reservationIds = [...new Set(rows.map((r) => r.reservationId).filter((id): id is number => id !== null))];
  const contextRows = reservationIds.length
    ? await db
        .select({
          id: reservations.id,
          customerName: reservations.customerName,
          notes: reservations.notes,
          carName: cars.name,
          carBrand: cars.brand,
          carModel: cars.model,
        })
        .from(reservations)
        .leftJoin(cars, eq(reservations.carId, cars.id))
        .where(inArray(reservations.id, reservationIds))
    : [];

  const byReservationId = new Map(contextRows.map((r) => [r.id, r]));

  return rows.map((row) => {
    const ctx = row.reservationId ? byReservationId.get(row.reservationId) : undefined;
    return {
      ...row,
      customerName: ctx?.customerName ?? null,
      vehicleLabel: ctx ? vehicleLabelFor(ctx) : null,
    };
  });
}

/** Most recent notifications for the dropdown. Deliberately limited —
 *  never loads full history for a small UI element (see §34). */
export async function getRecentNotifications(
  limit = 10,
): Promise<NotificationWithContext[]> {
  const rows = await db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return withContext(rows);
}

const NOTIFICATIONS_PAGE_SIZE = 20;

/** Paginated notifications for the full /admin/notifications page. */
export async function getNotificationsPage(page: number): Promise<{
  rows: NotificationWithContext[];
  total: number;
  totalPages: number;
}> {
  const safePage = Math.max(1, page);

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(NOTIFICATIONS_PAGE_SIZE)
      .offset((safePage - 1) * NOTIFICATIONS_PAGE_SIZE),
    db.select({ value: count() }).from(notifications),
  ]);

  const total = totalRows[0]?.value ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / NOTIFICATIONS_PAGE_SIZE));
  const withCtx = await withContext(rows);

  return { rows: withCtx, total, totalPages };
}

/** Looks up a single notification by id. Returns null (not a throw) for a
 *  missing/invalid id so callers can return a safe French error instead of
 *  leaking a stack trace — see §27/§28 of the Phase 5 brief. */
export async function getNotificationById(
  id: number,
): Promise<NotificationRow | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Marks one notification as read. The server determines `readAt` — the
 *  client can never set it (see §14). No-op (not an error) if it was
 *  already read, so double-clicks/retries stay safe. */
export async function markNotificationRead(id: number): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, id));
}

/** Marks every unread notification as read in one statement. Single-admin
 *  architecture today (see schema.ts's comment on the notifications
 *  table), so "belonging to the authenticated admin" is every notification
 *  — if a future phase adds multiple admin accounts, scope this query by
 *  adminUserId at that point rather than guessing at the shape now. */
export async function markAllNotificationsRead(): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.isRead, false));
}
