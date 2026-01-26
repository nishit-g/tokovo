# Camera .set() Method Fix + Test Episode

## Context

### Original Request

Fix the critical `.set()` method bug causing runtime crashes (`cam.at(...).set is not a function`) and create a test episode for camera verification.

### Current State

- `CameraPointBuilder` class in `packages/dsl/src/core/tracks/camera.ts` is missing `.set()` method
- Reducer in `packages/device-camera/src/reducer/index.ts` doesn't have a `case "set":` handler
- Episodes using `.set()` crash at runtime

---

## Work Objectives

### Core Objective

Add the missing `.set()` method to enable instant camera transforms and create a test episode to verify camera functionality.

### Concrete Deliverables

- `.set()` method added to `CameraPointBuilder` class
- `case "set":` handler in camera reducer
- Test episode file demonstrating all camera methods

### Definition of Done

- [ ] `pnpm turbo run build` passes without errors
- [ ] Test episode renders without crashes
- [ ] Camera effects visible in video-runner preview

### Must Have

- `.set()` method with scale, translateX, translateY, rotation params
- Reducer handler that creates ScheduledCameraEffect for SET events
- Test episode using focus, shake, set, reset, pan methods

### Must NOT Have

- No changes to existing working camera methods
- No modifications to other episodes

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (bun test exists)
- **User wants tests**: Manual verification with test episode
- **Framework**: bun test + manual video-runner verification

---

## TODOs

- [ ] 1. Add `.set()` method to CameraPointBuilder

  **What to do**:
  - Open `packages/dsl/src/core/tracks/camera.ts`
  - After the `pan()` method (around line 202), add:

  ```typescript
  /**
   * Set camera transform directly (instant, no animation).
   * Use for initial camera state or hard cuts.
   */
  set(transform: {
    scale?: number;
    translateX?: number;
    translateY?: number;
    rotation?: number;
  }): void {
    const event: CameraTrackEvent = {
      at: this.frame,
      kind: "CAMERA",
      type: "SET",
      payload: {
        scale: transform.scale,
        translateX: transform.translateX,
        translateY: transform.translateY,
        rotation: transform.rotation,
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }
  ```

  **Must NOT do**:
  - Don't modify any other methods

  **Parallelizable**: YES (with task 2)

  **References**:
  - `packages/dsl/src/core/tracks/camera.ts:188-202` - pan() method pattern to follow
  - `packages/dsl/src/core/tracks/camera.ts:51-67` - CameraPointBuilder constructor for context

  **Acceptance Criteria**:
  - [ ] Method exists after pan() method
  - [ ] TypeScript compiles without errors
  - [ ] `bun run build` in dsl package succeeds

  **Commit**: NO (groups with 2, 3)

---

- [ ] 2. Add SET handler to camera reducer

  **What to do**:
  - Open `packages/device-camera/src/reducer/index.ts`
  - Add new case before the `default:` case (around line 221):

  ```typescript
  case "set": {
    // Instant camera transform - no animation
    const setEffect: ScheduledCameraEffect = {
      id: `set_${at}_${Math.random().toString(36).substr(2, 9)}`,
      type: "focus", // Reuse focus effect type for transforms
      startFrame: at,
      endFrame: at, // Instant - same frame
      priority: 100, // High priority to override other effects
      payload: {
        anchor: "viewport",
        framing: {
          targetFill: (payload.scale as number) ?? 1,
        },
        translateX: payload.translateX as number,
        translateY: payload.translateY as number,
        rotation: payload.rotation as number,
        blendStyle: "none", // Instant, no blend
      },
    };
    draft.camera.scheduledEffects.push(setEffect);
    break;
  }
  ```

  **Must NOT do**:
  - Don't modify existing case handlers

  **Parallelizable**: YES (with task 1)

  **References**:
  - `packages/device-camera/src/reducer/index.ts:155-170` - cut handler pattern (instant effect)
  - `packages/device-camera/src/reducer/index.ts:61-108` - focus handler pattern

  **Acceptance Criteria**:
  - [ ] Case "set" exists in switch statement
  - [ ] TypeScript compiles without errors
  - [ ] `bun run build` in device-camera package succeeds

  **Commit**: NO (groups with 1, 3)

---

