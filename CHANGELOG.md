# Changelog

## 0.3.0

The manifest release — block definitions importable without components.

- **Added**: `defineBlock` (schema required; `defaults` typed as schema input,
  `summary` as output, shallow `fields` metadata, `version` slot) and the
  `Manifest` / `InputOf` / `OutputOf` types, all in `blockprint/config`.
- **Added**: `createRegistry(manifest, components)` — joins components to a
  manifest with per-key compile errors; the one-argument form is unchanged.
- **Added**: `validateConfig(manifest, config)` — total (never throws),
  per-entry results, unknown types classified but not counted as failure,
  duplicate ids reported.
- **Added** fail-soft rendering: `onFallback` telemetry (synchronous,
  RSC-compatible, deduped per Renderer instance), `catchBlockErrors` per-block
  error boundary (client-only; recovers when the entry changes),
  `invalidConfigFallback` for the outer shape.
- **Breaking for custom fallbacks**: `FallbackProps` gained a third member,
  `{ reason: "render-error", error }`. A fallback that narrowed with a
  ternary (`reason === "unknown-type" ? … : props.issues`) must now handle
  `render-error` — switch on `reason` exhaustively.
- `blockprint/config`'s declaration chain no longer references React types:
  it typechecks in a project without `@types/react`, with `skipLibCheck`
  off.

## 0.2.1

- Fixed: emitted declarations shipped raw `./x.ts` specifiers
  (`rewriteRelativeImportExtensions` covers JS emit only); a stale build
  chunk was included in the tarball.
- Added: pnpm-only publish guard (`publishConfig.exports` is a pnpm feature;
  npm would publish a manifest pointing at unpacked src paths).
- Parsing/validation memoised per `(config, registry)`; duplicate ids warn in
  dev and render under collision-safe keys.

## 0.2.0

- Fixed: the ESM dist now imports in bare Node (source imports carry real
  `.ts`/`.tsx` extensions, rewritten at build).
- Added: React-free `blockprint/config` subpath (`parseConfig`,
  `ConfigError`); the React peer dependency is optional.
- Added: `PropsFor` / `InputFor` type helpers; CI with packed-tarball smoke
  tests.

## 0.1.1

- npm page: self-contained README, `homepage`/`bugs` metadata.

## 0.1.0

- Added: `wrapBlock` (per-entry wrapper for overlays/chrome/analytics).
- Changed: `ConfigFor` uses each schema's *input* type, so defaulted fields
  are optional when authoring configs.

## 0.0.1

- Initial release: `createRegistry`, `Renderer`, `parseConfig`, Standard
  Schema validation, typed registry with per-key errors.
