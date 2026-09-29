import "server-only";

/**
 * Minimal abuse guard for public, unauthenticated POST endpoints
 * (/api/leads, /api/reservations). Deliberately simple, matching the
 * existing brute-force lockout in lib/auth/login-guard.ts: no external
 * rate-limiting service, just enough to stop naive scripted spam.
 *
 * Known limitation: this is in-memory, per server instance. On a
 * multi-instance/serverless deployment it does not share state across
 * instances, so it won't stop a distributed flood — only opportunistic
 * single-source abuse. A shared store (e.g. Redis/Upstash) would be needed
 * for a stronger guarantee; not added here to avoid a new infrastructure
 * dependency in this pass. Fails open on any internal error so a bug in
 * this helper can never block a legitimate reservation or lead.
 */

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 8;

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

// Bound memory use: drop the oldest entries if the map grows large (e.g. a
// long-running instance under sustained distributed traffic).
const MAX_TRACKED_KEYS = 5000;

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip || "unknown";
}

/** Returns true if the request should be allowed, false if it should be
 *  rejected with 429. Never throws. */
export function checkRateLimit(request: Request, routeKey: string): boolean {
  try {
    const key = `${routeKey}:${getClientKey(request)}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now - existing.windowStart > WINDOW_MS) {
      if (buckets.size >= MAX_TRACKED_KEYS) {
        const oldestKey = buckets.keys().next().value;
        if (oldestKey) buckets.delete(oldestKey);
      }
      buckets.set(key, { count: 1, windowStart: now });
      return true;
    }

    if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    existing.count += 1;
    return true;
  } catch {
    // Fail open — never block a real customer because of a bug here.
    return true;
  }
}
