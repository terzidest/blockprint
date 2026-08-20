export interface ArticleHeroProps {
  kicker: string;
  title: string;
  deck: string;
  author: string;
  date: string;
  readTime: string;
}

export function ArticleHero({ kicker, title, deck, author, date, readTime }: ArticleHeroProps) {
  return (
    <header className="border-b border-black/10 px-8 pt-16 pb-10">
      <div className="mx-auto max-w-2xl">
        <p
          className="mb-3 text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: "var(--accent)" }}
        >
          {kicker}
        </p>
        <h1 className="text-4xl leading-tight font-bold">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed opacity-70">{deck}</p>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            {author
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </span>
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-xs opacity-50">
              {date} · {readTime}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
