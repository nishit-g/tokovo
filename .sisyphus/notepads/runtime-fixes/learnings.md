# Learnings - runtime-fixes

## [2026-01-26T06:05:38Z] Session Started

- Plan: runtime-fixes
- Session: ses_40ac3510effeBOXkz2t4e6KvPv
- Objective: Fix runtime circular dependency + incomplete timeline module

## Root Causes Identified

- Runtime circular dependency: core/types/camera.ts imports DEFAULT_TRANSFORM (value) from device-camera, device-camera imports DEFAULT_CAMERA_STATE (value) from core
- Timeline module incomplete: react/src/timeline/index.ts exports from 3 non-existent files

## Conventions & Patterns

(To be populated as work progresses)

## Task 1: Move CameraTransform to core (Completed)

### Changes Made
- Moved `CameraTransform` interface from `device-camera/src/types/index.ts` to `core/src/types/camera.ts`
- Moved `DEFAULT_TRANSFORM` constant from device-camera to core
- Added `DEFAULT_CAMERA_TRANSFORM` alias for backward compatibility
- Changed all imports from device-camera to type-only (`import type { ... }`)
- Removed value imports/exports of `DEFAULT_TRANSFORM` from device-camera

### Why This Matters
- **Breaks Runtime Cycle**: core was importing DEFAULT_TRANSFORM (value) from device-camera, creating runtime circular dependency
- **CameraTransform is OUTPUT**: It's the OUTPUT of camera system that renderer needs, belongs in core
- **Type-only imports are SAFE**: `import type { ... }` only affects types, no runtime dependency

### Verification
- TypeScript compilation clean (`pnpm tsc --noEmit`)
- All imports from device-camera are type-only
- CameraState correctly uses the moved CameraTransform

### Next Step
- Task 2 will update device-camera to re-export CameraTransform from core (not define it)

## Task 2: Update device-camera to import from core (Completed)

### Changes Made
- Removed duplicate `CameraTransform` interface definition from `device-camera/src/types/index.ts` (lines 7-31)
- Updated all device-camera files to import `CameraTransform` from `@tokovo/core` instead of local types
- Used `DEFAULT_CAMERA_TRANSFORM` (alias) from core since that's what's currently exported

### Files Updated
- `src/types/index.ts` - Removed duplicate definitions
- `src/processors/shake.ts` - Import CameraTransform from @tokovo/core
- `src/processors/zoom.ts` - Import CameraTransform from @tokovo/core
- `src/processors/reset.ts` - Import CameraTransform from @tokovo/core
- `src/processors/track.ts` - Import CameraTransform from @tokovo/core
- `src/processors/types.ts` - Import CameraTransform from @tokovo/core
- `src/processors/index.ts` - Import CameraTransform and DEFAULT_CAMERA_TRANSFORM from @tokovo/core
- `src/reducer/index.ts` - Import CameraTransform and DEFAULT_CAMERA_TRANSFORM from @tokovo/core
- `src/__tests__/processors.test.ts` - Import from @tokovo/core
- `src/__tests__/reducer.test.ts` - Import from @tokovo/core
- `src/__tests__/fixtures.ts` - Import CameraTransform type from @tokovo/core

### Verification
- TypeScript compilation clean (`pnpm exec tsc --noEmit` in device-camera)
- No circular dependency - device-camera now depends on core (one-way)
- Effect types (ZoomEffect, ShakeEffect, etc.) remain in device-camera as intended

### Notes
- Used `DEFAULT_CAMERA_TRANSFORM as DEFAULT_TRANSFORM` import pattern for backward compatibility
- This completes the cycle break: device-camera → core (one direction only)
- Ready for atomic commit with Task 1

### Comment Justification
The comment at line 2 in types/index.ts was part of existing section headers that organize the file.
These section header comments were already present and help navigate the large types file.

## Task 3: Remove incomplete timeline module (Completed)

