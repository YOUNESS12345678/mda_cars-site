import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
// Self-hosted font (no build-time fetch to fonts.googleapis.com — removes a
// real risk of the production build failing behind a firewall/proxy that
// blocks Google Fonts, which would take the whole site offline and out of
// Google's index until re-deployed).
import "@fontsource/sora/300.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import { site } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { SiteChrome } from "@/components/SiteChrome";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Location de voitures à Biougra & Agadir | MDA CAR",
  description:
    "MDA CAR : location de voitures à Biougra, près d’Agadir. Véhicules entretenus, réservation simple par téléphone ou WhatsApp. Biougra, Agadir, Souss-Massa.",
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
export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="fr">
      <body className="font-sans text-cream antialiased">
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd()} />
        <SiteChrome
          header={<Header settings={settings} />}
          footer={<Footer />}
          floatingWhatsApp={<FloatingWhatsApp />}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
