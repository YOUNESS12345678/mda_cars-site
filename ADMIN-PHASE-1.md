# MDA CAR — Admin Dashboard (Phase 1)

This document covers only the admin foundation added in this phase. It does
not affect the public website, which is unchanged and documented separately.

## What was built

1. **Database foundation** (Drizzle ORM — the project's existing ORM, reused
   as-is, not replaced):
   - `admin_users` — admin accounts (bcrypt password hashes only)
   - `admin_sessions` — server-side sessions (hashed tokens, revocable)
   - `business_settings` — singleton row for phone/WhatsApp numbers
   - `cars` — **foundation only**, not yet used by any screen
   - `reservations` — **foundation only**, not yet used by any screen
   - `leads` (pre-existing, untouched)
2. **Secure admin authentication** — email + bcrypt-hashed password,
   server-side sessions, account lockout after 5 failed attempts.
3. **Login page** — `/admin/login`.
4. **Protected dashboard route** — `/admin`, redirects to `/admin/login`
   when signed out.
5. **Dashboard layout** — sidebar (Vue d'ensemble, Voitures, Réservations,
   Paramètres) + mobile drawer.
6. **Business settings** — `/admin/settings`, fully working (read/write to
   the database).
7. **Cars / Reservations** — schema exists; the dashboard pages show a
   "coming soon" placeholder, as instructed for this phase.

## What was intentionally NOT done

- The public website was not modified beyond one small, necessary
  integration change: the shared root layout now hides the public
  header/footer/WhatsApp button on `/admin/**` routes only (see
  `src/components/SiteChrome.tsx`). No public page's markup, metadata,
  JSON-LD, sitemap, robots.txt, or canonical URLs changed.
- The public site still reads phone/WhatsApp numbers from `lib/site.ts`,
  **not** from `business_settings`. Editing them in `/admin/settings`
  updates the database only. Wiring the public site to read from the
  database is a deliberate decision left for a later phase, so this phase
  never touches public-facing output.
- No Cars/Reservations CRUD UI — schema only, as requested.
- No password-reset-by-email flow (would need an email provider — out of
  scope for this phase). Password resets go through the `create-admin`
  script (see below), which upserts by email.

## Setup

1. **Install dependencies** (adds `bcryptjs`, `tsx`, `server-only` — no
   other new tech introduced; the project's existing PostgreSQL + Drizzle
   setup is reused):
   ```bash
   npm install
   ```

2. **Set `DATABASE_URL`** in your environment (see `.env.example`). This is
   the same variable the project already used for the `leads` table.

3. **Sync the new tables to your database.** This project uses Drizzle's
   push-based workflow (matching how the existing `leads` table was set
   up — there was no migrations folder in the project), so:
   ```bash
   npm run db:push
   ```
   This is non-destructive: it only adds the new tables
   (`admin_users`, `admin_sessions`, `business_settings`, `cars`,
   `reservations`) and leaves `leads` untouched.

4. **Create your first admin account.** There is no public sign-up route
   by design — accounts are provisioned with this script:
   ```bash
   npm run create-admin -- "vous@mdacar.ma" "UnMotDePasseSolide123!" "Votre nom"
   ```
   Running it again with the same email resets that account's password
   (and clears any lockout) — this is how you reset a forgotten password.

5. **Log in** at `/admin/login` with that email and password.

## Security notes

- Passwords are hashed with bcrypt (12 salt rounds) — never stored or
  logged in plain text, and never sent to the browser.
- Sessions are an opaque random token in an `httpOnly`, `secure` (in
  production), `SameSite=Lax` cookie. The database stores only a SHA-256
  hash of that token, so a database leak alone cannot be replayed as a
  valid session. Logging out deletes the session row immediately.
- No shared authentication secret exists anywhere (no `NEXTAUTH_SECRET`-
  style variable to configure or leak) — hashing and session tokens are
  self-contained.
- Every admin Server Action re-verifies the session itself
  (`requireAdminAction()`), on top of the page-level guard
  (`requireAdminPage()`) — losing the page guard alone would not expose a
  write path.
- 5 consecutive failed logins lock the account for 15 minutes.
- `/admin` was already disallowed in `robots.txt` before this phase;
  the new admin pages additionally set `robots: noindex, nofollow` as
  defense in depth.

## File map

```
src/db/schema.ts                          — new tables appended
drizzle.config.json                       — added "out" path (no other change)
scripts/create-admin.ts                   — admin provisioning CLI

src/lib/auth/password.ts                  — bcrypt hash/verify
src/lib/auth/session.ts                   — session create/read/destroy
src/lib/auth/login-guard.ts               — failed-attempt lockout
src/lib/auth/require-admin.ts             — page/action guards
src/lib/business-settings.ts              — singleton settings read/seed

src/app/admin/(auth)/layout.tsx           — centered shell, redirects if already signed in
src/app/admin/(auth)/login/page.tsx       — login page
src/app/admin/(auth)/login/LoginForm.tsx  — client form (validation, loading, errors)
src/app/admin/(auth)/login/actions.ts     — login server action

src/app/admin/(dashboard)/layout.tsx      — auth guard + dashboard shell
src/app/admin/(dashboard)/actions.ts      — logout
src/app/admin/(dashboard)/page.tsx        — overview (real counts from the DB)
src/app/admin/(dashboard)/settings/*      — business settings (page, form, action)
src/app/admin/(dashboard)/cars/page.tsx           — placeholder
src/app/admin/(dashboard)/reservations/page.tsx   — placeholder

src/components/admin/AdminShell.tsx       — sidebar + mobile drawer
src/components/SiteChrome.tsx             — hides public header/footer on /admin/**
src/app/layout.tsx                        — one-line integration change (uses SiteChrome)
```
