# CameraState References - Mapping Results

**Task:** Map all CameraState definition sites and usage sites  
**Date:** 2026-01-26  
**Method:** grep (LSP unavailable - typescript-language-server not installed)

---

## Definition Sites (3 found)

### 1. Core Definition (Primary Source of Truth)

**File:** `packages/core/src/types/camera.ts:107`

```typescript
export interface CameraState {
  baseView: "APP_VIEW" | "TRANSITION";
  appId?: AppId;
  activeDeviceId: string;
  layout: ViewLayout;
  activeEffects: CameraEffect[];
  transform: CameraTransform;
  deviceTransforms: Record<DeviceId, CameraTransform>;
}
```

- **Default:** `DEFAULT_CAMERA_STATE` at line 134
- **Purpose:** Part of WorldState, must live in core
- **Dependencies:** Imports `CameraEffect`, `CameraTransform` from `@tokovo/device-camera`

### 2. Device-Camera Definition (DUPLICATE)

**File:** `packages/device-camera/src/types/index.ts:317`

```typescript
export interface CameraState {
  activeEffects: CameraEffect[];
  transform: CameraTransform;
  activeDeviceId?: string;
  baseView?: string;
  appId?: string;
  layout?: { mode: "SINGLE" | "PIP" | "SPLIT"; ... };
}
```

- **Default:** `DEFAULT_CAMERA_STATE` at line 341
- **PROBLEM:** Incompatible with core definition (optional vs required fields)
- **TO DELETE:** This is the duplicate causing type conflicts

### 3. Core Re-export

**File:** `packages/core/src/types.ts:668`

- Re-exports the device-camera definition currently
- **WILL CHANGE:** Should re-export from `types/camera.ts` instead

---

## Usage Sites (7 files, 19 occurrences)

### Import/Usage in Device-Camera Package

#### `packages/device-camera/src/reducer/index.ts`

- Line 20: Import `CameraState`
- Line 46: Type annotation `draft: { camera?: CameraState }`
- Line 281: Parameter `state: CameraState`
- Line 294: Parameter `state: CameraState`
- **Impact:** Uses device-camera's local definition (the duplicate)

#### `packages/device-camera/src/types/index.ts`

- Line 317: Definition site (duplicate)
- Line 341: Default constant
- **Action:** DELETE these lines

---

### Import/Usage in Core Package

#### `packages/core/src/types/camera.ts`

- Line 6: Documentation comment mentioning CameraState
- Line 8: Documentation comment
- Line 32: Comment "Import types for use in CameraState"
- Line 107: **PRIMARY DEFINITION** ✅
- Line 134: **PRIMARY DEFAULT** ✅

#### `packages/core/src/types.ts`

- Line 605: Comment "Import for use in CameraState"
- Line 668: **RE-EXPORT DEFINITION** (currently from device-camera ❌)
- Line 679: **RE-EXPORT DEFAULT** (currently from device-camera ❌)
- Line 882: Usage in WorldState `camera: CameraState;`

#### `packages/core/src/types/world-state.ts`

- Line 8: Import `CameraState` from "./camera"
- Line 50: Usage in WorldState `camera: CameraState;`
- **Status:** Correctly imports from core's camera.ts ✅

#### `packages/core/src/engine.ts`

- Line 187: Comment about legacy camera format vs new CameraState
- **Status:** No type usage, just comment

---

### Import/Usage in Renderer Package

#### `packages/renderer/src/engines/useCameraEngine.ts`

- Line 26: Import `CameraState`
- **Impact:** CRITICAL - This is where core meets renderer
- **Current source:** Imports from `@tokovo/core` (which currently re-exports device-camera's definition ❌)
- **After fix:** Will import from core's camera.ts via types.ts ✅

---

## Key Findings

### Type Conflict Analysis

1. **Core definition** (camera.ts:107): All fields required, detailed layout structure
2. **Device-camera definition** (device-camera/types/index.ts:317): Most fields optional, simplified layout
3. **Incompatibility:** Cannot coexist - causes "Type 'X' is not assignable to type 'Y'" errors

### Dependency Chain

```
WorldState (types/world-state.ts)
  ↓ imports
CameraState (types/camera.ts) ← CORRECT SOURCE
  ↓ uses
CameraEffect, CameraTransform (from @tokovo/device-camera) ← CORRECT

BUT CURRENTLY:
packages/core/src/types.ts:668
  ↓ re-exports
CameraState from @tokovo/device-camera ← WRONG (duplicate)
```

### Critical Files Affected by Duplicate

1. `packages/core/src/types.ts` - Wrong re-export source
2. `packages/device-camera/src/types/index.ts` - Contains duplicate definition
3. `packages/device-camera/src/reducer/index.ts` - Uses duplicate definition
4. `packages/renderer/src/engines/useCameraEngine.ts` - Imports via core (gets wrong type)

---

## Recommended Actions (for subsequent tasks)

1. **Delete duplicate** in `device-camera/src/types/index.ts:317-344`
2. **Fix core re-export** in `types.ts:668` to import from `./types/camera` instead of `@tokovo/device-camera`
3. **Update device-camera reducer** to import `CameraState` from `@tokovo/core` instead of local types
4. **Verify renderer** gets correct type after changes

---

## Verification Notes

- Used `grep` instead of LSP (typescript-language-server not installed)
- Pattern: `CameraState` in `*.ts` files
- Results: 19 matches across 7 files
- All definition sites confirmed by manual inspection of file contents
