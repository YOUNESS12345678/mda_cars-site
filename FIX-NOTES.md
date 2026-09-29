# Change notes

## 1. Mobile menu + gallery not working (root cause)
src/proxy.ts sends a per-request CSP nonce with 'strict-dynamic'. Pre-rendered static pages had no nonce,
so the browser blocked every Next.js script -> no hydration -> menu & gallery buttons dead.
- src/app/layout.tsx: `await connection()` so pages render per request and receive the nonce (THE fix)
- src/components/Header.tsx, MobileMenu.tsx, VehicleGallery.tsx: hardening (stable close handler, inert when closed,
  scroll-lock only while open, Escape, vertical-scroll-safe swipe, arrow keys, empty-list guard)

## 2. Home headline
"Location de voiture depuis Agadir & partout au Maroc" (H1 + <title> + og:title + description).
- src/lib/seo-keyword-constants.ts, src/components/Hero.tsx, src/app/page.tsx
- src/lib/seo-keywords.ts: rows still holding the OLD untouched default are upgraded automatically;
  a headline the admin customised is never overwritten.

## 3. SEO fixes
- Home meta description 179 -> 153 chars; car page description 180 -> ~140; /services title 80 -> 58 chars.
- "Agadir" was lower-cased in the home meta description; now correctly capitalised.

## 4. Performance / accessibility
- DB queries per home visit 26 -> 5 (React cache() in seo-keywords.ts and site-media.ts; still fresh on every visit).
- Hero: phones get an optimised, right-sized image (was the full 229 KiB file, and a second image was downloaded too).
- LuxuryBackdrop: own GPU layer (transform-gpu) so big blurs aren't repainted on scroll. No visual change.
- HowItWorks: <li> is now a direct child of <ol> (accessibility). No visual change.

## Note
Pages are rendered per request (needed for the CSP nonce), so they are not CDN-cached and the
browser back/forward cache is not used. To get full static caching back, the CSP would have to change
(e.g. hash/SRI based) - a security-policy decision, deliberately not made here.

---
# Round 2 (final verification)

## 5. Bug fixed: every vehicle page returned a 500 once a car existed in the database
`generateStaticParams` on /nos-voitures/[slug] tried to pre-render car pages, which conflicts with the
per-request rendering required by the CSP nonce (`await connection()` in layout.tsx) -> DYNAMIC_SERVER_USAGE.
It was invisible before because the previous build ran with an empty cars table. Fixed: removed it and set
`dynamic = "force-dynamic"`. Cars added from the admin still render on demand.

## 6. Home headline made bigger
"Location de voiture depuis Agadir & partout au Maroc" (H1): 36px mobile / 54px tablet / 72px desktop (was 30/44/56),
balanced wrapping. Social-share (OG) image now shows the full headline incl. "& partout au Maroc".

## 7. SEO / GEO additions
- /llms.txt (AI-search summary of the business, generated from lib/site.ts)
- Product structured data on each vehicle page (price/offer only when a real numeric price exists)
- X-Powered-By header removed

## Verified (production build, real Postgres)
typecheck 0 errors, lint 0 errors, build OK; 12 routes 200 (404 for unknown car); reservation API stores a row and
rejects invalid input; admin redirects to login; robots/sitemap/llms.txt OK; every script carries the CSP nonce.

## 8. Home headline can no longer come back to the old wording
The H1, <title>, description and share image of the home page are now fixed in code (HOME_HEADLINE in
src/lib/seo-keyword-constants.ts) instead of being read from the database, so an old value saved in the admin
cannot show the previous phrase. Old DB values ("Location de voiture(s) à Agadir", any case/spacing) are also
cleaned automatically. Default share-image text updated too.
=> "Location de voiture depuis Agadir & partout au Maroc"
