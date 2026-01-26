# Camera System Fix & Documentation

## Context

### Original Request

User reported camera effects not working as expected:

- Camera in `track-demo-v2` zooming OUT instead of IN
- Effects in `camera-showcase` episodes not working
- Unclear if WhatsApp anchors need refactoring

### Brutal Audit Results

**5 Critical Bugs Discovered:**

| Bug                           | Severity    | Location                                           | Impact                                                                                      |
| ----------------------------- | ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Coordinate Space Mismatch** | 🔴 CRITICAL | `useCameraEngine.ts:70-73` vs `CameraBrain.ts:192` | Physical pixels (1290) vs Logical pixels (393) = scale 3.77x instead of 1.15x               |
| **Event Type Mismatch**       | 🔴 CRITICAL | `cameraReducer` switch statement                   | V2 events `ANCHOR_FOCUS` normalize to `anchor-focus` which is NOT handled → effects IGNORED |
| **Payload Key Mismatch**      | 🟠 HIGH     | DSL vs Reducer                                     | `payload.anchorId` vs `payload.anchor` → fallback to viewport                               |
| **Missing HOLD Effect**       | 🟠 HIGH     | `cameraReducer`                                    | HOLD effect not implemented                                                                 |
| **Anchor Naming**             | 🟡 MEDIUM   | WhatsApp anchors                                   | `inputArea` vs `input` → wrong framing                                                      |

**Broken Episodes:**

- `camera-showcase.episode.ts` - BROKEN
- `smart-camera-demo.episode.ts` - BROKEN
- `manual-camera-showcase.dsl.ts` - BROKEN
- `semantic-camera-showcase.dsl.ts` - BROKEN (calls deleted `.zoom()`)
- `track-demo-v2` - BROKEN (coordinate mismatch)
- `full-cinematic-showcase.dsl.ts` - WORKS (uses legacy V1 effects)

### Architecture Summary

```
DSL Layer (CameraTrackBuilder)
    │ emits: { type: "ANCHOR_FOCUS", payload: { anchorId: "profile" } }
    ▼
cameraReducer (packages/device-camera/src/reducer/index.ts)
    │ normalizes event.type to kebab-case
    │ switch(type) handles: focus, pan, track, zoom, shake, set
    │ ❌ MISSING: anchor-focus, anchor-track, hold
    ▼
CameraBrain.processFrame()
    │ reads scheduledEffects, resolves anchors, computes transform
    │ ❌ BUG: viewport in physical pixels, anchors in logical pixels
    ▼
useCameraEngine → buildCameraCSS
    │ converts transform to CSS
    ▼
TokovoRenderer applies cameraStyle to wrapper div
```

---

## Work Objectives

### Core Objective

Fix all critical camera bugs and create comprehensive documentation so the camera system works as intended.

### Concrete Deliverables

**Bug Fixes (Priority Order):**

1. Fix coordinate space mismatch in `useCameraEngine.ts`
2. Add missing event types to `cameraReducer` (`anchor-focus`, `anchor-track`, `hold`)
3. Fix payload key normalization (`anchorId` → `anchor`)
4. Fix WhatsApp anchor naming (`input` → `inputArea`)
5. Update broken episodes to use correct API

**Documentation:**

- `docs/camera/README.md` - Overview and quick start
- `docs/camera/ARCHITECTURE.md` - System design and data flow
- `docs/camera/API.md` - DSL methods reference
- `docs/camera/ANCHORS.md` - Anchor system documentation
- `docs/camera/KNOWN_ISSUES.md` - Current limitations and workarounds

### Definition of Done

- [x] `track-demo-v2` camera zooms IN correctly (not inverted)
- [x] `camera-showcase` episodes run without console warnings
- [x] All 5 camera showcase episodes work
- [x] 99+ device-camera tests pass
- [x] Documentation exists in `docs/camera/`
- [x] Build passes with no type errors

### Must Have

- Fix coordinate space to use consistent units (logical pixels)
- Handle all V2 event types in reducer
- Documentation covering architecture and API

### Must NOT Have (Guardrails)

