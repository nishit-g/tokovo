# Camera Anchor Resolution Fix

## Context

### Problem Statement

Camera effects are NOT working at runtime despite all TypeScript errors being fixed. The camera silently fails and returns the default transform (no zoom, no movement).

### Root Cause Analysis

**Data Flow (Current - BROKEN)**:

```
Episode: focus("device")
      ↓
CameraBrain.computeAnchorTransform():
  const anchorRect = snapshot.anchors["device"];  // ← UNDEFINED!
  if (!anchorRect) return DEFAULT_CAMERA_TRANSFORM;  // ← SILENT FAILURE!
      ↓
Camera does NOTHING (returns default transform)
```

**The Bug**: `CameraBrain.computeAnchorTransform()` (line 171-172) does a **direct lookup** in `snapshot.anchors`. When the anchor doesn't exist, it silently returns `DEFAULT_CAMERA_TRANSFORM` instead of using fallback logic.

**Why "device" Anchor is Missing**:

- `WhatsAppAnchors.getAnchors()` only returns anchors from `chatLayout.semantic.regions`
- It has framing config for "device" (line 34-38) but never adds "device" to the anchors object
- When `focus("device")` is called, `snapshot.anchors["device"]` is undefined

**The Fix Exists But Isn't Used**:

- `resolveAnchorWithFallback()` in `packages/device-camera/src/anchors/resolver.ts` has proper fallback chains
- It maps "device" → viewport rect automatically
- BUT CameraBrain doesn't call this function!

### Why V1 Worked

V1 likely used a different code path that:

1. Had "device" hardcoded as viewport rect, OR
2. Used the resolver with fallback logic, OR
3. Used different anchor names that existed in regions

---

## Work Objectives

### Core Objective

Make camera focus effects work by using the anchor resolver with fallback logic instead of direct lookup.

### Concrete Deliverables

1. `CameraBrain.computeAnchorTransform()` uses `resolveAnchorWithFallback()`
2. Camera effects work for "device", "lastMessage", and all message anchors
3. Fallback to viewport when anchor not found (instead of silent failure)

### Definition of Done

- [ ] Camera zooms to anchor when focus() is called
- [ ] focus("device") zooms to full viewport
- [ ] focus("lastMessage") zooms to last message
- [ ] No silent failures - fallback to viewport
- [ ] All existing tests pass
- [ ] Visual verification in browser

### Must Have

