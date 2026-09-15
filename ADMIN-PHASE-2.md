# MDA CAR — Admin Dashboard (Phase 2)

## Cars Management CRUD + Secure Admin Integration

This document covers only what Phase 2 added. Phase 1 (auth, sessions,
business settings, dashboard shell) was inspected and reused as-is —
nothing in it was rebuilt or replaced.

## 1. Files created

```
src/lib/car-constants.ts                          — client-safe constants, types, pure validation
src/lib/cars.ts                                    — server-only: CarRow type, unique-slug generator, re-exports car-constants
src/app/admin/(dashboard)/cars/actions.ts          — create/update/delete/toggle server actions
src/app/admin/(dashboard)/cars/CarForm.tsx         — shared Add/Edit form (client component)
src/app/admin/(dashboard)/cars/CarRowActions.tsx   — per-row edit/availability/hide/delete controls (client component)
src/app/admin/(dashboard)/cars/new/page.tsx        — Add Car page
src/app/admin/(dashboard)/cars/[id]/edit/page.tsx  — Edit Car page
ADMIN-PHASE-2.md                                   — this report
```

## 2. Files modified

```
src/db/schema.ts                            — cars table: added model, year, features (nullable, additive)
src/app/admin/(dashboard)/cars/page.tsx     — replaced "coming soon" placeholder with the real Cars list
src/components/admin/AdminShell.tsx         — removed the "Bientôt" badge on the Voitures nav item
src/app/admin/(dashboard)/page.tsx          — two copy corrections (see below)
```

The two copy corrections on `/admin` overview: the "Voitures enregistrées"
stat card no longer says the feature "arrive dans une prochaine phase"
(it now says to manage the fleet from the Voitures page), and "Gestion des
voitures" was removed from the "Prochaines étapes" checklist since it's
done. No layout, structure, or design change — text only, and only because
leaving the old text would have been actively misleading now that the
feature exists.

## 3. Files intentionally left untouched

- All public pages/components (`/`, `/nos-voitures`, `/nos-voitures/[slug]`,
  `/location-voiture-*`, `/services`, `/contact`, `/a-propos`, `Header`,
  `Footer`, `Hero`, etc.)
- `src/lib/vehicles.ts` — the public site's static fleet data source. Per
  the brief, Phase 2 does **not** migrate the public site to the database;
  it continues reading the static array exactly as before.
- SEO: `sitemap.ts`, `robots.ts`, `src/lib/seo.ts`, `src/lib/jsonld.ts`,
  `src/app/layout.tsx` metadata, `og/route.tsx` — none modified.
- Auth: `session.ts`, `require-admin.ts`, `password.ts`, `login-guard.ts`,
  the `/admin/login` route — none modified. Cars Management reuses
  `requireAdminPage()` (route guard, already applied by the `(dashboard)`
  layout to every page including `/admin/cars`) and `requireAdminAction()`
  (called at the top of every new server action) unchanged.
- `/admin/settings` and `/admin/reservations` — untouched.
- `next.config.ts` — untouched. (Admin image previews intentionally use a
  plain `<img>` tag instead of `next/image`, specifically so no change to
  `remotePatterns` was needed for admin-pasted URLs — see §8.)

## 4. Database changes

`cars` table gained three nullable columns:

| Column     | Type          | Notes                                   |
|------------|---------------|------------------------------------------|
| `model`    | `text`        | e.g. "Logan" (separate from `brand`)     |
| `year`     | `integer`     | e.g. 2025                                |
| `features` | `jsonb text[]`| e.g. `["Climatisation", "Bluetooth"]`    |

All three are nullable at the database level by design, so adding them is
a purely additive, non-destructive change — it cannot fail against
existing rows. "Required" for real data (brand, model, year, price,
transmission, fuel, seats) is enforced entirely in the Phase 2 server
actions (`validateCarInput` in `car-constants.ts`), the same pattern
Phase 1 used for `business_settings`.

No other table changed. `leads`, `admin_users`, `admin_sessions`,
`business_settings`, and `reservations` are untouched.

## 5. Migration created

None as a separate file — this project uses Drizzle's push-based workflow
(no `drizzle/` migrations folder existed before Phase 2 either, matching
how `leads` and the Phase 1 tables were set up). Run:

```bash
npm run db:push
```

This only adds the three new nullable columns to `cars`. It does not drop
or alter any existing column, table, or data.

## 6. Cars CRUD routes

```
GET  /admin/cars                — list, search (?q=), filter (?availability=, ?published=)
GET  /admin/cars/new            — Add Car form
GET  /admin/cars/[id]/edit      — Edit Car form (404s server-side if the id doesn't exist)
```

## 7. Server Actions created

No new Route Handlers — Server Actions were already the established
pattern (see `settings/actions.ts` from Phase 1), so Cars Management
reuses it:

```
createCarAction            — insert, server-validated, generates a unique slug
updateCarAction             — verifies the car exists, then updates
deleteCarAction              — verifies the car exists, hard-deletes
toggleAvailabilityAction     — Available ↔ Unavailable
toggleVisibilityAction       — Hide ↔ Show (isHidden), never deletes
```

Every one of these calls `requireAdminAction()` as its first line.

## 8. Image/storage solution used

