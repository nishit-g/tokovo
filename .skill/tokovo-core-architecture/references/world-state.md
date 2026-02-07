# WorldState

## Shape (Top Level)
- `devices`: device states keyed by device ID.
- `appState`: per-app state buckets (type-safe via module augmentation).
- `camera`: base camera state.
- `audio`: audio state.
- `config`: optional video config.

## Repo Paths
- `packages/core/src/types/world-state.ts`
- `packages/core/src/types/camera.ts`
- `packages/core/src/types/audio.ts`

## App State Registry
Plugins augment `AppStateMap` in `@tokovo/core` to get typed access.

## System State (Non-App)
Some system features store state inside `appState` under reserved keys:
- `sys_overlay` (story overlays)

This is a pragmatic v1 choice (keeps WorldState stable) but the invariants matter:
- Single source of truth: renderer reads state only from WorldState.
- Deterministic ids/timing.
