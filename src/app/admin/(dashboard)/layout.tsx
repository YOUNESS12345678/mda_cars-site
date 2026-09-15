import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  formatRelativeTime,
  getRecentNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";
import type { BellNotification } from "@/components/admin/NotificationBell";

export const metadata: Metadata = {
  title: "Tableau de bord | MDA CAR Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side route protection: no valid session → redirected to
  // /admin/login before anything below this line ever renders.
  const admin = await requireAdminPage();

  // Fetched here (not in a client component) so the bell needs no fetch of
  // its own on first paint — see §33 of the Phase 5 brief: the simplest
  // architecture compatible with the existing project, no polling/real-time
  // infra. Mutating actions revalidate this layout (see notifications/
  // actions.ts) so the count/list stay correct after mark-as-read.
  const [unreadCount, recent] = await Promise.all([
    getUnreadNotificationCount(),
    getRecentNotifications(10),
  ]);

  // Formatted/flattened to plain serializable values before crossing into
  // the client component boundary — no Date objects, no raw DB rows.
  const bellNotifications: BellNotification[] = recent.map((n) => ({
    id: n.id,
    title: n.title,
    preview:
      n.customerName || n.vehicleLabel
        ? [n.customerName, n.vehicleLabel].filter(Boolean).join(" — ")
        : null,
    isRead: n.isRead,
    relativeTime: formatRelativeTime(n.createdAt),
  }));

  return (
    <AdminShell
      admin={admin}
      unreadNotificationCount={unreadCount}
      recentNotifications={bellNotifications}
    >
      {children}
    </AdminShell>
  );
}
