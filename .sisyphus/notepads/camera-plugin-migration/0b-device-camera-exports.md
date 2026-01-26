# @tokovo/device-camera Export Dependencies - Mapping Results

**Task:** Map all files importing from `@tokovo/device-camera`  
**Date:** 2026-01-26  
**Method:** grep search across packages/

---

## Summary Statistics

- **Total import sites:** 8 files
- **Critical runtime imports:** 4 files (core, renderer, compiler)
- **Example/documentation:** 3 files (dsl/examples)
- **Build artifacts:** 1 file (device-camera/dist - ignored)

---

## Critical Runtime Imports (Production Code)

### 1. Renderer: useCameraEngine.ts (MOST CRITICAL)

**File:** `packages/renderer/src/engines/useCameraEngine.ts:21-42`

**Imports:**

```typescript
import {
  // Types
  CameraEffect,
  CameraTransform,
  DEFAULT_TRANSFORM,
  CameraState, // ← DUPLICATE TYPE (from device-camera)

  // Processors
  processActiveEffects,

  // Anchors
  AnchorSnapshot,
  getAnchorsForApp,

  // Director-Lite
  deriveDirectorEffects,
  extractSignals,
  convertToEffects,

  // Utils
  lerp,
} from "@tokovo/device-camera";
```

**Impact:**

- **CRITICAL BREAKAGE RISK:** Imports `CameraState` from device-camera (the duplicate)
- Uses DirectorLite functions (`deriveDirectorEffects`, `extractSignals`)
- Uses effect processors (`processActiveEffects`)
- Uses anchor system (`getAnchorsForApp`, `AnchorSnapshot`)
- **After deletion:** Will need to import `CameraState` from `@tokovo/core` instead

**DirectorLite Usage:**

- Line 36: `deriveDirectorEffects` - Auto-camera generation
- Line 37: `extractSignals` - Event signal extraction
- Line 38: `convertToEffects` - Effect conversion (unused in grep, may be dead code)

---

### 2. Core: types/camera.ts (Type Re-exports)

**File:** `packages/core/src/types/camera.ts:15-34`

**Imports:**

```typescript
// Re-export all camera types from device-camera
export type {
  CameraEffect,
  CameraEffectType,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  CameraTransform,
  EasingType,
} from "@tokovo/device-camera";

export { DEFAULT_TRANSFORM } from "@tokovo/device-camera";
export { DEFAULT_TRANSFORM as DEFAULT_CAMERA_TRANSFORM } from "@tokovo/device-camera";

// Import types for use in CameraState
import type { CameraEffect, CameraTransform } from "@tokovo/device-camera";
import { DEFAULT_TRANSFORM } from "@tokovo/device-camera";
```

**Purpose:**

- ✅ **CORRECT USAGE:** Re-exports effect types (these belong in device-camera)
- ✅ **CORRECT USAGE:** Imports `CameraEffect`, `CameraTransform` for use in core's `CameraState` definition
- Core's `CameraState` uses device-camera's effect types (correct dependency direction)

**Notes:**

- This is the INTENDED relationship:
  - Core defines `CameraState` structure
  - Core imports effect types from device-camera
  - Device-camera should NOT define `CameraState`

---

### 3. Core: types.ts (Duplicate Re-exports)

**File:** `packages/core/src/types.ts:591-607`

**Imports:**

```typescript
// Re-export camera types from device-camera (single source of truth)
export type {
  EasingType,
  CameraEffect,
  CameraEffectType,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  CameraTransform,
} from "@tokovo/device-camera";

export { DEFAULT_TRANSFORM as DEFAULT_CAMERA_TRANSFORM } from "@tokovo/device-camera";

// Import for use in CameraState
import type { CameraEffect, CameraTransform } from "@tokovo/device-camera";
import { DEFAULT_TRANSFORM } from "@tokovo/device-camera";
```

**Status:**

- ⚠️ **DUPLICATE:** Same re-exports as `types/camera.ts`
- ⚠️ **LEGACY COMPATIBILITY:** Exists for backward compatibility
- **After cleanup:** Should import from `./types/camera` instead of re-exporting directly

---

### 4. Core: index.ts (Public API Re-exports)

