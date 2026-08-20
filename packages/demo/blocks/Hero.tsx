export interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  align: "left" | "center";
  badge?: string;
}

export function Hero({ eyebrow, title, subtitle, ctaLabel, align, badge }: HeroProps) {
  const centered = align === "center";
  return (
    <section
      className={`px-8 py-16 ${centered ? "text-center" : "text-left"}`}
      style={{
        background:
          "linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 60%)",
      }}
    >
      <div className={`mx-auto max-w-2xl ${centered ? "" : "ml-0"}`}>
        {badge && (
          <span
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            {badge}
          </span>
        )}
        {eyebrow && (
          <p
            className="mb-2 text-sm font-semibold tracking-widest uppercase"
            style={{ color: "var(--accent)" }}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-lg opacity-70">{subtitle}</p>}
        <button
          className="mt-8 rounded-lg px-6 py-3 text-sm font-semibold shadow-sm"
          style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
}
