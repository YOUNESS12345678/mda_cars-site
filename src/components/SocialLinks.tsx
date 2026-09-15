/** Brand icons (lucide no longer ships brand marks) — inline SVG, currentColor. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

type SocialLinksProps = {
  instagramUrl: string;
  facebookUrl: string;
  className?: string;
};

/** PHASE 7: instagramUrl/facebookUrl are now passed in (resolved from the
 *  database-backed business settings by the caller) instead of being read
 *  directly from the static lib/site.ts constant — this component is used
 *  both from a Server Component (Footer) and from a Client Component
 *  (MobileMenu), so it stays a plain, data-in component rather than
 *  fetching for itself. */
export function SocialLinks({ instagramUrl, facebookUrl, className = "" }: SocialLinksProps) {
  const linkClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-steel transition-colors duration-200 hover:border-line-gold hover:text-gold";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="MDA CAR sur Instagram"
        className={linkClass}
      >
        <InstagramIcon className="h-5 w-5" />
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="MDA CAR sur Facebook"
        className={linkClass}
      >
        <FacebookIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
