import type { ReactNode } from "react";
import Image from "next/image";
import { containerClass } from "@/lib/ui";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs?: ReactNode;
  children?: ReactNode;
  /** Optional cinematic background photo (page-specific, per page). Falls
   *  back to the plain coal panel when omitted, so pages that don't have a
   *  dedicated photo yet are unaffected. */
  image?: { src: string; alt: string };
};

/** Inner-page header with correct offset under the fixed site header. */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  image,
}: PageHeaderProps) {
  return (
    <section
      className={`relative overflow-hidden border-b border-line ${image ? "min-h-[42vh] sm:min-h-[46vh]" : "bg-coal"}`}
    >
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            quality={80}
            sizes="100vw"
            className="cinematic-image object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/55 to-night"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/30"
          />
        </>
      )}
      <div
        className={`${containerClass} hero-stagger relative z-10 flex flex-col gap-4 pb-12 pt-24 md:pb-16 md:pt-32 ${image ? "justify-end min-h-[42vh] sm:min-h-[46vh]" : ""}`}
      >
        {breadcrumbs}
        <p className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
          <span className="hairline-gold" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-[28px] font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[44px]">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base leading-relaxed text-steel md:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
