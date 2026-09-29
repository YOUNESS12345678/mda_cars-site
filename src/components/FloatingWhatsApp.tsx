import { DEFAULT_WA_MESSAGE } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { buildWhatsAppHref } from "@/lib/business-settings-constants";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Floating WhatsApp bubble — always visible in the corner of the site.
 * On phones it floats above the sticky CTA bar; on desktop it's the corner FAB.
 * Entrance pop + gentle brand pulse, fully CSS (no JS needed to appear),
 * disabled under prefers-reduced-motion.
 *
 * PHASE 7: async Server Component reading the database-backed WhatsApp
 * number/phone display (see Footer.tsx for the same pattern).
 */
export async function FloatingWhatsApp() {
  const settings = await getSiteSettings();
  return (
    <a
      href={buildWhatsAppHref(settings.whatsappNumber, DEFAULT_WA_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Discuter avec MDA CAR sur WhatsApp (${settings.phoneDisplay})`}
      className="wa-fab fixed right-4 bottom-[calc(56px+env(safe-area-inset-bottom)+14px)] z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white transition-transform duration-200 hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
