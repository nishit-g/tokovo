# Camera Effects Schema Fix (Comprehensive)

## Context

### Original Request

Fix camera effects not working after enterprise refactor.

### Root Cause Analysis (Updated with Metis Findings)

The camera system has a **4-layer architecture** with schema mismatches:

```
DSL (camera-track.ts)
    ↓ emits SHAKE_START with {intensityX, intensityY, anchorId}
Lowering Layer (lowering/handler.ts)  ← CRITICAL LAYER
    ↓ transforms to {type: "SHAKE", intensityX, intensityY, intensity}
Reducer (reducer/index.ts)
    ↓ creates ScheduledCameraEffect with {payload: {intensity}}  ← BUG
Processor (processors/shake.ts)
    ↓ looks for effect.intensityX/intensityY ← NOT FOUND
```

### Specific Bugs Found

| Bug                                  | Layer            | Impact                 | Fix Location             |
| ------------------------------------ | ---------------- | ---------------------- | ------------------------ |
| `intensityX/intensityY` lost         | Reducer          | Shake broken           | Preserve at effect level |
| `SHAKE_START`/`SHAKE_END` not mapped | Reducer          | Shake events ignored   | Add case handling        |
| `ANCHOR_FOCUS` not handled           | Reducer          | Focus may fail         | Add case handling        |
| `anchorId` vs `anchor`               | Lowering+Reducer | Focus anchor lost      | Add fallback             |
| `pan/zoom/dolly` → `focus`           | Reducer          | Processors unreachable | Verify or fix            |

### Files Affected

- `packages/device-camera/src/lowering/handler.ts` - Lowering layer
- `packages/device-camera/src/reducer/index.ts` - Reducer (main fix location)
- `packages/device-camera/src/processors/shake.ts` - Expects intensityX/Y
- `packages/ir/src/v2/payloads.ts` - IR types
- `packages/dsl/src/v2/camera-track.ts` - DSL types
- `packages/episodes/src/production/*.episode.ts` - Episodes with type errors

---

## Work Objectives

### Core Objective

Make ALL camera effects work by fixing schema alignment across all 4 layers.

### Strategy

**Option B: Update Reducer to accept both schemas** - Maintain backward compatibility.

### Concrete Deliverables

1. Shake effect works with `intensityX`/`intensityY`
2. Shake effect backward compatible with `intensity`
3. Focus effect works with `anchorId` and `anchor`
4. `SHAKE_START`/`SHAKE_END` events handled
5. `ANCHOR_FOCUS` events handled
6. All episode files compile
7. All effects verified in browser

### Definition of Done

