# MDA CAR — Admin Dashboard Phase 6
## SEO keyword control + public media control + reservation submission hardening

### Added
- `/admin/seo`: all important visible SEO phrases are seeded into an editable dashboard.
- Stable keyword keys keep the public templates intact while the visible phrase can be changed, enabled/disabled, and marked bold.
- `/admin/media`: central list of the main public-site images, including logo, homepage hero, page headers, service images and vehicle fallback.
- Existing `/admin/cars` remains the place to manage fleet images; its image list is already database-backed.
- `seo_keywords` and `site_media` tables are additive and use the project's existing Drizzle push workflow.
- Public components read managed keywords/media through tagged Next data cache; admin saves invalidate the corresponding tag.
- Reservation requests now carry a client-generated request ID and are sent with `cache: no-store`, reducing accidental duplicate submissions/retries without introducing a page reload.

### Important SEO note
Changing keywords or images does not itself guarantee better Google rankings. The dashboard is designed to make controlled, visible content updates easy while avoiding hidden keyword stuffing.

### Required database step
```bash
npm run db:push
```

### Verification in this sandbox
- TypeScript parser check completed with no syntax/parse diagnostics.
- Full `npm run typecheck` / `npm run build` could not be completed because installing the project's dependencies timed out in the sandbox network environment. No claim of a full production build is made from this phase.
