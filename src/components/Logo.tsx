import Link from "next/link";

/**
 * Text-based brand mark. TO CONFIRM BEFORE LAUNCH: swap in the real MDA CAR
 * logo file (the Instagram/Facebook assets were not programmatically
 * accessible during the build) and re-sample the exact gold hex.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="MDA CAR — retour à l’accueil"
      className="group inline-flex items-center gap-2.5"
    >
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line-gold bg-coal transition-colors duration-200 group-hover:border-gold"
      >
        <span className="text-xs font-extrabold tracking-tight text-gold">
          M
        </span>
      </span>
      <span className="leading-none">
        <span className="block text-base font-extrabold tracking-tight text-white">
          MDA <span className="text-gold">CAR</span>
        </span>
        {!compact && (
          <span className="mt-0.5 hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-steel min-[400px]:block">
            Location de voitures
          </span>
        )}
      </span>
    </Link>
  );
}
