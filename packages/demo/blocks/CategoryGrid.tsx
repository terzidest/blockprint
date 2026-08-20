export interface CategoryGridProps {
  title?: string;
  categories: Array<{ name: string; emoji: string; count: number }>;
}

export function CategoryGrid({ title, categories }: CategoryGridProps) {
  return (
    <section className="px-8 py-10">
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-black/8 bg-white py-4 shadow-sm"
          >
            <span className="text-3xl">{category.emoji}</span>
            <span className="text-xs font-semibold">{category.name}</span>
            <span className="text-[10px] opacity-50">{category.count} items</span>
          </div>
        ))}
      </div>
    </section>
  );
}