- [ ] 3. Create test episode for camera verification

  **What to do**:
  - Create `packages/episodes/src/tests/camera-test.episode.ts`
  - Include all camera methods: focus, shake, set, reset, pan, cut, dutchTilt
  - Keep it short (10-15 seconds) for quick verification

  Example structure:

  ```typescript
  import { defineEpisode } from "@tokovo/dsl";

  export default defineEpisode({
    id: "camera-test",
    title: "Camera System Test",
    fps: 30,
    duration: "15s",
  })
    .device("phone", "iphone-16-pro")
    .app("phone", "whatsapp", { contactName: "Camera Test" })

    .scene("Camera Methods Test", ({ phone }) => {
      // Send a few messages for visual reference
      phone.whatsapp.receive("Testing camera system", { at: "0.5s" });
      phone.whatsapp.send("Let's verify all effects work", { at: "2s" });
      phone.whatsapp.receive("Focus, shake, pan, set, reset!", { at: "4s" });
    })

    .camera((cam) => {
      // 0s - Initial set (instant zoom)
      cam.at("0s").set({ scale: 1.0 });

      // 1s - Focus on anchor
      cam.at("1s").focus("lastMessage", { targetFill: 0.8 });

      // 3s - Shake effect
      cam.at("3s").shake({ intensity: 5, frequency: 10 });

      // 5s - Pan offset
      cam.at("5s").pan(50, 0);

      // 7s - Dutch tilt for drama
      cam.at("7s").dutchTilt(5);

      // 9s - Reset to normal
      cam.at("9s").reset({ blendStyle: "gentle" });

      // 11s - Hard cut via set
      cam.at("11s").set({ scale: 1.3, translateY: -100 });

      // 13s - Final reset
      cam.at("13s").reset();
    });
  ```

  **Must NOT do**:
  - Don't make it too long (keep under 15s for quick iteration)
  - Don't use complex WhatsApp flows that distract from camera testing

  **Parallelizable**: NO (depends on 1, 2)

  **References**:
  - `packages/episodes/src/tests/test.episode.ts` - Existing test episode structure
  - `packages/episodes/src/production/camera-showcase.episode.ts` - Camera usage examples
  - `packages/dsl/src/core/tracks/camera.ts` - All available camera methods

  **Acceptance Criteria**:
  - [ ] File exists at `packages/episodes/src/tests/camera-test.episode.ts`
  - [ ] TypeScript compiles without errors
  - [ ] Episode exports default episode object

  **Commit**: NO (groups with 1, 2)

---

- [ ] 4. Build and verify

  **What to do**:
  - Run `pnpm turbo run build` from repo root
  - Verify no TypeScript errors
  - Run `pnpm turbo run test` to ensure existing tests pass

  **Parallelizable**: NO (depends on 1, 2, 3)

  **References**:
  - Root `package.json` for available scripts

  **Acceptance Criteria**:
  - [ ] `pnpm turbo run build` exits with code 0
  - [ ] `pnpm turbo run test` passes all tests
  - [ ] No TypeScript errors in any package

  **Commit**: YES
  - Message: `fix(camera): add missing .set() method and create test episode`
  - Files:
    - `packages/dsl/src/core/tracks/camera.ts`
    - `packages/device-camera/src/reducer/index.ts`
    - `packages/episodes/src/tests/camera-test.episode.ts`
  - Pre-commit: `pnpm turbo run build && pnpm turbo run test`

---

- [ ] 5. Manual verification in video-runner

  **What to do**:
  - Start video-runner: `cd apps/video-runner && pnpm dev`
  - Select `camera-test` episode from dropdown
  - Verify each camera effect:
    - 0s: Camera at default scale (set)
    - 1s: Smooth focus on last message
    - 3s: Camera shake visible
    - 5s: Camera pans right
    - 7s: Slight rotation (dutch tilt)
    - 9s: Smooth reset to normal
    - 11s: Instant zoom + vertical offset (set)
    - 13s: Final reset

  **Parallelizable**: NO (depends on 4)

  **References**:
  - `apps/video-runner/` - Remotion preview app

  **Acceptance Criteria**:
  - [ ] Episode renders without console errors
  - [ ] Focus effect smoothly zooms to message
  - [ ] Shake effect creates visible camera movement
  - [ ] Set effect applies instant transform (no animation)
  - [ ] Reset effect returns camera to default state

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                          | Files                                       | Verification                 |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| 4          | `fix(camera): add missing .set() method and create test episode` | camera.ts, index.ts, camera-test.episode.ts | pnpm turbo run build && test |

---

## Success Criteria

### Verification Commands

```bash
pnpm turbo run build  # Expected: 0 exit code, no errors
pnpm turbo run test   # Expected: All tests pass
cd apps/video-runner && pnpm dev  # Expected: Preview loads, camera-test works
```

### Final Checklist

- [ ] `.set()` method exists and works
- [ ] Reducer handles SET events
- [ ] Test episode demonstrates all camera methods
- [ ] No runtime errors in video-runner
- [ ] All existing tests still pass
