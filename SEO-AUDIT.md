# MDA CAR — Audit SEO technique (11 septembre 2026)

Audit fait en lisant directement le code source (pas de connecteur DataForSEO
disponible — pas de vrais volumes de recherche/SERP ici, voir "Ce que je n'ai
PAS pu vérifier" en bas). Tout ce qui est listé "Corrigé" a été testé en
buildant le site et en interrogeant les pages en local (statut HTTP, balises
`<title>`/canonical, JSON-LD parsé).

## 🔴 Corrigé — risque le plus grave : le build cassait

`layout.tsx` chargeait la police Sora via `next/font/google`, qui va chercher
`fonts.googleapis.com` **pendant le build**. Si l'environnement de build
(Netlify/Vercel) ne peut pas atteindre ce domaine (pare-feu, proxy, incident
réseau), **le build échoue et le site ne se déploie pas du tout** — donc
0 page indexée par Google, peu importe le reste du SEO.

Corrigé : la police est maintenant servie en local via `@fontsource/sora`
(déjà présent dans `package.json`, juste jamais branché). Testé avec un build
complet : les 18 routes se génèrent en statique, sans appel réseau externe.
Bonus : first paint plus rapide (pas de requête externe pour la police).

## 🟡 Corrigé — deux pages se disputaient le même mot-clé

`/nos-voitures` avait pour balise `<title>` *"Location de voitures à Biougra |
Nos voitures MDA CAR"* — quasi identique au début du titre de
`/location-voiture-biougra` *("Location de voitures à Biougra | Agence MDA
CAR")*. Deux pages avec le même titre pour la même requête = Google partage
l'autorité entre les deux au lieu de bien classer une seule page.

Corrigé : `/nos-voitures` a maintenant *"Nos voitures à louer à Biougra |
Flotte MDA CAR"*, aligné avec son vrai rôle (catalogue de la flotte) et pas
avec la page de destination locale. Vérifié : les deux titres sont
maintenant clairement différents.

Le titre de la page d'accueil *("... à Biougra & Agadir")* chevauche un peu
`/location-voiture-biougra`, mais c'est une structure hub-and-spoke normale
(page d'accueil = les deux villes, page dédiée = une ville en profondeur) —
pas un doublon à corriger.

## 🟡 Corrigé — texte de type "[À COMPLÉTER]" affiché aux vrais visiteurs

7 endroits du site affichaient littéralement des textes comme
`[BUSINESS ADDRESS TO BE PROVIDED]` ou `[VEHICLE PRICE TO BE PROVIDED]` en
direct sur les pages publiques (pied de page, page contact, fiches véhicules,
FAQ). Corrigé avec des formulations honnêtes qui n'inventent aucune donnée :
"Sur demande", "Communiqués par téléphone ou WhatsApp", etc. Vérifié en
parcourant les 13 pages du site : zéro texte de type "[... TO BE PROVIDED]"
restant nulle part.

## ✅ Déjà solide (vérifié, rien à changer)

- **robots.txt** : autorise tout sauf `/admin` et `/api`, référence bien le
  sitemap.
- **sitemap.xml** : liste les 13 pages réelles (page d'accueil, flotte,
  6 fiches véhicules, 2 pages ville, services, à propos, contact) — aucune
  page admin/API/404 dedans.
- **Balises canonical** : présentes et correctes sur toutes les pages.
- **`<meta name="robots">`** : `index, follow` partout — aucune page bloquée
  par erreur.
- **Titres** : tous entre 47 et 53 caractères, description 110–157 — dans les
  clous pour un affichage complet dans les résultats Google.
- **JSON-LD (données structurées)** : `AutoRental`, `WebSite`, `FAQPage`,
  `Service`, `BreadcrumbList` — tout est du JSON valide (vérifié
  programmatiquement sur les 8 pages principales), rien d'inventé (pas
  d'adresse ni d'avis fictifs dans le schéma, comme prévu dans le code).
- **Images** : toutes en WebP, texte alternatif descriptif et unique par
  véhicule (pas de "image1.jpg" générique).
- **Maillage interne** : les 2 pages ville (Biougra/Agadir) sont liées depuis
  le pied de page de tout le site + depuis la section "LocationSection" de la
  page d'accueil → pas de page orpheline.
- **404** : renvoie un vrai statut HTTP 404 (pas une "fausse" page qui
  répondrait 200 — ça, Google le pénalise).

## 🔴 Ce que je ne peux PAS corriger moi-même — le vrai frein au classement local

Le fichier `lib/site.ts` laisse volontairement l'adresse et les horaires
vides (`[BUSINESS ADDRESS TO BE PROVIDED]`) — et c'est le bon réflexe, mieux
vaut ça que d'inventer une fausse adresse dans le code ou dans le schéma
JSON-LD. Mais concrètement, **sans adresse réelle et cohérente, ce site ne
pourra jamais apparaître dans le "Pack Local" de Google** (les 3 résultats
avec la carte, pour des recherches comme "location voiture Biougra" ou
"location voiture près de moi") — c'est le résultat qui compte le plus pour
un commerce local, plus que le classement organique classique.

Pour débloquer ça, il faut, dans cet ordre :
1. **Une fiche Google Business Profile** pour MDA CAR (gratuite,
   business.google.com), avec la même adresse, le même numéro
   (+212 650 91 11 22) et le même nom partout (site, Google, Instagram,
   Facebook) — c'est ce qu'on appelle la cohérence NAP.
2. Une fois l'adresse confirmée, je peux l'ajouter au site (footer, page
   contact) et au schéma `organizationJsonLd()` dans `lib/jsonld.ts`.
3. **Soumettre le site dans Google Search Console** (search.google.com/search-console,
   gratuit) et y coller l'URL du sitemap (`/sitemap.xml`) — c'est ce qui dit
   à Google "viens explorer ce site maintenant" au lieu d'attendre qu'il le
   trouve tout seul. Sans ça, l'indexation peut prendre des semaines même
   avec un site technique parfait.

## Ce que je n'ai PAS pu vérifier (pas de connecteur DataForSEO)

Pas de vrais volumes de recherche, pas de vérification SERP en direct, pas de
données de citation IA (ChatGPT/AI Overviews). Le champ "prix" étant encore
"sur demande", aucun schéma `Product`/`Offer` n'a été ajouté — en ajouter un
sans vrai prix serait de la donnée inventée, donc volontairement laissé de
côté jusqu'à ce que les tarifs soient confirmés.

## Important à savoir

Personne — ni moi, ni aucune agence — ne peut garantir une 1ère place sur
Google : c'est Google qui décide, pas le site. Ce qu'on peut garantir, c'est
qu'il n'y a plus aucun obstacle technique connu qui empêcherait Google
d'explorer, comprendre et indexer correctement le site. Le reste (classement
local, position exacte) dépend surtout de l'étape 1 ci-dessus (Google
Business Profile) et du temps.
