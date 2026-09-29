"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The public marketing site (Header, Footer, floating WhatsApp button) is
 * rendered for every route except /admin/**, which has its own dashboard
 * layout (see app/admin/layout.tsx). This keeps a single root layout —
 * avoiding a structural rewrite of the whole app directory into route
 * groups — while still fully separating the two experiences: nothing about
 * the existing public pages' markup or behavior changes.
 *
 * PHASE 7: header/footer/floatingWhatsApp are now passed in as already-
 * rendered elements from the root layout (a Server Component) instead of
 * being imported and rendered here. Footer and FloatingWhatsApp became
 * async Server Components that read the database-backed business
 * settings — importing and rendering them directly inside this "use
 * client" file would force them into the client bundle and break that.
 * Passing them down as props preserves their server-ness. Header still
 * needs to be a Client Component itself (scroll state, mobile menu), so
 * it's built with its settings props in the root layout and simply placed
 * here too.
 */
export function SiteChrome({
  header,
  footer,
  floatingWhatsApp,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  floatingWhatsApp: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-night"
      >
        Aller au contenu
      </a>
      {header}
      <main id="contenu">{children}</main>
      {footer}
      {floatingWhatsApp}
    </>
  );
}
