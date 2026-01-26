# Implement Missing Camera Effects in CameraBrain

## Context

### Original Request

Camera system shows no visual effects - focus is the only effect type actually processed. User wants ALL camera effects working: shake, dutch-tilt, flash, cut, reset, pan.

### Root Cause Analysis

The camera pipeline has 3 stages:

1. **Lowering** (`handler.ts`) ✅ Works - transforms DSL→Runtime events
2. **Reducer** (`reducer/index.ts`) ✅ Works - creates `scheduledEffects` for all 6 types
3. **CameraBrain** (`CameraBrain.ts`) ❌ BROKEN - **Only processes `focus` type!**

**Evidence** (CameraBrain.ts:43-44):

```typescript
const activeFocusEffects = scheduledEffects.filter(
  (e) => e.type === "focus" && ...
);
```

All other effects (shake, reset, cut, dutch-tilt, flash) are scheduled but NEVER read or applied.

### Effect Types Status

| Type       | Lowered    | Scheduled | Processed        | Visual |
| ---------- | ---------- | --------- | ---------------- | ------ |
| focus      | ✅         | ✅        | ✅               | ✅     |
| shake      | ✅         | ✅        | ❌               | ❌     |
| reset      | ✅         | ✅        | ⚠️ boundary only | ❌     |
| cut        | ✅         | ✅        | ⚠️ boundary only | ❌     |
| dutch-tilt | ✅         | ✅        | ❌               | ❌     |
| flash      | ✅         | ✅        | ❌               | ❌     |
| pan        | ❌ missing | ❌        | ❌               | ❌     |

---

## Work Objectives

### Core Objective

Implement processing for ALL camera effect types in CameraBrain so they produce visible results.

### Concrete Deliverables

1. `processFrame()` handles shake, dutch-tilt, reset, cut effects
2. Flash effect renders as overlay in TokovoRenderer
3. Pan event added to lowering pipeline
4. All effects visible in camera-test episode

### Definition of Done

- [ ] camera-test.episode.ts shows visible shake effect
- [ ] camera-test.episode.ts shows visible dutch-tilt (rotation)
- [ ] camera-test.episode.ts shows flash overlay
- [ ] camera-showcase.episode.ts renders all effects correctly
- [ ] No console errors

### Must NOT Have

- Don't break existing focus effect
- Don't change DSL API
- Don't modify reducer (it's correct)

---

## Architecture Understanding

### CameraTransform Type (from types/brain.ts)

```typescript
interface CameraTransform {
  scale: number; // zoom level
  originX: number; // 0-1, transform origin X
  originY: number; // 0-1, transform origin Y
  translateX: number; // pixel offset X
  translateY: number; // pixel offset Y
  rotation: number; // degrees
  shakeX: number; // shake offset X
  shakeY: number; // shake offset Y
}
```

### Effect Payloads (from types/effects-v2.ts)

```typescript
ShakePayload { intensity, frequency, decay }
DutchTiltPayload { angle, blendStyle }
ResetPayload { blendStyle }
CutPayload { }
FlashPayload { color, intensity }
```

### How Effects Should Modify Transform

| Effect     | Transform Properties         |
| ---------- | ---------------------------- |
| shake      | shakeX, shakeY (oscillating) |
| dutch-tilt | rotation                     |
| reset      | all → default                |
| cut        | instant jump to target       |
| flash      | N/A (overlay, not transform) |

---

## TODOs

