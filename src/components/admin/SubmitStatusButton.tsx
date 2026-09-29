"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Wraps a submit button with react-dom's useFormStatus so plain (non
 * useActionState) forms — the notification dropdown items and the "Ouvrir"
 * button, both of which just mark-as-read-and-navigate — still show a
 * pending state and can't be double-submitted while the action runs. Must
 * be rendered as a child of the <form>, per useFormStatus's rules.
 */
export function SubmitStatusButton({
  children,
  className,
  pendingClassName = "",
  onClick,
}: {
  children: ReactNode;
  className: string;
  pendingClassName?: string;
  onClick?: () => void;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={onClick}
      className={`${className} ${pending ? `cursor-wait opacity-60 ${pendingClassName}` : ""}`}
    >
      {children}
    </button>
  );
}
