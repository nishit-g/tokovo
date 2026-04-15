# Runtime Bootstrap

Tokovo has one supported runtime bootstrap flow.

Reference ADRs:

- `docs/adr/0001-runtime-contract.md`
- `docs/adr/0002-app-package-boundaries.md`

## Canonical Path

1. Resolve the catalog profile: `release` or `studio`
2. Create registries with `createTokovoRuntime()` from `@tokovo/episodes`
3. Register plugins through the runtime manifest in `packages/episodes/src/runtime/plugin-manifest.ts`
4. Resolve episodes from the profile-specific catalog module
5. Prepare tracks with `prepareTrackEpisode()` from `@tokovo/compiler`
6. Replay through `replayIncremental()` in `@tokovo/core`

## Catalog Profiles

- `release`: stories and approved v2 baseline episodes only
- `studio`: release plus showcases and tests

## Rules

- Tests should use the same runtime bootstrap as production and only override test-specific inputs.
- Render-service must call library APIs, not CLI entrypoints, when it needs asset refs or render data.
- App/plugin registration belongs in the manifest, not in ad hoc handwritten call sequences across apps.
- New runtime packages should join the manifest and the profile catalogs explicitly.
