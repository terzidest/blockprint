export interface CTAProps {
  title: string;
  subtitle?: string;
  buttonLabel: string;
  tone?: "default" | "contrast";
}

export function CTA({ title, subtitle, buttonLabel, tone = "default" }: CTAProps) {
  const contrast = tone === "contrast";
  return (
    <section className="px-8 py-12">
      <div
        className="mx-auto flex max-w-4xl flex-col items-center gap-3 rounded-2xl px-8 py-12 text-center"
        style={
          contrast
            ? { background: "var(--ink)", color: "var(--surface)" }
            : { background: "var(--accent-soft)" }
        }
      >
        <h2 className="text-3xl font-bold">{title}</h2>
        {subtitle && <p className="max-w-lg opacity-70">{subtitle}</p>}
        <button
          className="mt-4 rounded-lg px-7 py-3 text-sm font-semibold"
          style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
