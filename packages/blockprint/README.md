# blockprint

**Typed, config-driven block rendering for React.** Render arbitrary UI trees from CMS-controlled JSON — with compile-time safety between your components and the config, and runtime validation at the boundary.

**Live demo: [blockprint.terzidest.com](https://blockprint.terzidest.com)** — three completely different pages (commerce, SaaS, editorial) from one renderer and one registry, plus a deliberately broken config showing graceful fallback. · [GitHub](https://github.com/terzidest/blockprint)

In production at [ethereal_nature](https://github.com/terzidest/ethereal_nature): storefront pages from DB-stored configs, an admin page editor, and server-side validation via `blockprint/config`.

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

Fail-soft options:

- `onFallback={(info) => …}` — telemetry hook, invoked synchronously whenever an entry falls back (reason, type, props, index). Synchronous so it works in Server Components; expect one call per environment (server + hydration) and doubled calls under StrictMode — dedupe downstream if exactness matters.
- `invalidConfigFallback={<ErrorState />}` — rendered instead of throwing when the outer config shape is invalid. Without it the Renderer throws `ConfigError`, so boundary-less apps fail loudly rather than silently blank.
- `catchBlockErrors` — wraps each block in an error boundary: a block that throws while rendering becomes a `render-error` fallback instead of taking the page down. **Client-side containment only**: React error boundaries do not catch during server rendering, so enable this from a client component; SSR totality remains your blocks' responsibility.

The optional `wrapBlock={(node, entry, index) => …}` prop wraps every rendered entry — blocks and fallbacks alike — with access to the config entry and its index. This is the hook point for visual-editing overlays, analytics boundaries, or per-block chrome.

A common recipe — shared section chrome, deep-link anchors, and analytics attributes in one place instead of repeated in every block:

```tsx
<Renderer
  config={config}
  registry={registry}
  wrapBlock={(node, entry) => (
    <section
      id={entry.id != null ? String(entry.id) : undefined} // anchor: /page#hero-1
      data-block={entry.type}                        // analytics / e2e hooks
      className="mx-auto max-w-5xl px-6 py-10"
    >
      {node}
    </section>
  )}
/>
```

Rendering and schema validation are memoised per `(config, registry)` identity — keep the config referentially stable across renders (state, loader data, `useMemo`) to benefit. Duplicate `id`s warn in development and render under collision-safe keys.

### `parseConfig(input)`

The boundary validator, exported for consumers who want to fail at fetch time rather than render time. Throws `ConfigError` with the entry index and reason.

### Manifests — block definitions without components

When more than one app needs to know your blocks (an admin, a server, tests), define them once, component-free, and join components only where rendering happens:

```ts
// packages/blocks-contract — imports blockprint/config only, no React
import { defineBlock } from "blockprint/config";

export const hero = defineBlock({
  schema: heroSchema,                       // required; the manifest's reason to exist
  label: "Hero",
  defaults: { title: "A headline…" },       // typed as the schema's INPUT
  summary: (props) => props.title,          // receives the schema's OUTPUT
  fields: { title: { label: "Headline" } }, // shallow editor metadata, uninterpreted
});

export const manifest = { hero, categoryTiles, productStrip };
```

```tsx
// the rendering app — the only place components exist
import { createRegistry } from "blockprint";
import { manifest } from "@yours/blocks-contract";

const registry = createRegistry(manifest, {
  hero: Hero,
  categoryTiles: CategoryTiles,
  productStrip: ProductStrip,
});
```

The join is checked per key: a component requiring a prop its schema doesn't produce, a missing component, or an extra component are all compile errors on the offending key. Editors and servers import the manifest (labels, defaults, summaries, `InputOf`/`OutputOf` types) and never touch component modules.

### `validateConfig(manifest, config)` — headless, total

Per-entry validation for save endpoints, tests, loaders, and editors. **Never throws:**

```ts
import { validateConfig } from "blockprint/config";

const report = validateConfig(manifest, untrustedInput);
report.ok;           // outer shape valid and no entry failed validation
report.error;        // outer-shape failure message, if any
report.entries;      // per entry: { ok: true, value } | { ok: false, reason, issues? }
report.unknownTypes; // distinct unregistered types — NOT counted as failure:
                     // unknown blocks are the renderer's fallback case, and
                     // whether to accept them is the caller's policy
report.duplicateIds; // ids appearing more than once
```

The Renderer applies the same per-entry semantics, so what validates at save time is what renders.

### `blockprint/config` — the React-free entry point

Backends that store and validate configs want exactly `parseConfig` and nothing React-shaped. The `blockprint/config` subpath exports `parseConfig`, `ConfigError`, and the `BlockConfig` / `StandardSchemaV1` types with **no React requirement** (the React peer dependency is marked optional):

```ts
// in a Node server — no react in node_modules required
import { parseConfig, ConfigError } from "blockprint/config";

app.put("/pages/:slug", (req, res) => {
  const config = parseConfig(req.body); // throws ConfigError with entry index
  …
});
```

Validate structure on the server, validate props at render time in the client — the registry schemas are the real trust boundary, so the server never needs to know the blocks.

### Types

- `Registry<T>` — the registry's captured shape.
- `BlockConfig` — one untrusted config entry: `{ type: string; props?: unknown; id?: string | number }`.
- `ConfigFor<R>` — the closed, fully typed config union for a registry, for configs authored in TypeScript. Typed as each schema's *input*, so fields with defaults are optional to write.
- `PropsFor<R, K>` / `InputFor<R, K>` — one block type's rendered props (schema output) / authorable props (schema input). For building editors and tooling against a registry.
- `FallbackProps` — the fallback contract.
- `StandardSchemaV1` — re-exported for custom schema implementations.

## Sharing schemas with an editor app

An admin/editor app usually can't import the rendering app's registry — that would drag every block component (and its styling, routing, data hooks) into the editor bundle. The pattern that works:

1. Put the **zod schemas in a shared package** (`packages/blocks-contract`), importable by both apps.
2. The rendering app joins schemas with components at the edge: `createRegistry({ hero: { component: Hero, schema: heroSchema } })`.
3. The editor imports only the schemas (labels, defaults, field shapes) and `blockprint/config` for structure — never the components.

`PropsFor`/`InputFor` give the editor the exact prop types per block without any runtime import of the registry.

## Config storage notes

- **Entry-level key order is irrelevant** — the array order is the only order that matters. Storage layers that canonicalize JSON (e.g. Postgres `jsonb` reorders object keys) are fully compatible; don't be alarmed when a round-tripped config diffs at the key level.
- `parseConfig` strips unknown entry-level keys (only `type`, `props`, `id` survive) and deliberately allows unknown `type` values — unknown block types are the renderer's fallback case, which is what makes configs forward-compatible across deploys.

## Gotchas

- **`exactOptionalPropertyTypes` + zod's `.optional()`**: with that compiler flag enabled, a schema field like `z.string().optional()` produces `prop?: string | undefined`, which is not assignable to a component prop declared `prop?: string` — so the registry's compile-time check (correctly) rejects the registration. Either declare such component props as `prop?: string | undefined`, or leave the flag off in the consuming app.
- **Async schemas are not supported** (React render is synchronous); an async validation routes the entry to the fallback with an explanatory issue.
- Entries use `id` for React keys when present, falling back to `type-index`.

## License

MIT © [Triantafillos Terzidis](https://github.com/terzidest)