- [x] 1. Add shake effect processing to CameraBrain

  **What to do**:
  In `processFrame()` after focus handling, add shake processing:

  ```typescript
  // After line 107 (before final return)

  // Process shake effects
  const activeShakeEffects = scheduledEffects.filter(
    (e) => e.type === "shake" && e.startFrame <= frame && frame <= e.endFrame,
  );

  if (activeShakeEffects.length > 0) {
    const shake = activeShakeEffects[0];
    const payload = shake.payload as ShakePayload;
    const intensity = payload.intensity ?? 5;
    const frequency = payload.frequency ?? 10;
    const decay = payload.decay ?? 0.9;

    // Calculate decay based on progress through effect
    const progress =
      (frame - shake.startFrame) / (shake.endFrame - shake.startFrame);
    const decayMultiplier = Math.pow(decay, progress * 10);

    // Perlin-like shake using sin waves at different frequencies
    const time = frame / 30; // Normalize to seconds
    const shakeX = Math.sin(time * frequency) * intensity * decayMultiplier;
    const shakeY =
      Math.sin(time * frequency * 1.3 + 0.5) * intensity * decayMultiplier;

    // Apply to transform
    result.transform = {
      ...result.transform,
      shakeX,
      shakeY,
    };
  }
  ```

  **Must NOT do**:
  - Don't modify focus effect logic
  - Don't change function signature

  **Parallelizable**: NO (foundational)

  **References**:
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/brain/CameraBrain.ts:35-108` - processFrame function
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/types/effects-v2.ts` - ShakePayload type
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/reducer/index.ts:110-131` - How shake is scheduled

  **Acceptance Criteria**:
  - [ ] TypeScript compiles: `pnpm tsc --noEmit -p packages/device-camera/tsconfig.json`
  - [ ] camera-test episode shows visible shaking at 6s mark
  - [ ] Shake decays over time (less intense toward end)

  **Commit**: YES
  - Message: `feat(device-camera): implement shake effect processing in CameraBrain`
  - Files: `packages/device-camera/src/brain/CameraBrain.ts`

---

- [x] 2. Add dutch-tilt effect processing to CameraBrain

  **What to do**:
  Add dutch-tilt processing after shake:

  ```typescript
  // Process dutch-tilt effects
  const activeDutchEffects = scheduledEffects.filter(
    (e) =>
      e.type === "dutch-tilt" && e.startFrame <= frame && frame <= e.endFrame,
  );

  if (activeDutchEffects.length > 0) {
    const dutch = activeDutchEffects[0];
    const payload = dutch.payload as DutchTiltPayload;
    const targetAngle = payload.angle ?? 5;

    // Ease in over first 10 frames
    const easeInFrames = 10;
    const frameIntoEffect = frame - dutch.startFrame;
    const easeProgress = Math.min(frameIntoEffect / easeInFrames, 1);
    const easedAngle = targetAngle * (1 - Math.pow(1 - easeProgress, 3));

    result.transform = {
      ...result.transform,
      rotation: result.transform.rotation + easedAngle,
    };
  }
  ```

  **Parallelizable**: YES (with task 3, 4)

  **References**:
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/brain/CameraBrain.ts` - Add after shake
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/types/effects-v2.ts` - DutchTiltPayload

  **Acceptance Criteria**:
  - [ ] TypeScript compiles
  - [ ] camera-test episode shows rotation at 8s mark
  - [ ] Rotation eases in smoothly

  **Commit**: YES (combine with task 1)
  - Message: `feat(device-camera): implement shake and dutch-tilt effects`

---

- [x] 3. Add reset effect processing to CameraBrain

  **What to do**:
  Process reset to return camera to default:

  ```typescript
  // Process reset effects
  const activeResetEffects = scheduledEffects.filter(
    (e) => e.type === "reset" && e.startFrame <= frame && frame <= e.endFrame,
  );

  if (activeResetEffects.length > 0) {
    const reset = activeResetEffects[0];
    const payload = reset.payload as ResetPayload;

    // Blend back to default over duration
    const progress =
      (frame - reset.startFrame) /
      Math.max(reset.endFrame - reset.startFrame, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    result.transform = interpolateTransform(
      result.transform,
      DEFAULT_CAMERA_TRANSFORM,
      eased,
    );

    if (progress >= 1) {
      result.mode = "idle";
    }
  }
  ```

  **Parallelizable**: YES (with task 2, 4)

  **References**:
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/brain/CameraBrain.ts:254-270` - interpolateTransform exists
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/types/brain.ts` - DEFAULT_CAMERA_TRANSFORM

  **Acceptance Criteria**:
  - [ ] Reset smoothly returns to default transform
  - [ ] camera-test episode resets at 4s and 14s

  **Commit**: YES (combine with 1, 2)

---

- [x] 4. Add cut effect processing to CameraBrain

  **What to do**:
  Process cut for instant camera changes:

  ```typescript
  // Process cut effects (instant, no blend)
  const activeCutEffects = scheduledEffects.filter(
    (e) => e.type === "cut" && e.startFrame === frame,
  );

  if (activeCutEffects.length > 0) {
    // Cut instantly resets to default or target
    result.transform = DEFAULT_CAMERA_TRANSFORM;
    result.mode = "idle";
    result.blend = null;
  }
  ```

  **Parallelizable**: YES (with task 2, 3)

  **References**:
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/reducer/index.ts:155-170` - How cut is scheduled

  **Acceptance Criteria**:
  - [ ] Cut produces instant camera change (no blend)

  **Commit**: YES (combine all brain changes)
  - Message: `feat(device-camera): implement all camera effects in CameraBrain`

---

- [x] 5. Add flash effect to TokovoRenderer

  **What to do**:
  Flash is NOT a transform - it's an overlay. Add to TokovoRenderer:
  1. In `useCameraEngine.ts`, return flash state:

  ```typescript
  // Add to return type
  interface CameraEngineResult {
    cameraStyle: CSSProperties;
    deviceStyle: CSSProperties;
    flash: { color: string; opacity: number } | null;
  }

  // In useCameraEngine, after processFrame:
  const activeFlash = state.scheduledEffects.find(
    (e) => e.type === "flash" && e.startFrame <= t && t <= e.endFrame,
  );

  let flash = null;
  if (activeFlash) {
    const payload = activeFlash.payload as FlashPayload;
    const progress =
      (t - activeFlash.startFrame) /
      (activeFlash.endFrame - activeFlash.startFrame);
    const opacity = (payload.intensity ?? 1) * (1 - progress); // Fade out
    flash = { color: payload.color ?? "white", opacity };
  }

  return { cameraStyle, deviceStyle, flash };
  ```

  2. In `TokovoRenderer.tsx`, render flash overlay:

  ```tsx
  {
    flash && flash.opacity > 0 && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: flash.color,
          opacity: flash.opacity,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    );
  }
  ```

  **Parallelizable**: NO (depends on tasks 1-4)

  **References**:
  - `/Users/nishit.gupta/personal/tokovo/packages/renderer/src/engines/useCameraEngine.ts` - Hook to modify
  - `/Users/nishit.gupta/personal/tokovo/packages/renderer/src/TokovoRenderer.tsx:95-101` - Where hook is called
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/types/effects-v2.ts` - FlashPayload

  **Acceptance Criteria**:
  - [ ] camera-test episode shows white flash at 10s
  - [ ] Flash fades out over its duration

  **Commit**: YES
  - Message: `feat(renderer): add flash overlay effect`
  - Files: `packages/renderer/src/engines/useCameraEngine.ts`, `packages/renderer/src/TokovoRenderer.tsx`

---

- [x] 6. Add PAN to lowering handler

  **What to do**:
  The DSL `pan()` method creates a "PAN" event, but handler.ts doesn't handle it.

  Add to `cameraV2Lowering()` in handler.ts:

  ```typescript
  // =================================================================
  // PAN → focus with translate
  // =================================================================
  case "PAN":
    return [
      {
        ...baseEvent,
        type: "focus",
        anchorId: "viewport",
        translateX: payload?.x ?? 0,
        translateY: payload?.y ?? 0,
        duration: payload?.duration,
      },
    ];
  ```

  **Parallelizable**: YES (with tasks 1-4)

  **References**:
  - `/Users/nishit.gupta/personal/tokovo/packages/device-camera/src/lowering/handler.ts:58-225` - Switch statement
  - `/Users/nishit.gupta/personal/tokovo/packages/dsl/src/core/tracks/camera.ts` - pan() method creates PAN event

  **Acceptance Criteria**:
  - [ ] No warning in console for PAN event type
  - [ ] Pan produces camera translation

  **Commit**: YES
  - Message: `feat(device-camera): add PAN event to lowering handler`
  - Files: `packages/device-camera/src/lowering/handler.ts`

---

- [x] 7. Verify all effects work in camera-test episode

  **What to do**:
  - Run dev server
  - Open camera-test episode in Remotion Studio
  - Verify each effect at its timestamp:
    - 0s: set (instant position)
    - 2s: focus (zoom to viewport)
    - 4s: reset (return to default)
    - 6s: shake (screen shakes)
    - 8s: dutchTilt (rotates 5 degrees)
    - 10s: flash (white flash)
    - 12s: pan (translates)
    - 14s: reset (final reset)

  **Parallelizable**: NO (final verification)

  **Acceptance Criteria**:
  - [ ] All 8 effects visible at correct timestamps
  - [ ] No console errors
  - [ ] Smooth transitions between effects

  **Commit**: NO

---

## Commit Strategy

| After Task | Message                                                            | Files                                  |
| ---------- | ------------------------------------------------------------------ | -------------------------------------- |
| 1-4        | `feat(device-camera): implement all camera effects in CameraBrain` | CameraBrain.ts                         |
| 5          | `feat(renderer): add flash overlay effect`                         | useCameraEngine.ts, TokovoRenderer.tsx |
| 6          | `feat(device-camera): add PAN event to lowering handler`           | handler.ts                             |

---

## Success Criteria

### Verification Commands

```bash
# Type check
pnpm turbo build --filter=@tokovo/device-camera
pnpm turbo build --filter=@tokovo/renderer

# Dev server
pnpm turbo dev --filter=video-runner
# Open localhost:3004 → camera-test episode
```

### Final Checklist

- [ ] shake effect produces visible screen shake
- [ ] dutch-tilt rotates the camera
- [ ] flash shows white overlay that fades
- [ ] reset returns to default smoothly
- [ ] cut produces instant change
- [ ] pan translates the camera
- [ ] camera-showcase.episode.ts works without errors
