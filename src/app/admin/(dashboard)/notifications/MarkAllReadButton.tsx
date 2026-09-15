"use client";

import { useActionState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllReadAction } from "./actions";
import { initialNotificationActionState } from "./action-state";

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const [state, formAction, isPending] = useActionState(
    markAllReadAction,
    initialNotificationActionState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <button
        type="submit"
        disabled={disabled || isPending}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line-gold px-3.5 text-[13px] font-medium text-gold transition-colors duration-200 hover:bg-graphite/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCheck className="h-4 w-4" aria-hidden />
        Tout marquer comme lu
      </button>
      {state.error && (
        <p role="alert" className="text-[12px] font-medium text-red-300">
          {state.error}
        </p>
      )}
    </form>
  );
}
