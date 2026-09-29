/**
 * Client-safe car constants, types, and validation.
 *
 * Deliberately has NO `server-only` import and NO database import: it is
 * used by both server code (actions.ts) and the client form component
 * (CarForm.tsx). Anything that touches the database lives in `cars.ts`
 * instead, which is `server-only` and re-exports everything here.
 */

/** Kept in sync with the public site's Vehicle type (src/lib/vehicles.ts)
 *  so values entered here stay compatible with the public fleet shape if a
 *  later phase wires the public pages to this table. */
export const TRANSMISSIONS = ["Manuelle", "Automatique"] as const;
export const FUEL_TYPES = ["Diesel", "Essence"] as const;
export const CATEGORIES = ["Citadine", "Berline", "SUV"] as const;

export type Transmission = (typeof TRANSMISSIONS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type Category = (typeof CATEGORIES)[number];

export const MAX_FEATURES = 20;
export const MAX_IMAGES = 8;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1990;
const MAX_YEAR = CURRENT_YEAR + 1;

const IMAGE_URL_PATTERN = /^(https:\/\/[^\s]+|\/[^\s]+)\.(jpe?g|png|webp|avif|gif)$/i;

export type CarFormValues = {
  brand: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  transmission: string;
  fuel: string;
  seats: number;
  description: string;
  images: string[];
  features: string[];
  isAvailable: boolean;
  isPublished: boolean;
};

export type CarFieldErrors = Partial<Record<keyof CarFormValues, string>>;

/** Server-side validation. Never trust the client — this runs the same way
 *  whether the request came from the real form or a hand-crafted one.
 *  (The function itself is pure/isomorphic; it is only ever *called* from
 *  server actions, never from the browser.) */
export function validateCarInput(input: {
  brand: string;
  model: string;
  year: string;
  category: string;
  pricePerDay: string;
  transmission: string;
  fuel: string;
  seats: string;
  description: string;
  images: string[];
  features: string[];
  isAvailable: boolean;
  isPublished: boolean;
}): { values: CarFormValues | null; errors: CarFieldErrors } {
  const errors: CarFieldErrors = {};

  const brand = input.brand.trim();
  if (!brand) errors.brand = "La marque est obligatoire.";
  else if (brand.length > 60) errors.brand = "La marque est trop longue.";

  const model = input.model.trim();
  if (!model) errors.model = "Le modèle est obligatoire.";
  else if (model.length > 60) errors.model = "Le modèle est trop long.";

  const year = Number(input.year);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    errors.year = `L'année doit être comprise entre ${MIN_YEAR} et ${MAX_YEAR}.`;
  }

  const category = input.category.trim();
  if (category && !CATEGORIES.includes(category as Category)) {
    errors.category = "Catégorie invalide.";
  }

  const pricePerDay = Number(input.pricePerDay);
  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    errors.pricePerDay = "Le prix par jour doit être un nombre positif.";
  } else if (pricePerDay > 100000) {
    errors.pricePerDay = "Le prix par jour semble invalide.";
  }

  const transmission = input.transmission.trim();
  if (!TRANSMISSIONS.includes(transmission as Transmission)) {
    errors.transmission = "Transmission invalide.";
  }

  const fuel = input.fuel.trim();
  if (!FUEL_TYPES.includes(fuel as FuelType)) {
    errors.fuel = "Carburant invalide.";
  }

  const seats = Number(input.seats);
  if (!Number.isInteger(seats) || seats < 1 || seats > 9) {
    errors.seats = "Le nombre de places doit être compris entre 1 et 9.";
  }

  const description = input.description.trim();
  if (description.length > 2000) {
    errors.description = "La description est trop longue (2000 caractères max).";
  }

  const images = input.images.map((s) => s.trim()).filter(Boolean);
  if (images.length > MAX_IMAGES) {
    errors.images = "8 images maximum.";
  } else {
    for (const url of images) {
      if (url.length > 500 || !IMAGE_URL_PATTERN.test(url)) {
        errors.images =
          "Chaque image doit être une URL valide (https:// ou /images/...) se terminant par .jpg, .jpeg, .png, .webp, .avif ou .gif.";
        break;
      }
    }
  }

  const features = input.features.map((s) => s.trim()).filter(Boolean);
  if (features.length > MAX_FEATURES) {
    errors.features = `${MAX_FEATURES} caractéristiques maximum.`;
  } else if (features.some((f) => f.length > 60)) {
    errors.features = "Chaque caractéristique doit faire 60 caractères maximum.";
  }

  if (Object.keys(errors).length > 0) {
    return { values: null, errors };
  }

  return {
    values: {
      brand,
      model,
      year,
      category,
      pricePerDay,
      transmission,
      fuel,
      seats,
      description,
      images,
      features,
      isAvailable: input.isAvailable,
      isPublished: input.isPublished,
    },
    errors: {},
  };
}
