# blockprint — Design Document

## What this is

A framework-agnostic React library that renders arbitrary UI trees from CMS-controlled JSON configuration, with full type safety across the boundary between untyped remote data and typed React components.

The problem it solves: content teams need to compose pages from a fixed set of block types without touching code, but consuming those configs in a React app usually collapses into a `switch` statement on `block.type` that loses type safety and forces every possible block to be imported into every page.

This library inverts that. The consumer defines their own blocks and their prop shapes, registers them once, and renders any config the CMS produces — including configs the library itself has never seen. Unknown block types are handled gracefully; known block types are fully typed end to end.

## Non-goals

Stating what this deliberately does *not* do is as important as stating what it does. The scope stays narrow on purpose:

- It does not fetch data. The consumer brings the config; how it was fetched (SSR, React Query, static import, streamed) is outside the library.
- It does not know about Next.js, Remix, or any framework. Framework-specific concerns (routing, `next/image`, server components) live in the consumer, never in the library.
- It does not ship blocks. `HeroBanner`, `GameGrid`, and anything else domain-shaped are the consumer's responsibility. The library ships the *mechanism*, not the *content*.
- It does not do layout, theming, or styling opinions. Blocks style themselves.

These boundaries are what make it a tool rather than an app.

## The design in one paragraph

The consumer builds a **registry** by calling `createRegistry` with a map from block-type strings to React components. Each component declares its own props type. The registry captures the mapping in the type system so the union of registered block types, and the props each requires, are known statically. At runtime the consumer passes a **config** (an array or tree of `{ type, props }` objects, typically from a CMS) and the registry to the `<Renderer>` component. The renderer validates the config once at the boundary (Zod), looks up each block's component in the registry, and renders it with its typed props. Unknown block types hit a configurable fallback rather than crashing.

## Architecture

### Repository shape

A single repo, pnpm workspaces, two packages:

```
blockprint/
  packages/
    blockprint/          the tool
      src/
        types.ts
        validate.ts
        createRegistry.ts
        Renderer.tsx
        fallback.tsx
        index.ts       public API surface
      README.md
      package.json
    demo/              a consumer, proves the tool works
      app/             Next.js App Router
      blocks/          the demo's own blocks
      registry.ts      wires blocks into createRegistry
      services/
      mock-data/
      package.json
  README.md            leads with problem + usage example
  pnpm-workspace.yaml
  package.json
```

The `renderer` package is treated as if it will be published: clean public API through `index.ts`, no framework imports, no reaching into demo code. The `demo` package consumes it via `"renderer": "workspace:*"`, so the demo always reflects the current renderer without a publish step.

### Layers inside the renderer

Three concerns, cleanly separated:

**Boundary — `validate.ts`.** The single point where untyped input becomes typed. A Zod schema describes the config shape (a list of `{ type: string, props: unknown }` entries, plus whatever wrapping structure the config uses). Everything downstream of this boundary can assume the shape is correct. If validation fails, the renderer surfaces a clear error rather than rendering partial garbage.

**Registry — `createRegistry.ts`.** A typed factory. Takes a record of `{ [blockType]: Component }` and returns a registry object that carries the mapping in its type. This is where the generic-typing work lives — the registry's type parameter is what lets the renderer connect a runtime `block.type` string to the correct props type for that block's component.

**Renderer — `Renderer.tsx`.** A React component. Props: `{ config, registry, fallback? }`. Walks the validated config, looks up each block in the registry, renders it with its props. Unknown types render the fallback (default: a small dev-mode warning, silent in production).

### The public API

Kept deliberately small:

```ts
import { createRegistry, Renderer } from 'blockprint';
import type { CmsConfig, BlockRegistry } from 'blockprint';
```

Four exports. Two runtime, two types. That's the whole surface. A small public surface is a maturity signal on its own — it says the author decided what belongs to the consumer and what doesn't.

### Usage from the consumer's perspective

```tsx
// consumer defines their own blocks with their own prop types
const HeroBanner = ({ title, subtitle }: { title: string; subtitle: string }) => ...
const GameGrid   = ({ games }: { games: Game[] }) => ...

// register them once
const registry = createRegistry({
  hero: HeroBanner,
  gameGrid: GameGrid,
});

// render any CMS config against the registry
<Renderer config={pageConfig} registry={registry} />
```

The consumer never writes a `switch` on block type. Adding a new block is a one-line registry addition plus writing the component. The renderer doesn't change.

## The hard problem

The engineering core — the thing that makes this a real project rather than a switch statement in a wrapper — is the typing of the registry.

The naive version types the registry as `Record<string, ComponentType<any>>`. That works, but it throws away every guarantee: registering a component under the wrong key type-checks, passing wrong props to a block type-checks, mistyping a block name type-checks. It's a `switch` statement with extra steps.

