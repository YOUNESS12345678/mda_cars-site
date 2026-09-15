"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { markOneReadAction, openNotificationAction } from "./actions";
import { initialNotificationActionState } from "./action-state";
import { NOTIFICATION_TYPE_LABELS, type NotificationType } from "@/lib/notification-constants";
import { SubmitStatusButton } from "@/components/admin/SubmitStatusButton";

export type NotificationListItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  preview: string | null;
  isRead: boolean;
  reservationId: number | null;
  createdDate: string;
};

export function NotificationRow({ item }: { item: NotificationListItem }) {
  const [state, formAction, isPending] = useActionState(
    markOneReadAction,
    initialNotificationActionState,
  );

  return (
    <li
      className={`flex flex-col gap-3 rounded-lg border border-line p-4 sm:flex-row sm:items-center sm:justify-between ${
        !item.isRead ? "bg-graphite/30" : "bg-coal"
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {!item.isRead && (
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          )}
          <span
            className={`text-[14px] ${!item.isRead ? "font-semibold text-white" : "font-medium text-steel"}`}
          >
            {item.title}
          </span>
          <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-steel-dark">
            {NOTIFICATION_TYPE_LABELS[item.type]}
          </span>
          {!item.isRead && (
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-gold">
              Non lue
            </span>
          )}
        </div>
        <p className="text-[13px] text-steel">
          {item.message}
          {item.preview ? ` — ${item.preview}` : ""}
        </p>
        <span className="text-[12px] text-steel-dark">{item.createdDate}</span>
        {state.error && (
          <p role="alert" className="text-[12px] font-medium text-red-300">
            {state.error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.reservationId && (
          <form action={openNotificationAction}>
            <input type="hidden" name="notificationId" value={item.id} />
            <SubmitStatusButton className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-[13px] font-medium text-cream hover:border-line-gold hover:text-gold">
              Ouvrir
            </SubmitStatusButton>
          </form>
        )}
        {!item.isRead && (
          <form action={formAction}>
            <input type="hidden" name="notificationId" value={item.id} />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-steel hover:border-line-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Marquer comme lu
            </button>
          </form>
        )}
      </div>
    </li>
  );
}
