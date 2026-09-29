# MDA CAR — Audit SEO technique et indexation

Date de révision : 27 septembre 2026

## Résumé

Le projet utilise Next.js 16 App Router, des métadonnées serveur, des URL canoniques, un sitemap dynamique, `robots.txt`, des données structurées JSON-LD et un maillage interne cohérent. Les pages publiques sont conçues pour être explorables et indexables par Google sans blocage technique connu dans le code.

Cette conclusion concerne la **préparation technique à l'exploration et à l'indexation**. Elle ne constitue pas une garantie de classement, de délai d'indexation ou d'apparition dans les résultats enrichis.

## 1. Indexation et exploration

- `src/app/robots.ts` autorise l'exploration générale et exclut `/admin` et `/api`.
- Le sitemap est généré par Next.js dans `src/app/sitemap.ts`.
- Le sitemap contient uniquement les routes publiques canoniques : accueil, flotte, services, trois pages de détail de service, contact, à propos et les fiches des véhicules publiés.
- Les fiches véhicules sont ajoutées au sitemap depuis les véhicules publiés en base de données.
- Les routes historiques `/location-voiture-agadir`, `/livraison-voiture-maroc` et `/location-voiture-biougra` redirigent en 301 vers `/services`, afin d'éviter des URLs mortes après la restructuration.
- Les pages admin/API reçoivent en plus `X-Robots-Tag: noindex, nofollow, noarchive` en défense en profondeur.
- La page 404 est explicitement `noindex, nofollow`.

## 2. Canonicals et métadonnées

`src/lib/seo.ts` centralise les métadonnées des pages publiques avec :

- `title` unique par page ;
- `description` unique et descriptive ;
- canonical absolue ;
- `index, follow` ;
- Open Graph en français ;
- Twitter Cards ;
- `metadataBase` configuré dans le layout racine.

Les fiches véhicules génèrent leurs métadonnées à partir du véhicule publié concerné, évitant une description identique pour toute la flotte.

Le domaine canonique est déterminé par `NEXT_PUBLIC_SITE_URL` en production lorsque celui-ci est configuré. À défaut, le projet utilise le domaine de production Vercel fourni par `VERCEL_PROJECT_PRODUCTION_URL`, puis un fallback Vercel neutre. Avant le lancement final, le domaine réel doit être défini dans `NEXT_PUBLIC_SITE_URL`.

## 3. Structure sémantique et contenu

- Une structure H1 est présente par page publique.
- Les breadcrumbs sont utilisés sur les pages de niveau inférieur.
- Les trois services principaux sont clairement identifiés : location à Agadir, livraison partout au Maroc et location à l'aéroport.
- Les pages de détail donnent une explication spécifique de chaque service.
- La FAQ est visible et interactive ; ses questions/réponses sont également représentées en JSON-LD.
- Les informations commerciales utilisées dans le contenu restent factuelles : assurance tous risques selon contrat, prolongation avec préavis de 24 h, et **200 km inclus par période de 24 h**, avec 1,50 DH par kilomètre supplémentaire pendant la période concernée.
- Aucun prix inventé n'est ajouté aux données structurées lorsqu'un tarif réel n'est pas disponible.

## 4. Données structurées / GEO

Le projet utilise JSON-LD pour :

- `AutoRental` / entité commerciale ;
- `WebSite` ;
- `Service` ;
- `FAQPage` ;
- `BreadcrumbList`.

Les données d'entreprise utilisent les paramètres métier disponibles dans la base de données et ne créent pas de fausse adresse physique à Agadir. Agadir est présenté comme zone de service ; la localisation physique reste issue des données réelles de l'entreprise.

Les avis Google ne sont pas transformés en `aggregateRating`/`Review` artificiel dans le JSON-LD. Les informations visibles restent séparées des données structurées afin d'éviter de présenter un signal tiers comme une donnée propriétaire.

## 5. Images et performance

- Les images publiques utilisent `next/image` avec formats AVIF/WebP et tailles responsives.
- Le hero et les en-têtes disposent d'assets adaptés au mobile lorsque disponibles.
- Les images de véhicules utilisent des URLs Blob/locales et `next/image`.
- Les images de service configurées par le dashboard passent également par `next/image`, ce qui permet au site de servir des tailles adaptées et des formats optimisés.
- Les sources externes historiques des trois images de service restent autorisées uniquement comme valeurs média configurables ; pour la meilleure autonomie et la meilleure stabilité, elles peuvent être remplacées dans Dashboard > Images par les versions licenciées stockées dans Vercel Blob.
- La police Sora est auto-hébergée via `@fontsource/sora`, donc le build ne dépend pas d'un téléchargement Google Fonts.

## 6. Sécurité utile à l'indexation

La CSP et les headers de sécurité sont appliqués dans `src/proxy.ts` et `next.config.ts`. Ils sont configurés pour ne pas bloquer les scripts Next.js, les images publiques, Google Maps et les uploads directs Vercel Blob.

Les endpoints publics de réservation et de leads disposent également d'une protection anti-abus en mémoire.

## 7. Vérification locale de cette version

La version livrée a été vérifiée avec :

- `npm ci` : OK ;
- `npm run build` : OK ;
- TypeScript : terminé sans erreur pendant le build ;
- génération des pages statiques : OK ;
- routes publiques, admin et API détectées par Next.js : OK.

Le build utilise Next.js 16.2.6 et génère les routes publiques, les fiches véhicules publiées, `robots.txt` et `sitemap.xml`.

## 8. Ce qui doit encore être vérifié en production

Ces éléments ne peuvent pas être déduits uniquement du dépôt :

1. définir `NEXT_PUBLIC_SITE_URL` avec le domaine final ;
2. connecter le projet Vercel à son Blob Store de production ;
3. tester un upload d'image depuis le dashboard sur desktop et mobile ;
4. vérifier les headers HTTP et le HTML réellement servis par le domaine de production ;
5. lancer PageSpeed Insights/Lighthouse et relever les Core Web Vitals réels ;
6. ajouter le domaine à Google Search Console et soumettre `/sitemap.xml` ;
7. vérifier dans Search Console l'état réel d'indexation après exploration ;
8. vérifier le Google Business Profile et la cohérence des informations publiques.

## Conclusion technique

À l'état du code, aucune erreur connue ne bloque volontairement Googlebot sur les pages publiques : les routes publiques sont accessibles, les canoniques sont définies, le sitemap et robots.txt sont présents, les pages utilisent une structure sémantique claire et les données structurées sont générées côté serveur.

Le résultat attendu est donc un site **techniquement préparé pour l'exploration et l'indexation Google**. Le classement, la vitesse d'exploration, les résultats enrichis et la visibilité ne peuvent pas être garantis par le code seul.