The real version uses a generic type parameter that captures the exact shape of the map passed to `createRegistry`, so:

- The set of valid block-type strings for a given registry is a known union, not `string`.
- Each block's props are inferable from its type string.
- A misconfigured registry (component whose props don't match what the CMS supplies) is a type error at registration time, not a runtime crash.

Getting this right — while keeping the runtime code straightforward and the consumer-facing API readable — is the interesting work. It's also exactly the "typed dynamic rendering" claim that this project is meant to substantiate on the CV.

## What the demo package proves

The demo exists to make the tool legible in the recruiter glance. Its job is to show that:

1. The renderer renders **different pages** from different configs using the **same code path**. Two or three demo routes, each backed by a distinct JSON config, producing visibly different pages.
2. Blocks are the consumer's, not the library's. The demo's `blocks/` directory contains `HeroBanner`, `GameGrid`, `SeoContent` — none of which the renderer imports or knows about.
3. Unknown block types don't crash. One demo config deliberately includes an unregistered type to show the fallback path.
4. The typing holds. A screenshot or short section in the README shows the type error a consumer gets when they register a component whose props don't match the config schema — that's the moment the guarantee becomes visible.

The demo is deployed (Vercel or similar). The deployed link goes in the top-level README so the glance ends at working software, not at code.

## What is deliberately excluded

Things that would be reasonable in a larger tool but are out of scope here, and should be called out in the README as such:

- Nested / recursive blocks (blocks containing other blocks) — possible extension, not v1.
- Async block resolution (blocks that fetch their own data) — belongs in the consumer's data layer.
- A visual editor / preview UI — a different product.
- Server component support beyond "it works if your blocks are server components" — not something the library needs to actively handle.
- Block variants, A/B testing, personalization — application concerns.

Being explicit about non-scope in the README is part of the tool's story. It says the author knew where to stop.

## Success criteria

The project is done when:

- The `renderer` package builds, has zero framework dependencies, and exports the four public symbols above.
- The typed registry actually catches the misconfiguration errors described in "The hard problem." This is verifiable by a small set of type-level tests (`expectError`-style) in the package.
- The `demo` renders at least three distinct pages from three distinct configs, plus one page demonstrating the unknown-block fallback.
- The demo is deployed and linked from the root README.
- The root README opens with the problem statement and a 10-line usage example, before any architecture discussion. Architecture lives lower down or in this document.
- The renderer package has its own README covering just the tool's API, so it reads correctly if extracted to its own repo later.

Reviewers should be able to understand what the project is and see it working within about ninety seconds of landing on the repo.

## Sequencing

Rough build order, smallest testable slices first:

1. Repo scaffold: pnpm workspace, two packages, TypeScript configured, demo importing renderer as a workspace dependency and rendering "hello".
2. Types and validation: `CmsConfig`, `Block`, the Zod schema, `validate.ts`.
3. Registry with correct generic typing. Type-level tests for the guarantees.
4. `Renderer` component: lookup, render, fallback. Runtime tests.
5. Demo: two or three real configs, real blocks, deployed.
6. READMEs: root (problem + usage + demo link), renderer package (API reference).
7. Polish: an architecture diagram in the root README, a short "why this exists" paragraph, contribution notes if any.

Ship after step 5 is complete enough to link. Steps 6 and 7 make it *presentable*; step 5 makes it *real*.

## Addendum (August 2026)

Decisions made after this document was written, superseding the sections above where they conflict:

- **Name**: the package is `blockprint` (framework-agnostic, so the `next-` prefix was wrong; "CMS" undersold the admin-kit use case).
- **Per-block schemas are in v1.** Registration accepts `{ component, schema? }`; the schema's output is the source of truth and the component must accept it. Parsed output becomes the rendered props, so schema defaults/coercions apply. Motivated by production experience: CMS payloads betray their types at runtime.
- **Standard Schema instead of a zod dependency.** The schema slot is typed as `StandardSchemaV1` (vendored, ~50 lines), so zod/valibot/arktype all work and the library has zero runtime dependencies. The outer config validation is hand-rolled. Async schemas route to the fallback.
- **Two config types.** `BlockConfig` (open, untrusted, what `Renderer` accepts as `unknown`) and `ConfigFor<R>` (closed, derived from the registry, for configs authored in TypeScript — the admin-kit dashboard case).
- **Public surface**: runtime `createRegistry`, `Renderer`, `parseConfig`, `ConfigError`; types `Registry`, `BlockConfig`, `ConfigFor`, `FallbackProps`, `BlockDef`, `BlocksShape`, `StandardSchemaV1`.
- **Known consumer roadmap**: the Next.js demo (untrusted-JSON mode) and the admin starter kit's dashboard/vertical-profile configs (authored-config mode), which will consume blockprint from npm once published.
