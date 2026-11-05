# Roadmap

Grounded in two sources: ethereal_nature (first production consumer — storefront,
admin editor, server validation) and an audit of a large proprietary content
system with years of scale on the same problem shape. Items are ordered by
consumer pull, not ambition.

## 0.2.1 — packaging + render hygiene (shipped)

- `dist/` cleaned before build; stale-artifact and declaration-specifier guards in CI.
- Declaration files rewritten to `.js` specifiers (tsc's
  `rewriteRelativeImportExtensions` covers JS emit only).
- Parsing/validation memoised per `(config, registry)` identity.
- Duplicate `id`s: dev warning, collision-safe React keys.
- `wrapBlock` section-chrome recipe documented.

## 0.3.0 — the manifest release (shipped)

The headline: block definitions importable **without components**, so admins,
servers, and tests stop re-declaring every block.

- `defineBlock({ schema, label?, defaults?, summary?, fields?, version? })`,
  importable from `blockprint/config` (React-free — the whole config
  declaration chain resolves without `@types/react` installed).
- `createRegistry(manifest, components)` — binds components to a manifest
  with per-key checking via contravariance; the single-argument form remains.
- Headless, total `validateConfig(manifest, config)` — never throws; unknown
  types classified but not counted as failure (caller's policy); duplicate
  ids reported. The Renderer shares the same per-entry semantics.
- Fail-soft: `onFallback(info)` (synchronous, RSC-compatible), opt-in
  `catchBlockErrors` boundary adding the `render-error` fallback reason
  (client-only, documented), `invalidConfigFallback` for the outer shape.

## 0.4.0 — documents and data

- Document envelope `{ meta, blocks }` with a typed meta schema; bare arrays
  stay legal everywhere.
- `loader(props, ctx)` on definitions + `prefetch(registry, config, ctx)` —
  replaces hand-written route-loader prefetching.
- `refs(props)` on definitions — a document's entity dependencies, for cache
  tags, link checking, "used in".
- Editor primitives: pure list operations (move/insert/remove/update),
  schema-derived completeness.

## Parked (design notes only, until a real consumer pulls)

- **`blockprint/locale`** — per-field locale resolution with provenance
  (`local | family | master | none`). The hardest design on the list; building
  it without a live multi-locale consumer is how the wrong abstraction ships.
  Known requirements from the audit: resolve per field, never per section;
  provenance must be queryable for editor UIs.
- **`migrate(oldProps)`** — `version` exists on `defineBlock` from 0.3.0 so
  the slot is reserved; migration tooling waits for a real migration.
- **Form generation from `fields` metadata** — the natural v2 flagship, after
  the manifest's `fields` prove out in a real admin.

## Principles (unchanged)

Type is type, identity is `id`. One schema per block, in code, used on the
real data. The library ships the mechanism, not the content: no editor, no
CMS, no styling. Every feature must be deletable by a consumer who doesn't
need it.
