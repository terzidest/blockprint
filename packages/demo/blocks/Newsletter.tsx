export interface NewsletterProps {
  heading: string;
  subtext?: string;
  buttonLabel: string;
}

export function Newsletter({ heading, subtext, buttonLabel }: NewsletterProps) {
  return (
    <section className="px-8 py-12">
      <div
        className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl px-8 py-10 text-center"
        style={{ background: "var(--accent-soft)" }}
      >
        <h2 className="text-2xl font-bold">{heading}</h2>
        {subtext && <p className="max-w-md text-sm opacity-70">{subtext}</p>}
        <div className="mt-2 flex w-full max-w-sm gap-2">
          <div className="flex-1 rounded-lg border border-black/10 bg-white px-4 py-2.5 text-left text-sm text-black/40">
            you@example.com
          </div>
          <button
            className="rounded-lg px-5 py-2.5 text-sm font-semibold"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
