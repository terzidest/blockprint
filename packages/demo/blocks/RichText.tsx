export interface RichTextProps {
  paragraphs: string[];
}

export function RichText({ paragraphs }: RichTextProps) {
  return (
    <section className="px-8 py-8">
      <div
        className="mx-auto max-w-2xl space-y-5 text-[17px] leading-relaxed"
        style={{ fontFamily: "var(--heading-font)" }}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={index === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold first-letter:leading-none" : ""}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
