import { describe, expect, test } from "vitest";
import { z } from "zod";
import { defineBlock, validateConfig } from "../src/config.ts";

const manifest = {
  hero: defineBlock({
    schema: z.object({ title: z.string(), ctaLabel: z.string().default("Shop") }),
  }),
  grid: defineBlock({ schema: z.object({ items: z.array(z.string()) }) }),
};

describe("validateConfig", () => {
  test("valid entries report ok with parsed output (defaults applied)", () => {
    const report = validateConfig(manifest, [
      { type: "hero", props: { title: "Hi" } },
    ]);
    expect(report.ok).toBe(true);
    expect(report.entries[0]).toMatchObject({
      ok: true,
      value: { title: "Hi", ctaLabel: "Shop" },
    });
  });

  test("invalid props flip ok and carry issues", () => {
    const report = validateConfig(manifest, [
      { type: "hero", props: { title: 42 } },
    ]);
    expect(report.ok).toBe(false);
    expect(report.entries[0]).toMatchObject({ ok: false, reason: "invalid-props" });
  });

  test("unknown types are classified but do NOT flip ok", () => {
    const report = validateConfig(manifest, [
      { type: "hero", props: { title: "Hi" } },
      { type: "mystery", props: {} },
    ]);
    expect(report.ok).toBe(true);
    expect(report.unknownTypes).toEqual(["mystery"]);
    expect(report.entries[1]).toMatchObject({ ok: false, reason: "unknown-type" });
  });

  test("outer-shape failure never throws", () => {
    const report = validateConfig(manifest, { not: "an array" });
    expect(report.ok).toBe(false);
    expect(report.error?.message).toContain("array");
    expect(report.entries).toEqual([]);
  });

  test("duplicate ids are reported once each", () => {
    const report = validateConfig(manifest, [
      { type: "hero", props: { title: "a" }, id: "x" },
      { type: "hero", props: { title: "b" }, id: "x" },
      { type: "hero", props: { title: "c" }, id: "x" },
    ]);
    expect(report.duplicateIds).toEqual(["x"]);
  });

  test("async schemas are contained as async-schema", () => {
    const asyncManifest = {
      slow: {
        schema: {
          "~standard": {
            version: 1 as const,
            vendor: "test",
            validate: async (value: unknown) => ({ value }),
          },
        },
      },
    };
    const report = validateConfig(asyncManifest, [{ type: "slow", props: {} }]);
    expect(report.ok).toBe(false);
    expect(report.entries[0]).toMatchObject({ ok: false, reason: "async-schema" });
  });
});

describe("createRegistry(manifest, components) runtime", () => {
  test("missing component throws with the key named", async () => {
    const { createRegistry } = await import("../src/index.ts");
    const Hero = () => null;
    expect(() =>
      // @ts-expect-error grid intentionally missing
      createRegistry(manifest, { hero: Hero }),
    ).toThrow("manifest block 'grid'");
  });
});
