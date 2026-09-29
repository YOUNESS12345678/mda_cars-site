/** Confirmed MDA CAR rental conditions supplied for the public website. */
export const RENTAL_POLICY = {
  includedKilometers: 200,
  extraKilometerPrice: 1.5,
  kilometerBasis: "per 24 hours",
  insurance: "Assurance tous risques",
  extensionNoticeHours: 24,
  deliveryLocations: ["hôtel", "domicile", "gare"],
  chauffeur: false,
} as const;

export const RENTAL_POLICY_TEXT = {
  kilometers: "200 km sont inclus pour chaque période de 24 heures de location. Si vous dépassez 200 km pendant ces 24 heures, chaque kilomètre supplémentaire est facturé 1,50 DH. À chaque nouvelle période de 24 heures, vous bénéficiez à nouveau de 200 km inclus.",
  extension: "Toute demande de prolongation de la location doit être signalée à MDA CAR au moins 24 heures à l’avance.",
  insurance: "Une assurance tous risques est proposée dans les conditions prévues au contrat de location.",
  delivery: "La livraison ou la remise du véhicule peut être organisée à l’hôtel, au domicile ou à la gare, selon les modalités convenues avec MDA CAR.",
  chauffeur: "MDA CAR propose la location de véhicules sans chauffeur.",
} as const;

export const RENTAL_FAQS = [
  {
    question: "Comment réserver une voiture chez MDA CAR ?",
    answer: "Choisissez votre voiture, remplissez le formulaire de réservation avec vos coordonnées, votre service et vos dates, puis envoyez votre demande. MDA CAR vous contacte ensuite pour confirmer la disponibilité et les modalités de la location.",
  },
  {
    question: "Quels services puis-je choisir ?",
    answer: "MDA CAR propose trois services principaux : location de voitures à Agadir, livraison de voitures partout au Maroc et location de voitures à l’aéroport.",
  },
  {
    question: "Combien de kilomètres sont inclus ?",
    answer: RENTAL_POLICY_TEXT.kilometers,
  },
  {
    question: "Que se passe-t-il si je dépasse 200 km pendant 24 heures ?",
    answer: "Si vous dépassez les 200 km inclus pendant une période de 24 heures, chaque kilomètre supplémentaire est facturé 1,50 DH. Lorsque la période de 24 heures suivante commence, une nouvelle tranche de 200 km inclus est accordée.",
  },
  {
    question: "L’assurance tous risques est-elle prévue ?",
    answer: RENTAL_POLICY_TEXT.insurance,
  },
  {
    question: "Puis-je prolonger ma location ?",
    answer: RENTAL_POLICY_TEXT.extension,
  },
  {
    question: "Puis-je demander une livraison dans une autre ville du Maroc ?",
    answer: "Oui, MDA CAR peut organiser une livraison dans la ville de votre choix au Maroc, selon la destination, les dates et la disponibilité du véhicule. Les modalités sont confirmées directement avec l’agence.",
  },
  {
    question: "Comment organiser une location à l’aéroport ?",
    answer: "Choisissez le service de location à l’aéroport dans le formulaire, sélectionnez l’aéroport souhaité et indiquez vos dates et informations utiles. MDA CAR vérifie ensuite la disponibilité et les modalités de remise avant confirmation.",
  },
] as const;
