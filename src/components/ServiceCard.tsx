import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ServiceCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export function ServiceCard({
  icon,
  title,
  description,
  href,
  ctaLabel,
}: ServiceCardProps) {
  return (
    <article className="group relative flex flex-col gap-4 overflow-hidden rounded-lg border border-line bg-coal p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-gold hover:shadow-[0_20px_50px_-24px_rgba(212,175,55,0.3)] sm:p-7">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-gold/70 to-transparent transition-transform duration-300 group-hover:scale-x-100"
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-line-gold bg-surface text-gold transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-steel">{description}</p>
      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-2 pt-2 text-[14px] font-semibold text-gold transition-colors duration-200 hover:text-gold-hover"
      >
        {ctaLabel}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </article>
  );
}
