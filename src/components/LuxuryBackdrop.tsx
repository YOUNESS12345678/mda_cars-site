/**
 * Homepage-only ambient backdrop — a quiet showroom-spotlight treatment
 * layered behind the hero and reservation sections: two soft blurred glows
 * (warm gold overhead, deep bronze pooling low-left) and a single faint
 * diagonal light sweep, evoking studio lighting on dark bodywork rather
 * than a generic gradient wash. Fixed and decorative; never affects layout
 * or contrast — text sits on the existing bg-obsidian panels above it.
 */
export function LuxuryBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 right-[-12%] h-[52rem] w-[52rem] rounded-full bg-gold/[0.09] blur-[140px]" />
      <div className="absolute bottom-[-25%] left-[-15%] h-[46rem] w-[46rem] rounded-full bg-[#8b6526]/[0.14] blur-[160px]" />
      <div
        className="absolute inset-x-0 top-0 h-[60vh] opacity-[0.05]"
        style={{
          background:
            "linear-gradient(115deg, transparent 40%, var(--color-gold) 50%, transparent 62%)",
        }}
      />
    </div>
  );
}
