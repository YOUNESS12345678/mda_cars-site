import { Phone } from "lucide-react";
import { site, whatsappHref, DEFAULT_WA_MESSAGE } from "@/lib/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Sticky mobile conversion bar — WhatsApp + Call always one tap away.
 * Rendered on every page, hidden from md breakpoint up (desktop shows the
 * inline CTAs instead). The spacer div keeps page content clear of the bar.
 */
export function StickyMobileCTA() {
  return (
    <>
      <div
        aria-hidden
        className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden"
      />
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line pb-[env(safe-area-inset-bottom)]">
          <a
            href={whatsappHref(DEFAULT_WA_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contacter MDA CAR sur WhatsApp"
            className="flex min-h-14 items-center justify-center gap-2 bg-night text-[15px] font-semibold text-cream transition-colors duration-200 active:bg-surface"
          >
            <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
            WhatsApp
          </a>
          <a
            href={site.telHref}
            aria-label={`Appeler MDA CAR au ${site.phoneDisplay}`}
            className="flex min-h-14 items-center justify-center gap-2 bg-gold text-[15px] font-semibold text-night transition-colors duration-200 active:bg-gold-hover"
          >
            <Phone className="h-5 w-5" aria-hidden />
            Appeler
          </a>
        </div>
      </div>
    </>
  );
}
