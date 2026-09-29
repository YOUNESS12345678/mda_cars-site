# MDA CAR — Admin Dashboard (Phase 4)

## Reservation System + Reservation Management

This document covers only what Phase 4 added. Phase 1 (auth, sessions,
dashboard shell), Phase 2 (Cars Management) and Phase 3 (Business Settings)
were inspected and reused as-is — nothing in them was rebuilt or replaced.

## 0. Stack correction vs. the brief

Same correction as Phase 2/3: the brief assumes Prisma. The project uses
**Drizzle ORM + PostgreSQL**, with `drizzle-kit push` (no migrations
folder) as the schema-sync workflow. Every instruction below was carried
out against that reality.

## 1. A key architectural fact discovered during inspection

The public site's vehicle catalog (`src/lib/vehicles.ts`) is **static
sample data**, entirely separate from the `cars` database table that
`/admin/cars` (Phase 2) manages. This was true before Phase 4 and the
brief explicitly forbids forcing a migration of public car data just to
make reservations relational (§35). Practical consequence: a public
reservation frequently cannot be linked to a real `carId` today, because
the requested vehicle simply doesn't exist yet as an admin-managed row.
This is not a bug — see §9 below for how it's handled without losing
information or breaking the "no free-text car duplication" rule.

## 2. Files created

```
src/lib/reservation-constants.ts   — client-safe: status enum + French labels, validation,
                                      phone normalization, date-only formatting
                                      (mirrors the car-constants.ts / cars.ts split from Phase 2)
src/lib/reservations.ts            — server-only: re-exports the above, resolveCarId()
                                      (best-effort car matching), hasOverlappingActiveReservation()
src/app/api/reservations/route.ts  — public POST endpoint, mirrors /api/leads/route.ts's
                                      shape and safety posture
src/app/admin/(dashboard)/reservations/actions.ts              — updateReservationStatusAction
src/app/admin/(dashboard)/reservations/ReservationStatusForm.tsx — inline status-change control
src/app/admin/(dashboard)/reservations/ReservationStatusBadge.tsx — shared status badge
src/app/admin/(dashboard)/reservations/[id]/page.tsx           — reservation detail view
ADMIN-PHASE-4.md                                                — this report
```

## 3. Files modified

```
src/db/schema.ts                                — reservations.status default "pending" → "new"
                                                   (default-value-only change, see §5)
src/app/admin/(dashboard)/reservations/page.tsx — placeholder replaced with the real list
                                                   (search, status filter, pagination)
src/app/admin/(dashboard)/page.tsx              — real reservation stats + Recent Reservations
src/components/admin/AdminShell.tsx             — removed the "Bientôt" (coming soon) badge on
                                                   the Réservations nav item
src/lib/contact.ts                              — added createReservation() alongside logLead(),
                                                   does not touch logLead/buildBookingMessage
src/components/BookingForm.tsx                  — calls createReservation() in addition to the
                                                   existing logLead()/WhatsApp flow; no visual/label
                                                   change
```

## 4. Files intentionally left untouched

- All other public pages/components (`/`, `/nos-voitures`, `/nos-voitures/[slug]`,
  `/contact`, `/services`, `/a-propos`, `/location-voiture-*`), header, footer,
  navigation, homepage sections, car detail layout, Google Maps, reviews.
- `src/lib/vehicles.ts` — the static public fleet, per §35 of the brief.
- `/admin/cars` (Phase 2) in full — list, form, actions, slug generation.
- `/admin/settings` (Phase 3) in full.
- Authentication/session system (`src/lib/auth/*`), including
  `requireAdminPage`/`requireAdminAction`, used as-is by every new route.
- `src/app/api/leads/route.ts` and the `leads` table — the WhatsApp backup
  log keeps working exactly as before; Phase 4 adds a parallel path, not a
  replacement.
- SEO: `src/app/robots.ts`, `src/app/sitemap.ts`, all metadata/JSON-LD —
  zero changes. `/api` was already disallowed in robots.txt, which already
  covers the new `/api/reservations` route.

## 5. Database changes

Single change to the existing `reservations` table (created in Phase 1 as
a foundation-only table — no UI had ever read or written it):

- `status` column default: `"pending"` → `"new"`.

