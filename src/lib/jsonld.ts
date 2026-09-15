import { site } from "./site";
import type { PublicSiteSettings } from "./business-settings-constants";

/** Parses a free-text opening-hours entry (as typed by the admin, e.g.
 *  "Ouvert 24h/24" or "09:00 - 18:00") into schema.org opens/closes times.
 *  Days that read as closed are omitted entirely — schema.org has no
 *  "closed" value. Best-effort by design: the admin field is free text,
 *  not a structured time picker, so this stays a small, defensive mapper
 *  rather than a rewrite of the settings form. */
function parseHoursEntry(hours: string): { opens: string; closes: string } | null {
  const normalized = hours.trim().toLowerCase();
  if (!normalized || normalized.includes("fermé") || normalized.includes("ferme")) {
    return null;
  }
  if (normalized.includes("24h")) {
    return { opens: "00:00", closes: "23:59" };
  }
  const match = normalized.match(/(\d{1,2})[:h](\d{2})?\s*-\s*(\d{1,2})[:h](\d{2})?/);
  if (match) {
    const [, h1, m1 = "00", h2, m2 = "00"] = match;
    return {
      opens: `${h1.padStart(2, "0")}:${m1}`,
      closes: `${h2.padStart(2, "0")}:${m2}`,
    };
  }
  return null;
}

const DAY_NAME_TO_SCHEMA: Record<string, string> = {
  Lundi: "Monday",
  Mardi: "Tuesday",
  Mercredi: "Wednesday",
  Jeudi: "Thursday",
  Vendredi: "Friday",
  Samedi: "Saturday",
  Dimanche: "Sunday",
};

function buildOpeningHoursSpecification(
  openingHours: PublicSiteSettings["openingHours"],
): Record<string, unknown>[] {
  const bySlot = new Map<string, string[]>();
  for (const entry of openingHours) {
    const parsed = parseHoursEntry(entry.hours);
    if (!parsed) continue; // closed / unparseable → day omitted, not fabricated
    const key = `${parsed.opens}-${parsed.closes}`;
    const schemaDay = DAY_NAME_TO_SCHEMA[entry.day] ?? entry.day;
    bySlot.set(key, [...(bySlot.get(key) ?? []), schemaDay]);
  }
  return Array.from(bySlot.entries()).map(([key, days]) => {
    const [opens, closes] = key.split("-");
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    };
  });
}

/**
 * Structured data builders. Only confirmed, real business data is emitted:
 * - address / geo / opening hours now come from the database-backed
 *   business settings (see PublicSiteSettings), the same source the
 *   visible public page uses — so the visible page and JSON-LD can never
 *   contradict each other (PHASE 7),
 * - review ratings from third-party Google Maps are intentionally not emitted
 *   as review/aggregateRating structured data; the visible review section can
 *   still link users to the public Google listing.
 */
export function organizationJsonLd(settings: PublicSiteSettings): Record<string, unknown> {
  const openingHoursSpecification = buildOpeningHoursSpecification(settings.openingHours);
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${site.url}/#business`,
    name: settings.businessName,
    url: site.url,
    telephone: settings.phoneInternational,
    image: `${site.url}/og`,
    areaServed: [
      { "@type": "City", name: "Biougra" },
      { "@type": "City", name: "Agadir" },
      { "@type": "AdministrativeArea", name: "Souss-Massa" },
      { "@type": "Country", name: "Maroc" },
    ],
    sameAs: [settings.instagramUrl, settings.facebookUrl].filter(Boolean),
    hasMap: site.googleMapsUrl,
    address: {
      "@type": "PostalAddress",
      ...(settings.address ? { streetAddress: settings.address } : {}),
      addressLocality: settings.city || site.baseCity,
      addressRegion: site.region,
      postalCode: settings.postalCode || site.postalCode,
      addressCountry: site.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.latitude ?? site.latitude,
      longitude: settings.longitude ?? site.longitude,
    },
    ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    inLanguage: "fr",
    publisher: { "@id": `${site.url}/#business` },
  };
}

/** FAQPage schema — pass the exact Q&A already rendered on the page. */
export function faqJsonLd(
  faqs: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Service schema for a service/product page, linked to the business entity. */
export function serviceJsonLd({
  name,
  description,
  path,
  areaServed = ["Biougra", "Agadir", "Souss-Massa", "Maroc"],
}: {
  name: string;
  description: string;
  path: string;
  areaServed?: string[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}${path}/#service`,
    name,
    description,
    url: `${site.url}${path}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: areaServed.map((areaName) => ({
      "@type": areaName === "Maroc" ? "Country" : "Place",
      name: areaName,
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}
