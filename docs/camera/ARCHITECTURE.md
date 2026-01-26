# Camera System Architecture

## Overview

The Tokovo camera system is an **enterprise-grade cinematic camera engine** designed for deterministic, frame-based video generation. It transforms declarative camera DSL into smooth, professional camera movements using a **4-stage pipeline architecture**.

This document describes the complete data flow from user-facing DSL through internal processing layers to final CSS rendering.

---

## Design Principles

1. **Deterministic** — Same input at frame `t` always produces identical output
2. **Frame-based** — Compatible with Remotion's SSR and frame-by-frame rendering
3. **Declarative** — Users describe _what_ the camera should do, not _how_
4. **Composable** — Effects can overlap, blend, and transition smoothly
5. **Anchor-driven** — Camera follows semantic UI elements (e.g., "lastMessage", "inputArea")

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Camera Pipeline                          │
└──────────────────────────────────────────────────────────────────┘

  User Episode Definition
         │
         │  DSL Layer
         ▼
  ┌─────────────────┐
  │ CameraTrackEvent│  (focus, shake, reset, etc.)
  └────────┬────────┘
           │
           │  Reducer Layer
           ▼
  ┌─────────────────────┐
  │ ScheduledCameraEffect│  (normalized, timestamped)
  └────────┬────────────┘
           │
           │  CameraBrain Layer
           ▼
  ┌──────────────────┐
  │ CameraTransform  │  (scale, originX/Y, rotation, shake)
  └────────┬─────────┘
           │
           │  Render Layer
           ▼
  ┌─────────────────┐
  │   CSS String    │  (applied to device wrapper)
  └─────────────────┘
