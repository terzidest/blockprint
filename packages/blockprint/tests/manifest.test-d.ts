import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { createRegistry, defineBlock } from "../src";
import type { ConfigFor, InputOf, OutputOf, PropsFor } from "../src";

const heroSchema = z.object({
  title: z.string(),
  ctaLabel: z.string().default("Shop"),
});
const gridSchema = z.object({ items: z.array(z.string()) });

const Hero = (_props: { title: string; ctaLabel: string }) => null;
const Grid = (_props: { items: string[] }) => null;

describe("defineBlock typing", () => {
  test("defaults check against the schema INPUT (defaulted fields optional)", () => {
    defineBlock({ schema: heroSchema, defaults: { title: "Hi" } });
    defineBlock({
      schema: heroSchema,
      // @ts-expect-error title must be a string
      defaults: { title: 42 },
    });
  });

  test("summary receives the schema OUTPUT (defaults applied)", () => {
    defineBlock({
      schema: heroSchema,
      summary: (props) => {
        expectTypeOf(props.ctaLabel).toEqualTypeOf<string>();
        return props.title;
      },
    });
  });

  test("fields keys are constrained to the schema input", () => {
    defineBlock({ schema: heroSchema, fields: { title: { label: "Headline" } } });
    defineBlock({
      schema: heroSchema,
      // @ts-expect-error 'missing' is not a field of the hero schema
      fields: { missing: { label: "?" } },
    });
  });

  test("InputOf / OutputOf extract both sides", () => {
    const hero = defineBlock({ schema: heroSchema });
    expectTypeOf<InputOf<typeof hero>>().toEqualTypeOf<{
      title: string;
      ctaLabel?: string | undefined;
    }>();
    expectTypeOf<OutputOf<typeof hero>>().toEqualTypeOf<{
      title: string;
      ctaLabel: string;
    }>();
  });
});

describe("createRegistry(manifest, components) typing", () => {
  const manifest = {
    hero: defineBlock({ schema: heroSchema }),
    grid: defineBlock({ schema: gridSchema }),
  };

  test("matching components compile; registry types flow through", () => {
    const registry = createRegistry(manifest, { hero: Hero, grid: Grid });
    expectTypeOf<PropsFor<typeof registry, "hero">>().toEqualTypeOf<{
      title: string;
      ctaLabel: string;
    }>();
    type Entry = ConfigFor<typeof registry>[number];
    expectTypeOf<Entry["type"]>().toEqualTypeOf<"hero" | "grid">();
  });

  test("a component requiring props the schema does not produce errors on its key", () => {
    const Wrong = (_props: { title: string; missing: number }) => null;
    createRegistry(manifest, {
      // @ts-expect-error Wrong requires `missing`, which hero's schema does not produce
      hero: Wrong,
      grid: Grid,
    });
  });

  test("a component accepting fewer props than the schema produces is fine", () => {
    const Loose = (_props: { title: string }) => null;
    createRegistry(manifest, { hero: Loose, grid: Grid });
  });

  test("a missing component errors", () => {
    // @ts-expect-error grid component is missing
    createRegistry(manifest, { hero: Hero });
  });

  test("an extra component with no manifest entry errors", () => {
    createRegistry(manifest, {
      hero: Hero,
      grid: Grid,
      // @ts-expect-error 'stray' has no manifest entry
      stray: Hero,
    });
  });
});
