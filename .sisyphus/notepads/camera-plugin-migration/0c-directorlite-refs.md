# DirectorLite References - Complete Mapping

**Task:** Find all DirectorLite pattern references (DirectorLite, deriveDirectorEffects, extractSignals)  
**Date:** 2026-01-26  
**Method:** grep -rn across packages/ (_.ts, _.tsx, \*.md)

---

## Summary Statistics

- **Total references:** 32 matches
- **Files affected:** 11 files
- **Production code:** 4 files (renderer, core)
- **Implementation:** 5 files (device-camera/src/director-lite/)
- **Examples:** 3 files (dsl/examples/)
- **Documentation:** 1 file (README.md)

---

## Production Code (CRITICAL - WILL BREAK in Task 6)

### 1. Renderer: useCameraEngine.ts (7 references)

**File:** `packages/renderer/src/engines/useCameraEngine.ts`

**References:**

1. **Line 11:** Architecture comment

   ```typescript
   * 4. Apply DirectorLite if no manual effects
   ```

2. **Line 36:** Import statement

   ```typescript
   deriveDirectorEffects,
   ```

3. **Line 37:** Import statement

   ```typescript
   extractSignals,
   ```

4. **Line 67:** Interface documentation

   ```typescript
   /** Enable DirectorLite auto-camera */
   directorEnabled?: boolean;
   ```

5. **Line 70:** Interface documentation

   ```typescript
   /** Debug mode for DirectorLite */
   directorDebug?: boolean;
   ```

6. **Line 160:** Runtime usage

   ```typescript
   const signals = extractSignals(eventsInWindow, t, 90);
   ```

7. **Line 163:** Runtime usage
   ```typescript
   const directorResult = deriveDirectorEffects({
   ```

**Impact:**

- ⚠️ **CRITICAL BREAKAGE:** Active runtime usage in camera engine
- Used when `directorEnabled && activeManualEffects.length === 0`
- Processes events → signals → camera effects
- Called every frame when auto-camera is active
- Also uses `convertToEffects` (line 182) to convert DirectorLite output

**Dependencies:**

- Lines 151-193: Full DirectorLite processing block
- Lines 160-173: Signal extraction and effect derivation
- Line 182: `convertToEffects(directorResult.effects, t)`
- Line 199: Checks `directorEnabled && !directorSkipped`

**Deletion Impact:**

- Remove entire block (lines 151-193)
- Remove `directorEnabled`, `directorDebug` from interface
- Remove imports (lines 36-38)
- Update architecture comment (line 11)

---

### 2. Core: index.ts (2 references)

**File:** `packages/core/src/index.ts`

**References:**

1. **Line 121:** Public API re-export

   ```typescript
   deriveDirectorEffects,
   ```

2. **Line 122:** Public API re-export
   ```typescript
   extractSignals,
   ```

**Context (lines 114-126):**

```typescript
// =============================================================================
// DIRECTOR-LITE - Auto camera system
// =============================================================================
export {
  DirectorStrategy,
  Rule,
  ViralDramaV1,
  deriveDirectorEffects,
  extractSignals,
} from "@tokovo/device-camera";
export type { CameraSignal, DeriveContext } from "@tokovo/device-camera";
```

**Impact:**

- ⚠️ **PUBLIC API BREAKAGE:** Exposed to external consumers
- Part of @tokovo/core's public interface
- Anyone importing from `@tokovo/core` will break

**Deletion Impact:**

- Remove entire section (lines 114-126)
- Breaking change for external packages
- May break examples/apps importing these functions

---

### 3. Core: types/runtime-event.ts (1 reference)

**File:** `packages/core/src/types/runtime-event.ts`

**Reference:**

1. **Line 43:** Type documentation comment
   ```typescript
   /**
    * Semantic signal for DirectorLite
    */
   export interface EventSignal {
   ```

**Context (lines 42-50):**

```typescript
/**
 * Semantic signal for DirectorLite
 */
export interface EventSignal {
  type: string; // "NewMessage", "TypingStarted", etc.
  mood?: string; // "romantic", "tense", "chaotic", etc.
  intensity?: number; // 0-1, importance level
  pacing?: "slow" | "normal" | "fast";
}
```

**Impact:**

- ⚠️ **TYPE DEFINITION:** `EventSignal` interface used by DirectorLite
- May be used in event tracing/debugging
- Part of RuntimeEvent type system

**Deletion Decision:**

- ❓ **UNCLEAR:** Is `EventSignal` used outside DirectorLite?
- Need to verify if events still emit signals for debugging/logging
- If only DirectorLite uses it, safe to delete
- If used for event metadata/debugging, keep but update comment

---

## Implementation Files (DELETE ENTIRE DIRECTORY in Task 6)

### 4-8. Device-Camera DirectorLite Module

**Directory:** `packages/device-camera/src/director-lite/`

**Files:**

1. **types.ts** (Line 2)

   ```typescript
   * DirectorLite Types
   ```

   - Contains: `DirectorStrategy`, `Rule`, `Signal`, `DerivedCameraEffect`, etc.

