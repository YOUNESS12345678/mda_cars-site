import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { containerClass, btnBaseClass } from "@/lib/ui";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * Homepage hero — full-width vehicle photography (LCP, preloaded, never
 * lazy-loaded) with a bottom-heavy dark scrim for guaranteed contrast.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[70svh] items-end overflow-hidden sm:min-h-[82svh] xl:min-h-[85vh]"
    >
      {/* Portrait crop on phones so the car + sunset stay framed instead of
          being squeezed by a landscape image; landscape crop from sm/tablet up. */}
      <Image
        src="/images/hero-location-voiture-biougra-mda-car-mobile.webp"
        alt="Voiture de location MDA CAR au coucher du soleil sur la route côtière, Souss-Massa"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="cinematic-image object-cover object-[75%_center] sm:hidden"
      />
      <Image
        src="/images/hero-location-voiture-biougra-mda-car-desktop.webp"
        alt="Voiture de location MDA CAR au coucher du soleil sur la route côtière, Souss-Massa"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="cinematic-image hidden object-cover object-center sm:block"
      />
      {/* Scrim: top hairline for header legibility + heavy bottom for text */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/10 to-night/40"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/15"
      />

      <div
        className={`${containerClass} hero-stagger relative z-10 pb-16 pt-24 md:pb-24 md:pt-28`}
      >
        <p className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
          <span className="hairline-gold" aria-hidden />
          MDA CAR · Location de voitures
        </p>
        <h1
          id="hero-title"
          className="mt-4 max-w-3xl text-[30px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[44px] lg:text-[56px] lg:leading-[1.05]"
        >
          Location de voitures à{" "}
          <span className="text-gold">Biougra</span> &amp;{" "}
          <span className="text-gold">Agadir</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-steel sm:text-lg">
          MDA CAR vous accompagne dans tous vos déplacements à Biougra, Agadir
          et dans la région de Souss-Massa : des voitures propres et
          entretenues, et un contact simple et direct, sans intermédiaire.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="#reservation"
            className={`${btnBaseClass} btn-sweep bg-gold text-night hover:bg-gold-hover`}
          >
            Réserver maintenant
          </Link>
          <Link
            href="/nos-voitures"
            className={`${btnBaseClass} border border-line-strong text-cream transition-colors hover:border-line-gold hover:text-gold`}
          >
            Voir nos voitures
          </Link>
          <WhatsAppButton />
        </div>

        <p className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.02em] text-steel">
          <MapPin className="h-4 w-4 text-gold" aria-hidden />
          Biougra · Agadir · Souss-Massa, Maroc
        </p>
      </div>

      {/* Refined scroll cue — decorative only, disabled under reduced motion via
          the global .scroll-cue rule inheriting prefers-reduced-motion handling. */}
      <div
        aria-hidden
        className="scroll-cue absolute inset-x-0 bottom-6 z-10 hidden justify-center sm:flex"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-line-strong/70 p-1.5">
          <span className="h-1.5 w-1 rounded-full bg-gold" />
        </div>
      </div>
    </section>
  );
}