```

---

## Stage 1: DSL Layer

**Purpose:** Provide an intuitive, declarative API for defining camera movements in episodes.

**Location:** `packages/dsl/src/core/tracks/camera.ts`

### Key Classes

#### `CameraTrackBuilder`

Entry point for camera track definitions.

```typescript
class CameraTrackBuilder {
  at(time: string | number): CameraPointBuilder;
}
```

**Usage:**

```typescript
.camera(cam => {
  cam.at("1s").focus("lastMessage", { targetFill: 0.8 });
  cam.at("3s").shake({ intensity: 5, duration: 20 });
  cam.at("5s").reset({ blendStyle: "gentle" });
})
```

#### `CameraPointBuilder`

Provides chainable methods for camera operations at a specific time point.

**Methods:**

- `focus(anchorId, options)` — Focus camera on UI anchor
- `shake(options)` — Add camera shake effect
- `reset(options)` — Return to default view
- `cut()` — Instant transition (no blend)
- `dutchTilt(angle, options)` — Z-axis rotation
- `flash(options)` — Flash overlay effect
- `pan(x, y, options)` — Manual x/y offset

### Output: CameraTrackEvent

Each DSL method generates a `CameraTrackEvent`:

```typescript
interface CameraTrackEvent {
  at: number; // Frame number
  kind: "CAMERA";
  type:
    | "ANCHOR_FOCUS"
    | "SHAKE"
    | "RESET"
    | "CUT"
    | "DUTCH_TILT"
    | "FLASH"
    | "PAN";
  payload: Record<string, unknown>;
  _declarationOrder: number;
}
```

**Example:**

```typescript
{
  at: 30,
  kind: "CAMERA",
  type: "ANCHOR_FOCUS",
  payload: {
    anchorId: "lastMessage",
    scale: 0.8,
    easing: "easeInOut"
  },
  _declarationOrder: 0
}
```

---

## Stage 2: Reducer Layer

**Purpose:** Normalize DSL events into scheduled effects with consistent structure.

**Location:** `packages/device-camera/src/reducer/index.ts`

### Key Function: `cameraReducer`

```typescript
function cameraReducer(
  draft: { camera?: CameraBrainState },
  event: CameraEvent,
): void;
```

**Responsibilities:**

1. Convert 13 legacy event types → 6 modern effect types
2. Normalize payload structures
3. Add effects to `draft.camera.scheduledEffects[]`
4. Generate unique effect IDs

### Event Mapping

The reducer consolidates multiple DSL concepts into 6 core effect types:

| Legacy Types                                          | Unified Type   | Purpose                   |
| ----------------------------------------------------- | -------------- | ------------------------- |
| focus, pan, track, zoom, punch-zoom, ken-burns, dolly | **focus**      | Camera framing on anchors |
| shake, tremor                                         | **shake**      | Camera shake effects      |
| reset                                                 | **reset**      | Return to default state   |
| cut, slam                                             | **cut**        | Instant transitions       |
| tilt                                                  | **dutch-tilt** | Z-axis rotation           |
| flash, whip-pan                                       | **flash**      | Overlay effects           |

### Output: ScheduledCameraEffect

```typescript
interface ScheduledCameraEffect {
  id: string;                    // "focus_30_abc123"
  type: "focus" | "shake" | ...;
  startFrame: number;
  endFrame: number;
  priority: number;              // For effect precedence
  payload: CameraEffectPayload;  // Type-specific payload
}
```

**Example:**

```typescript
{
  id: "focus_30_hs9k2d",
  type: "focus",
  startFrame: 30,
  endFrame: 60,
  priority: 0,
  payload: {
    anchor: "lastMessage",
    framing: {
      targetFill: 0.8,
      anchorPoint: { x: 0.5, y: 0.5 },
      padding: undefined
    },
    autoReset: true,
    blendStyle: "gentle"
  }
}
```

---

## Stage 3: CameraBrain Layer

**Purpose:** Compute the exact camera transform for the current frame by processing active effects.

**Location:** `packages/device-camera/src/brain/CameraBrain.ts`

### Key Function: `processFrame`

```typescript
function processFrame(
  frame: number,
  state: CameraBrainState,
  snapshot: AnchorSnapshot,
  viewport: Viewport,
): ProcessFrameResult;
```

**Inputs:**

- `frame` — Current frame number
- `state` — Camera brain state (contains scheduledEffects)
- `snapshot` — Current UI anchor positions from layout engine
- `viewport` — Device screen dimensions

**Output:**

```typescript
interface ProcessFrameResult {
  transform: CameraTransform;
  mode: "idle" | "live" | "blending";
  activeCamera: VirtualCameraSnapshot | null;
  blend: CameraBlend | null;
}
```

### Processing Algorithm

1. **Filter active effects** — Find all effects where `startFrame <= frame <= endFrame`

2. **Select winning camera** (for focus effects):
   - Highest priority wins
   - If tied, earliest startFrame wins

3. **Compute target transform**:
   - Call `computeAnchorTransform(anchor, snapshot, viewport, framing)`
   - Calculate scale, originX/Y based on anchor geometry

4. **Handle blending**:
   - If effect just started (within blend duration), create smooth transition
   - Interpolate from previous transform to target transform
   - Use easing functions from `blendStyle`

5. **Sticky camera** (autoReset: false):
   - If no active effect, check for completed effects with autoReset: false
   - Maintain last transform until reset/cut boundary

### Transform Computation

```typescript
interface CameraTransform {
  scale: number; // Zoom level
  originX: number; // Transform origin (0-1, relative)
  originY: number; // Transform origin (0-1, relative)
  translateX: number; // Manual X offset (px)
  translateY: number; // Manual Y offset (px)
  rotation: number; // Z-axis rotation (degrees)
  shakeX: number; // Shake offset X (px)
  shakeY: number; // Shake offset Y (px)
}
```

**Anchor Transform Logic:**

Given an anchor rectangle (x, y, width, height) and targetFill:

1. Determine scale to fit anchor to `targetFill` percentage of viewport:

   ```typescript
   if (anchorAspect > viewportAspect) {
     scale = (viewport.width * targetFill) / anchor.width;
   } else {
     scale = (viewport.height * targetFill) / anchor.height;
   }
   ```

2. Compute transform origin to center anchor in viewport:

   ```typescript
   originX = (anchor.x + anchor.width * anchorPoint.x) / viewport.width;
   originY = (anchor.y + anchor.height * anchorPoint.y) / viewport.height;
   ```

3. Return complete transform with scale + origin

---

## Stage 4: Render Layer

**Purpose:** Convert CameraTransform into CSS string and apply to device wrapper.

**Location:** `packages/renderer/src/engines/useCameraEngine.ts`

### Key Hook: `useCameraEngine`

```typescript
function useCameraEngine(input: CameraEngineInput): CameraEngineOutput;
```

**Flow:**

1. Extract viewport from device profile
2. Get anchor snapshot from layout engine
3. Extract camera state from world
4. Call `processFrame()` from CameraBrain
5. Build CSS from resulting transform

### CSS Generation

```typescript
function buildCameraCSS(
  transform: CameraTransform,
  viewport: { width: number; height: number },
): CSSProperties;
```

**Output:**

```typescript
{
  width: viewport.width,
  height: viewport.height,
  transformOrigin: `${originX * 100}% ${originY * 100}%`,
  transform: `
    translate(${translateX + shakeX}px, ${translateY + shakeY}px)
    scale(${scale})
    rotate(${rotation}deg)
  `,
  transition: "none"  // CRITICAL: No CSS transitions for Remotion
}
```

**Application:**
The CSS is applied to the camera wrapper div that contains the device frame:

```jsx
<div style={cameraStyle}>
  <div style={deviceStyle}>
    <DeviceFrame {...} />
  </div>
