import bcrypt from "bcryptjs";

/**
 * Password hashing for admin accounts. Never store or log a plain-text
 * password anywhere — only the bcrypt hash is persisted (admin_users.password_hash).
 */

const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainTextPassword: string,
  storedHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, storedHash);
}
