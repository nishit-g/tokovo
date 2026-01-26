# Issues - cyclic-dep-fix

## [2026-01-25T22:18:00Z] Session Started

## Known Problems

- registry.ts was deleted during camera-plugin-migration
- core/src/anchors/registry.ts imports from device-camera (broken)
- core/src/index.ts lines 37-40 re-export missing functions
- anchors.test.ts imports from deleted ../anchors/registry
- ViewLayoutMode duplicated in types.ts and types/camera.ts
- Implicit any at reducer/index.ts:238

## Gotchas

(To be populated as work progresses)
