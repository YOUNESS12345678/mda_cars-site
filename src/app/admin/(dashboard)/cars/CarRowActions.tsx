"use client";

import { useRef } from "react";
import Link from "next/link";
import { Pencil, Eye, EyeOff, Trash2, CheckCircle2, XCircle } from "lucide-react";
import {
  deleteCarAction,
  toggleAvailabilityAction,
  toggleVisibilityAction,
} from "./actions";

export function CarRowActions({
  carId,
  isAvailable,
  isHidden,
  carLabel,
}: {
  carId: number;
  isAvailable: boolean;
  isHidden: boolean;
  carLabel: string;
}) {
  const deleteFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/cars/${carId}/edit`}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-steel hover:border-line-gold hover:text-gold"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Modifier
      </Link>

      <form action={toggleAvailabilityAction}>
        <input type="hidden" name="carId" value={carId} />
        <input type="hidden" name="nextAvailable" value={(!isAvailable).toString()} />
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-steel hover:border-line-gold hover:text-gold"
        >
          {isAvailable ? (
            <>
              <XCircle className="h-3.5 w-3.5" aria-hidden />
              Rendre indisponible
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Rendre disponible
            </>
          )}
        </button>
      </form>

      <form action={toggleVisibilityAction}>
        <input type="hidden" name="carId" value={carId} />
        <input type="hidden" name="nextHidden" value={(!isHidden).toString()} />
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-steel hover:border-line-gold hover:text-gold"
        >
          {isHidden ? (
            <>
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Afficher
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
              Masquer
            </>
          )}
        </button>
      </form>

      <form ref={deleteFormRef} action={deleteCarAction}>
        <input type="hidden" name="carId" value={carId} />
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Êtes-vous sûr de vouloir supprimer ce véhicule ?\n\n${carLabel}\n\nCette action est définitive.`,
              )
            ) {
              deleteFormRef.current?.requestSubmit();
            }
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-medium text-red-300/90 hover:border-red-500/50 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Supprimer
        </button>
      </form>
    </div>
  );
}
