export interface PullQuoteProps {
  quote: string;
  attribution?: string;
}

export function PullQuote({ quote, attribution }: PullQuoteProps) {
  return (
    <section className="px-8 py-6">
      <figure
        className="mx-auto max-w-xl border-l-4 py-2 pl-6"
        style={{ borderColor: "var(--accent)" }}
      >
        <blockquote
          className="text-2xl leading-snug font-semibold"
          style={{ fontFamily: "var(--heading-font)" }}
        >
          “{quote}”
        </blockquote>
        {attribution && (
          <figcaption className="mt-3 text-sm opacity-60">— {attribution}</figcaption>
        )}
      </figure>
    </section>
  );
}
