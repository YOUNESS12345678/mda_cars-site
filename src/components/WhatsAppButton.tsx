import { DEFAULT_WA_MESSAGE } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { buildWhatsAppHref } from "@/lib/business-settings-constants";
import { btnBaseClass } from "@/lib/ui";
import { WhatsAppIcon } from "./WhatsAppIcon";

type WhatsAppButtonProps = {
  label?: string;
  message?: string;
  variant?: "whatsapp" | "gold" | "outline";
  className?: string;
};

const variantClasses = {
  whatsapp:
    "border border-line-strong text-cream hover:border-whatsapp/60 [&>svg]:text-whatsapp",
  gold: "bg-gold text-night hover:bg-gold-hover",
  outline: "border border-line-strong text-cream hover:border-line-gold hover:text-gold",
} as const;

/** PHASE 7: async Server Component reading the database-backed WhatsApp
 *  number instead of the static lib/site.ts constant. */
export async function WhatsAppButton({
  label = "Contacter sur WhatsApp",
  message = DEFAULT_WA_MESSAGE,
  variant = "whatsapp",
  className = "",
}: WhatsAppButtonProps) {
  const settings = await getSiteSettings();
  return (
    <a
      href={buildWhatsAppHref(settings.whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — MDA CAR sur WhatsApp`}
      className={`${btnBaseClass} ${variantClasses[variant]} ${className}`}
    >
      <WhatsAppIcon className="h-[18px] w-[18px]" />
      {label}
    </a>
  );
}
