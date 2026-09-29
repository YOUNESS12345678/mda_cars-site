type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "items-center text-center" : "";
  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <p className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
          <span className="hairline-gold" aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2 className="max-w-2xl text-[26px] font-bold leading-[1.15] tracking-tight text-white sm:text-[32px] md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-steel">
          {description}
        </p>
      )}
    </div>
  );
}
