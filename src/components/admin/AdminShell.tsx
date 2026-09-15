"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  CalendarClock,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/admin/(dashboard)/actions";
import { NotificationBell, type BellNotification } from "@/components/admin/NotificationBell";

type AdminInfo = { email: string; name: string | null };

const navItems = [
  {
    href: "/admin",
    label: "Vue d’ensemble",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/cars", label: "Voitures", icon: Car },
  {
    href: "/admin/reservations",
    label: "Réservations",
    icon: CalendarClock,
  },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
] as const;

function SidebarHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 ${compact ? "" : "pt-5"} pb-5`}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line-gold bg-night"
      >
        <span className="text-xs font-extrabold tracking-tight text-gold">
          M
        </span>
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight text-white">
          MDA <span className="text-gold">CAR</span>
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-steel-dark">
          Administration
        </span>
      </span>
    </div>
  );
}

function SidebarFooter({ admin }: { admin: AdminInfo }) {
  return (
    <div className="mt-auto border-t border-line p-4">
      <p className="truncate text-[13px] font-medium text-cream">
        {admin.name || admin.email}
      </p>
      <p className="truncate text-[12px] text-steel-dark">{admin.email}</p>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] font-medium text-steel transition-colors duration-200 hover:border-line-gold hover:text-gold"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}

export function AdminShell({
  admin,
  children,
  unreadNotificationCount = 0,
  recentNotifications = [],
}: {
  admin: AdminInfo;
  children: ReactNode;
  unreadNotificationCount?: number;
  recentNotifications?: BellNotification[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = isActive(item.href, "exact" in item && item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-200 ${
              active
                ? "bg-graphite text-gold"
                : "text-steel hover:bg-graphite/60 hover:text-cream"
            }`}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-[18px] w-[18px]" aria-hidden />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-night">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-coal md:flex">
        <SidebarHeader />
        {nav}
        <SidebarFooter admin={admin} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 flex-col border-r border-line bg-coal">
            <div className="flex items-center justify-between pr-2">
              <SidebarHeader compact />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
                className="rounded-md p-2 text-steel hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {nav}
            <SidebarFooter admin={admin} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-line bg-coal px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            className="rounded-md p-2 text-steel hover:text-white"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <span className="flex-1 text-[15px] font-semibold text-white">
            MDA CAR — Admin
          </span>
          <NotificationBell
            unreadCount={unreadNotificationCount}
            recent={recentNotifications}
          />
        </header>
        {/* Desktop-only slim top bar: the existing dashboard has no header
            on md+ (the sidebar covers navigation), so this is the minimal
            addition needed to surface the notification bell there too —
            no other change to the dashboard chrome. */}
        <header className="hidden h-14 items-center justify-end border-b border-line bg-coal px-6 md:flex">
          <NotificationBell
            unreadCount={unreadNotificationCount}
            recent={recentNotifications}
          />
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
