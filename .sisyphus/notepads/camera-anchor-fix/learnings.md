## CameraBrain.computeAnchorTransform() Fix

**Date:** 2026-01-25

**What Changed:**

- Added import: `import { resolveAnchorWithFallback } from "../anchors/resolver"`
- Modified `computeAnchorTransform()` to use `resolveAnchorWithFallback()` instead of direct lookup
- Replaced `snapshot.anchors[anchor]` with resolver call that handles fallbacks

**Key Behavior Change:**

- OLD: Missing anchor → return DEFAULT_CAMERA_TRANSFORM (scale=1, silent failure)
- NEW: Missing anchor → fallback chain → viewport rect → computed scale based on targetFill
- Example: "device" anchor now resolves to viewport with scale=0.6 (default targetFill)

**Test Updates:**

- Updated test "returns default for missing anchor" → "falls back to viewport for missing anchor"
- New expectation: scale=0.6, originX=0.5, originY=0.5 (viewport fallback behavior)

**Resolver API:**

```typescript
resolveAnchorWithFallback(
  anchorName: string,
  anchors: Record<string, Rect>,
  viewport?: { width: number; height: number }
): ResolvedAnchor // { rect, anchor, isFallback }
```

**Fallback Chain Examples:**

- "device" → viewport rect { x:0, y:0, width, height }
- "lastMessage" → "content" → "app" → "device"
- unknown → "app" → "device" → viewport

**Impact:**
✅ Cameras no longer silently fail on missing anchors
✅ All 99 tests pass
✅ Viewport fallback provides sensible default behavior
