# Known Issues & Fix History

**Last Updated:** 2026-01-25

This document tracks the current status of Tokovo's camera system, recently fixed bugs, migration notes, and known limitations.

---

## Current Status (as of 2026-01-25)

### ✅ All V2 Camera Features Working

- **V2 DSL API:** `.focus()`, `.track()`, `.hold()` fully operational
- **Coordinate System:** Logical pixels correctly aligned between Layout Engine and Camera Brain
- **Event Processing:** All V2 event types (`ANCHOR_FOCUS`, `ANCHOR_TRACK`, `HOLD`) handled correctly
- **Payload Compatibility:** Both V1 (`payload.anchor`) and V2 (`payload.anchorId`) formats supported
- **Anchor Framing:** Semantic region keys properly aligned with framing configurations

### ✅ All Camera Showcase Episodes Fixed

The following episodes are now working:

- `semantic-camera-showcase.dsl.ts` - Migrated from `.zoom()` to `.focus()`
- `smart-camera-demo.episode.ts` - Coordinate space fixed
- `camera-showcase.episode.ts` - Event types fixed
- `track-demo-v2` - Payload keys normalized
- `full-cinematic-showcase.dsl.ts` - Legacy V1 compatibility maintained

### 🟢 No Known Critical Issues

All bugs discovered in the 2026-01-25 audit have been resolved. The camera system is production-ready for V2 API usage.

---

## Recently Fixed (2026-01-25)

During a comprehensive camera system audit, **5 critical bugs** were identified and fixed:

### Bug #1: Coordinate Space Mismatch → ✅ FIXED

**Symptom:**

- Camera zoomed OUT (3.77x) instead of IN (1.15x) when focusing on anchors
- Extreme zoom levels made UI elements tiny

**Root Cause:**

- `CameraBrain` expected viewport and anchors in the **same coordinate space**
- Layout Engine produced anchors in **logical pixels** (393px for iPhone 16)
- `useCameraEngine` was passing viewport in **physical pixels** (1290px)
- Scale calculation: `(viewport.width × targetFill) / anchorRect.width`
  - **Before:** `(1290 × 1.15) / 393 = 3.77x` ❌
  - **After:** `(393 × 1.15) / 393 = 1.15x` ✅

**Fix:**

- Changed viewport definition from `profile.dimensions` (physical) to `profile.screen` (logical)
- File: `packages/renderer/src/engines/useCameraEngine.ts` (lines 70-73)
- Commit: `469b7c8` - "fix(camera): normalize viewport to logical pixels in useCameraEngine"

**Impact:**

- Camera now zooms in the correct direction
- Scale values in reasonable range (1.0–2.5)
- All V2 camera effects frame anchors correctly

---

### Bug #2: Event Type Mismatch → ✅ FIXED

**Symptom:**

- V2 DSL camera effects triggered "unhandled event type" warnings
- `ANCHOR_FOCUS`, `ANCHOR_TRACK`, `HOLD` events silently ignored

**Root Cause:**

- V2 DSL generates event types: `ANCHOR_FOCUS`, `ANCHOR_TRACK`, `HOLD`
- Event normalization converts these to kebab-case: `anchor-focus`, `anchor-track`, `hold`
- Reducer only had `focus` and `track` cases, causing mismatch

**Fix:**

- Added `anchor-focus` case alias falling through to `focus` handler
- Added `anchor-track` case alias falling through to `track` handler
- Added `hold` case with no-op handler (maintains current camera state for duration)
- File: `packages/device-camera/src/reducer/index.ts` (lines 62-66, 222-227)
- Commit: `36eefb3` - "fix(camera): add anchor-focus, anchor-track, hold handlers to reducer"

**Impact:**

- V2 DSL camera effects process correctly
- No more unhandled event warnings
- Backward compatibility maintained (existing `focus`/`track` cases unchanged)

---

### Bug #3: Payload Key Mismatch → ✅ FIXED

**Symptom:**

- V2 DSL camera effects fell back to viewport framing instead of using specified anchor
- Anchors not resolved correctly despite being specified in events

**Root Cause:**

- V2 DSL (`CameraTrackBuilder`) sends events with `payload.anchorId`
- V1 helpers send events with `payload.anchor`
- Reducer only read `payload.anchor`, causing V2 events to fallback to viewport

**Fix:**

- Added payload normalization with fallback chain:
  1. `payload.anchor` (V1 helpers)
  2. `payload.anchorId` (V2 DSL)
  3. `event.anchor` (legacy top-level)
  4. `viewport` (default fallback)
- File: `packages/device-camera/src/reducer/index.ts` (lines 71-76)
- Commit: (included in event type mismatch fix)

**Impact:**

