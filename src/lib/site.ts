/**
 * MDA CAR — single source of truth for business information.
 * Only confirmed, real data appears here. Missing data uses the exact
 * placeholder tokens required by the brand spec and MUST be replaced
 * with real information before launch.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const resolvedSiteUrl =
  configuredSiteUrl ||
  (vercelProductionHost ? `https://${vercelProductionHost}` : "https://mdacars-site.vercel.app");

export const site = {
  name: "MDA CAR",
  tagline: "Location de voitures",
  // One canonical origin for metadata, sitemap and structured data. On
  // Vercel, fall back to the production project host rather than a preview
  // deployment URL. For a custom domain, set NEXT_PUBLIC_SITE_URL.
  url: resolvedSiteUrl.replace(/\/+$/, ""),

  // Confirmed contact data
  phoneDisplay: "06 50 91 11 22",
  phoneInternational: "+212650911122",
  telHref: "tel:+212650911122",
  whatsappNumber: "212650911122",
  instagram:
    "https://www.instagram.com/location_de_voiture_biougra?stkn=MWl4djBraXZ5cnlzcg==",
  facebook: "https://www.facebook.com/profile.php?id=100090192637682",
  // Google Maps place link (Google Business Profile: "LOCATION DE VOITURE BIOUGRA").
  // Built from the place's stable CID so the URL stays short and clean.
  googleMapsUrl: "https://maps.google.com/?cid=15736903763679957559",

  // Confirmed geography
  baseCity: "Biougra",
  region: "Souss-Massa",
  country: "Maroc",
  countryCode: "MA",
  postalCode: "80000",
  // Verified exact coordinates (Google Maps Plus Code: 6J6C+39 Biougra).
  latitude: 30.21017983393551,
  longitude: -9.37909042733886,
  cities: ["Biougra", "Agadir", "Souss-Massa"] as const,
  serviceCountry: "Maroc",
  serviceDescription: "Location de voitures et livraison du véhicule partout au Maroc, selon disponibilité et modalités confirmées avec le client.",

  // Confirmed opening hours — open 24/7, every day of the week.
  hoursLabel: "Ouvert 24h/24, 7j/7",
  openingHours: [
    { day: "Lundi", hours: "Ouvert 24h/24" },
    { day: "Mardi", hours: "Ouvert 24h/24" },
    { day: "Mercredi", hours: "Ouvert 24h/24" },
    { day: "Jeudi", hours: "Ouvert 24h/24" },
    { day: "Vendredi", hours: "Ouvert 24h/24" },
    { day: "Samedi", hours: "Ouvert 24h/24" },
    { day: "Dimanche", hours: "Ouvert 24h/24" },
  ] as const,
} as const;

/** Exact placeholder tokens — visible in the UI until real data is provided. */
export const PLACEHOLDERS = {
  address: "[BUSINESS ADDRESS TO BE PROVIDED]",
  hours: "[OPENING HOURS TO BE PROVIDED]",
  price: "[VEHICLE PRICE TO BE PROVIDED]",
  conditions: "[RENTAL CONDITIONS TO BE PROVIDED]",
  service: "[CONFIRM SERVICE BEFORE PUBLISHING]",
} as const;

export const DEFAULT_WA_MESSAGE =
  "Bonjour MDA CAR, je souhaite des informations sur la location d’une voiture à Biougra. Merci.";

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/nos-voitures", label: "Nos voitures" },
  { href: "/services", label: "Services" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;
