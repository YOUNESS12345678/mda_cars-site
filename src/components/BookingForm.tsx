"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import {
  buildBookingMessage,
  createReservation,
  logLead,
  openWhatsApp,
  type BookingRequest,
} from "@/lib/contact";

type BookingFormProps = {
  vehicles: { slug: string; name: string }[];
  defaultVehicle?: string;
  source: string;
  idPrefix?: string;
  whatsappNumber?: string;
};

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-4 py-3 text-[15px] text-cream placeholder:text-steel-dark transition-all duration-200 focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] focus:outline-none";

const labelClass =
  "mb-2 block text-[13px] font-medium tracking-[0.02em] text-steel";

/**
 * Rental-request form. There is no automated booking backend: submitting
 * opens WhatsApp with a fully pre-filled message and mirrors the request to
 * /api/leads. The UI never claims a booking is "confirmed".
 */
export function BookingForm({
  vehicles,
  defaultVehicle = "",
  source,
  idPrefix = "rq",
  whatsappNumber,
}: BookingFormProps) {
  const [sent, setSent] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: BookingRequest = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      vehicle: String(data.get("vehicle") ?? "") || undefined,
      pickupDate: String(data.get("pickupDate") ?? "") || undefined,
      returnDate: String(data.get("returnDate") ?? "") || undefined,
      message: String(data.get("message") ?? "").trim() || undefined,
      source,
    };
    openWhatsApp(buildBookingMessage(payload), whatsappNumber);
    logLead(payload);
    // PHASE 4: also creates a real Reservation record for /admin/reservations.
    // carSlug is resolved from the same `vehicles` list already passed to
    // this form — no UI/label change, just an extra lookup on submit.
    const carSlug = vehicles.find((v) => v.name === payload.vehicle)?.slug;
    createReservation({ ...payload, carSlug });
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-start justify-center gap-4 rounded-lg border border-line-gold bg-coal p-8"
      >
        <CheckCircle2 className="h-10 w-10 text-gold" aria-hidden />
        <p className="text-xl font-semibold text-white">
          Votre demande a été envoyée
        </p>
        <p className="max-w-md text-[15px] leading-relaxed text-steel">
          WhatsApp s’est ouvert avec votre demande déjà rédigée. MDA CAR vous
          contactera rapidement pour confirmer la disponibilité du véhicule.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-[14px] font-semibold text-gold underline-offset-4 transition-colors duration-200 hover:text-gold-hover hover:underline"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-vehicle`} className={labelClass}>
          Véhicule souhaité
        </label>
        <select
          id={`${idPrefix}-vehicle`}
          name="vehicle"
          defaultValue={defaultVehicle}
          className={inputClass}
        >
          <option value="">Choisir un véhicule (optionnel)</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.slug} value={vehicle.name}>
              {vehicle.name}
            </option>
          ))}
          <option value="Autre véhicule">Autre / je ne sais pas encore</option>
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-pickup`} className={labelClass}>
          Date de départ
        </label>
        <input
          id={`${idPrefix}-pickup`}
          name="pickupDate"
          type="date"
          min={today}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-return`} className={labelClass}>
          Date de retour
        </label>
        <input
          id={`${idPrefix}-return`}
          name="returnDate"
          type="date"
          min={today}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-name`} className={labelClass}>
          Nom <span className="text-gold">*</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Votre nom"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-phone`} className={labelClass}>
          Téléphone <span className="text-gold">*</span>
        </label>
        <input
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="06 XX XX XX XX"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-city`} className={labelClass}>
          Ville <span className="text-gold">*</span>
        </label>
        <input
          id={`${idPrefix}-city`}
          name="city"
          type="text"
          autoComplete="address-level2"
          required
          placeholder="Ex. Agadir"
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-message`} className={labelClass}>
          Message
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          rows={3}
          placeholder="Précisez votre besoin (durée, trajet prévu…)"
          className={`${inputClass} min-h-24 resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="btn-sweep inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-gold px-6 py-3 text-[15px] font-semibold tracking-[0.01em] text-night transition-colors duration-200 hover:bg-gold-hover sm:w-auto"
        >
          <Send className="h-[18px] w-[18px]" aria-hidden />
          Demander les disponibilités
        </button>
        <p className="mt-3 text-[13px] leading-relaxed text-steel-dark">
          En envoyant, WhatsApp s’ouvre avec votre demande déjà rédigée. MDA
          CAR confirme la disponibilité par téléphone ou WhatsApp — aucune
          réservation n’est validée automatiquement.
        </p>
      </div>
    </form>
  );
}
