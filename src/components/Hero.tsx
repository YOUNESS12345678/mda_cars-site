import { getImageProps } from "next/image";
import { preload } from "react-dom";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { containerClass, btnBaseClass } from "@/lib/ui";
import { WhatsAppButton } from "./WhatsAppButton";
import { SeoKeyword } from "./SeoKeyword";
import { getSiteMediaMap } from "@/lib/site-media";
import { HOME_HEADLINE } from "@/lib/seo-keyword-constants";

/**
 * Homepage hero — full-width vehicle photography (LCP, preloaded, never
 * lazy-loaded) with a bottom-heavy dark scrim for guaranteed contrast.
 */
export async function Hero() {
  const media = await getSiteMediaMap();
  const desktop = media["home.hero.desktop"]?.src || "/images/hero-location-voiture-agadir-mda-car-desktop.webp";
  const mobile = media["home.hero.mobile"]?.src || "/images/hero-location-voiture-agadir-mda-car-mobile.webp";
  const common = {
    alt: "Voiture de location MDA CAR au coucher du soleil sur la route côtière, Souss-Massa",
    fill: true,
    priority: true,
    sizes: "100vw",
  } as const;
  // Art direction: the portrait crop on phones, the landscape crop from sm up.
  // Both go through the Next.js image optimiser (right size + AVIF/WebP for the
  // device) instead of shipping the full-resolution file to phones.
  const { props: mobileProps } = getImageProps({ ...common, src: mobile });
  const { props: desktopProps } = getImageProps({ ...common, src: desktop });
  const { srcSet: mobileSrcSet } = mobileProps;
  const { srcSet: desktopSrcSet, ...imgProps } = desktopProps;
  // Preload only the variant the visitor's screen will actually use.
  preload(mobileProps.src, { as: "image", imageSrcSet: mobileSrcSet, imageSizes: "100vw", media: "(max-width: 639px)", fetchPriority: "high" });
  preload(desktopProps.src, { as: "image", imageSrcSet: desktopSrcSet, imageSizes: "100vw", media: "(min-width: 640px)", fetchPriority: "high" });
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[70svh] items-end overflow-hidden sm:min-h-[82svh] xl:min-h-[85vh]"
    >
      {/* Portrait crop on phones so the car + sunset stay framed instead of
          being squeezed by a landscape image; landscape crop from sm/tablet up. */}
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(max-width: 639px)" srcSet={mobileSrcSet} sizes="100vw" />
        <source media="(min-width: 640px)" srcSet={desktopSrcSet} sizes="100vw" />
        <img {...imgProps} alt={common.alt} className="cinematic-image object-cover object-center" />
      </picture>
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
          className="mt-4 max-w-4xl text-balance text-[36px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[54px] lg:text-[72px] lg:leading-[1.03]"
        >
          <span className="font-extrabold text-white">{HOME_HEADLINE.primary}</span>{" "}&amp;{" "}<span className="font-extrabold text-gold">{HOME_HEADLINE.secondary}</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-steel sm:text-lg">
          MDA CAR vous accompagne à <SeoKeyword keywordKey="home.agadir" fallback="Agadir" className="text-white" />, à l’<SeoKeyword keywordKey="home.airportAgadir" fallback="aéroport Agadir Al Massira" className="text-white" /> et
          dans toute la région de Souss-Massa, avec une <SeoKeyword keywordKey="home.delivery" fallback="livraison de voiture partout au Maroc" className="text-white" /> : des voitures
          propres et entretenues, et un contact simple et direct, sans
          intermédiaire.
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
          <SeoKeyword keywordKey="home.agadir" fallback="Agadir" className="text-white" /> · <SeoKeyword keywordKey="home.airport" fallback="Aéroport" className="text-white" /> · <SeoKeyword keywordKey="home.delivery" fallback="Livraison partout au Maroc" className="text-white" />
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