**File:** `packages/core/src/index.ts:23-50`

**Imports:**

```typescript
export {
  cameraReducer,
  cameraV2Lowering,
  CAMERA_EVENT_TYPES,
  processActiveEffects,
  registerCameraProcessor,
  applyEasing,
  easingFunctions,
  lerp,
  seededRandom,
  getPreset,
  getShotPreset,
  composeTimeline,
  getPresetNames,
  registerAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  resolveAnchorWithFallback,
  resolveAnchorFully,
} from "@tokovo/device-camera";

export type {
  CameraPreset,
  CameraTarget,
  CameraTimeline,
  TimelineStep,
  ShotPresetId,
} from "@tokovo/device-camera";
```

**Purpose:**

- ✅ **CORRECT USAGE:** Public API re-exports from device-camera
- Exposes camera utilities, reducers, and preset system
- **NO CHANGES NEEDED:** These are legitimate device-camera exports

**Key Exports:**

- **Reducers:** `cameraReducer`, `cameraV2Lowering`
- **Effect Processing:** `processActiveEffects`, `registerCameraProcessor`
- **Anchors:** `registerAnchorProvider`, `getAnchorsForApp`, etc.
- **Presets:** `getPreset`, `getShotPreset`, `composeTimeline`
- **Utils:** `applyEasing`, `easingFunctions`, `lerp`, `seededRandom`

---

### 5. Core: engine/handlers/camera.ts (Runtime Handler)

**File:** `packages/core/src/engine/handlers/camera.ts:10`

**Imports:**

```typescript
import { cameraReducer } from "@tokovo/device-camera";
```

**Purpose:**

- ✅ **CORRECT USAGE:** Uses device-camera's reducer for effect processing
- Handles CAMERA events in the replay engine
- **NO CHANGES NEEDED**

---

### 6. Core: anchors/registry.ts (Facade)

**File:** `packages/core/src/anchors/registry.ts:10-21`

**Imports:**

```typescript
import {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  clearAnchorProviders,
  type AnchorProvider,
  type AnchorSnapshot,
  type AnchorFraming,
} from "@tokovo/device-camera";
```

**Purpose:**

- ✅ **CORRECT USAGE:** Facade delegating to device-camera's anchor system
- Backward compatibility layer
- **NO CHANGES NEEDED**

**Comment (line 4):**

> "Delegates all operations to @tokovo/device-camera"

---

### 7. Core: engine.ts (Legacy Type Import)

**File:** `packages/core/src/engine.ts:187`

**Imports:**

```typescript
import type { CameraTransform } from "@tokovo/device-camera";
```

**Purpose:**

- ✅ **CORRECT USAGE:** Type-only import for camera transform
- Used for legacy camera format handling
- **NO CHANGES NEEDED**

**Comment (line 187):**

> "Handle legacy camera format { type, appId } vs new CameraState"

---

### 8. Compiler: v2/lowering.ts (DSL Compilation)

**File:** `packages/compiler/src/v2/lowering.ts:42`

**Imports:**

```typescript
import { cameraV2Lowering } from "@tokovo/device-camera";
```

**Purpose:**

- ✅ **CORRECT USAGE:** Delegates camera track lowering to device-camera
- Converts TrackEvent → RuntimeEvent
- **NO CHANGES NEEDED**

**Comment (line 46):**

> "Camera lowering is now delegated to @tokovo/device-camera"

---

## Example/Documentation Imports (Non-Critical)

### 9-11. DSL Examples (dsl/examples/)

**Files:**

1. `packages/dsl/examples/manual-camera-showcase.dsl.ts`
2. `packages/dsl/examples/semantic-camera-showcase.dsl.ts`
3. `packages/dsl/examples/auto-director-showcase.dsl.ts`

**Usage:**

- Documentation/examples of DirectorLite system
- Uses `directorEnabled: false` flag to disable auto-camera
- Shows manual camera control vs automatic DirectorLite

**Impact:**

- ⚠️ Examples reference DirectorLite in comments
- **After DirectorLite deletion:** Update examples to remove DirectorLite references

---

## DirectorLite System Usage Analysis

### Files Using DirectorLite Functions

#### Production Code (2 files):