**URL references, not file upload.** The project has no image/storage
library (no Cloudinary, S3, or Supabase Storage dependency, and no upload
API route) — introducing one would have violated "don't introduce
unnecessary technologies." Instead, the admin pastes the URL of an
already-hosted image (either an existing `/images/...` file already
shipped with the site, or any `https://` URL), and the server validates
each one: max 500 characters, must end in `.jpg`, `.jpeg`, `.png`,
`.webp`, `.avif`, or `.gif`, and must start with `https://` or `/`
(rejects `javascript:` and other unsafe schemes). Up to 8 images per car;
the first is stored as the cover (`imageUrl`) and the full ordered list in
`images` (jsonb).

Admin-side previews use a plain `<img>` tag rather than `next/image`,
specifically to avoid having to allow-list every possible source domain
in `next.config.ts` for URLs that aren't known ahead of time — this is an
internal, authenticated-only admin screen, so this trade-off is
appropriate there (the public site's `VehicleGallery` etc., which do use
`next/image`, were not touched).

If real file uploads are wanted in a later phase, that's a deliberate
addition of new infrastructure (a storage provider) and was left out
per the "do not introduce unnecessary technologies" instruction.

## 9. Security measures implemented

- Every mutation (`create`, `update`, `delete`, both toggles) starts with
  `requireAdminAction()` — independent of the page-level
  `requireAdminPage()` guard already applied to all of `(dashboard)`.
- All input validated server-side in `validateCarInput` — brand/model
  required and length-capped, year range-checked, price positive and
  capped, seats 1–9, transmission/fuel restricted to an allow-list,
  description length-capped, images validated by pattern and count,
  features length- and count-capped. Nothing relies on client-side
  validation alone.
- Car IDs are never trusted blindly: `updateCarAction`, `deleteCarAction`,
  and the toggles all re-verify the row exists server-side before
  mutating; the edit page 404s server-side for an invalid/nonexistent id.
- Errors returned to the admin are generic French messages ("Impossible
  d'ajouter le véhicule.", "Ce véhicule n'existe pas.", etc.) — no stack
  traces, SQL errors, or internal details are ever surfaced.
- Delete requires an explicit client-side confirmation dialog ("Êtes-vous
  sûr de vouloir supprimer ce véhicule ?") before the destructive POST is
  ever submitted.
- No DB credentials or server-only code reach the browser bundle — this
  was actually caught and fixed during build verification (see §12): the
  client `CarForm` component originally imported constants from a
  `server-only` module that pulled in the `pg` driver, which would have
  broken the client bundle. Fixed by splitting client-safe constants
  (`car-constants.ts`) from server-only DB logic (`cars.ts`).
- Hard delete is safe against the `reservations` table: its `carId`
  column already has `onDelete: "set null"`, so deleting a car cannot
  destroy or orphan reservation data — a future reservation referencing a
  deleted car simply loses the link, as intended.

## 10. Environment variables added

None. No new secrets, no storage provider keys — same `DATABASE_URL` as
before.

## 11. Commands required locally

```bash
npm install
npm run db:push       # adds model, year, features columns (non-destructive)
npm run dev            # or: npm run build && npm run start
```

## 12. Tests performed

Run in this sandbox against the uploaded project (no live PostgreSQL
instance was available here, so DB-connected manual QA — the 20-step
checklist in the brief — could not be executed end-to-end; the items
below are what could be verified without a live database):

- `npm run typecheck` (`tsc --noEmit`) — **clean**.
- `npm run lint` (ESLint) — **clean** on every file created or modified in
  this phase. One unrelated pre-existing error remains in
  `src/components/Header.tsx` (a `react-hooks/set-state-in-effect`
  warning) — not touched by Phase 2, present before this phase started.
- `npm run build` (`next build`) — **succeeds**. Build output confirms
  `/admin/cars`, `/admin/cars/new`, and `/admin/cars/[id]/edit` are
  correctly server-rendered on demand (ƒ), and every public route is
  unchanged and still statically generated (○ / ●) — including all six
  `/nos-voitures/[slug]` static params, confirming the public fleet pages
  were not affected.
- Manual click-through testing (login → add → edit → toggle → delete →
  mobile layout) still needs to be run against a real database — please
  run the 20-step checklist from the brief once `DATABASE_URL` points at
  your actual database and an admin account exists.

## 13. Build result

Success — see §12.

## 14. Phase 1 authentication preserved

Confirmed. `session.ts`, `require-admin.ts`, `password.ts`,
`login-guard.ts`, and the `/admin/login` route are byte-for-byte
unchanged. Cars Management calls the existing `requireAdminPage()` /
`requireAdminAction()` guards; no second authentication system was
introduced.

## 15. Public website UI preserved

Confirmed. No public component, page, or the public fleet data source
(`src/lib/vehicles.ts`) was modified. The production build confirms every
public route still prerenders exactly as before.

## 16. Existing SEO preserved

Confirmed. `sitemap.ts`, `robots.ts`, `src/lib/seo.ts`, `src/lib/jsonld.ts`,
canonical/OG metadata in `layout.tsx`, and `og/route.tsx` are all
unchanged. The new `/admin/cars*` pages set `robots: { index: false,
follow: false }`, consistent with the rest of the admin dashboard.

---

**Per the brief: Phase 2 stops here. Reservation management, customer
management, notifications, analytics, payments, and public-site database
migration are explicitly out of scope and were not started.**
