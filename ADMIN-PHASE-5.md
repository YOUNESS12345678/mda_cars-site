# MDA CAR — Admin Dashboard (Phase 5)

## Admin Notifications + New Reservation Alert System

This document covers only what Phase 5 added. Phases 1 (auth, sessions,
dashboard shell), 2 (Cars Management), 3 (Business Settings), and 4
(Reservation System) were inspected and reused as-is — nothing in them was
rebuilt or replaced.

## 0. Stack correction vs. the brief

Same correction as Phases 2/3/4: the brief assumes Prisma. The project
uses **Drizzle ORM + PostgreSQL**, with `drizzle-kit push` (no migrations
folder) as the schema-sync workflow. Every instruction below was carried
out against that reality — including the brief's Prisma-specific
"Notification model" and "transaction" language, translated to Drizzle's
`pgTable` and `db.transaction()`.

Also confirmed by inspection: no `Notification` model existed anywhere in
the schema before this phase, no email provider/SDK is installed
(`package.json` has no `resend`, `nodemailer`, `sendgrid`, etc.), and the
admin architecture is single-admin (one `adminUsers` table, no
organization/tenant concept) — all of which shaped the decisions below.

## 1. Files created

```
src/lib/notification-constants.ts   — client-safe: type enum + French labels/copy,
                                       relative-time formatting, unread-count formatting
src/lib/notifications.ts            — server-only: re-exports the above, notification
                                       CRUD + queries (create, unread count, recent list,
                                       paginated list, mark-one-read, mark-all-read)
src/app/admin/(dashboard)/notifications/actions.ts
                                     — openNotificationAction (mark read + redirect),
                                       markOneReadAction, markAllReadAction
src/app/admin/(dashboard)/notifications/page.tsx
                                     — full /admin/notifications list, paginated
src/app/admin/(dashboard)/notifications/NotificationRow.tsx
                                     — one row: read/unread state, "Ouvrir", "Marquer comme lu"
src/app/admin/(dashboard)/notifications/MarkAllReadButton.tsx
                                     — "Tout marquer comme lu" button
src/components/admin/NotificationBell.tsx
                                     — bell + unread badge + dropdown (used in AdminShell)
src/components/admin/SubmitStatusButton.tsx
                                     — small useFormStatus wrapper so the plain
                                       mark-read-and-navigate forms show a pending state
ADMIN-PHASE-5.md                    — this report
```

## 2. Files modified

```
src/db/schema.ts                                 — new `notifications` table (additive only)
src/app/api/reservations/route.ts                — reservation insert now wrapped in
                                                     db.transaction() together with the
                                                     new notification insert
src/app/admin/(dashboard)/layout.tsx              — fetches unread count + recent
                                                     notifications server-side, passes to AdminShell
src/components/admin/AdminShell.tsx               — renders NotificationBell in the existing
                                                     mobile header, plus one new slim desktop
                                                     top bar (see §10)
```

## 3. Files intentionally left untouched

- All public pages/components (`/`, `/nos-voitures`, `/nos-voitures/[slug]`,
  `/contact`, `/services`, `/a-propos`, `/location-voiture-*`), header,
  footer, navigation, homepage sections, car detail layout, Google Maps,
  reviews, `BookingForm.tsx`.
- `src/lib/vehicles.ts` — the static public fleet.
- `/admin/cars` (Phase 2), `/admin/settings` (Phase 3), `/admin/reservations`
  list/detail/status-update flow (Phase 4) — all reused exactly as they
  were; the only reservation-side change is the transaction wrap in the
  public API route (§7 below), never the admin reservation UI or its
  server actions.
- `src/lib/business-settings.ts` — reused as read reference only (see §6:
  no email was built, so this was never actually touched at runtime).
- Authentication/session system (`src/lib/auth/*`) — `requireAdminPage`/
  `requireAdminAction` reused as-is by every new notification route/action.
- The main sidebar nav (`navItems` in `AdminShell.tsx`) — no "Notifications"
  entry was added there; the bell's dropdown already links to
  `/admin/notifications`, so the primary nav didn't need a new item.
- SEO: `src/app/robots.ts`, `src/app/sitemap.ts`, all metadata/JSON-LD —
  zero changes. `/admin/notifications` carries the same
  `robots: { index: false, follow: false }` every other admin page already
  uses; `/admin` was already disallowed in `robots.txt`.

## 4. Database changes

One new table, purely additive:

```
notifications
  id            serial primary key
  type          text, not null, default "new_reservation"
  title         text, not null
  message       text, not null
  reservationId integer, references reservations.id, onDelete cascade
  isRead        boolean, not null, default false
  createdAt     timestamp with tz, default now()
  readAt        timestamp with tz, nullable
```