2. **strategy.ts** (Line 2)

   ```typescript
   * DirectorLite Strategy
   ```

   - Contains: Strategy pattern for auto-camera decisions

3. **derive.ts** (Lines 2, 42)

   ```typescript
   * DirectorLite Derive
   export function deriveDirectorEffects(ctx: DeriveContext): DirectorOutput {
   ```

   - **MAIN FUNCTION:** Converts signals → camera effects
   - Exported by device-camera package

4. **signals.ts** (Lines 2, 32)

   ```typescript
   * DirectorLite Signal Extraction
   export function extractSignals(
   ```

   - **MAIN FUNCTION:** Extracts semantic signals from events
   - Exported by device-camera package

5. **index.ts** (Lines 2, 10, 11)
   ```typescript
   * DirectorLite - Automatic Camera System
   export { deriveDirectorEffects, type DeriveContext } from "./derive";
   export { extractSignals } from "./signals";
   ```

   - **MODULE BARREL:** Re-exports all DirectorLite functions

**Deletion Impact:**

- ✅ **SAFE TO DELETE:** Entire `director-lite/` directory
- All exports removed from device-camera package
- No internal dependencies (self-contained module)

---

## Examples (SAFE TO DELETE OR UPDATE)

### 9. Manual Camera Showcase (2 references)

**File:** `packages/dsl/examples/manual-camera-showcase.dsl.ts`

**References:**

1. **Line 9:** File header comment

   ```typescript
   * DirectorLite is DISABLED - all camera is controlled via DSL:
   ```

2. **Line 35:** Configuration flag
   ```typescript
   directorEnabled: false,  // DISABLE DirectorLite - we control the camera
   ```

**Purpose:**

- Example showing manual camera control (no auto-camera)
- Demonstrates explicit camera DSL vs DirectorLite automation

**Deletion Impact:**

- ⚠️ Update comment to remove DirectorLite reference
- ✅ Remove `directorEnabled: false` (will be default after deletion)
- Keep example (demonstrates manual camera control)

---

### 10. Semantic Camera Showcase (2 references)

**File:** `packages/dsl/examples/semantic-camera-showcase.dsl.ts`

**References:**

1. **Line 104:** Comment

   ```typescript
   // Camera events (optional: let DirectorLite handle most of it)
   ```

2. **Line 106:** Comment
   ```typescript
   // SCENE 1: Following messages - let DirectorLite auto-handle
   ```

**Purpose:**

- Example showing semantic anchors + optional DirectorLite
- Hybrid approach (manual + auto)

**Deletion Impact:**

- ⚠️ Update comments to remove DirectorLite references
- Keep example (demonstrates semantic anchor focus)

---

### 11. Auto Director Showcase (6 references)

**File:** `packages/dsl/examples/auto-director-showcase.dsl.ts`

**References:**

1. **Line 6:** File header comment

   ```typescript
   * This showcase demonstrates the AUTOMATIC camera system where DirectorLite
   ```

2. **Line 29:** Title

   ```typescript
   title: "DirectorLite Automatic Camera Demo",
   ```

3. **Line 30:** Comment

   ```typescript
   // DirectorLite is ENABLED by default - camera is fully automatic
   ```

4. **Line 47:** Comment

   ```typescript
   // First message - DirectorLite triggers FocusAnchor → lastMessage
   ```

5. **Line 190:** Comment

   ```typescript
   // This showcase is 100% automatic DirectorLite.
   ```

6. **Line 196:** Comment
   ```typescript
   //     // DirectorLite handles all camera movement automatically
   ```

**Purpose:**

- **PRIMARY EXAMPLE** demonstrating DirectorLite auto-camera
- Shows zero manual camera control
- All camera movement derived from events

**Deletion Options:**

- ❌ **DELETE FILE:** No longer relevant after DirectorLite removal
- ⚠️ **REPURPOSE:** Convert to "Default Camera Behavior" example
- ⚠️ **ARCHIVE:** Move to `examples/deprecated/`

**Recommendation:** DELETE (entire file demonstrates removed feature)

---

## Documentation (UPDATE)

### 12. Device-Camera README (3 references)

**File:** `packages/device-camera/README.md`

**References:**

1. **Line 8:** Features list

   ```markdown
   - **DirectorLite** - AI-driven automatic camera based on event signals
   ```

2. **Line 34:** Section header

   ```markdown
   ### DirectorLite (Auto Camera)
   ```

3. **Line 36:** Description
   ```markdown
   When no `.camera()` track is defined, DirectorLite automatically generates camera moves based on event signals.
   ```

**Content (lines 34-36):**

```markdown
### DirectorLite (Auto Camera)

When no `.camera()` track is defined, DirectorLite automatically generates camera moves based on event signals.
```

**Deletion Impact:**

- ⚠️ Remove "DirectorLite" from features list
- ⚠️ Remove "DirectorLite (Auto Camera)" section
- ⚠️ Update README to reflect manual-only camera system

---

## Cross-Reference: Additional Patterns

### convertToEffects (1 reference)

**File:** `packages/renderer/src/engines/useCameraEngine.ts:38, 182`

**Import:**

```typescript
convertToEffects,
```

**Usage:**

