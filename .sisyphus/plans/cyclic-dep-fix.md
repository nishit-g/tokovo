# Fix Cyclic Dependency & TypeScript Errors

## Context

### Original Request

Fix turbo build error: `Cyclic dependency detected: @tokovo/device-camera, @tokovo/core`
Also fix all remaining TypeScript errors from the camera migration.

### Interview Summary

**Key Discoveries**:

- `core/package.json` line 11 depends on `@tokovo/device-camera`
- `device-camera/package.json` line 14 depends on `@tokovo/core`
- This creates a bidirectional dependency that turbo cannot resolve

**Root Cause**:

- During camera migration, `registry.ts` was deleted from device-camera
- `core/src/anchors/registry.ts` is a facade that imports from device-camera
- `core/src/index.ts` lines 37-40 re-export registry functions from device-camera
- These functions no longer exist in device-camera, causing broken imports

**Solution Path**:

1. Restore `registry.ts` in device-camera (from git history)
2. Export registry functions from device-camera
3. Remove `@tokovo/device-camera` dependency from core's package.json
4. Core facade will work again (imports from device-camera as peer)
5. Fix remaining TS errors (test imports, ViewLayoutMode, implicit any)

### Metis Review

**Identified Gaps** (addressed):

- Missing registry implementation: RESTORE from git history at commit HEAD~10
- Test imports broken: Will work once registry is restored
- Cyclic dependency: Breaking by removing core→device-camera package.json dep

---

## Work Objectives

### Core Objective

Break the cyclic dependency between @tokovo/core and @tokovo/device-camera while restoring all missing functionality.

### Concrete Deliverables

- `packages/device-camera/src/anchors/registry.ts` - restored
- `packages/device-camera/src/anchors/index.ts` - exports registry functions
- `packages/core/package.json` - no device-camera dependency
- All TypeScript errors resolved
- `turbo run dev` works without cycle error

### Definition of Done

- [x] `turbo run dev` starts without "Cyclic dependency" error
- [x] `pnpm -r exec tsc --noEmit` passes with 0 errors (related to our changes)
- [x] `pnpm test` passes all tests including anchors.test.ts (32 tests)

### Must Have

- Registry functions restored: registerAnchorProvider, getAnchorProvider, hasAnchorProvider, getAnchorsForApp, getAnchorFraming, getRegisteredAppIds, clearAnchorProviders, getProviderCount
- One-way dependency: device-camera → core (not reverse)
- All existing tests pass

### Must NOT Have (Guardrails)

- NO new dependencies added to core package.json
- NO changes to AnchorProvider interface or types
- NO changes to resolver.ts logic
- NO modification of plugin registration behavior
- NO breaking changes to public API signatures

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (bun test)
- **User wants tests**: YES (existing tests must pass)
- **Framework**: bun test

### Verification Commands

```bash
# After each task
turbo run dev --dry-run  # Check for cycle errors
pnpm -r exec tsc --noEmit  # Check for TS errors

# Final verification
pnpm test  # All tests including 32 anchor tests
turbo run dev  # Full dev server starts
```

---

## Task Flow

```
Task 1 (Restore registry.ts)
    ↓
Task 2 (Export from anchors barrel)
    ↓
Task 3 (Remove core→device-camera dep)
    ↓
Task 4 (Fix anchors.test.ts imports)
    ↓
Task 5 (Fix ViewLayoutMode export) ← parallel with Task 6
Task 6 (Fix implicit any in reducer) ← parallel with Task 5
    ↓
Task 7 (Final verification)
```

## Parallelization

| Group | Tasks | Reason                                  |
| ----- | ----- | --------------------------------------- |
| A     | 5, 6  | Independent TS fixes in different files |

| Task | Depends On | Reason                                |
| ---- | ---------- | ------------------------------------- |
| 2    | 1          | Can't export until file exists        |
| 3    | 2          | Must have exports before removing dep |
| 4    | 2          | Test imports need exports to exist    |
| 7    | 1-6        | Final verification needs all fixes    |

---

## TODOs

