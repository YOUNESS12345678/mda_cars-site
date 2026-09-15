/**
 * UI form-state shape for the car create/edit form (`useActionState`).
 * Deliberately NOT in actions.ts: that file is a Server Actions module
 * (marked with the use-server directive), and such a module may only
 * export async functions — an exported `const` object (like
 * `initialCarFormState`) breaks the production build ("A 'use server'
 * file can only export async functions, found object"). Exported
 * `type`s are fine there (erased at build time), but this runtime value
 * needs its own plain module.
 */

import type { CarFieldErrors } from "@/lib/cars";

export type CarFormState = {
  error: string | null;
  fieldErrors: CarFieldErrors;
};

export const initialCarFormState: CarFormState = {
  error: null,
  fieldErrors: {},
};
