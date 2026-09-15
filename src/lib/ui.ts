/**
 * Shared layout primitives. Breakpoint behavior follows the mobile-first spec:
 * - ≤375px:      16px side padding
 * - 376–767px:   20px side padding
 * - 768–1023px:  32px side padding
 * - 1024–1439px: 64–80px side padding, content capped ~1280px
 * - ≥1440px:     content capped at 1400px, centered
 */
export const containerClass =
  "mx-auto w-full max-w-[1280px] px-4 sm:px-5 md:px-8 lg:px-16 xl:px-20 min-[1440px]:max-w-[1400px]";

export const sectionClass = "py-14 sm:py-16 md:py-24 lg:py-28";

export const btnBaseClass =
  "inline-flex min-h-11 select-none items-center justify-center gap-2.5 rounded-lg px-5 py-2.5 text-[15px] font-semibold tracking-[0.01em] transition-colors duration-200";
