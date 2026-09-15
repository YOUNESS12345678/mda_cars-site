"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { buildContactMessage, logLead, openWhatsApp } from "@/lib/contact";

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-4 py-3 text-[15px] text-cream placeholder:text-steel-dark transition-all duration-200 focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] focus:outline-none";

const labelClass =
  "mb-2 block text-[13px] font-medium tracking-[0.02em] text-steel";

export function ContactForm({ whatsappNumber }: { whatsappNumber?: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    openWhatsApp(buildContactMessage({ name, phone, message }), whatsappNumber);
    logLead({ name, phone, message, source: "contact" });
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
          Votre message a été envoyé
        </p>
        <p className="max-w-md text-[15px] leading-relaxed text-steel">
          WhatsApp s’est ouvert avec votre message déjà rédigé. MDA CAR vous
          recontactera rapidement.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-[14px] font-semibold text-gold underline-offset-4 transition-colors duration-200 hover:text-gold-hover hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className={labelClass}>
            Nom <span className="text-gold">*</span>
          </label>
          <input
            id="ct-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Votre nom"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ct-phone" className={labelClass}>
            Téléphone <span className="text-gold">*</span>
          </label>
          <input
            id="ct-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="06 XX XX XX XX"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="ct-message" className={labelClass}>
          Message <span className="text-gold">*</span>
        </label>
        <textarea
          id="ct-message"
          name="message"
          rows={5}
          required
          placeholder="Expliquez votre besoin : véhicule, dates, trajet…"
          className={`${inputClass} min-h-32 resize-y`}
        />
      </div>
      <div>
        <button
          type="submit"
          className="btn-sweep inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-gold px-6 py-3 text-[15px] font-semibold tracking-[0.01em] text-night transition-colors duration-200 hover:bg-gold-hover sm:w-auto"
        >
          <Send className="h-[18px] w-[18px]" aria-hidden />
          Envoyer via WhatsApp
        </button>
        <p className="mt-3 text-[13px] leading-relaxed text-steel-dark">
          Le formulaire ouvre WhatsApp avec votre message déjà rédigé — rien
          n’est envoyé sans votre validation.
        </p>
      </div>
    </form>
  );
}
