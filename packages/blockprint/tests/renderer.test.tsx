import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { z } from "zod";
import {
  ConfigError,
  createRegistry,
  parseConfig,
  Renderer,
} from "../src";
import type { FallbackProps } from "../src";

const Hero = ({ title }: { title: string }) => <h1>{title}</h1>;

const registry = createRegistry({
  hero: { component: Hero, schema: z.object({ title: z.string() }) },
  plain: Hero,
});

const Fallback = (props: FallbackProps) => (
  <div data-reason={props.reason}>{props.type}</div>
);

describe("Renderer", () => {
  test("renders a known block with schema-parsed props", () => {
    const html = renderToStaticMarkup(
      <Renderer
        config={[{ type: "hero", props: { title: "Welcome" } }]}
        registry={registry}
      />,
    );
    expect(html).toBe("<h1>Welcome</h1>");
  });

  test("unknown types route to the fallback instead of crashing", () => {
    const html = renderToStaticMarkup(
      <Renderer
        config={[{ type: "mystery", props: {} }]}
        registry={registry}
        fallback={Fallback}
      />,
    );
    expect(html).toContain('data-reason="unknown-type"');
    expect(html).toContain("mystery");
  });

  test("schema-rejected props route to the fallback", () => {
    const html = renderToStaticMarkup(
      <Renderer
        config={[{ type: "hero", props: { title: 42 } }]}
        registry={registry}
        fallback={Fallback}
      />,
    );
    expect(html).toContain('data-reason="invalid-props"');
  });

  test("schema defaults become block prop defaults", () => {
    const withDefault = createRegistry({
      hero: {
        component: Hero,
        schema: z.object({ title: z.string().default("Fallback title") }),
      },
    });
    const html = renderToStaticMarkup(
      <Renderer config={[{ type: "hero", props: {} }]} registry={withDefault} />,
    );
    expect(html).toBe("<h1>Fallback title</h1>");
  });

  test("bare-component blocks render without validation", () => {
    const html = renderToStaticMarkup(
      <Renderer
        config={[{ type: "plain", props: { title: "Trusted" } }]}
        registry={registry}
      />,
    );
    expect(html).toBe("<h1>Trusted</h1>");
  });
});

describe("wrapBlock", () => {
  test("wraps rendered blocks with entry and index", () => {
    const html = renderToStaticMarkup(
      <Renderer
        config={[{ type: "hero", props: { title: "Welcome" } }]}
        registry={registry}
        wrapBlock={(node, entry, index) => (
          <section data-type={entry.type} data-index={index}>
            {node}
          </section>
        )}
      />,
    );
    expect(html).toBe(
      '<section data-type="hero" data-index="0"><h1>Welcome</h1></section>',
    );
  });

  test("wraps fallbacks too, so failed entries stay addressable", () => {
    const html = renderToStaticMarkup(
      <Renderer
        config={[{ type: "mystery" }]}
        registry={registry}
        fallback={Fallback}
        wrapBlock={(node, entry, index) => (
          <section data-index={index}>{node}</section>
        )}
      />,
    );
    expect(html).toBe(
      '<section data-index="0"><div data-reason="unknown-type">mystery</div></section>',
    );
  });
});

describe("parseConfig", () => {
  test("rejects non-array input", () => {
    expect(() => parseConfig({})).toThrow(ConfigError);
  });

  test("rejects entries without a type string", () => {
    expect(() => parseConfig([{ props: {} }])).toThrow(
      "config[0].type must be a non-empty string",
    );
  });

  test("passes well-formed entries through", () => {
    expect(parseConfig([{ type: "hero", props: { a: 1 }, id: "x" }])).toEqual([
      { type: "hero", props: { a: 1 }, id: "x" },
    ]);
  });
});