```typescript
const directorEffects = convertToEffects(directorResult.effects, t);
```

**Status:**

- Part of DirectorLite system
- Converts `DerivedCameraEffect` → `CameraEffect`
- DELETE with DirectorLite (line 38 import, line 182 usage)

---

### DirectorStrategy, Rule, ViralDramaV1 (3 exports)

**File:** `packages/core/src/index.ts:116-118`

**Exports:**

```typescript
export {
  DirectorStrategy,
  Rule,
  ViralDramaV1,
  ...
} from "@tokovo/device-camera";
```

**Status:**

- DirectorLite strategy types/presets
- Part of public API section (lines 114-126)
- DELETE entire section

---

### CameraSignal, DeriveContext (2 type exports)

**File:** `packages/core/src/index.ts:123-125`

**Type Exports:**

```typescript
export type { CameraSignal, DeriveContext } from "@tokovo/device-camera";
```

**Status:**

- DirectorLite-specific types
- DELETE with DirectorLite section

---

## Summary by Category

### Production Code (Must Fix)

| File                        | References | Type              | Impact                              |
| --------------------------- | ---------- | ----------------- | ----------------------------------- |
| renderer/useCameraEngine.ts | 7          | Runtime + imports | CRITICAL - Remove auto-camera logic |
| core/index.ts               | 2 + 5      | Public exports    | BREAKING - Remove from API          |
| core/types/runtime-event.ts | 1          | Type docs         | MINOR - Update comment              |

### Implementation (Delete)

| File                              | References | Type           | Impact                  |
| --------------------------------- | ---------- | -------------- | ----------------------- |
| device-camera/director-lite/\*.ts | 5 files    | Implementation | SAFE - Delete directory |

### Examples (Update or Delete)

| File                            | References | Type        | Action                             |
| ------------------------------- | ---------- | ----------- | ---------------------------------- |
| manual-camera-showcase.dsl.ts   | 2          | Comments    | UPDATE - Remove DirectorLite refs  |
| semantic-camera-showcase.dsl.ts | 2          | Comments    | UPDATE - Remove DirectorLite refs  |
| auto-director-showcase.dsl.ts   | 6          | Entire file | DELETE - Primary DirectorLite demo |

### Documentation (Update)

| File                    | References | Type         | Action                               |
| ----------------------- | ---------- | ------------ | ------------------------------------ |
| device-camera/README.md | 3          | Feature docs | UPDATE - Remove DirectorLite section |

---

## Deletion Checklist (for Task 6)

### Step 1: Remove Production Usage

- [ ] `renderer/src/engines/useCameraEngine.ts`
  - [ ] Remove imports (lines 36-38)
  - [ ] Remove interface fields (lines 67, 70)
  - [ ] Remove processing block (lines 151-193)
  - [ ] Update architecture comment (line 11)

### Step 2: Remove Public API

- [ ] `core/src/index.ts`
  - [ ] Remove entire DirectorLite section (lines 114-126)
  - [ ] Remove exports: `DirectorStrategy`, `Rule`, `ViralDramaV1`
  - [ ] Remove exports: `deriveDirectorEffects`, `extractSignals`
  - [ ] Remove type exports: `CameraSignal`, `DeriveContext`

### Step 3: Update Type Definitions

- [ ] `core/src/types/runtime-event.ts`
  - [ ] Update `EventSignal` comment (line 43)
  - [ ] OR delete `EventSignal` if unused elsewhere

### Step 4: Delete Implementation

- [ ] Delete `packages/device-camera/src/director-lite/` directory
  - [ ] derive.ts
  - [ ] signals.ts
  - [ ] strategy.ts
  - [ ] types.ts
  - [ ] index.ts

### Step 5: Update Examples

- [ ] `dsl/examples/manual-camera-showcase.dsl.ts`
  - [ ] Update header comment (line 9)
  - [ ] Remove `directorEnabled: false` (line 35)
- [ ] `dsl/examples/semantic-camera-showcase.dsl.ts`
  - [ ] Update comments (lines 104, 106)
- [ ] `dsl/examples/auto-director-showcase.dsl.ts`
  - [ ] DELETE entire file

### Step 6: Update Documentation

- [ ] `device-camera/README.md`
  - [ ] Remove from features list (line 8)
  - [ ] Remove DirectorLite section (lines 34-36)

---

## Verification Commands

```bash
# After deletion, verify no references remain:
grep -rn "DirectorLite" packages/ --include="*.ts" --include="*.tsx"
grep -rn "deriveDirectorEffects" packages/ --include="*.ts" --include="*.tsx"
grep -rn "extractSignals" packages/ --include="*.ts" --include="*.tsx"
grep -rn "convertToEffects" packages/ --include="*.ts" --include="*.tsx"
grep -rn "DirectorStrategy" packages/ --include="*.ts" --include="*.tsx"

# Should return 0 results (except maybe in test fixtures if any)
```

---

## Notes

- **Expected count:** 32 references found (matches plan expectation of ~29)
- **No test files found:** No DirectorLite unit tests discovered
- **Build system:** No build config references (no webpack/tsconfig changes needed)
- **Type safety:** TypeScript will catch any missed imports after deletion
