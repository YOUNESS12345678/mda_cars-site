import { whatsappHref } from "./site";
import { buildWhatsAppHref } from "./business-settings-constants";

/**
 * Client-safe contact and reservation helpers. Reservation forms save directly
 * through /api/reservations; WhatsApp remains available for direct contact.
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

/** Opens the database-configured WhatsApp number for direct contact. */
export function openWhatsApp(message: string, whatsappNumber?: string): void {
  const href = whatsappNumber ? buildWhatsAppHref(whatsappNumber, message) : whatsappHref(message);
  window.open(href, "_blank", "noopener,noreferrer");
}

/** Fire-and-forget lead mirror; never blocks the reservation flow. */
export function logLead(payload: BookingRequest): void {
  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* The reservation has already been saved — stay silent. */
  });
}

/**
 * Creates a real reservation in the database. Unlike the old WhatsApp-first
 * flow, submitting the reservation form does not open another app or tab.
 * The caller can use the returned boolean to show an honest success/error
 * state in the UI.
 */
export async function createReservation(
  payload: BookingRequest & { carSlug?: string },
): Promise<boolean> {
  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}
