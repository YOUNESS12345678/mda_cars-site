import Link from "next/link";
import { ExternalLink, PenLine, Star } from "lucide-react";
import { containerClass, sectionClass, btnBaseClass } from "@/lib/ui";
import { site } from "@/lib/site";
import { reviews, reviewsAverage } from "@/lib/reviews";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-gold text-gold" : "text-line-strong"}`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section
      aria-labelledby="avis-title"
      className="border-t border-line bg-coal"
    >
      <div className={`${containerClass} ${sectionClass}`}>
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Avis clients"
              title="Ce que disent les clients de MDA CAR"
              description="Des avis publiés directement sur la fiche Google de l’agence — aucun avis n’est écrit ou modifié par MDA CAR."
            />
            <div className="flex shrink-0 items-center gap-3 rounded-lg border border-line bg-night px-4 py-3">
              <Stars rating={Math.round(reviewsAverage)} />
              <span className="text-[15px] font-semibold text-white">
                {reviewsAverage.toFixed(1)}/5
              </span>
              <span className="text-[13px] text-steel-dark">
                sur Google
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-7">
          {reviews.map((review, index) => (
            <Reveal key={review.author} delay={index * 80}>
              <figure className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-lg border border-line border-t-2 border-t-gold/40 bg-night p-6 transition-colors duration-300 hover:border-line-gold hover:border-t-gold">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-3 font-serif text-7xl leading-none text-gold/10"
                >
                  &rdquo;
                </span>
                <Stars rating={review.rating} />
                <blockquote className="relative flex-1 text-[15px] leading-relaxed text-steel">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="flex items-center justify-between gap-3 border-t border-line pt-4">
                  <Link
                    href={review.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-[14px] font-semibold text-white transition-colors duration-200 hover:text-gold"
                  >
                    {review.author}
                  </Link>
                  <span className="text-[12px] uppercase tracking-[0.1em] text-steel-dark">
                    Avis {review.source}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={240} className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href={site.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBaseClass} border border-line-strong text-cream hover:border-line-gold hover:text-gold`}
          >
            Voir tous les avis sur Google Maps
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={site.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBaseClass} bg-gold text-night hover:bg-gold-hover`}
          >
            Laisser votre avis
            <PenLine className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
        <p className="mt-3 text-[13px] text-steel-dark">
          Le bouton « Laisser votre avis » ouvre la fiche Google de MDA CAR :
          appuyez ensuite sur « Rédiger un avis » pour partager votre
          expérience.
        </p>
      </div>
    </section>
  );
}
