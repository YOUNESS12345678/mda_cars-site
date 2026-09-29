"use client";

import { useEffect } from "react";

export default function AdminReservationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin reservations page error:", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-500/30 bg-coal p-6 text-white">
      <h2 className="text-lg font-semibold">Impossible de charger les réservations</h2>
      <p className="mt-2 text-sm text-steel">
        La page a rencontré une erreur côté serveur. Vérifiez d’abord que DATABASE_URL
        pointe vers la même base que celle utilisée par `npm run db:push`, puis relancez
        `npm run db:push`.
      </p>
      {error?.message ? (
        <pre className="mt-4 overflow-auto rounded-lg border border-line bg-night p-3 text-xs text-red-200 whitespace-pre-wrap">
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg border border-line-gold px-4 py-2 text-sm font-medium text-gold hover:bg-graphite/60"
      >
        Réessayer
      </button>
    </div>
  );
}
