export interface PricingProps {
  title: string;
  plans: Array<{
    name: string;
    price: number;
    period: string;
    features: string[];
    highlighted?: boolean;
  }>;
}

export function Pricing({ title, plans }: PricingProps) {
  return (
    <section className="px-8 py-12">
      <h2 className="mb-8 text-center text-2xl font-bold">{title}</h2>
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 ${
              plan.highlighted
                ? "border-transparent shadow-lg"
                : "border-black/8 bg-white shadow-sm"
            }`}
            style={
              plan.highlighted
                ? { background: "var(--ink)", color: "var(--surface)" }
                : undefined
            }
          >
            <p className="text-sm font-semibold opacity-70">{plan.name}</p>
            <p className="mt-2">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-sm opacity-60"> /{plan.period}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span style={{ color: plan.highlighted ? "inherit" : "var(--accent)" }}>
                    ✓
                  </span>
                  <span className="opacity-80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