</div>
```

---

## Data Flow Example

### Complete Flow: Focus on "lastMessage"

**1. DSL (Episode Definition)**

```typescript
cam.at("2s").focus("lastMessage", { targetFill: 0.7 });
```

**2. DSL Output (CameraTrackEvent)**

```typescript
{
  at: 60,  // 2s * 30fps
  kind: "CAMERA",
  type: "ANCHOR_FOCUS",
  payload: {
    anchorId: "lastMessage",
    scale: 0.7,
    easing: "easeInOut"
  }
}
```

**3. Reducer Output (ScheduledCameraEffect)**

```typescript
{
  id: "focus_60_xyz",
  type: "focus",
  startFrame: 60,
  endFrame: 90,  // 60 + default duration 30
  priority: 0,
  payload: {
    anchor: "lastMessage",
    framing: { targetFill: 0.7 },
    autoReset: true,
    blendStyle: "gentle"
  }
}
```

**4. CameraBrain Output (at frame 70)**

Inputs:

- `frame: 70`
- `anchor: "lastMessage"` → `{ x: 100, y: 500, width: 300, height: 80 }`
- `viewport: { width: 400, height: 800 }`

Computation:

```typescript
// Determine scale
anchorAspect = 300/80 = 3.75
viewportAspect = 400/800 = 0.5
// Use height-based scaling
scale = (800 * 0.7) / 80 = 7.0

// Compute origin
anchorCenterX = 100 + 300 * 0.5 = 250
anchorCenterY = 500 + 80 * 0.5 = 540
originX = 250 / 400 = 0.625
originY = 540 / 800 = 0.675
```

Output:

```typescript
{
  transform: {
    scale: 7.0,
    originX: 0.625,
    originY: 0.675,
    translateX: 0,
    translateY: 0,
    rotation: 0,
    shakeX: 0,
    shakeY: 0
  },
  mode: "blending",  // Still within blend duration
  ...
}
```

**5. Render Output (CSS)**

```css
{
  width: 400px;
  height: 800px;
  transform-origin: 62.5% 67.5%;
  transform: translate(0px, 0px) scale(7.0) rotate(0deg);
  transition: none;
}
```

**Visual Result:** Camera zooms smoothly to center the last message bubble, filling 70% of the viewport.

---

## Key Files and Functions

### DSL Layer

| File                                     | Key Exports                                  | Purpose                                |
| ---------------------------------------- | -------------------------------------------- | -------------------------------------- |
| `packages/dsl/src/core/tracks/camera.ts` | `CameraTrackBuilder`<br>`CameraPointBuilder` | User-facing API for camera definitions |

### Reducer Layer

| File                                          | Key Exports     | Purpose                                   |
| --------------------------------------------- | --------------- | ----------------------------------------- |
| `packages/device-camera/src/reducer/index.ts` | `cameraReducer` | Event normalization and effect scheduling |

### CameraBrain Layer

| File                                              | Key Exports                                                            | Purpose                     |
| ------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| `packages/device-camera/src/brain/CameraBrain.ts` | `processFrame`<br>`computeAnchorTransform`<br>`computeStickyTransform` | Transform computation logic |
| `packages/device-camera/src/types/brain.ts`       | `CameraBrainState`<br>`CameraTransform`<br>`ScheduledCameraEffect`     | Core type definitions       |
| `packages/device-camera/src/types/effects-v2.ts`  | `FocusPayload`<br>`ShakePayload`<br>`CameraEffectPayload`              | Effect payload types        |

### Render Layer

| File                                               | Key Exports                           | Purpose                              |
| -------------------------------------------------- | ------------------------------------- | ------------------------------------ |
| `packages/renderer/src/engines/useCameraEngine.ts` | `useCameraEngine`<br>`buildCameraCSS` | CSS generation and React integration |

---

## Advanced Features

### Blending System

Camera transitions use a **blend system** to create smooth movements between effects:

- **Blend Duration:** 15 frames (configurable)
- **Blend Detection:** Automatic when new effect starts
- **Interpolation:** Cubic easing (`1 - (1-t)³`) for smooth acceleration
- **Spring Presets:** "gentle" | "snappy" | "stiff" | "none"

### Sticky Camera (autoReset: false)

Effects with `autoReset: false` persist after completion:

```typescript
cam.at("3s").focus("inputArea", {
  targetFill: 0.9,
  autoReset: false,
});
// Camera stays locked on inputArea until reset/cut
```

**Boundary Detection:**
Sticky camera ends when:

- Explicit `reset()` event
- Explicit `cut()` event
- New focus effect starts

### Priority System

When multiple focus effects overlap:

1. Higher `priority` wins
2. If priority is tied, earlier `startFrame` wins

```typescript
// Priority 0 (default)
cam.at("1s").focus("lastMessage");

