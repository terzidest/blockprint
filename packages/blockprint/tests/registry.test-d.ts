import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";
import { createRegistry } from "../src";
import type { ConfigFor } from "../src";

const Hero = (_props: { title: string; subtitle?: string }) => null;
const Grid = (_props: { items: string[] }) => null;

describe("createRegistry typing", () => {
  test("bare component registration infers props from the component", () => {
    const registry = createRegistry({ hero: Hero });
    type Entry = ConfigFor<typeof registry>[number];

    expectTypeOf<Entry["type"]>().toEqualTypeOf<"hero">();
    expectTypeOf<Entry["props"]>().toEqualTypeOf<{
      title: string;
      subtitle?: string;
    }>();
  });

  test("schema registration compiles when component accepts schema output", () => {
    createRegistry({
      grid: {
        component: Grid,
        schema: z.object({ items: z.array(z.string()) }),
      },
    });
  });

  test("schema output missing a required prop errors on that key", () => {
    createRegistry({
      grid: {
        component: Grid,
        // @ts-expect-error schema output lacks `items`, which Grid requires
        schema: z.object({ wrong: z.string() }),
      },
    });
  });

  test("schema output with a wrongly typed prop errors on that key", () => {
    createRegistry({
      grid: {
        component: Grid,
        // @ts-expect-error `items` is number[] but Grid requires string[]
        schema: z.object({ items: z.array(z.number()) }),
      },
    });
  });

  test("a mixed registry validates each entry independently", () => {
    createRegistry({
      hero: Hero,
      grid: {
        component: Grid,
        schema: z.object({ items: z.array(z.string()) }),
      },
    });
  });

  test("authored configs use the schema INPUT: defaulted fields are optional", () => {
    const registry = createRegistry({
      grid: {
        component: Grid,
        // output always has items (so Grid is satisfied at registration),
        // but authored configs may omit it — the default fills it at render
        schema: z.object({ items: z.array(z.string()).default([]) }),
      },
    });
    type Config = ConfigFor<typeof registry>;

    const config: Config = [{ type: "grid", props: {} }];
    void config;
    expectTypeOf<Config[number]["props"]>().toExtend<{
      items?: string[] | undefined;
    }>();
  });
});

describe("ConfigFor typing", () => {
  const registry = createRegistry({ hero: Hero, grid: Grid });
  type Config = ConfigFor<typeof registry>;

  test("valid entries compile with the exact block-name union", () => {
    const config: Config = [
      { type: "hero", props: { title: "Welcome" } },
      { type: "grid", props: { items: ["a", "b"] }, id: 7 },
    ];
    expectTypeOf(config[0]!.type).toEqualTypeOf<"hero" | "grid">();
  });

  test("unregistered block names are not representable", () => {
    // @ts-expect-error 'mystery' is not a registered block type
    const config: Config = [{ type: "mystery", props: {} }];
    void config;
  });

  test("wrong props for a valid block name are rejected", () => {
    // @ts-expect-error hero requires a title
    const config: Config = [{ type: "hero", props: {} }];
    void config;
  });
});
