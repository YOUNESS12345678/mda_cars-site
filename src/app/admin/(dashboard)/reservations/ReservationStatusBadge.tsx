import {
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/reservation-constants";

const TONE_CLASS: Record<ReservationStatus, string> = {
  new: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  contacted: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
  completed: "border-line-strong bg-graphite text-steel",
};

/** Status is communicated by label text as well as color, never color
 *  alone, so it stays legible without relying on color perception. */
export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${TONE_CLASS[status]}`}
    >
      {RESERVATION_STATUS_LABELS[status]}
    </span>
  );
}