// Priority 10 (overrides default)
cam.at("1s").focus("inputArea", { priority: 10 });
```

### Anchor System

Anchors are semantic UI element identifiers registered by the layout engine:

**Built-in Anchors:**

- `viewport` — Full device viewport (default)
- `lastMessage` — Most recent message bubble
- `inputArea` — Message input field
- `typingIndicator` — Typing animation area
- `messageGroup_[id]` — Specific message group

Custom anchors can be registered by app-specific layout engines.

---

## Remotion Compatibility

The camera system is designed for **deterministic, frame-based rendering**:

### ✅ Compatible Patterns

- All state derived from `(frame, world, config)`
- Pure functions with no side effects
- Inline styles (no CSS transitions)
- Deterministic math (no `Math.random()`)

### ❌ Incompatible Patterns

- DOM measurements (`getBoundingClientRect`)
- CSS transitions/animations
- `setTimeout`/`requestAnimationFrame`
- Non-deterministic randomness

### Integration with Remotion

```typescript
export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const world = replay(initialWorld, events, frame);

  const cameraOutput = useCameraEngine({
    world,
    t: frame,
    layoutOutput
  });

  return (
    <div style={cameraOutput.cameraStyle}>
      <DeviceFrame {...} />
    </div>
  );
};
```

---

## Performance Considerations

### Frame Budget

Each frame must compute:

1. Active effects (O(n) filter)
2. Winning camera (O(k) where k = active effects, typically 1-3)
3. Anchor transform (O(1) math)
4. CSS string building (O(1))

**Typical Performance:** < 1ms per frame

### Optimization Strategies

1. **Effect Pruning:** Remove effects with `endFrame < currentFrame - blendDuration`
2. **Anchor Memoization:** Layout engine caches anchor positions
3. **Transform Caching:** useMemo() prevents unnecessary recalculations

---

## Future Enhancements

### Planned Features

- Multi-device camera layouts (PIP, split-screen)
- 3D camera transforms (perspective, 3D rotation)
- Motion blur effects
- Camera path previsualization tools
- GPU-accelerated shake computation

### API Stability

- **DSL Layer:** Stable (v1.0)
- **Effect Payloads:** Stable (v2.0)
- **CameraTransform:** Stable
- **Internal Brain Logic:** May evolve with new features

---

## Troubleshooting

### Camera Not Moving

**Symptoms:** Camera stays at default transform

**Possible Causes:**

1. No active effects at current frame
2. Anchor not found in snapshot
3. AutoReset: false with earlier focus still active

**Debug:**

```typescript
console.log(
  "Active effects:",
  state.scheduledEffects.filter(
    (e) => e.startFrame <= frame && frame <= e.endFrame,
  ),
);
console.log("Anchors:", snapshot.anchors);
```

### Jerky Camera Motion

**Symptoms:** Camera jumps instead of smooth movement

**Possible Causes:**

1. `cut()` instead of focus transition
2. Blend duration too short
3. Multiple overlapping effects with different priorities

**Solutions:**

- Use `blendStyle: "gentle"` for smooth transitions
- Increase blend duration constant
- Review effect timeline for conflicts

### Transform Not Applied

**Symptoms:** CSS computed but visual unchanged

**Possible Causes:**

1. CSS string format error
2. Transform origin incorrect
3. Parent container constraining transform

**Debug:**

```typescript
console.log("Camera CSS:", cameraStyle);
// Check transform origin is 0-1 range converted to percentage
// Verify no conflicting parent transforms
```

---

## Conclusion

The Tokovo camera system provides a **production-ready, deterministic camera engine** for phone-based cinematic storytelling. Its 4-stage pipeline architecture ensures:

- **Intuitive authoring** via declarative DSL
- **Reliable execution** via pure, frame-based computation
- **Smooth motion** via intelligent blending and anchor tracking
- **Remotion compatibility** via deterministic rendering

The system is designed to scale from simple message focus to complex multi-device cinematic sequences while maintaining frame-perfect determinism.
