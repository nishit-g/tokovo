# DSL Authoring

## Tracks
- App track: plugin-specific TrackBuilders
- Device track: device actions
- Camera track: camera movements
- Audio track: background music and sound effects
- OS track: notifications, time, battery
- Overlay track: hook/captions/receipts (story layer rendered above devices)

## Repo Paths
- DSL core: `packages/dsl/src/v2`
- Camera DSL: `packages/dsl/src/v2/camera-track.ts`
- Audio DSL: `packages/dsl/src/v2/audio-track.ts`
- OS DSL: `packages/dsl/src/v2/os-track.ts`
- Overlay DSL: `packages/dsl/src/v2/overlay-track.ts`
- Creator sugar (recommended import): `packages/creator/src/index.ts`

## Authoring Tips
- Prefer `@tokovo/creator`:
  - `ep.whatsapp(deviceId, conversationId, fn)`
  - `ep.x(deviceId, fn)`
  - `ep.imessage(deviceId, conversationId, fn)`
- Keep event order stable by using builder APIs consistently.
- Avoid mixing device IDs without clear intent.
- Prefer explicit timings for complex sequences.
