# blockprint

Typed, config-driven block rendering for React. See the [repository README](../../README.md) for the full introduction.

## API

### `createRegistry(blocks)`

Builds a typed registry from a map of block-type strings to definitions. A definition is either a bare component or `{ component, schema? }`, where `schema` is any [Standard Schema](https://standardschema.dev) validator (zod ≥ 3.24, valibot, arktype, …).

When a schema is present it is the source of truth: the component receives the schema's parsed output (so schema defaults become prop defaults), and a component that cannot accept that output is a compile error on the offending key.

### `<Renderer config registry fallback? />`

Renders a config against a registry. `config` is `unknown` on purpose — the outer shape is validated internally at a single boundary. Every entry resolves to exactly one of:

1. known type, valid props → the component renders with parsed props;
2. unknown type → `fallback` with `{ reason: "unknown-type" }`;
3. schema-rejected props → `fallback` with `{ reason: "invalid-props", issues }`.

The default fallback renders a warning box in development and `null` in production.

The optional `wrapBlock={(node, entry, index) => …}` prop wraps every rendered entry — blocks and fallbacks alike — with access to the config entry and its index. This is the hook point for visual-editing overlays, analytics boundaries, or per-block chrome.

### `parseConfig(input)`

The boundary validator, exported for consumers who want to fail at fetch time rather than render time. Throws `ConfigError` with the entry index and reason.

### Types

- `Registry<T>` — the registry's captured shape.
- `BlockConfig` — one untrusted config entry: `{ type: string; props?: unknown; id?: string | number }`.
- `ConfigFor<R>` — the closed, fully typed config union for a registry; for configs authored in TypeScript.
- `FallbackProps` — the fallback contract.
- `StandardSchemaV1` — re-exported for custom schema implementations.

## Notes

- Async schemas are not supported (React render is synchronous); an async validation routes the entry to the fallback with an explanatory issue.
- Entries use `id` for React keys when present, falling back to `type-index`.
