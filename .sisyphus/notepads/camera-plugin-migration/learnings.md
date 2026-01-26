## Reducer Characterization Tests (Task 3a)

### Created `reducer.test.ts` with comprehensive coverage

**All 12 event types tested:**

1. zoom - Scale/translate with origin points
2. shake - Procedural screen shake with intensity/frequency
3. focus - Semantic anchor focus (one-time) + `anchor-focus` alias
4. track - Continuous anchor following + `anchor-track` alias
5. reset - Return to neutral camera state
6. punch-zoom - Quick zoom with spring bounce
7. dutch-tilt - Z-axis rotation for tension
8. flash - Screen flash effect with color/intensity
9. whip-pan - Fast pan transition with blur
10. cut - Clears effects, resets transform, preserves persistent effects
11. set-view - Legacy view change (APP_VIEW/TRANSITION)
12. layout - Change view layout mode (SINGLE/SPLIT_VERTICAL/PICTURE_IN_PICTURE)

**Key Testing Patterns Discovered:**

- Reducer expects `{ camera: CameraState }` shape, NOT just `CameraState`
- Reducer MUTATES `state.camera` in place (Immer-style)
- Event type normalization: lowercase + replace underscores with hyphens
- Default duration: 30 frames if not specified
- Default easing: "ease-out" if not specified
- IDs generated as `{type}_{at}` pattern

**Edge Cases Covered:**

- Optional vs required properties (scale, smoothing, intensity defaults)
- Alias support (anchor-focus → focus, anchor-track → track)
- Fallback logic (anchor field → anchorId, activeDeviceId → primaryDeviceId)
- Persistent effects survive CUT events
- Missing camera state auto-initialization
- Non-CAMERA events ignored
- Type narrowing required for discriminated unions (originX/originY on ZoomEffect)

**Test Results:**

- 40 tests total (38 reducer + 2 existing fixture tests)
- All PASS
- Build clean (no TypeScript errors)

## Processor Characterization Tests (Task 3b)

### Created `processors.test.ts` with comprehensive processor coverage

**All 12 processor types tested:**

