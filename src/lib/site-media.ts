import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { siteMedia } from "@/db/schema";
import { DEFAULT_SITE_MEDIA } from "./media-constants";

export type SiteMediaRow = typeof siteMedia.$inferSelect;

async function seedIfEmpty() {
  const existing = await db.select({ id: siteMedia.id }).from(siteMedia).limit(1);
  if (existing.length) return;
  await db.insert(siteMedia).values(DEFAULT_SITE_MEDIA);
}

function fallbackRows(): SiteMediaRow[] {
  return DEFAULT_SITE_MEDIA.map((item, index) => ({
    id: -(index + 1), key: item.key, label: item.label, pagePath: item.pagePath,
    src: item.src, alt: item.alt, enabled: true, sortOrder: item.sortOrder,
    updatedAt: new Date(0), updatedBy: null,
  }));
}

async function loadSiteMediaRows(): Promise<SiteMediaRow[]> {
  await seedIfEmpty();
  return db.select().from(siteMedia).orderBy(siteMedia.sortOrder, siteMedia.id);
}

// PERF: the public site reads media through the Data Cache (tag "site-media",
// invalidated by updateSiteMediaAction) instead of hitting Postgres on every
// request. Errors are thrown out of the cached function so a temporary DB
// outage is never cached; the fallback is applied outside it.
const loadSiteMediaRowsCached = unstable_cache(loadSiteMediaRows, ["site-media-rows"], {
  tags: ["site-media"],
  revalidate: 3600,
});

// Fresh read for the admin dashboard (per-request de-duplication only).
export const getSiteMediaRows = cache(async (): Promise<SiteMediaRow[]> => {
  try {
    return await loadSiteMediaRows();
  } catch {
    return fallbackRows();
  }
});

const getPublicSiteMediaRows = cache(async (): Promise<SiteMediaRow[]> => {
  try {
    return await loadSiteMediaRowsCached();
  } catch {
    return fallbackRows();
  }
});

// Public read path — cached, and refreshed immediately when an admin saves.
export async function getSiteMediaMap(): Promise<Record<string, SiteMediaRow>> {
  const rows = await getPublicSiteMediaRows();
  return Object.fromEntries(rows.filter((r) => r.enabled).map((r) => [r.key, r]));
}

export async function getMediaSrc(key: string, fallback: string): Promise<string> {
  const map = await getSiteMediaMap();
  return map[key]?.src || fallback;
}

export async function updateSiteMedia(id: number, src: string, alt: string, enabled: boolean, updatedBy: number) {
  const value = src.trim();
  const altValue = alt.trim();
  if (!Number.isInteger(id) || id <= 0 || !value || value.length > 1000 || !altValue || altValue.length > 300) throw new Error("invalid");
  if (!(value.startsWith("/") || /^https:\/\//i.test(value))) throw new Error("invalid_url");
  await db.update(siteMedia).set({ src: value, alt: altValue, enabled, updatedAt: new Date(), updatedBy }).where(eq(siteMedia.id, id));
}