- DO NOT break legacy V1 effects (ZOOM, PAN, SHAKE still work)
- DO NOT remove backwards compatibility with existing episodes
- DO NOT change CameraBrain's pure function signature
- DO NOT modify anchor resolution fallback logic (it's correct)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES
- **User wants tests**: Run existing tests + manual visual verification
- **Framework**: bun test via turbo + Playwright for visual

### Verification Commands

```bash
# After each change
pnpm turbo run test --filter=@tokovo/device-camera

# Visual verification
pnpm turbo run dev --filter=@tokovo/video-runner
# Load track-demo-v2 and verify camera zooms IN (not out)

# Final
pnpm turbo run build
```

---

## Task Flow

```
Bug Fixes (Sequential - each depends on previous):
Task 1 (Coordinate Space) → Task 2 (Event Types) → Task 3 (Payload) → Task 4 (Anchors) → Task 5 (Episodes)

Documentation (Parallel after bug fixes):
Task 6 (README) ─┐
Task 7 (ARCH)  ──┼─→ Task 11 (Final Verification)
Task 8 (API)   ──┤
Task 9 (ANCHORS)─┤
Task 10 (ISSUES)─┘
```

## Parallelization

| Group          | Tasks          | Reason                              |
| -------------- | -------------- | ----------------------------------- |
| A (Sequential) | 1, 2, 3, 4, 5  | Bug fixes depend on each other      |
| B (Parallel)   | 6, 7, 8, 9, 10 | Documentation files are independent |

---

## TODOs

### BUG FIXES

- [x] 1. Fix coordinate space mismatch in useCameraEngine

  **What to do**:
  - Open `packages/renderer/src/engines/useCameraEngine.ts`
  - Line 70-73: Change viewport from physical to logical dimensions
  - Current: `viewport = { width: profile.dimensions.width, height: profile.dimensions.height }`
  - Fix: `viewport = { width: profile.screen.width, height: profile.screen.height }` (logical)
  - OR: Normalize anchors to physical pixels before passing to CameraBrain

  **Why this fixes the zoom direction**:
  - Currently: `scale = (1290 * 1.15) / 393 = 3.77x` (massive zoom)
  - After fix: `scale = (393 * 1.15) / 393 = 1.15x` (correct zoom)

  **Must NOT do**:
  - Do NOT change CameraBrain's math - it's correct
  - Do NOT modify anchor resolution logic

  **Parallelizable**: NO (must be first)

  **References**:
  - `packages/renderer/src/engines/useCameraEngine.ts:70-73` - viewport definition
  - `packages/device-camera/src/brain/CameraBrain.ts:192` - scale calculation
  - `packages/core/src/types/device.ts` - DeviceProfile with dimensions vs screen

  **Acceptance Criteria**:
  - [x] `track-demo-v2` camera zooms IN (not out) when focusing
  - [x] Scale values in console are reasonable (1.0-2.5 range, not 3.77)
  - [x] Tests pass: `pnpm turbo run test --filter=@tokovo/device-camera`

  **Commit**: YES
  - Message: `fix(camera): normalize viewport to logical pixels in useCameraEngine`
  - Files: `packages/renderer/src/engines/useCameraEngine.ts`

---

- [x] 2. Add missing event types to cameraReducer

  **What to do**:
  - Open `packages/device-camera/src/reducer/index.ts`
  - Find the switch statement (around line 50-150)
  - Add cases for: `anchor-focus`, `anchor-track`, `hold`
  - Map them to existing logic:

    ```typescript
    case "anchor-focus":
    case "focus":
      // existing focus logic
      break;

    case "anchor-track":
    case "track":
      // existing track logic
      break;

    case "hold":
      // new: schedule a hold effect (maintain current transform)
      break;
    ```

  **Must NOT do**:
  - Do NOT remove existing event type handlers
  - Do NOT change event normalization logic

  **Parallelizable**: NO (depends on Task 1)

  **References**:
  - `packages/device-camera/src/reducer/index.ts` - switch statement
  - `packages/dsl/src/v2/camera-track.ts` - V2 event types emitted
  - `packages/device-camera/src/types/effects-v2.ts` - effect type definitions

  **Acceptance Criteria**:
  - [x] `camera-showcase.episode.ts` runs without "unhandled event type" warnings
  - [x] V2 DSL `.focus()` calls produce visible camera effects
  - [x] Tests pass

  **Commit**: YES
  - Message: `fix(camera): add anchor-focus, anchor-track, hold handlers to reducer`
  - Files: `packages/device-camera/src/reducer/index.ts`

---

- [x] 3. Fix payload key normalization

  **What to do**:
  - In reducer, normalize `payload.anchorId` to `payload.anchor`:
    ```typescript
    const anchor = payload.anchor ?? payload.anchorId ?? "viewport";
    ```
  - Apply this normalization in focus and track handlers

  **Must NOT do**:
  - Do NOT change DSL output format
  - Do NOT break existing episodes using `payload.anchor`

  **Parallelizable**: NO (depends on Task 2)

  **References**:
  - `packages/device-camera/src/reducer/index.ts` - focus handler
  - `packages/dsl/src/v2/camera-track.ts` - uses `anchorId`
  - `packages/dsl/src/helpers/camera.ts` - uses `anchor`

  **Acceptance Criteria**:
  - [x] Focus effects work with both `anchorId` and `anchor` in payload
  - [x] No fallback to "viewport" when anchor is specified

  **Commit**: YES
  - Message: `fix(camera): normalize anchorId to anchor in reducer payload handling`
  - Files: `packages/device-camera/src/reducer/index.ts`

---

- [x] 4. Fix WhatsApp anchor naming

  **What to do**:
  - Open `packages/apps-whatsapp/src/runtime/adapters/anchors.ts`
  - Find framing configuration (defines anchor appearance preferences)
  - Rename `"input"` to `"inputArea"` to match registered semantic region

  **Must NOT do**:
  - Do NOT change the semantic region names in layout engine
  - Do NOT modify anchor resolution fallback chains

  **Parallelizable**: NO (depends on Task 3)

  **References**:
  - `packages/apps-whatsapp/src/runtime/adapters/anchors.ts` - framing config
  - `packages/apps-whatsapp/src/layout/chat.ts` - registers `inputArea`

  **Acceptance Criteria**:
  - [x] Focus on `inputArea` uses correct framing (0.9 targetFill, not default 0.6)
  - [x] WhatsApp camera demos show tight focus on input area

  **Commit**: YES
  - Message: `fix(whatsapp): align anchor framing key with registered name`
  - Files: `packages/apps-whatsapp/src/runtime/adapters/anchors.ts`

---

- [x] 5. Update broken episodes

  **What to do**:
  - Fix `semantic-camera-showcase.dsl.ts`:
    - Replace `.zoom()` calls with `.focus()` using `targetFill`
  - Verify all other camera episodes work after bug fixes
  - Remove any references to undefined anchors

  **Must NOT do**:
  - Do NOT delete episode files
  - Do NOT change episode narrative/timing significantly

  **Parallelizable**: NO (depends on Tasks 1-4)

  **References**:
  - `packages/dsl/examples/semantic-camera-showcase.dsl.ts`
  - `packages/episodes/src/production/camera-showcase.episode.ts`
  - `packages/episodes/src/production/smart-camera-demo.episode.ts`

  **Acceptance Criteria**:
  - [x] All 5 camera showcase episodes run without errors
  - [x] Visual effects match intended behavior
  - [x] Build passes: `pnpm turbo run build`

  **Commit**: YES
  - Message: `fix(episodes): update camera episodes to use V2 API correctly`
  - Files: Multiple episode files

---

### DOCUMENTATION

- [x] 6. Create docs/camera/README.md

- [x] 7. Create docs/camera/ARCHITECTURE.md

- [x] 8. Create docs/camera/API.md

- [x] 9. Create docs/camera/ANCHORS.md

- [x] 10. Create docs/camera/KNOWN_ISSUES.md

---

- [x] 11. Final verification

  **What to do**:
  - Run full test suite
  - Run full build
  - Visually verify camera demos in video-runner
  - Confirm all documentation links work

  **Parallelizable**: NO (depends on all tasks)

  **Acceptance Criteria**:
  - [x] `pnpm turbo run test` - All tests pass
  - [x] `pnpm turbo run build` - No errors
  - [x] `track-demo-v2` - Camera zooms IN correctly
  - [x] `camera-showcase` - All effects visible
  - [x] `docs/camera/` - All 5 files exist with correct content

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                             | Files              |
| ---------- | --------------------------------------------------- | ------------------ |
| 1          | `fix(camera): normalize viewport to logical pixels` | useCameraEngine.ts |
| 2          | `fix(camera): add missing event type handlers`      | reducer/index.ts   |
| 3          | `fix(camera): normalize anchorId to anchor`         | reducer/index.ts   |
| 4          | `fix(whatsapp): align anchor framing keys`          | anchors.ts         |
| 5          | `fix(episodes): update camera episodes for V2`      | \*.episode.ts      |
| 10         | `docs(camera): add comprehensive documentation`     | docs/camera/\*.md  |

---

## Success Criteria

### Verification Commands

```bash
pnpm turbo run test                    # All tests pass
pnpm turbo run build                   # No errors
ls docs/camera/                        # 5 .md files exist
```

### Visual Verification

- [x] `track-demo-v2`: Camera zooms IN (scale increases, content gets larger)
- [x] `camera-showcase`: Focus effects visibly move camera to anchor
- [x] No console warnings about unhandled event types

### Final Checklist

- [x] Coordinate space bug fixed (logical pixels)
- [x] All V2 event types handled in reducer
- [x] Payload normalization working
- [x] WhatsApp anchor framing correct
- [x] All camera episodes functional
- [x] Documentation complete in `docs/camera/`
- [x] All tests passing
- [x] Build succeeds
