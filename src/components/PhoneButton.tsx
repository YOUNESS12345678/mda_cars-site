import { Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/business-settings";
import { btnBaseClass } from "@/lib/ui";

type PhoneButtonProps = {
  label?: string;
  showNumber?: boolean;
  variant?: "gold" | "outline";
  className?: string;
};

/** PHASE 7: async Server Component reading the database-backed phone
 *  number (cached via getSiteSettings()) instead of the static
 *  lib/site.ts constant. */
export async function PhoneButton({
  label = "Appeler maintenant",
  showNumber = false,
  variant = "outline",
  className = "",
}: PhoneButtonProps) {
  const settings = await getSiteSettings();
  const variantClass =
    variant === "gold"
      ? "bg-gold text-night hover:bg-gold-hover"
      : "border border-line-strong text-cream hover:border-line-gold hover:text-gold";
  return (
    <a
      href={settings.telHref}
      aria-label={`Appeler MDA CAR au ${settings.phoneDisplay}`}
      className={`${btnBaseClass} ${variantClass} ${className}`}
    >
      <Phone className="h-[18px] w-[18px]" aria-hidden />
      {showNumber ? settings.phoneDisplay : label}
    </a>
  );
}
