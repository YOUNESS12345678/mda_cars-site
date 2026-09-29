import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { cars } from "@/db/schema";
import { CarForm } from "../../CarForm";

export const metadata: Metadata = {
  title: "Modifier un véhicule | MDA CAR Admin",
  robots: { index: false, follow: false },
};

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const carId = Number(id);

  // Never trust a client-supplied id: validate shape, then verify existence
  // server-side before rendering anything derived from it.
  if (!Number.isInteger(carId) || carId <= 0) {
    notFound();
  }

  const [car] = await db.select().from(cars).where(eq(cars.id, carId)).limit(1);
  if (!car) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/cars"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-steel hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Retour aux voitures
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Modifier {car.brand} {car.model}
        </h1>
        <p className="mt-1 text-[15px] text-steel">
          Mettez à jour les informations de ce véhicule.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
        <CarForm car={car} />
      </div>
    </div>
  );
}
