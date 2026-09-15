/**
 * Client-safe reservation constants, types, and validation.
 *
 * Deliberately has NO `server-only` import and NO database import — mirrors
 * the split used for cars (car-constants.ts / cars.ts): anything that
 * touches the database lives in `reservations.ts` instead, which is
 * `server-only` and re-exports everything here.
 */

export const RESERVATION_STATUSES = [
  "new",
  "contacted",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

/** Statuses counted as "pending/active" on the dashboard — an inquiry that
 *  still needs a human outcome. Cancelled/completed are resolved, not
 *  pending, so they are intentionally excluded. */
export const PENDING_RESERVATION_STATUSES: ReservationStatus[] = [
  "new",
  "contacted",
];

/** Statuses that count as an "active" hold on a car for double-booking
 *  purposes — a reservation the business still intends to honour. */
export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "new",
  "contacted",
  "confirmed",
];

export function isValidReservationStatus(
  value: unknown,
): value is ReservationStatus {
  return (
    typeof value === "string" &&
    (RESERVATION_STATUSES as readonly string[]).includes(value)
  );
}

export const RESERVATION_LIMITS = {
  name: 120,
  phone: 40,
  city: 100,
  vehicleLabel: 120,
  message: 2000,
  source: 60,
  date: 20,
} as const;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Loose but useful server-side check: at least 6 digits once separators are
// stripped. Real-world phone formats vary too much to validate more strictly
// without rejecting legitimate numbers.
const PHONE_PATTERN = /^[+0-9][0-9\s().-]{5,39}$/;

export type PublicReservationInput = {
  name: string;
  phone: string;
  city?: string;
  vehicleLabel?: string;
  carSlug?: string;
  pickupDate?: string;
  returnDate?: string;
  message?: string;
  source?: string;
};

export type PublicReservationValues = {
  customerName: string;
  customerPhone: string;
  customerCity: string | null;
  customerEmail: string | null;
  vehicleLabel: string | null;
  carSlug: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  message: string | null;
  source: string;
};

export type PublicReservationFieldErrors = Partial<
  Record<"name" | "phone" | "city" | "pickupDate" | "returnDate" | "message", string>
>;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Server-side validation for the public reservation form.
 *  Required-ness intentionally mirrors what the existing BookingForm UI
 *  actually enforces (name + phone are `required` inputs; vehicle, dates
 *  and message are optional "request availability" fields) — this phase
 *  connects the existing form to the database, it does not tighten the
 *  existing UX. Dates, when supplied, are still validated for shape and
 *  order. */
export function validatePublicReservationInput(
  input: PublicReservationInput,
): { values: PublicReservationValues | null; errors: PublicReservationFieldErrors } {
  const errors: PublicReservationFieldErrors = {};

  const name = clean(input.name, RESERVATION_LIMITS.name);
  if (!name) errors.name = "Le nom est obligatoire.";

  const phone = clean(input.phone, RESERVATION_LIMITS.phone);
  if (!phone) errors.phone = "Le téléphone est obligatoire.";
  else if (!PHONE_PATTERN.test(phone)) errors.phone = "Le numéro de téléphone est invalide.";

  const city = clean(input.city, RESERVATION_LIMITS.city);
  if (!city) errors.city = "La ville est obligatoire.";

  const pickupDate = clean(input.pickupDate, RESERVATION_LIMITS.date);
  if (pickupDate && !DATE_PATTERN.test(pickupDate)) {
    errors.pickupDate = "La date de départ est invalide.";
  }

  const returnDate = clean(input.returnDate, RESERVATION_LIMITS.date);
  if (returnDate && !DATE_PATTERN.test(returnDate)) {
    errors.returnDate = "La date de retour est invalide.";
  }

  if (
    pickupDate &&
    returnDate &&
    DATE_PATTERN.test(pickupDate) &&
    DATE_PATTERN.test(returnDate) &&
    returnDate < pickupDate
  ) {
    errors.returnDate = "La date de retour doit être après la date de départ.";
  }

  if (Object.keys(errors).length > 0) {
    return { values: null, errors };
  }

  const vehicleLabel = clean(input.vehicleLabel, RESERVATION_LIMITS.vehicleLabel) || null;
  const carSlug = clean(input.carSlug, RESERVATION_LIMITS.vehicleLabel) || null;
  const message = clean(input.message, RESERVATION_LIMITS.message) || null;
  const source = clean(input.source, RESERVATION_LIMITS.source) || "website";

  return {
    values: {
      customerName: name,
      customerPhone: phone,
      customerCity: city,
      customerEmail: null,
      vehicleLabel,
      carSlug,
      pickupDate: pickupDate || null,
      returnDate: returnDate || null,
      message,
      source,
    },
    errors: {},
  };
}

/** Normalizes a customer-provided phone number for `tel:`/WhatsApp use.
 *  Reuses the same "Moroccan-first" assumption the rest of the site makes
 *  (see lib/site.ts's whatsappNumber), without inventing country codes for
 *  numbers that already look international. Returns digits only (no `+`),
 *  suitable for both `tel:+<digits>` and `https://wa.me/<digits>`. */
export function normalizeMoroccanPhone(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return null;

  // Already has a country code (e.g. 212650911122, or +212... stripped above).
  if (digits.startsWith("212") && digits.length >= 11) return digits;

  // Local Moroccan format: 0XXXXXXXXX (10 digits) → drop the trunk 0, add 212.
  if (digits.startsWith("0") && digits.length === 10) {
    return `212${digits.slice(1)}`;
  }

  // Anything else that already looks like a full international number
  // (11-15 digits) is passed through as-is rather than guessing.
  if (digits.length >= 11 && digits.length <= 15) return digits;

  // Too short/ambiguous to safely build a tel:/wa.me link.
  return null;
}

/** Formats a "YYYY-MM-DD" date-only string for display without ever
 *  crossing a timezone boundary (parsing as UTC noon avoids the classic
 *  "date shows one day off" bug that plain `new Date("YYYY-MM-DD")` can
 *  cause depending on the reader's timezone). Returns a placeholder for
 *  missing/invalid values instead of throwing. */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value || !DATE_PATTERN.test(value)) return "Non précisée";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}
