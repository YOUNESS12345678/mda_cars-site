/**
 * Client-safe business settings constants, types, and validation.
 *
 * Deliberately has NO `server-only` import and NO database import: it is
 * used by both server code (settings/actions.ts) and the client form
 * component (SettingsForm.tsx). Anything that touches the database lives
 * in `business-settings.ts` instead, which is `server-only` and re-exports
 * everything here — the same split Phase 2 used for cars
 * (car-constants.ts / cars.ts).
 */

/** Fixed, ordered day list — opening hours are always exactly these seven
 *  rows (day is not free text), matching the shape already used by
 *  lib/site.ts's `openingHours`. */
export const OPENING_HOURS_DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export type OpeningHoursEntry = { day: string; hours: string };

export type BusinessSettingsFormValues = {
  businessName: string;
  phoneDisplay: string;
  phoneInternational: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  openingHours: OpeningHoursEntry[];
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
};

export type BusinessSettingsFieldErrors = Partial<
  Record<keyof BusinessSettingsFormValues, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Moroccan-friendly + generic reasonable URL check: http(s) only.
const URL_PATTERN = /^https?:\/\/[^\s]+\.[^\s]{2,}$/i;
// Moroccan postal codes are 5 digits; keep a small allowance either side
// in case of future non-Moroccan formats without rejecting real input.
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

/** Server-side validation. Never trust the client — this runs the same way
 *  whether the request came from the real form or a hand-crafted one.
 *  (The function itself is pure/isomorphic; it is only ever *called* from
 *  the server action, never from the browser.) */
export function validateBusinessSettingsInput(input: {
  businessName: string;
  phoneDisplay: string;
  phoneInternational: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  openingHours: OpeningHoursEntry[];
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
}): { values: BusinessSettingsFormValues | null; errors: BusinessSettingsFieldErrors } {
  const errors: BusinessSettingsFieldErrors = {};

  const businessName = input.businessName.trim();
  if (!businessName) {
    errors.businessName = "Le nom de l'entreprise est obligatoire.";
  } else if (businessName.length > 120) {
    errors.businessName = "Le nom de l'entreprise est trop long.";
  }

  const phoneDisplay = input.phoneDisplay.trim();
  if (phoneDisplay.length < 6) {
    errors.phoneDisplay = "Le numéro de téléphone affiché est invalide.";
  } else if (phoneDisplay.length > 40) {
    errors.phoneDisplay = "Le numéro de téléphone affiché est trop long.";
  }

  const phoneInternational = input.phoneInternational.trim();
  if (!/^\+\d{6,15}$/.test(phoneInternational)) {
    errors.phoneInternational =
      "Le numéro international est invalide (format attendu : +212650911122).";
  }

  const whatsappNumber = input.whatsappNumber.trim();
  if (!/^\d{6,15}$/.test(whatsappNumber)) {
    errors.whatsappNumber =
      "Le numéro WhatsApp est invalide (chiffres uniquement, avec indicatif, ex. 212650911122).";
  }

  const email = input.email.trim();
  if (email && (!EMAIL_PATTERN.test(email) || email.length > 254)) {
    errors.email = "L'adresse e-mail est invalide.";
  }

  const address = input.address.trim();
  if (address.length > 250) {
    errors.address = "L'adresse est trop longue (250 caractères max).";
  }

  const city = input.city.trim();
  if (city.length > 100) {
    errors.city = "Le nom de la ville est trop long (100 caractères max).";
  }

  const postalCode = input.postalCode.trim();
  if (postalCode && !POSTAL_CODE_PATTERN.test(postalCode)) {
    errors.postalCode = "Le code postal est invalide.";
  }

  let latitude: number | null = null;
  const latitudeRaw = input.latitude.trim();
  if (latitudeRaw) {
    const parsed = Number(latitudeRaw);
    if (!Number.isFinite(parsed) || parsed < -90 || parsed > 90) {
      errors.latitude = "La latitude doit être comprise entre -90 et 90.";
    } else {
      latitude = parsed;
    }
  }

  let longitude: number | null = null;
  const longitudeRaw = input.longitude.trim();
  if (longitudeRaw) {
    const parsed = Number(longitudeRaw);
    if (!Number.isFinite(parsed) || parsed < -180 || parsed > 180) {
      errors.longitude = "La longitude doit être comprise entre -180 et 180.";
    } else {
      longitude = parsed;
    }
  }

  const openingHours = OPENING_HOURS_DAYS.map((day, index) => {
    const entry = input.openingHours[index];
    return { day, hours: (entry?.hours ?? "").trim() };
  });
  if (openingHours.some((entry) => entry.hours.length > 60)) {
    errors.openingHours = "Chaque horaire doit faire 60 caractères maximum.";
  }

  const facebookUrl = input.facebookUrl.trim();
  if (facebookUrl && (!URL_PATTERN.test(facebookUrl) || facebookUrl.length > 300)) {
    errors.facebookUrl = "Le lien Facebook doit être une URL valide (https://...).";
  }

  const instagramUrl = input.instagramUrl.trim();
  if (instagramUrl && (!URL_PATTERN.test(instagramUrl) || instagramUrl.length > 300)) {
    errors.instagramUrl = "Le lien Instagram doit être une URL valide (https://...).";
  }

  const websiteUrl = input.websiteUrl.trim();
  if (websiteUrl && (!URL_PATTERN.test(websiteUrl) || websiteUrl.length > 300)) {
    errors.websiteUrl = "Le site web doit être une URL valide (https://...).";
  }

  if (Object.keys(errors).length > 0) {
    return { values: null, errors };
  }

  return {
    values: {
      businessName,
      phoneDisplay,
      phoneInternational,
      whatsappNumber,
      email,
      address,
      city,
      postalCode,
      latitude: latitude === null ? "" : String(latitude),
      longitude: longitude === null ? "" : String(longitude),
      openingHours,
      facebookUrl,
      instagramUrl,
      websiteUrl,
    },
    errors: {},
  };
}

