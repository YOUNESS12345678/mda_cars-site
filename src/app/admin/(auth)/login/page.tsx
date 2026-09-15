import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line-gold bg-coal"
        >
          <span className="text-xs font-extrabold tracking-tight text-gold">
            M
          </span>
        </span>
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
            Espace administrateur
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
            MDA CAR
          </h1>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-coal p-6 sm:p-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-[13px] text-steel-dark">
        Accès réservé à l’équipe MDA CAR.
      </p>
    </div>
  );
}