- [x] 1. Restore registry.ts in device-camera

  **What to do**:
  - Restore `packages/device-camera/src/anchors/registry.ts` from git history
  - Command: `git show HEAD~10:packages/device-camera/src/anchors/registry.ts > packages/device-camera/src/anchors/registry.ts`
  - Verify file contains all 9 functions:
    - registerAnchorProvider
    - unregisterAnchorProvider
    - getAnchorProvider
    - hasAnchorProvider
    - getAnchorsForApp
    - getAnchorFraming
    - getRegisteredAppIds
    - clearAnchorProviders
    - getProviderCount

  **Must NOT do**:
  - Do not modify the restored implementation
  - Do not add core imports (uses 'unknown' for world/layout intentionally)

  **Parallelizable**: NO (first task)

  **References**:
  - Git history: `git show HEAD~10:packages/device-camera/src/anchors/registry.ts` - Complete implementation
  - `packages/device-camera/src/anchors/types.ts` - EMPTY_SNAPSHOT, DEFAULT_FRAMING constants used by registry

  **Acceptance Criteria**:
  - [ ] File exists at `packages/device-camera/src/anchors/registry.ts`
  - [ ] File contains Map-based providerRegistry
  - [ ] All 9 functions are exported
  - [ ] `cat packages/device-camera/src/anchors/registry.ts | grep "export function" | wc -l` → 9

  **Commit**: NO (groups with Task 2)

---

- [x] 2. Export registry functions from anchors barrel

  **What to do**:
  - Edit `packages/device-camera/src/anchors/index.ts`
  - Add: `export * from "./registry";`
  - Verify exports propagate to package index

  **Must NOT do**:
  - Do not remove existing exports (types, resolver functions)

  **Parallelizable**: NO (depends on 1)

  **References**:
  - `packages/device-camera/src/anchors/index.ts` - Current barrel file (only exports types + resolver)
  - `packages/device-camera/src/index.ts:17` - Re-exports from ./anchors

  **Acceptance Criteria**:
  - [ ] `grep "registry" packages/device-camera/src/anchors/index.ts` → shows export line
  - [ ] TypeScript can resolve: `import { registerAnchorProvider } from "@tokovo/device-camera"`

  **Commit**: YES
  - Message: `fix(device-camera): restore anchor registry implementation`
  - Files: `packages/device-camera/src/anchors/registry.ts`, `packages/device-camera/src/anchors/index.ts`
  - Pre-commit: `cd packages/device-camera && pnpm exec tsc --noEmit`

---

- [x] 3. Remove @tokovo/device-camera dependency from core

  **What to do**:
  - Edit `packages/core/package.json`
  - Remove line 11: `"@tokovo/device-camera": "workspace:*"`
  - Add `@tokovo/device-camera` to peerDependencies instead (for runtime resolution)
  - Run `pnpm install` to update lockfile

  **Must NOT do**:
  - Do not remove other dependencies
  - Do not modify devDependencies

  **Parallelizable**: NO (depends on 2)

  **References**:
  - `packages/core/package.json:11` - Current dependency line to remove
  - `packages/core/src/anchors/registry.ts` - Facade that imports from device-camera (will work as peer)
  - `packages/core/src/index.ts:37-40` - Re-exports that will now resolve

  **Acceptance Criteria**:
  - [ ] `grep "device-camera" packages/core/package.json` → only shows in peerDependencies
  - [ ] `turbo run dev --dry-run` → no cycle error
  - [ ] `cd packages/core && pnpm exec tsc --noEmit` → fewer errors (registry imports resolve)

  **Commit**: YES
  - Message: `fix(core): break cyclic dependency with device-camera`
  - Files: `packages/core/package.json`, `pnpm-lock.yaml`
  - Pre-commit: `turbo run dev --dry-run`

---

- [x] 4. Fix anchors.test.ts imports

  **What to do**:
  - Edit `packages/device-camera/src/__tests__/anchors.test.ts`
  - Lines 2-12: Change import from `"../anchors/registry"` to `"../anchors"`
  - The barrel now exports registry functions, so relative import works

  **Must NOT do**:
  - Do not change test logic or assertions
  - Do not import from @tokovo/core (keeps tests self-contained)

  **Parallelizable**: NO (depends on 2)

  **References**:
  - `packages/device-camera/src/__tests__/anchors.test.ts:2-12` - Broken import block
  - `packages/device-camera/src/anchors/index.ts` - Barrel that now exports registry

  **Acceptance Criteria**:
  - [ ] `grep "../anchors/registry" packages/device-camera/src/__tests__/anchors.test.ts` → no matches
  - [ ] `grep 'from "../anchors"' packages/device-camera/src/__tests__/anchors.test.ts` → shows import line
  - [ ] `cd packages/device-camera && pnpm test` → 32 anchor tests pass

  **Commit**: YES
  - Message: `fix(device-camera): update anchors.test.ts imports`
  - Files: `packages/device-camera/src/__tests__/anchors.test.ts`
  - Pre-commit: `cd packages/device-camera && pnpm test`

