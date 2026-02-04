# DSL Authoring

## Tracks
- App track: plugin-specific TrackBuilders
- Device track: device actions
- Camera track: camera movements
- Audio track: background music and sound effects
- OS track: notifications, time, battery

## Repo Paths
- DSL core: `packages/dsl/src/v2`
- Camera DSL: `packages/dsl/src/v2/camera-track.ts`
- Audio DSL: `packages/dsl/src/v2/audio-track.ts`
- OS DSL: `packages/dsl/src/v2/os-track.ts`

## Authoring Tips
- Keep event order stable by using builder APIs consistently.
- Avoid mixing device IDs without clear intent.
- Prefer explicit timings for complex sequences.
