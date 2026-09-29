import { site } from "@/lib/site";

/**
 * /llms.txt — concise, machine-readable summary of the business for AI search
 * engines and assistants (GEO). Facts come from lib/site.ts so they never drift
 * from the website.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${site.name} — Location de voiture depuis Agadir & partout au Maroc

> ${site.serviceDescription}

## Informations clés
- Activité : location de voitures (Agadir, aéroport Agadir Al Massira, livraison partout au Maroc)
- Zone de service : Agadir, région Souss-Massa, ${site.serviceCountry}
- Agence : ${site.baseCity}, ${site.region}, ${site.country}
- Téléphone / WhatsApp : ${site.phoneInternational}
- Horaires : ${site.hoursLabel}
- Langue du site : français
- Réservation : formulaire en ligne sur la page d'accueil, confirmation directe par l'agence

## Pages principales
- [Accueil](${site.url}/): location de voiture depuis Agadir & partout au Maroc
- [Nos voitures](${site.url}/nos-voitures): flotte disponible à la location
- [Services](${site.url}/services): location à Agadir, à l'aéroport, livraison au Maroc
- [Location de voiture à Agadir](${site.url}/services/location-voiture-agadir)
- [Location de voiture à l'aéroport](${site.url}/services/location-voiture-aeroport)
- [Livraison de voiture partout au Maroc](${site.url}/services/livraison-voiture-maroc)
- [À propos](${site.url}/a-propos)
- [Contact](${site.url}/contact)
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
