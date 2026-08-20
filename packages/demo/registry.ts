import { createRegistry } from "blockprint";
import { z } from "zod";
import { Hero } from "./blocks/Hero";
import { Newsletter } from "./blocks/Newsletter";
import { CTA } from "./blocks/CTA";
import { FeaturedProducts } from "./blocks/FeaturedProducts";
import { CategoryGrid } from "./blocks/CategoryGrid";
import { LogoCloud } from "./blocks/LogoCloud";
import { FeatureGrid } from "./blocks/FeatureGrid";
import { Stats } from "./blocks/Stats";
import { Pricing } from "./blocks/Pricing";
import { ArticleHero } from "./blocks/ArticleHero";
import { RichText } from "./blocks/RichText";
import { PullQuote } from "./blocks/PullQuote";
import { RelatedArticles } from "./blocks/RelatedArticles";

// Two registration forms, deliberately mixed:
//  - schema-backed entries get runtime validation of untrusted props, and the
//    schema's parsed output (defaults applied) becomes the rendered props;
//  - bare entries are compile-time trusted.
export const registry = createRegistry({
  hero: {
    component: Hero,
    schema: z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      ctaLabel: z.string().default("Get started"),
      align: z.enum(["left", "center"]).default("center"),
      badge: z.string().optional(),
    }),
  },
  newsletter: {
    component: Newsletter,
    schema: z.object({
      heading: z.string().default("Stay in the loop"),
      subtext: z.string().optional(),
      buttonLabel: z.string().default("Subscribe"),
    }),
  },
  pricing: {
    component: Pricing,
    schema: z.object({
      title: z.string(),
      plans: z.array(
        z.object({
          name: z.string(),
          price: z.number(),
          period: z.string(),
          features: z.array(z.string()),
          highlighted: z.boolean().optional(),
        }),
      ),
    }),
  },
  stats: {
    component: Stats,
    schema: z.object({
      stats: z.array(z.object({ value: z.string(), label: z.string() })),
    }),
  },
  cta: CTA,
  featuredProducts: FeaturedProducts,
  categoryGrid: CategoryGrid,
  logoCloud: LogoCloud,
  featureGrid: FeatureGrid,
  articleHero: ArticleHero,
  richText: RichText,
  pullQuote: PullQuote,
  relatedArticles: RelatedArticles,
});

export type DemoRegistry = typeof registry;
