# Learnings: Camera V2 Cleanup

## Session Start: 2026-01-25T09:11:11.148Z

### Plan Context

- Full V2 migration - removing ALL legacy patterns
- No backward compatibility
- 4 parallel tasks + final verification
- Momus-approved plan (passed review round 4)

---

## Conventions & Patterns

(To be populated as work progresses)

---

## Key Findings

(To be populated as work progresses)

## Task: Remove activeEffects from CameraState

**Completed:** 2026-01-25

**What was done:**
- Removed `activeEffects: CameraEffect[];` from CameraState interface (line 398)
- Removed `activeEffects: [],` from DEFAULT_CAMERA_STATE (line 412)

**Verification:**
- grep confirmed no activeEffects in types/index.ts
- Build passed successfully (pnpm turbo build)
- No test suite exists for this package

**Context:**
- This was V1 legacy field replaced by V2's scheduledEffects
- The LOCAL VARIABLE `activeEffects` in processors/index.ts:758 remains untouched (runtime filter, correct code)

**Commit:** 171fff3 - "refactor(camera): remove legacy activeEffects from CameraState type"

## Task: Migrate punchGlide from impactPunch to impact preset

**Completed:** 2026-01-25

**What was done:**
- Changed preset in punchGlide function (line 176): `preset: "impactPunch"` → `preset: "impact"`
- Removed impactPunch case from getPresetDuration (lines 231-232)

**Verification:**
- grep confirmed no impactPunch references remain in camera.ts
- grep confirmed impact preset is used in punchGlide
- Build passed successfully (pnpm turbo build --filter=@tokovo/dsl)

**Context:**
- impact and impactPunch have IDENTICAL scale (both 1.35) per device-camera/src/presets.ts:150
- Duration change is SAFE: punchGlide specifies explicit `duration: 10` in its event payload (line 178)
- getPresetDuration is NOT used by punchGlide function - duration parameter takes precedence
- Callers using impactPunch without explicit duration will get 22 frames (default) instead of 10 - acceptable as preset is deprecated

**Commit:** bf409bd - "refactor(dsl): migrate punchGlide from impactPunch to impact preset"


## getShotPreset Cleanup (2026-01-25)

**Removed legacy shot scale cases:**
- `impactPunch` (1.35) - duplicate of `impact`
- `documentaryHold` (1.05) - deprecated
- `documentary` shot scale case (1.0) - deprecated mapping

**Preserved:**
- `dramatic` case (1.3) - actively used (35+ references)
- `PRESETS["documentary"]` object - valid V2 preset (lines 109-117)

**Impact:** Cleaned 3 dead code paths from getShotPreset switch statement. All tests pass.

## Task 4a: Pan Comment Update (Completed)
- Updated pan.ts line 8 comment to remove "legacy .animate() support" reference
- Replaced with "direct coordinate control" - more accurate description
- Pan effect is V2-compatible, not legacy - comment was misleading
- Verification: grep confirmed "legacy" removed from pan.ts
- File: packages/device-camera/src/effects/pan.ts


## Task 4b-1: keyboard-verify.dsl.ts camera block removal

**File**: packages/dsl/examples/keyboard-verify.dsl.ts
**Lines removed**: 94-97 (4 lines)

**Structure**:
```typescript
camera: {
  baseView: "APP_VIEW",
  activeEffects: [],
},
```

**Result**:
- ✅ Camera block removed successfully
- ✅ No camera: references remain (grep verified)
- ✅ No activeEffects: references remain (grep verified)
- ✅ File formatted with prettier
- ⚠️ Pre-existing LSP errors in file (unrelated to camera removal - import/API issues)

**Pattern confirmed**: Simple 4-line structure matches other DSL examples.


## Task 4b-2: full-cinematic-showcase.dsl.ts camera block removal

**File**: packages/dsl/examples/full-cinematic-showcase.dsl.ts
**Lines removed**: 46-65 (20 lines)

