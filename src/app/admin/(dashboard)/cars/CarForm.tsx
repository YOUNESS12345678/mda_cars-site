"use client";

import { useActionState, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useFormStatus } from "react-dom";
import { AlertCircle, ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { createCarAction, updateCarAction } from "./actions";
import { initialCarFormState, type CarFormState } from "./action-state";
import {
  TRANSMISSIONS,
  CATEGORIES,
  FUEL_TYPES,
  MAX_IMAGES,
  MAX_FEATURES,
} from "@/lib/car-constants";
import type { CarRow } from "@/lib/cars";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-night transition-colors duration-200 hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? pendingLabel : label}
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
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full rounded-lg border bg-night px-3.5 py-2.5 text-[15px] text-white placeholder:text-steel-dark focus:outline-none ${
          error ? "border-red-500/60" : "border-line focus:border-line-gold"
        }`}
      />
      {error && <p className="text-[13px] text-red-300">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly string[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className={`w-full rounded-lg border bg-night px-3.5 py-2.5 text-[15px] text-white focus:outline-none ${
          error ? "border-red-500/60" : "border-line focus:border-line-gold"
        }`}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-[13px] text-red-300">{error}</p>}
    </div>
  );
}

function ListInput({
  label,
  name,
  initialValues,
  placeholder,
  maxItems,
  error,
  hint,
}: {
  label: string;
  name: string;
  initialValues: string[];
  placeholder: string;
  maxItems: number;
  error?: string;
  hint?: string;
}) {
  const [items, setItems] = useState<string[]>(initialValues.length ? initialValues : [""]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {items.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              name={name}
              defaultValue={value}
              placeholder={placeholder}
              className="w-full rounded-lg border border-line bg-night px-3.5 py-2.5 text-[15px] text-white placeholder:text-steel-dark focus:border-line-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              aria-label="Supprimer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-steel hover:border-red-500/50 hover:text-red-300"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      {items.length < maxItems && (
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, ""])}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-steel hover:border-line-gold hover:text-gold"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Ajouter
        </button>
      )}
      {hint && !error && <p className="text-[13px] text-steel-dark">{hint}</p>}
      {error && <p className="text-[13px] text-red-300">{error}</p>}
    </div>
  );
}


function ImageUploadField({
  initialValues,
  maxItems,
  error,
}: {
  initialValues: string[];
  maxItems: number;
  error?: string;
}) {
  const [images, setImages] = useState<string[]>(initialValues);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const selected = Array.from(fileList);
    const remaining = maxItems - images.length;
    if (remaining <= 0) {
      setUploadError(`${maxItems} images maximum.`);
      return;
    }

    if (selected.length > remaining) {
      setUploadError(`Vous pouvez encore ajouter ${remaining} image${remaining > 1 ? "s" : ""}.`);
      return;
    }

    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ]);

    for (const file of selected) {
      if (!allowedTypes.has(file.type)) {
        setUploadError("Format non supporté. Utilisez JPG, JPEG, PNG, WEBP, AVIF ou GIF.");
        return;
      }
      if (file.size <= 0 || file.size > 8 * 1024 * 1024) {
        setUploadError("Chaque image doit faire au maximum 8 Mo.");
        return;
      }
    }

    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selected) {
        const blob = await upload(`cars/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/cars/images",
          multipart: file.size > 4 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => {
            setUploadProgress(Math.round(percentage));
          },
        });
        uploadedUrls.push(blob.url);
      }

      setImages((current) => [...current, ...uploadedUrls].slice(0, maxItems));
      setUploadProgress(100);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Impossible d'envoyer les images.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel">
        Images
      </label>

      <input
        id="car-images-upload"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.avif,.gif,image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        className="sr-only"
        disabled={uploading || images.length >= maxItems}
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <label
        htmlFor="car-images-upload"
        className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
          uploading || images.length >= maxItems
            ? "cursor-not-allowed border-line bg-night/50 text-steel-dark"
            : "border-line-gold/50 bg-night hover:border-line-gold hover:bg-night/80"
        }`}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
        ) : (
          <ImagePlus className="h-5 w-5 text-gold" aria-hidden />
        )}
        <span className="text-[14px] font-medium text-white">
          {uploading
            ? `Envoi des images… ${uploadProgress}%`
            : images.length >= maxItems
              ? `${maxItems} images ajoutées`
              : "Ajouter des images depuis votre ordinateur"}
        </span>
        <span className="text-[12px] text-steel-dark">
          JPG, JPEG, PNG, WEBP, AVIF ou GIF · 8 Mo max/image · {images.length}/{maxItems}
        </span>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="relative overflow-hidden rounded-lg border border-line bg-night">
              <div className="relative aspect-[16/10]">
                <img src={src} alt={`Aperçu ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-night">
                    Principale
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-line px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  aria-label="Déplacer vers la gauche"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-steel hover:bg-coal hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <span className="text-[11px] text-steel-dark">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="Déplacer vers la droite"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-steel hover:bg-coal hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="Supprimer cette image"
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-steel hover:bg-red-500/10 hover:text-red-300"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <input type="hidden" name="images" value={src} readOnly />
            </div>
          ))}
        </div>
      )}

      <p className="text-[13px] text-steel-dark">
        La première image est utilisée comme photo principale. Vous pouvez modifier l&apos;ordre ou supprimer une image avant d&apos;enregistrer.
      </p>
      {(uploadError || error) && (
        <p className="text-[13px] text-red-300">{uploadError || error}</p>
      )}
    </div>
  );
}

