# Fix Camera `set()` Method Bug + Create Test Episode

## Context

### Original Request

Fix runtime error: `cam.at(...).set is not a function` in camera-showcase.episode.ts, and create a test episode to verify camera actions work.

### Root Cause Analysis

The `CameraPointBuilder` class exported from `@tokovo/dsl` is **missing the `set()` method**.

**Evidence:**

- V2 version (`/packages/dsl/src/v2/camera-track.ts:73-88`) has `set()` method
- Core version (`/packages/dsl/src/core/tracks/camera.ts`) does NOT have it
- `@tokovo/dsl` main export (`src/index.ts:11`) exports from `./core`
- Episodes import from `@tokovo/dsl`, getting the incomplete Core version
- `camera-showcase.episode.ts:69` calls `cam.at("0s").set({ scale: 1 })` → crashes

---

## Work Objectives

### Core Objective

Add the missing `set()` method to `CameraPointBuilder` in the core tracks module and create a simple test episode.

### Concrete Deliverables

1. `set()` method added to `/packages/dsl/src/core/tracks/camera.ts`
2. `CameraSetOptions` interface exported
3. Test episode file at `/packages/episodes/src/production/camera-test.episode.ts`

### Definition of Done

- [ ] `cam.at("0s").set({ scale: 1 })` works without error
- [ ] `camera-showcase.episode.ts` renders without crashes
- [ ] New test episode loads in Remotion Studio

### Must NOT Have

- Do not modify the V2 camera-track.ts (it already works)
- Do not change episode DSL API signatures
- Do not add unnecessary methods beyond `set()`

---

## TODOs

- [ ] 1. Add `CameraSetOptions` interface to core camera module

  **What to do**:
  - Open `/packages/dsl/src/core/tracks/camera.ts`
  - Add `CameraSetOptions` interface after `CameraPanOptions` (around line 45):
    ```typescript
    export interface CameraSetOptions {
      x?: number;
      y?: number;
      scale?: number;
      rotation?: number;
      originX?: number;
      originY?: number;
    }
    ```

  **Parallelizable**: NO (dependency for task 2)

  **References**:
  - `/packages/dsl/src/v2/camera-track.ts:19-26` - The exact interface to copy

  **Acceptance Criteria**:
  - [ ] Interface exists after line 45
  - [ ] TypeScript compiles: `cd packages/dsl && pnpm tsc --noEmit` → no errors

  **Commit**: NO (groups with task 2)

---

- [ ] 2. Add `set()` method to `CameraPointBuilder` class

  **What to do**:
  - In `/packages/dsl/src/core/tracks/camera.ts`, add `set()` method to `CameraPointBuilder` class (after constructor, before `focus()`):
    ```typescript
    /**
     * Set camera state instantly (no animation).
     */
    set(options: CameraSetOptions): void {
      const event: CameraTrackEvent = {
        at: this.frame,
        kind: "CAMERA",
        type: "SET",
        payload: {
          x: options.x,
          y: options.y,
          scale: options.scale,
          rotation: options.rotation,
          originX: options.originX,
          originY: options.originY,
        },
        _declarationOrder: this.getOrder(),
      };
      this.events.push(event);
    }
    ```

  **Must NOT do**:
  - Don't modify other methods
  - Don't change class constructor

  **Parallelizable**: NO (depends on task 1)

  **References**:
  - `/packages/dsl/src/v2/camera-track.ts:70-88` - The exact implementation to copy
  - `/packages/dsl/src/core/tracks/camera.ts:51-67` - Where to insert (after constructor)

  **Acceptance Criteria**:
  - [ ] Method exists in CameraPointBuilder class
  - [ ] TypeScript compiles: `cd packages/dsl && pnpm tsc --noEmit` → no errors

  **Commit**: YES
  - Message: `fix(dsl): add missing set() method to CameraPointBuilder`
  - Files: `packages/dsl/src/core/tracks/camera.ts`

---

- [ ] 3. Export `CameraSetOptions` from core index

  **What to do**:
  - Check if `/packages/dsl/src/core/index.ts` exports `CameraSetOptions`
  - If not, add it to the type exports
  - Check if `/packages/dsl/src/index.ts` re-exports it
  - If not, add to the type exports there too

  **Parallelizable**: NO (depends on task 2)

  **References**:
  - `/packages/dsl/src/core/index.ts` - Core barrel file
  - `/packages/dsl/src/index.ts:17-31` - Main barrel type exports

  **Acceptance Criteria**:
  - [ ] `import type { CameraSetOptions } from "@tokovo/dsl"` works
  - [ ] TypeScript compiles

  **Commit**: YES (if changes needed)
  - Message: `fix(dsl): export CameraSetOptions type`
  - Files: `packages/dsl/src/core/index.ts`, `packages/dsl/src/index.ts`

