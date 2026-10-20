# blockprint

**Typed, config-driven block rendering for React.** Render arbitrary UI trees from CMS-controlled JSON — with compile-time safety between your components and the config, and runtime validation at the boundary.

**Live demo: [blockprint.terzidest.com](https://blockprint.terzidest.com)** — three completely different pages (commerce, SaaS, editorial) from one renderer and one registry, plus a deliberately broken config showing graceful fallback. · [GitHub](https://github.com/terzidest/blockprint)

## The problem

Content teams compose pages from a fixed set of block types; your app receives JSON like `[{ "type": "hero", "props": { … } }, …]`. Consuming that in React usually collapses into a `switch` on `block.type` — every block imported into every page, props typed `any`, unknown types crashing the page.

blockprint inverts it: you define the blocks and their prop types, register them once, and render any config — including configs containing block types or malformed props you've never seen.

## Usage

```tsx
import { createRegistry, Renderer } from "blockprint";
import { z } from "zod";

const HeroBanner = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <header><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</header>
);

const registry = createRegistry({
  hero: HeroBanner,                                   // compile-time trust
  gameGrid: {                                         // runtime guarantee
    component: GameGrid,
    schema: z.object({ games: z.array(gameSchema) }),
  },
});

// config typically arrives from a CMS at runtime
<Renderer config={pageConfig} registry={registry} />;
```

- A registered component whose props don't match its schema is a **compile error on that key**, with a message naming the block — not a runtime crash.
- Unknown block types and schema-rejected props render a configurable **fallback**; the rest of the page renders normally.
- Configs authored in TypeScript get block-name autocomplete and per-block prop checking via `ConfigFor<typeof registry>`.
- **Zero runtime dependencies.** Schemas are typed against [Standard Schema](https://standardschema.dev), so zod (≥ 3.24), valibot, and arktype all work — blockprint depends on none of them.
- Framework-agnostic: React only. No Next.js/Remix imports; the library ships the mechanism, not the content.

## API

### `createRegistry(blocks)`

Builds a typed registry from a map of block-type strings to definitions. A definition is either a bare component or `{ component, schema? }`, where `schema` is any Standard Schema validator.

When a schema is present it is the source of truth: the component receives the schema's parsed output (so schema defaults become prop defaults), and a component that cannot accept that output is a compile error on the offending key.

### `<Renderer config registry fallback? wrapBlock? />`

Renders a config against a registry. `config` is `unknown` on purpose — the outer shape is validated internally at a single boundary. Every entry resolves to exactly one of:

1. known type, valid props → the component renders with parsed props;
2. unknown type → `fallback` with `{ reason: "unknown-type" }`;
3. schema-rejected props → `fallback` with `{ reason: "invalid-props", issues }`.

The default fallback renders a warning box in development and `null` in production — a page that wants visible failure in production must pass its own `fallback`.

The optional `wrapBlock={(node, entry, index) => …}` prop wraps every rendered entry — blocks and fallbacks alike — with access to the config entry and its index. This is the hook point for visual-editing overlays, analytics boundaries, or per-block chrome.

### `parseConfig(input)`

The boundary validator, exported for consumers who want to fail at fetch time rather than render time. Throws `ConfigError` with the entry index and reason.

### Types

- `Registry<T>` — the registry's captured shape.
- `BlockConfig` — one untrusted config entry: `{ type: string; props?: unknown; id?: string | number }`.
- `ConfigFor<R>` — the closed, fully typed config union for a registry, for configs authored in TypeScript. Typed as each schema's *input*, so fields with defaults are optional to write.
- `FallbackProps` — the fallback contract.
- `StandardSchemaV1` — re-exported for custom schema implementations.

## Gotchas

- **`exactOptionalPropertyTypes` + zod's `.optional()`**: with that compiler flag enabled, a schema field like `z.string().optional()` produces `prop?: string | undefined`, which is not assignable to a component prop declared `prop?: string` — so the registry's compile-time check (correctly) rejects the registration. Either declare such component props as `prop?: string | undefined`, or leave the flag off in the consuming app.
- **Async schemas are not supported** (React render is synchronous); an async validation routes the entry to the fallback with an explanatory issue.
- Entries use `id` for React keys when present, falling back to `type-index`.

## License

MIT © [Triantafillos Terzidis](https://github.com/terzidest)
