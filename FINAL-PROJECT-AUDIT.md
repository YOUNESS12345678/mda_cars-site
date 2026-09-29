# MDA CAR — Final pass performed in this package

Date: 2026-09-27

## Confirmed business information incorporated

- MDA CAR — location de voitures.
- Phone / WhatsApp: 06 50 91 11 22 / +212650911122.
- Google Maps / Google Business Profile: https://maps.app.goo.gl/aiHneBVCio5FyD3C7
- France/French public website only for now.
- No public business email was supplied, so none was invented.
- Final custom domain is not supplied yet; the project keeps its safe Vercel fallback until `NEXT_PUBLIC_SITE_URL` is configured.
- 200 km included for each 24-hour rental period.
- Every kilometre above 200 km during that 24-hour period: 1.50 DH; a new 24-hour period receives a new 200 km allowance.
- Assurance tous risques is mentioned without inventing a deductible, exclusions or legal coverage details.
- Any rental extension must be requested at least 24 hours in advance.
- Delivery/remise can be organised at a hotel, domicile or train station, according to agreed modalities.
- No chauffeur service.
- Airport service is retained with the airports already offered by the booking form.
- Image rights were confirmed by the client as licensed.

## Changes made in this package

### SEO / GEO / content
- Kept the main positioning around **location de voitures à Agadir**, **aéroport**, and **livraison partout au Maroc**.
- Added truthful rental conditions to the public Services page.
- Added a visible FAQ with the same answers represented in FAQ structured data.
- Added the 200 km / 1.50 DH rule to the booking form and service detail pages.
- Added the 24-hour extension notice to public booking/service content.
- Added hotel / domicile / gare delivery information.
- Added the no-chauffeur clarification.
- Kept structured data based on the real business settings and physical location instead of inventing an Agadir office.
- Updated the Google Maps link to the client-provided Google Maps URL.
- Removed the Dashboard SEO/Keywords route entirely from the admin navigation surface and removed its admin route files. The internal SEO keyword engine remains because it is still used by the public website.
- Removed the `fallback.vehicle` media item from the Dashboard Images listing. The code-level fallback remains available so an unavailable vehicle image cannot break the public site.

### Performance
- Changed the homepage hero from two simultaneously present `<img>` elements to a `<picture>` source selection so the browser can choose the mobile or desktop asset instead of unnecessarily loading both.
- Applied the same `<picture>` strategy to page headers when a mobile image exists.
- Added async image decoding on critical public images.
- Disabled fixed background attachment on small screens to reduce mobile rendering/compositing cost.

### Accuracy / local SEO
- Corrected public contact/footer location text so it does not falsely claim a physical Agadir address. The visible physical city now comes from the verified business settings / Biougra fallback, while Agadir remains a service area.
- No fake Agadir office was created.

## Not completed / needs external verification

1. **Production-domain verification is still required.** The package was build-verified locally with `npm ci` and `npm run build`; the remaining checks are live Vercel/browser checks.
2. **Real Lighthouse / PageSpeed / Core Web Vitals measurements were not possible** without a deployed final domain and a browser measurement run.
3. **Google Business Profile Performance data was not available**, so no claim about search impressions, calls, directions or website clicks was made.
4. **Google Search Console data was not available**, so search-query/indexing performance could not be audited from live data.
5. **The exact street address was not extracted from the supplied Google Maps short URL.** The project therefore avoids inventing a street address.
6. **The final custom domain is still pending.** Once purchased, set `NEXT_PUBLIC_SITE_URL` in production and use the same canonical domain in Vercel.
7. The service media system supports Vercel Blob and `next/image`. Existing external service-image URLs remain supported as configurable media sources; for maximum autonomy, replace them in Dashboard > Images with the licensed files stored in Vercel Blob.
8. The 17 airport options already present in the booking form were retained based on the client's confirmation that the airport service is valid. If the business later limits the airport list, update the constants before publishing that claim.

## Recommended production verification before launch

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Deploy to Vercel with production `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, and final `NEXT_PUBLIC_SITE_URL`.
- Test one public reservation end-to-end and confirm it appears in Dashboard > Réservations.
- Test image upload from desktop and mobile.
- Test every airport option and the `Autre ville` delivery option.
- Verify canonical URLs, sitemap, robots, JSON-LD and Open Graph on the production domain.
- Run PageSpeed Insights / Lighthouse on homepage, Services, one service detail page, fleet and one vehicle detail page, especially on mobile.
- Connect Google Search Console and submit the final sitemap.
- Confirm the Google Business Profile website URL, phone, category and address match the real business data.