/* ------------------------------------------------------------------ */
/*  PHASE 7 — PUBLIC-SITE INTEGRATION                                   */
/*  The shape the public website (and its client components, like       */
/*  Header/MobileMenu) reads business settings through. Client-safe:    */
/*  plain data only, no server/database import — matches the split      */
/*  already used throughout this file. The database-backed resolver     */
/*  that produces this shape (getSiteSettings()) lives in                */
/*  business-settings.ts. */
export type PublicSiteSettings = {
  businessName: string;
  phoneDisplay: string;
  phoneInternational: string;
  telHref: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: OpeningHoursEntry[];
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
};

/** Builds a wa.me link from a settings-resolved WhatsApp number — the
 *  settings-aware counterpart to lib/site.ts's `whatsappHref()`, which is
 *  only correct for the static confirmed number and is kept as-is for any
 *  code that still deliberately uses it. */
export function buildWhatsAppHref(whatsappNumber: string, message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Best-effort day-of-week index (0 = Monday, matching OPENING_HOURS_DAYS'
 *  order) for "today", used to surface a single relevant line (e.g. in the
 *  footer) from the full week of admin-edited hours without inventing a
 *  new "hours label" field that doesn't exist in the database. */
export function getTodayOpeningHours(
  openingHours: OpeningHoursEntry[] | null | undefined,
): OpeningHoursEntry | null {
  if (!openingHours || openingHours.length === 0) return null;
  // JS getDay(): 0 = Sunday..6 = Saturday. OPENING_HOURS_DAYS starts Monday.
  const jsDay = new Date().getDay();
  const mondayFirstIndex = jsDay === 0 ? 6 : jsDay - 1;
  return openingHours[mondayFirstIndex] ?? openingHours[0] ?? null;
}
