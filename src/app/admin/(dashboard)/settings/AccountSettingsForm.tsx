"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import {
  updateAccountSettingsAction,
  type AccountSettingsState,
} from "./account-actions";

const initialState: AccountSettingsState = {
  error: null,
  success: false,
  fieldErrors: {},
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-night transition-colors duration-200 hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Enregistrement…" : "Enregistrer les modifications"}
    </button>
  );
}

function PasswordField({
  id,
  label,
  name,
  autoComplete,
  error,
  required = false,
  placeholder = "••••••••",
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel"
      >
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={required ? 8 : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-night px-3.5 py-2.5 pr-11 text-[15px] text-white placeholder:text-steel-dark focus:outline-none ${
            error ? "border-red-500/60" : "border-line focus:border-line-gold"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? `Masquer ${label.toLowerCase()}` : `Afficher ${label.toLowerCase()}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-steel-dark transition-colors hover:text-steel"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-[13px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function AccountSettingsForm({
  currentEmail,
}: {
  currentEmail: string;
}) {
  const [state, formAction] = useActionState(
    updateAccountSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-coal p-6 sm:p-8">
        <legend className="mb-1 flex flex-col gap-1 px-0">
          <span className="text-[17px] font-semibold text-white">
            Paramètres du compte
          </span>
          <span className="text-[13px] text-steel">
            Modifiez les identifiants utilisés pour accéder à l’administration.
          </span>
        </legend>

        {state.error && !state.fieldErrors.currentPassword && !state.fieldErrors.email && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{state.error}</span>
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[14px] text-emerald-300"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Les informations du compte ont été mises à jour avec succès.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="account-email"
            className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel"
          >
            Email administrateur
          </label>
          <input
            id="account-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={currentEmail}
            required
            aria-invalid={Boolean(state.fieldErrors.email)}
            aria-describedby={
              state.fieldErrors.email ? "account-email-error" : undefined
            }
            className={`w-full rounded-lg border bg-night px-3.5 py-2.5 text-[15px] text-white placeholder:text-steel-dark focus:outline-none ${
              state.fieldErrors.email
                ? "border-red-500/60"
                : "border-line focus:border-line-gold"
            }`}
          />
          {state.fieldErrors.email && (
            <p id="account-email-error" className="text-[13px] text-red-300">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        <PasswordField
          id="account-current-password"
          label="Mot de passe actuel"
          name="currentPassword"
          autoComplete="current-password"
          required
          error={state.fieldErrors.currentPassword}
        />

        <PasswordField
          id="account-new-password"
          label="Nouveau mot de passe"
          name="newPassword"
          autoComplete="new-password"
          error={state.fieldErrors.newPassword}
        />

        <PasswordField
          id="account-confirm-password"
          label="Confirmer le nouveau mot de passe"
          name="confirmPassword"
          autoComplete="new-password"
          error={state.fieldErrors.confirmPassword}
        />

        <p className="text-[13px] text-steel-dark">
          Laissez les deux champs du nouveau mot de passe vides si vous
          souhaitez uniquement modifier l’email.
        </p>

        <SaveButton />
      </fieldset>
    </form>
  );
}
