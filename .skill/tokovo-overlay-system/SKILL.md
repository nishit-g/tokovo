---
name: tokovo-overlay-system
description: "Tokovo overlays (story layer): overlay DSL, IR/runtime event kind OVERLAY, reducer/state, and renderer composition. Use when adding hook/caption/receipt primitives, changing overlay visuals, or debugging overlay timing/determinism."
---

# Tokovo Overlay System

## Overview
Overlays are a **system layer** rendered above devices (not affected by camera). Creators author them with `.overlay((ov) => ...)`.

## Quick Start (Authoring)
1. In an episode, add:
   - `ep.overlay((ov) => ov.at(\"0s\").hook(\"...\") ...)`
2. Keep durations deterministic:
   - Prefer `durationFrames` or use defaults per variant.
3. Run `pnpm --filter video-runner test` (smoke suite includes overlay baseline).

## Architecture Checkpoints
- **Event kind**: `OVERLAY` is a system kind (not app-routed).
- **Reducer**: feature reducer registered as `registries.reducers.registerFeatureReducer(\"OVERLAY\", ...)`.
- **State**: stored under `world.appState.sys_overlay` (single source of truth).
- **Renderer**: overlay UI is composed above devices.
- **Determinism**: no wall-clock time; IDs default to frame + order.

## Decision Tree
- Need to add a new overlay primitive? See `references/primitives.md`.
- Need to change visuals? See `references/renderer-layering.md`.
- Overlay not showing? See `references/troubleshooting.md`.

## References
- `references/primitives.md`
- `references/runtime-and-state.md`
- `references/renderer-layering.md`
- `references/troubleshooting.md`

