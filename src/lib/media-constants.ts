export type SiteMediaDefault = {
  key: string;
  label: string;
  pagePath: string;
  src: string;
  alt: string;
  sortOrder: number;
};

export const DEFAULT_SITE_MEDIA: SiteMediaDefault[] = [
  { key: "logo", label: "Logo MDA CAR", pagePath: "global", src: "/images/mda-car-logo.webp", alt: "MDA CAR — Location de voiture", sortOrder: 10 },
  { key: "home.hero.desktop", label: "Hero accueil — desktop", pagePath: "/", src: "/images/hero-location-voiture-agadir-mda-car-desktop.webp", alt: "Voiture de location MDA CAR au coucher du soleil sur la route côtière", sortOrder: 20 },
  { key: "home.hero.mobile", label: "Hero accueil — mobile", pagePath: "/", src: "/images/hero-location-voiture-agadir-mda-car-mobile.webp", alt: "Voiture de location MDA CAR au coucher du soleil", sortOrder: 30 },
  { key: "home.services", label: "Services — image générale", pagePath: "/services", src: "/images/mda-car-services-road-trip-agadir.webp", alt: "Road trip et location de voiture à Agadir", sortOrder: 40 },
  { key: "fleet.header", label: "Nos voitures — en-tête", pagePath: "/nos-voitures", src: "/images/mda-car-nos-voitures-route-montagne.webp", alt: "Route de montagne vue depuis une voiture MDA CAR", sortOrder: 50 },
  { key: "about.header", label: "À propos — en-tête", pagePath: "/a-propos", src: "/images/mda-car-a-propos-agence.webp", alt: "Agence MDA CAR et véhicules de location", sortOrder: 60 },
  { key: "about.body", label: "À propos — photo", pagePath: "/a-propos", src: "/images/mda-car-a-propos-agence.webp", alt: "Agence MDA CAR avec les véhicules de location", sortOrder: 70 },
  { key: "contact.header", label: "Contact — desktop", pagePath: "/contact", src: "/images/mda-car-contact-navigation-bg.webp", alt: "Navigation et localisation pour MDA CAR", sortOrder: 80 },
  { key: "contact.header.mobile", label: "Contact — mobile", pagePath: "/contact", src: "/images/mda-car-contact-navigation-mobile.webp", alt: "Navigation et localisation pour MDA CAR", sortOrder: 90 },
  { key: "service.agadir", label: "Service Agadir", pagePath: "/services/location-voiture-agadir", src: "https://cdn.getyourguide.com/image/format=avif%2Cfit=cover%2Cgravity=auto%2Cquality=60/dam/iStock-2171042803-HEADER-MOBILE.jpg", alt: "La corniche d’Agadir et ses palmiers", sortOrder: 100 },
  { key: "service.delivery", label: "Service livraison Maroc", pagePath: "/services/livraison-voiture-maroc", src: "https://industries.ma/wp-content/uploads/2025/01/Le-Maroc-sur-la-voie-des-2000-km-dautoroute.jpg", alt: "Route et autoroute au Maroc", sortOrder: 110 },
  { key: "service.airport", label: "Service aéroport", pagePath: "/services/location-voiture-aeroport", src: "https://media.istockphoto.com/id/619394704/fr/photo/un-jeune-homme-serein-regardant-lavion-avant-le-d%C3%A9part.jpg?s=612x612&w=0&k=20&c=TdzyGrHdDdao_JcLNjhDLc94qMODTyEJY1EWApjnn8A=", alt: "Voyageur à l’aéroport avant son départ", sortOrder: 120 },
];