1. zoom - Scale/translate with max delta accumulation
2. shake - Procedural noise with trauma decay
3. focus - Semantic anchor focus (defaults to 0.5,0.5 without anchor snapshot)
4. track - Continuous smoothed tracking with ease-in/ease-out
5. reset - Interpolates ALL transform properties to defaults
6. pan - Pure translation without scale changes
7. dolly - Simultaneous scale + translateY (cinematic dolly effect)
8. ken-burns - Simultaneous scale + origin animation
9. punch-zoom - Multiplies scale using spring physics
10. dutch-tilt - Adds rotation using spring physics (can overshoot)
11. flash - No-op processor (visual effect only, doesn't modify transform)
12. whip-pan - Sine curve translation (peaks at midpoint, NOT zero at end)

**Key Processor Patterns Discovered:**

- `processActiveEffects` is PURE: same inputs → same outputs (Remotion compatible)
- Frame filtering: only processes effects where `t >= startFrame && t < endFrame`
- Sequential accumulation: each processor receives previous processor's transform
- Multiple effects of same type use "max delta" strategy (zoom, focus, track)
- Spring physics can OVERSHOOT target values (dutch-tilt, punch-zoom)
- Shake uses deterministic noise (fbm) - same frame = same shake value
- Reset processor interpolates from CURRENT transform, not from default
- Flash processor returns transform unchanged (render layer handles visual)

**Spring Physics Behavior:**

- Underdamped springs oscillate and can exceed target value
- Punch-zoom MULTIPLIES scale (not adds), can go below 1.0
- Dutch-tilt can rotate beyond target angle during overshoot
- Spring presets: punch (fast), dramatic (bouncy), smooth (no overshoot)

**Edge Cases Covered:**

- Empty effects array returns DEFAULT_TRANSFORM
- Frame before startFrame returns initial transform
- Frame after endFrame returns initial transform
- Multiple overlapping effects accumulate correctly
- Unknown effect types fail gracefully (no error, returns unchanged)
- Processors work without anchor snapshot (focus/track use defaults)
- Custom initial transform preserved and modified correctly

**Test Results:**

- 34 processor tests (+ 38 reducer + 2 fixture = 74 total)
- All PASS
- Build clean (no TypeScript errors)

**Critical Learning:**
Characterization tests revealed ACTUAL behavior differs from initial assumptions:

- Whip-pan uses sine curve (doesn't return to zero at end frame)
- Punch-zoom can reduce scale below 1.0 (not just zoom in)
- Dutch-tilt overshoots target angle due to spring physics
  → Tests were fixed to match reality, not expectations

## Anchor System Characterization Tests (Task 3c)

### Created `anchors.test.ts` with comprehensive anchor coverage

**Registry Functions Tested:**

- `registerAnchorProvider()` - Adds providers to global registry
- `unregisterAnchorProvider()` - Removes providers
- `getAnchorProvider()` - Retrieves provider by appId
- `hasAnchorProvider()` - Checks provider existence
- `getAnchorsForApp()` - Main entry point for useCameraEngine
- `getAnchorFraming()` - Retrieves framing config with defaults
- `getRegisteredAppIds()` - Lists all registered apps
- `clearAnchorProviders()` - Test utility to reset registry
- `getProviderCount()` - Returns registry size

**Resolver Functions Tested:**

- `resolveAnchorWithFallback()` - Primary anchor resolution with chain
- `anchorToOrigin()` - Rect to viewport-normalized origin conversion
- `calculateFillScale()` - Auto-scaling to target fill percentage
- `resolveAnchorFully()` - Complete resolution (origin + scale + fallback info)

**Key Anchor Patterns Discovered:**

**Registry Behavior:**

- Providers stored in Map by appId (allows overwrite)
- `getAnchorsForApp()` returns EMPTY_SNAPSHOT when provider not found
- `getAnchorFraming()` returns DEFAULT_FRAMING when anchor not configured
- Registry is self-contained (no core dependency to avoid cycles)

**Fallback Chain System:**

- Predefined chains for common anchors (lastMessage, inputArea, etc.)
- Chain example: `lastMessage → content → app → device`
- Default chain for unknown anchors: `[anchorName, "app", "device"]`
- Ultimate fallback uses viewport dimensions if provided
- Final fallback: default rect (300x500 centered) prevents camera snap

**Resolution Math:**

- `anchorToOrigin()` converts rect center to 0-1 normalized origin
- Anchor point (0.5, 0.5) = rect center, (0, 0) = top-left, (1, 1) = bottom-right
- Origin clamped to [0, 1] range to prevent out-of-bounds
- `calculateFillScale()` targets percentage of viewport fill
- Scale clamped to [1.0, 2.5] range (no zoom out, max 2.5x zoom)
- Near-zero rect size returns scale=1 to avoid division by zero

**Provider Interface:**

- `appId`: Unique app identifier
- `framing`: Per-anchor framing config (anchorPoint, targetFill, paddingPx)
- `getAnchors()`: Called every frame, extracts rects from world/layout
- Returns AnchorSnapshot with anchors map, deviceId, appId

**Edge Cases Covered:**

- Provider overwrite (same appId replaces existing)
- Missing provider returns empty snapshot
- Missing anchor in provider returns default framing
- Anchor resolution without viewport uses default rect
- Origin clamping for out-of-viewport anchors
- Scale clamping for tiny/huge rects
- Fallback chains for missing anchors
- Multiple fallback levels before ultimate fallback
- Custom anchor points (not just center)
- Zero/near-zero rect dimensions

**Test Results:**

- 32 anchor tests (+ 38 reducer + 34 processor + 2 fixture = 106 total)
- All PASS
- Build clean (no TypeScript errors)

**Critical Insight:**
Anchor system is fully self-contained in device-camera:

- No dependency on @tokovo/core (avoids cyclic deps)
- Registry manages providers globally
- Apps register providers once at startup
- useCameraEngine calls `getAnchorsForApp()` every frame
- Resolver functions are PURE (deterministic)

## Task 4: Full TokovoPluginContract Implementation

**Date**: 2026-01-26  
**File**: packages/device-camera/src/plugin.ts

### Implementation Summary

Created complete TokovoPluginContract implementation for camera plugin with all required properties and proper architecture alignment.

### Key Decisions

1. **Type Assertions for Event Kind Mismatch**
   - TokovoPluginContract uses PluginReducer expecting kind APP events
   - Camera reducer handles kind CAMERA events (device-level not app-level)
   - Solution: Used as any assertions for reducer and lowering.lower
   - This is a known limitation of app-centric contract design

2. **Plugin Tier Structure**
   - Tier A: id version displayName reducer views (all required)
   - Tier B: lowering handler (optional, enables DSL compilation)
   - NO lifecycle property (verified not in contract lines 251-298)
   - anchors set to undefined (camera CONSUMES anchors from apps)

3. **Views Property**
   - Camera has no UI - only transforms viewport via effects
   - Set to AppRoot returning null to satisfy contract requirement

4. **Removed Custom Registration**
   - Old plugin.ts had registerCameraPlugin function
   - New approach: Use PluginManager.register in Task 5
   - Updated index.ts to export only DeviceCameraPlugin

5. **Lowering Handler Structure**
   - Imported cameraV2Lowering and CAMERA_EVENT_TYPES from lowering
   - Configured as handles array and lower function
   - Supports 20+ camera event types (SET ANIMATE_START SHAKE FOCUS etc)

### Verification Results

- Build PASSED: pnpm -r --filter device-camera run build
- Tests PASSED: 106/106 tests in 4 test files
- Export updated in index.ts

### Architecture Insight

Camera plugin fundamentally differs from app plugins:

- App plugins: Handle kind APP events with specific appId
- Camera plugin: Handles kind CAMERA events (device-level scope)
- This architectural difference requires type assertions
- Future consideration: Separate contracts for device vs app plugins

## Task 5: Plugin-Based Camera Registration (Completed)

**Date**: 2026-01-26

### Pattern Used: Registration Function (Not Immediate Self-Registration)

Initial plan suggested immediate self-registration (like `PluginManager.register(DeviceCameraPlugin)` at module level), but this caused test failures:
- Tests import package modules before PluginManager is initialized
- Module-level registration throws `Cannot read properties of undefined (reading 'register')`

**Solution**: Follow WhatsApp's complete pattern - export a registration function:

```typescript
// packages/device-camera/src/plugin.ts
import { PluginManager } from "@tokovo/core";

let _registered = false;

export function registerCameraPlugin(): void {
  if (_registered) return;
  _registered = true;

  PluginManager.register(DeviceCameraPlugin);
}
```

### Handler Implementation

Camera handler now uses plugin system:

```typescript
// packages/core/src/engine/handlers/camera.ts
import { PluginManager } from "../../plugin/plugin";

// In default case:
const cameraPlugin = PluginManager.get("camera");
if (!cameraPlugin) {
  throw new Error(
    "Camera plugin not registered. Ensure DeviceCameraPlugin is registered before engine initialization.",
  );
}
cameraPlugin.reducer(draft as any, event as any);
```

**Key Points**:
1. Import removed: No longer directly import `cameraReducer` from `@tokovo/device-camera`
2. Error handling: Clear error if plugin not registered
3. Type casting preserved: `as any` for both draft and event (Task 10 will fix this)
4. Switch cases unchanged: SET_VIEW, CUT, LAYOUT still handled directly in switch
5. Default delegation: All other camera events go through plugin reducer

### Files Modified

1. `packages/device-camera/src/plugin.ts`:
   - Added `registerCameraPlugin()` function
   - Exports registration function

2. `packages/device-camera/src/index.ts`:
   - Exports `registerCameraPlugin` alongside `DeviceCameraPlugin`

3. `packages/core/src/engine/handlers/camera.ts`:
   - Removed direct import of `cameraReducer`
   - Added `PluginManager` import
   - Updated default case to use plugin system
   - Added registration check with clear error

### Verification

- ✅ TypeScript compilation passes (core + device-camera)
- ✅ All device-camera tests pass (106 tests)
- ✅ No LSP errors in modified files

### Next Steps

Application code must call `registerCameraPlugin()` before engine initialization:

```typescript
import { registerCameraPlugin } from "@tokovo/device-camera";
registerCameraPlugin();
```

This follows the same pattern as WhatsApp's `registerWhatsAppPlugin()`.

## DirectorLite Deletion (2026-01-26)

### Scope
- **Task:** Delete DirectorLite system entirely from codebase
- **Approach:** V1 CLEAN - Remove option completely, no backward compatibility
- **Files Modified:** 8 files across 3 packages

### Execution Summary

**Deleted:**
- `packages/device-camera/src/director-lite/` (entire directory - 5 files)
- `packages/renderer/src/camera-composer.ts` (DirectorLite support)
- `packages/renderer/src/layout/director-adapter.ts` (DirectorLite support)

**Modified:**
1. `packages/device-camera/src/index.ts` - Removed DirectorLite exports section
2. `packages/core/src/index.ts` - Removed DirectorLite re-exports (lines 118-135)
3. `packages/renderer/src/engines/useCameraEngine.ts`:
   - Removed imports: `deriveDirectorEffects`, `extractSignals`, `convertToEffects`
   - Removed options: `directorEnabled`, `directorDebug`
   - Removed processing logic (lines 151-193)
   - Updated architecture comment (step 4 → removed, step 5 → step 4)
4. `packages/renderer/src/TokovoRenderer.tsx`:
   - Removed `directorEnabled`, `directorDebug` props
   - Removed prop destructuring and defaults
   - Removed props from `useCameraEngine` call

### Key Insights

**Why both tasks were atomic:**
- Deleting director-lite directory breaks imports in useCameraEngine.ts
- Cannot verify typecheck until BOTH deletions complete
- Attempting to typecheck after directory deletion would show false errors
- This validates the plan's "ATOMIC" designation

**TypeScript errors caught:**
- Missing exports: `DerivedCameraEffect`, `DirectorLayoutModel`
- Traced to camera-composer.ts and director-adapter.ts
- These were DirectorLite support files not listed in original plan
- Deleted both → typecheck passed

**Verification success:**
- ✅ All 3 packages typecheck clean (core, device-camera, renderer)
- ✅ All 106 device-camera tests pass
- ✅ No runtime errors in imports

### Pattern Recognition

**V1 CLEAN approach worked well:**
- No need for deprecation warnings
- No need for runtime option handling
- Just delete types + implementation
- TypeScript catches all call sites

**Support file discovery:**
- Notepad didn't list camera-composer.ts or director-adapter.ts
- TypeScript errors revealed them
- Grep confirmed they only used DirectorLite types
- Safe to delete (no other dependencies)

**Architecture comments matter:**
- useCameraEngine.ts had numbered steps (1-5)
- Removing step 4 (DirectorLite) required renumbering step 5 → 4
- Preserved structure for future readers

### Validation
- Notepad predicted 32 references across 11 files
- Found and fixed all production code references
- Tests still pass (no DirectorLite test coverage existed)
- Ready for next phase: DSL examples cleanup


## Task 8: DSL Examples DirectorLite Cleanup (Jan 26 2026)

### Changes Made
- Deleted `packages/dsl/examples/auto-director-showcase.dsl.ts` entirely
- Removed `directorEnabled: false` config from `manual-camera-showcase.dsl.ts`
- Removed DirectorLite references from header comments in manual showcase
- Removed DirectorLite-related comments from `semantic-camera-showcase.dsl.ts`
- Updated `packages/device-camera/README.md` to remove DirectorLite sections

### Documentation Cleanup
**device-camera README.md:**
- Removed "DirectorLite (Auto Camera)" section and description
- Removed DirectorLite from features list
- Changed "Manual Camera (God Mode)" to just "Manual Camera Control"
- Kept semantic anchors and manual camera control documentation

### Examples Status After Cleanup
- `manual-camera-showcase.dsl.ts` - Demonstrates fully manual camera control
- `semantic-camera-showcase.dsl.ts` - Demonstrates semantic anchors with manual camera
- No auto-director example remains (deprecated pattern)

### Verification
- Build passed: `pnpm --filter @tokovo/dsl build` ✓
- No DirectorLite references in examples directory ✓
- No directorEnabled references in examples directory ✓
- All examples now focus on manual camera control patterns


## Task 9a: Lowering Handler Event Outputs Standardized (2026-01-26)

**Change:** Updated `packages/device-camera/src/lowering/handler.ts` to output lowercase RuntimeEvent.type values.

**Modified Lines:**
- Line 77: `type: "ZOOM"` → `type: "zoom"`
- Line 94: `type: "SHAKE"` → `type: "shake"`
- Line 138: `type: "RESET"` → `type: "reset"`

**Pattern:**
```typescript
// DSL input (unchanged): case "ANIMATE_START"
// Runtime output (changed): type: "zoom"
```

**Impact:**
- All RuntimeEvent outputs now lowercase (zoom, shake, focus, track, reset)
- Consistent with existing focus/track outputs (already lowercase)
- Consistent with processor definitions (all lowercase type fields)
- Consistent with type definitions in types/index.ts (CameraEffectType union)

**Verification:**
- ✅ `grep -E 'type: "ZOOM"|type: "SHAKE"|type: "RESET"'` returns 0 matches
- ✅ All 106 tests pass
- ✅ No TypeScript errors (LSP server not installed, manual verification clean)

**Next Steps (for subsequent tasks):**
- Remove uppercase processor registrations (processors/index.ts lines 412-420)
- Remove uppercase pass-through cases (handler.ts lines 200-201)
- Remove uppercase from CAMERA_EVENT_TYPES array (handler.ts lines 233-234)
- Add TODO comment to reducer's toLowerCase() safety net

**Why This Works:**
- Dual registration in processor registry temporarily supports both cases
- Reducer already has toLowerCase() normalization at line 60 (safety net)
- Type system enforces lowercase via CameraEffectType union

## Task 9b: Processor Registry Duplicates Removed (2026-01-26)

**Change:** Removed uppercase duplicate processor registrations from `packages/device-camera/src/processors/index.ts`.

**Deleted Lines (412-420):**
```typescript
processorRegistry.set("ZOOM", zoomProcessor);       // REMOVED
processorRegistry.set("SHAKE", shakeProcessor);     // REMOVED
processorRegistry.set("RESET", resetProcessor);     // REMOVED
processorRegistry.set("PAN", panProcessor);         // REMOVED
processorRegistry.set("DOLLY", dollyProcessor);     // REMOVED
processorRegistry.set("PUNCH_ZOOM", punchZoomProcessor); // REMOVED
processorRegistry.set("DUTCH_TILT", dutchTiltProcessor); // REMOVED
processorRegistry.set("FLASH", flashProcessor);     // REMOVED
processorRegistry.set("WHIP_PAN", whipPanProcessor); // REMOVED
```

**Retained Lines (399-410):**
```typescript
processorRegistry.set("zoom", zoomProcessor);       // KEPT
processorRegistry.set("shake", shakeProcessor);     // KEPT
processorRegistry.set("focus", focusProcessor);     // KEPT
processorRegistry.set("track", trackProcessor);     // KEPT
processorRegistry.set("reset", resetProcessor);     // KEPT
processorRegistry.set("pan", panProcessor);         // KEPT
processorRegistry.set("dolly", dollyProcessor);     // KEPT
processorRegistry.set("ken-burns", kenBurnsProcessor); // KEPT
processorRegistry.set("punch-zoom", punchZoomProcessor); // KEPT
processorRegistry.set("dutch-tilt", dutchTiltProcessor); // KEPT
processorRegistry.set("flash", flashProcessor);     // KEPT
processorRegistry.set("whip-pan", whipPanProcessor); // KEPT
```

**Impact:**
- Registry now contains only lowercase event type keys
- Consistent with Task 9a (lowering handler outputs lowercase)
- Consistent with processor type definitions (all lowercase)
- Removes technical debt from dual registration workaround

**Verification:**
- ✅ `grep` returns 0 matches for uppercase registry calls
- ✅ All 106 tests pass
- ✅ No compilation errors

**Why Safe:**
- Task 9a already changed lowering handler to output lowercase
- Reducer has toLowerCase() normalization (safety net still in place)
- All processor definitions use lowercase `type` field
- No external code references uppercase event types

**Next Steps (for subsequent tasks):**
- Remove uppercase pass-through cases from handler.ts (lines 200-201)
- Remove uppercase from CAMERA_EVENT_TYPES array (handler.ts lines 233-234)
- Add TODO comment to reducer's toLowerCase() safety net

## Task 9c: Reducer TODO Comment Added (2026-01-26)

**Change:** Added TODO comment to `packages/device-camera/src/reducer/index.ts` at line 62 (above toLowerCase() normalization).

**Added Comment:**
```typescript
// TODO: Remove toLowerCase() after verifying all producers use lowercase
const normalizedType = event.type.toLowerCase().replace(/_/g, "-");
```

**Purpose:**
- Documents that `toLowerCase()` is a **temporary safety net** during migration
- Signals future cleanup task: verify all event producers use lowercase, then remove normalization
- Prevents premature removal of safety mechanism

**Context:**
- Tasks 9a/9b standardized producers to output lowercase
- `toLowerCase()` now redundant for standardized producers
- Kept as safety net until all external producers verified
- Future task: audit all producers, confirm lowercase usage, remove normalization

**Migration Status After Task 9c:**
- ✅ Lowering handler outputs lowercase (Task 9a)
- ✅ Processor registry uses lowercase only (Task 9b)
- ✅ Reducer has documented safety net (Task 9c)
- 🔲 Pass-through cases cleanup (future task)
- 🔲 CAMERA_EVENT_TYPES array cleanup (future task)
- 🔲 Remove toLowerCase() safety net (future task, after verification)

**Verification:**
- ✅ TODO comment exists at line 62
- ✅ Comment correctly positioned above toLowerCase() call
- ✅ Comment matches plan specification (lines 1154-1155)
