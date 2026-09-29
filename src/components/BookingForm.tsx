"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import {
  createReservation,
  logLead,
  type BookingRequest,
} from "@/lib/contact";

type BookingFormProps = {
  vehicles: { slug: string; name: string }[];
  defaultVehicle?: string;
  source: string;
  idPrefix?: string;
};

type ServiceType = "Location à Agadir" | "Livraison partout au Maroc" | "Location à l’aéroport";

const MOROCCAN_CITIES = [
  "Agadir", "Al Hoceïma", "Azemmour", "Beni Mellal", "Berkane", "Berrechid", "Boujdour",
  "Casablanca", "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès",
  "Fnideq", "Guelmim", "Ifrane", "Kénitra", "Khémisset", "Khouribga", "Laâyoune",
  "Larache", "Marrakech", "Meknès", "Mohammédia", "Nador", "Ouarzazate", "Oujda",
  "Rabat", "Safi", "Salé", "Settat", "Sidi Ifni", "Sidi Kacem", "Sidi Slimane",
  "Tanger", "Tan-Tan", "Taounate", "Taroudant", "Taza", "Tétouan", "Tinghir",
  "Tiznit", "Youssoufia", "Zagora", "Midelt", "M'diq", "Guercif", "Jerada", "Ksar El Kebir",
  "Khenifra", "Sefrou", "Skhirat", "Ouezzane", "Boulemane", "Figuig", "Oujda", "Tata",
  "Benslimane", "Azilal", "Chichaoua", "El Kelaâ des Sraghna", "Rehamna", "Sidi Bennour",
  "Taourirt", "Driouch", "Es-Semara", "Guelmim", "Assa-Zag", "Tarfaya", "Tinghir",
].filter((city, index, list) => list.indexOf(city) === index);

const AIRPORTS = [
  { label: "Agadir-Al Massira", city: "Agadir" },
  { label: "Marrakech-Ménara", city: "Marrakech" },
  { label: "Casablanca Mohammed V", city: "Casablanca" },
  { label: "Rabat-Salé", city: "Rabat" },
  { label: "Tanger-Ibn Battouta", city: "Tanger" },
  { label: "Fès-Saïss", city: "Fès" },
  { label: "Oujda-Angads", city: "Oujda" },
  { label: "Essaouira-Mogador", city: "Essaouira" },
  { label: "Nador-Al Aroui", city: "Nador" },
  { label: "Ouarzazate", city: "Ouarzazate" },
  { label: "Dakhla", city: "Dakhla" },
  { label: "Laâyoune-Hassan I", city: "Laâyoune" },
  { label: "Errachidia-Moulay Ali Cherif", city: "Errachidia" },
  { label: "Al Hoceïma-Cherif Al Idrissi", city: "Al Hoceïma" },
  { label: "Beni Mellal", city: "Beni Mellal" },
  { label: "Tan-Tan", city: "Tan-Tan" },
  { label: "Guelmim", city: "Guelmim" },
];

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-4 py-3 text-[15px] text-cream placeholder:text-steel-dark transition-all duration-200 focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] focus:outline-none";
const labelClass =
  "mb-2 block text-[13px] font-medium tracking-[0.02em] text-steel";

