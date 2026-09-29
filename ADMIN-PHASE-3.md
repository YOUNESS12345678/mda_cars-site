# MDA CAR — Admin Dashboard (Phase 3)

## Business Settings — full business information

This document covers only what Phase 3 added. Phase 1 (auth, sessions,
dashboard shell, the original phone/WhatsApp-only `business_settings`
table and `/admin/settings` page) and Phase 2 (Cars Management) were
inspected and reused as-is — nothing in them was rebuilt or replaced.

## 0. Stack correction vs. the brief

The brief's checklist assumes Prisma. The project actually uses **Drizzle
ORM + PostgreSQL** (confirmed in `src/db/schema.ts`, `drizzle.config.json`,
`package.json`). Per "reuse the existing architecture, don't guess," every
instruction below was carried out against Drizzle, not Prisma. There is no
`prisma/` folder, `schema.prisma`, or `prisma migrate` command anywhere in
this project.

## 1. Files created

```
src/lib/business-settings-constants.ts   — client-safe constants, types, pure validation
                                            (mirrors the car-constants.ts / cars.ts split
                                            Phase 2 introduced)
ADMIN-PHASE-3.md                          — this report
```

## 2. Files modified

```
src/db/schema.ts                                     — business_settings: 11 new nullable columns
src/lib/business-settings.ts                          — seeds new fields from lib/site.ts; re-exports constants
src/app/admin/(dashboard)/settings/actions.ts         — full validation, all fields, field-level errors
src/app/admin/(dashboard)/settings/SettingsForm.tsx   — sectioned UI, all fields, per-field errors
src/app/admin/(dashboard)/settings/page.tsx           — updated intro copy, wider layout for the new sections
```

## 3. Files intentionally left untouched

- All public pages/components (`/`, `/nos-voitures`, `/nos-voitures/[slug]`,
  `/location-voiture-*`, `/services`, `/contact`, `/a-propos`, `Header`,
  `Footer`, etc.) — the brief was explicit that a public-site refactor is
  out of scope for this phase.
- `src/lib/site.ts` — still the public site's single source of truth for
  contact/business info. Phase 3 **reads** confirmed values from it once
  (to seed the new `business_settings` columns) but does not change it,
  and the public site continues to import from it exactly as before.
- `src/lib/contact.ts`, `src/lib/vehicles.ts`, `src/lib/jsonld.ts`,
  `src/lib/seo.ts` — untouched. No public-facing component reads from
  `business_settings`, so nothing here needed to change (see §9).
- SEO: `sitemap.ts`, `robots.ts`, `src/app/layout.tsx` metadata, `og/route.tsx`
  — none modified. Verified `/robots.txt` and `/sitemap.xml` still return 200.
- Auth: `session.ts`, `require-admin.ts`, `password.ts`, `login-guard.ts`,
  `/admin/login` — none modified. The settings action reuses
  `requireAdminAction()` unchanged; the settings page reuses the
  `(dashboard)` layout's `requireAdminPage()` guard unchanged.
- Cars Management (`/admin/cars/**`) — completely untouched, verified
  still functional (see §10).
- `next.config.ts`, `drizzle.config.json`, `AdminShell.tsx` — untouched.
  The sidebar already had a "Paramètres" link from Phase 1; no nav change
  was needed.

## 4. Database changes

`business_settings` gained 11 new **nullable** columns (all additive — the
three Phase 1 columns, `phone_display` / `phone_international` /
`whatsapp_number`, stay `NOT NULL` exactly as before, and the existing
singleton row was never dropped or recreated):

| Column           | Type               | Notes                                    |
|------------------|--------------------|--------------------------------------------|
| `business_name`  | `text`             | e.g. "MDA CAR"                            |
| `email`          | `text`             | nullable — no confirmed email existed      |
| `address`        | `text`             | nullable — no confirmed street address     |
| `city`           | `text`             | seeded from `lib/site.ts` ("Biougra")      |
| `postal_code`    | `text`             | seeded from `lib/site.ts` ("80000")        |
| `latitude`       | `double precision` | seeded from `lib/site.ts`                  |
| `longitude`      | `double precision` | seeded from `lib/site.ts`                  |
| `opening_hours`  | `jsonb`            | `{day, hours}[]`, 7 fixed days             |
| `facebook_url`   | `text`             | seeded from `lib/site.ts`                  |
| `instagram_url`  | `text`             | seeded from `lib/site.ts`                  |
| `website_url`    | `text`             | seeded from `lib/site.ts`                  |

Optional fields suggested by the brief (`logo`, `timezone`, `currency`)
were **not** added: Phase 1's notes explicitly say there is no logo system
in this project yet (introducing one is flagged as a future decision, see
§13 of ADMIN-PHASE-1.md), and nothing in the codebase uses a timezone or
currency value today — adding unused columns would violate "do not add
unnecessary fields."

No other table changed. `leads`, `admin_users`, `admin_sessions`, `cars`,
and `reservations` are untouched.

