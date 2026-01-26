# Fix Runtime Issues: Camera Types Cycle + Timeline Module

## Context

### Original Request

Fix two runtime errors appearing after `npm run dev`:

1. `TypeError: can't access property "DEFAULT_CAMERA_STATE"` - runtime circular dependency
2. `@tokovo/react/timeline could not be resolved` - incomplete module

### Root Cause Analysis

**Issue 1: Runtime Circular Dependency**

- `core/types/camera.ts` imports `CameraEffect`, `CameraTransform`, `DEFAULT_TRANSFORM` from `@tokovo/device-camera`
- `device-camera/types/index.ts` imports `CameraState`, `DEFAULT_CAMERA_STATE` from `@tokovo/core`
- At runtime, when Webpack loads these, one module is undefined when the other tries to access it
- The **value imports** (`DEFAULT_TRANSFORM`, `DEFAULT_CAMERA_STATE`) create the runtime cycle (type imports alone would be fine)

**Issue 2: Incomplete Timeline Module**

- `packages/react/src/timeline/index.ts` exports from 3 non-existent files:
  - `./EpisodeEditor` - doesn't exist
  - `./components/Timeline` - doesn't exist
  - `./types` - doesn't exist
- `packages/studio/src/pages/TimelineDemo.tsx` imports from this broken module

### Solution Strategy

**For Issue 1**: Move `CameraTransform` and `DEFAULT_TRANSFORM` to core to break the cycle
**For Issue 2**: Delete the incomplete timeline module (or comment out the broken exports)

---

## Work Objectives

### Core Objective

Make `npm run dev` work without runtime errors.

### Concrete Deliverables

- `core/types/camera.ts` contains `CameraTransform` and `DEFAULT_TRANSFORM`
- `device-camera` imports these from core (one-way dependency)
- Timeline module either removed or fixed

### Definition of Done

- [ ] `npm run dev` starts without "DEFAULT_CAMERA_STATE undefined" error
- [ ] `npm run dev` starts without "@tokovo/react/timeline" resolution error
- [ ] App loads in browser without TypeError

---

## TODOs

- [x] 1. Move CameraTransform and DEFAULT_TRANSFORM to core

  **What to do**:
  - Copy `CameraTransform` interface from `device-camera/types/index.ts` to `core/types/camera.ts`
  - Copy `DEFAULT_TRANSFORM` constant from `device-camera/types/index.ts` to `core/types/camera.ts`
  - Export them from core's public API
  - Update `core/types/camera.ts` to use local `CameraTransform` instead of importing from device-camera

  **References**:
  - `packages/device-camera/src/types/index.ts` - Current location of CameraTransform
  - `packages/core/src/types/camera.ts` - Target location
  - `packages/core/src/types.ts` - May need to update exports

  **Acceptance Criteria**:
  - [ ] `CameraTransform` interface exists in core/types/camera.ts
  - [ ] `DEFAULT_TRANSFORM` constant exists in core/types/camera.ts
  - [ ] core/types/camera.ts does NOT import values from device-camera

---

- [x] 2. Update device-camera to import from core

  **What to do**:
  - Update `device-camera/types/index.ts` to import `CameraTransform` and `DEFAULT_TRANSFORM` from core
  - Remove the local definitions (now moved to core)
  - Keep device-camera's own types (`CameraEffect`, etc.)

  **References**:
  - `packages/device-camera/src/types/index.ts` - Update imports here
  - `packages/device-camera/src/reducer/index.ts` - May need import updates

  **Acceptance Criteria**:
  - [ ] device-camera imports `CameraTransform`, `DEFAULT_TRANSFORM` from `@tokovo/core`
  - [ ] No duplicate definitions

---

- [x] 3. Fix or remove incomplete timeline module

  **What to do**:
  - OPTION A: Delete `packages/react/src/timeline/` directory entirely
  - OPTION B: Comment out the broken exports in `timeline/index.ts`
  - Update `packages/studio/src/pages/TimelineDemo.tsx` to not import from broken module

  **References**:
  - `packages/react/src/timeline/index.ts` - Broken exports
  - `packages/studio/src/pages/TimelineDemo.tsx` - Consumer of broken module

  **Acceptance Criteria**:
  - [ ] No Vite resolution errors for @tokovo/react/timeline
  - [ ] Studio builds successfully

---

- [x] 4. Verify runtime works

  **What to do**:
  - Run `npm run dev`
  - Open browser to http://localhost:3000
  - Verify no TypeError for DEFAULT_CAMERA_STATE
  - Verify no module resolution errors

  **Acceptance Criteria**:
  - [x] Dev server starts cleanly
  - [x] App loads in browser without errors
  - [x] Console is clean (no TypeError, no module errors)

---

## Commit Strategy

| After Task | Message                                                  | Files                       |
| ---------- | -------------------------------------------------------- | --------------------------- |
| 2          | `fix(core): move CameraTransform to break runtime cycle` | camera.ts, types/index.ts   |
| 3          | `fix(react): remove incomplete timeline module`          | timeline/, TimelineDemo.tsx |

---

## Success Criteria

### Verification Commands

```bash
npm run dev  # Expected: starts without errors
# Open http://localhost:3000 - Expected: app loads
```

### Final Checklist

- [ ] No runtime TypeError for camera state
- [ ] No module resolution errors
- [ ] Dev server fully operational
