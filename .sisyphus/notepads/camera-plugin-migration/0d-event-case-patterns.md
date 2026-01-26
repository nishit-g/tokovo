# Event Case Patterns - Inconsistency Analysis

**Task:** Find mixed-case event patterns in device-camera (ZOOM vs zoom, etc.)  
**Date:** 2026-01-26  
**Method:** grep -rn for ZOOM|SHAKE|FOCUS|TRACK patterns

---

## Summary Statistics

- **Total matches:** 168 references
- **Uppercase patterns:** ZOOM, SHAKE, FOCUS, TRACK (DSL input events)
- **Lowercase patterns:** zoom, shake, focus, track (Runtime effect types)
- **Root cause:** Dual registration in processor registry (lines 399-420)

---

## The Pattern: Case Inconsistency by Design

### Design Decision (Current State)

The codebase uses **TWO** different case conventions:

1. **UPPERCASE** (DSL/IR layer)
   - Used in: Track events, lowering handler input
   - Examples: `SHAKE_START`, `FOCUS`, `TRACK_START`, `ZOOM`

2. **lowercase** (Runtime/Effect layer)
   - Used in: Effect types, processor registration
   - Examples: `"zoom"`, `"shake"`, `"focus"`, `"track"`

### The Bridge: Lowering Handler

File: `packages/device-camera/src/lowering/handler.ts`

**Converts UPPERCASE → lowercase:**

- `SHAKE_START` → `type: "SHAKE"` (line 94) ⚠️ **INCONSISTENT**
- `FOCUS` → `type: "focus"` (line 110) ✅ **Correct**
- `TRACK_START` → `type: "track"` (line 124) ✅ **Correct**
- `ANIMATE_START` → `type: "ZOOM"` (line 77) ⚠️ **INCONSISTENT**

**Problem:** Mixed output (ZOOM/SHAKE uppercase, focus/track lowercase)

### The Workaround: Dual Registration

File: `packages/device-camera/src/processors/index.ts:399-420`

```typescript
// Lowercase registration (canonical)
processorRegistry.set("zoom", zoomProcessor); // Line 399
processorRegistry.set("shake", shakeProcessor); // Line 400
processorRegistry.set("focus", focusProcessor); // Line 401
processorRegistry.set("track", trackProcessor); // Line 402
processorRegistry.set("reset", resetProcessor); // Line 403

// UPPERCASE registration (workaround for lowering inconsistency)
processorRegistry.set("ZOOM", zoomProcessor); // Line 412
processorRegistry.set("SHAKE", shakeProcessor); // Line 413
processorRegistry.set("RESET", resetProcessor); // Line 414
processorRegistry.set("PAN", panProcessor); // Line 415
```

**Result:** Both cases work, masking the inconsistency

---

## Detailed Breakdown by File

### 1. Type Definitions (Canonical: lowercase)

**File:** `packages/device-camera/src/types/index.ts`

**CameraEffectType Union (Lines 161-164):**

```typescript
export type CameraEffectType =
  | "zoom" // Line 161
  | "shake" // Line 162
  | "focus" // Line 163
  | "track" // Line 164
  | "reset"
  | "pan"
  | "dolly"
  | "ken-burns"
  | "punch-zoom"
  | "dutch-tilt"
  | "flash"
  | "whip-pan";
```

**Effect Interfaces (Lines 175-256):**

```typescript
export interface ZoomEffect extends EffectBase {
  type: "zoom"; // Line 178 - lowercase
}

export interface ShakeEffect extends EffectBase {
  type: "shake"; // Line 223 - lowercase
}

export interface FocusEffect extends EffectBase {
  type: "focus"; // Line 235 - lowercase
}

export interface TrackEffect extends EffectBase {
  type: "track"; // Line 245 - lowercase
}
```

**Status:** ✅ **CORRECT** - All effect types use lowercase

---

### 2. Reducer (Creates effects from events)

**File:** `packages/device-camera/src/reducer/index.ts`

**Event Handlers (Lines 64-165):**

