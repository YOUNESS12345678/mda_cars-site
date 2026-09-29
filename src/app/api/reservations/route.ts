import { db } from "@/db";
import { eq } from "drizzle-orm";
import { reservations } from "@/db/schema";
import { resolveCarId, validatePublicReservationInput } from "@/lib/reservations";
import { createNewReservationNotification } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Public reservation submission. Mirrors /api/leads/route.ts's shape and
 * safety posture (backup log for a WhatsApp-first flow), but writes to the
 * `reservations` table so /admin/reservations can manage the request
 * through a status workflow (new → contacted → confirmed/cancelled →
 * completed) instead of only appearing as a raw lead.
 *
 * The client never sets status, createdAt, or any admin/authorization
 * field — the server decides all of that. Excluded from the sitemap and
 * disallowed in robots.txt (see src/app/robots.ts, "/api" is disallowed).
 */
export async function POST(request: Request) {
  if (!checkRateLimit(request, "reservations")) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { values, errors } = validatePublicReservationInput({
    name: typeof body.name === "string" ? body.name : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    city: typeof body.city === "string" ? body.city : "",
    serviceType: typeof body.serviceType === "string" ? body.serviceType : undefined,
    airport: typeof body.airport === "string" ? body.airport : undefined,
    vehicleLabel: typeof body.vehicle === "string" ? body.vehicle : undefined,
    carSlug: typeof body.carSlug === "string" ? body.carSlug : undefined,
    pickupDate: typeof body.pickupDate === "string" ? body.pickupDate : undefined,
    returnDate: typeof body.returnDate === "string" ? body.returnDate : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    source: typeof body.source === "string" ? body.source : undefined,
    requestId: typeof body.requestId === "string" ? body.requestId : undefined,
  });

  if (!values) {
    return Response.json(
      { ok: false, error: "invalid_fields", fieldErrors: errors },
      { status: 400 },
    );
  }

  try {
    if (values.requestId) {
      const existing = await db.select({ id: reservations.id }).from(reservations).where(eq(reservations.requestId, values.requestId)).limit(1);
      if (existing[0]) return Response.json({ ok: true, duplicate: true });
    }

    // Best-effort link to the real fleet (see resolveCarId's doc comment
    // for why this frequently won't match today). When it doesn't, the
    // requested vehicle name is preserved in `notes` so nothing is lost.
    const carId = await resolveCarId({
      carSlug: values.carSlug,
      vehicleLabel: values.vehicleLabel,
    });

    const noteParts: string[] = [];
    if (values.serviceType) noteParts.push(`Service : ${values.serviceType}`);
    if (values.airport) noteParts.push(`Aéroport : ${values.airport}`);
    if (!carId && values.vehicleLabel) {
      noteParts.push(`Véhicule demandé : ${values.vehicleLabel}`);
    }
    if (values.message) noteParts.push(values.message);

    // PHASE 5: reservation + admin notification are created atomically.
    // The browser only ever submits the reservation — it has no way to
    // create its own admin notification (see §7/§8 of the Phase 5 brief).
    // If the notification insert fails, the whole transaction rolls back
    // rather than leaving a reservation with no admin-facing alert.
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(reservations)
        .values({
          requestId: values.requestId,
          carId,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          customerCity: values.customerCity,
          serviceType: values.serviceType,
          airport: values.airport,
          // Email is intentionally not collected by the public rental form.
          customerEmail: null,
          pickupDate: values.pickupDate,
          returnDate: values.returnDate,
          notes: noteParts.length > 0 ? noteParts.join("\n\n") : null,
          source: values.source,
          status: "new",
        })
        .returning({ id: reservations.id });

      await createNewReservationNotification(tx, created.id);
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "storage_failed" }, { status: 500 });
  }
}
