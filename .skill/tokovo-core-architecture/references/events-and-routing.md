# Events and Routing

## Track Events vs Runtime Events
- **Track events**: authoring-time events emitted by DSL (`@tokovo/ir`).
- **Runtime events**: execution-time events processed by reducers (`@tokovo/core`).

## Routing via eventKinds
- Plugins declare `eventKinds` in the plugin contract.
- Reducer registry maps event kind → appId.
- Missing or duplicate kinds are contract violations.

## System Kinds (No eventKinds Required)
Some kinds are handled by built-ins / feature reducers and are not routed via `eventKinds`:
- `DEVICE`, `CAMERA`, `AUDIO`, `VOICE`, `OS`, `CALL`, `KEYBOARD`, `OVERLAY`

## Repo Paths
- Track events: `packages/ir/src/v2/track-event.ts`
- Runtime events: `packages/core/src/types/runtime-event.ts`
- Reducer registry: `packages/core/src/engine/registry.ts`
