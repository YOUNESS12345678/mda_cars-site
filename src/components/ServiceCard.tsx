import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ServiceCardProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  href: string;
  image?: { src: string; alt: string };
};

/** Compact service card. Clicking it opens a dedicated, focused service detail page. */
export function ServiceCard({ icon, title, description, href, image }: ServiceCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-coal transition-all duration-300 hover:border-line-gold hover:shadow-[0_20px_50px_-24px_rgba(212,175,55,0.3)]">
      <Link href={href} className="block h-full">
        {image ? (
          <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-surface">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 31vw, (min-width: 768px) 45vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : null}
        <div className="flex min-h-[230px] flex-col gap-4 p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line-gold bg-surface text-gold">
            {icon}
          </div>
          <h3 className="text-xl font-semibold leading-tight tracking-normal text-white">{title}</h3>
          <div className="text-[15px] leading-relaxed tracking-normal text-steel">{description}</div>
          <span className="mt-auto inline-flex w-fit items-center gap-2 whitespace-nowrap pt-2 text-[14px] font-semibold leading-none tracking-normal text-gold">
            Voir les détails
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
