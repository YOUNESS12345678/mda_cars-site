"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-[15px] font-semibold text-night transition-colors duration-200 hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Connexion en cours…" : "Se connecter"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const [emailTouched, setEmailTouched] = useState(false);
  const [email, setEmail] = useState("");

  const emailInvalid =
    emailTouched && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel"
        >
          Email
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
            aria-hidden
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={emailInvalid}
            className="w-full rounded-lg border border-line bg-night py-2.5 pl-10 pr-3.5 text-[15px] text-white placeholder:text-steel-dark focus:border-line-gold focus:outline-none"
            placeholder="vous@mdacar.ma"
          />
        </div>
        {emailInvalid && (
          <p className="text-[13px] text-red-300">
            Entrez une adresse email valide.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-[13px] font-medium uppercase tracking-[0.1em] text-steel"
        >
          Mot de passe
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
            aria-hidden
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className="w-full rounded-lg border border-line bg-night py-2.5 pl-10 pr-3.5 text-[15px] text-white placeholder:text-steel-dark focus:border-line-gold focus:outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