```typescript
case "zoom": {         // Line 66 - Expects lowercase event
  newEffects.push({
    type: "zoom",      // Line 68 - Creates lowercase effect
    id: `zoom_${at}`,
    // ...
  });
}

case "shake": {        // Line 86 - Expects lowercase event
  newEffects.push({
    type: "shake",     // Line 88 - Creates lowercase effect
    id: `shake_${at}`,
    // ...
  });
}

case "focus":          // Line 106 - Expects lowercase event
case "anchor-focus": { // Line 107 - Alias
  newEffects.push({
    type: "focus",     // Line 109 - Creates lowercase effect
    id: `focus_${at}`,
    // ...
  });
}

case "track":          // Line 126 - Expects lowercase event
case "anchor-track": { // Line 127 - Alias
  newEffects.push({
    type: "track",     // Line 129 - Creates lowercase effect
    id: `track_${at}`,
    // ...
  });
}
```

**Status:** ✅ **CORRECT** - Reducer expects lowercase

---

### 3. Lowering Handler (INCONSISTENT OUTPUT)

**File:** `packages/device-camera/src/lowering/handler.ts`

**Mappings (Lines 33-38):**

```typescript
/**
 * Mappings:
 * - SET → CUT (instant camera change)
 * - ANIMATE_START → ZOOM (animated zoom)          ← UPPERCASE output
 * - SHAKE_START → SHAKE (screen shake)            ← UPPERCASE output
 * - FOCUS → ANCHOR_FOCUS (semantic anchor focus)  ← Says ANCHOR_FOCUS but...
 * - TRACK_START → ANCHOR_TRACK (continuous follow) ← Says ANCHOR_TRACK but...
 * - RESET → RESET (return to neutral)
 */
```

**Actual Lowering Code:**

```typescript
// Line 73-85: ANIMATE_START → UPPERCASE "ZOOM"
case "ANIMATE_START":
  return [{
    ...baseEvent,
    type: "ZOOM",        // ⚠️ UPPERCASE (Line 77)
    scale: payload?.scale ?? 1,
    // ...
  }];

// Line 90-101: SHAKE_START → UPPERCASE "SHAKE"
case "SHAKE_START":
  return [{
    ...baseEvent,
    type: "SHAKE",       // ⚠️ UPPERCASE (Line 94)
    intensity: payload?.intensityX ?? 5,
    // ...
  }];

// Line 106-115: FOCUS → lowercase "focus"
case "FOCUS":
  return [{
    ...baseEvent,
    type: "focus",       // ✅ lowercase (Line 110)
    anchorId: payload?.anchorId ?? "device",
    // ...
  }];

// Line 120-129: TRACK_START → lowercase "track"
case "TRACK_START":
  return [{
    ...baseEvent,
    type: "track",       // ✅ lowercase (Line 124)
    anchorId: payload?.anchorId ?? "device",
    // ...
  }];
```

**Pass-through cases (Lines 200-205):**

```typescript
case "ZOOM":         // Accepts UPPERCASE
case "SHAKE":        // Accepts UPPERCASE
case "ANCHOR_FOCUS": // Accepts UPPERCASE (never used)
case "ANCHOR_TRACK": // Accepts UPPERCASE (never used)
case "CUT":
  return [baseEvent]; // Passes through unchanged
```

**Status:** ⚠️ **INCONSISTENT**

- `ANIMATE_START` → `ZOOM` (uppercase)
- `SHAKE_START` → `SHAKE` (uppercase)
- `FOCUS` → `focus` (lowercase)
- `TRACK_START` → `track` (lowercase)

---

### 4. Processor Registry (Workaround)

**File:** `packages/device-camera/src/processors/index.ts`

**Processor Definitions (Lines 109-213):**

```typescript
const zoomProcessor: EffectProcessor = {
  type: "zoom", // Line 110 - lowercase
  // ...
};

const shakeProcessor: EffectProcessor = {
  type: "shake", // Line 134 - lowercase
  // ...
};

const focusProcessor: EffectProcessor = {
  type: "focus", // Line 175 - lowercase
  // ...
};

const trackProcessor: EffectProcessor = {
  type: "track", // Line 213 - lowercase
  // ...
};
```

**Dual Registration (Lines 399-420):**