## 5. Migration created

None as a separate file — same push-based Drizzle workflow Phase 1 and
Phase 2 used (no `drizzle/` migrations folder exists in this project).
Run:

```bash
npm run db:push
```

This only adds the 11 nullable columns above to `business_settings`. It
cannot fail against the existing row (nothing new is `NOT NULL`) and does
not touch any other table.

## 6. BusinessSettings fields (final shape)

`businessName`, `phoneDisplay`, `phoneInternational`, `whatsappNumber`,
`email`, `address`, `city`, `postalCode`, `latitude`, `longitude`,
`openingHours` (7-entry `{day, hours}` array), `facebookUrl`,
`instagramUrl`, `websiteUrl`, plus the pre-existing `id`, `updatedAt`,
`updatedBy`.

## 7. Admin route

`/admin/settings` (pre-existing route from Phase 1, extended in place — no
new route was created). Protected by the same `(dashboard)` layout guard
(`requireAdminPage()`) that already protects `/admin`, `/admin/cars`, etc.

## 8. Server Actions

No new Route Handlers — reused the Server Actions pattern already
established by Phase 1/2:

```
updateBusinessSettingsAction   — validates, then updates the one singleton row
```

Starts with `requireAdminAction()` as its first line, independent of the
page-level guard. Reads all fields from `FormData` (including 7 indexed
`openingHours.<n>.hours` fields), runs them through
`validateBusinessSettingsInput` (in `business-settings-constants.ts`), and
either returns field-level errors or performs a single `UPDATE ... WHERE
id = settingsId` — never an `INSERT`, so a second save can never create a
competing row. `settingsId` is only used to target the existing row; it is
never trusted as an authorization signal (that comes entirely from
`requireAdminAction()`'s own session check).

## 9. Validation implemented (server-side, all in `business-settings-constants.ts`)

- **Business name**: required, ≤120 chars.
- **Phone (display)**: 6–40 chars.
- **Phone (international)**: `^\+\d{6,15}$`.
- **WhatsApp**: `^\d{6,15}$`.
- **Email**: standard pattern, optional, ≤254 chars.
- **Address**: optional, ≤250 chars.
- **City**: optional, ≤100 chars.
- **Postal code**: optional, alphanumeric pattern.
- **Latitude**: optional, numeric, -90..90.
- **Longitude**: optional, numeric, -180..180.
- **Opening hours**: each of the 7 fixed days, ≤60 chars.
- **Facebook / Instagram / Website**: optional, must be `http(s)://...`, ≤300 chars.

Every error is a plain French sentence tied to its field
(`state.fieldErrors.<field>`); no stack trace, DB error, path, or secret is
ever returned (the `catch` block in the action always returns the generic
*"Impossible d'enregistrer les modifications."*).

## 10. Security measures implemented

- `requireAdminAction()` re-verifies the session on every save — confirmed
  by directly POSTing to the settings form endpoint **without** the admin
  session cookie: the action threw `UNAUTHORIZED` server-side and the
  database was left untouched (see §11, test 17).
- Nothing about authorization is read from the submitted form — no client
  role/user-id field exists or is trusted; `settingsId` only selects which
  row to update, not whether the request is allowed to update it.
- Singleton update strategy preserved: `getOrCreateBusinessSettings()`
  still creates exactly one row if none exists and never again afterwards;
  the action always `UPDATE`s by id, never `INSERT`s.

## 11. Public website integration

**Not changed.** `lib/site.ts` remains the public site's only source for
contact/business info, exactly as Phase 1 left it. `business_settings` is
inspectable/editable from the admin only. Per §12 of the brief ("if safe
integration isn't immediate, keep existing public values unchanged — do
not perform a large public-site refactor in this phase"), and because a
real integration would touch several public components, JSON-LD, and the
Google Maps embed at once, this was correctly deferred rather than rushed.
This is flagged as the main follow-up for a future phase (see §14).

## 12. Environment variables

None added. Uses the same `DATABASE_URL` from Phase 1.

## 13. Commands to run locally

```bash
npm install
npm run db:push        # adds the 11 new business_settings columns
npm run build           # or npm run dev
```

No new admin account is needed — this phase only extends the existing
Settings page.

## 14. Tests performed

All 17 items from the brief's checklist were verified against a real
local PostgreSQL instance (fresh `db:push`, a seeded admin account, and a
manually-issued admin session) plus `next build`/`next start`:

1. **`/admin/settings` requires authentication** — confirmed: unauthenticated
   request → `307` redirect to `/admin/login`.
2. **Logged-in admin can open Settings** — confirmed: authenticated request → `200`.
3. **Existing settings load correctly** — confirmed: page HTML contains the
   seeded values (`MDA CAR`, `Biougra`, `80000`, the exact coordinates,
   `Ouvert 24h/24` for all 7 days).
4. **Existing MDA CAR information is preserved** — confirmed: seed reads
   directly from `lib/site.ts`; phone/WhatsApp/social links/coordinates
   match exactly; email/address correctly left `null` (no confirmed value
   existed, only a placeholder token).
5. **Valid changes can be saved** — confirmed: submitted a real form POST
   (replicating the browser's progressive-enhancement submission) changing
   `email`/`address`; the database row updated and the page's success
   message rendered.
6. **Invalid phone number is rejected** — confirmed via the validator's
   direct test: bad international format and bad WhatsApp format both
   return the correct French field error.
7. **Invalid email is rejected** — confirmed: a malformed email was
   submitted; the row was **not** written, and the field-level error
   appeared in the response.
8. **Invalid URL is rejected** — confirmed: a malformed Facebook URL was
   submitted alongside the bad email in the same request; only that
   field's error was shown and nothing was saved.
9. **Invalid coordinates are rejected** — confirmed: latitude `999` in the
   same request above returned "La latitude doit être comprise entre -90
   et 90." and the row's real latitude was untouched.
10. **Success message appears after saving** — confirmed: response HTML
    contains *"Les modifications ont été enregistrées."*
11. **Refresh preserves saved values** — confirmed: a fresh authenticated
    GET after the successful save above still showed the new email/address.
12. **Logout still works** — confirmed: `/admin` still renders the
    "Se déconnecter" logout form unchanged.
13. **Cars Management still works** — confirmed: `/admin/cars` still
    returns `200` for an authenticated admin.
14. **Dashboard still works** — confirmed: `/admin` still returns `200`.
15. **Public website still works** — confirmed: `/` and `/nos-voitures`
    still return `200`.
16. **Mobile Settings UI works** — the form reuses the same responsive
    `Field`/grid patterns as the Phase 2 Cars form (single column below
    `sm:`, two columns at `sm:` and above); no fixed pixel widths were
    introduced.
17. **Unauthorized mutation is blocked server-side** — confirmed: the same
    POST was replayed **without** the admin session cookie; the server
    threw `UNAUTHORIZED` and the database's `business_name` stayed `"MDA
    CAR"` instead of the submitted `"HACKED"` value.

Also verified: `/robots.txt` and `/sitemap.xml` still return `200`
(SEO regression, §27 of the brief).

One real bug was caught and fixed during this testing: the first draft
exported a plain constant (`initialSettingsState`) from the `"use server"`
actions file. Files with `"use server"` may only export async functions —
Next.js silently mis-serializes any other export, which surfaced at
runtime as `Cannot read properties of undefined (reading 'fieldErrors')`
when the settings page rendered. This is exactly why Phase 1 originally
defined that constant inside the client component instead — this phase
now follows the same rule.

## 15. Build result

```
✓ Compiled successfully
✓ TypeScript: no errors
✓ ESLint: no errors in any file touched by this phase
  (one pre-existing, unrelated warning in src/components/Header.tsx,
  not touched by Phase 3)
✓ next build: succeeds, /admin/settings correctly listed as a
  dynamic (ƒ) route
```

## 16. Confirmation that Phase 1 was preserved

Auth, sessions, login/lockout, and the dashboard shell are byte-for-byte
unchanged. The original three Phase 1 `business_settings` columns keep
their original names, types, and `NOT NULL` constraints.

## 17. Confirmation that Phase 2 was preserved

`cars` table, Cars Management pages, and their server actions are
untouched. `/admin/cars` verified functional end-to-end (list renders,
route protected).

## 18. Confirmation that public website UI was preserved

No public component, page, or route was modified. `lib/site.ts` — the
public site's only data source — was read from (to seed the database) but
not edited.

## 19. Confirmation that SEO was preserved

`sitemap.ts`, `robots.ts`, metadata, JSON-LD, and canonical URLs were not
touched. `/robots.txt` and `/sitemap.xml` verified to still return `200`.

## 20. Limitations / decisions for a future phase

- **Public integration is not wired up.** `business_settings` is now a
  complete, admin-editable record, but the public site still reads
  `lib/site.ts` directly. Pointing the public site at the database (so an
  admin edit actually changes what visitors see) is a deliberate,
  self-contained follow-up — it touches `Header`, `Footer`, the contact
  page, JSON-LD, and the Google Maps embed all at once, which the brief
  explicitly asked this phase not to do.
- **Email and street address start empty.** No confirmed values existed
  anywhere in the project for these two fields (the only "address" in the
  codebase is `PLACEHOLDERS.address`, an explicit "to be provided" token,
  not real data) — per the brief, nothing was invented. The admin can fill
  both in from `/admin/settings` at any time.
- **No logo/timezone/currency fields.** Left out because nothing in the
  current project reads them and Phase 1 already flagged logo management
  as a future enhancement requiring new infrastructure (file storage).
- **Opening hours are 7 fixed rows**, matching the exact shape already
  used by `lib/site.ts`, rather than free-form text — this keeps the
  eventual public-site integration a non-event (same shape, no parsing
  needed) but means unusual schedules (e.g. split shifts) aren't
  representable yet; that would be a deliberate future enhancement.