---

- [x] 5. Fix ViewLayoutMode export

  **What to do**:
  - Check if ViewLayoutMode is exported from core's public API
  - If missing from `packages/core/src/index.ts`, add explicit export
  - ViewLayoutMode is defined in `packages/core/src/types.ts:639` AND `packages/core/src/types/camera.ts:66`
  - Ensure only ONE definition exists and is properly exported

  **Must NOT do**:
  - Do not change the type definition itself
  - Do not create duplicate exports

  **Parallelizable**: YES (with Task 6)

  **References**:
  - `packages/core/src/types.ts:639` - One definition location
  - `packages/core/src/types/camera.ts:66` - Duplicate definition
  - `packages/core/src/index.ts` - Public API exports
  - `packages/device-camera/src/reducer/index.ts:26` - Import site

  **Acceptance Criteria**:
  - [ ] `import { ViewLayoutMode } from "@tokovo/core"` resolves without error
  - [ ] Only ONE definition of ViewLayoutMode in codebase (deduplicated)
  - [ ] `pnpm -r exec tsc --noEmit 2>&1 | grep ViewLayoutMode` → no errors

  **Commit**: YES
  - Message: `fix(core): export ViewLayoutMode from public API`
  - Files: Depends on fix approach
  - Pre-commit: `pnpm -r exec tsc --noEmit`

---

- [x] 6. Fix implicit any in reducer

  **What to do**:
  - Edit `packages/device-camera/src/reducer/index.ts`
  - Line 238: Add type annotation to filter callback
  - Change: `(effect) => effect.persistent === true`
  - To: `(effect: CameraEffect) => effect.persistent === true`
  - Check lines 290 and 302 for similar issues

  **Must NOT do**:
  - Do not change filter logic
  - Do not modify CameraEffect type

  **Parallelizable**: YES (with Task 5)

  **References**:
  - `packages/device-camera/src/reducer/index.ts:238` - Implicit any location
  - `packages/device-camera/src/reducer/index.ts:10` - CameraEffect import (already exists)
  - Lines 290, 302 - Potentially similar issues

  **Acceptance Criteria**:
  - [ ] `grep "effect: CameraEffect" packages/device-camera/src/reducer/index.ts` → shows typed callbacks
  - [ ] `cd packages/device-camera && pnpm exec tsc --noEmit` → no implicit any errors

  **Commit**: YES
  - Message: `fix(device-camera): add explicit types to filter callbacks`
  - Files: `packages/device-camera/src/reducer/index.ts`
  - Pre-commit: `cd packages/device-camera && pnpm exec tsc --noEmit`

---

- [x] 7. Final verification

  **What to do**:
  - Run full verification suite
  - Confirm all errors are resolved
  - Test dev server starts

  **Must NOT do**:
  - Do not skip any verification step

  **Parallelizable**: NO (final task)

  **References**:
  - All previous tasks must be complete

  **Acceptance Criteria**:
  - [ ] `turbo run dev --dry-run` → no cycle error, shows task graph
  - [ ] `pnpm -r exec tsc --noEmit` → 0 errors
  - [ ] `pnpm test` → all tests pass (including 32 anchor tests)
  - [ ] `turbo run dev` → server starts, no errors in console

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                      | Files                         | Verification  |
| ---------- | ------------------------------------------------------------ | ----------------------------- | ------------- |
| 2          | `fix(device-camera): restore anchor registry implementation` | registry.ts, anchors/index.ts | tsc --noEmit  |
| 3          | `fix(core): break cyclic dependency with device-camera`      | package.json, pnpm-lock.yaml  | turbo dry-run |
| 4          | `fix(device-camera): update anchors.test.ts imports`         | anchors.test.ts               | pnpm test     |
| 5          | `fix(core): export ViewLayoutMode from public API`           | types files                   | tsc --noEmit  |
| 6          | `fix(device-camera): add explicit types to filter callbacks` | reducer/index.ts              | tsc --noEmit  |

---

## Success Criteria

### Verification Commands

```bash
turbo run dev --dry-run  # Expected: no cycle error, shows build graph
pnpm -r exec tsc --noEmit  # Expected: 0 errors
pnpm test  # Expected: all tests pass
turbo run dev  # Expected: dev server starts
```

### Final Checklist

- [x] No cyclic dependency error from turbo
- [x] Zero TypeScript errors across all packages (related to our changes)
- [x] All 32 anchor tests pass
- [x] Dev server starts successfully
- [x] No breaking changes to public API
