"use server";

import { revalidatePath, updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteMedia } from "@/db/schema";
import { requireAdminAction } from "@/lib/auth/require-admin";

export async function updateSiteMediaAction(formData: FormData) {
  const admin = await requireAdminAction();
  const id = Number(formData.get("id"));
  const alt = String(formData.get("alt") ?? "").trim();
  const src = String(formData.get("src") ?? "").trim();
  const enabled = formData.get("enabled") === "on";

  if (!Number.isInteger(id) || id <= 0 || !alt || alt.length > 300) {
    throw new Error("Données image invalides.");
  }
  if (!src || src.length > 1000 || !/^https:\/\//i.test(src) && !src.startsWith("/")) {
    throw new Error("L'image n'a pas été envoyée correctement. Choisissez à nouveau un fichier.");
  }

  await db
    .update(siteMedia)
    .set({ src, alt, enabled, updatedAt: new Date(), updatedBy: admin.id })
    .where(eq(siteMedia.id, id));

  updateTag("site-media");
  revalidatePath("/", "layout");
  revalidatePath("/services", "layout");
  revalidatePath("/services/[slug]", "page");
  revalidatePath("/nos-voitures", "layout");
  revalidatePath("/a-propos", "layout");
  revalidatePath("/contact", "layout");
  revalidatePath("/admin/media");
}
