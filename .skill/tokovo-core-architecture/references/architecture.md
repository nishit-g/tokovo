# Core Architecture Overview

## Pipeline

```mermaid
flowchart LR
  A[Track Events] --> B[Lowering]
  B --> C[Runtime Events]
  C --> D[Reducer]
  D --> E[WorldState]
  E --> F[UI Views]
  E --> G[Anchors]
  C --> H[System Features (Device/Audio/Notifications/Overlay)]
```

## Key Repo Paths
- Plugin contract: `packages/core/src/types/plugin-contract.ts`
- Runtime event types: `packages/core/src/types/runtime-event.ts`
- Track event types: `packages/ir/src/v2/track-event.ts`
- WorldState: `packages/core/src/types/world-state.ts`
- Plugin manager and registries: `packages/core/src/plugin` and `packages/core/src/engine/registry.ts`

## Contract Invariants
- **eventKinds** must be declared and unique across plugins.
- **WorldState** is the only source of truth for rendering.
- **Determinism** is required for reproducible render and caching.
