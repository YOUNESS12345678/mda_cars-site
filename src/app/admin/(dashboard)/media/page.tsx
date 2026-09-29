import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import { getSiteMediaRows } from "@/lib/site-media";
import { MediaForm } from "./MediaForm";

export const metadata: Metadata = {
  title: "Images | MDA CAR Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MediaAdminPage() {
  const rows = (await getSiteMediaRows()).filter((row) => row.key !== "fallback.vehicle");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
          <ImageIcon className="h-6 w-6 text-gold" /> Images du site
        </h1>
        <p className="mt-1 max-w-3xl text-[15px] leading-relaxed text-steel">
          Remplacez une image directement depuis votre PC ou téléphone. Le fichier est envoyé dans Vercel Blob et son URL est enregistrée automatiquement.
        </p>
      </div>

      <div className="rounded-lg border border-line-gold/40 bg-gold/5 p-4 text-[13px] leading-relaxed text-steel">
        <strong className="text-white">Upload recommandé :</strong> JPG, PNG, WebP ou AVIF, jusqu’à 10 Mo. Après enregistrement, la nouvelle image est utilisée immédiatement sur les pages concernées.
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {rows.map((row) => (
          <MediaForm key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
