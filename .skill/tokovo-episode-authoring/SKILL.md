---
name: tokovo-episode-authoring
description: Episode authoring with the Tokovo DSL, including track building, timing/frames, deterministic authoring, and debugging. Use when creating or reviewing episodes, adding tracks, or troubleshooting event ordering.
---

# Tokovo Episode Authoring

## Overview
Create and maintain Tokovo episodes with deterministic DSL patterns. Use this skill for episode structure, track authoring, timing/frames, and debugging.

## Quick Start
1. Start with `defineEpisode` and a clear `meta` + `config`.
2. Use the DSL to create devices and tracks.
3. Validate timing in frames/seconds and keep event order deterministic.
4. Test in studio or video runner.

## Authoring Checkpoints
- **Determinism**: no `Date.now()`/`Math.random()` in authoring logic.
- **Event order**: use `_declarationOrder` and consistent builder patterns.
- **Timing**: prefer explicit frames or `parseTimeToFrames` semantics.

## Decision Tree
- Need structure or config guidance? See `references/episode-structure.md`.
- Need DSL usage? See `references/dsl-authoring.md`.
- Need timing rules? See `references/timing-and-frames.md`.
- Need patterns? See `references/patterns.md`.
- Need QA/debug? See `references/qa-and-debug.md`.

## References
- `references/episode-structure.md`
- `references/dsl-authoring.md`
- `references/timing-and-frames.md`
- `references/patterns.md`
- `references/determinism.md`
- `references/qa-and-debug.md`