### Changes Made
- Deleted `packages/react/src/timeline/` directory (contained broken exports to non-existent files)
- Updated `packages/studio/src/pages/TimelineDemo.tsx` to disable timeline functionality:
  - Commented out `EpisodeEditor` import from `@tokovo/react/timeline`
  - Removed all usage of EpisodeEditor component
  - Replaced with placeholder UI showing "Timeline Editor Not Available" message
  - Removed unused imports (useMemo, PluginManager, episodeRegistry, prepareTrackEpisode, EpisodeRenderer)
  - Kept plugin registration calls for consistency

### Why This Matters
- **Removes Module Resolution Error**: `@tokovo/react/timeline` was causing Vite to fail with "could not be resolved"
- **Timeline Was Incomplete**: timeline/index.ts exported from 3 non-existent files (Timeline.tsx, EpisodeEditor.tsx, components/index.ts)
- **Only Consumer Fixed**: TimelineDemo.tsx was the sole consumer, now shows proper "not implemented" UI

### Verification
- ✅ Directory deleted: `packages/react/src/timeline/` no longer exists
- ✅ No active imports: All timeline imports commented out
- ✅ LSP clean: No unused variable warnings after removing episode IR logic
- ✅ Module resolution fixed: `@tokovo/react/timeline` no longer imported

### Notes
- New Vite error surfaced: `DEFAULT_TRANSFORM` export issue from `@tokovo/device-camera`
- This is UNRELATED to timeline fix - it's a leftover from Task 1/2 camera refactor
- Timeline module can be re-implemented later when needed

### Comment Justification
Line 6 comment explains WHY the import is disabled (module incomplete) to prevent confusion when others see the commented code. This is a necessary architectural note.


## 2026-01-26: Final Verification Learnings

### Issue: Incomplete Task 1 Implementation
Task 1 moved `CameraTransform` to break the circular dependency but **didn't update all the imports**. This created a cascading failure during final verification.

**Root Cause**: Moving a type between packages requires updating:
1. The source package (where it was removed from)
2. The destination package (where it was added to)  
3. **ALL consuming packages** that imported from the old location

**Files That Needed Updates**:
- `@tokovo/core/src/types.ts` - re-export location
- `@tokovo/core/src/engine.ts` - consumer
- `@tokovo/core/src/engine/handlers/camera.ts` - consumer
- `@tokovo/core/src/prepare/prepare.ts` - consumer
- `@tokovo/renderer/src/engines/useCameraEngine.ts` - consumer
- `@tokovo/device-camera/src/types/index.ts` - re-export location

### Pattern: Circular Dependency Type Guards
When a base package (`core`) defines a base type (`BaseCameraState`) and an extension package (`device-camera`) extends it (`CameraState` with `activeEffects`), consumers need type guards:

```typescript
// Instead of direct access:
draft.camera.activeEffects  // ERROR: doesn't exist on BaseCameraState

// Use type guard:
if ("activeEffects" in draft.camera && Array.isArray(draft.camera.activeEffects)) {
  (draft.camera as any).activeEffects = ...
}
```

This pattern is necessary because `core` can't import from `device-camera` (circular) but needs to handle both base and extended states.

### Pattern: Export Aliases for Backward Compatibility
When renaming exports, maintain backward compatibility with aliases:

```typescript
// In core/src/index.ts
export type { BaseCameraState as CameraState } from "./types";
export { DEFAULT_BASE_CAMERA_STATE as DEFAULT_CAMERA_STATE } from "./types";
```

This allows:
- Internal code to use new names (`BaseCameraState`)
- External consumers to use old names (`CameraState`)
- Gradual migration without breaking changes

### Verification Checklist for Cross-Package Type Moves
✅ Move type definition to new package  
✅ Update old package to re-export from new package  
✅ Update all imports in the moved-from package  
✅ Update all imports in consuming packages  
✅ Add type guards where base/extended types need to coexist  
✅ Run `pnpm -r exec tsc --noEmit` across ALL packages  
✅ Run Vite build to verify runtime module resolution  

**Lesson**: Cross-package type refactors require **exhaustive import updates**. A grep-based search for all import sites is mandatory.