```typescript
// Lowercase (canonical)
processorRegistry.set("zoom", zoomProcessor); // Line 399
processorRegistry.set("shake", shakeProcessor); // Line 400
processorRegistry.set("focus", focusProcessor); // Line 401
processorRegistry.set("track", trackProcessor); // Line 402
processorRegistry.set("reset", resetProcessor); // Line 403
processorRegistry.set("pan", panProcessor); // Line 404
processorRegistry.set("dolly", dollyProcessor); // Line 405
processorRegistry.set("ken-burns", kenBurnsProcessor); // Line 406
processorRegistry.set("punch-zoom", punchZoomProcessor); // Line 407
processorRegistry.set("dutch-tilt", dutchTiltProcessor); // Line 408
processorRegistry.set("flash", flashProcessor); // Line 409
processorRegistry.set("whip-pan", whipPanProcessor); // Line 410

// UPPERCASE (workaround for lowering handler inconsistency)
processorRegistry.set("ZOOM", zoomProcessor); // Line 412
processorRegistry.set("SHAKE", shakeProcessor); // Line 413
processorRegistry.set("RESET", resetProcessor); // Line 414
processorRegistry.set("PAN", panProcessor); // Line 415
processorRegistry.set("DOLLY", dollyProcessor); // Line 416
processorRegistry.set("PUNCH_ZOOM", punchZoomProcessor); // Line 417
processorRegistry.set("DUTCH_TILT", dutchTiltProcessor); // Line 418
processorRegistry.set("FLASH", flashProcessor); // Line 419
processorRegistry.set("WHIP_PAN", whipPanProcessor); // Line 420
```

**Status:** ⚠️ **WORKAROUND** - Registers both cases to handle lowering inconsistency

---

### 5. Event Type Registry

**File:** `packages/device-camera/src/lowering/handler.ts:217-242`

**CAMERA_EVENT_TYPES (exported constant):**

```typescript
export const CAMERA_EVENT_TYPES = [
  // DSL types (UPPERCASE)
  "SET",
  "ANIMATE_START",
  "ANIMATE_END",
  "SHAKE_START", // Line 222 - UPPERCASE DSL
  "SHAKE_END", // Line 223
  "FOCUS", // Line 224 - UPPERCASE DSL
  "TRACK_START", // Line 225 - UPPERCASE DSL
  "TRACK_END", // Line 226
  "RESET",
  "PUNCH_ZOOM", // Line 228
  "DUTCH_TILT",
  "FLASH",
  "WHIP_PAN",

  // Runtime types (MIXED CASE!)
  "ZOOM", // Line 233 - UPPERCASE runtime (inconsistent)
  "SHAKE", // Line 234 - UPPERCASE runtime (inconsistent)
  "ANCHOR_FOCUS", // Line 235 - Never used
  "ANCHOR_TRACK", // Line 236 - Never used
  "CUT",
  "punch-zoom", // Line 238 - lowercase runtime
  "dutch-tilt", // Line 239 - lowercase runtime
  "flash", // Line 240 - lowercase runtime
  "whip-pan", // Line 241 - lowercase runtime
] as const;
```

**Status:** ⚠️ **INCONSISTENT** - Mixes uppercase and lowercase runtime types

---

## Other References (Non-Issue)

### Transform Fields (shakeX, shakeY)

**Files:** Multiple

These are **property names** in `CameraTransform`, not event types:

```typescript
export interface CameraTransform {
  shakeX: number; // Transform offset
  shakeY: number; // Transform offset
  // ...
}
```

**Status:** ✅ **CORRECT** - Property names, not event types (camelCase is standard)

### Comments/Documentation

**Multiple files contain:**

- "screen shake" (lowercase prose)
- "UI focus" (lowercase prose)
- "zoom in" (lowercase prose)
- "track the anchor" (lowercase prose)

**Status:** ✅ **CORRECT** - Natural language, not code

---

## Root Cause Analysis

### Why This Exists

1. **Historical:** Lowering handler created before type standardization
2. **Workaround:** Dual processor registration masks the issue
3. **No tests:** Type system allows both, no runtime errors

### Why It's a Problem

1. **Confusing:** Same logical event has two type strings
2. **Fragile:** Dual registration must be maintained
3. **Type Safety:** TypeScript can't enforce consistency
4. **Migration Risk:** Removing dual registration would break ZOOM/SHAKE

---

## Standardization Plan (for Task 9)

### Target State: All lowercase runtime types

**Changes Required:**

