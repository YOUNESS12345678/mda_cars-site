/**
 * UI form-state shape for notification actions (`useActionState`).
 * Deliberately NOT in actions.ts: that file is a Server Actions module
 * (marked with the use-server directive), and such a module may only
 * export async functions — an exported `const` object (like
 * `initialNotificationActionState`) breaks the production build ("A
 * 'use server' file can only export async functions, found object").
 * Exported `type`s are fine there (erased at build time), but this
 * runtime value needs its own plain module.
 */

export type NotificationActionState = {
  error: string | null;
};

export const initialNotificationActionState: NotificationActionState = {
  error: null,
};
