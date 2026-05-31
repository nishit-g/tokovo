# V1 Stability Checklist

This checklist defines the current minimum bar for calling Tokovo v1-ready.

## Release Gates

Canonical command:

- `pnpm verify:release`

1. Relevant package builds pass.
2. Relevant package tests pass.
3. `@tokovo/episodes` validates the workspace.
4. `video-runner` builds cleanly.
5. At least one real render path is verified through `video-runner` or `@tokovo/render-service`.
6. Static episode asset references are validated.
7. Docs reflect the current bootstrap model, catalog taxonomy, and plugin boundaries.
8. Public release docs, templates, license, and security reporting paths are in place.

## Product-Quality Gates

### Episode Catalog

- curated catalogs contain only new enterprise episodes
- each visible episode has one clear job
- flagship, exhaustive, system, and story catalogs all render

### Bootstrap Correctness

- `device()` only defines device and OS state
- `snapshot()` and `view()` are plugin-owned
- plugins validate and hydrate their own bootstrap contracts
- compiler does not invent app-domain state

### Runtime Integrity

- runtime event kinds are globally unique across plugins
- runtime registration is explicit
- replay is deterministic for the same authored input and frame

### Render Integrity

- device chrome scales from device metrics, not ad hoc pixel constants
- keyboard/input clears and lifts correctly
- notifications and system overlays do not rely on fake fallback content
- safe areas, status bar, Dynamic Island, lockscreen, and call surfaces render coherently

## Current Multilingual Bar

Tokovo is not v1-complete for multilingual content until all of the following are true:

1. grapheme-safe typing and deletion are correct
2. RTL direction is supported through major app shells
3. UI does not depend on Latin-only initials or forced uppercase assumptions
4. font fallback works for emoji, Indic scripts, Arabic, and CJK-heavy episodes

## Stability Invariants

1. Same authored input and same frame produce the same runtime state.
2. Core replay remains headless and deterministic.
3. Runtime registration stays explicit.
4. Renders are driven entirely from checked-in code and assets.
5. App semantics remain plugin-owned.
