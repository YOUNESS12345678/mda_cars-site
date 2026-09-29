import "server-only";

import { redirect } from "next/navigation";
import { getSessionAdmin, type SessionAdmin } from "./session";

/**
 * Call at the top of any admin Server Component (layout or page) that must
 * not render for a signed-out visitor. Redirects to /admin/login when there
 * is no valid session — this is the primary route protection, enforced on
 * the server, not just hidden client-side.
 */
export async function requireAdminPage(): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

/**
 * Call at the top of any admin Server Action or Route Handler that
 * mutates or reads protected data. Throws instead of redirecting, since
 * Server Actions/Route Handlers should fail explicitly rather than
 * attempt a navigation. Every future admin server action (cars,
 * reservations, settings, etc.) must start with this call.
 */
export async function requireAdminAction(): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}
