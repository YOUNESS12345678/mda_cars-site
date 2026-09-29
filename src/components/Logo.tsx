import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false, src = "/images/mda-car-logo.webp" }: { compact?: boolean; src?: string }) {
  return (
    <Link href="/" aria-label="MDA CAR — retour à l’accueil" className="group inline-flex min-w-0 shrink-0 items-center">
      <Image
        src={src}
        alt="MDA CAR — Location de voiture"
        width={compact ? 94 : 112}
        height={compact ? 39 : 46}
        priority={!compact}
        className={`h-auto w-auto max-w-full object-contain transition-opacity duration-200 group-hover:opacity-90 ${compact ? "max-h-9" : "max-h-11"}`}
      />
    </Link>
  );
}