No column was added, removed, or retyped. This is safe because no phase
before this one ever inserted a row into `reservations`, so no existing
data can be holding the old default. `carId`'s `onDelete: "set null"`
(already correct from Phase 1/2) was reused as-is — Phase 2's car-deletion
logic already preserves historical reservations, nothing to change there.

**Migration**: with `drizzle-kit push` there is no migration file to
generate — run `npm run db:push` after pulling this change. It will not
touch `admin_users`, `admin_sessions`, `business_settings`, or `cars`, and
it will not reset or delete any data (`drizzle-kit push` never runs
`migrate reset`).

## 6. Reservation model — final shape

```
id, carId (nullable FK → cars, onDelete set null), customerName,
customerPhone, customerEmail (nullable), pickupDate (nullable),
returnDate (nullable), status ("new"|"contacted"|"confirmed"|"cancelled"
|"completed"), notes (nullable — holds the customer message, and the
requested vehicle name when it couldn't be matched to a car), source,
createdAt, updatedAt
```

This already matched almost everything the brief asked for; no
`customerWhatsApp` column was added since the public form only ever
collected one phone number — the admin's WhatsApp button normalizes that
same number rather than duplicating the field (see §11).

## 7. Car/Reservation relation

Reused exactly as Phase 1/2 defined it: `reservations.carId` references
`cars.id` with `onDelete: "set null"`. Deleting a car in `/admin/cars`
(Phase 2's `deleteCarAction`) already orphans — never destroys — any
reservation that referenced it; this was verified by reading Phase 2's
code and comments, not re-implemented.

## 8. Public reservation integration

The existing `BookingForm.tsx` UI (design, layout, labels, WhatsApp-first
copy) is **byte-for-byte unchanged**. What changed is `handleSubmit`:
alongside the existing `openWhatsApp()` + `logLead()` calls, it now also
calls `createReservation()`, which:

- resolves the selected vehicle's `slug` from the same `vehicles` list
  already passed into the form (no new UI state, no new field),
- POSTs to `/api/reservations` (new, separate from `/api/leads`),
- is fire-and-forget, exactly like `logLead` — WhatsApp has already
  opened by the time this runs, so a network failure here is silent and
  never blocks or degrades the existing flow.

`/api/reservations` (`src/app/api/reservations/route.ts`):
1. Parses and type-checks the JSON body.
2. Validates via `validatePublicReservationInput` (see §9).
3. Best-effort resolves `carId` via `resolveCarId` (slug/name match
   against the real `cars` table).
4. Inserts with `status: "new"`, server-determined — the client cannot
   set status, `createdAt`, or anything else.
5. Returns a generic `{ ok, error }` shape; no stack traces, no Prisma/SQL
   errors, no internal paths are ever exposed.

## 9. Validation — and one deliberate deviation from the brief's letter

Server-side validation (`validatePublicReservationInput` in
`reservation-constants.ts`) requires **name and phone**, matching what the
actual `BookingForm` UI enforces (`required` on those two inputs only).
Dates, vehicle, and message stay optional — this is not an oversight, it's
what the existing UI already promises the customer ("Demander les
disponibilités... aucune réservation n'est validée automatiquement").
Per §3 of the brief ("connect the existing form... only the underlying
data flow should be improved"), tightening this would have changed the
existing UX, which is out of scope. When dates *are* supplied, they are
still validated for shape (`YYYY-MM-DD`) and order (`returnDate` cannot
be before `pickupDate`).

Car handling: because the public catalog and the `cars` table are
disconnected today (§1), a reservation cannot always be validated against
"a real, available car" the way the brief's §7/§10 describe for a fully
relational catalog. Instead: `resolveCarId` does a best-effort slug/name
match; if it succeeds, the reservation is linked to that car. If it
doesn't, `carId` stays `null` and the requested vehicle name is preserved
as a `"Véhicule demandé : <name>"` line in `notes` — so the admin never
loses the information, and the `Reservation` model never gets a
duplicate/denormalized car-name column (per §6 of the brief). This is
flagged again in §16 as a limitation for a future phase.

Never trusted from the client: `status`, `createdAt`, admin identity —
all server-determined, matching §8 of the brief exactly.

## 10. Availability / conflict logic

Implemented `hasOverlappingActiveReservation` (`lib/reservations.ts`):
proper date-range overlap (`NOT (otherEnd < start OR otherStart > end)`,
never just an equality check on start dates), scoped to reservations
still "active" (`new`/`contacted`/`confirmed`) for the same `carId`.

Where it's enforced: **at confirmation**, not at submission. A public
"request" is exactly that — a request, not a firm hold — so it's always
accepted (the business already manually triages every new request from
`/admin/reservations`). The overlap check runs inside
`updateReservationStatusAction` only when an admin tries to move a
reservation to `confirmed` *and* that reservation has both a resolved
`carId` and both dates set: if another active reservation for the same
car overlaps, the confirmation is rejected with a clear error instead of
silently double-booking the vehicle. This keeps the brief's "prevent
obvious double-booking" requirement (§10) without over-engineering a full
scheduling system, and without blocking flexible/dateless inquiries that
the existing form intentionally allows.

## 11. Admin reservation routes

- `/admin/reservations` — list with:
  - search (customer name, phone, car brand/model/name),
  - status filter (all 5 statuses, French labels),
  - server-side pagination (20/page),
  - responsive cards (not a forced desktop table — consistent with how
    `/admin/cars` already handles this), inline status-change control,
  - empty state ("Aucune réservation pour le moment.") and a distinct
    empty-with-filters state.
- `/admin/reservations/[id]` — detail view:
  - customer info (name, phone, email),
  - rental info (car — real fleet name if linked, otherwise the
    preserved requested-vehicle label — and dates),
  - customer message,
  - status control + last-updated timestamp,
  - Call / WhatsApp / Email actions, all built from the **customer's**
    phone/email (never MDA CAR's own number — see §12).
- Both routes are inside the existing `admin/(dashboard)` route group, so
  `requireAdminPage()` (already called once in that group's `layout.tsx`)
  protects them exactly like `/admin/cars` and `/admin/settings` — no new
  auth code was needed or added.

## 12. Server Actions / mutations

`updateReservationStatusAction` (`reservations/actions.ts`), modeled
directly on `cars/actions.ts`'s pattern:
- calls `requireAdminAction()` first, throws if unauthenticated,
- validates the reservation id and the status against the fixed enum
  (`isValidReservationStatus`) — an arbitrary string can never reach the
  database,
- re-fetches the reservation server-side before mutating (never trusts a
  client-supplied row),
- runs the confirmation-time overlap check (§10),
- `revalidatePath` on `/admin/reservations`, the detail page, and `/admin`
  (so dashboard stats and Recent Reservations update immediately).

## 13. Customer contact actions

- **Call**: `tel:+<normalized phone>` — opens the device's native dialer.
- **WhatsApp**: `https://wa.me/<normalized phone>`, only rendered when the
  number normalizes to something valid.
- **Email**: `mailto:<email>`, only rendered when an email was provided.
- `normalizeMoroccanPhone` (`reservation-constants.ts`) handles the same
  "Moroccan-first, don't invent codes for anything that already looks
  international" rule the rest of the site uses (`lib/site.ts`'s
  `whatsappNumber`), without adding a new `customerWhatsApp` column.
- All three actions are verified to build from `row.customerPhone` /
  `row.customerEmail` — MDA CAR's own number/WhatsApp
  (`lib/site.ts`/`whatsappHref`) is never referenced on this page.

## 14. Dashboard statistics + Recent Reservations

`/admin` now shows, alongside the untouched "Voitures enregistrées" and
"Demandes reçues (site)" stats:
- **Nouvelles réservations** — `status = 'new'`.
- **Réservations en attente** — `status in ('new', 'contacted')`, per the
  brief's recommended "Pending" definition (§24); cancelled/completed are
  excluded.
- **Réservations (total)** — all-time count.
- **Réservations récentes** — latest 5, each linking straight to its
  detail page, showing customer, car (or preserved requested-vehicle
  label), date, and status badge.

All of it reads live from the database; nothing is placeholder text
anymore. The dashboard's visual structure/grid was reused as-is — only
the stat cards' content and count changed, plus one new "Réservations
récentes" section replacing the old static "Prochaines étapes" list
(whose two items — reservation tracking and new-reservation notifications
— are now: the first is done, the second remains out of scope for this
phase, per §53).

## 15. Security / customer-data protection

- Every reservation read/mutation on the admin side goes through
  `requireAdminPage`/`requireAdminAction` — no public API exposes the
  `reservations` table (`/api/reservations` only ever *inserts*, and
  returns nothing back but `{ ok: true }`).
- No DELETE was added for reservations, per §27 of the brief — the only
  mutation is status change, and `cancelled` is the intended substitute
  for deletion.
- No secrets/DB credentials touched or introduced; `DATABASE_URL` is
  still the only required env var (unchanged from Phase 1's `.env.example`).
- All server errors are caught and translated to generic French messages;
  raw Prisma/SQL/stack details are never returned to the client (public
  or admin).

## 16. Known limitations / decisions for a future phase

1. **Catalog unification**: the public static vehicle list and the
   `cars` table are still two different data sources. Today, most public
   reservations will have `carId = null` with the requested vehicle name
   preserved in `notes`. A future phase pointing the public site at the
   `cars` table (as Phase 1's original schema comment already anticipated)
   would let every reservation resolve a real `carId`, which would also
   make the confirmation-time overlap check apply universally instead of
   only to matched cars.
2. No WhatsApp/email/SMS automation, no payment processing, no calendar
   sync, no CRM, no revenue analytics — all explicitly out of scope per
   §53 and not implemented.
3. Pagination is simple offset-based (`LIMIT`/`OFFSET`), adequate for the
   current and near-term dataset size; a cursor-based approach could
   replace it later if the table grows very large.

## 17. Environment variables

None added. `DATABASE_URL` remains the only required variable.

## 18. Commands required locally

```bash
npm install
npm run db:push       # applies the reservations.status default change
npm run typecheck
npm run lint
npm run build
```

**Important**: this sandbox has no network access, so `npm install`,
`typecheck`, `lint`, and `build` could not be executed here — `npm
install` failed with a registry 403 (network egress blocked). Every file
was reviewed manually line-by-line against the project's existing
patterns (Drizzle query shapes, `useActionState` usage, French copy,
Tailwind class conventions) instead. Please run the four commands above
locally before deploying; if anything surfaces, it should be narrow
(e.g. a Drizzle operator import) given the scope of what changed.

## 19. Tests performed (manual code review — see §18 for why)

- Traced the full public submission path: `BookingForm` → `createReservation`
  → `/api/reservations` → `validatePublicReservationInput` →
  `resolveCarId` → `db.insert(reservations)`.
- Traced the full admin path: `/admin/reservations` list query → detail
  page query → `ReservationStatusForm` → `updateReservationStatusAction`
  → `revalidatePath`.
- Verified `requireAdminPage()` in the existing `admin/(dashboard)/layout.tsx`
  covers both new routes (no bypass possible).
- Verified `isValidReservationStatus` rejects anything outside the 5
  allowed values before it can reach `db.update`.
- Verified the overlap query uses a true range comparison, not a
  start-date equality check.
- Verified Car deletion (Phase 2, unmodified) still uses `onDelete: "set
  null"` — reservations survive a car deletion.
- Verified `/api` stays disallowed in `robots.ts` (unmodified), covering
  the new route; verified no SEO/metadata file was touched.

## 20. Build result

Not executed — see §18. No blocking network access in this environment.

## 21. Phase 1 preservation

Auth, sessions, admin shell, business settings foundation, `leads` table
and `/api/leads` — untouched, verified by inspection and by diffing
against `ADMIN-PHASE-1.md`.

## 22. Phase 2 preservation

`/admin/cars`, `CarForm.tsx`, `CarRowActions.tsx`, `cars/actions.ts`,
`lib/cars.ts`/`car-constants.ts`, car deletion safety — untouched, reused
as documented references for this phase's patterns.

## 23. Phase 3 preservation

`/admin/settings`, `SettingsForm.tsx`, `settings/actions.ts`,
`business-settings*.ts` — untouched.

## 24. Public website preservation

No public page, component, layout, header, footer, or styling was
changed. The only public-facing behavioral change is invisible to the
visitor: `BookingForm.tsx`'s submit handler makes one additional
fire-and-forget network call.

## 25. SEO preservation

`robots.ts`, `sitemap.ts`, all page `metadata`, JSON-LD/Schema.org — zero
changes. `/api` and `/admin` were already disallowed, which already
covers the new `/api/reservations` endpoint.

---

**Per the brief: Phase 4 stops here.** No WhatsApp/email/SMS automation,
no payments, no calendar sync, no CRM, no revenue analytics, no public
redesign were implemented.
