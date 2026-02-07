# Troubleshooting (Overlays)

## Overlay doesn't show
- Confirm overlay plugin is registered:
  - `registerOverlayPlugin(tokovoRegistries.engine)` in `apps/video-runner/src/runtime.ts`
- Confirm you are using `@tokovo/creator` v2 DSL: `.overlay((ov) => ...)`
- Run `pnpm --filter video-runner test` and check `v2-overlay-baseline` is in the smoke list.

## Overlay shows but timing feels off
- Prefer explicit `durationFrames` for hooks/captions (avoid relying on defaults until you like them).
- Avoid mixing fps; use the episode fps consistently.

## Overlay jitters
- Ensure your overlay visuals don't depend on randomness or wall-clock time.
- Keep animations purely frame-derived.

