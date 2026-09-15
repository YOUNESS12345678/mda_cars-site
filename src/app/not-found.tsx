import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { containerClass, btnBaseClass } from "@/lib/ui";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Page introuvable (404) | MDA CAR",
  description:
    "La page que vous recherchez n’existe pas ou a été déplacée. Retournez à l’accueil ou découvrez les voitures MDA CAR à Biougra.",
  robots: { index: false, follow: false },
};

/**
 * Branded 404 — Next.js serves this with a real HTTP 404 status.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center bg-obsidian">
      <div className={`${containerClass} flex flex-col items-start gap-6 py-24`}>
        <p
          aria-hidden
          className="text-7xl font-extrabold tracking-tight text-gold sm:text-8xl"
        >
          404
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Cette page est introuvable
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-steel">
          La page que vous recherchez n’existe pas, a été déplacée ou le lien
          est incomplet. Vous pouvez retourner à l’accueil, parcourir nos
          voitures ou nous contacter directement.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/"
            className={`${btnBaseClass} bg-gold text-night hover:bg-gold-hover`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour à l’accueil
          </Link>
          <Link
            href="/nos-voitures"
            className={`${btnBaseClass} border border-line-strong text-cream hover:border-line-gold hover:text-gold`}
          >
            Voir nos voitures
          </Link>
          <WhatsAppButton />
        </div>
      </div>
    </section>
  );
}
