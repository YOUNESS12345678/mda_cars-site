/**
 * MDA CAR — fleet data source.
 *
 * ⚠️ TO CONFIRM BEFORE LAUNCH — SAMPLE FLEET:
 * The vehicles below are a representative, structured sample of a typical
 * rental fleet (values keyed by car model, not business claims). Replace the
 * entries and images with MDA CAR's REAL vehicles before going live.
 * No layout code needs to change — just edit this array.
 * Prices stay on the required placeholder until real rates are provided.
 */

export type VehicleImage = {
  src: string;
  alt: string;
};

export type Vehicle = {
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: "Citadine" | "Berline" | "SUV";
  transmission: "Manuelle" | "Automatique";
  fuel: "Diesel" | "Essence";
  seats: number;
  /** null → renders the mandated [VEHICLE PRICE TO BE PROVIDED] placeholder */
  pricePerDay: string | null;
  shortDescription: string;
  description: string;
  images: VehicleImage[];
  /** Current fleet availability, controlled from the admin dashboard. */
  isAvailable?: boolean;
};

export const vehicles: Vehicle[] = [
  {
    slug: "dacia-sandero",
    name: "Dacia Sandero",
    brand: "Dacia",
    model: "Sandero",
    category: "Citadine",
    transmission: "Manuelle",
    fuel: "Essence",
    seats: 5,
    pricePerDay: null,
    shortDescription:
      "Citadine pratique et facile à conduire, parfaite pour la ville et les trajets du quotidien.",
    description:
      "Compacte, maniable et économique, la Dacia Sandero est un choix malin pour circuler à Biougra comme à Agadir. Son format pratique convient aux conducteurs qui veulent une voiture simple et efficace au quotidien.",
    images: [
      {
        src: "/images/mda-car-dacia-sandero-biougra.jpg",
        alt: "Dacia Sandero blanche à louer chez MDA CAR, agence de location de voitures à Biougra",
      },
    ],
  },
  {
    slug: "dacia-logan",
    name: "Dacia Logan",
    brand: "Dacia",
    model: "Logan",
    category: "Berline",
    transmission: "Manuelle",
    fuel: "Diesel",
    seats: 5,
    pricePerDay: null,
    shortDescription:
      "Berline spacieuse et économique, idéale pour les trajets du quotidien comme pour la route.",
    description:
      "La Dacia Logan est une berline simple, spacieuse et sobre en carburant. Avec son coffre généreux et ses cinq places, elle convient aussi bien aux trajets professionnels qu’aux déplacements en famille entre Biougra, Agadir et le reste de la région de Souss-Massa.",
    images: [
      {
        src: "/images/mda-car-dacia-logan-biougra.jpg",
        alt: "Dacia Logan couleur taupe en location chez MDA CAR à Biougra, Souss-Massa",
      },
    ],
  },
  {
    slug: "renault-clio",
    name: "Renault Clio",
    brand: "Renault",
    model: "Clio",
    category: "Citadine",
    transmission: "Manuelle",
    fuel: "Diesel",
    seats: 5,
    pricePerDay: null,
    shortDescription:
      "Citadine confortable et moderne, un équilibre idéal entre la ville et la route.",
    description:
      "La Renault Clio combine un format compact, un bon confort de conduite et une présentation soignée. C’est une valeur sûre pour vos déplacements personnels ou professionnels dans la région de Souss-Massa.",
    images: [
      {
        src: "/images/mda-car-renault-clio-biougra.jpg",
        alt: "Renault Clio grise disponible à la location chez MDA CAR à Biougra",
      },
    ],
  },
  {
    slug: "hyundai-accent",
    name: "Hyundai Accent",
    brand: "Hyundai",
    model: "Accent",
    category: "Berline",
    transmission: "Automatique",
    fuel: "Essence",
    seats: 5,
    pricePerDay: null,
    shortDescription:
      "Berline à boîte automatique, pensée pour voyager confortablement et sans fatigue.",
    description:
      "La Hyundai Accent est une berline confortable équipée d’une boîte automatique, très appréciable sur les trajets réguliers entre Biougra et Agadir. Un choix adapté aux conducteurs qui recherchent simplicité et confort de conduite.",
    images: [
      {
        src: "/images/mda-car-hyundai-accent-biougra.jpg",
        alt: "Hyundai Accent gris foncé en location chez MDA CAR à Biougra",
      },
    ],
  },
  {
    slug: "dacia-duster",
    name: "Dacia Duster",
    brand: "Dacia",
    model: "Duster",
    category: "SUV",
    transmission: "Manuelle",
    fuel: "Diesel",
    seats: 5,
    pricePerDay: null,
    shortDescription:
      "SUV polyvalent et spacieux, à l’aise en ville comme sur les routes rurales.",
    description:
      "Le Dacia Duster est le compagnon idéal pour explorer la région : position de conduite surélevée, habitacle spacieux et garde au sol adaptée aux routes rurales du Souss-Massa. Parfait pour les familles et les longs parcours.",
    images: [
      {
        src: "/images/mda-car-dacia-duster-biougra.jpg",
        alt: "Dacia Duster orange à louer chez MDA CAR, location de SUV à Biougra",
      },
    ],
  },
  {
    slug: "hyundai-tucson",
    name: "Hyundai Tucson",
    brand: "Hyundai",
    model: "Tucson",
    category: "SUV",
    transmission: "Automatique",
    fuel: "Diesel",
    seats: 5,
    pricePerDay: null,
    shortDescription:
      "SUV moderne et confortable à boîte automatique, pour un haut niveau de confort au quotidien.",
    description:
      "Le Hyundai Tucson offre un niveau de confort supérieur, avec une boîte automatique et une habitabilité généreuse. Un SUV appréciable pour les longs trajets comme pour les déplacements professionnels exigeants.",
    images: [
      {
        src: "/images/mda-car-hyundai-tucson-biougra.jpg",
        alt: "Hyundai Tucson gris argenté en location chez MDA CAR à Biougra et Agadir",
      },
    ],
  },
];

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

export function getRelatedVehicles(slug: string, count = 3): Vehicle[] {
  return vehicles.filter((v) => v.slug !== slug).slice(0, count);
}

/** Categories actually present in the fleet (used in copy, never fabricated). */
export const vehicleCategories = [
  ...new Set(vehicles.map((v) => v.category)),
] as string[];
