import type { Metadata } from "next";
import { site } from "./site";

/** Branded OG image rendered by src/app/og/route.tsx */
export function ogImageUrl(title?: string): string {
  const base = `${site.url}/og`;
  return title ? `${base}?title=${encodeURIComponent(title)}` : base;
}

type PageMetadataInput = {
  /** Absolute, unique page title (no template appending). */
  title: string;
  /** Unique, human-sounding description (~120–158 chars). */
  description: string;
  /** Canonical path, e.g. "/nos-voitures". */
  path: string;
  /** Text rendered inside the OG image (defaults to title). */
  ogTitle?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  ogTitle,
}: PageMetadataInput): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "fr_MA",
      images: [
        {
          url: ogImageUrl(ogTitle ?? title),
          width: 1200,
          height: 630,
          alt: `${site.name} — ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl(ogTitle ?? title)],
    },
  };
}
