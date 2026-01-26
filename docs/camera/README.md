# Camera System Documentation

> **STATUS**: ✅ WORKING (as of 2026-01-25 after major bug fixes)

The Tokovo camera system provides cinematic, anchor-driven camera control for phone simulation videos. Think of it as a virtual cinematographer that can follow UI elements, create dramatic emphasis, and maintain professional framing.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Current Status](#current-status)
- [Core Concepts](#core-concepts)
- [Architecture Summary](#architecture-summary)
- [Further Reading](#further-reading)

---

## Overview

The camera system enables **semantic, anchor-driven cinematography** for Tokovo episodes:

- **Anchor-Based Focusing**: Target UI elements by name (e.g., `"lastMessage"`, `"inputArea"`) instead of pixel coordinates
- **Automatic Framing**: Intelligent composition using configurable framing presets
- **Smooth Transitions**: Blend between camera positions with spring physics
- **Effect Library**: Focus, track, shake, pan, reset, and more
- **Deterministic Rendering**: Same input → same video (Remotion-compatible)

The system operates in **logical pixel space** (design coordinates), making it resolution-independent and predictable.

---

## Quick Start

### Basic Usage (V2 DSL)

```typescript
import { episode } from "@tokovo/dsl";

export const myEpisode = episode("demo", (ep) => {
  ep.device("phone", "iphone16", (d) => {
    d.app("app_whatsapp");
    d.conversation("chat", { name: "Friend" });

    d.beat("message-focus", (b) => {
      b.receive("Friend", "Check this out!");

      // Camera focuses on the message that just appeared
      b.camera((cam) => {
        cam.at("0s").focus("lastMessage", {
          targetFill: 1.15, // 115% of viewport
          duration: 30, // frames
        });
      });

      b.wait("2s");
    });
  });
});
```

### Available Camera Methods

```typescript
// Focus on an anchor (zoom + position)
.focus(anchorId, { targetFill, duration })

// Track an anchor continuously
.track(anchorId, { duration })

// Apply screen shake
.shake({ intensity, duration })

// Pan camera (directional movement)
.pan({ deltaX, deltaY, duration })

// Reset to neutral view
.reset({ duration })

// Hold current position
.hold({ duration })
```

---

## Current Status

| Feature               | Status          | Notes                                                                        |
| --------------------- | --------------- | ---------------------------------------------------------------------------- |
| **Core Effects**      |                 |                                                                              |
| `set()`               | ✅ Working      | Direct transform assignment                                                  |
| `focus()`             | ✅ Working      | Fixed coordinate space bug (2026-01-25)                                      |
| `track()`             | ✅ Working      | Continuous anchor following                                                  |
| `pan()`               | ✅ Working      | Directional camera movement                                                  |
| `shake()`             | ✅ Working      | Procedural screen shake                                                      |
| `reset()`             | ✅ Working      | Return to neutral                                                            |
| `hold()`              | ✅ Working      | Maintain current transform                                                   |
| **Anchor System**     |                 |                                                                              |
| Semantic anchors      | ✅ Working      | `lastMessage`, `inputArea`, `viewport`                                       |
| Framing configuration | ✅ Working      | Per-anchor targetFill, anchorPoint, padding                                  |
| Fallback chains       | ✅ Working      | Graceful degradation when anchor missing                                     |
| Dynamic registration  | ✅ Working      | Apps register anchors at runtime                                             |
| **Integration**       |                 |                                                                              |
| V2 DSL support        | ✅ Working      | Event type normalization fixed                                               |
| Payload normalization | ✅ Working      | Handles both `anchor` and `anchorId` keys                                    |
| Remotion rendering    | ✅ Working      | Frame-accurate, deterministic                                                |
| **Known Issues**      |                 |                                                                              |
| Device profiles       | ⚠️ Needs Update | `profile.screen` must use logical pixels (393x852), not physical (1290x2796) |

### Recent Bug Fixes (2026-01-25)

**Fixed Issues:**

1. ✅ **Coordinate Space Mismatch** - Viewport now uses logical pixels matching anchor coordinates
2. ✅ **Event Type Mismatch** - Added `anchor-focus`, `anchor-track`, `hold` handlers to reducer
3. ✅ **Payload Key Mismatch** - Normalized payload to handle both `anchorId` (V2) and `anchor` (V1)
4. ✅ **Anchor Naming** - Aligned framing key `"inputArea"` with layout registration
5. ✅ **Legacy API Usage** - Migrated `.zoom()` to `.focus("viewport", ...)` in showcase episodes

**Impact:** All V2 DSL camera effects now work correctly. Episodes compile and render without errors.

---

## Core Concepts

### 1. Anchors (Semantic Targets)

Anchors are **named UI regions** that the camera can focus on:

```typescript
// Common anchors registered by WhatsApp app:
"viewport"; // Full device screen
"lastMessage"; // Most recent message bubble
"inputArea"; // Text input field at bottom
"typingIndicator"; // "..." typing animation
```

Apps register anchors dynamically based on current UI state. The layout engine computes anchor positions in **logical pixel coordinates**.

### 2. Framing Configuration

Each anchor has framing metadata that controls how it's composed:

```typescript
const ANCHOR_FRAMING = {
  lastMessage: {
    targetFill: 1.15, // Fill 115% of viewport width
    anchorPoint: { x: 0.5, y: 0.5 }, // Center of anchor
    paddingPx: { top: 40 }, // Visual breathing room
  },
  inputArea: {
    targetFill: 0.9, // Tighter framing
    anchorPoint: { x: 0.5, y: 0.88 }, // Anchor near bottom
  },
};
```

**targetFill** determines zoom level:

- `0.6` = loose framing (60% of viewport)
- `1.0` = fills viewport exactly
- `1.15` = zoomed in (fills 115% of viewport)

### 3. Transform Model

Camera state is represented as a pure transform:

```typescript
interface CameraTransform {
  scale: number; // Zoom level (1.0 = neutral)
  originX: number; // Transform origin X (0-1)
  originY: number; // Transform origin Y (0-1)
  translateX: number; // Pan offset X (px)
  translateY: number; // Pan offset Y (px)
  rotation: number; // Dutch tilt angle (degrees)
  shakeX: number; // Shake offset X (px)
  shakeY: number; // Shake offset Y (px)
}
```

This transform is applied to the device frame in the renderer.

### 4. Effect Scheduling

Camera effects are scheduled as timeline events:

```typescript
interface ScheduledCameraEffect {
  id: string;
  type: "focus" | "track" | "shake" | "pan" | "reset" | "hold";
  startFrame: number;
  endFrame: number;
  priority: number;
  payload: FocusPayload | TrackPayload | ShakePayload | ...;
}
```

The `CameraBrain` processes all active effects at each frame and computes the final transform.

### 5. Blending & Transitions

When transitioning between camera states, the system automatically blends transforms:

```typescript
// Blend duration: 15 frames (~0.5s at 30fps)
const blendedTransform = interpolate(
  fromTransform, // Previous camera state
  toTransform, // New target state
  progress, // 0-1 based on frame position
);
```

Uses easeOut cubic interpolation for smooth, cinematic motion.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Episode DSL                          │
│   .camera(cam => cam.at("1s").focus("lastMessage"))    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Camera V2 Lowering                         │
│  DSL → TimelineEvent[] (ANCHOR_FOCUS, HOLD, etc.)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Camera Reducer                            │
│  Events → ScheduledCameraEffect[] (normalized types)    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                CameraBrain                              │
│  • Selects active effects (priority + timing)           │
│  • Resolves anchors from layout snapshot                │
│  • Computes target transforms                           │
│  • Blends between states (15-frame transitions)         │
│  • Returns final CameraTransform                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Remotion Renderer                            │
│  Apply transform to device frame (CSS transforms)       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **DSL → Lowering**: High-level camera calls converted to timeline events
2. **Events → Reducer**: Events normalized and stored as scheduled effects
3. **Frame Processing**: At each frame, CameraBrain:
   - Filters active effects
   - Selects winner (highest priority + earliest start)
   - Computes target transform from anchor + framing
   - Blends if transitioning
4. **Rendering**: Transform applied as CSS to device frame

### Key Files

| File                                               | Purpose                      |
| -------------------------------------------------- | ---------------------------- |
| `packages/device-camera/src/brain/CameraBrain.ts`  | Core frame processing logic  |
| `packages/device-camera/src/reducer/index.ts`      | Event → Effect scheduling    |
| `packages/device-camera/src/types/index.ts`        | Type definitions             |
| `packages/device-camera/src/anchors/`              | Anchor registry & resolution |
| `packages/renderer/src/engines/useCameraEngine.ts` | Remotion integration         |

---

## Further Reading

- **[API.md](./API.md)** - Complete API reference for all camera methods, parameters, and effect types
- **[ANCHORS.md](./ANCHORS.md)** - Guide to semantic anchors, framing configuration, and creating custom anchors

### Planned Documentation

- **ARCHITECTURE.md** - Deep dive into camera system design, CameraBrain algorithm, and coordinate spaces (coming soon)
- **KNOWN_ISSUES.md** - Current limitations, gotchas, and planned improvements (coming soon)

---

## Examples

See working episodes in `packages/dsl/examples/`:

- **`semantic-camera-showcase.dsl.ts`** - Demonstrates anchor-driven camera following messages
- **`manual-camera-showcase.dsl.ts`** - Manual camera control examples

---

## Contributing

When modifying the camera system:

1. **Run tests**: `pnpm test --filter=@tokovo/device-camera`
2. **Test with showcase episodes**: Verify changes don't break existing behavior
3. **Update docs**: Keep ARCHITECTURE.md and API.md in sync with code changes
4. **Check coordinate spaces**: Always verify logical vs physical pixel usage

---

**Last Updated**: 2026-01-25  
**Status**: Production-ready after bug fixes
