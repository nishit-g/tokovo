# X VNext Implementation Plan

Architecture: [`X_VNEXT_ARCHITECTURE.md`](./X_VNEXT_ARCHITECTURE.md)

## Non-negotiable cut line

The implementation replaces `@tokovo/apps-x` in place. There is no V1/V2 runtime switch and no migration reducer. During the change, every repository-owned X episode and test moves to the canonical contract. Stale source files and exports are deleted before completion.

## Stage 1 — canonical core

- [x] introduce schema version 2 normalized state and authoring snapshot contracts
- [x] validate every entity shape, finite timestamp, enum, duplicate ID, and reference
- [x] hydrate once; remove reducer normalization and fallback creation
- [x] add strict runtime payload guards and stable `X_*` failure codes
- [x] split required selectors from optional `find*` selectors
- [x] remove frame-as-Unix-time behavior
- [x] update plugin version and public exports
- [x] prove bootstrap, reducer, selector, and lowering failures

Exit: malformed or incomplete X data cannot enter or survive in runtime state.

## Stage 2 — experience and UI system

- [x] add experience resolver for platform, app appearance, X palette, and locale
- [x] add X-owned typography, spacing, motion, icon, material, and accessibility recipes
- [x] add light, dim, and lights-out experiences
- [x] add English, Arabic, and Hindi localization with deterministic date/number formatters
- [x] replace the monolithic component file with app primitives and domain components
- [x] rebuild timeline, post detail, compose, notifications, profile, DM inbox, and DM thread
- [x] add finished empty, failure, retry, media, poll, and typing states
- [x] remove storybook-specific UI code and all placeholder visual paths from curated episodes

Exit: every supported surface is visually finished on iOS and Android at supported widths.

## Stage 3 — layout and cinematics

- [x] build canonical post and message measurement functions shared by layout and painters
- [x] implement visible-window projection with overscan and explicit scroll state
- [x] publish versioned entity anchor helpers
- [x] replace singleton cinematic subjects with entity-addressable subjects
- [x] prove subject rectangles match layout rectangles exactly
- [x] prove absent or off-window subjects fail without geometry fallback

Exit: camera direction can target any visible X entity without app-specific pixel guesses.

## Stage 4 — integrations and episodes

- [x] rebuild typed DSL actions around explicit IDs and epoch-millisecond timestamps
- [x] add complete semantic notification content and deep-link targets
- [x] add X-owned audio rules and asset collection
- [x] replace the old flagship with `x-cinematic-flagship`
- [x] replace the old exhaustive and storybook episodes with `x-interaction-matrix-vnext` and `x-native-theme-matrix-vnext`
- [x] direct camera moves only after layout/anchors stabilize
- [x] use approved checked-in media/backgrounds and deliberate generated identity treatments

Exit: the package explains itself through one excellent short film and one exhaustive proof episode.

## Stage 5 — hardening and deletion

- [x] 10k-post timeline benchmark
- [x] 10k-message DM benchmark
- [x] arbitrary frame-order-compatible canonical replay
- [x] two-browser determinism matrix
- [x] iOS/Android theme-locale render matrix
- [x] visually review flagship and theme proof frames
- [x] delete every stale X source, export, and curated episode
- [x] update public architecture/package docs
- [x] pass solution typecheck, lint, render proof, and release gate through mise
- [x] commit as one intentional X VNext hard cut

Exit: no legacy implementation remains and the public package surface matches the documentation.

## Efficient verification cadence

Use cheap, relevant checks during development:

1. package tests for touched runtime/layout code
2. package typecheck after contract or UI slices
3. selected still frames after each complete screen group
4. determinism probes after the final episode stabilizes
5. one release gate at the end

Do not preserve a bad screenshot merely to keep a golden green.
