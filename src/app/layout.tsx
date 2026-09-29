import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
// Self-hosted font (no build-time fetch to fonts.googleapis.com — removes a
// real risk of the production build failing behind a firewall/proxy that
// blocks Google Fonts, which would take the whole site offline and out of
// Google's index until re-deployed).
import "@fontsource/sora/latin-400.css";
import "@fontsource/sora/latin-500.css";
import "@fontsource/sora/latin-600.css";
import "@fontsource/sora/latin-700.css";
import "@fontsource/sora/latin-800.css";
import { site } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { SiteChrome } from "@/components/SiteChrome";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getSiteMediaMap } from "@/lib/site-media";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: "MDA CAR",
  creator: "MDA CAR",
  publisher: "MDA CAR",
  category: "travel",
  formatDetection: { telephone: true },
  title: "Location de voitures à Agadir | MDA CAR",
  description:
    "MDA CAR : location de voitures à Agadir, aéroport Al Massira compris, avec livraison possible partout au Maroc. Réservation via formulaire en ligne, avec confirmation directe par MDA CAR.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  viewportFit: "cover",
};

/** PHASE 7: fetches the database-backed business settings once here (the
 *  root layout renders on every route) and passes them down — to Header
 *  (a Client Component, so it needs plain serializable props) and,
 *  implicitly, to Footer/FloatingWhatsApp, which fetch the same cached
 *  settings themselves since they're Server Components. */
// Public pages are statically generated and refreshed hourly (ISR); admin
// mutations invalidate the relevant cache tags immediately.
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [settings, media] = await Promise.all([getSiteSettings(), getSiteMediaMap()]);
  const logoSrc = media["logo"]?.src || "/images/mda-car-logo.webp";

  return (
    <html lang="fr">
      <body className="font-sans text-cream antialiased">
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd()} />
        <SiteChrome
          header={<Header settings={settings} logoSrc={logoSrc} />}
          footer={<Footer />}
          floatingWhatsApp={<FloatingWhatsApp />}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
