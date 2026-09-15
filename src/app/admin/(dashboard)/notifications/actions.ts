"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth/require-admin";
import {
  getNotificationById,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import type { NotificationActionState } from "./action-state";

/** Revalidates every place unread state is shown: the bell (rendered in
 *  the shared dashboard layout for every /admin/* page) and the full
 *  notifications page/list. */
function revalidateNotificationSurfaces() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/notifications");
}

/**
 * Opens a notification: marks it read, then navigates to the reservation
 * it references. A single server action rather than two round trips, so
 * the "read" state and the navigation can never get out of sync.
 *
 * Authenticated + authorized via requireAdminAction. Never trusts a
 * client-supplied notification id or reservation id — both are re-checked
 * against the database before anything happens (see §13/§27 of the Phase
 * 5 brief).
 */
export async function openNotificationAction(formData: FormData): Promise<void> {
  await requireAdminAction();

  const id = Number(formData.get("notificationId"));
  const notification = await getNotificationById(id);

  if (!notification) {
    // Nothing sensible to open — send the admin back to the list instead
    // of throwing a raw error for what is very likely a stale link.
    redirect("/admin/notifications");
  }

  if (!notification.isRead) {
    await markNotificationRead(notification.id);
    revalidateNotificationSurfaces();
  }

  if (!notification.reservationId) {
    redirect("/admin/notifications");
  }

  redirect(`/admin/reservations/${notification.reservationId}`);
}

/** Marks a single notification as read without navigating away — used by
 *  the full notifications page's per-row "Marquer comme lu" action. */
export async function markOneReadAction(
  _prevState: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  await requireAdminAction();

  const id = Number(formData.get("notificationId"));
  const notification = await getNotificationById(id);
  if (!notification) {
    return { error: "Cette notification n'existe pas." };
  }

  try {
    await markNotificationRead(notification.id);
  } catch {
    return { error: "Impossible de marquer la notification comme lue." };
  }

  revalidateNotificationSurfaces();
  return { error: null };
}

/** "Tout marquer comme lu" — marks every unread notification as read. */
export async function markAllReadAction(
  _prevState: NotificationActionState,
  _formData: FormData,
): Promise<NotificationActionState> {
  await requireAdminAction();

  try {
    await markAllNotificationsRead();
  } catch {
    return { error: "Impossible de mettre à jour les notifications." };
  }

  revalidateNotificationSurfaces();
  return { error: null };
}