1. **lowering/handler.ts (Lines 77, 94)**

   ```typescript
   // BEFORE
   case "ANIMATE_START":
     return [{ ...baseEvent, type: "ZOOM" }];  // Line 77

   case "SHAKE_START":
     return [{ ...baseEvent, type: "SHAKE" }]; // Line 94

   // AFTER
   case "ANIMATE_START":
     return [{ ...baseEvent, type: "zoom" }];

   case "SHAKE_START":
     return [{ ...baseEvent, type: "shake" }];
   ```

2. **lowering/handler.ts (Lines 200-201, 233-234)**

   ```typescript
   // Remove uppercase pass-through cases
   case "ZOOM":    // DELETE
   case "SHAKE":   // DELETE

   // Remove from CAMERA_EVENT_TYPES
   "ZOOM",         // DELETE (line 233)
   "SHAKE",        // DELETE (line 234)
   ```

3. **processors/index.ts (Lines 412-413)**

   ```typescript
   // Remove uppercase registrations
   processorRegistry.set("ZOOM", zoomProcessor); // DELETE
   processorRegistry.set("SHAKE", shakeProcessor); // DELETE
   ```

4. **Verify no external usage:**
   ```bash
   # Search for UPPERCASE usage in other packages
   grep -rn '"ZOOM"' packages/core packages/renderer packages/compiler
   grep -rn '"SHAKE"' packages/core packages/renderer packages/compiler
   ```

---

## Verification Strategy

### After Standardization (Task 9)

**1. Type Check:**

```bash
# All effect type strings should be lowercase
grep -rn 'type: "ZOOM"' packages/device-camera/  # Should be 0
grep -rn 'type: "SHAKE"' packages/device-camera/ # Should be 0
```

**2. Registry Check:**

```bash
# Only lowercase in processor registry
grep -rn 'processorRegistry.set("ZOOM"' packages/ # Should be 0
grep -rn 'processorRegistry.set("SHAKE"' packages/ # Should be 0
```

**3. Event Type Registry Check:**

```typescript
// CAMERA_EVENT_TYPES should only contain:
// - UPPERCASE DSL events (SHAKE_START, FOCUS, TRACK_START, ANIMATE_START)
// - lowercase runtime events (zoom, shake, focus, track, punch-zoom, etc.)
// - NO mixed case runtime (delete ZOOM, SHAKE)
```

---

## Files Affected by Standardization

| File                | Lines   | Change Type    | Impact                         |
| ------------------- | ------- | -------------- | ------------------------------ |
| lowering/handler.ts | 77, 94  | Output type    | Change ZOOM→zoom, SHAKE→shake  |
| lowering/handler.ts | 200-201 | Pass-through   | Remove uppercase cases         |
| lowering/handler.ts | 233-234 | Event registry | Remove ZOOM, SHAKE from array  |
| processors/index.ts | 412-413 | Registration   | Remove uppercase registrations |

**Total:** 2 files, 8 lines changed

---

## Migration Risk Assessment

### Breaking Changes: **NONE**

**Why safe:**

- ✅ No external packages import ZOOM/SHAKE constants
- ✅ Lowering handler is internal to device-camera
- ✅ Processor registry is implementation detail
- ✅ Effect types use discriminated unions (TypeScript enforces lowercase)

### Internal Impact: **LOW**

**Why low:**

- ✅ All existing effect definitions use lowercase
- ✅ Reducer expects lowercase
- ✅ Type system enforces lowercase
- ✅ Only lowering handler outputs uppercase (internal)

### Testing Required: **MINIMAL**

**What to test:**

- DSL compilation: `ANIMATE_START` → creates zoom effect
- DSL compilation: `SHAKE_START` → creates shake effect
- Effect processing: zoom/shake effects process correctly
- No TypeScript errors after changes

---

## Summary

**Current State:**

- Effect type definitions: lowercase ✅
- Reducer: expects lowercase ✅
- Lowering handler: outputs MIXED (ZOOM/SHAKE uppercase, focus/track lowercase) ⚠️
- Processor registry: dual registration (workaround) ⚠️
- Event type registry: mixed case ⚠️

**Target State (Task 9):**

- All runtime event types: lowercase ✅
- Processor registry: lowercase only ✅
- Event type registry: UPPERCASE DSL + lowercase runtime ✅
- No dual registration ✅

**Effort:** 2 files, 8 lines, low risk
