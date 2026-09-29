"use server";

import { revalidatePath, updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { businessSettings } from "@/db/schema";
import { requireAdminAction } from "@/lib/auth/require-admin";
import {
  validateBusinessSettingsInput,
  OPENING_HOURS_DAYS,
  type BusinessSettingsFieldErrors,
  type OpeningHoursEntry,
} from "@/lib/business-settings";

export type SettingsState = {
  error: string | null;
  success: boolean;
  fieldErrors: BusinessSettingsFieldErrors;
};

function readOpeningHours(formData: FormData): OpeningHoursEntry[] {
  return OPENING_HOURS_DAYS.map((day, index) => ({
    day,
    hours: String(formData.get(`openingHours.${index}.hours`) ?? ""),
  }));
}

function readInput(formData: FormData) {
  return {
    businessName: String(formData.get("businessName") ?? ""),
    phoneDisplay: String(formData.get("phoneDisplay") ?? ""),
    phoneInternational: String(formData.get("phoneInternational") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    latitude: String(formData.get("latitude") ?? ""),
    longitude: String(formData.get("longitude") ?? ""),
    openingHours: readOpeningHours(formData),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    websiteUrl: String(formData.get("websiteUrl") ?? ""),
  };
}

export async function updateBusinessSettingsAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  // Defense in depth: the (dashboard) layout already blocks signed-out
  // visitors from reaching this page, but every admin server action must
  // independently verify the session too. Nothing about who is allowed to
  // save is ever taken from the submitted form data.
  const admin = await requireAdminAction();

  const settingsId = Number(formData.get("settingsId"));
  if (!settingsId) {
    return {
      error: "Réglages introuvables.",
      success: false,
      fieldErrors: {},
    };
  }

  const { values, errors } = validateBusinessSettingsInput(readInput(formData));
  if (!values) {
    return {
      error: "Veuillez vérifier les informations saisies.",
      success: false,
      fieldErrors: errors,
    };
  }

  try {
    await db
      .update(businessSettings)
      .set({
        businessName: values.businessName,
        phoneDisplay: values.phoneDisplay,
        phoneInternational: values.phoneInternational,
        whatsappNumber: values.whatsappNumber,
        email: values.email || null,
        address: values.address || null,
        city: values.city || null,
        postalCode: values.postalCode || null,
        latitude: values.latitude === "" ? null : Number(values.latitude),
        longitude: values.longitude === "" ? null : Number(values.longitude),
        openingHours: values.openingHours,
        facebookUrl: values.facebookUrl || null,
        instagramUrl: values.instagramUrl || null,
        websiteUrl: values.websiteUrl || null,
        updatedAt: new Date(),
        updatedBy: admin.id,
      })
      .where(eq(businessSettings.id, settingsId));
  } catch {
    // Never leak stack traces, DB errors, or paths to the admin UI.
    return {
      error: "Impossible d'enregistrer les modifications.",
      success: false,
      fieldErrors: {},
    };
  }

  revalidatePath("/admin/settings");
  // PHASE 7: the public site (Header, Footer, WhatsApp/phone links, opening
  // hours, social links, JSON-LD) reads settings via the cached
  // getSiteSettings() — invalidate that tag so the next public request (and
  // any statically-rendered public page that used it) picks up the change.
  // Scoped to this one tag only — no unrelated route is invalidated.
  updateTag("site-settings");
  return { error: null, success: true, fieldErrors: {} };
}
