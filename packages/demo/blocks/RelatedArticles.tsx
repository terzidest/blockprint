export interface RelatedArticlesProps {
  title: string;
  articles: Array<{ title: string; category: string; readTime: string }>;
}

export function RelatedArticles({ title, articles }: RelatedArticlesProps) {
  return (
    <section className="border-t border-black/10 px-8 py-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-5 text-lg font-bold">{title}</h2>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.title} className="group flex items-baseline justify-between gap-4">
              <div>
                <p
                  className="text-[11px] font-bold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  {article.category}
                </p>
                <p className="font-semibold group-hover:underline">{article.title}</p>
              </div>
              <span className="shrink-0 text-xs opacity-50">{article.readTime}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