- [ ] `pnpm turbo run build` passes with 0 errors
- [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes (92+ tests)
- [ ] Manual verification: focus, shake, reset effects work in feature-showcase
- [ ] Manual verification: shake asymmetric when intensityX ≠ intensityY

### Must Have

- Backward compatibility with existing episodes
- All 6 effects functional: focus, shake, reset, cut, dutch-tilt, flash
- Tests for schema fallbacks

### Must NOT Have (Guardrails)

- Breaking changes to DSL API
- Modifying CameraBrain logic
- Modifying processor math
- Refactoring lowering layer architecture
- Touching code outside device-camera (except IR types if needed)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (vitest)
- **User wants tests**: TDD + Manual verification
- **Framework**: vitest

### Test Commands

```bash
pnpm turbo run test --filter=@tokovo/device-camera
pnpm turbo run build
```

### Manual Verification Episodes

- `packages/episodes/src/production/feature-showcase.episode.ts`
- `packages/episodes/src/production/cheating-exposed.episode.ts`

---

## TODOs

### Phase 0: Baseline Validation

- [ ] 0. Capture baseline state before changes

  **What to do**:
  - Run existing test suite and capture results
  - Check which tests cover shake (if any)
  - Identify current TypeScript errors in detail

  **Parallelizable**: NO (must be first)

  **Commands**:

  ```bash
  pnpm turbo run test --filter=@tokovo/device-camera
  grep -r "intensityX" packages/device-camera/src/__tests__/
  pnpm turbo run build 2>&1 | grep -E "(error|Error)"
  ```

  **Acceptance Criteria**:
  - [ ] Baseline test count recorded (expect 92 tests)
  - [ ] Know which shake tests exist (if any)
  - [ ] Have list of current TypeScript errors

  **Commit**: NO (investigation only)

---

### Phase 1: Fix Shake Effect (Core Bug)

- [ ] 1. Fix reducer to preserve intensityX/intensityY at effect level

  **What to do**:
  - In `packages/device-camera/src/reducer/index.ts`
  - Modify shake effect creation to include top-level fields:
    ```typescript
    const effect: ScheduledCameraEffect = {
      type: "shake",
      startFrame: at,
      endFrame: at + duration,
      payload: shakePayload,
      // ADD THESE at effect level (processor expects them here):
      intensityX:
        (event.intensityX as number) ??
        (payload.intensityX as number) ??
        shakePayload.intensity,
      intensityY:
        (event.intensityY as number) ??
        (payload.intensityY as number) ??
        shakePayload.intensity,
    };
    ```

  **Must NOT do**:
  - Modify processor logic
  - Change CameraBrain
  - Remove backward compat with `intensity`

  **Parallelizable**: NO (foundation)

  **References**:
  - Reducer: `packages/device-camera/src/reducer/index.ts` - shake case around line 102-123
  - Processor: `packages/device-camera/src/processors/shake.ts:27-28` - expects `e.intensityX ?? e.intensity`
  - Lowering: `packages/device-camera/src/lowering/handler.ts:90-101` - flattens intensityX/Y

  **Acceptance Criteria**:
  - [ ] RED: Write test for shake with intensityX=10, intensityY=5 → effect has both
  - [ ] GREEN: Implement fix, test passes
  - [ ] Test: Legacy `intensity: 5` still works (backward compat)
  - [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes

  **Commit**: YES
  - Message: `fix(device-camera): preserve intensityX/intensityY at effect level for shake`
  - Files: `packages/device-camera/src/reducer/index.ts`, test file

---

- [ ] 2. Add reducer handling for SHAKE_START/SHAKE_END events

  **What to do**:
  - In `packages/device-camera/src/reducer/index.ts`
  - Add cases for `'shake-start'` and `'shake-end'` (normalized event types)
  - Map to existing shake logic
  - Ensure intensityX/intensityY are preserved

  **Must NOT do**:
  - Change DSL event names
  - Modify lowering layer

  **Parallelizable**: NO (depends on 1)

  **References**:
  - Reducer: `packages/device-camera/src/reducer/index.ts`
  - Lowering: `packages/device-camera/src/lowering/handler.ts:90-101` - SHAKE_START handling
  - DSL: `packages/dsl/src/v2/camera-track.ts` - emits SHAKE_START

  **Acceptance Criteria**:
  - [ ] RED: Write test for SHAKE_START event → produces shake effect
  - [ ] GREEN: Implement case, test passes
  - [ ] Test: SHAKE_END handled (or verified unnecessary due to decay)
  - [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes

  **Commit**: YES
  - Message: `fix(device-camera): handle SHAKE_START/SHAKE_END events in reducer`
  - Files: `packages/device-camera/src/reducer/index.ts`, test file

---

### Phase 2: Fix Focus Effect

- [ ] 3. Add reducer support for anchorId → anchor mapping

  **What to do**:
  - In `packages/device-camera/src/reducer/index.ts`
  - In focus effect creation, ensure fallback:
    ```typescript
    anchor: payload.anchor ??
      payload.anchorId ??
      event.anchor ??
      event.anchorId;
    ```

  **Must NOT do**:
  - Change DSL to emit `anchor` instead of `anchorId`

  **Parallelizable**: YES (with 4)

  **References**:
  - Reducer: `packages/device-camera/src/reducer/index.ts` - focus case
  - Lowering: `packages/device-camera/src/lowering/handler.ts` - has anchorId fallback
  - DSL: `packages/dsl/src/v2/camera-track.ts` - emits `anchorId`

  **Acceptance Criteria**:
  - [ ] RED: Write test for FOCUS with `anchorId: 'hero'` → effect has `anchor: 'hero'`
  - [ ] GREEN: Verify or implement fallback
  - [ ] Test: FOCUS with `anchor: 'hero'` still works
  - [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes

  **Commit**: YES
  - Message: `fix(device-camera): map anchorId to anchor for backward compatibility`
  - Files: `packages/device-camera/src/reducer/index.ts`, test file

---

- [ ] 4. Add reducer handling for ANCHOR_FOCUS events

  **What to do**:
  - Check if `'anchor-focus'` is handled in reducer
  - If not, add case that maps to focus effect
  - Ensure it uses same anchorId → anchor fallback

  **Parallelizable**: YES (with 3)

  **References**:
  - Reducer: `packages/device-camera/src/reducer/index.ts`
  - Search for existing focus handling to understand pattern

  **Acceptance Criteria**:
  - [ ] RED: Write test for ANCHOR_FOCUS event → produces focus effect
  - [ ] GREEN: Implement case if needed
  - [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes

  **Commit**: YES (if changes needed)
  - Message: `fix(device-camera): handle ANCHOR_FOCUS events in reducer`
  - Files: `packages/device-camera/src/reducer/index.ts`, test file

---

- [ ] 5. Verify scale → targetFill fallback works

  **What to do**:
  - Confirm existing fallback `targetFill ?? scale` works
  - Add explicit test case to lock this behavior

  **Parallelizable**: YES (with 3, 4)

  **References**:
  - Reducer: `packages/device-camera/src/reducer/index.ts` - search for `targetFill`

  **Acceptance Criteria**:
  - [ ] Test: FOCUS with `scale: 0.8` → framing has `targetFill: 0.8`
  - [ ] Test: FOCUS with `targetFill: 0.8` works
  - [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes

  **Commit**: YES
  - Message: `test(device-camera): add test for scale to targetFill fallback`
  - Files: test file

---

### Phase 3: Type Fixes

- [ ] 6. Fix TypeScript errors in DSL/IR types

  **What to do**:
  - Update `packages/dsl/src/v2/camera-track.ts` types to accept new fields
  - OR update `packages/ir/src/v2/payloads.ts` to be more permissive
  - Goal: Episode files compile without errors

  **Files with errors**:
  - `feature-showcase.episode.ts` (7 errors: scale, intensityX/Y)
  - `ghibli-showcase.episode.ts` (2 errors: scale)
  - `cyberpunk-showcase.episode.ts` (2 errors: scale)

  **Parallelizable**: NO (depends on 1-5)

  **References**:
  - DSL types: `packages/dsl/src/v2/camera-track.ts` - CameraFocusOptions, CameraShakeOptions
  - IR types: `packages/ir/src/v2/payloads.ts` - CameraPayloads

  **Acceptance Criteria**:
  - [ ] `pnpm turbo run build` passes with 0 errors
  - [ ] All episode files compile
  - [ ] No runtime behavior changes

  **Commit**: YES
  - Message: `fix(dsl): accept legacy camera options for backward compatibility`
  - Files: `packages/dsl/src/v2/camera-track.ts` or `packages/ir/src/v2/payloads.ts`

---

### Phase 4: End-to-End Verification

- [ ] 7. Manual verification of all camera effects

  **What to do**:
  - Run renderer with feature-showcase episode
  - Verify each effect type works visually
  - Document any remaining issues

  **Test Episodes**:
  - `feature-showcase.episode.ts` - has focus, shake
  - `cheating-exposed.episode.ts` - has shake

  **Parallelizable**: NO (final step)

  **Acceptance Criteria**:
  - [ ] Using browser/playwright:
    - Focus effect: camera moves to anchor
    - Shake effect: visible shake with asymmetric intensity
    - Reset effect: camera returns to neutral
  - [ ] No console errors related to camera
  - [ ] Shake is asymmetric when intensityX ≠ intensityY

  **Verification Commands**:

  ```bash
  pnpm dev  # Start dev server
  # Navigate to episode in browser
  # Seek to timestamps with camera effects
  # Verify visually
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                                        | Files                   |
| ---------- | ------------------------------------------------------------------------------ | ----------------------- |
| 1          | `fix(device-camera): preserve intensityX/intensityY at effect level for shake` | reducer/index.ts, tests |
| 2          | `fix(device-camera): handle SHAKE_START/SHAKE_END events in reducer`           | reducer/index.ts, tests |
| 3          | `fix(device-camera): map anchorId to anchor for backward compatibility`        | reducer/index.ts, tests |
| 4          | `fix(device-camera): handle ANCHOR_FOCUS events in reducer`                    | reducer/index.ts, tests |
| 5          | `test(device-camera): add test for scale to targetFill fallback`               | tests                   |
| 6          | `fix(dsl): accept legacy camera options for backward compatibility`            | DSL or IR types         |

---

## Edge Cases to Handle

| Edge Case                                    | Expected Behavior                | Test |
| -------------------------------------------- | -------------------------------- | ---- |
| Only `intensityX` provided (no `intensityY`) | Use `intensityX` for both axes   | Yes  |
| Only `intensity` provided (legacy)           | Use for both axes                | Yes  |
| Both `intensity` and `intensityX/Y` provided | `intensityX/Y` takes precedence  | Yes  |
| No intensity params at all                   | Use defaults from lowering layer | Yes  |
| `anchorId` and `anchor` both provided        | `anchor` takes precedence        | Yes  |

---

## Success Criteria

### Verification Commands

```bash
pnpm turbo run build          # Expected: 0 errors
pnpm turbo run test --filter=@tokovo/device-camera  # Expected: 92+ tests pass
```

### Final Checklist

- [ ] Shake works with intensityX/intensityY
- [ ] Shake backward compatible with intensity
- [ ] SHAKE_START/SHAKE_END events produce shake
- [ ] Focus works with anchorId
- [ ] ANCHOR_FOCUS events produce focus
- [ ] scale maps to targetFill
- [ ] All episode files compile
- [ ] Camera effects work in browser
- [ ] 92+ tests still passing (no regressions)
- [ ] New tests added for schema fallbacks
