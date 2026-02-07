# Runtime + State (OVERLAY)

## IR and lowering
- IR kind: `OVERLAY` (`@tokovo/ir`)
- Lowered to runtime kind: `OVERLAY` (`@tokovo/core`)

Repo paths:
- IR payloads/events: `packages/ir/src/v2/payloads.ts`, `packages/ir/src/v2/track-event.ts`
- Lowering: `packages/compiler/src/v2/lowering.ts`
- Runtime event type: `packages/core/src/types/runtime-event.ts`

## Reducer
Overlay is implemented as a feature reducer (not app reducer):
- Registers via `registries.reducers.registerFeatureReducer("OVERLAY", ...)`

Repo paths:
- Feature reducer: `packages/overlay/src/reducer.ts`
- Registration: `packages/overlay/src/plugin.ts`
- Runtime wiring: `apps/video-runner/src/runtime.ts`

## State shape
Stored at:
- `world.appState.sys_overlay = { items: OverlayItem[] }`

Replacement policy:
- One active item per `lane` for determinism.

