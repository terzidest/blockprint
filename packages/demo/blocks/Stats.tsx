export interface StatsProps {
  stats: Array<{ value: string; label: string }>;
}

export function Stats({ stats }: StatsProps) {
  return (
    <section className="px-8 py-10">
      <div
        className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4"
        style={{ background: "var(--accent)" }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 px-4 py-6 text-center"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-xs opacity-75">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
