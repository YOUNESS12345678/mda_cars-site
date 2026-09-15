"use client";

import { useActionState, useRef } from "react";
import {
  RESERVATION_STATUSES,
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/reservation-constants";
import { updateReservationStatusAction } from "./actions";
import { initialUpdateStatusState } from "./action-state";

export function ReservationStatusForm({
  reservationId,
  status,
  compact = false,
}: {
  reservationId: number;
  status: ReservationStatus;
  compact?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    updateReservationStatusAction,
    initialUpdateStatusState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={compact ? "flex flex-col gap-1" : "flex flex-col gap-1.5"}
    >
      <input type="hidden" name="reservationId" value={reservationId} />
      <select
        name="status"
        defaultValue={status}
        disabled={isPending}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label="Statut de la réservation"
        className="rounded-lg border border-line bg-night px-3 py-2 text-[13px] font-medium text-white focus:border-line-gold focus:outline-none disabled:opacity-60"
      >
        {RESERVATION_STATUSES.map((value) => (
          <option key={value} value={value}>
            {RESERVATION_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      {state.error && (
        <p role="alert" className="text-[12px] font-medium text-red-300">
          {state.error}
        </p>
      )}
    </form>
  );
}
