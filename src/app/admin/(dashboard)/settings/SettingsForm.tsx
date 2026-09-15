"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  updateBusinessSettingsAction,
  type SettingsState,
} from "./actions";
import { OPENING_HOURS_DAYS } from "@/lib/business-settings-constants";
import type { BusinessSettingsRow } from "@/lib/business-settings";

const initialSettingsState: SettingsState = {
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

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  error,
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel"
      >
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={`w-full rounded-lg border bg-night px-3.5 py-2.5 text-[15px] text-white placeholder:text-steel-dark focus:outline-none ${
          error ? "border-red-500/60" : "border-line focus:border-line-gold"
        }`}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="text-[13px] text-steel-dark">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-[13px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-coal p-6 sm:p-8">
      <legend className="mb-1 flex flex-col gap-1 px-0">
        <span className="text-[17px] font-semibold text-white">{title}</span>
        {description && (
          <span className="text-[13px] text-steel">{description}</span>
        )}
      </legend>
      {children}
    </fieldset>
  );
}

export function SettingsForm({ settings }: { settings: BusinessSettingsRow }) {
  const [state, formAction] = useActionState(
    updateBusinessSettingsAction,
    initialSettingsState,
  );

  const hoursByDay = new Map(
    (settings.openingHours ?? []).map((entry) => [entry.day, entry.hours]),
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="settingsId" value={settings.id} />

      {state.error && (
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
          <span>Les modifications ont été enregistrées.</span>
        </div>
      )}

      <SectionCard title="Informations sur l'entreprise">
        <Field
          label="Nom de l'entreprise"
          name="businessName"
          defaultValue={settings.businessName ?? ""}
          placeholder="MDA CAR"
          required
          error={state.fieldErrors.businessName}
        />
      </SectionCard>

      <SectionCard title="Coordonnées">
        <Field
          label="Numéro de téléphone"
          name="phoneDisplay"
          defaultValue={settings.phoneDisplay}
          placeholder="06 50 91 11 22"
          required
          error={state.fieldErrors.phoneDisplay}
        />
        <Field
          label="Téléphone international"
          name="phoneInternational"
          defaultValue={settings.phoneInternational}
          placeholder="+212650911122"
          required
          hint="Format international, utilisé pour les liens d’appel (tel:)."
          error={state.fieldErrors.phoneInternational}
        />
        <Field
          label="Numéro WhatsApp"
          name="whatsappNumber"
          defaultValue={settings.whatsappNumber}
          placeholder="212650911122"
          required
          hint="Chiffres uniquement avec indicatif pays, sans + ni espace."
          error={state.fieldErrors.whatsappNumber}
        />
        <Field
          label="Adresse e-mail"
          name="email"
          type="email"
          defaultValue={settings.email ?? ""}
          placeholder="contact@mdacar.ma"
          error={state.fieldErrors.email}
        />
      </SectionCard>

      <SectionCard title="Localisation">
        <Field
          label="Adresse"
          name="address"
          defaultValue={settings.address ?? ""}
          placeholder="Adresse complète"
          error={state.fieldErrors.address}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Ville"
            name="city"
            defaultValue={settings.city ?? ""}
            placeholder="Biougra"
            error={state.fieldErrors.city}
          />
          <Field
            label="Code postal"
            name="postalCode"
            defaultValue={settings.postalCode ?? ""}
            placeholder="80000"
            error={state.fieldErrors.postalCode}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Latitude"
            name="latitude"
            defaultValue={settings.latitude?.toString() ?? ""}
            placeholder="30.21018"
            hint="Nombre décimal entre -90 et 90."
            error={state.fieldErrors.latitude}
          />
          <Field
            label="Longitude"
            name="longitude"
            defaultValue={settings.longitude?.toString() ?? ""}
            placeholder="-9.37909"
            hint="Nombre décimal entre -180 et 180."
            error={state.fieldErrors.longitude}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Horaires d'ouverture"
        description="Laissez un jour vide s'il n'y a pas d'horaires à afficher."
      >
        <div className="flex flex-col gap-3">
          {OPENING_HOURS_DAYS.map((day, index) => (
            <div
              key={day}
              className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[140px_1fr]"
            >
              <label
                htmlFor={`openingHours.${index}.hours`}
                className="text-[14px] font-medium text-steel"
              >
                {day}
              </label>
              <input
                id={`openingHours.${index}.hours`}
                name={`openingHours.${index}.hours`}
                defaultValue={hoursByDay.get(day) ?? ""}
                placeholder="09:00 - 18:00 ou Fermé"
                className="w-full rounded-lg border border-line bg-night px-3.5 py-2.5 text-[15px] text-white placeholder:text-steel-dark focus:border-line-gold focus:outline-none"
              />
            </div>
          ))}
        </div>
        {state.fieldErrors.openingHours && (
          <p className="text-[13px] text-red-300">
            {state.fieldErrors.openingHours}
          </p>
        )}
      </SectionCard>

      <SectionCard title="Réseaux sociaux">
        <Field
          label="Facebook"
          name="facebookUrl"
          type="url"
          defaultValue={settings.facebookUrl ?? ""}
          placeholder="https://www.facebook.com/..."
          error={state.fieldErrors.facebookUrl}
        />
        <Field
          label="Instagram"
          name="instagramUrl"
          type="url"
          defaultValue={settings.instagramUrl ?? ""}
          placeholder="https://www.instagram.com/..."
          error={state.fieldErrors.instagramUrl}
        />
        <Field
          label="Site web"
          name="websiteUrl"
          type="url"
          defaultValue={settings.websiteUrl ?? ""}
          placeholder="https://mdacars-site.vercel.app"
          error={state.fieldErrors.websiteUrl}
        />
      </SectionCard>

      <SaveButton />
    </form>
  );
}