- V2 DSL anchors resolve correctly
- No more fallback to viewport when anchor specified
- Both V1 and V2 event patterns work seamlessly

---

### Bug #4: Anchor Framing Key Mismatch → ✅ FIXED

**Symptom:**

- WhatsApp input area not zooming in enough (0.6 targetFill instead of 0.9)
- Camera framing lookup failing silently

**Root Cause:**

- WhatsApp registered semantic region as `"inputArea"` (chat.ts:330)
- Framing configuration used key `"input"` (anchors.ts:46)
- Key mismatch triggered fallback to `DEFAULT_FRAMING` (0.6 targetFill)

**Fix:**

- Renamed framing key from `"input"` to `"inputArea"` in anchors.ts
- Kept all framing properties identical (targetFill: 0.9, anchorPoint, paddingPx)
- File: `packages/apps-whatsapp/src/runtime/adapters/anchors.ts` (line 45)
- Commit: `e5bd182` - "fix(whatsapp): align anchor framing key with registered name"

**Impact:**

- Camera now correctly applies 0.9 targetFill when focusing on input area
- Consistent naming across layout and framing systems

**Pattern Established:**
Anchor framing keys **MUST** exactly match semantic region IDs registered in Layout Engine. Any mismatch triggers fallback to `DEFAULT_FRAMING`.

---

### Bug #5: Legacy API Usage → ✅ FIXED

**Symptom:**

- `semantic-camera-showcase.dsl.ts` calling deleted `.zoom()` method
- TypeScript compilation errors
- Episode not renderable

**Root Cause:**

- Episode written for V1 API which included `.zoom({ scale, origin, duration, easing })`
- V2 camera system removed `.zoom()` in favor of `.focus()` for semantic clarity

**Fix:**

- Replaced 3 `.zoom()` calls with `.focus("viewport", { targetFill, duration })`
  - Scene 2: `.zoom({ scale: 1.06, ... })` → `.focus("viewport", { targetFill: 1.06, duration: 30 })`
  - Scene 3: `.zoom({ scale: 1.25, ... })` → `.focus("viewport", { targetFill: 1.25, duration: 30 })`
  - Scene 4: `.zoom({ scale: 1.15, ... })` → `.focus("viewport", { targetFill: 1.15, duration: 30 })`
- File: `packages/dsl/examples/semantic-camera-showcase.dsl.ts` (lines 111-133)
- Commit: `4f2f68a` - "fix(dsl): replace zoom() with focus() in semantic-camera-showcase"

**Migration Pattern:**

- **Deleted:** `.zoom({ scale, origin, duration, easing })`
- **Replacement:** `.focus("viewport", { targetFill: scale, duration: frames })`
- **Semantic Meaning:** "Zoom" = "focus on viewport with targetFill"

**Impact:**

- Episode compiles and renders correctly
- Consistent V2 API usage across all showcase episodes
- Maintains original visual intent (viewport scaling)

---

## Migration from V1 to V2

If you have episodes written against the V1 camera API, follow these migration steps:

### API Changes

#### `.zoom()` Removed → Use `.focus()`

**Before (V1):**

```typescript
camera.zoom({
  scale: 1.5,
  origin: { x: 0.5, y: 0.8 },
  duration: "1s",
  easing: "ease-out",
});
```

**After (V2):**

```typescript
camera.focus("viewport", {
  targetFill: 1.5,
  duration: 30, // frames at 30fps
});
```

**Rationale:**

