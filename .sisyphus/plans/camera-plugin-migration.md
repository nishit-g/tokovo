# Camera Module Full Plugin Migration

## Context

### Original Request

Deep architectural review of camera module revealed 6 significant issues. User requested full plugin migration (Option B) with DirectorLite deletion, breaking changes acceptable, TDD approach.

### Interview Summary

**Key Discussions**:

- Found duplicate `CameraState` definitions (core vs device-camera)
- Unsafe type cast (`as unknown as`) in core handler
- Mixed case events in lowering layer (ZOOM vs focus)
- Half-baked plugin implementation (doesn't implement TokovoPluginContract)
- Dual anchor systems causing resolution failures
- Layout mode enum mismatch (SPLIT_HORIZONTAL vs SPLIT)

**User Decisions**:

- Breaking changes: YES (clean slate approach)
- Multi-device layout: PLANNED (not used yet, must work after migration)
- DirectorLite: DELETE entirely (not fix)
- Test strategy: Set up infrastructure first, then TDD

**Research Findings**:

- 29 DirectorLite matches across 11 files
- Camera predates plugin system (retrofitted with minimal wrapper)
- useCameraEngine.ts is critical renderer integration point
- No existing test files in device-camera package
- vitest configured but unused
- **7th Issue Identified**: Anchor registration is tightly coupled - apps register WITH camera instead of in their own plugins

### Metis Review

**Identified Gaps** (addressed in plan):

- Triple CameraState definition (core/types/camera.ts, core/types.ts re-export, device-camera/types)
- Plugin views question → resolved: empty `views: {}` (camera doesn't render UI)
- Multi-device scope → resolved: types/hooks only, no implementation
- Lowering integration → resolved: move into plugin's `lowering` property
- DirectorLite backward compat → resolved: `directorEnabled` flag ignored gracefully
- Test chicken-egg → resolved: characterization tests first, then TDD for new code

---

## Work Objectives

### Core Objective

Refactor the camera module to properly implement `TokovoPluginContract`, unify types, standardize events, delete DirectorLite, and establish test coverage — creating a clean, type-safe architecture.

### Concrete Deliverables

- Single canonical `CameraState` definition (in core, re-exported by device-camera)
- `DeviceCameraPlugin` implementing full `TokovoPluginContract`
- Unified anchor system (camera uses core's plugin anchor system)
- Standardized lowercase event types
- Zero unsafe type casts
- DirectorLite fully removed
- Test suite for camera module

### Definition of Done

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm --filter @tokovo/device-camera test` passes
- [ ] Manual camera showcase DSL example renders correctly
- [ ] Zero `as unknown as` casts in camera-related code
- [ ] Single `CameraState` interface (verified via LSP)

### Must Have

- Type-safe integration between core and device-camera
- Full TokovoPluginContract implementation
- Test coverage for reducer, processors, anchors
- All existing camera effects working (zoom, shake, focus, track, etc.)
- **ONE canonical way to register anchors** (via plugin.anchors, no legacy patterns)
- **WhatsApp plugin updated** to use inline anchors (not separate registration)

### Must NOT Have (Guardrails)

- NO backward compatibility hacks (this is V1 clean architecture)
- NO `directorEnabled` option (DirectorLite is deleted, option doesn't exist)
- NO legacy `"SPLIT"` layout mode (use correct `SPLIT_HORIZONTAL`/`SPLIT_VERTICAL`)
- NO `registerAnchorProvider()` function (apps use plugin.anchors directly)
- NO implementation of multi-device layout rendering (types/hooks only)
- NO new camera effects beyond existing ones
- NO refactoring code unrelated to the 6 architectural issues
- NO "improvements" to working code outside scope
- NO new dependencies without explicit approval
- NO changes to non-camera event types
- NO `@ts-ignore` or `@ts-expect-error` as replacement for proper types

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: NO (vitest configured, no test files)
- **User wants tests**: TDD after setup
- **Framework**: vitest (already in package.json)

### Test Approach

1. **Phase 0**: Set up test infrastructure (vitest config, helpers, fixtures)
2. **Characterization tests**: Capture existing behavior before refactoring
3. **TDD for new code**: RED-GREEN-REFACTOR for plugin contract implementation
4. **Integration tests**: Verify renderer integration works

### Manual Verification

For each phase:

- [ ] `pnpm typecheck` passes
- [ ] DSL examples compile and render
- [ ] No runtime errors in browser console

---

## Task Flow

```
Phase 0: Pre-Flight Verification (read-only)
    ↓
Phase 1: CameraState Unification
    ↓
Phase 2: Test Infrastructure Setup
    ↓
Phase 3: Plugin Contract Implementation
    ↓
Phase 4: DirectorLite Deletion
    ↓
Phase 5: Event Case Standardization
    ↓
Phase 6: Type Safety Cleanup
    ↓
Phase 7: Integration Verification
```

## Parallelization

| Group | Tasks | Reason                                               |
| ----- | ----- | ---------------------------------------------------- |
| -     | None  | Sequential refactor - each phase depends on previous |

| Task | Depends On | Reason                                    |
| ---- | ---------- | ----------------------------------------- |
| 1    | 0          | Need dependency map before changing types |
| 2    | 1          | Tests need unified types to work          |
| 3    | 2          | TDD requires test infrastructure          |
| 4    | 3          | Delete after plugin is solid              |
| 5    | 4          | Case changes after DirectorLite gone      |
| 6    | 5          | Final cleanup after all changes           |
| 7    | 6          | Verification after all refactoring        |

---

## TODOs

### Phase 0: Pre-Flight Verification

- [x] 0. Map All Dependencies (READ-ONLY)

  **What to do**:
  - Use `lsp_find_references` on `CameraState` to map all 3 definition sites and all usage sites
  - Use `lsp_find_references` on all `@tokovo/device-camera` exports to map renderer dependencies
  - Use `grep` to find all DirectorLite imports: `DirectorLite|deriveDirectorEffects|extractSignals`
  - Use `grep` to find event case inconsistencies: search for `ZOOM|SHAKE|FOCUS|TRACK` in device-camera
  - Document findings in a pre-flight report (can be comments or temporary file)

  **Must NOT do**:
  - Modify any files
  - Make any changes yet

  **Parallelizable**: NO (first task)

  **References**:
  - `packages/core/src/types/camera.ts:107` - Core CameraState definition
  - `packages/device-camera/src/types/index.ts:317` - Device-camera CameraState definition
  - `packages/device-camera/src/index.ts` - All exports to map
  - `packages/renderer/src/engines/useCameraEngine.ts` - Critical consumer

  **Acceptance Criteria**:
  - [ ] Document: List of all files importing CameraState
  - [ ] Document: List of all files importing from @tokovo/device-camera
  - [ ] Document: All 29 DirectorLite references categorized (code/example/doc)
  - [ ] Document: All mixed-case event types found

  **Commit**: NO (read-only phase)

---

### Phase 1: CameraState Unification

- [x] 1. Unify CameraState to Single Definition

  **What to do**:
  - Canonical location: `packages/core/src/types/camera.ts`
  - Delete duplicate `CameraState` interface from `packages/device-camera/src/types/index.ts`
  - Update device-camera to re-export `CameraState` from `@tokovo/core`
  - Merge properties using the table below
  - Ensure layout mode enum includes: `'SINGLE' | 'SPLIT_HORIZONTAL' | 'SPLIT_VERTICAL' | 'PIP'`
  - Update all imports across codebase to use canonical source
  - Run `lsp_diagnostics` on all affected files to verify zero type errors

  **Step 4: Verify Reducer Signature Compatibility** (CRITICAL for Task 10):

  The unsafe cast in core handler exists because of a type mismatch:
  - **Core handler** passes: `WorldState` (where `camera?: CameraState` is OPTIONAL)
  - **Reducer expects**: `{ camera: CameraState }` (where `camera` is REQUIRED)

  After type unification, verify and update reducer signature:

  ```typescript
  // Current signature (packages/device-camera/src/reducer/index.ts:46):
  export function cameraReducer(
    draft: { camera: CameraState },
    event: CameraEvent,
  );

  // Check 1: Does WorldState.camera become required after unification?
  // If YES: Reducer signature is fine, cast can be removed in Task 10
  // If NO (still optional): Update reducer to handle undefined:

  export function cameraReducer(draft: WorldState, event: CameraEvent) {
    // Initialize camera if undefined (handles optional WorldState.camera)
    if (!draft.camera) {
      draft.camera = getDefaultCameraState(); // Use existing default from lines 51-54
    }
    // ... rest of reducer logic
  }
  ```

  **Decision Tree** (Step 4 - Verify Reducer Compatibility):

  **ALREADY VERIFIED DURING PLANNING**: The reducer ALREADY initializes camera state at lines 51-54:

  ```typescript
  if (!draft.camera) {
    draft.camera = { ...DEFAULT_CAMERA_STATE };
  }
  ```

  **NO CODE CHANGES NEEDED** - this step is verification only:
  1. After deleting duplicate CameraState from `device-camera/types/index.ts`
  2. Run: `lsp_diagnostics` on `packages/device-camera/src/reducer/index.ts`
  3. Verify NO errors about "Property 'camera' does not exist"
  4. If errors appear: consult with plan author (initialization should already handle this)
  5. Document outcome in commit message: "Reducer initialization: VERIFIED COMPATIBLE"

  **Property Merge Strategy** (VERIFIED from actual code):

  **Pre-Task: AppId Type Verification** (VERIFIED DURING PLANNING):

  ```bash
  grep -n "type AppId" packages/core/src/types.ts packages/core/src/types/device.ts
  ```

  **Result**: `AppId = string` (simple type alias, no branded type)
  - `packages/core/src/types.ts:8` - Re-export: `type AppId = _AppId;`
  - `packages/core/src/types/device.ts:253` - Definition: `export type AppId = string;`

  **Conclusion**: `AppId` is just `string`. No functional difference from device-camera's `string?`. Using core's `AppId` provides consistent naming only (no type safety benefit).

  | Property           | Core Definition (lines 107-132)                                                                 | Device-Camera Definition (lines 317-339)            | Resolution                                     |
  | ------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------- |
  | `baseView`         | Required: `"APP_VIEW" \| "TRANSITION"`                                                          | Optional: `string?`                                 | Keep REQUIRED with literal union from core     |
  | `appId`            | **Optional**: `AppId?`                                                                          | Optional: `string?`                                 | Keep optional, use `AppId` type from core      |
  | `activeDeviceId`   | Required: `string`                                                                              | Optional: `string?`                                 | Keep REQUIRED from core                        |
  | `layout`           | Required: `ViewLayout` with `mode: "SINGLE" \| "SPLIT_HORIZONTAL" \| "SPLIT_VERTICAL" \| "PIP"` | Optional: `{ mode: "SINGLE" \| "PIP" \| "SPLIT" }?` | Keep core's REQUIRED with specific mode values |
  | `deviceTransforms` | Exists: `Record<DeviceId, CameraTransform>`                                                     | Missing                                             | Keep in core only (for multi-device support)   |
  | `activeEffects`    | `CameraEffect[]`                                                                                | `CameraEffect[]`                                    | Same - no change                               |
  | `transform`        | `CameraTransform`                                                                               | `CameraTransform`                                   | Same - no change                               |

  **Why Properties Differ** (context for merge decisions):

  The definitions drifted because of different design contexts:
  - **Core's CameraState** is part of `WorldState` which must ALWAYS be valid (required fields ensure no undefined access)
  - **Device-camera's CameraState** was designed for incremental initialization (optional fields allow building up state)

  **Resolution Rationale**:
  - Use core's structure as canonical → More type-safe, WorldState.camera always valid
  - Reducer must always provide defaults → No undefined state
  - Device-camera re-exports from core → Single source of truth

  **Layout Mode - V1 Clean Architecture**:
  **NOT NEEDED** — This is V1 clean architecture. Use correct values only:
  - `'SINGLE'` | `'SPLIT_HORIZONTAL'` | `'SPLIT_VERTICAL'` | `'PIP'`
  - If any legacy `"SPLIT"` values exist in codebase, update them to `"SPLIT_HORIZONTAL"`
  - No runtime normalization — fail fast if incorrect value passed

  **Must NOT do**:
  - Change runtime behavior
  - Add new properties beyond merging existing ones
  - Introduce circular dependencies (use `import type` if needed)

  **Parallelizable**: NO (depends on Phase 0)

  **References**:
  - `packages/core/src/types/camera.ts:107` - Canonical definition (keep here)
  - `packages/device-camera/src/types/index.ts:317` - Duplicate to delete
  - `packages/core/src/types.ts:668` - Re-export to verify still works
  - Pre-flight report from Task 0 - List of files to update

  **Acceptance Criteria**:
  - [ ] `grep -r "interface CameraState" packages/` returns exactly 1 result
  - [ ] `pnpm typecheck` passes with zero errors
  - [ ] `lsp_find_references` on CameraState shows single definition
  - [ ] Layout mode includes all 4 values: SINGLE, SPLIT_HORIZONTAL, SPLIT_VERTICAL, PIP

  **Commit**: YES
  - Message: `refactor(camera): unify CameraState to single canonical definition in core`
  - Files: `packages/core/src/types/camera.ts`, `packages/device-camera/src/types/index.ts`, affected imports
  - Pre-commit: `pnpm typecheck`

---

### Phase 2: Test Infrastructure Setup

- [x] 2. Set Up Test Infrastructure for device-camera

  **What to do**:
  - Create test directory: `packages/device-camera/src/__tests__/`
  - Verify/create vitest config: `packages/device-camera/vitest.config.ts`
  - Create test utilities: `packages/device-camera/src/__tests__/fixtures.ts`
    - CameraState factory functions
    - CameraEffect factory functions
    - Mock anchor providers
  - Create canary test: `packages/device-camera/src/__tests__/plugin.test.ts`
    - Import plugin, verify it has required properties
    - Import all public exports, verify they exist
  - Verify `pnpm --filter @tokovo/device-camera test` runs and passes

  **Pre-Task Verification for Test Patterns**:

  ```bash
  # Check for existing vitest configs anywhere in monorepo
  find packages -name "vitest.config.ts" 2>/dev/null | head -3
  # Check for ANY existing test files
  find packages -name "*.test.ts" -o -name "*.spec.ts" | head -5
  ```

  **VERIFIED DURING PLANNING**:
  - No vitest configs exist in packages
  - No test files (`*.test.ts`, `*.spec.ts`) exist anywhere in the monorepo
  - This is a greenfield test setup - no existing patterns to follow

  **Conclusion**: Use the inline vitest config below. No existing test patterns to adapt from.

  **vitest config to create**:

  ```typescript
  // packages/device-camera/vitest.config.ts
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    test: {
      include: ["src/**/*.test.ts"],
      environment: "node",
    },
  });
  ```

  - **Fixture pattern** (if no reference exists):

    ```typescript
    // packages/device-camera/src/__tests__/fixtures.ts
    import type { CameraState, CameraEffect } from "../types";

    export function createDefaultCameraState(): CameraState {
      return {
        baseView: "APP_VIEW",
        appId: "test_app",
        activeDeviceId: "device_1",
        layout: { mode: "SINGLE" },
        activeEffects: [],
        transform: { scale: 1, translateX: 0, translateY: 0, rotation: 0 },
      };
    }

    export function createZoomEffect(
      overrides?: Partial<CameraEffect>,
    ): CameraEffect {
      return {
        type: "zoom",
        targetScale: 1.5,
        startFrame: 0,
        endFrame: 30,
        easing: "ease-in-out",
        ...overrides,
      };
    }
    ```

  **Must NOT do**:
  - Write comprehensive tests yet (comes in later tasks)
  - Change any source code
  - Add new dependencies (vitest already configured)

  **Parallelizable**: NO (depends on Phase 1)

  **References**:
  - `packages/device-camera/package.json` - Has vitest configured
  - `packages/core/src/types/camera.ts` - Types for fixtures
  - `packages/device-camera/src/plugin.ts` - Plugin to test
  - `packages/apps-whatsapp/` - Reference for test patterns if tests exist there

  **Acceptance Criteria**:
  - [ ] `packages/device-camera/src/__tests__/` directory exists
  - [ ] `packages/device-camera/src/__tests__/fixtures.ts` exports factory functions
  - [ ] `packages/device-camera/src/__tests__/plugin.test.ts` has canary test
  - [ ] `pnpm --filter @tokovo/device-camera test` → PASS (1+ tests)

  **Commit**: YES
  - Message: `test(device-camera): set up test infrastructure with fixtures and canary test`
  - Files: `packages/device-camera/src/__tests__/*`, `packages/device-camera/vitest.config.ts`
  - Pre-commit: `pnpm --filter @tokovo/device-camera test`

---

- [x] 3. Write Characterization Tests for Existing Behavior

  **What to do**:
  - Create `packages/device-camera/src/__tests__/reducer.test.ts`
    - Test each event type: zoom, shake, focus, track, reset, punch-zoom, dutch-tilt, flash, whip-pan, cut, set-view, layout
    - Capture current behavior (these are characterization tests, not TDD)
  - Create `packages/device-camera/src/__tests__/processors.test.ts`
    - Test `processActiveEffects` with various effect combinations
    - Test each registered processor
  - Create `packages/device-camera/src/__tests__/anchors.test.ts`
    - Test anchor registration and resolution

  **Characterization Test Pattern** (what "characterizing existing behavior" means):

  Unlike TDD (where you write the test first), characterization tests **lock in current behavior**:
  1. Create initial state
  2. Dispatch event/call function
  3. Assert the **actual output** (even if it seems suboptimal)
  4. Purpose: Detect if refactoring changes behavior unintentionally

  ```typescript
  // Example: packages/device-camera/src/__tests__/reducer.test.ts
  import { describe, test, expect } from "vitest";
  import { cameraReducer } from "../reducer";
  import { createDefaultCameraState } from "./fixtures";

  describe("cameraReducer", () => {
    describe("zoom event", () => {
      test("creates zoom effect with correct properties", () => {
        // 1. Initial state - NOTE: reducer expects { camera: CameraState }
        const state = { camera: createDefaultCameraState() };

        // 2. Dispatch event
        const event = {
          kind: "CAMERA",
          type: "zoom",
          at: 0,
          scale: 1.5,
          duration: 30,
          easing: "ease-out",
        };
        cameraReducer(state, event); // Mutates state.camera in place (immer-style)

        // 3. Assert CURRENT behavior (characterizing, not prescribing)
        expect(state.camera.activeEffects).toHaveLength(1);
        expect(state.camera.activeEffects[0]).toMatchObject({
          type: "zoom",
          targetScale: 1.5,
          startFrame: 0,
          endFrame: 30,
        });
      });

      test("handles missing optional fields with defaults", () => {
        const state = { camera: createDefaultCameraState() };
        const event = { kind: "CAMERA", type: "zoom", at: 10, scale: 2 };

        cameraReducer(state, event);

        // Characterize what defaults are applied
        expect(state.camera.activeEffects[0].easing).toBeDefined(); // Check actual default
      });
    });

    // Repeat for: shake, focus, track, reset, punch-zoom, dutch-tilt, flash, whip-pan, cut, set-view, layout
  });
  ```

  **Key Principle**: If a test fails after refactoring, you know exactly what changed. Don't "fix" the test to match new behavior without understanding why.

  **Must NOT do**:
  - Change source code behavior
  - Skip any existing effect types
  - Test DirectorLite (it's being deleted)

  **Parallelizable**: NO (depends on Task 2)

  **References**:
  - `packages/device-camera/src/reducer/index.ts` - Reducer logic to test
  - `packages/device-camera/src/processors/index.ts` - Processors to test
  - `packages/device-camera/src/anchors/index.ts` - Anchor system to test
  - `packages/device-camera/src/__tests__/fixtures.ts` - Use factory functions

  **Acceptance Criteria**:
  - [ ] reducer.test.ts covers all 12 event types (2 tests each = 24 tests)
  - [ ] processors.test.ts covers `processActiveEffects` and key processors (~6 tests)
  - [ ] anchors.test.ts covers registration and resolution (~5 tests)
  - [ ] `pnpm --filter @tokovo/device-camera test` → PASS (35+ tests)
  - [ ] All tests pass (characterizing existing behavior)

  **Commit**: YES
  - Message: `test(device-camera): add characterization tests for reducer, processors, and anchors`
  - Files: `packages/device-camera/src/__tests__/*.test.ts`
  - Pre-commit: `pnpm --filter @tokovo/device-camera test`

---

### Phase 3: Plugin Contract Implementation

- [x] 4. Implement Full TokovoPluginContract

  **CRITICAL ARCHITECTURE DECISION - READ FIRST**:

  Camera does NOT provide anchors. Apps provide anchors for their UI elements.
  - WhatsApp provides "lastMessage", "inputArea", "header" anchors
  - Camera's focus effect QUERIES those anchors via PluginManager
  - Therefore: `DeviceCameraPlugin.anchors = undefined`

  The current `anchors/registry.ts` in device-camera is MISPLACED — it stores APP anchors.
  Task 11 deletes this registry. Task 12 moves anchor definitions into WhatsApp's plugin.

  **What to do**:
  - Update `packages/device-camera/src/plugin.ts` to implement `TokovoPluginContract<"camera">`
  - Add required `views` property: `views: {}` (camera doesn't render UI directly)
  - Set `anchors: undefined` (camera CONSUMES anchors, doesn't provide them)
  - Move lowering handler into `lowering` property (Tier B)
  - Add lifecycle hooks: `onInit`, `onDestroy` (for cleanup)
  - Remove separate `registerCameraPlugin()` function (use PluginManager.register)
  - Update exports in `packages/device-camera/src/index.ts`
  - Write tests for plugin contract compliance

  **Pre-Planning Verification: Lowering Handler Structure** (VERIFIED):

  ```bash
  grep -A 5 "export.*cameraV2Lowering\|export.*CAMERA_EVENT_TYPES" packages/device-camera/src/lowering/handler.ts
  ```

  **VERIFIED EXPORTS** (from `packages/device-camera/src/lowering/handler.ts`):

  ```typescript
  // Line 41-44: Function signature
  export function cameraV2Lowering(
    event: CameraTrackEvent,
    _ctx: LoweringContext,
  ): RuntimeEvent[]

  // Line 217-240: Event types array
  export const CAMERA_EVENT_TYPES = [
    // DSL types (input from track builder)
    "SET", "ANIMATE_START", "ANIMATE_END", "SHAKE_START", "SHAKE_END",
    "FOCUS", "TRACK_START", "TRACK_END", "RESET", "PUNCH_ZOOM",
    "DUTCH_TILT", "FLASH", "WHIP_PAN",
    // Runtime types (output to processors)
    "ZOOM", "SHAKE", "ANCHOR_FOCUS", "ANCHOR_TRACK", "CUT",
    "punch-zoom", "dutch-tilt", "flash", ...
  ];
  ```

  **Signature Compatibility**: ✅ CONFIRMED
  - Function returns `RuntimeEvent[]` - compatible with `LoweringHandler.lower` signature
  - `CAMERA_EVENT_TYPES` is a string array - compatible with `LoweringHandler.handles`

  **Target Plugin Structure** (concrete implementation):

  ```typescript
  // packages/device-camera/src/plugin.ts
  import type { TokovoPluginContract } from "@tokovo/core";
  import { cameraReducer } from "./reducer";
  import { cameraV2Lowering, CAMERA_EVENT_TYPES } from "./lowering/handler";

  export const DeviceCameraPlugin: TokovoPluginContract<"camera"> = {
    id: "camera",
    version: "1.0.0",
    displayName: "Device Camera",

    // Tier A - Runtime
    reducer: cameraReducer,
    views: {}, // Camera doesn't render UI - renderer consumes transforms

    // Tier B - Lowering
    lowering: {
      handles: CAMERA_EVENT_TYPES, // ["zoom", "shake", "focus", "track", ...]
      lower: cameraV2Lowering,
    },

    // Camera CONSUMES anchors from apps, doesn't provide its own
    // Apps define their anchors in their own plugin.anchors property
    anchors: undefined,

    // Lifecycle
    lifecycle: {
      onInit: async (ctx) => {
        // Initialize any camera state if needed
      },
      onDestroy: async () => {
        // Cleanup any subscriptions or state
      },
    },
  };
  ```

  **Lifecycle Hooks Clarification**:

  **VERIFIED DURING PLANNING**: `TokovoPluginContract` interface (lines 251-298) has NO `lifecycle` property.

  Checked `packages/core/src/types/plugin-contract.ts`:
  - Lines 251-298 define the full interface
  - NO `lifecycle` property exists (not even optional)
  - Interface ends with `notificationAdapter?: PluginNotificationAdapter;`

  **CONCLUSION**: Lifecycle hooks are NOT part of the plugin contract. **REMOVE all lifecycle code from Task 4 implementation.**

  The target plugin structure below should NOT include any lifecycle property.

  ```typescript
  // Option A: Empty implementations (if lifecycle is required by contract)
  lifecycle: {
    onInit: async () => {},
    onDestroy: async () => {},
  },

  // Option B: Omit entirely (if lifecycle is optional in contract)
  // lifecycle: undefined,
  ```

  **Pre-Task Check**: ~~Read `TokovoPluginContract` interface to determine if lifecycle is required or optional.~~

  **ALREADY VERIFIED**: Lifecycle is NOT in the contract. See clarification above. Skip this check during execution.

  **Note on WhatsApp Pattern**: WhatsApp currently registers anchors separately via `registerAnchorProvider()` call (line 197 of apps-whatsapp/plugin.ts). Task 12 will migrate WhatsApp to use inline `anchors` property.

  **Pre-work - Current Anchor Registry Structure** (from `packages/device-camera/src/anchors/registry.ts`):

  The current anchor system is a **self-contained registry** that avoids cyclic dependencies with core:

  ```typescript
  // Current structure (lines 21-22, 46-97):
  const providerRegistry = new Map<string, AnchorProvider>();

  // AnchorProvider interface (from types.ts):
  interface AnchorProvider {
    appId: string; // e.g., "app_whatsapp"
    framing: Record<string, AnchorFraming>; // e.g., { lastMessage: { anchorPoint, targetFill } }
    getAnchors(world, layout, deviceId): AnchorSnapshot; // Returns anchor bounds
  }
  ```

  **Exported Functions to Migrate**:
  | Function | Keep/Delete | Notes |
  |----------|-------------|-------|
  | `registerAnchorProvider(provider)` | DELETE | Apps will use plugin.anchors instead |
  | `unregisterAnchorProvider(appId)` | DELETE | Lifecycle handles cleanup |
  | `getAnchorProvider(appId)` | KEEP (in resolver) | Need for focus effect resolution |
  | `getAnchorsForApp(appId, world, layout, deviceId)` | KEEP (in resolver) | Main entry for useCameraEngine |
  | `getAnchorFraming(appId, anchorName)` | KEEP (in resolver) | Used by focus processor |
  | `hasAnchorProvider(appId)` | DELETE | Use PluginManager.has() |
  | `getRegisteredAppIds()` | DELETE | Use PluginManager.getAppIds() |
  | `clearAnchorProviders()` | DELETE | Testing only |

  **Migration Insight**: Camera doesn't PROVIDE anchors - apps do. Camera CONSUMES anchors from apps. So `DeviceCameraPlugin.anchors` will be empty/undefined, while WhatsApp's plugin provides anchors. Task 11 clarifies this architectural distinction.

  **Camera Anchor Decision** (critical clarification):

  Since camera CONSUMES anchors rather than PROVIDES them:

  ```typescript
  export const DeviceCameraPlugin: TokovoPluginContract<"camera"> = {
    // ... other properties

    // Camera consumes anchors from app plugins, doesn't provide its own
    // Apps like WhatsApp provide anchors for their UI elements
    // Camera's focus/track effects query those app anchors
    anchors: undefined, // Explicitly undefined - camera is a consumer, not provider
  };
  ```

  **Rationale**: The `anchors` property is for plugins that PROVIDE UI targets (apps). Camera doesn't have UI - it transforms the view to focus on targets provided by other plugins.

  **Anchor Architecture Summary** (resolves Task 4 vs Task 11 confusion):

  | Plugin Type                       | Has `anchors` property?                                   | Role                       |
  | --------------------------------- | --------------------------------------------------------- | -------------------------- |
  | App plugins (WhatsApp, Instagram) | YES - `{ providers: { lastMessage: fn, inputArea: fn } }` | PROVIDE anchor bounds      |
  | Camera plugin                     | NO - `anchors: undefined`                                 | CONSUMES anchors from apps |

  **ANCHOR OWNERSHIP TABLE** (which plugin owns which anchors):
  | Anchor Name | Provider Plugin | Purpose |
  |-------------|----------------|---------|
  | `lastMessage` | `app_whatsapp` | Bounds of last chat message bubble |
  | `inputArea` | `app_whatsapp` | Bounds of text input area |
  | `header` | `app_whatsapp` | Bounds of chat header |
  | `device` | **NONE** (computed by renderer) | Viewport bounds - not a plugin anchor |
  | `viewport` | **NONE** (computed by renderer) | Same as device - not a plugin anchor |

  **CRITICAL CLARIFICATION**: The current `anchors/registry.ts` in device-camera is MISPLACED. It stores APP anchors, not camera anchors. Task 11 DELETES this registry because apps should define their own anchors in their plugin contract.

  **How Camera Consumes App Anchors**:
  - Focus processor calls `resolveAnchorBounds(appId, "lastMessage", world, deviceId)`
  - `resolveAnchorBounds` calls `PluginManager.get(appId).anchors?.providers?.["lastMessage"](world, deviceId)`
  - Returns bounds from the APP's anchor provider (not camera's)

  **What Task 11 Actually Does**:
  - Creates new `resolveAnchorBounds()` function in `anchors/resolver.ts` that wraps PluginManager calls
  - DELETES camera's internal `providerRegistry` (apps no longer register WITH camera)
  - Apps will instead register anchors IN THEIR OWN plugin's `anchors` property
  - Focus processor updated to use new resolver
  - **WhatsApp plugin updated** to use inline `anchors` property (IN SCOPE for V1)

  **ARCHITECTURAL DECISION - Camera Anchor Role** (resolves Task 4 vs Task 11 confusion):

  The current `anchors/registry.ts` lives in the CAMERA package but stores APP anchors. This is the architectural problem we're fixing:

  | Current (Wrong)                                        | Target (V1 Clean)                                          |
  | ------------------------------------------------------ | ---------------------------------------------------------- |
  | Apps call `registerAnchorProvider()` in camera package | Apps define anchors in their own `plugin.anchors` property |
  | Camera's registry.ts stores all app anchors            | Camera queries `PluginManager.get(appId).anchors`          |
  | Tight coupling between camera and apps                 | Loose coupling via plugin contract                         |

  **Execution Flow**:
  - Task 4: Set `DeviceCameraPlugin.anchors = undefined` ✅ (camera doesn't provide anchors)
  - Task 11: Delete `anchors/registry.ts`, create resolver that queries PluginManager
  - Task 12: Update WhatsApp to use inline `anchors` property (moves anchor definitions FROM camera TO WhatsApp)

  **Must NOT do**:
  - Change reducer logic
  - Change processor logic
  - Add new functionality beyond contract compliance

  **Parallelizable**: NO (depends on Phase 2)

  **References**:
  - `packages/core/src/types/plugin-contract.ts` - TokovoPluginContract interface
  - `packages/apps-whatsapp/src/plugin.ts` - Reference implementation of full contract
  - `packages/device-camera/src/plugin.ts` - Current minimal implementation
  - `packages/device-camera/src/anchors/index.ts` - Anchors to move into plugin
  - `packages/device-camera/src/lowering/handler.ts` - Lowering to move into plugin

  **Acceptance Criteria**:
  - [ ] Plugin implements `TokovoPluginContract<"camera">`
  - [ ] Plugin has: id, version, displayName, reducer, views, anchors, lowering, lifecycle
  - [ ] `registerCameraPlugin()` function removed
  - [ ] Test verifies plugin shape matches contract
  - [ ] `pnpm typecheck` passes
  - [ ] `pnpm --filter @tokovo/device-camera test` → PASS

  **Commit**: YES
  - Message: `refactor(device-camera): implement full TokovoPluginContract with anchors and lowering`
  - Files: `packages/device-camera/src/plugin.ts`, `packages/device-camera/src/index.ts`
  - Pre-commit: `pnpm typecheck && pnpm --filter @tokovo/device-camera test`

---

- [x] 5. Update Core to Use Plugin-Based Camera Registration

  **Current Handler Analysis** (from `packages/core/src/engine/handlers/camera.ts`):

  The handler currently:
  - **Line 10**: Directly imports `cameraReducer` from `@tokovo/device-camera`
  - **Line 97-99**: Calls reducer with unsafe cast: `cameraReducer(draft as unknown as Parameters<typeof cameraReducer>[0], event)`
  - **Switch handling**: SET_VIEW, CUT, LAYOUT handled directly in switch statement
  - **Default case**: Delegates all other camera events to cameraReducer

  **Why the unsafe cast exists**: Type mismatch between `WorldState` (has `camera?: CameraState`) and reducer expectation (requires `{ camera: CameraState }`). Task 1's type unification should eliminate this need.

  **What to do**:
  - Update `packages/core/src/engine/handlers/camera.ts` to get reducer from plugin registry
  - Remove hardcoded imports of device-camera internals
  - Ensure PluginManager properly registers camera plugin
  - Update any direct anchor registry usage to go through plugin system
  - Verify core doesn't bypass plugin for camera operations

  **PluginManager Integration Pattern**:

  ```typescript
  // packages/core/src/engine/handlers/camera.ts
  import { PluginManager } from "../plugin/plugin";

  export function processCameraEvent(draft: WorldState, event: CameraEvent) {
    // Get camera plugin from registry - NOTE: method is .get() not .getPlugin()
    const cameraPlugin = PluginManager.get("camera");
    if (!cameraPlugin) {
      throw new Error(
        "Camera plugin not registered. Ensure DeviceCameraPlugin is registered before engine initialization.",
      );
    }

    // Use plugin's reducer
    cameraPlugin.reducer(draft, event);
  }
  ```

  **Reference**: `packages/core/src/plugin/plugin.ts:337` - Method signature is `get(id: string): TokovoPluginContract<string> | undefined`

  **Pre-Planning Research** (completed during plan creation):

  Searched for plugin registration pattern:

  ```bash
  grep -rn "PluginManager.register" packages/
  ```

  **FOUND**:
  - `packages/apps-whatsapp/src/plugin.ts:195` - `PluginManager.register(WhatsAppPluginV2);`
  - `packages/core/src/plugin/plugin.ts:400` - `plugins.forEach((plugin) => PluginManager.register(plugin));`

  **Conclusion**: WhatsApp registers directly in its plugin.ts file (line 195). Camera should follow the same pattern.

  **Registration Strategy** (CRITICAL CLARIFICATION):

  | Question                       | Answer                                                                    |
  | ------------------------------ | ------------------------------------------------------------------------- |
  | WHERE does registration occur? | `packages/device-camera/src/plugin.ts` (self-registration, like WhatsApp) |
  | WHO is responsible?            | device-camera package, NOT core                                           |
  | WHEN does it execute?          | At import time (side effect when plugin.ts is imported)                   |

  **Implementation**:

  ```typescript
  // packages/device-camera/src/plugin.ts (end of file)
  import { PluginManager } from "@tokovo/core";

  export const DeviceCameraPlugin: TokovoPluginContract<"camera"> = {
    // ... plugin definition
  };

  // Self-registration (like WhatsApp pattern at apps-whatsapp/plugin.ts:195)
  PluginManager.register(DeviceCameraPlugin);
  ```

  **Initialization Order Requirement**:
  - `device-camera/src/plugin.ts` must be imported BEFORE core engine initializes
  - Typically handled by app entry point importing plugins before engine
  - If registration fails, core handler throws clear error (see lines 701-704 above)

  **Pre-Task: Verify Plugin Registration Flow**:
  1. Search for existing plugin registration:
     ```bash
     grep -rn "PluginManager.register\|registerPlugin" packages/core/src/ packages/renderer/src/
     ```
  2. Look for initialization entry points:
     ```bash
     grep -rn "DeviceCameraPlugin" packages/
     ```
  3. Check WhatsApp plugin registration as pattern:
     ```bash
     grep -rn "WhatsAppPlugin" packages/ | grep -i register
     ```

  **If registration IS found** (expected): Follow WhatsApp's pattern at `packages/apps-whatsapp/src/plugin.ts:195`

  **Registration Decision Algorithm** (REMOVES AMBIGUITY):

  **DEFINITIVE ANSWER: Follow WhatsApp's self-registration pattern.**

  **Pre-Task: PluginManager.get() Signature Verification** (VERIFIED DURING PLANNING):

  Read `packages/core/src/plugin/plugin.ts` lines 337-339:

  ```typescript
  get(id: string): TokovoPluginContract<string> | undefined {
    return this.plugins.get(id);
  }
  ```

  **Verification Result**:
  1. ✅ Method name is exactly `get(id: string)` (not getPlugin, find, etc.)
  2. ✅ Return type is `TokovoPluginContract<string> | undefined` (allows undefined check)
  3. ✅ Method is on PluginManager class (called as `PluginManager.get()`)

  **All 3 conditions met.** The integration pattern in Task 5 is correct.

  No decision tree needed. The pattern is established:
  1. Add self-registration at END of `packages/device-camera/src/plugin.ts`:

     ```typescript
     // Self-registration (following WhatsApp pattern)
     import { PluginManager } from "@tokovo/core";
     PluginManager.register(DeviceCameraPlugin);
     ```

  2. Ignore the alternative locations listed below - they were research options, not implementation choices

  **Why Self-Registration**: WhatsApp (the reference app plugin) uses this pattern. Camera follows suit for consistency. The pre-task grep commands below are VERIFICATION only (confirm no conflicts), not decision-making.

  **Initialization Order Requirement**:
  - Camera plugin MUST be registered BEFORE engine processes any CAMERA events
  - If using lazy registration, ensure handler throws helpful error message

  **Must NOT do**:
  - Change camera behavior
  - Modify other plugins
  - Change PluginManager itself (unless necessary)

  **Parallelizable**: NO (depends on Task 4)

  **References**:
  - `packages/core/src/engine/handlers/camera.ts` - Handler to update
  - `packages/core/src/plugin/plugin.ts` - PluginManager for registration
  - `packages/device-camera/src/plugin.ts` - New plugin to register
  - `packages/core/src/engine/built-in-handlers.ts` - Handler registration

  **Acceptance Criteria**:
  - [ ] Core handler uses reducer from plugin registry
  - [ ] No direct imports of device-camera internals in core handler
  - [ ] Camera operations go through plugin system
  - [ ] `pnpm typecheck` passes
  - [ ] Existing tests still pass

  **Commit**: YES
  - Message: `refactor(core): use plugin-based camera registration instead of direct imports`
  - Files: `packages/core/src/engine/handlers/camera.ts`, related files
  - Pre-commit: `pnpm typecheck`

---

### Phase 4: DirectorLite Deletion

---

## ⚠️ CRITICAL: Phase 4 Execution Rules

**Tasks 6 and 7 MUST be completed in ONE SESSION without committing between them.**

**Why**: Deleting DirectorLite (Task 6) breaks imports in useCameraEngine.ts. The codebase will NOT compile until Task 7 is complete.

**Execution Protocol**:

1. Start Task 6 → Delete director-lite directory and exports
2. **DO NOT** run `pnpm typecheck` (will fail - this is expected)
3. **DO NOT** commit
4. **IMMEDIATELY** start Task 7 → Update useCameraEngine.ts
5. **ONLY AFTER Task 7** → Run `pnpm typecheck` → Should pass
6. Commit both tasks together

**If you must pause**: Use `git stash` or leave both uncommitted. Do NOT push broken state.

---

- [x] 6. Delete DirectorLite Module

  **What to do**:
  - Delete entire directory: `packages/device-camera/src/director-lite/`
  - Remove exports from `packages/device-camera/src/index.ts`:
    - `deriveDirectorEffects`
    - `extractSignals`
    - Related types
  - Remove re-exports from `packages/core/src/index.ts`

  **Must NOT do**:
  - Delete anything outside director-lite
  - Remove types that are used elsewhere
  - Break compilation (verify imports before deleting)

  **Parallelizable**: NO (depends on Phase 3)

  **References**:
  - `packages/device-camera/src/director-lite/` - Directory to delete
  - `packages/device-camera/src/index.ts:10-11` - Exports to remove
  - `packages/core/src/index.ts:121-122` - Re-exports to remove
  - Pre-flight report from Task 0 - All import sites

  **Acceptance Criteria**:
  - [ ] `packages/device-camera/src/director-lite/` directory deleted
  - [ ] No `deriveDirectorEffects` or `extractSignals` exports remain
  - [ ] `grep -r "director-lite" packages/` returns 0 results (in src files)
  - [ ] DO NOT verify typecheck here (will fail until Task 7 complete - this is expected)

  **Commit**: NO (combine with Task 7 to avoid broken intermediate state)

  **IMPORTANT**: Tasks 6 and 7 MUST be completed in a single session without committing between them. Deleting director-lite without updating useCameraEngine will break the build. Complete both, then commit once.

  **Execution Coordination with Task 7**:
  - DO NOT commit after Task 6
  - DO NOT run `pnpm typecheck` after Task 6 (WILL FAIL due to broken imports - this is expected)
  - Complete Task 6 → immediately start Task 7 → verify typecheck → commit both together
  - **If you must pause**: Use `git stash` or leave both tasks uncommitted until both are complete
  - **Verification**: Only run `pnpm typecheck` AFTER both Task 6 AND Task 7 are complete

---

- [x] 7. Update Renderer to Remove DirectorLite Usage

  **What to do**:
  - Update `packages/renderer/src/engines/useCameraEngine.ts`:
    - Remove imports: `deriveDirectorEffects`, `extractSignals`
    - Remove `enableDirector` option (or keep as no-op for backward compat)
    - Remove `directorDebug` option
    - Remove DirectorLite logic (lines ~160-165)
    - Simplify hook to only handle manual camera effects
  - Handle `directorEnabled` flag gracefully:
    - **V1 CLEAN APPROACH**: Remove the option entirely
    - If code passes `directorEnabled`, TypeScript should error (option doesn't exist)
    - No runtime handling needed — option is deleted from types

  **Must NOT do**:
  - Remove manual camera functionality
  - Break existing episodes that don't use DirectorLite
  - Throw errors if directorEnabled is passed

  **Parallelizable**: NO (depends on Task 6)

  **References**:
  - `packages/renderer/src/engines/useCameraEngine.ts:36-38` - Imports to remove
  - `packages/renderer/src/engines/useCameraEngine.ts:67-71` - Options to handle
  - `packages/renderer/src/engines/useCameraEngine.ts:160-165` - Logic to remove
  - Pre-flight report from Task 0 - DirectorLite usage sites

  **Acceptance Criteria**:
  - [ ] No imports from director-lite in useCameraEngine
  - [ ] `directorEnabled: true` doesn't throw (backward compat)
  - [ ] Manual camera effects still work
  - [ ] `pnpm typecheck` passes
  - [ ] `pnpm --filter @tokovo/renderer test` passes (if tests exist)

  **Commit**: YES (includes Task 6 changes)
  - Message: `refactor(device-camera): delete DirectorLite and update renderer`
  - Files: Delete `packages/device-camera/src/director-lite/`, update index.ts, `packages/renderer/src/engines/useCameraEngine.ts`
  - Pre-commit: `pnpm typecheck`

---

- [x] 8. Update DSL Examples to Remove DirectorLite References

  **What to do**:
  - Delete `packages/dsl/examples/auto-director-showcase.dsl.ts` (entirely DirectorLite focused)
  - Update `packages/dsl/examples/manual-camera-showcase.dsl.ts`:
    - Remove `directorEnabled: false` comment/option (no longer needed)
  - Update `packages/dsl/examples/semantic-camera-showcase.dsl.ts`:
    - Remove DirectorLite comments
    - Ensure manual camera still works
  - Update any README references to DirectorLite

  **Must NOT do**:
  - Delete working manual camera examples
  - Remove semantic anchor functionality
  - Break examples that work without DirectorLite

  **Parallelizable**: NO (depends on Task 7)

  **References**:
  - `packages/dsl/examples/auto-director-showcase.dsl.ts` - Delete entirely
  - `packages/dsl/examples/manual-camera-showcase.dsl.ts:35` - Remove directorEnabled
  - `packages/dsl/examples/semantic-camera-showcase.dsl.ts:104-106` - Remove comments
  - `packages/device-camera/README.md` - Update docs

  **Acceptance Criteria**:
  - [ ] `auto-director-showcase.dsl.ts` deleted
  - [ ] No `directorEnabled` references in remaining examples
  - [ ] No `DirectorLite` comments in examples
  - [ ] Remaining examples compile: `pnpm --filter @tokovo/dsl typecheck`
  - [ ] README updated to remove DirectorLite sections

  **Commit**: YES
  - Message: `docs(dsl): remove DirectorLite examples and references`
  - Files: Delete auto-director-showcase.dsl.ts, update other examples, update README
  - Pre-commit: `pnpm --filter @tokovo/dsl typecheck`

---

### Phase 5: Event Case Standardization

- [x] 9. Standardize Camera Event Types to Lowercase

  **What to do**:
  - Update `packages/device-camera/src/lowering/handler.ts`:
    - Change all event type outputs to lowercase: `zoom`, `shake`, `focus`, `track`, etc.
    - Remove uppercase variants: `ZOOM`, `SHAKE`, etc.
  - Update `packages/device-camera/src/processors/index.ts`:
    - Remove duplicate registrations (keep only lowercase)
    - Verify all processors registered with lowercase keys
  - Update reducer if it has case-sensitive checks
  - Add test verifying all event types are lowercase

  **Event Case Strategy** (CRITICAL CLARIFICATION):

  | Layer                         | Current Case                          | Action                  | Reason                                         |
  | ----------------------------- | ------------------------------------- | ----------------------- | ---------------------------------------------- |
  | DSL Input (TrackEvent)        | Uppercase: `"SET"`, `"ANIMATE_START"` | **NO CHANGE**           | DSL layer is author-facing, case is convention |
  | Runtime Output (RuntimeEvent) | Mixed: `"ZOOM"`, `"zoom"`             | **CHANGE TO LOWERCASE** | Engine layer should be normalized              |
  | CAMERA_EVENT_TYPES array      | Mixed                                 | **NO CHANGE**           | Array handles both DSL and runtime types       |
  | Processor Registry            | Both cases registered                 | **KEEP LOWERCASE ONLY** | Remove duplicates                              |
  | Reducer normalization         | `toLowerCase()` at line 60            | **KEEP TEMPORARILY**    | Safety net until all producers verified        |

  **File-by-File Actions** (CONCRETE):

  **File 1: `packages/device-camera/src/lowering/handler.ts`**
  - Lines 77, 94, etc.: Change `type: "ZOOM"` → `type: "zoom"` (lowercase output)
  - Lines 217-240 (`CAMERA_EVENT_TYPES` array): **NO CHANGE** (array contains both DSL and runtime types)

  **File 2: `packages/device-camera/src/processors/index.ts`**
  - Find duplicate registrations: `processorRegistry.set("ZOOM", ...)` AND `processorRegistry.set("zoom", ...)`
  - Delete uppercase registrations: Remove all `.set("ZOOM", ...)`, `.set("SHAKE", ...)` etc.
  - Keep only lowercase: `.set("zoom", ...)`, `.set("shake", ...)` etc.

  **File 3: `packages/device-camera/src/reducer/index.ts`**
  - Line 60 (`toLowerCase()` normalization): **KEEP FOR NOW** (safety net)
  - Add TODO comment: `// TODO: Remove toLowerCase() after verifying all producers use lowercase`

  **Verification Commands**:

  ```bash
  # Should find uppercase only in: comments, CAMERA_EVENT_TYPES array, DSL input case statements
  grep -E '"ZOOM"|"SHAKE"|"FOCUS"|"TRACK"' packages/device-camera/src/lowering/handler.ts

  # Should return 0 matches (no uppercase in RuntimeEvent output)
  grep -E 'type: "ZOOM"|type: "SHAKE"' packages/device-camera/src/lowering/handler.ts
  ```

  **Scope Summary**:
  - ✅ Change: Lowering handler OUTPUT types (RuntimeEvent.type)
  - ✅ Change: Processor registry keys (lowercase only)
  - ❌ No change: DSL INPUT types (TrackEvent case statements)
  - ❌ No change: CAMERA_EVENT_TYPES array (handles both layers)
  - ⏳ Keep for now: Reducer toLowerCase() normalization (remove later when verified)

  **Current Mixed Case Locations** (verified from analysis):
  - Lowering handler outputs uppercase: `"ZOOM"`, `"SHAKE"` in switch cases
  - Reducer normalizes via `toLowerCase()` (line ~60): `const normalizedType = event.type.toLowerCase().replace(/_/g, "-")`
  - Processor registry likely has both cases registered (pattern from Momus: duplicate entries)

  **Standardization Pattern**:

  ```typescript
  // BEFORE (mixed case in lowering/handler.ts):
  case "ANIMATE_START":
    return { kind: "CAMERA", type: "ZOOM", ... };

  // AFTER (lowercase only):
  case "ANIMATE_START":
    return { kind: "CAMERA", type: "zoom", ... };
  ```

  **Processor Registry Cleanup**:

  ```typescript
  // BEFORE (packages/device-camera/src/processors/index.ts):
  processorRegistry.set("zoom", zoomProcessor);
  processorRegistry.set("ZOOM", zoomProcessor); // duplicate

  // AFTER:
  processorRegistry.set("zoom", zoomProcessor); // single registration
  ```

  **Note**: Keep reducer normalization until ALL lowercase confirmed working, then remove as redundant.

  **Must NOT do**:
  - Change events outside camera scope
  - Break existing stored events (handle both cases in reducer temporarily if needed)
  - Remove the normalization logic until verified working

  **Parallelizable**: NO (depends on Phase 4)

  **References**:
  - `packages/device-camera/src/lowering/handler.ts` - Mixed case outputs
  - `packages/device-camera/src/processors/index.ts` - Duplicate registrations
  - `packages/device-camera/src/reducer/index.ts` - Case normalization logic
  - Pre-flight report from Task 0 - All mixed case occurrences

  **Acceptance Criteria**:
  - [ ] Lowering outputs only lowercase event types
  - [ ] Processor registry has no duplicate case registrations
  - [ ] `grep -E "ZOOM|SHAKE|FOCUS|TRACK" packages/device-camera/src/` returns 0 in logic (comments OK)
  - [ ] Test verifies event case consistency
  - [ ] `pnpm --filter @tokovo/device-camera test` passes

  **Commit**: YES
  - Message: `refactor(device-camera): standardize all camera event types to lowercase`
  - Files: lowering/handler.ts, processors/index.ts, reducer/index.ts
  - Pre-commit: `pnpm --filter @tokovo/device-camera test`

---

### Phase 6: Type Safety Cleanup

- [x] 10. Remove Unsafe Type Cast from Core Handler

  **What to do**:
  - Locate the `as unknown as` cast in `packages/core/src/engine/handlers/camera.ts`
  - Analyze why the cast exists (type mismatch between core and device-camera)
  - Fix the underlying type mismatch (should be resolved by Task 1 unification)
  - Remove the cast entirely
  - Ensure TypeScript compiles without the cast
  - Add test that would fail if cast is re-introduced (type test)

  **Must NOT do**:
  - Replace with `@ts-ignore` or `@ts-expect-error`
  - Use a different unsafe cast
  - Change runtime behavior

  **Parallelizable**: NO (depends on Phase 5)

  **References**:
  - `packages/core/src/engine/handlers/camera.ts` - Location of unsafe cast
  - `packages/core/src/types/camera.ts` - Canonical CameraState
  - `packages/device-camera/src/reducer/index.ts` - Reducer parameter types
  - Task 1 completion - Type unification should have resolved root cause

  **Acceptance Criteria**:
  - [ ] `grep -r "as unknown as" packages/core/src/engine/handlers/camera.ts` returns 0 results
  - [ ] `grep -r "as unknown as" packages/device-camera/src/` returns 0 results
  - [ ] `pnpm typecheck` passes without any casts
  - [ ] No `@ts-ignore` or `@ts-expect-error` in camera code

  **Commit**: YES
  - Message: `fix(core): remove unsafe type cast from camera handler`
  - Files: `packages/core/src/engine/handlers/camera.ts`
  - Pre-commit: `pnpm typecheck`

---

- [x] 11. Unify Anchor Systems

  **What to do** (File-by-File Operations in Order):

  | Step | File                  | Action     | Details                                                      |
  | ---- | --------------------- | ---------- | ------------------------------------------------------------ |
  | 1    | `anchors/registry.ts` | **DELETE** | Remove entire file - apps will own their anchors             |
  | 2    | `anchors/resolver.ts` | **MODIFY** | Update imports, add `getAnchorFramingFromPlugin()`           |
  | 3    | `plugin.ts`           | **VERIFY** | Confirm `anchors: undefined` (camera consumes, not provides) |

  **Camera's Anchor Role** (architectural clarity):
  - Camera provides **ZERO** anchors. `DeviceCameraPlugin.anchors = undefined`
  - Apps like WhatsApp provide anchors via their `plugin.anchors` property
  - Camera's `resolver.ts` queries `PluginManager.get(appId).anchors` to consume app anchors

  **Migration Path for `getAnchorFraming()`**:
  - **Current**: `getAnchorFraming()` lives in `registry.ts` (being deleted)
  - **New**: `getAnchorFramingFromPlugin()` added to `resolver.ts` (implementation shown below)

  **Anchor Migration Steps** (concrete):

  **Step 1: DELETE the misplaced registry**:
  - Delete `packages/device-camera/src/anchors/registry.ts` entirely
  - This file currently stores APP anchors in the CAMERA package (wrong place)
  - Apps will now define anchors in their OWN plugin's `anchors` property

  **Step 2: Keep and update `resolver.ts`**:
  - Keep resolution LOGIC (coordinate transforms, fill scale calculations)
  - Update to query PluginManager instead of internal registry

  **Pre-Planning Verification: Current resolver.ts Structure** (VERIFIED):

  ```bash
  # Current exports from resolver.ts (171 lines total):
  ```

  **VERIFIED FUNCTIONS** (from `packages/device-camera/src/anchors/resolver.ts`):

  | Function                      | Lines   | Action | Reason                                                |
  | ----------------------------- | ------- | ------ | ----------------------------------------------------- |
  | `resolveAnchorWithFallback()` | 40-82   | KEEP   | Fallback chain logic (lastMessage→content→app→device) |
  | `anchorToOrigin()`            | 91-112  | KEEP   | Converts anchor rect to normalized origin (0-1)       |
  | `calculateFillScale()`        | 117-134 | KEEP   | Computes zoom scale for target fill percentage        |
  | `resolveAnchorFully()`        | 139-170 | MODIFY | Main resolution - update to use PluginManager         |

  **Current Problem** (line 8, 156):

  ```typescript
  import { getAnchorFraming } from "./registry"; // ❌ Imports from registry
  const framing = getAnchorFraming(appId, anchorName); // ❌ Uses registry function
  ```

  **Target resolver.ts Structure** (AFTER Task 11):

  ```typescript
  // packages/device-camera/src/anchors/resolver.ts (AFTER migration)

  import { PluginManager } from "@tokovo/core";
  import { Rect, ResolvedAnchor, AnchorSnapshot, AnchorFraming } from "./types";
  // DELETED: import { getAnchorFraming } from "./registry";

  // =============================================================================
  // KEEP: Fallback chains (unchanged)
  // =============================================================================
  const FALLBACK_CHAINS: Record<string, string[]> = {
    lastMessage: ["lastMessage", "content", "app", "device"],
    // ... rest unchanged
  };

  // =============================================================================
  // KEEP: resolveAnchorWithFallback (unchanged, lines 40-82)
  // =============================================================================
  export function resolveAnchorWithFallback(...) { /* unchanged */ }

  // =============================================================================
  // KEEP: anchorToOrigin (unchanged, lines 91-112)
  // =============================================================================
  export function anchorToOrigin(...) { /* unchanged */ }

  // =============================================================================
  // KEEP: calculateFillScale (unchanged, lines 117-134)
  // =============================================================================
  export function calculateFillScale(...) { /* unchanged */ }

  // =============================================================================
  // NEW: Get framing from app plugin (replaces registry.getAnchorFraming)
  // =============================================================================
  function getAnchorFramingFromPlugin(
    appId: string,
    anchorName: string
  ): AnchorFraming {
    const appPlugin = PluginManager.get(appId);
    const framing = appPlugin?.anchors?.framing?.[anchorName];
    // Default framing if not found
    return framing ?? { anchorPoint: { x: 0.5, y: 0.5 }, paddingPx: 20, targetFill: 0.6 };
  }

  // =============================================================================
  // MODIFY: resolveAnchorFully - use PluginManager instead of registry
  // =============================================================================
  export function resolveAnchorFully(
    anchorName: string,
    snapshot: AnchorSnapshot,
    appId: string,
    viewport: { width: number; height: number },
  ) {
    const resolved = resolveAnchorWithFallback(anchorName, snapshot.anchors, viewport);
    const framing = getAnchorFramingFromPlugin(appId, anchorName);  // ✅ NEW
    const origin = anchorToOrigin(resolved, framing, viewport);
    const suggestedScale = calculateFillScale(resolved.rect, viewport, framing.targetFill);

    return { ...origin, suggestedScale, isFallback: resolved.isFallback, resolvedAnchor: resolved.anchor };
  }
  ```

  **Step 3: Update focus processor** to use new resolver

  **Step 4 (Task 12)**: Update WhatsApp to define its anchors inline
  - Move anchor definitions FROM camera's registry TO WhatsApp's plugin

  **NOTE**: The code example below shows WhatsApp's plugin (NOT camera's):

      ```typescript
      // packages/apps-whatsapp/src/plugin.ts (NOT camera!)
      import { WhatsAppAnchors } from "./runtime/adapters/anchors";

      export const WhatsAppPlugin = {
        // ..
        anchors: {
          ...WhatsAppAnchors,  // WhatsApp provides its OWN anchors
        },
      };
      ```

  **Camera's plugin structure** (for clarity):
  `typescript
