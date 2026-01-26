# Camera V2 Cleanup: Full Legacy Removal

## Context

### Original Request

Remove all legacy camera patterns and fully migrate to V2 system. No backward compatibility needed. Full refactor of any episodes that reference legacy patterns.

### Interview Summary

**Key Discussions**:

- Previous session completed state schism fix (activeEffects → scheduledEffects in core)
- 21 camera API errors fixed in episode files
- Anchor resolution fixed with fallback pattern
- User confirms: "no going back to v1 or legacy system"

**Research Findings**:

- `activeEffects` in CameraState type is dead (0 runtime usages, only in 3 DSL examples for initial state)
- `dramatic` preset is NOT deprecated - heavily used (35+ refs across 15 files)
- Only `impactPunch` and `documentaryHold` are true legacy presets
- WhatsApp package is fully migrated to V2 (no legacy patterns)
- Pan effect works fine, just has misleading "legacy" comment

### Definition: What is "Legacy"?

**V1 Camera System (Legacy)**:

- Used `activeEffects: CameraEffect[]` in `CameraState` interface
- Episodes provided initial camera state in `initialWorld.camera`
- Runtime mutated this state array during playback
- Non-deterministic, hard to scrub, messy state management

**V2 Camera System (Current)**:

- Uses `scheduledEffects: ScheduledCameraEffect[]` in `CameraBrainState`
- Episodes schedule effects via DSL `.camera()` calls
- CameraBrain is a pure function: `(scheduledEffects, frame, anchors) → transform`
- Pure functional model (scrub-safe, deterministic, Remotion-compatible)

**Legacy Presets Being Removed**:
| Preset | Reason | Replacement |
|--------|--------|-------------|
| `impactPunch` | Duplicate of `impact` (both scale 1.35) | Use `impact` |
| `documentaryHold` | Deprecated, unused | None |
| `documentary` shot scale case | Deprecated mapping | None (PRESET object is still valid) |

**NOT Legacy (Keep These)**:

- `dramatic` preset → Actively used (35+ refs)
- `PRESETS["documentary"]` object → Valid V2 preset configuration
- `pan` effect → V2-compatible, just has misleading comment

### V2 Camera Architecture: Why Removing initialWorld.camera is Safe

**How V2 Initialization Works**:

1. CameraBrain initializes from `DEFAULT_CAMERA_BRAIN_STATE` (defined in `packages/device-camera/src/types/brain.ts`)
2. This default state includes `scheduledEffects: []` and `transform: DEFAULT_CAMERA_TRANSFORM`
3. The renderer creates a fresh CameraBrain instance for each render cycle
4. Episodes schedule effects via DSL `.camera()` calls → these become `ScheduledCameraEffect` entries
5. CameraBrain computes the transform at each frame from the scheduled effects timeline

**Why `initialWorld.camera` is NOT Used by V2**:

- V1 read `initialWorld.camera` to get initial state and active effects
- V2 IGNORES `initialWorld.camera` entirely - it's never read
- CameraBrain gets its state from the episode's `scheduledEffects`, not from initial world
- The `camera:` blocks in DSL examples are dead code - they compile but are never consumed

**Evidence**:

- `packages/device-camera/src/brain/CameraBrain.ts` - `processFrame()` only uses `scheduledEffects` and `anchors`
- `packages/renderer/src/engines/useCameraEngine.ts` - Creates CameraBrain with default state, doesn't read initialWorld.camera
- No code path reads `initialWorld.camera` in V2 runtime

### Important Clarifications

- **`activeEffects` in `processors/index.ts:758`**: This is a LOCAL VARIABLE name in a pure function that filters effects at runtime. It is NOT the legacy type field. This is correct code and should NOT be changed.
- **DSL examples use `CameraState` (from `types/index.ts`)**: The `activeEffects: []` field should be REMOVED entirely (not renamed to scheduledEffects) because V2 doesn't use initial camera state this way.
- **DSL helpers in `dsl/helpers/camera.ts`**: The `impactPunch` preset reference here must also be updated to use a non-deprecated preset.

---

## Work Objectives

### Core Objective

Remove all legacy camera patterns from the codebase, ensuring the V2 system (scheduledEffects, CameraBrain, ScheduledCameraEffect) is the only camera implementation.

### Concrete Deliverables

