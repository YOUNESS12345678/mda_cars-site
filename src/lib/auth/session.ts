import "server-only";

import { randomBytes, createHash, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";

/**
 * Admin dashboard sessions.
 *
 * The cookie holds ONLY an opaque random token, never a database id or
 * anything else predictable. The database never stores that raw token —
 * only its SHA-256 hash — so a stolen backup/leak of admin_sessions can't
 * be replayed directly as a valid cookie. Sessions are revocable at any
 * time by deleting the row (used on logout).
 */

export const SESSION_COOKIE_NAME = "mda_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Constant-time string compare (defense in depth; the DB lookup by hash
 *  already avoids most timing concerns, but this keeps any future direct
 *  comparisons safe too). */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type SessionAdmin = {
  id: number;
  email: string;
  name: string | null;
  role: string;
};

/** Creates a new session for the given admin user and sets the cookie.
 *  Call only after credentials have already been verified. */
export async function createSession(adminUserId: number): Promise<void> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const headerList = await headers();
  await db.insert(adminSessions).values({
    adminUserId,
    tokenHash,
    userAgent: headerList.get("user-agent")?.slice(0, 300) ?? null,
    ipAddress:
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 100) ??
      null,
    expiresAt,
  });

  const cookieStore = await cookies();
  // Keep the session cookie secure on real HTTPS deployments, but allow
  // local `next start` testing over http://localhost. A production build
  // is commonly tested locally with `npm run start`, where forcing the
  // Secure flag would prevent the browser from sending the session cookie
  // to protected API routes such as the car image uploader.
  const forwardedProto = headerList.get("x-forwarded-proto");
  const host = headerList.get("host") ?? "";
  const isHttps = forwardedProto === "https" || host.startsWith("https://");
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? isHttps : false,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Reads the session cookie (if any), validates it against the database,
 *  and returns the associated admin user, or null if there is no valid,
 *  unexpired session. Safe to call from Server Components, Server Actions,
 *  and Route Handlers. */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);

  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Deletes the current session (server-side) and clears the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