// packages/device-camera/src/plugin.ts
export const DeviceCameraPlugin = {
  // ...
  anchors: undefined,  // Camera CONSUMES, doesn't provide
};
` 4. **Keep `resolver.ts`** for resolution logic:
  - `anchorToOrigin()` - converts anchor bounds to transform origin
  - `calculateFillScale()` - computes zoom scale to fill viewport
  - `resolveAnchorFully()` - main resolution function
  5. **Delete `registry.ts`** entirely:
     - Remove `registerAnchorProvider()` function
     - Remove `getAnchorsForApp()` function
     - Remove internal providers map
  6. **Update imports**:

     ```typescript
     // BEFORE:
     import {
       registerAnchorProvider,
       getAnchorsForApp,
     } from "./anchors/registry";

     // AFTER:
     import { resolveAnchorFully } from "./anchors/resolver";
     // Providers now accessed via plugin.anchors.providers
     ```

  **Core's Anchor System**: Each plugin provides its own anchors via `TokovoPluginContract.anchors.providers`. Core's `PluginManager` aggregates all plugin anchors and provides a unified lookup. Camera's focus effect should query the target app's plugin anchors, not camera's own anchors.

  **Anchor Architectural Clarification** (CRITICAL):

  The anchor system has a **producer/consumer** relationship:

  | Role         | Plugin                            | Provides                                                     | Consumes                            |
  | ------------ | --------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
  | **Producer** | App plugins (WhatsApp, Instagram) | Anchor bounds for UI elements (lastMessage, inputArea, etc.) | Nothing                             |
  | **Consumer** | Camera plugin                     | Nothing (or minimal)                                         | App anchor bounds for focus effects |

  **Why Camera Queries App Anchors**:
  - Camera's `focus("lastMessage")` effect needs to know WHERE lastMessage is on screen
  - Only the app (WhatsApp) knows where its lastMessage bubble is rendered
  - Camera asks WhatsApp's anchor provider: "Where is lastMessage?" → Gets bounds → Computes transform

  **Focus Effect Resolution Flow**:

  ```
  1. User calls: cam.focus({ target: "lastMessage", ... })
  2. Focus processor runs at frame N
  3. Processor calls: PluginManager.get(currentAppId).anchors.providers["lastMessage"](world, deviceId)
  4. App returns: { x: 0.5, y: 0.7, width: 0.3, height: 0.1 } (normalized 0-1)
  5. Camera computes transform to center/zoom on those bounds
  ```

  **Implication for Task 4**: `DeviceCameraPlugin.anchors.providers` will likely be EMPTY or minimal. The camera doesn't provide anchor targets - it consumes them from apps. The main change is:
  - DELETE: device-camera's internal `providerRegistry` (apps no longer register here)
  - KEEP: Resolution logic that queries `PluginManager.get(appId).anchors`

  **Concrete Anchor Resolution Integration** (the actual code change):

  **CURRENT Resolution Flow** (before migration):

  ```typescript
  // In packages/device-camera/src/anchors/resolver.ts (or processors/focus.ts)
  import { getAnchorsForApp, getAnchorProvider } from "./registry";

  function resolveFocusTarget(appId, anchorName, world, deviceId) {
    const provider = getAnchorProvider(appId); // Queries internal registry
    return provider?.getAnchors(world, layout, deviceId);
  }
  ```

  **TARGET Resolution Flow** (after migration):

  ```typescript
  // In packages/device-camera/src/anchors/resolver.ts
  import { PluginManager } from "@tokovo/core";

  export function resolveAnchorBounds(
    appId: string,
    anchorName: string,
    world: WorldState,
    deviceId: string,
  ): AnchorBounds | null {
    // Query the app plugin's anchors (not camera's internal registry)
    const appPlugin = PluginManager.get(appId);
    if (!appPlugin?.anchors?.providers?.[anchorName]) {
      console.warn(`Anchor "${anchorName}" not found for app "${appId}"`);
      return null;
    }
    return appPlugin.anchors.providers[anchorName](world, deviceId);
  }
  ```

  **Files to Update for Resolution Flow**:
  - `anchors/resolver.ts` - Replace all `getAnchorProvider()` calls with `PluginManager.get(appId).anchors`
  - `processors/focus.ts` - If it calls registry directly, update to use new resolver
  - Search for: `grep -r "getAnchorProvider\|getAnchorsForApp" packages/device-camera/src/`

  **Pre-Planning Research** (completed during plan creation):

  Searched for anchor call sites:

  ```bash
  grep -rn "getAnchorsForApp|getAnchorProvider|getAnchorFraming" packages/device-camera/src/
  ```

  **FOUND 9 matches in 3 files**:

  | File                  | Line       | Function                        | Migration Action            |
  | --------------------- | ---------- | ------------------------------- | --------------------------- |
  | `anchors/index.ts`    | 23, 25, 26 | Exports                         | DELETE these exports        |
  | `anchors/registry.ts` | 57, 72, 88 | Definitions                     | DELETE entire file          |
  | `anchors/resolver.ts` | 8, 156     | `getAnchorFraming` import/usage | UPDATE to use PluginManager |

  **Migration Plan**:
  - `anchors/index.ts` → Remove exports of registry functions
  - `anchors/registry.ts` → DELETE entirely (apps define their own anchors)
  - `anchors/resolver.ts:8` → Replace `import { getAnchorFraming } from "./registry"` with PluginManager query
  - `anchors/resolver.ts:156` → Update `getAnchorFraming(appId, anchorName)` call to query `PluginManager.get(appId).anchors`

  **Pre-Task: Map AND DOCUMENT All Anchor Resolution Call Sites**:

  **VERIFIED DURING PLANNING** (grep results - NO hypothetical examples):

  ```bash
  grep -rn "getAnchorsForApp\|getAnchorProvider\|getAnchorFraming" packages/device-camera/src/ packages/renderer/src/
  ```

  **ACTUAL CALL SITES** (13 matches in 6 files):

  | File                                    | Line       | Pattern                         | Migration Action                          |
  | --------------------------------------- | ---------- | ------------------------------- | ----------------------------------------- |
  | `device-camera/anchors/index.ts`        | 23, 25, 26 | Exports                         | DELETE these exports                      |
  | `device-camera/anchors/registry.ts`     | 57, 72, 88 | Definitions                     | DELETE entire file                        |
  | `device-camera/anchors/resolver.ts`     | 8, 156     | `getAnchorFraming` import/usage | UPDATE to use PluginManager               |
  | `renderer/index.ts`                     | 72         | Comment only                    | UPDATE comment (no code change)           |
  | `renderer/engines/useCameraEngine.ts`   | 33, 121    | `getAnchorsForApp` import/call  | UPDATE import source + use plugin anchors |
  | `renderer/anchor-providers/registry.ts` | 36         | `getAnchorsForApp` definition   | KEEP (this is renderer's own registry)    |

  **Migration Checklist** (execute in order):
  1. `device-camera/anchors/registry.ts` → DELETE (apps own their anchors now)
  2. `device-camera/anchors/index.ts:23,25,26` → DELETE the 3 registry exports
  3. `device-camera/anchors/resolver.ts:8` → Replace import with inline PluginManager logic
  4. `device-camera/anchors/resolver.ts:156` → Call new `getAnchorFramingFromPlugin()` instead
  5. `renderer/engines/useCameraEngine.ts:33,121` → Update to query plugin's `getAnchors()` method
  6. `renderer/index.ts:72` → Update comment to reflect new architecture
  7. `renderer/anchor-providers/registry.ts` → **KEEP** (this is renderer's separate registry, not being deleted)

  **NO HYPOTHETICAL EXAMPLES - only actual grep matches above.**

  **Pattern Selection**:
  - **Pattern A (Single anchor lookup)**: For calls like `getAnchorProvider(appId)` → Use `resolveAnchorBounds()`
  - **Pattern B (Full snapshot)**: For calls like `getAnchorsForApp()` → Use `getAnchorSnapshot()`
  - **Pattern C (Framing lookup)**: For calls like `getAnchorFraming()` → Move utility into resolver

  ```typescript
  // BEFORE (calling internal registry):
  import { getAnchorsForApp } from "./anchors/registry";
  const snapshot = getAnchorsForApp(appId, world, layout, deviceId);
  const anchorBounds = snapshot.anchors["lastMessage"];

  // AFTER (calling new resolver that queries PluginManager):
  import { resolveAnchorBounds } from "./anchors/resolver";
  const anchorBounds = resolveAnchorBounds(
    appId,
    "lastMessage",
    world,
    deviceId,
  );
  // NOTE: resolveAnchorBounds returns single anchor directly, not full snapshot
  ```

  **For functions that need full snapshot** (if any):

  ```typescript
  // Create a snapshot aggregator if needed
  export function getAnchorSnapshot(
    appId: string,
    world: WorldState,
    deviceId: string,
  ): AnchorSnapshot {
    const appPlugin = PluginManager.get(appId);
    if (!appPlugin?.anchors?.providers) return { anchors: {} };

    const anchors: Record<string, AnchorBounds> = {};
    for (const [name, provider] of Object.entries(
      appPlugin.anchors.providers,
    )) {
      const bounds = provider(world, deviceId);
      if (bounds) anchors[name] = bounds;
    }
    return { anchors };
  }
  ```

  **Must NOT do**:
  - Break anchor resolution for focus effects
  - Remove anchor types (keep in types/index.ts)
  - Change anchor coordinate system

  **Parallelizable**: NO (depends on Task 10)

  **References**:
  - `packages/device-camera/src/anchors/registry.ts` - To remove/migrate
  - `packages/device-camera/src/anchors/resolver.ts` - May keep for resolution logic
  - `packages/core/src/types/plugin-contract.ts` - PluginAnchorRegistry interface
  - `packages/device-camera/src/plugin.ts` - Plugin's anchors property
  - `packages/apps-whatsapp/src/plugin.ts` - Reference for anchor registration

  **Acceptance Criteria**:
  - [ ] Single anchor registration mechanism (via plugin)
  - [ ] Focus effects still resolve anchors correctly
  - [ ] Test verifies anchor registration and resolution
  - [ ] No duplicate anchor registries
  - [ ] `pnpm --filter @tokovo/device-camera test` passes

  **Commit**: YES
  - Message: `refactor(device-camera): unify anchor system to use core plugin anchors`
  - Files: anchors/\*.ts, plugin.ts
  - Pre-commit: `pnpm --filter @tokovo/device-camera test`

---

- [x] 12. Migrate WhatsApp Plugin to Use Inline Anchors

  **What to do**:
  - Update `packages/apps-whatsapp/src/plugin.ts` to include `anchors` property
  - Extract anchor providers from wherever `registerAnchorProvider(WhatsAppAnchors)` is called (line ~197)
  - Move anchor definitions into the plugin object's `anchors.providers` property
  - Delete the `registerAnchorProvider()` call
  - Verify WhatsApp's anchors work with camera's new resolution flow

  **Pre-Task: Locate Current Anchor Setup** (VERIFIED):

  ```bash
  grep -rn "registerAnchorProvider\|WhatsAppAnchors" packages/apps-whatsapp/src/
  ```

  **VERIFIED LOCATIONS**:
  - `packages/apps-whatsapp/src/plugin.ts:176` - Import: `import { WhatsAppAnchors } from "./runtime/adapters/anchors";`
  - `packages/apps-whatsapp/src/plugin.ts:197` - Call: `registerAnchorProvider(WhatsAppAnchors);`
  - `packages/apps-whatsapp/src/runtime/adapters/anchors.ts:13` - Definition: `export const WhatsAppAnchors: AnchorProvider = {...}`

  **VERIFIED WhatsAppAnchors STRUCTURE** (from `packages/apps-whatsapp/src/runtime/adapters/anchors.ts`):

  ```typescript
  // Lines 1-107 of anchors.ts
  import {
    AnchorProvider,
    AnchorSnapshot,
    LayoutRect,
    ChatLayoutState,
  } from "@tokovo/core";
  import { WHATSAPP_APP_ID } from "../../constants";

  export const WhatsAppAnchors: AnchorProvider = {
    appId: WHATSAPP_APP_ID, // "app_whatsapp"

    // Static Framing Definitions (lines 17-62)
    framing: {
      message: {
        anchorPoint: { x: 0.5, y: 0.5 },
        paddingPx: 40,
        targetFill: 0.6,
      },
      message_me: {
        anchorPoint: { x: 0.6, y: 0.5 },
        paddingPx: 40,
        targetFill: 0.6,
      },
      message_other: {
        anchorPoint: { x: 0.4, y: 0.5 },
        paddingPx: 40,
        targetFill: 0.6,
      },
      device: {
        anchorPoint: { x: 0.5, y: 0.5 },
        paddingPx: 0,
        targetFill: 1.0,
      },
      typing: {
        anchorPoint: { x: 0.35, y: 0.5 },
        paddingPx: 30,
        targetFill: 0.3,
      },
      input: {
        anchorPoint: { x: 0.5, y: 0.8 },
        paddingPx: 20,
        targetFill: 0.9,
      },
      header: {
        anchorPoint: { x: 0.5, y: 0.15 },
        paddingPx: 10,
        targetFill: 0.9,
      },
      profile: {
        anchorPoint: { x: 0.2, y: 0.15 },
        paddingPx: 50,
        targetFill: 0.4,
      },
    },

    // Dynamic extraction method (lines 66-106)
    getAnchors(world, layout, deviceId): AnchorSnapshot {
      const chatLayout = layout as ChatLayoutState;
      const anchors: Record<string, LayoutRect> = {};
      // Maps semantic regions to anchors, adds "lastMessage" alias
      return { anchors, deviceId, appId: APP_ID };
    },
  };
  ```

  **Migration Strategy**:
  The `WhatsAppAnchors` object already has the correct structure! It just needs to be:
  1.  Moved INTO the plugin's `anchors` property
  2.  Import/call to `registerAnchorProvider()` deleted

  **Target WhatsApp Plugin Structure**:

  ```typescript
  // packages/apps-whatsapp/src/plugin.ts
  export const WhatsAppPluginV2: TokovoPluginContract<"app_whatsapp"> = {
    id: "app_whatsapp",
    // ... existing properties (views, reducer, etc.)

    // NEW: Inline anchors (moved from registerAnchorProvider call)
    anchors: {
      providers: {
        lastMessage: (world, deviceId) => {
          // Return bounds of last message bubble
          // { x: 0.5, y: 0.8, width: 0.4, height: 0.1 }
        },
        inputArea: (world, deviceId) => {
          // Return bounds of input text area
        },
        header: (world, deviceId) => {
          // Return bounds of chat header
        },
        // ... other WhatsApp-specific anchors
      },
    },
  };
  ```

  **V1 Clean Architecture Benefit**:
  - ONE way to define anchors (plugin.anchors)
  - No external registration function
  - Plugins are self-contained
  - Camera queries PluginManager — never couples to specific apps

  **Must NOT do**:
  - Keep the old `registerAnchorProvider()` function (delete it)
  - Add backward compatibility (this is V1)

  **Parallelizable**: NO (depends on Task 11)

  **References**:
  - `packages/apps-whatsapp/src/plugin.ts:197` - Current `registerAnchorProvider()` call
  - `packages/core/src/types/plugin-contract.ts` - `PluginAnchorRegistry` interface
  - Task 11's resolver - Should now work with WhatsApp's inline anchors

  **Acceptance Criteria**:
  - [ ] WhatsApp plugin has `anchors: { providers: {...} }` property
  - [ ] `grep -r "registerAnchorProvider" packages/apps-whatsapp/` returns 0 results
  - [ ] Camera's focus effect can resolve WhatsApp anchors via PluginManager
  - [ ] `pnpm typecheck` passes
  - [ ] WhatsApp semantic camera example still works

  **Commit**: YES
  - Message: `refactor(apps-whatsapp): migrate to inline anchors in plugin contract`
  - Files: `packages/apps-whatsapp/src/plugin.ts`, anchor-related files
  - Pre-commit: `pnpm typecheck`

---

- [ ] 13. Delete Legacy Anchor Registration (SKIPPED - cleanup) Functions

  **What to do**:
  - Delete `registerAnchorProvider()` from camera's exports
  - Delete `unregisterAnchorProvider()` from camera's exports
  - Delete any anchor registration utilities that apps were supposed to call
  - Update camera's index.ts to remove these exports
  - Ensure no package depends on deleted functions

  **Pre-Task: Verify No Other Apps Use Legacy Pattern**:

  ```bash
  grep -rn "registerAnchorProvider\|unregisterAnchorProvider" packages/ --include="*.ts" | grep -v node_modules
  ```

  If other apps found using legacy pattern → add them to migration scope

  **Must NOT do**:
  - Keep legacy functions "just in case"
  - Add deprecation warnings (V1 = clean break)

  **Parallelizable**: NO (depends on Task 12)

  **Acceptance Criteria**:
  - [ ] `registerAnchorProvider` not exported from `@tokovo/device-camera`
  - [ ] `grep -r "registerAnchorProvider" packages/*/src/` returns 0 results
  - [ ] `pnpm typecheck` passes
  - [ ] All apps use inline anchors

  **Commit**: YES
  - Message: `refactor(device-camera): delete legacy anchor registration API`
  - Files: `packages/device-camera/src/index.ts`, `packages/device-camera/src/anchors/`
  - Pre-commit: `pnpm typecheck`

---

### Phase 7: Integration Verification

- [x] 14. End-to-End Integration Verification

  **What to do**:
  - Run manual camera showcase DSL example and verify rendering
  - Run semantic camera showcase and verify anchor resolution
  - Verify all camera effects work: zoom, shake, focus, track, reset, punch-zoom, dutch-tilt, flash, whip-pan
  - Run full test suite across all packages
  - Verify no TypeScript errors across entire monorepo
  - Check browser console for runtime errors

  **Must NOT do**:
  - Skip any verification step
  - Ignore warnings
  - Proceed if any test fails

  **Parallelizable**: NO (final verification)

  **References**:
  - `packages/dsl/examples/manual-camera-showcase.dsl.ts` - Must render correctly
  - `packages/dsl/examples/semantic-camera-showcase.dsl.ts` - Must render correctly
  - `packages/renderer/src/engines/useCameraEngine.ts` - Integration point

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` passes (zero errors across monorepo)
  - [ ] `pnpm test` passes (all packages)
  - [ ] Manual camera showcase renders correctly (visual verification)
  - [ ] Semantic camera showcase renders correctly (visual verification)
  - [ ] Browser console shows no errors
  - [ ] All 10+ camera effects verified working

  **Manual Verification (Playwright or manual)**:
  - [ ] Navigate to manual camera showcase
  - [ ] Verify zoom effect applies correctly
  - [ ] Verify focus effect frames target correctly
  - [ ] Verify shake effect animates
  - [ ] Screenshot evidence saved

  **Commit**: YES
  - Message: `chore(camera): complete plugin migration - all tests passing`
  - Files: Any final adjustments
  - Pre-commit: `pnpm typecheck && pnpm test`

---

- [x] 15. Documentation Update

  **What to do**:
  - Update `packages/device-camera/README.md`:
    - Remove DirectorLite documentation
    - Document new plugin architecture
    - Update usage examples
  - Add CHANGELOG entry documenting:
    - DirectorLite removal (breaking change)
    - Plugin architecture migration
    - Type unification
  - Update architecture docs if `camera_arch.md` exists

  **Must NOT do**:
  - Write extensive new documentation
  - Document internal implementation details
  - Create new doc files

  **Parallelizable**: YES (with Task 12, after code complete)

  **References**:
  - `packages/device-camera/README.md` - Main doc to update
  - `CHANGELOG.md` - Add entry if exists
  - Any architecture docs mentioning camera

  **Acceptance Criteria**:
  - [ ] README has no DirectorLite references
  - [ ] README documents plugin-based usage
  - [ ] CHANGELOG entry added (if CHANGELOG exists)
  - [ ] No broken doc links

  **Commit**: YES
  - Message: `docs(device-camera): update documentation for plugin migration`
  - Files: README.md, CHANGELOG.md
  - Pre-commit: None

---

## Commit Strategy

| After Task | Message                                                                                  | Files                              | Verification                  |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------- |
| 1          | `refactor(camera): unify CameraState to single canonical definition in core`             | types/\*.ts                        | `pnpm typecheck`              |
| 2          | `test(device-camera): set up test infrastructure with fixtures and canary test`          | **tests**/\*                       | `pnpm test`                   |
| 3          | `test(device-camera): add characterization tests for reducer, processors, and anchors`   | **tests**/\*.test.ts               | `pnpm test`                   |
| 4          | `refactor(device-camera): implement full TokovoPluginContract with anchors and lowering` | plugin.ts, index.ts                | `pnpm typecheck && pnpm test` |
| 5          | `refactor(core): use plugin-based camera registration instead of direct imports`         | handlers/camera.ts                 | `pnpm typecheck`              |
| 6+7        | `refactor(device-camera): delete DirectorLite and update renderer`                       | director-lite/, useCameraEngine.ts | `pnpm typecheck`              |
| 8          | `docs(dsl): remove DirectorLite examples and references`                                 | examples/\*.ts, README             | `pnpm typecheck`              |
| 9          | `refactor(device-camera): standardize all camera event types to lowercase`               | lowering, processors, reducer      | `pnpm test`                   |
| 10         | `fix(core): remove unsafe type cast from camera handler`                                 | handlers/camera.ts                 | `pnpm typecheck`              |
| 11         | `refactor(device-camera): unify anchor system to use core plugin anchors`                | anchors/\*.ts, plugin.ts           | `pnpm test`                   |
| 12         | `refactor(apps-whatsapp): migrate to inline anchors in plugin contract`                  | apps-whatsapp/plugin.ts            | `pnpm typecheck`              |
| 13         | `refactor(device-camera): delete legacy anchor registration API`                         | anchors/, index.ts                 | `pnpm typecheck`              |
| 14         | `chore(camera): complete plugin migration - all tests passing`                           | final adjustments                  | `pnpm typecheck && pnpm test` |
| 15         | `docs(device-camera): update documentation for plugin migration`                         | README, CHANGELOG                  | None                          |

---

## Success Criteria

### Verification Commands

```bash
# Type check entire monorepo
pnpm typecheck  # Expected: 0 errors

# Run camera tests
pnpm --filter @tokovo/device-camera test  # Expected: All tests pass

# Run all tests
pnpm test  # Expected: All packages pass

# Verify no unsafe casts
grep -r "as unknown as" packages/core/src/engine/handlers/camera.ts  # Expected: 0 matches

# Verify single CameraState
grep -r "interface CameraState" packages/  # Expected: 1 match

# Verify no DirectorLite
grep -r "DirectorLite" packages/*/src/  # Expected: 0 matches
```

### Final Checklist

- [ ] All "Must Have" items present
- [ ] All "Must NOT Have" items absent
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Manual camera showcase renders correctly
- [ ] Semantic anchors resolve correctly
- [ ] No runtime errors in browser
- [ ] Documentation updated
