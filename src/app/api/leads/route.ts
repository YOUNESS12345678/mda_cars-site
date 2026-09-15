import { db } from "@/db";
import { leads } from "@/db/schema";

export const dynamic = "force-dynamic";

const LIMITS = {
  name: 120,
  phone: 40,
  message: 2000,
  vehicle: 120,
  date: 20,
  source: 60,
} as const;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Backup log for rental/contact requests. The primary channel is WhatsApp —
 * this endpoint mirrors the request server-side so no lead is ever lost.
 * Excluded from the sitemap and disallowed in robots.txt.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = clean(body.name, LIMITS.name);
  const phone = clean(body.phone, LIMITS.phone);
  if (!name || !phone) {
    return Response.json(
      { ok: false, error: "missing_fields" },
      { status: 400 },
    );
  }

  try {
    await db.insert(leads).values({
      name,
      phone,
      message: clean(body.message, LIMITS.message) || null,
      vehicle: clean(body.vehicle, LIMITS.vehicle) || null,
      pickupDate: clean(body.pickupDate, LIMITS.date) || null,
      returnDate: clean(body.returnDate, LIMITS.date) || null,
      source: clean(body.source, LIMITS.source) || "website",
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }
}