export function BookingForm({
  vehicles,
  defaultVehicle = "",
  source,
  idPrefix = "rq",
}: BookingFormProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(() => {
    if (typeof window === "undefined") return "Location à Agadir";
    const requested = new URLSearchParams(window.location.search).get("service");
    return requested === "Livraison partout au Maroc" || requested === "Location à l’aéroport"
      ? requested
      : "Location à Agadir";
  });
  const [city, setCity] = useState(() => {
    if (typeof window === "undefined") return "Agadir";
    const requested = new URLSearchParams(window.location.search).get("service");
    return requested === "Location à Agadir" || !requested ? "Agadir" : "";
  });
  const [airport, setAirport] = useState(() => {
    if (typeof window === "undefined") return "";
    const requested = new URLSearchParams(window.location.search).get("service");
    return requested === "Location à l’aéroport" ? AIRPORTS[0].label : "";
  });
  const [customCity, setCustomCity] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestId] = useState(() => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`));
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function changeService(value: ServiceType) {
    setServiceType(value);
    setAirport(value === "Location à l’aéroport" ? AIRPORTS[0].label : "");
    setCustomCity("");
    setCity(value === "Location à Agadir" ? "Agadir" : "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const data = new FormData(event.currentTarget);
    const selectedAirport = AIRPORTS.find((item) => item.label === airport);
    const destination =
      serviceType === "Location à Agadir"
        ? "Agadir"
        : serviceType === "Location à l’aéroport"
          ? selectedAirport?.city ?? ""
          : city === "Autre ville"
            ? customCity.trim()
            : city;

    if (!destination) {
      setError(
        serviceType === "Location à l’aéroport"
          ? "Choisissez l’aéroport où vous souhaitez récupérer ou remettre le véhicule."
          : "Choisissez une ville de livraison.",
      );
      setSubmitting(false);
      return;
    }

    const payload: BookingRequest = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      city: destination,
      serviceType,
      airport: selectedAirport?.label,
      vehicle: String(data.get("vehicle") ?? "") || undefined,
      pickupDate: String(data.get("pickupDate") ?? "") || undefined,
      returnDate: String(data.get("returnDate") ?? "") || undefined,
      message: String(data.get("message") ?? "").trim() || undefined,
      source,
      requestId,
    };

    const carSlug = vehicles.find((v) => v.name === payload.vehicle)?.slug;
    const saved = await createReservation({ ...payload, carSlug });

    if (!saved) {
      setError(
        "Impossible d’enregistrer votre demande pour le moment. Vérifiez votre connexion puis réessayez, ou contactez MDA CAR par téléphone.",
      );
      setSubmitting(false);
      return;
    }

    logLead(payload);
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="flex h-full flex-col items-start justify-center gap-4 rounded-lg border border-line-gold bg-coal p-8">
        <CheckCircle2 className="h-10 w-10 text-gold" aria-hidden />
        <p className="text-xl font-semibold text-white">Votre demande a été envoyée</p>
        <p className="max-w-md text-[15px] leading-relaxed text-steel">
          Votre demande de réservation a bien été enregistrée. MDA CAR vous contactera rapidement pour confirmer la disponibilité du véhicule.
        </p>
        <button type="button" onClick={() => setSent(false)} className="text-[14px] font-semibold text-gold underline-offset-4 hover:text-gold-hover hover:underline">
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-service`} className={labelClass}>Service souhaité</label>
        <select
          id={`${idPrefix}-service`}
          name="serviceType"
          value={serviceType}
          onChange={(event) => changeService(event.target.value as ServiceType)}
          className={inputClass}
        >
          <option value="Location à Agadir">Location de voitures à Agadir</option>
          <option value="Livraison partout au Maroc">Livraison de voitures partout au Maroc</option>
          <option value="Location à l’aéroport">Location de voitures à l’aéroport</option>
        </select>
      </div>

      {serviceType === "Location à l’aéroport" ? (
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-airport`} className={labelClass}>Aéroport souhaité <span className="text-gold">*</span></label>
          <select id={`${idPrefix}-airport`} name="airport" required value={airport} onChange={(e) => setAirport(e.target.value)} className={inputClass}>
            <option value="">Choisir un aéroport au Maroc</option>
            {AIRPORTS.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
          </select>
        </div>
      ) : serviceType === "Livraison partout au Maroc" ? (
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>Ville de livraison <span className="text-gold">*</span></label>
          <select id={`${idPrefix}-city`} name="city" required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
            <option value="">Choisir une ville</option>
            {MOROCCAN_CITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            <option value="Autre ville">Autre ville</option>
          </select>
          {city === "Autre ville" ? (
            <input value={customCity} onChange={(e) => setCustomCity(e.target.value)} required maxLength={100} className={`${inputClass} mt-3`} placeholder="Écrivez le nom de votre ville" />
          ) : null}
        </div>
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-city`} className={labelClass}>Ville de location</label>
          <select id={`${idPrefix}-city`} name="city" value="Agadir" disabled className={`${inputClass} cursor-not-allowed opacity-80`}>
            <option value="Agadir">Agadir</option>
          </select>
          <p className="mt-2 text-[12px] text-steel-dark">Ce service est disponible pour Agadir uniquement.</p>
        </div>
      )}

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-vehicle`} className={labelClass}>Véhicule souhaité</label>
        <select id={`${idPrefix}-vehicle`} name="vehicle" defaultValue={defaultVehicle} className={inputClass}>
          <option value="">Choisir un véhicule (optionnel)</option>
          {vehicles.map((vehicle) => <option key={vehicle.slug} value={vehicle.name}>{vehicle.name}</option>)}
          <option value="Autre véhicule">Autre / je ne sais pas encore</option>
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-pickup`} className={labelClass}>Date de départ</label>
        <input id={`${idPrefix}-pickup`} name="pickupDate" type="date" min={today} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-return`} className={labelClass}>Date de retour</label>
        <input id={`${idPrefix}-return`} name="returnDate" type="date" min={today} className={inputClass} />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-name`} className={labelClass}>Nom <span className="text-gold">*</span></label>
        <input id={`${idPrefix}-name`} name="name" type="text" autoComplete="name" required placeholder="Votre nom" className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-phone`} className={labelClass}>Téléphone <span className="text-gold">*</span></label>
        <input id={`${idPrefix}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="06 XX XX XX XX" className={inputClass} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-message`} className={labelClass}>Message</label>
        <textarea id={`${idPrefix}-message`} name="message" rows={3} placeholder="Précisez votre besoin (durée, trajet prévu…)" className={`${inputClass} min-h-24 resize-y`} />
      </div>

      <div className="sm:col-span-2">
        {error ? (
          <p role="alert" className="mb-3 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-[13px] leading-relaxed text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={submitting} className="btn-sweep inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-gold px-6 py-3 text-[15px] font-semibold tracking-normal whitespace-nowrap text-night transition-colors duration-200 hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          <Send className="h-[18px] w-[18px]" aria-hidden />
          {submitting ? "Enregistrement…" : "Réserver maintenant"}
        </button>
        <div className="mt-4 rounded-md border border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-steel">
          <p><strong className="text-white">Conditions :</strong> 200 km sont inclus pour chaque période de 24 heures. Au-delà de 200 km pendant ces 24 heures, chaque kilomètre supplémentaire est facturé 1,50 DH. À chaque nouvelle période de 24 heures, vous bénéficiez à nouveau de 200 km inclus. Assurance tous risques selon les conditions du contrat.</p>
          <p className="mt-1.5">Toute prolongation doit être signalée à MDA CAR au moins 24 heures à l’avance. Livraison ou remise possible à l’hôtel, au domicile ou à la gare selon les modalités convenues.</p>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-steel-dark">
          Votre demande est enregistrée directement dans notre système. MDA CAR vous contactera ensuite pour confirmer la disponibilité et finaliser la location.
        </p>
      </div>
    </form>
  );
}