1. `types/index.ts` - Remove `activeEffects` from `CameraState` interface and `DEFAULT_CAMERA_STATE`
2. `presets.ts` - Remove `impactPunch`, `documentaryHold`, and `documentary` preset scale mappings (lines 170-173)
3. `pan.ts` - Update comment to remove "legacy" terminology
4. `dsl/helpers/camera.ts` - Replace `impactPunch` preset with `impact` in punchGlide function (line 176) and remove `impactPunch` case from getPresetDuration (line 231)
5. 3 DSL example files - REMOVE the entire `camera: { baseView, activeEffects }` block (V2 doesn't need initial camera state)

### Definition of Done

- [x] `grep "activeEffects" packages/device-camera/src/types/index.ts` returns 0 results
- [x] `grep "activeEffects:" packages/dsl/examples/` returns 0 results (note the colon - excludes comments)
- [x] `grep "impactPunch\|documentaryHold" packages/device-camera/src/presets.ts` returns 0 results
- [x] `grep "impactPunch" packages/dsl/src/helpers/camera.ts` returns 0 results
- [x] `pnpm turbo run test --filter=@tokovo/device-camera` passes (99+ tests)
- [x] `pnpm turbo run build` succeeds with no type errors

### Must Have

- Remove `activeEffects` field from `CameraState` type (NOT the runtime variable in processors)
- Remove legacy preset names from getShotPreset function (impactPunch, documentaryHold, documentary)
- Update DSL helper to use non-deprecated preset
- Update DSL examples to remove legacy camera initial state

### Must NOT Have (Guardrails)

- DO NOT touch `dramatic` preset - it is actively used
- DO NOT modify `ScheduledCameraEffect` or V2 types in `brain.ts` - they are correct
- DO NOT change runtime logic in CameraBrain or processors (including the `activeEffects` local variable in processors/index.ts)
- DO NOT add backward compatibility shims - we're breaking legacy intentionally
- DO NOT modify WhatsApp package - it's already clean
- DO NOT modify `PRESETS["documentary"]` object (lines 109-117 in presets.ts) - only the shot scale case statement is deprecated

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES
- **User wants tests**: Run existing tests (no new tests needed for deletion work)
- **Framework**: bun test via turbo

### Verification Commands

```bash
# After each change
pnpm turbo run test --filter=@tokovo/device-camera

# Final verification - SPECIFIC to avoid false positives
pnpm turbo run build

# Type removal (specific file, not the runtime variable)
grep "activeEffects" packages/device-camera/src/types/index.ts
# Expected: 0 results

# DSL examples (using colon to match field, not comments)
grep "activeEffects:" packages/dsl/examples/
# Expected: 0 results

# Legacy presets in presets.ts
grep "impactPunch\|documentaryHold" packages/device-camera/src/presets.ts
# Expected: 0 results

# Legacy presets in DSL helpers
grep "impactPunch" packages/dsl/src/helpers/camera.ts
# Expected: 0 results
```

---

## Task Flow

```
Task 1 (Types) ──┐
Task 2 (Presets) ├──→ Task 5 (Build & Test)
Task 3 (DSL helpers)─┤
Task 4 (DSL examples)┘
```

## Parallelization

| Group | Tasks      | Reason                                   |
| ----- | ---------- | ---------------------------------------- |
| A     | 1, 2, 3, 4 | Independent files, no cross-dependencies |

| Task | Depends On | Reason                               |
| ---- | ---------- | ------------------------------------ |
| 5    | 1, 2, 3, 4 | Final verification after all changes |

---

## TODOs

- [x] 1. Remove `activeEffects` from CameraState type

  **What to do**:
  - Open `packages/device-camera/src/types/index.ts`
  - Remove `activeEffects: CameraEffect[];` from `CameraState` interface (line 398)
  - Remove `activeEffects: [],` from `DEFAULT_CAMERA_STATE` constant (line 412)

  **Must NOT do**:
  - Do NOT touch `scheduledEffects` or any V2 types
  - Do NOT modify anything in `types/brain.ts`
  - Do NOT modify the LOCAL VARIABLE named `activeEffects` in `processors/index.ts:758` - this is a runtime filter, not the legacy type field

  **Parallelizable**: YES (with 2, 3, 4)

  **References**:
  - `packages/device-camera/src/types/index.ts:397-415` - CameraState interface and default
  - `packages/device-camera/src/types/brain.ts` - V2 types (DO NOT MODIFY, reference only)
  - `packages/device-camera/MIGRATION.md` - Documents activeEffects → scheduledEffects

  **Why `processors/index.ts` is SAFE**:
  The code at line 758 is:

  ```typescript
  const activeEffects = effects.filter(
    (e) => t >= e.startFrame && t < e.endFrame,
  );
  ```

  This is a LOCAL VARIABLE that filters scheduled effects by current frame. The name is coincidental and correct - it describes effects that are "active" at the current time. This is NOT the legacy pattern.

  **Acceptance Criteria**:
  - [x] `grep "activeEffects" packages/device-camera/src/types/index.ts` returns 0 results
  - [x] `grep "activeEffects" packages/device-camera/src/processors/index.ts` STILL returns the local variable (this is expected and correct)
  - [x] TypeScript compiles: `pnpm turbo run build --filter=@tokovo/device-camera`
  - [x] Tests pass: `pnpm turbo run test --filter=@tokovo/device-camera`

  **Commit**: YES
  - Message: `refactor(camera): remove legacy activeEffects from CameraState type`
  - Files: `packages/device-camera/src/types/index.ts`
  - Pre-commit: `pnpm turbo run test --filter=@tokovo/device-camera`

---

- [x] 2. Remove legacy preset names from getShotPreset

  **What to do**:
  - Open `packages/device-camera/src/presets.ts`
  - In `getShotPreset` function, **DELETE ONLY lines 171-173** (NOT line 170):

    ```typescript
    // LINE 170: KEEP THIS - dramatic is NOT legacy
    case "dramatic": return 1.3;

    // LINES 171-173: DELETE THESE THREE LINES
    case "impactPunch": return 1.35;    // DELETE
    case "documentaryHold": return 1.05; // DELETE
    case "documentary": return 1.0;      // DELETE
    ```

  - **CRITICAL**: Line 170 (`case "dramatic"`) must be PRESERVED - it is actively used

  **Must NOT do**:
  - Do NOT delete line 170 (`case "dramatic"`) - it is actively used (35+ refs)
  - Do NOT modify `PRESETS["documentary"]` object (lines 109-117) - only the shot scale case is deprecated

  **Parallelizable**: YES (with 1, 3, 4)

  **References**:
  - `packages/device-camera/src/presets.ts:170-173` - Legacy preset case statements to DELETE
  - `packages/device-camera/src/presets.ts:87-88` - dramatic preset definition (KEEP)
  - `packages/device-camera/src/presets.ts:109-117` - PRESETS["documentary"] object (KEEP - not related to shot scale)

  **Acceptance Criteria**:
  - [x] `grep "impactPunch\|documentaryHold" packages/device-camera/src/presets.ts` returns 0 results
  - [x] `grep "dramatic" packages/device-camera/src/presets.ts` still returns matches (preserved)
  - [x] `grep "PRESETS\[\"documentary\"\]" packages/device-camera/src/presets.ts` still works (object preserved)
  - [x] Tests pass: `pnpm turbo run test --filter=@tokovo/device-camera`

  **Commit**: YES
  - Message: `refactor(camera): remove deprecated impactPunch and documentaryHold presets`
  - Files: `packages/device-camera/src/presets.ts`
  - Pre-commit: `pnpm turbo run test --filter=@tokovo/device-camera`

---

- [x] 3. Update DSL camera helper to remove impactPunch references

  **What to do**:
  - Open `packages/dsl/src/helpers/camera.ts`

  **3a. Update punchGlide preset (line 176)**:
  - Change: `preset: "impactPunch",`
  - To: `preset: "impact",`
  - Reason: `impact` and `impactPunch` have IDENTICAL scale (both 1.35), making `impact` a direct drop-in replacement

  **3b. Remove impactPunch from getPresetDuration (lines 231-232)**:
  - Delete these lines:
    ```typescript
    case "impactPunch":
      return 10;
    ```

  **Duration Change Impact Analysis**:
  - **Before removal**: `getPresetDuration("impactPunch")` → 10 frames
  - **After removal**: `getPresetDuration("impactPunch")` → 22 frames (default fallback)

  **Why this is SAFE**:
  - The `punchGlide` function specifies its own duration in the event payload (line 178: `duration: 10`)
  - `getPresetDuration` is only used as a fallback when duration is NOT specified in the effect
  - Callers using `impactPunch` without explicit duration will get longer duration (22 vs 10) - this is acceptable as the preset is deprecated

  **Verification command**:

  ```bash
  grep -rn "impactPunch" packages/ --include="*.ts" | grep -v "case \"impactPunch\""
  # Expected: Only references in camera.ts (punchGlide function) which we're updating
  ```

  **Must NOT do**:
  - Do NOT change any other presets or durations
  - Do NOT remove the `punchGlide` function itself

  **Parallelizable**: YES (with 1, 2, 4)

  **References**:
  - `packages/dsl/src/helpers/camera.ts:176` - punchGlide uses `impactPunch` preset
  - `packages/dsl/src/helpers/camera.ts:231-232` - getPresetDuration case for `impactPunch`
  - `packages/device-camera/src/presets.ts:150` - `impact` preset in getShotPreset (scale 1.35, same as impactPunch)

  **Acceptance Criteria**:
  - [x] `grep "impactPunch" packages/dsl/src/helpers/camera.ts` returns 0 results
  - [x] `grep "impact" packages/dsl/src/helpers/camera.ts` returns the updated preset line
  - [x] Build passes: `pnpm turbo run build --filter=@tokovo/dsl`

  **Commit**: YES
  - Message: `refactor(dsl): migrate punchGlide from impactPunch to impact preset`
  - Files: `packages/dsl/src/helpers/camera.ts`
  - Pre-commit: `pnpm turbo run build --filter=@tokovo/dsl`

---

- [x] 4. Update pan.ts comment and DSL examples

  **What to do**:

  **4a. Fix pan.ts comment**:
  - Open `packages/device-camera/src/effects/pan.ts`
  - Line 8: Change `Pan provides manual x/y camera positioning for legacy .animate() support.`
  - To: `Pan provides manual x/y camera positioning for direct coordinate control.`

  **4b. Remove legacy camera initial state from DSL examples**:

  The DSL examples define camera initial state in `initialWorld`. V2 doesn't use initial camera state - the CameraBrain starts fresh and effects are scheduled dynamically.

  **Why removal is safe**: CameraBrain initializes its own state independently. The `initialWorld.camera` block is legacy V1 pattern and is NOT read by V2 runtime. Removing it has zero runtime impact.

  **IMPORTANT**: Each file has a DIFFERENT camera block structure. Remove the ENTIRE `camera:` block in each case:

  ***

  **`packages/dsl/examples/keyboard-verify.dsl.ts` (lines 94-97)** - SIMPLE:

  ```typescript
  // DELETE ENTIRE BLOCK (4 lines):
  camera: {
    baseView: "APP_VIEW",
    activeEffects: [],
  },
  ```

  ***

  **`packages/dsl/examples/full-cinematic-showcase.dsl.ts` (lines 46-65)** - COMPLEX:

  This file has a LARGE camera block with extra fields. Remove the ENTIRE block (20 lines):

  ```typescript
  // DELETE ENTIRE BLOCK (lines 46-65):
  camera: {
    baseView: "APP_VIEW",
    activeDeviceId: "phone",
    layout: {
      mode: "SINGLE",
      primaryDeviceId: "phone"
    },
    activeEffects: [],
    transform: {
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotation: 0,
      originX: 0.5,
      originY: 0.5,
      shakeX: 0,
      shakeY: 0
    },
    deviceTransforms: {}
  },
  ```

  **Why remove transform/layout/deviceTransforms too?**
  - These are ALL part of the legacy CameraState type
  - V2 CameraBrain computes its own transform from scheduledEffects
  - These fields are NOT read by V2 runtime
  - Keeping them would cause type errors after Task 1 removes CameraState fields

  ***

  **`packages/dsl/examples/whatsapp-complete-showcase.dsl.ts` (lines 90-103)** - MEDIUM:

  This file has camera block with transform. Remove ENTIRE block (14 lines):

  ```typescript
  // DELETE ENTIRE BLOCK (lines 90-103):
  camera: {
    baseView: "APP_VIEW",
    activeEffects: [],
    transform: {
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotation: 0,
      originX: 0.5,
      originY: 0.5,
      shakeX: 0,
      shakeY: 0
    }
  },
  ```

  ***

  **Summary of deletions**:
  | File | Lines to Delete | Block Size |
  |------|-----------------|------------|
  | keyboard-verify.dsl.ts | 94-97 | 4 lines |
  | full-cinematic-showcase.dsl.ts | 46-65 | 20 lines |
  | whatsapp-complete-showcase.dsl.ts | 90-103 | 14 lines |

  **Post-deletion cleanup**:
  - After deleting camera blocks, check for trailing comma issues
  - Run prettier to fix formatting: `pnpm prettier --write "packages/dsl/examples/*.dsl.ts"`
  - Verify file still compiles: `pnpm turbo run build --filter=@tokovo/dsl`

  **Must NOT do**:
  - Do NOT change any logic in pan.ts beyond the comment
  - Do NOT modify episode runtime behavior (removing unused initial state is safe)

  **Parallelizable**: YES (with 1, 2, 3)

  **References**:
  - `packages/device-camera/src/effects/pan.ts:1-20` - Pan effect with legacy comment
  - `packages/dsl/examples/keyboard-verify.dsl.ts:94-97` - Simple camera block (4 lines)
  - `packages/dsl/examples/full-cinematic-showcase.dsl.ts:46-65` - Complex camera block (20 lines)
  - `packages/dsl/examples/whatsapp-complete-showcase.dsl.ts:90-103` - Medium camera block (14 lines)

  **Acceptance Criteria**:
  - [x] `grep "legacy" packages/device-camera/src/effects/pan.ts` returns 0 results
  - [x] `grep "activeEffects:" packages/dsl/examples/` returns 0 results
  - [x] `grep "camera:" packages/dsl/examples/*.dsl.ts` returns 0 results (entire camera blocks removed)
  - [x] DSL examples still compile: `pnpm turbo run build --filter=@tokovo/dsl`
  - [x] Runtime verification: Run `pnpm turbo run dev --filter=@tokovo/video-runner` and load keyboard-verify.dsl.ts → Should render without camera-related errors → Camera should show app view at default transform

  **Commit**: YES
  - Message: `refactor(camera): update pan comment and remove legacy camera init from DSL examples`
  - Files:
    - `packages/device-camera/src/effects/pan.ts`
    - `packages/dsl/examples/keyboard-verify.dsl.ts`
    - `packages/dsl/examples/full-cinematic-showcase.dsl.ts`
    - `packages/dsl/examples/whatsapp-complete-showcase.dsl.ts`
  - Pre-commit: `pnpm turbo run build --filter=@tokovo/dsl`

---

- [x] 5. Final verification and cleanup

  **What to do**:
  - Run full test suite
  - Run full build
  - Verify no legacy patterns remain (using specific grep commands)
  - Check for any type errors caused by removal

  **Must NOT do**:
  - Do not commit if any tests fail
  - Do not ignore type errors

  **Parallelizable**: NO (depends on 1, 2, 3, 4)

  **References**:
  - All modified files from tasks 1-4

  **Acceptance Criteria**:
  - [x] `pnpm turbo run test` - All tests pass
  - [x] `pnpm turbo run build` - No errors

  **Specific Legacy Pattern Verification** (avoiding false positives):
  - [x] `grep "activeEffects" packages/device-camera/src/types/index.ts` returns 0 results
  - [x] `grep "activeEffects:" packages/dsl/examples/` returns 0 results
  - [x] `grep "impactPunch\|documentaryHold" packages/device-camera/src/presets.ts` returns 0 results
  - [x] `grep "impactPunch" packages/dsl/src/helpers/camera.ts` returns 0 results

  **Expected to STILL exist** (not legacy, just coincidental names):
  - `grep "activeEffects" packages/device-camera/src/processors/index.ts` → local variable, expected

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                                                | Files              | Verification |
| ---------- | -------------------------------------------------------------------------------------- | ------------------ | ------------ |
| 1          | `refactor(camera): remove legacy activeEffects from CameraState type`                  | types/index.ts     | tests pass   |
| 2          | `refactor(camera): remove deprecated impactPunch and documentaryHold presets`          | presets.ts         | tests pass   |
| 3          | `refactor(dsl): migrate punchGlide from impactPunch to impact preset`                  | helpers/camera.ts  | build passes |
| 4          | `refactor(camera): update pan comment and remove legacy camera init from DSL examples` | pan.ts, 3x .dsl.ts | build passes |
| All        | Optional squash: `refactor(camera): complete v2 migration, remove all legacy patterns` | -                  | full suite   |

---

## Success Criteria

### Verification Commands

```bash
# All must pass
pnpm turbo run test                                    # Expected: all tests pass
pnpm turbo run build                                   # Expected: no errors

# Type field removed (specific file)
grep "activeEffects" packages/device-camera/src/types/index.ts
# Expected: 0 results

# DSL examples cleaned (field syntax)
grep "activeEffects:" packages/dsl/examples/
# Expected: 0 results

# Legacy presets removed
grep "impactPunch\|documentaryHold" packages/device-camera/src/presets.ts
# Expected: 0 results

# DSL helper updated
grep "impactPunch" packages/dsl/src/helpers/camera.ts
# Expected: 0 results
```

### Final Checklist

- [x] `activeEffects` field removed from CameraState type (local variable in processors is SAFE)
- [x] Legacy preset names removed from getShotPreset (impactPunch, documentaryHold, documentary)
- [x] `dramatic` preset preserved (NOT legacy)
- [x] `PRESETS["documentary"]` object preserved (NOT related to shot scale)
- [x] DSL helper updated to use `impact` instead of `impactPunch`
- [x] Pan comment updated (no "legacy" terminology)
- [x] DSL examples have camera initial state removed (not renamed)
- [x] All 99+ camera tests pass
- [x] Build succeeds with no type errors
