import "server-only";

import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { businessSettings } from "@/db/schema";
import { site } from "@/lib/site";
import type { PublicSiteSettings } from "./business-settings-constants";

// Re-exported so server files (actions.ts, page.tsx) can import everything
// from one place. SettingsForm.tsx (a client component) must import
// directly from "@/lib/business-settings-constants" instead — this module
// pulls in the database driver via "@/db" and would break the client
// bundle otherwise. Same split Phase 2 used for cars.ts / car-constants.ts.
export * from "./business-settings-constants";

export type BusinessSettingsRow = typeof businessSettings.$inferSelect;

/**
 * Business settings are a singleton (one row for the one business). Reads
 * the row if it exists; otherwise seeds it from the confirmed values in
 * lib/site.ts so the admin form always has something real to start from,
 * never blank placeholders.
 *
 * PHASE 3: the seed now covers the wider set of fields. Only values that
 * are actually confirmed in lib/site.ts are used — anything not verified
 * there (email, street address, website URL not yet decided) is left
 * empty/null rather than invented, per the brief.
 */
export async function getOrCreateBusinessSettings(): Promise<BusinessSettingsRow> {
  const rows = await db.select().from(businessSettings).limit(1);
  if (rows[0]) return rows[0];

  const [created] = await db
    .insert(businessSettings)
    .values({
      businessName: site.name,
      phoneDisplay: site.phoneDisplay,
      phoneInternational: site.phoneInternational,
      whatsappNumber: site.whatsappNumber,
      // No confirmed email or street address exist yet in lib/site.ts
      // (only a "to be provided" placeholder token) — left null rather
      // than invented.
      city: site.baseCity,
      postalCode: site.postalCode,
      latitude: site.latitude,
      longitude: site.longitude,
      openingHours: site.openingHours.map((entry) => ({ ...entry })),
      facebookUrl: site.facebook,
      instagramUrl: site.instagram,
      websiteUrl: site.url,
    })
    .returning();

  return created;
}

/**
 * PHASE 7 — single source of truth for the PUBLIC website.
 *
 * Wraps getOrCreateBusinessSettings() (reused as-is, per the brief — no
 * second settings query/table) and resolves it into the plain, public-safe
 * shape every public component reads (see PublicSiteSettings). Cached via
 * Next's Data Cache with the "site-settings" tag: the admin settings
 * action calls `updateTag("site-settings")` after a successful save,
 * so the next public request (and any page that statically used this
 * data) picks up the change — no unrelated route is invalidated.
 *
 * Fields not yet collected in the admin form (Google Maps link) keep
 * coming from the static, confirmed value in lib/site.ts, same as before
 * this phase — nothing invented, nothing silently dropped.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
    try {
      const row = await getOrCreateBusinessSettings();
      return {
      businessName:
        row.businessName && row.businessName.trim().toUpperCase() !== "MMDA CAR"
          ? row.businessName
          : site.name,
      phoneDisplay: row.phoneDisplay || site.phoneDisplay,
      phoneInternational: row.phoneInternational || site.phoneInternational,
      telHref: `tel:${row.phoneInternational || site.phoneInternational}`,
      whatsappNumber: row.whatsappNumber || site.whatsappNumber,
      email: row.email ?? "",
      address: row.address ?? "",
      city: row.city || site.baseCity,
      postalCode: row.postalCode || site.postalCode,
      latitude: row.latitude ?? site.latitude,
      longitude: row.longitude ?? site.longitude,
      openingHours:
        row.openingHours && row.openingHours.length > 0
          ? row.openingHours
          : site.openingHours.map((entry) => ({ ...entry })),
      facebookUrl: row.facebookUrl || site.facebook,
      instagramUrl: row.instagramUrl || site.instagram,
        websiteUrl: row.websiteUrl || site.url,
      };
    } catch {
      // Public pages must remain renderable if Neon is temporarily unavailable.
      // The confirmed static business data is a safe SEO/conversion fallback.
      return {
        businessName: site.name,
        phoneDisplay: site.phoneDisplay,
        phoneInternational: site.phoneInternational,
        telHref: site.telHref,
        whatsappNumber: site.whatsappNumber,
        email: "",
        address: "",
        city: site.baseCity,
        postalCode: site.postalCode,
        latitude: site.latitude,
        longitude: site.longitude,
        openingHours: site.openingHours.map((entry) => ({ ...entry })),
        facebookUrl: site.facebook,
        instagramUrl: site.instagram,
        websiteUrl: site.url,
      };
    }
  },
  ["site-settings"],
  { tags: ["site-settings"] },
);
