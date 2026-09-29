"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireAdminAction } from "@/lib/auth/require-admin";

export type AccountSettingsState = {
  error: string | null;
  success: boolean;
  fieldErrors: {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
};

const INITIAL_STATE: AccountSettingsState = {
  error: null,
  success: false,
  fieldErrors: {},
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function updateAccountSettingsAction(
  _prevState: AccountSettingsState,
  formData: FormData,
): Promise<AccountSettingsState> {
  const admin = await requireAdminAction();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: AccountSettingsState["fieldErrors"] = {};

  if (!isValidEmail(email)) {
    fieldErrors.email = "Veuillez saisir une adresse email valide.";
  }

  if (!currentPassword) {
    fieldErrors.currentPassword = "Le mot de passe actuel est requis.";
  }

  const changingPassword = newPassword.length > 0 || confirmPassword.length > 0;

  if (changingPassword) {
    if (newPassword.length < 8) {
      fieldErrors.newPassword =
        "Le nouveau mot de passe doit contenir au moins 8 caractères.";
    }

    if (newPassword !== confirmPassword) {
      fieldErrors.confirmPassword =
        "Les nouveaux mots de passe ne correspondent pas.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, success: false, fieldErrors };
  }

  try {
    const rows = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        passwordHash: adminUsers.passwordHash,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, admin.id))
      .limit(1);

    const account = rows[0];

    // Do not reveal whether the account exists or expose database details.
    if (!account || !(await verifyPassword(currentPassword, account.passwordHash))) {
      return {
        error: "Le mot de passe actuel est incorrect.",
        success: false,
        fieldErrors: { currentPassword: "Le mot de passe actuel est incorrect." },
      };
    }

    if (email !== account.email.toLowerCase()) {
      const existing = await db
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1);

      if (existing.length > 0 && existing[0].id !== account.id) {
        return {
          error: "Cette adresse email est déjà utilisée.",
          success: false,
          fieldErrors: { email: "Cette adresse email est déjà utilisée." },
        };
      }
    }

    const updates: {
      email: string;
      updatedAt: Date;
      passwordHash?: string;
    } = {
      email,
      updatedAt: new Date(),
    };

    if (changingPassword) {
      updates.passwordHash = await hashPassword(newPassword);
    }

    await db
      .update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, account.id));

    revalidatePath("/admin");
    revalidatePath("/admin/settings");

    return { ...INITIAL_STATE, success: true };
  } catch {
    return {
      error: "Impossible d'enregistrer les modifications.",
      success: false,
      fieldErrors: {},
    };
  }
}
