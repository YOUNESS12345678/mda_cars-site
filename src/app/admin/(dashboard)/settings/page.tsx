import { requireAdminPage } from "@/lib/auth/require-admin";
import { getOrCreateBusinessSettings } from "@/lib/business-settings";
import { SettingsForm } from "./SettingsForm";
import { AccountSettingsForm } from "./AccountSettingsForm";

export default async function AdminSettingsPage() {
  const admin = await requireAdminPage();
  const settings = await getOrCreateBusinessSettings();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Paramètres
        </h1>
        <p className="mt-1 text-[15px] text-steel">
          Informations sur l’entreprise, coordonnées, localisation, horaires
          et réseaux sociaux.
        </p>
      </div>

      <SettingsForm settings={settings} />

      <AccountSettingsForm currentEmail={admin.email} />

      <p className="text-[13px] leading-relaxed text-steel-dark">
        Ces réglages sont enregistrés dans la base de données de
        l’administration. Le site public affiche pour l’instant les
        coordonnées confirmées directement dans le code (lib/site.ts) ; une
        prochaine phase pourra connecter le site public à ces réglages sans
        changement de base de données.
      </p>
    </div>
  );
}
