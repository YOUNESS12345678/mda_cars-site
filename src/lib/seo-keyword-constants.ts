export type SeoKeywordDefault = {
  key: string;
  label: string;
  keyword: string;
  pagePath: string;
  bold: boolean;
  enabled: boolean;
  sortOrder: number;
};

export const DEFAULT_SEO_KEYWORDS: SeoKeywordDefault[] = [
  { key: "home.primary", label: "Mot-clé principal accueil", keyword: "Location de voiture depuis Agadir", pagePath: "/", bold: true, enabled: true, sortOrder: 10 },
  { key: "home.agadir", label: "Agadir", keyword: "Agadir", pagePath: "/", bold: true, enabled: true, sortOrder: 20 },
  { key: "home.morocco", label: "Partout au Maroc", keyword: "partout au Maroc", pagePath: "/", bold: true, enabled: true, sortOrder: 30 },
  { key: "home.airport", label: "Aéroport", keyword: "Aéroport", pagePath: "/", bold: true, enabled: true, sortOrder: 40 },
  { key: "home.airportAgadir", label: "Aéroport Agadir Al Massira", keyword: "aéroport Agadir Al Massira", pagePath: "/", bold: true, enabled: true, sortOrder: 50 },
  { key: "home.delivery", label: "Livraison partout au Maroc", keyword: "livraison de voiture partout au Maroc", pagePath: "/", bold: true, enabled: true, sortOrder: 60 },
  { key: "services.agadir", label: "Location de voitures à Agadir", keyword: "Location de voitures à Agadir", pagePath: "/services", bold: true, enabled: true, sortOrder: 10 },
  { key: "services.delivery", label: "Livraison de voitures partout au Maroc", keyword: "Livraison de voitures partout au Maroc", pagePath: "/services", bold: true, enabled: true, sortOrder: 20 },
  { key: "services.airport", label: "Location de voitures à l’aéroport", keyword: "Location de voitures à l’aéroport", pagePath: "/services", bold: true, enabled: true, sortOrder: 30 },
  { key: "service.agadir.vehicle", label: "Voiture de location à Agadir", keyword: "voiture de location à Agadir", pagePath: "/services/location-voiture-agadir", bold: true, enabled: true, sortOrder: 10 },
  { key: "service.agadir.airport", label: "Aéroport Agadir-Al Massira", keyword: "aéroport Agadir-Al Massira", pagePath: "/services/location-voiture-agadir", bold: true, enabled: true, sortOrder: 20 },
  { key: "service.agadir.delivery", label: "Livraison dans d’autres villes du Maroc", keyword: "livraison du véhicule dans d’autres villes du Maroc", pagePath: "/services/location-voiture-agadir", bold: true, enabled: true, sortOrder: 30 },
  { key: "service.delivery.primary", label: "Livraison de voitures partout au Maroc", keyword: "livraison de voitures partout au Maroc", pagePath: "/services/livraison-voiture-maroc", bold: true, enabled: true, sortOrder: 10 },
  { key: "service.delivery.city", label: "Ville", keyword: "ville", pagePath: "/services/livraison-voiture-maroc", bold: true, enabled: true, sortOrder: 20 },
  { key: "service.delivery.label", label: "Livraison partout au Maroc", keyword: "Livraison partout au Maroc", pagePath: "/services/livraison-voiture-maroc", bold: true, enabled: true, sortOrder: 30 },
  { key: "service.airport.primary", label: "Location de voitures à l’aéroport", keyword: "location de voitures à l’aéroport", pagePath: "/services/location-voiture-aeroport", bold: true, enabled: true, sortOrder: 10 },
  { key: "service.airport.word", label: "Aéroport", keyword: "aéroport", pagePath: "/services/location-voiture-aeroport", bold: true, enabled: true, sortOrder: 20 },
  { key: "service.airport.agadir", label: "Aéroport Agadir-Al Massira", keyword: "aéroport Agadir-Al Massira", pagePath: "/services/location-voiture-aeroport", bold: true, enabled: true, sortOrder: 30 },
];

/** Home headline — fixed in code (NOT read from the database) so that an old
 *  value saved in the admin can never bring back the previous wording. */
export const HOME_HEADLINE = {
  primary: "Location de voiture depuis Agadir",
  secondary: "partout au Maroc",
} as const;
