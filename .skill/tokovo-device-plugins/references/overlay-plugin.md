# Overlay Plugin (System Layer)

Overlays are not an app. They are a system feature reducer that consumes runtime events of kind `OVERLAY`.

## Repo Paths
- Overlay package: `packages/overlay/src`
- Registration: `packages/overlay/src/plugin.ts` (`registerOverlayPlugin`)
- Reducer/state: `packages/overlay/src/reducer.ts`, `packages/overlay/src/state.ts`
- Runtime wiring: `apps/video-runner/src/runtime.ts`

## Authoring
Creators use the v2 DSL:
- `ep.overlay((ov) => ov.at("0s").hook("..."))`

Repo path:
- DSL: `packages/dsl/src/v2/overlay-track.ts`

