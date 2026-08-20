export interface LogoCloudProps {
  caption: string;
  logos: string[];
}

export function LogoCloud({ caption, logos }: LogoCloudProps) {
  return (
    <section className="px-8 py-10 text-center">
      <p className="mb-5 text-xs font-semibold tracking-widest uppercase opacity-50">
        {caption}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {logos.map((logo) => (
          <span
            key={logo}
            className="text-lg font-bold tracking-tight opacity-40"
            style={{ fontFamily: "var(--heading-font)" }}
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
