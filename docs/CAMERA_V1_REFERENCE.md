# Tokovo Camera V1 Reference

Last updated: 2026-02-05

## V1 Principles

- Decoupled architecture: camera depends on `@tokovo/core` contracts only.
- Track-first choreography: use long `track()` spans with sparse interrupt `focus()`.
- Semantic anchors only: no unstable `message-N` anchors in production/showcases.
- Deterministic execution: canonical effect names and strict lowering.

## Breaking Changes

1. `track(..., { lag })` removed.
Use `track(..., { smoothing })`.
2. Canonical effect names only:
`focus`, `track`, `zoom`, `shake`, `reset`, `punch-zoom`, `dutch-tilt`, `flash`, `whip-pan`.
3. Reducer aliases `anchor-focus` and `anchor-track` removed.
4. Unknown camera/device event types now fail fast in lowering.

## Track V1 Controls

```ts
cam.span("2s", "12s").track("lastMessage", {
  scale: 1.12,
  smoothing: 0.2,
  deadZonePx: 12,
  maxVelocityPxPerSec: 900,
  predictiveLookaheadFrames: 2,
});
```

- `smoothing`: interpolation intensity.
- `deadZonePx`: ignore micro jitter near target.
- `maxVelocityPxPerSec`: clamp tracking speed per frame.
- `predictiveLookaheadFrames`: lead motion slightly for bursty messaging.

## Camera DX CLI

```bash
tokovo-camera lint packages/episodes/src
tokovo-camera doctor
tokovo-camera preview packages/episodes/src/production/whatsapp-to-x.episode.ts
tokovo-camera migrate-v1 packages/episodes/src
```

## Live Camera Debug (Preview)

Enable live camera telemetry in `apps/video-runner`:

```bash
TOKOVO_CAMERA_DEBUG=1 pnpm --filter video-runner dev
```

When enabled, the preview shows:
- current camera transform (`scale`, `origin`, `translate`, `rotation`, `shake`)
- active camera effect type
- current requested/resolved anchor
- a red box around the currently focused/tracked anchor
- fallback indicator when anchor resolution falls back

## Multiple Devices vs Multiple Cameras

- Multi-device rendering is supported today (split, vertical split, pip layouts).
- Independent multi-camera timelines (separate camera engines per device at the same time) are not a first-class DSL/runtime feature yet.
- Current model uses one camera state with active device/layout control, while renderer can display multiple devices.

## CI Gates

- `pnpm camera:lint`
- `pnpm camera:bench`
- `pnpm camera:ci`

`camera:ci` must pass for merge.