- Use existing `resolveAnchorWithFallback()` function (don't reinvent)
- Pass viewport to resolver so it can fallback correctly
- Maintain backward compatibility with existing episodes

### Must NOT Have

- Breaking changes to camera API
- New anchor names
- Modifications to episode files

---

## TODOs

- [ ] 1. Update CameraBrain.computeAnchorTransform to use resolver

  **What to do**:
  - Import `resolveAnchorWithFallback` from `../anchors/resolver`
  - Modify `computeAnchorTransform()` to use resolver instead of direct lookup:

  **BEFORE** (line 171-172):

  ```typescript
  const anchorRect = snapshot.anchors[anchor];
  if (!anchorRect) return DEFAULT_CAMERA_TRANSFORM;
  ```

  **AFTER**:

  ```typescript
  const anchorRect = resolveAnchorWithFallback(
    anchor,
    snapshot.anchors,
    viewport,
  );
  // resolveAnchorWithFallback already handles fallback to viewport
  // It returns undefined only if NO fallback exists (very rare)
  if (!anchorRect) {
    console.warn(
      `[CameraBrain] Anchor "${anchor}" not found, using default transform`,
    );
    return DEFAULT_CAMERA_TRANSFORM;
  }
  ```

  **Must NOT do**:
  - Change the function signature
  - Modify other functions in CameraBrain.ts
  - Remove existing code paths

  **Parallelizable**: NO (foundation fix)

  **References**:
  - `packages/device-camera/src/brain/CameraBrain.ts:171-172` - The broken lookup
  - `packages/device-camera/src/brain/CameraBrain.ts:165-195` - Full computeAnchorTransform function
  - `packages/device-camera/src/anchors/resolver.ts:1-50` - resolveAnchorWithFallback function
  - `packages/device-camera/src/anchors/resolver.ts:18-35` - Fallback chain definitions

  **Acceptance Criteria**:
  - [ ] Import added for resolveAnchorWithFallback
  - [ ] computeAnchorTransform uses resolver
  - [ ] Warning logged when using fallback (for debugging)
  - [ ] `pnpm turbo run test --filter=@tokovo/device-camera` passes

  **Commit**: YES
  - Message: `fix(device-camera): use anchor resolver with fallback in CameraBrain`
  - Files: `packages/device-camera/src/brain/CameraBrain.ts`

---

- [ ] 2. Update processFrame to pass viewport to computeAnchorTransform

  **What to do**:
  - Check if `computeAnchorTransform` already receives `viewport` parameter
  - If not, add viewport parameter and pass it through
  - The resolver needs viewport to create the device/viewport fallback rect

  **References**:
  - `packages/device-camera/src/brain/CameraBrain.ts:70-77` - processFrame calls computeAnchorTransform
  - `packages/device-camera/src/brain/CameraBrain.ts:165` - computeAnchorTransform signature

  **Acceptance Criteria**:
  - [ ] viewport passed to computeAnchorTransform
  - [ ] Resolver receives correct viewport dimensions
  - [ ] Tests pass

  **Parallelizable**: NO (depends on 1)

  **Commit**: Merge with Task 1

---

- [ ] 3. Add test for anchor fallback

  **What to do**:
  - Add test case for focus("device") → uses viewport
  - Add test case for focus("unknownAnchor") → falls back to viewport
  - Add test case for focus("lastMessage") with valid anchor → uses anchor

  **References**:
  - `packages/device-camera/src/__tests__/` - Existing test files
  - `packages/device-camera/src/brain/__tests__/` - Brain-specific tests

  **Acceptance Criteria**:
  - [ ] Test: focus("device") returns non-default transform
  - [ ] Test: Unknown anchor falls back to viewport (not default transform)
  - [ ] All 92+ existing tests pass

  **Parallelizable**: NO (depends on 1-2)

  **Commit**: YES
  - Message: `test(device-camera): add tests for anchor fallback logic`
  - Files: test file

---

- [ ] 4. Visual verification in browser

  **What to do**:
  - Start studio dev server
  - Navigate to camera-showcase or feature-showcase episode
  - Verify camera effects work:
    - focus("device") zooms out to full viewport
    - focus("lastMessage") zooms to last message
    - shake() produces visible shake
    - reset() returns to default

  **NOTE**: If Remotion version mismatch still blocks, document and mark as "requires user fix"

  **Acceptance Criteria**:
  - [ ] Camera visibly moves/zooms when focus is called
  - [ ] Or documented blocker if env issue remains

  **Parallelizable**: NO (final verification)

  **Commit**: NO

---

## Technical Details

### resolveAnchorWithFallback API

```typescript
function resolveAnchorWithFallback(
  anchorId: string,
  anchors: Record<string, Rect>,
  viewport: { width: number; height: number },
): Rect | undefined;
```

**Fallback Chains** (from resolver.ts):

- `"device"` → `"viewport"` → viewport rect
- `"screen"` → `"viewport"` → viewport rect
- `"lastMessage"` → last message ID → any message
- `"firstMessage"` → first message ID → any message
- Default → viewport rect (via special "viewport" key)

### Viewport Rect Creation

When "device" or "viewport" is requested, resolver returns:

```typescript
{ x: 0, y: 0, width: viewport.width, height: viewport.height }
```

---

## Success Criteria

### Verification Commands

```bash
pnpm turbo run test --filter=@tokovo/device-camera  # All tests pass
pnpm turbo run build  # No errors
```

### Manual Verification

1. Camera zooms to anchor when focus() called
2. focus("device") shows full viewport (zoom out)
3. focus("lastMessage") zooms to last message area
4. shake() produces visible camera shake
5. reset() returns camera to neutral position

---

## Why This Fix Works

**Before**: Direct lookup → undefined → silent failure
**After**: Resolver with fallback → viewport rect → camera moves

The resolver already has the fallback logic implemented. We just need to USE IT instead of doing a direct lookup in CameraBrain.