No existing column, table, or default was changed. `db_users`,
`admin_sessions`, `business_settings`, `cars`, and `reservations` are all
untouched at the schema level.

**Migration**: same workflow as every prior phase — run `npm run db:push`
after pulling this change. It creates the new table only; it does not
reset the database and does not touch existing data in any table.

Design choices, and why:

- **Text column, not a Postgres enum**, for `type` — mirrors the existing
  convention: `reservations.status` is also a `text` column with an
  app-level controlled union (`RESERVATION_STATUSES`), not a DB enum.
  `notification-constants.ts`'s `NOTIFICATION_TYPES` is the single source
  of truth; `isValidNotificationType()` guards every read.
- **No stored customer name/vehicle** on the notification row. Per §5 of
  the brief ("do not duplicate all customer information"), the row only
  stores `reservationId`; `notifications.ts` joins `reservations`/`cars`
  at read time to build the "Ahmed — Dacia Logan" preview shown in the
  dropdown and list. The reservation stays the single source of truth.
- **`onDelete: "cascade"`** on `reservationId` — there is no reservation
  deletion feature anywhere in the admin today, so this is currently
  inert, but it's the correct default: a notification pointing at a
  reservation that no longer exists would be a dead link.
- **No `adminUserId` column** — the project has exactly one admin account
  today (see §0). Adding a multi-admin permission system here would have
  violated §6 of the brief ("do not introduce a full multi-admin
  permission system in this phase"). If a future phase adds real
  multi-admin support, add a nullable `adminUserId` column then — purely
  additive, same non-destructive pattern used throughout this schema.

## 5. Notification creation flow

`POST /api/reservations` (the existing, unchanged public endpoint) now
does this inside a single `db.transaction()`:

1. Insert the reservation (exactly as Phase 4 did), with `.returning({id})`
   to get the new row's id.
2. Insert the notification (`type: "new_reservation"`, French title/
   message, `reservationId` = the id from step 1).
3. If either insert throws, the whole transaction rolls back — there is
   no code path that can leave a reservation with no notification, or a
   notification with no reservation.

The browser never creates a notification directly: there is no public
notification API, no new fields the client can set on the reservation
POST, and `createNewReservationNotification()` lives in a `server-only`
module (`src/lib/notifications.ts`) that is only ever called from inside
this transaction.

Content (French, admin-facing, per §9 of the brief):

- Title: **"Nouvelle réservation"**
- Message: **"Une nouvelle demande de réservation a été reçue."**
- Preview shown alongside it (dropdown/list only, not stored): customer
  name + resolved vehicle label, e.g. "Ahmed — Dacia Logan" — computed the
  same way the reservation pages already derive a vehicle label (fleet
  match if `carId` resolved, otherwise the "Véhicule demandé : …" line
  preserved in `notes` by Phase 4's `resolveCarId`).

## 6. Email notifications — not implemented, by design

Per §20 of the brief: *"DO NOT automatically introduce an email provider
just because this phase is called Notifications... If no email
infrastructure exists, DO NOT install or configure a third-party provider
unless absolutely necessary."*

Inspection confirmed no email infrastructure exists anywhere in the
project — no provider SDK in `package.json`, no `EMAIL_*`/`SMTP_*`
environment variables in `.env.example`, no existing send-mail utility.
Installing and wiring a third-party email provider for this phase would
have meant adding a new external dependency, a new secret, and a new
failure mode to a project that has none of that today — not a minimal
change. The in-dashboard notification system (required) is fully
implemented; email (optional) was deliberately skipped rather than
bolted on. See §25 ("Limitations and future recommendations") for how to
add it later without disruption.

## 7. Admin notification UI

**Bell + badge** (`NotificationBell.tsx`, used from `AdminShell.tsx`):

- The existing dashboard had a header only on mobile (`md:hidden`); there
  was no desktop header at all — the sidebar covered navigation. Rather
  than redesign the dashboard, the minimal addition was: put the bell in
  the existing mobile header, and add one new slim desktop-only top bar
  (`hidden ... md:flex`, just a right-aligned bell) above `<main>`. No
  other change to the dashboard chrome, sidebar, or stat cards.
- Badge shows the unread count, capped at "99+" (`formatUnreadCount`),
  never negative, always computed from the database
  (`getUnreadNotificationCount()`), never hard-coded.
- Accessible: `aria-label="Notifications (N non lues)"` (not just a bell
  glyph), `aria-expanded`, `aria-haspopup`, closes on outside click and
  on `Escape`, visible focus ring via `focus-visible:outline`.

**Dropdown**: most recent 10 notifications (`getRecentNotifications(10)`
— never the full history for this small UI element, per §34). Unread rows
are distinguished by **three** signals, not color alone: a small dot, bold
text weight, and a subtle background tint. Empty state: "Aucune
notification." All-read state: "Aucune nouvelle notification." shown
alongside the (still browsable) list. Each item is a tiny form that
submits to `openNotificationAction` — mark-as-read and navigate-to-
reservation happen as one server round trip, so they can never end up out
of sync. A "Voir toutes les notifications" link goes to the full page.

**Full page** (`/admin/notifications`, protected by the same
`requireAdminPage()` the shared dashboard layout already calls — no
separate auth check needed): paginated (20/page, mirrors the existing
`/admin/reservations` list's pattern), shows type, message + preview,
created date/time, read/unread state, and per-row "Ouvrir" (mark read +
navigate) and "Marquer comme lu" (mark read, stay on the page) actions,
plus a page-level "Tout marquer comme lu". Empty state: "Aucune
notification."; all-read state: "Aucune nouvelle notification." shown
above the (still visible, already-read) list.

**Loading states**: `useActionState`'s `isPending` disables the
"Marquer comme lu" and "Tout marquer comme lu" buttons while their
mutation runs. The plain mark-and-navigate forms (dropdown items,
"Ouvrir") use a small `useFormStatus` wrapper (`SubmitStatusButton.tsx`)
for the same purpose, so no action can be double-submitted from any
surface.

**Responsive**: dropdown width is `min(22rem, 90vw)` so it never overflows
a narrow viewport; bell appears in both the mobile and desktop headers.

## 8. Read/unread system

- `markNotificationRead(id)` and `markAllNotificationsRead()` live in
  `src/lib/notifications.ts`, both `server-only`, both called only from
  `requireAdminAction()`-guarded server actions. The server always sets
  `readAt = new Date()` — the client cannot supply it (§14 of the brief).
- Marking an already-read notification again is a safe no-op, so
  double-clicks/retries never error.
- Single-admin architecture today, so "mark all as read... only
  notifications belonging to the authenticated admin" (§15) reduces to
  "every notification" — documented explicitly in `notifications.ts` and
  `schema.ts` so a future multi-admin phase knows exactly where to add
  the `adminUserId` scoping.

## 9. Unread count

`getUnreadNotificationCount()` runs a `COUNT(*) WHERE is_read = false`
against the database on every layout render and after every mutation
(via `revalidatePath("/admin", "layout")`). Never cached client-side,
never hard-coded, never able to go negative (there is no client-writable
path to the count at all — it's purely derived).

## 10. Duplicate notifications / idempotency

Per §19: *"Reuse any idempotency protection already implemented in Phase
4. Do not invent a complex distributed system."* Inspection of Phase 4's
`POST /api/reservations` found **no existing idempotency protection**
(no unique constraint, no client-supplied request id, no debounce) — a
retried/double-submitted request could already create two reservation
rows before this phase, and that behavior is unchanged by Phase 5. What
Phase 5 *does* guarantee is that it never makes this worse: the
notification is created 1:1 with the reservation inside the same
transaction, so a duplicate submission produces at most one duplicate
reservation **and** its own single notification — never an orphaned
notification, and never a reservation silently missing its notification.
Inventing real idempotency protection (e.g. a client-generated request id
with a unique constraint) was out of scope here since none existed to
reuse; flagged again in §25 as a improvement for a future phase.

## 11. Security

- Every notification read/mutation (`getNotificationById`,
  `markNotificationRead`, `markAllNotificationsRead`, and the three
  server actions that call them) requires a valid admin session via
  `requireAdminAction()`/the shared `requireAdminPage()` layout guard —
  never trusts a client-supplied admin id, role, or notification owner.
- Notification/reservation ids are always validated (`Number.isInteger`,
  `> 0`) and existence-checked against the database before use — an
  invalid or stale id returns a safe French message
  ("Cette notification n'existe pas.") or redirects to the list, never a
  raw error, stack trace, or Prisma/SQL detail.
- No public notification API exists. `createNewReservationNotification`
  is only importable from server code (`server-only` module) and is only
  ever called from inside the transaction in `POST /api/reservations`.
- `/admin/notifications` is covered by the same server-side session guard
  as every other `/admin/(dashboard)/*` route (enforced once, in the
  shared layout) and carries `robots: { index: false, follow: false }`.

## 12. Error handling

French, generic, consistent with the existing admin's tone
(`ReservationStatusForm.tsx`'s error pattern was reused as the template):

- "Cette notification n'existe pas."
- "Impossible de marquer la notification comme lue."
- "Impossible de mettre à jour les notifications."

No Prisma/SQL error text, stack trace, or server path is ever returned to
the client — every mutation catches and replaces the underlying error.

## 13. Environment variables

**None added.** No email provider was installed (§6), so no new secret or
`NEXT_PUBLIC_*` value was needed. `.env.example` is unchanged.

## 14. Commands required locally

```
npm run db:push       # creates the new `notifications` table (additive only)
npm run typecheck
npm run lint
npm run build
```

## 15. Tests performed (manual code-level verification)

Network access was unavailable in this environment (`npm install` failed
with a 403 from the registry proxy), so `typecheck`/`lint`/`build`/an
actual dev server could not be run here. In their place, every new and
modified file was manually re-read end-to-end for: import correctness
(paths, client/server boundary — no `server-only` module imported into a
`"use client"` file except through a `"use server"` action, matching the
existing `logoutAction` pattern), type consistency against the real
Drizzle schema, and consistency with the existing code's conventions
(color tokens, error-message tone, form/action patterns). **Running the
commands in §14 against a real database before deploying is strongly
recommended** before considering this phase verified end-to-end.

Reasoned through (could not execute):

- **Notification creation**: submitting a reservation → transaction
  inserts reservation + notification together → notification starts
  unread → unread count increments → dropdown/list show it with the
  correct preview → opening it marks it read and navigates to
  `/admin/reservations/[id]`.
- **Authorization**: every notification route/action begins with
  `requireAdminPage()`/`requireAdminAction()`, identical in shape to
  every other protected admin route already in the project — a
  logged-out request is redirected/throws exactly as `/admin/reservations`
  already does.
- **No duplicate-on-status-change**: nothing in
  `reservations/actions.ts`'s `updateReservationStatusAction` was
  touched; status transitions (`new → contacted → confirmed`, etc.) still
  call no notification code at all. The only notification-creating code
  path in the whole project is the one transaction in
  `POST /api/reservations`.
- **Public website / SEO**: no public page, component, metadata, JSON-LD,
  `robots.ts`, or `sitemap.ts` file was touched by this phase (verified
  by the file list in §2 — every change is under
  `src/app/admin/(dashboard)/`, `src/lib/`, `src/components/admin/`, or
  the API route's insert logic).

## 16. Phase 1–4 preservation confirmation

- **Phase 1 (auth)**: `src/lib/auth/*` untouched. `requireAdminPage`/
  `requireAdminAction` reused verbatim.
- **Phase 2 (Cars Management)**: no file under `/admin/cars` touched.
- **Phase 3 (Business Settings)**: no file under `/admin/settings` or
  `business-settings*.ts` touched.
- **Phase 4 (Reservations)**: `/admin/reservations` list, detail, status
  form, and actions are byte-for-byte unchanged. The only reservation-side
  edit anywhere is wrapping the existing insert in
  `POST /api/reservations` inside `db.transaction()` — the insert's
  values, validation, and response shape are identical to before.
- **Dashboard shell**: `AdminShell.tsx`'s sidebar, nav items, logout flow,
  and mobile drawer are all unchanged; the only addition is the bell in
  the two headers described in §7.

## 17. Public website / SEO preservation confirmation

No public page, component, `robots.ts`, `sitemap.ts`, or metadata/JSON-LD
file appears anywhere in §2's file lists. `/admin/notifications` carries
`robots: { index: false, follow: false }`, matching every other admin
page; it is not referenced from `sitemap.ts` and `/admin` was already
disallowed in `robots.txt` before this phase.

## 18. Limitations and future recommendations

- **Email notifications** were not built (§6) — no email infrastructure
  existed to reuse. If a future phase adds one, `businessSettings.email`
  (Phase 3) is already the right place to read the destination address
  from; the notification content structure in
  `notification-constants.ts` already separates title/message from the
  reservation-specific preview, so a "send an email with the same
  content" step could hook in right where
  `createNewReservationNotification()` is called, without touching the
  in-dashboard system.
- **Real idempotency** for the public reservation POST does not exist —
  it didn't exist in Phase 4 either, and per §19 of the brief this phase
  did not invent one. A future phase could add a client-generated
  idempotency key with a unique constraint if double-submission becomes a
  real problem.
- **No live/real-time updates** — per §33 of the brief, this phase
  intentionally stays at "loads on render + revalidates after a
  mutation," with no polling or WebSocket/Pusher/Ably infrastructure. If
  admins ask for the badge to update without a navigation or their own
  action, the simplest next step would be a short client-side polling
  interval calling a small "get unread count" server action — still no
  new infrastructure, just a `setInterval`.
- **Multi-admin** notification ownership was intentionally not built
  (§6/§15 of the brief) since the project has exactly one admin account
  today; see §4's schema notes for exactly what a future phase would add.
