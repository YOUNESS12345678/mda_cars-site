"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import {
  isLocked,
  registerFailedAttempt,
  registerSuccessfulLogin,
} from "@/lib/auth/login-guard";

export type LoginState = {
  error: string | null;
};

const GENERIC_ERROR = "Email ou mot de passe incorrect.";
const LOCKED_ERROR =
  "Trop de tentatives. Ce compte est temporairement bloqué, réessayez dans quelques minutes.";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password || !isValidEmail(email)) {
    return { error: GENERIC_ERROR };
  }

  // Never leak technical/database errors to the login form — any
  // unexpected failure here must still surface as the generic message.
  try {
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);
    const admin = rows[0];

    if (!admin) {
      return { error: GENERIC_ERROR };
    }

    if (isLocked(admin)) {
      return { error: LOCKED_ERROR };
    }

    const passwordMatches = await verifyPassword(password, admin.passwordHash);
    if (!passwordMatches) {
      await registerFailedAttempt(admin.id, admin.failedLoginAttempts);
      return { error: GENERIC_ERROR };
    }

    await registerSuccessfulLogin(admin.id);
    await createSession(admin.id);
  } catch {
    return { error: GENERIC_ERROR };
  }

  redirect("/admin");
}
