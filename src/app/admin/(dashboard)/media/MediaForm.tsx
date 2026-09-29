"use client";

import { useEffect, useState } from "react";
import { uploadWithDiagnostics } from "@/lib/upload-with-timeout";
import { Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { updateSiteMediaAction } from "./actions";

type MediaRow = {
  id: number;
  key: string;
  label: string;
  pagePath: string;
  src: string;
  alt: string;
  enabled: boolean;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

function safeFileName(name: string) {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "image";
}

export function MediaForm({ row }: { row: MediaRow }) {
  const [src, setSrc] = useState(row.src);
  const [preview, setPreview] = useState(row.src);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Format non pris en charge. Utilisez JPG, PNG, WebP, AVIF ou GIF.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image trop lourde. La limite est de 10 Mo.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview((old) => {
      if (old.startsWith("blob:")) URL.revokeObjectURL(old);
      return localPreview;
    });
    setFileName(file.name);
    setUploading(true);

    try {
      const blob = await uploadWithDiagnostics(
        `mda-car/site-media/${crypto.randomUUID()}-${safeFileName(file.name)}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/admin/media/upload",
          clientPayload: JSON.stringify({ mediaKey: row.key }),
        },
        "MediaForm",
      );
      setSrc(blob.url);
      setPreview(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer l'image.");
      setFileName("");
      setSrc(row.src);
      setPreview(row.src);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError("");
    try {
      await updateSiteMediaAction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'image.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className="overflow-hidden rounded-xl border border-line bg-coal">
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="src" value={src} />
      <div className="aspect-[16/8] bg-night">
        <img src={preview} alt={row.alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="font-semibold text-white">{row.label}</h2>
          <p className="mt-1 text-xs text-steel-dark">{row.pagePath} · <code>{row.key}</code></p>
        </div>

        <div>
          <label htmlFor={`file-${row.id}`} className="mb-1.5 block text-[11px] uppercase tracking-wider text-steel-dark">
            Nouvelle image depuis PC / téléphone
          </label>
          <label
            htmlFor={`file-${row.id}`}
            className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line-gold/60 bg-night px-4 py-3 text-sm text-steel hover:border-line-gold hover:text-white ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <Upload className="h-4 w-4 text-gold" />}
            <span>{uploading ? "Envoi en cours…" : "Choisir une image"}</span>
          </label>
          <input
            id={`file-${row.id}`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
          {fileName && !uploading && <p className="mt-1 text-[11px] text-steel-dark">Fichier envoyé : {fileName}</p>}
          <p className="mt-1 text-[11px] text-steel-dark">JPG, PNG, WebP, AVIF ou GIF · maximum 10 Mo.</p>
        </div>

        <div>
          <label htmlFor={`alt-${row.id}`} className="mb-1 block text-[11px] uppercase tracking-wider text-steel-dark">Texte ALT</label>
          <input
            id={`alt-${row.id}`}
            name="alt"
            defaultValue={row.alt}
            maxLength={300}
            required
            className="w-full rounded-md border border-line bg-night px-3 py-2.5 text-sm text-white focus:border-line-gold focus:outline-none"
          />
        </div>

        {error && <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-300">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-steel">
            <input type="checkbox" name="enabled" defaultChecked={row.enabled} disabled={saving || uploading} /> Utiliser cette image
          </label>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-gold px-3 text-sm font-semibold text-gold hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
