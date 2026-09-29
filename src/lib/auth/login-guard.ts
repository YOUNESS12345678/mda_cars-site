import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

/**
 * Basic brute-force protection on the admin login form: after too many
 * consecutive failed attempts, the account is locked for a cooldown period.
 * This is intentionally simple (no external rate-limiting service) but
 * effective against automated password guessing.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 1000 * 60 * 15; // 15 minutes

export function isLocked(admin: {
  lockedUntil: Date | null;
}): boolean {
  return !!admin.lockedUntil && admin.lockedUntil.getTime() > Date.now();
}

export async function registerFailedAttempt(adminUserId: number, currentFailedAttempts: number) {
  const nextCount = currentFailedAttempts + 1;
  const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;

  await db
    .update(adminUsers)
    .set({
      failedLoginAttempts: shouldLock ? 0 : nextCount,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, adminUserId));
}

export async function registerSuccessfulLogin(adminUserId: number) {
  await db
    .update(adminUsers)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, adminUserId));
}
