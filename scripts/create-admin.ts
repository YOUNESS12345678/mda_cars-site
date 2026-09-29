import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { adminUsers } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";

/**
 * Creates (or resets the password of) an admin user.
 * There is no public sign-up route by design — this script is the only
 * way to provision admin accounts, run directly on the server/by the
 * developer, never exposed over HTTP.
 *
 * Usage:
 *   npm run create-admin -- "email@mdacar.ma" "StrongPassword123!" "Nom (optionnel)"
 */
async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    console.error(
      'Usage: npm run create-admin -- "email@mdacar.ma" "StrongPassword123!" "Nom (optionnel)"',
    );
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    console.error("Adresse email invalide.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail))
    .limit(1);

  if (existing[0]) {
    await db
      .update(adminUsers)
      .set({
        passwordHash,
        name: name ?? undefined,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, existing[0].id));
    console.log(`Mot de passe mis à jour pour ${normalizedEmail}.`);
  } else {
    await db.insert(adminUsers).values({
      email: normalizedEmail,
      passwordHash,
      name: name ?? null,
    });
    console.log(`Compte administrateur créé pour ${normalizedEmail}.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Échec de la création du compte administrateur :", error);
  process.exit(1);
});
