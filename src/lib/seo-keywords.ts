import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { seoKeywords } from "@/db/schema";
import { DEFAULT_SEO_KEYWORDS } from "./seo-keyword-constants";

export type SeoKeywordRow = typeof seoKeywords.$inferSelect;

/** Old homepage headline wordings that may still be saved in the database
 *  (case/spacing/plural variants). They are replaced by the new headline so the
 *  admin list matches the site. The homepage itself no longer depends on this. */
const LEGACY_HOME_PRIMARY = [
  "location de voiture à agadir",
  "location de voitures à agadir",
  "location voiture à agadir",
  "location de voiture agadir",
  "location de voiture a agadir",
  "location de voitures a agadir",
];

async function seedIfEmpty() {
  const existing = await db.select({ id: seoKeywords.id }).from(seoKeywords).limit(1);
  if (!existing.length) {
    await db.insert(seoKeywords).values(DEFAULT_SEO_KEYWORDS);
    return;
  }
  const next = DEFAULT_SEO_KEYWORDS.find((k) => k.key === "home.primary")?.keyword;
  if (next) {
    await db
      .update(seoKeywords)
      .set({ keyword: next, updatedAt: new Date() })
      .where(and(eq(seoKeywords.key, "home.primary"), inArray(sql`lower(trim(${seoKeywords.keyword}))`, LEGACY_HOME_PRIMARY)));
  }
}

// React `cache` = de-duplicated once per request (NOT across requests), so the
// dozen <SeoKeyword/> calls on a page share one read while admin edits still
// show up on the very next visit.
export const getSeoKeywordRows = cache(async (): Promise<SeoKeywordRow[]> => {
  try {
    await seedIfEmpty();
    return db.select().from(seoKeywords).orderBy(seoKeywords.pagePath, seoKeywords.sortOrder, seoKeywords.id);
  } catch {
    return DEFAULT_SEO_KEYWORDS.map((item, index) => ({
      id: -(index + 1), key: item.key, label: item.label, keyword: item.keyword,
      pagePath: item.pagePath, bold: item.bold, enabled: item.enabled,
      sortOrder: item.sortOrder, updatedAt: new Date(0), updatedBy: null,
    }));
  }
});

// This map is intentionally read directly from Postgres on each server render.
// The admin dashboard must see keyword changes immediately after saving; a
// long-lived server cache can otherwise make the old keyword appear to
// "come back" after a successful update.
export async function getSeoKeywordMap(): Promise<Record<string, SeoKeywordRow>> {
  const rows = await getSeoKeywordRows();
  return Object.fromEntries(rows.filter((r) => r.enabled).map((r) => [r.key, r]));
}

export async function getSeoKeyword(key: string, fallback: string): Promise<SeoKeywordRow> {
  const map = await getSeoKeywordMap();
  return map[key] ?? {
    id: -1, key, label: key, keyword: fallback, pagePath: "global", bold: true,
    enabled: true, sortOrder: 0, updatedAt: new Date(0), updatedBy: null,
  };
}

export async function updateSeoKeywordValue(id: number, keyword: string, bold: boolean, enabled: boolean, updatedBy: number) {
  const value = keyword.trim();
  if (!Number.isInteger(id) || id <= 0 || !value || value.length > 160) throw new Error("invalid");
  await db.update(seoKeywords).set({ keyword: value, bold, enabled, updatedAt: new Date(), updatedBy }).where(eq(seoKeywords.id, id));
}