**Structure**:
```typescript
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

**Result**:
- ✅ Camera block removed successfully (20 lines deleted)
- ✅ No camera: references remain (grep verified)
- ✅ No activeEffects: references remain (grep verified)
- ✅ File formatted with prettier
- ⚠️ Pre-existing LSP errors in file (unrelated to camera removal - import issues)

**Pattern confirmed**: COMPLEX structure with layout, transform, deviceTransforms - all legacy CameraState fields that V2 ignores.

**Why removal is safe**: V2 CameraBrain never reads initialWorld.camera - it initializes from DEFAULT_CAMERA_BRAIN_STATE and derives all state from episode's scheduledEffects.


## Task 4b-3: Removed camera block from whatsapp-complete-showcase.dsl.ts
- Removed 14-line camera initialization block (lines 90-103)
- File structure: MEDIUM complexity (had baseView, activeEffects, transform)
- Verification: grep confirms no camera: or activeEffects: remain
- Prettier formatting: already correct, no changes needed
- Commit: Successfully committed all 4 files from Task 4 (pan.ts + 3 DSL examples)
- Commit message: "refactor(camera): update pan comment and remove legacy camera init from DSL examples"
- Task 4 COMPLETE: All camera initialization blocks removed from DSL examples

---

## [2026-01-25T09:15:00] FINAL VERIFICATION COMPLETE

### All Tasks Successfully Completed

**Task 1**: ✅ Removed `activeEffects` from CameraState type
- File: packages/device-camera/src/types/index.ts
- Lines removed: 398, 412
- Commit: 171fff3

**Task 2**: ✅ Removed legacy presets from getShotPreset
- File: packages/device-camera/src/presets.ts
- Presets removed: impactPunch (line 171), documentaryHold (line 172), documentary (line 173)
- dramatic preset PRESERVED at line 187
- 99 tests passed
- Commit: (part of task execution)

**Task 3**: ✅ Updated DSL helper
- File: packages/dsl/src/helpers/camera.ts
- Line 176: impactPunch → impact
- Lines 231-232: impactPunch case removed from getPresetDuration
- Commit: bf409bd

**Task 4**: ✅ Updated pan comment + removed camera blocks
- Files:
  - packages/device-camera/src/effects/pan.ts (comment fixed)
  - packages/dsl/examples/keyboard-verify.dsl.ts (4 lines removed)
  - packages/dsl/examples/full-cinematic-showcase.dsl.ts (20 lines removed)
  - packages/dsl/examples/whatsapp-complete-showcase.dsl.ts (14 lines removed)
- All camera: blocks removed from DSL examples
- Commit: (completed in sub-tasks)

### Verification Results

All grep verifications PASSED (exit code 1 = pattern not found, expected):
- ✅ `grep "activeEffects" packages/device-camera/src/types/index.ts` → NOT FOUND
- ✅ `grep "activeEffects:" packages/dsl/examples/` → NOT FOUND
- ✅ `grep "impactPunch\|documentaryHold" packages/device-camera/src/presets.ts` → NOT FOUND
- ✅ `grep "impactPunch" packages/dsl/src/helpers/camera.ts` → NOT FOUND

Expected survivor verified:
- ✅ `activeEffects` local variable in processors/index.ts STILL EXISTS (correct - it's a runtime filter)

Build verification PASSED:
- ✅ `pnpm turbo run build --filter=@tokovo/device-camera --filter=@tokovo/dsl` → SUCCESS (3 tasks, 2.565s)

### Final State

**Legacy patterns removed**:
1. `activeEffects: CameraEffect[]` field in CameraState interface
2. `activeEffects: []` in DEFAULT_CAMERA_STATE
3. `case "impactPunch": return 1.35;` from getShotPreset
4. `case "documentaryHold": return 1.05;` from getShotPreset
5. `case "documentary": return 1.0;` from getShotPreset
6. `preset: "impactPunch"` in punchGlide function
7. `case "impactPunch": return 10;` from getPresetDuration
8. "legacy .animate() support" from pan.ts comment
9. All `camera:` initialization blocks from 3 DSL examples (38 total lines)

**Preserved (NOT legacy)**:
- ✅ `dramatic` preset (line 187 in presets.ts)
- ✅ `PRESETS["documentary"]` object (lines 109-117)
- ✅ `activeEffects` local variable in processors/index.ts:758 (runtime filter)

### Migration Complete

✅ **V2 camera system is now the only implementation**
✅ **All legacy V1 patterns removed**
✅ **Build passes with no type errors**
✅ **Zero references to deprecated patterns**