---

- [ ] 4. Verify camera-showcase.episode.ts works

  **What to do**:
  - Run the dev server
  - Navigate to camera-showcase episode in Remotion Studio
  - Verify no runtime errors

  **Parallelizable**: NO (depends on task 2)

  **References**:
  - `/packages/episodes/src/production/camera-showcase.episode.ts` - The failing episode

  **Acceptance Criteria**:
  - [ ] Start dev: `pnpm turbo dev --filter=video-runner`
  - [ ] Open Remotion Studio at localhost:3004
  - [ ] Select "camera-showcase" episode
  - [ ] No console errors about `set is not a function`
  - [ ] Episode preview renders

  **Commit**: NO

---

- [ ] 5. Create simple camera test episode

  **What to do**:
  - Create `/packages/episodes/src/production/camera-test.episode.ts`
  - Test all camera methods: `set()`, `focus()`, `shake()`, `reset()`, `dutchTilt()`, `flash()`, `pan()`
  - Keep it minimal - just verify each method works

  **Parallelizable**: NO (depends on task 4)

  **References**:
  - `/packages/episodes/src/production/camera-showcase.episode.ts` - Pattern to follow
  - `/packages/dsl/src/core/tracks/camera.ts` - Available camera methods

  **Episode structure**:

  ```typescript
  import { defineEpisode } from "../types/episode-definition";
  import { episode } from "@tokovo/dsl";
  import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";

  let orderCounter = 0;
  const getOrder = () => orderCounter++;

  export default defineEpisode({
    meta: {
      id: "camera-test",
      title: "Camera Methods Test",
      description: "Tests all camera methods work correctly",
      category: "production",
      tags: ["camera", "test"],
    },
    config: {
      format: "1080x1920",
      durationInFrames: 450, // 15 seconds at 30fps
      apps: ["app_whatsapp"],
    },
    build: () =>
      episode("camera-test", {
        fps: 30,
        duration: "15s",
        title: "Camera Test",
      })
        .device("phone", "iphone16", {
          app: "app_whatsapp",
          conversations: [{ id: "dm_test", name: "Test", avatar: "" }],
        })
        .track(
          "app_whatsapp",
          () => new WhatsAppTrackBuilder(30, "phone", "dm_test", getOrder),
          (wa) => {
            wa.at("1s").receive("Test", "Testing camera methods...");
            wa.at("5s").receive("Test", "All methods working!");
          },
        )
        .camera((cam) => {
          // Test set()
          cam.at("0s").set({ scale: 1 });

          // Test focus()
          cam.at("2s").focus("viewport", { targetFill: 1.2 });

          // Test reset()
          cam.at("4s").reset({ blendStyle: "gentle" });

          // Test shake()
          cam.at("6s").shake({ intensity: 5, decay: 0.9 });

          // Test dutchTilt()
          cam.at("8s").dutchTilt(5);

          // Test flash()
          cam.at("10s").flash({ color: "white", intensity: 0.5 });

          // Test pan()
          cam.at("12s").pan(10, 0, { duration: 1 });

          // Final reset
          cam.at("14s").reset();
        })
        .build(),
  });
  ```

  **Acceptance Criteria**:
  - [ ] File exists at correct path
  - [ ] TypeScript compiles: `pnpm turbo build --filter=@tokovo/episodes`
  - [ ] Episode appears in Remotion Studio under "Production" folder
  - [ ] Episode preview renders without errors

  **Commit**: YES
  - Message: `test(episodes): add camera-test episode to verify camera methods`
  - Files: `packages/episodes/src/production/camera-test.episode.ts`

---

- [ ] 6. Register test episode in barrel file

  **What to do**:
  - Add import to `/packages/episodes/src/production/index.ts`:
    ```typescript
    import "./camera-test.episode";
    ```

  **Parallelizable**: NO (depends on task 5)

  **References**:
  - `/packages/episodes/src/production/index.ts` - Barrel file

  **Acceptance Criteria**:
  - [ ] Import line added
  - [ ] Episode auto-registers when dev server starts

  **Commit**: YES (combine with task 5)
  - Message: `test(episodes): add camera-test episode to verify camera methods`
  - Files: `packages/episodes/src/production/index.ts`

---

## Success Criteria

### Verification Commands

```bash
# Build check
pnpm turbo build --filter=@tokovo/dsl

# Type check
cd packages/dsl && pnpm tsc --noEmit

# Dev server
pnpm turbo dev --filter=video-runner
# → Open localhost:3004
# → Select camera-showcase → no errors
# → Select camera-test → no errors
```

### Final Checklist

- [ ] `cam.at().set()` method works
- [ ] camera-showcase.episode.ts renders
- [ ] camera-test.episode.ts exists and renders
- [ ] All camera methods callable without runtime errors
