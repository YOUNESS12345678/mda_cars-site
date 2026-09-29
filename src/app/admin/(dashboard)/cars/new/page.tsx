import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CarForm } from "../CarForm";

export const metadata: Metadata = {
  title: "Ajouter un véhicule | MDA CAR Admin",
  robots: { index: false, follow: false },
};

export default function NewCarPage() {
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
          Ajouter un véhicule
        </h1>
        <p className="mt-1 text-[15px] text-steel">
          Renseignez les informations du véhicule à ajouter au parc.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-coal p-5 sm:p-6">
        <CarForm />
      </div>
    </div>
  );
}
