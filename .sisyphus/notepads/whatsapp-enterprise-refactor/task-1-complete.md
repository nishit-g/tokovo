## Task 1: Unify Anchor Registry - COMPLETED

**Timestamp**: 2026-01-26T08:59:00.000Z

### What Was Done

- Replaced packages/device-camera/src/anchors/registry.ts with re-exports from @tokovo/core
- Removed duplicate Map instance (split brain bug fixed)
- Preserved module docstring explaining the architectural fix

### Verification Results

✅ `pnpm build` passed in device-camera
✅ No duplicate Map instances (grep returned 0)
✅ All anchor registry functions re-exported correctly
✅ TypeScript compiles with 0 errors

### Files Changed

- `packages/device-camera/src/anchors/registry.ts` (111 lines deleted, 29 added)

### Bug Fixed

**Split Brain Anchor Registry**: Previously, PluginManager registered anchor providers in core's Map, but useCameraEngine read from device-camera's separate Map. This caused focus/track camera effects to fail silently because anchors weren't visible to the camera system.

Now there's a SINGLE source of truth in @tokovo/core.

### Next Task

Task 2: Create Theme Context Provider (parallelizable with Task 1)