- `.zoom()` was ambiguous (zoom in? zoom out? what's the reference?)
- `.focus("viewport", ...)` is semantically clear: "focus on viewport with targetFill"
- Simpler API surface (fewer parameters)
- V2 camera system handles smooth transitions automatically

### Event Type Compatibility

V2 maintains **backward compatibility** with V1 event types:

| V1 Event Type | V2 Event Type             | Status       |
| ------------- | ------------------------- | ------------ |
| `focus`       | `focus` or `anchor-focus` | ✅ Both work |
| `track`       | `track` or `anchor-track` | ✅ Both work |
| N/A           | `hold`                    | ✅ New in V2 |

### Payload Key Compatibility

Both V1 and V2 payload formats are supported:

```typescript
// V1 format (still works)
{ type: "focus", payload: { anchor: "inputArea" } }

// V2 format (preferred)
{ type: "anchor-focus", payload: { anchorId: "inputArea" } }
```

**Recommendation:** Use V2 format for new episodes, but V1 format continues to work for backward compatibility.

---

## Known Limitations

### Architectural Constraints

#### 1. Coordinate Space Dependency

**Limitation:**
Camera system requires `profile.screen` (logical pixels) to match the coordinate space used by Layout Engine.

**Impact:**

- Device profiles must define both `dimensions` (physical pixels) and `screen` (logical pixels)
- Mismatched coordinate spaces will cause incorrect zoom levels

**Workaround:**
Ensure all device profiles correctly define logical viewport dimensions in `profile.screen`.

#### 2. Single Camera View Per Frame

**Limitation:**
Camera system currently supports one camera view per frame. Split-screen or picture-in-picture not yet supported.

**Impact:**

- Cannot render multiple device views simultaneously
- Cannot show zoomed + full view at the same time

**Planned:**
Multi-view camera system in future release.

#### 3. Anchor Framing Key Strictness

**Limitation:**
Anchor framing keys must **exactly match** semantic region IDs registered in Layout Engine. No fuzzy matching or aliases.

**Impact:**

- Typos in anchor names silently fall back to default framing
- No compile-time validation of anchor key correctness

**Workaround:**

- Use TypeScript enums for anchor IDs
- Add runtime validation in development mode

### Performance Considerations

#### 1. Layout Recalculation Per Frame

**Current Behavior:**
Layout Engine recalculates positions/sizes on every frame, even if world state hasn't changed.

**Impact:**

- Minor performance overhead for static scenes
- Negligible for typical 30-60s episodes

**Optimization Planned:**
Memoization layer to skip layout recalculation when world state unchanged.

#### 2. Camera Transform Smoothing

**Current Behavior:**
Camera transitions use default easing curves. Custom easing functions not yet exposed in V2 API.

**Impact:**

- All camera movements use same easing
- Cannot achieve sharp cuts or custom timing curves

**Planned:**
Expose `easing` parameter in `.focus()`, `.track()`, `.hold()` options.

### Browser Compatibility

#### 1. Remotion Rendering Environment

**Requirement:**
Camera system relies on Remotion's Chromium-based rendering.

**Impact:**

- Must render in Remotion environment (cannot use in standalone React app without modifications)
- Safari-specific CSS transforms not tested

**Recommendation:**
Always render final videos using Remotion's bundled Chromium instance.

#### 2. CSS Transform Precision

**Known Issue:**
Very large zoom levels (>10x) may exhibit sub-pixel rendering artifacts.

**Impact:**

- Slight blurriness or antialiasing artifacts at extreme zoom
- Not typically an issue for phone UI framing (zoom range: 1.0-2.5x)

**Workaround:**
Avoid zoom levels above 5x for production episodes.

---

## Version History

### 2026-01-25 - V2 Camera System Fixes

**Changes:**

- Fixed coordinate space mismatch (physical vs logical pixels)
- Added V2 event type handlers (`anchor-focus`, `anchor-track`, `hold`)
- Normalized payload keys (`anchor` vs `anchorId`)
- Aligned anchor framing keys with semantic region IDs
- Migrated `semantic-camera-showcase.dsl.ts` from `.zoom()` to `.focus()`

**Status:** All camera showcase episodes now working. V2 API stable and production-ready.

### 2025-12-XX - V2 Camera System Launch

**Changes:**

- Introduced semantic anchors (`.focus("inputArea")` instead of pixel coordinates)
- Removed `.zoom()` in favor of `.focus("viewport")`
- Added `.track()` for continuous anchor following
- Added `.hold()` for maintaining camera state
- Decoupled Layout Engine from Camera Brain

**Status:** Initial V2 release. Several bugs discovered in 2026-01-25 audit.

### 2025-11-XX - V1 Camera System (Legacy)

**Features:**

- Manual camera positioning with `.zoom({ scale, origin })`
- Pixel-based coordinate system
- Direct transform manipulation

**Status:** Deprecated. V1 API removed. Legacy episodes must migrate to V2.

---

## Reporting New Issues

If you encounter camera-related bugs:

1. **Check this document first** - Issue may already be fixed or documented
2. **Verify device profile** - Ensure `profile.screen` matches logical viewport dimensions
3. **Check anchor keys** - Verify anchor IDs match semantic region registration exactly
4. **Test with V2 API** - Ensure you're using `.focus()`, not deleted `.zoom()`
5. **File issue with:**
   - Episode file or minimal reproduction
   - Expected vs actual camera behavior
   - Device profile used
   - Remotion version

---

## Summary

The Tokovo camera system has achieved **stable V2 status** as of 2026-01-25. All critical bugs from the audit have been resolved:

✅ Coordinate space aligned (logical pixels)  
✅ Event types complete (`focus`, `track`, `hold`, `anchor-focus`, `anchor-track`)  
✅ Payload keys normalized (`anchor` + `anchorId` both work)  
✅ Anchor framing keys aligned with semantic regions  
✅ Legacy `.zoom()` removed, all episodes migrated to `.focus()`

**Current State:** Production-ready for V2 API usage. No known critical issues.

**Next Steps:** Performance optimizations, custom easing curves, multi-view camera system.
