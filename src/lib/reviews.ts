/**
 * Real customer reviews, sourced from MDA CAR's Google Maps listing.
 * Each entry links to the reviewer's public Google Maps contributor
 * profile — never fabricate a review or a name.
 */
export type Review = {
  author: string;
  authorUrl: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  source: "Google";
};

export const reviews: Review[] = [
  {
    author: "Abdallah Elmaaiti",
    authorUrl:
      "https://www.google.com/maps/contrib/102516246556142505909/reviews?hl=en-GB",
    rating: 5,
    text: "The best car rental agency. The car is new. The price is very reasonable. The staff are professional and trustworthy. Thank you very much.",
    source: "Google",
  },
  {
    author: "Khaled Essaree",
    authorUrl:
      "https://www.google.com/maps/contrib/109301100774441876165/reviews?hl=en-GB",
    rating: 5,
    text: "Best service and top rental agency.",
    source: "Google",
  },
  {
    author: "Imad Zahiri",
    authorUrl:
      "https://www.google.com/maps/contrib/103442752002114022687/reviews?hl=en-GB",
    rating: 5,
    text: "I highly recommend this car rental agency. Excellent service and excellent cars.",
    source: "Google",
  },
];

export const reviewsAverage =
  reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
