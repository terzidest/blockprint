export interface FeaturedProductsProps {
  title: string;
  products: Array<{ name: string; price: string; emoji: string; tag?: string }>;
}

export function FeaturedProducts({ title, products }: FeaturedProductsProps) {
  return (
    <section className="px-8 py-12">
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.name}
            className="overflow-hidden rounded-xl border border-black/8 bg-white shadow-sm"
          >
            <div
              className="relative flex h-28 items-center justify-center text-5xl"
              style={{ background: "var(--accent-soft)" }}
            >
              {product.emoji}
              {product.tag && (
                <span
                  className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                  style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  {product.tag}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold">{product.name}</p>
              <p className="text-sm opacity-60">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
