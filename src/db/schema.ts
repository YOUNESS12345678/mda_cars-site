import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";

/**
 * Rental / contact requests sent from the website forms.
 * The primary conversion channel is WhatsApp; this table is a server-side
 * backup log so the agency never loses a request.
 */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message"),
  vehicle: text("vehicle"),
  pickupDate: text("pickup_date"),
  returnDate: text("return_date"),
  source: text("source").notNull().default("website"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ------------------------------------------------------------------ */
/*  ADMIN DASHBOARD — PHASE 1 FOUNDATION                                */
/*  Tables below back the admin dashboard. AdminUser / AdminSession /   */
/*  BusinessSettings are actively used by the Phase 1 login + settings  */
/*  screens. Car and Reservation are schema-only foundations for the    */
/*  dashboard features planned in later phases (no UI reads/writes      */
/*  them yet) — kept here so future phases only add UI, not migrations. */
/* ------------------------------------------------------------------ */

/** Admin accounts. Created via the `create-admin` script, never via a
 *  public endpoint. Passwords are always stored as bcrypt hashes. */
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  role: text("role").notNull().default("admin"),
  // Basic brute-force protection: lock the account after too many
  // consecutive failed attempts instead of allowing unlimited retries.
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Server-side sessions for the admin dashboard. The cookie only ever
 *  holds an opaque random token; this table stores a SHA-256 hash of
 *  that token (never the raw value), so a database leak alone can't be
 *  replayed as a valid session. Sessions can be revoked by deleting the
 *  row (used on logout and on password change in later phases). */
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Business-wide settings editable from the admin dashboard. Deliberately
 *  a singleton table (a single row, id = 1) — simplest possible shape for
 *  "one business, one set of settings". The public website is not wired
 *  to read from this table yet in Phase 1 (it still reads the confirmed
 *  values in lib/site.ts); a later phase can point the public site at
 *  this table without any schema change.
 *
 *  PHASE 3: extended with the wider business-information fields below.
 *  All additions are nullable columns, appended after the original
 *  Phase 1 fields — a purely additive, non-destructive change that
 *  cannot fail against the existing singleton row (phone/WhatsApp stay
 *  required exactly as Phase 1 defined them; everything new is optional
 *  because not all of it is confirmed real data yet — see
 *  lib/business-settings.ts for what is seeded vs. left empty). */
export const businessSettings = pgTable("business_settings", {
  id: serial("id").primaryKey(),
  phoneDisplay: text("phone_display").notNull(),
  phoneInternational: text("phone_international").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),

  // Business information
  businessName: text("business_name"),

  // Contact
  email: text("email"),

  // Location
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),

  // Opening hours — structured as an ordered array of { day, hours } so it
  // matches the shape already used by lib/site.ts (openingHours) and can
  // be rendered/edited as one row per day rather than free text.
  openingHours: jsonb("opening_hours").$type<
    { day: string; hours: string }[]
  >(),

  // Social media
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  websiteUrl: text("website_url"),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedBy: integer("updated_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
});

/** Vehicle fleet.
 *  Phase 1 created this as a foundation-only table (no UI read/wrote it).
 *  Phase 2 (Cars Management) is the first phase to read/write it, via
 *  /admin/cars. `model`, `year`, and `features` were added in Phase 2 —
 *  appended as nullable columns so the change stays a non-destructive
 *  `db:push` (no existing row can violate a new NOT NULL constraint).
 *  Required-ness of these fields for real data is enforced in the Phase 2
 *  server actions, not at the database level. */
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand"),
  model: text("model"),
  year: integer("year"),
  category: text("category"),
  transmission: text("transmission"),
  fuelType: text("fuel_type"),
  seats: integer("seats"),
  pricePerDay: integer("price_per_day"),
  imageUrl: text("image_url"),
  images: jsonb("images").$type<string[]>(),
  features: jsonb("features").$type<string[]>(),
  description: text("description"),
  isAvailable: boolean("is_available").notNull().default(true),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Reservations.
 *  Phase 1 created this as a foundation-only table (no UI read/wrote it).
 *  Phase 4 (Reservation System) is the first phase to read/write it, via
 *  the public reservation form and /admin/reservations.
 *
 *  PHASE 4: `status` default changed from "pending" to "new" so freshly
 *  created rows land in the admin funnel's first stage. This is a
 *  default-value-only change (no column added/removed/retyped) and is
 *  safe because no UI ever wrote a row before this phase, so no existing
 *  data can hold the old default. Allowed values are now:
 *  new | contacted | confirmed | cancelled | completed
 *  (see src/lib/reservation-constants.ts for the single source of truth). */
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").references(() => cars.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  // Customer city captured by the public rental form.
  customerCity: text("customer_city"),
  customerEmail: text("customer_email"),
  pickupDate: text("pickup_date"),
  returnDate: text("return_date"),
  // new | contacted | confirmed | cancelled | completed
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  source: text("source").notNull().default("website"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Admin notifications.
 *  PHASE 5: new table, no prior Notification model existed anywhere in the
 *  schema (confirmed by inspection before writing this). Follows the same
 *  "text column + app-level controlled union, not a DB enum" convention
 *  already used for `reservations.status` — see reservation-constants.ts's
 *  RESERVATION_STATUSES for the precedent this mirrors.
 *
 *  Only the display/navigation fields needed live here — no duplicated
 *  customer name, phone, or vehicle. `reservationId` is the link back to
 *  the reservation, which stays the single source of truth for that data
 *  (see src/lib/notifications.ts, which joins reservations/cars at read
 *  time for the dropdown/list preview text).
 *
 *  Single-admin architecture today (see adminUsers/adminSessions above,
 *  reused as-is): no adminUserId column. If a future phase introduces
 *  multiple admin accounts, add a nullable adminUserId column then —
 *  purely additive, same non-destructive pattern used throughout this
 *  schema — rather than guessing at multi-admin shape now. */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  // Controlled set, currently only "new_reservation" — see
  // notification-constants.ts's NOTIFICATION_TYPES for the source of truth.
  type: text("type").notNull().default("new_reservation"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  reservationId: integer("reservation_id").references(() => reservations.id, {
    onDelete: "cascade",
  }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