1. **renderer/src/engines/useCameraEngine.ts**
   - Line 36: `deriveDirectorEffects` - Main auto-camera logic
   - Line 37: `extractSignals` - Event signal extraction
   - Line 38: `convertToEffects` - Effect conversion
   - Comments (lines 11, 60, 61): DirectorLite architecture docs

2. **core/src/index.ts**
   - Lines 51-52: Re-exports `deriveDirectorEffects`, `extractSignals`
   - Public API exposure

#### Examples (3 files):

3. **dsl/examples/manual-camera-showcase.dsl.ts**
   - Comment: "DirectorLite is DISABLED"
   - Flag: `directorEnabled: false`

4. **dsl/examples/semantic-camera-showcase.dsl.ts**
   - Comment: "let DirectorLite handle most of it"

5. **dsl/examples/auto-director-showcase.dsl.ts**
   - Comment: "DirectorLite Automatic Camera Demo"
   - Comment: "DirectorLite is ENABLED by default"
   - Comment: "DirectorLite triggers FocusAnchor"

#### Internal Implementation (4 files in device-camera):

- `device-camera/src/director-lite/types.ts`
- `device-camera/src/director-lite/strategy.ts`
- `device-camera/src/director-lite/derive.ts` (exports `deriveDirectorEffects`)
- `device-camera/src/director-lite/signals.ts` (exports `extractSignals`)

**Total DirectorLite References:** 9 files (2 critical, 3 examples, 4 internal)

---

## Key Findings

### 1. Type Import Conflicts

**Problem:**

- `useCameraEngine.ts` imports `CameraState` from `@tokovo/device-camera`
- But core defines the canonical `CameraState` in `types/camera.ts`
- Device-camera's `CameraState` is incompatible (optional vs required fields)

**Solution:**

- Delete device-camera's `CameraState` definition
- Update `useCameraEngine.ts` to import from `@tokovo/core`

### 2. Legitimate Dependencies (Keep)

✅ Effect types: `CameraEffect`, `ZoomEffect`, `ShakeEffect`, etc.  
✅ Transform types: `CameraTransform`, `DEFAULT_TRANSFORM`  
✅ Reducers: `cameraReducer`, `cameraV2Lowering`  
✅ Processors: `processActiveEffects`, `registerCameraProcessor`  
✅ Anchors: `getAnchorsForApp`, `registerAnchorProvider`, etc.  
✅ Presets: `getPreset`, `getShotPreset`, `composeTimeline`  
✅ Utils: `lerp`, `applyEasing`, `seededRandom`

### 3. Dependencies to Remove (Task 6-7)

❌ DirectorLite: `deriveDirectorEffects`, `extractSignals`, `convertToEffects`  
❌ DirectorLite types: `DirectorStrategy`, `Rule`, `ViralDramaV1`, etc.  
❌ Duplicate `CameraState` definition in device-camera

---

## Impact Analysis for Migration Tasks

### Task 1: Delete Duplicate CameraState

**Files to Update:**

- ✅ `device-camera/src/types/index.ts` - Delete definition (lines 317-344)
- ⚠️ `device-camera/src/reducer/index.ts` - Change import source
- ⚠️ `renderer/src/engines/useCameraEngine.ts` - Change import source

### Task 6-7: Delete DirectorLite

**Files to Update:**

- ⚠️ `renderer/src/engines/useCameraEngine.ts` - Remove DirectorLite logic
- ⚠️ `core/src/index.ts` - Remove DirectorLite re-exports
- ✅ `device-camera/src/director-lite/*` - Delete entire directory
- ⚠️ `dsl/examples/*.dsl.ts` - Update comments/examples

### Tasks 10-13: Renderer Refactoring

**Critical File:**

- ⚠️ `renderer/src/engines/useCameraEngine.ts` - Complete rewrite needed
- Current: Uses DirectorLite + device-camera types
- Target: Pure effect processor using core types

---

## Verification Notes

- Search pattern: `@tokovo/device-camera` in `*.ts,*.tsx` files
- Excluded: `node_modules`, `dist/` directories
- Cross-referenced with grep for DirectorLite patterns
- All import statements manually verified by reading file headers
