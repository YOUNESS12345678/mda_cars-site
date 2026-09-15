"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatUnreadCount } from "@/lib/notification-constants";
import { openNotificationAction } from "@/app/admin/(dashboard)/notifications/actions";
import { SubmitStatusButton } from "@/components/admin/SubmitStatusButton";

export type BellNotification = {
  id: number;
  title: string;
  preview: string | null;
  isRead: boolean;
  relativeTime: string;
};

export function NotificationBell({
  unreadCount,
  recent,
}: {
  unreadCount: number;
  recent: BellNotification[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const label =
    unreadCount > 0
      ? `Notifications (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})`
      : "Notifications";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line text-steel transition-colors duration-200 hover:border-line-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-none text-night"
          >
            {formatUnreadCount(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications récentes"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,90vw)] overflow-hidden rounded-lg border border-line bg-coal shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-[13px] font-semibold text-white">
              Notifications
            </span>
            {unreadCount === 0 && recent.length > 0 && (
              <span className="text-[12px] text-steel-dark">
                Aucune nouvelle notification.
              </span>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-steel-dark">
              Aucune notification.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {recent.map((item) => (
                <li key={item.id} className="border-b border-line last:border-b-0">
                  <form action={openNotificationAction}>
                    <input type="hidden" name="notificationId" value={item.id} />
                    <SubmitStatusButton
                      onClick={() => setOpen(false)}
                      className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-graphite/60 ${
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
                      {item.preview && (
                        <span className="pl-3.5 text-[12px] text-steel-dark">
                          {item.preview}
                        </span>
                      )}
                      <span className="pl-3.5 text-[11px] text-steel-dark">
                        {item.relativeTime}
                      </span>
                    </SubmitStatusButton>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-[13px] font-medium text-gold hover:text-gold-hover"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
