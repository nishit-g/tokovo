# Camera Bugfix: State Schism (activeEffects → scheduledEffects)

## Context

### Original Request

Fix runtime errors preventing camera effects from working:

1. `scheduledEffects is undefined` - State property mismatch between Core and device-camera
2. `cam.at(...).set is not a function` - Potential missing method (but .set() exists at line 216)

### Root Cause Analysis

**STATE SCHISM**: The Core package uses `activeEffects` while device-camera uses `scheduledEffects`.

- `packages/core/src/types/camera.ts` line 126: `activeEffects: CameraEffect[]`
- `packages/core/src/types.ts` line 674: `activeEffects: CameraEffect[]`
- `packages/core/src/engine.ts` line 192, 276: checks/filters `activeEffects`
- `packages/core/src/engine/handlers/camera.ts` line 44, 68: uses `activeEffects`
- `packages/device-camera/src/brain/CameraBrain.ts`: expects `scheduledEffects`
- `packages/renderer/src/engines/useCameraEngine.ts` line 105: `rawCamera.scheduledEffects ?? []`

When Core initializes camera state with `activeEffects`, the device-camera's `scheduledEffects` is never populated, causing the undefined error.

---

## Work Objectives

### Core Objective

Unify camera state property name to `scheduledEffects` across entire codebase.

### Concrete Deliverables

- All Core files updated to use `scheduledEffects` instead of `activeEffects`
- Camera effects work end-to-end
- No runtime errors

### Definition of Done

- [ ] All `activeEffects` references replaced with `scheduledEffects`
- [ ] Camera effects render correctly in browser
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## TODOs

- [ ] 1. Update packages/core/src/types/camera.ts

  **What to do**:
  - Line 126: Change `activeEffects: CameraEffect[]` → `scheduledEffects: CameraEffect[]`
  - Line 136: Change `activeEffects: []` → `scheduledEffects: []`
  - Line 112: Update comment from "activeEffects" to "scheduledEffects"

  **Acceptance Criteria**:
  - [ ] `grep "activeEffects" packages/core/src/types/camera.ts` returns 0 results
  - [ ] TypeScript compiles

  **Commit**: YES
  - Message: `fix(core): rename activeEffects to scheduledEffects in camera.ts`

---

- [ ] 2. Update packages/core/src/types.ts

  **What to do**:
  - Line 674: Change `activeEffects: CameraEffect[]` → `scheduledEffects: CameraEffect[]`
  - Line 683: Change `activeEffects: []` → `scheduledEffects: []`

  **Acceptance Criteria**:
  - [ ] `grep "activeEffects" packages/core/src/types.ts` returns 0 results

  **Commit**: YES
  - Message: `fix(core): rename activeEffects to scheduledEffects in types.ts`

---

- [ ] 3. Update packages/core/src/engine.ts

  **What to do**:
  - Line 192: Change `"activeEffects" in initial.camera` → `"scheduledEffects" in initial.camera`
  - Line 276: Change `draft.camera.activeEffects = draft.camera.activeEffects.filter(` → `draft.camera.scheduledEffects = draft.camera.scheduledEffects.filter(`
  - Line 438: Change `"activeEffects" in initial.camera` → `"scheduledEffects" in initial.camera`
  - Line 575: Change `draft.camera.activeEffects` → `draft.camera.scheduledEffects`

  **Acceptance Criteria**:
  - [ ] `grep "activeEffects" packages/core/src/engine.ts` returns 0 results

  **Commit**: YES
  - Message: `fix(core): rename activeEffects to scheduledEffects in engine.ts`

---

- [ ] 4. Update packages/core/src/engine/handlers/camera.ts

  **What to do**:
  - Line 44: Change `!draft.camera.activeEffects` → `!draft.camera.scheduledEffects`
  - Line 68: Change `draft.camera.activeEffects = []` → `draft.camera.scheduledEffects = []`

  **Acceptance Criteria**:
  - [ ] `grep "activeEffects" packages/core/src/engine/handlers/camera.ts` returns 0 results

  **Commit**: YES
  - Message: `fix(core): rename activeEffects to scheduledEffects in camera handler`

---

- [ ] 5. Verify no activeEffects references remain in Core

  **What to do**:
  - Run: `grep -r "activeEffects" packages/core/src/ --include="*.ts"`
  - Should return 0 results
  - If any remain, update them

  **Acceptance Criteria**:
  - [ ] `grep -r "activeEffects" packages/core/src/ --include="*.ts" | wc -l` returns 0

  **Commit**: NO (verification only)

---

- [ ] 6. Rebuild and test in browser

  **What to do**:
  - Run: `pnpm turbo run build`
  - Open Remotion Studio
  - Test camera-showcase.episode.ts
  - Verify camera effects work (focus, shake, reset, etc.)

  **Acceptance Criteria**:
  - [ ] No `scheduledEffects is undefined` error
  - [ ] No `.set is not a function` error
  - [ ] Camera effects visually work
  - [ ] Playhead follows camera focus

  **Commit**: NO (verification only)

---

## Success Criteria

### Verification Commands

```bash
# Verify no activeEffects in Core
grep -r "activeEffects" packages/core/src/ --include="*.ts"
# Expected: no results

# Build all packages
pnpm turbo run build
# Expected: success

# TypeCheck
pnpm turbo run typecheck
# Expected: no errors
```

### Final Checklist

- [ ] All activeEffects → scheduledEffects
- [ ] No runtime errors
- [ ] Camera effects work in browser
