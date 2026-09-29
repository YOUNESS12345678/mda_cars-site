"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { validateCarInput, generateUniqueCarSlug } from "@/lib/cars";
import type { CarFormState } from "./action-state";

function readListField(formData: FormData, name: string): string[] {
  return formData.getAll(name).map((v) => String(v));
}

function readInput(formData: FormData) {
  return {
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    year: String(formData.get("year") ?? ""),
    category: String(formData.get("category") ?? ""),
    pricePerDay: String(formData.get("pricePerDay") ?? ""),
    transmission: String(formData.get("transmission") ?? ""),
    fuel: String(formData.get("fuel") ?? ""),
    seats: String(formData.get("seats") ?? ""),
    description: String(formData.get("description") ?? ""),
    images: readListField(formData, "images"),
    features: readListField(formData, "features"),
    isAvailable: formData.get("isAvailable") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

export async function createCarAction(
  _prevState: CarFormState,
  formData: FormData,
): Promise<CarFormState> {
  await requireAdminAction();

  const { values, errors } = validateCarInput(readInput(formData));
  if (!values) {
    return { error: "Merci de corriger les champs en surbrillance.", fieldErrors: errors };
  }

  let newId: number;
  try {
    const slug = await generateUniqueCarSlug(values.brand, values.model, values.year);
    const [created] = await db
      .insert(cars)
      .values({
        slug,
        name: `${values.brand} ${values.model}`.trim(),
        brand: values.brand,
        model: values.model,
        year: values.year,
        category: values.category || null,
        transmission: values.transmission,
        fuelType: values.fuel,
        seats: values.seats,
        pricePerDay: values.pricePerDay,
        imageUrl: values.images[0] ?? null,
        images: values.images,
        features: values.features,
        description: values.description || null,
        isAvailable: values.isAvailable,
        isHidden: !values.isPublished,
      })
      .returning({ id: cars.id });
    newId = created.id;
  } catch {
    return { error: "Impossible d'ajouter le véhicule.", fieldErrors: {} };
  }

  revalidatePath("/admin/cars");
  // PHASE 7: public fleet pages read this table through the cached
  // getPublishedCars() — invalidate that tag (only) so the new car appears
  // publicly without waiting for a rebuild or invalidating other routes.
  updateTag("cars-public");
  redirect(`/admin/cars?created=${newId}`);
}

export async function updateCarAction(
  _prevState: CarFormState,
  formData: FormData,
): Promise<CarFormState> {
  await requireAdminAction();

  const carId = Number(formData.get("carId"));
  if (!Number.isInteger(carId) || carId <= 0) {
    return { error: "Ce véhicule n'existe pas.", fieldErrors: {} };
  }

  const { values, errors } = validateCarInput(readInput(formData));
  if (!values) {
    return { error: "Merci de corriger les champs en surbrillance.", fieldErrors: errors };
  }

  try {
    // Verify the car actually exists server-side before mutating —
    // never trust a client-supplied id blindly.
    const existing = await db
      .select({ id: cars.id })
      .from(cars)
      .where(eq(cars.id, carId))
      .limit(1);
    if (existing.length === 0) {
      return { error: "Ce véhicule n'existe pas.", fieldErrors: {} };
    }

    await db
      .update(cars)
      .set({
        name: `${values.brand} ${values.model}`.trim(),
        brand: values.brand,
        model: values.model,
        year: values.year,
        category: values.category || null,
        transmission: values.transmission,
        fuelType: values.fuel,
        seats: values.seats,
        pricePerDay: values.pricePerDay,
        imageUrl: values.images[0] ?? null,
        images: values.images,
        features: values.features,
        description: values.description || null,
        isAvailable: values.isAvailable,
        isHidden: !values.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId));
  } catch {
    return { error: "Impossible de modifier ce véhicule.", fieldErrors: {} };
  }

  revalidatePath("/admin/cars");
  updateTag("cars-public");
  redirect("/admin/cars?updated=1");
}

async function findCarOr(carId: unknown): Promise<{ id: number } | null> {
  const id = Number(carId);
  if (!Number.isInteger(id) || id <= 0) return null;
  const rows = await db.select({ id: cars.id }).from(cars).where(eq(cars.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteCarAction(formData: FormData): Promise<void> {
  await requireAdminAction();

  const car = await findCarOr(formData.get("carId"));
  if (!car) {
    // Nothing to delete — fail silently server-side rather than throwing
    // for what is very likely a stale/duplicate submission.
    revalidatePath("/admin/cars");
    return;
  }

  // Hard delete is safe here: reservations.carId is defined with
  // `onDelete: "set null"`, so any future reservation referencing this car
  // is preserved and simply loses its car link instead of being destroyed.
  await db.delete(cars).where(eq(cars.id, car.id));
  revalidatePath("/admin/cars");
  updateTag("cars-public");
}

export async function toggleAvailabilityAction(formData: FormData): Promise<void> {
  await requireAdminAction();

  const car = await findCarOr(formData.get("carId"));
  if (!car) return;
  const nextAvailable = formData.get("nextAvailable") === "true";

  await db
    .update(cars)
    .set({ isAvailable: nextAvailable, updatedAt: new Date() })
    .where(eq(cars.id, car.id));
  revalidatePath("/admin/cars");
  updateTag("cars-public");
}

export async function toggleVisibilityAction(formData: FormData): Promise<void> {
  await requireAdminAction();

  const car = await findCarOr(formData.get("carId"));
  if (!car) return;
  const nextHidden = formData.get("nextHidden") === "true";

  await db
    .update(cars)
    .set({ isHidden: nextHidden, updatedAt: new Date() })
    .where(eq(cars.id, car.id));
  revalidatePath("/admin/cars");
  updateTag("cars-public");
}