function ToggleField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-night px-3.5 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-gold"
      />
      <span>
        <span className="block text-[14px] font-medium text-white">{label}</span>
        <span className="block text-[13px] text-steel-dark">{hint}</span>
      </span>
    </label>
  );
}

export function CarForm({ car }: { car?: CarRow }) {
  const isEdit = Boolean(car);
  const action = isEdit ? updateCarAction : createCarAction;
  const [state, formAction] = useActionState<CarFormState, FormData>(
    action,
    initialCarFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {isEdit && <input type="hidden" name="carId" value={car!.id} />}

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Marque"
          name="brand"
          defaultValue={car?.brand ?? ""}
          placeholder="Dacia"
          required
          error={state.fieldErrors.brand}
        />
        <Field
          label="Modèle"
          name="model"
          defaultValue={car?.model ?? ""}
          placeholder="Logan"
          required
          error={state.fieldErrors.model}
        />
        <Field
          label="Année"
          name="year"
          type="number"
          defaultValue={car?.year != null ? String(car.year) : ""}
          placeholder="2025"
          required
          min={1990}
          error={state.fieldErrors.year}
        />
        <Field
          label="Prix par jour (MAD)"
          name="pricePerDay"
          type="number"
          defaultValue={car?.pricePerDay != null ? String(car.pricePerDay) : ""}
          placeholder="300"
          required
          min={1}
          error={state.fieldErrors.pricePerDay}
        />
        <SelectField
          label="Transmission"
          name="transmission"
          defaultValue={car?.transmission ?? ""}
          options={TRANSMISSIONS}
          placeholder="Choisir…"
          required
          error={state.fieldErrors.transmission}
        />
        <SelectField
          label="Carburant"
          name="fuel"
          defaultValue={car?.fuelType ?? ""}
          options={FUEL_TYPES}
          placeholder="Choisir…"
          required
          error={state.fieldErrors.fuel}
        />
        <Field
          label="Places"
          name="seats"
          type="number"
          defaultValue={car?.seats != null ? String(car.seats) : "5"}
          placeholder="5"
          required
          min={1}
          max={9}
          error={state.fieldErrors.seats}
        />
        <SelectField
          label="Catégorie"
          name="category"
          defaultValue={car?.category ?? ""}
          options={CATEGORIES}
          placeholder="Non définie"
          error={state.fieldErrors.category}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={car?.description ?? ""}
          placeholder="Comfortable car suitable for city and long-distance trips."
          className={`w-full rounded-lg border bg-night px-3.5 py-2.5 text-[15px] text-white placeholder:text-steel-dark focus:outline-none ${
            state.fieldErrors.description ? "border-red-500/60" : "border-line focus:border-line-gold"
          }`}
        />
        {state.fieldErrors.description && (
          <p className="text-[13px] text-red-300">{state.fieldErrors.description}</p>
        )}
      </div>

      <ImageUploadField
        initialValues={car?.images ?? []}
        maxItems={MAX_IMAGES}
        error={state.fieldErrors.images}
      />

      <ListInput
        label="Caractéristiques"
        name="features"
        initialValues={car?.features ?? []}
        placeholder="Climatisation"
        maxItems={MAX_FEATURES}
        error={state.fieldErrors.features}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleField
          label="Disponible"
          name="isAvailable"
          defaultChecked={car?.isAvailable ?? true}
          hint="Le véhicule peut être réservé."
        />
        <ToggleField
          label="Publié"
          name="isPublished"
          defaultChecked={car ? !car.isHidden : true}
          hint="Visible dans le tableau de bord (et sur le site public une fois connecté)."
        />
      </div>

      <SubmitButton
        label={isEdit ? "Enregistrer les modifications" : "Ajouter le véhicule"}
        pendingLabel={isEdit ? "Enregistrement…" : "Ajout…"}
      />
    </form>
  );
}
