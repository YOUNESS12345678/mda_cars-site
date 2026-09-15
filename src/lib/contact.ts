import { whatsappHref } from "./site";
import { buildWhatsAppHref } from "./business-settings-constants";

/**
 * WhatsApp-first conversion helpers (client-safe).
 * Every form on the site converts the request into a pre-filled WhatsApp
 * message and mirrors it to /api/leads as a server-side backup log.
 */

export type BookingRequest = {
  name: string;
  phone: string;
  city?: string;
  vehicle?: string;
  pickupDate?: string;
  returnDate?: string;
  message?: string;
  source: string;
};

export function buildBookingMessage(input: BookingRequest): string {
  const lines = [
    "Bonjour MDA CAR,",
    "Je souhaite demander la disponibilité d’un véhicule de location.",
  ];
  if (input.vehicle) lines.push(`Véhicule souhaité : ${input.vehicle}`);
  if (input.pickupDate) lines.push(`Date de départ : ${input.pickupDate}`);
  if (input.returnDate) lines.push(`Date de retour : ${input.returnDate}`);
  lines.push(`Nom : ${input.name}`);
  lines.push(`Téléphone : ${input.phone}`);
  if (input.city) lines.push(`Ville : ${input.city}`);
  if (input.message) lines.push(`Message : ${input.message}`);
  lines.push("Merci de me recontacter.");
  return lines.join("\n");
}

export function buildContactMessage(input: {
  name: string;
  phone: string;
  message: string;
}): string {
  return [
    "Bonjour MDA CAR,",
    input.message,
    `Nom : ${input.name}`,
    `Téléphone : ${input.phone}`,
    "Merci de me recontacter.",
  ].join("\n");
}

/** PHASE 7: accepts the database-backed WhatsApp number resolved by the
 *  Server Component that rendered the form (BookingForm/ContactForm), so
 *  this client-side "open WhatsApp" action uses the same number the admin
 *  configured — not the static fallback — while staying usable with no
 *  number for any caller that genuinely has none yet. */
export function openWhatsApp(message: string, whatsappNumber?: string): void {
  const href = whatsappNumber ? buildWhatsAppHref(whatsappNumber, message) : whatsappHref(message);
  window.open(href, "_blank", "noopener,noreferrer");
}

/** Fire-and-forget backup log; never blocks the WhatsApp opening. */
export function logLead(payload: BookingRequest): void {
  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* WhatsApp already delivered the request — stay silent. */
  });
}

/**
 * PHASE 4 — additive alongside `logLead`, not a replacement: `carSlug` lets
 * the server best-effort link the request to a real fleet row (see
 * lib/reservations.ts's resolveCarId) without changing the WhatsApp message
 * or the `leads` backup log, which still use the plain vehicle name.
 * Fire-and-forget for the same reason as `logLead` — WhatsApp already
 * delivered the request; this only feeds /admin/reservations.
 */
export function createReservation(payload: BookingRequest & { carSlug?: string }): void {
  fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* WhatsApp already delivered the request — stay silent. */
  });
}
