# ADR 0001: Runtime Contract

## Status

Accepted

## Decision

Tokovo has one supported runtime contract:

1. Resolve a curated catalog profile from `@tokovo/episodes`
2. Create registries with `createTokovoRuntime()`
3. Register runtime packages through package-owned manifest fragments
4. Resolve episode definitions from the selected catalog
5. Prepare authored tracks with `prepareTrackEpisode()` from `@tokovo/compiler`
6. Replay through `replayIncremental()` in `@tokovo/core`

## Rules

- `prepareEpisode()` is removed and must not return.
- Runtime registration stays explicit. No filesystem discovery, no package.json scanning, no import-time side effects.
- Tests must consume the same bootstrap path as production and only override test inputs.
- Render-service must consume library APIs, not CLI subprocess entrypoints, when preparing render data.
- `release` is the product-safe catalog. `studio` is an explicitly wider internal profile.

## Consequences

- Contributors have one bootstrap path to debug.
- Compiler, runtime, render-service, and tests share the same assumptions.
- Failing registration or missing catalog entries becomes a hard, diagnosable error instead of implicit behavior.
