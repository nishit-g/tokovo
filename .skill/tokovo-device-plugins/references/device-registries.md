# Device Registries

## Responsibilities
- Maintain device state and profiles.
- Provide device dimensions for layout and anchoring.

## Repo Paths
- Device registries: `packages/devices/src`
- Runtime wiring: `apps/video-runner/src/runtime.ts`

## OS-Level Anchor Ownership (Official)
Device-owned anchors are provided by `app_device` and merged into every app snapshot:
- `device`, `app`, `keyboard`, `dynamicIsland`, `notification_banner`

Repo paths:
- Provider: `packages/core/src/anchors/device-provider.ts`
- Merge behavior: `packages/core/src/anchors/registry.ts`
