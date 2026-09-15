import { DEFAULT_WA_MESSAGE } from "@/lib/site";
import { getSiteSettings } from "@/lib/business-settings";
import { buildWhatsAppHref } from "@/lib/business-settings-constants";
import { containerClass, sectionClass, btnBaseClass } from "@/lib/ui";
import { PhoneButton } from "./PhoneButton";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppIcon";

type BookingCTAProps = {
  title?: string;
  text?: string;
};

/** Final conversion band — one tap to WhatsApp or a call, from any page.
 *  PHASE 7: async Server Component reading the database-backed phone/
 *  WhatsApp number instead of the static lib/site.ts constant. */
export async function BookingCTA({
  title = "Besoin d’une voiture à Biougra ou Agadir ?",
  text = "Contactez MDA CAR directement : un message ou un appel suffit pour connaître les disponibilités et organiser votre location.",
}: BookingCTAProps) {
  const settings = await getSiteSettings();
  return (
    <section aria-labelledby="cta-final" className="border-y border-line-gold/40 bg-coal">
      <div className={`${containerClass} ${sectionClass}`}>
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl border-l-2 border-gold pl-6">
              <h2
                id="cta-final"
                className="text-[26px] font-bold leading-tight tracking-tight text-white sm:text-3xl"
              >
                {title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-steel">{text}</p>
              <p className="mt-4 text-[15px] font-semibold tracking-[0.02em] text-gold">
                WhatsApp &amp; téléphone : {settings.phoneDisplay}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={buildWhatsAppHref(settings.whatsappNumber, DEFAULT_WA_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnBaseClass} bg-gold text-night hover:bg-gold-hover`}
              >
                <WhatsAppIcon className="h-[18px] w-[18px]" />
                Contacter MDA CAR
              </a>
              <PhoneButton variant="outline" showNumber />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
