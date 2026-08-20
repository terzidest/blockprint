export interface FeatureGridProps {
  title: string;
  subtitle?: string;
  features: Array<{ icon: string; title: string; description: string }>;
}

export function FeatureGrid({ title, subtitle, features }: FeatureGridProps) {
  return (
    <section className="px-8 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="mt-2 text-sm opacity-60">{subtitle}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-black/8 bg-white p-5 shadow-sm"
          >
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-lg"
              style={{ background: "var(--accent-soft)" }}
            >
              {feature.icon}
            </div>
            <h3 className="text-sm font-bold">{feature.title}</h3>
            <p className="mt-1 text-sm leading-relaxed opacity-60">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
