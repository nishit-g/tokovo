# @tokovo/device-camera

Enterprise-grade cinematic camera system for Tokovo video generation.

## Features

- **Plugin System** - Auto-choreography with zero duplication (RECOMMENDED)
- **Manual Camera Control** - Exact control for artistic moments
- **Semantic Anchors** - Focus on "lastMessage", "inputArea", etc.
- **Behavior Presets** - Calm, energetic, dramatic styles
- **Effect Processors** - Extensible registry for camera effects
- **Remotion Compatible** - Frame-based, deterministic animation

---

## Installation

```bash
pnpm add @tokovo/device-camera @tokovo/compiler
```

---

## Quick Start (Plugin - Recommended)

**Zero duplication. Automatic choreography.**

```typescript
import { CameraDirectorPlugin } from "@tokovo/compiler";

episode("demo", { fps: 30, duration: "30s" })
  .track("whatsapp", factory, (wa) => {
    wa.at("1s").receive("Sarah", "Hey!");
    wa.at("2s").receive("Sarah", "How are you?");
    // ... just write messages
  })
  .use(new CameraDirectorPlugin()) // ← Auto-generates all camera!
  .build();
```

**That's it!** Camera automatically tracks messages, typing, notifications.

---

## Two Approaches

### 1. Plugin System (80-90% of episodes)

**Use when:**

- Standard conversations (WhatsApp, Messages, etc.)
- Want consistent camera feel
- Don't need per-message customization

**Pros:**

- ✅ Zero code duplication
- ✅ Auto-reads events from IR
- ✅ Consistent quality
- ✅ Fast to implement

**Cons:**

- ❌ Fixed intensity per behavior
- ❌ Can't customize individual messages

### 2. Manual Camera (10-20% of episodes)

**Use when:**

- Artistic/cinematic shots
- Per-message intensity variation
- Non-conversation scenes (intros, outros)
- Custom camera sequences

**Pros:**

- ✅ Full artistic control
- ✅ Per-shot customization
- ✅ Complex sequences

**Cons:**

- ❌ Manual work (100-300 lines)
- ❌ Duplication-prone
- ❌ Time-consuming

---

## Plugin API

### Basic Usage

```typescript
import { CameraDirectorPlugin } from "@tokovo/compiler";

// Default behavior (energetic)
.use(new CameraDirectorPlugin())

// Use preset
.use(new CameraDirectorPlugin("fluid-tennis-dramatic"))

// Custom config
.use(new CameraDirectorPlugin({
  behaviors: {
    MESSAGE_RECEIVED: "fluid-tennis-dramatic",
    NOTIFICATION_SHOWN: "interrupt-focus",
    TYPING_START: "static"  // No typing movement
  },
  debug: true
}))
```

### Available Behavior Presets

| Preset                   | Scale | Shake | When to Use               |
| ------------------------ | ----- | ----- | ------------------------- |
| `fluid-tennis-casual`    | 1.1   | 2     | Calm conversations        |
| `fluid-tennis-energetic` | 1.2   | 3     | **DEFAULT** - Normal chat |
| `fluid-tennis-dramatic`  | 1.25  | 6     | Intense/emotional         |
| `interrupt-focus`        | 1.3   | 0     | Auto for notifications    |
| `drift-anticipation`     | 1.05  | 0     | Auto for typing           |
| `static`                 | 1.0   | 0     | No movement               |

### Behavior Customization

```typescript
.use(new CameraDirectorPlugin({
  behaviors: { MESSAGE_RECEIVED: "fluid-tennis-dramatic" },
  behaviorConfig: {
    "fluid-tennis-dramatic": {
      baseScale: 1.4,       // Override scale
      shakeIntensity: 10,   // Override shake
      panDistance: 80       // Override pan
    }
  }
}))
```

### Hybrid Mode (Plugin + Manual)

Combine auto-choreography with manual artistic moments:

```typescript
.use(new CameraDirectorPlugin())  // Auto-handles 90%
.camera(cam => {
  // Manual override for ONE climax moment
  cam.at("26s").focus("message-12", { scale: 1.6 });
  cam.at("26s").shake({ intensityX: 12 });
})
```

---

## Manual Camera API

Full control for artistic shots:

```typescript
.camera(cam => {
  // Focus on anchor
  cam.at("1s").focus("message-0", {
    scale: 1.2,
    duration: "0.5s",
    easing: "easeOut"
  });

  // Shake effect
  cam.at("1s").shake({
    intensityX: 5,
    intensityY: 3,
    frequency: 15,
    decay: 0.9,
    duration: "0.4s"
  });

  // Animate (pan)
  cam.at("3s").animate({
    x: 50,
    y: -30,
    duration: "1s",
    easing: "easeInOut"
  });

  // Reset to default
  cam.at("10s").reset({
    duration: "1s",
    easing: "easeOut"
  });

  // Zoom
  cam.at("15s").zoom({
    scale: 1.5,
    duration: "0.5s"
  });
})
```

---

## When to Use Which

| Scenario                | Approach                   |
| ----------------------- | -------------------------- |
| Standard conversation   | Plugin only                |
| Want dramatic preset    | Plugin with preset         |
| Need custom intensity   | Plugin with behaviorConfig |
| One climax moment       | Plugin + manual hybrid     |
| Per-message variation   | Manual only                |
| Artistic intro/outro    | Manual only                |
| Complex custom sequence | Manual only                |

---

## Maintenance Guide (IMPORTANT)

**When adding NEW camera features:**

### ✅ DO:

1. Add to **both** plugin AND manual systems
2. Update `CameraDirectorPlugin.convertEffectsToTrackEvents()`
3. Update `CameraTrackBuilder` manual methods
4. Add to behavior presets if applicable
5. Test with both plugin and manual episodes

### ❌ DON'T:

1. Add feature only to plugin (breaks manual)
2. Add feature only to manual (breaks plugin)
3. Forget to update TrackEvent types
4. Skip testing hybrid mode

### Example: Adding New Effect

```typescript
// 1. Add to TrackEvent types (packages/ir/src/v2/track-event.ts)
type CameraEventType =
  | "FOCUS"
  | "SHAKE_START"
  | "WHIP_PAN";  // ← NEW

// 2. Add to manual builder (packages/dsl/src/core/tracks/camera.ts)
whipPan(direction: "up" | "down" | "left" | "right") {
  this.emit({ kind: "CAMERA", type: "WHIP_PAN", payload: { direction } });
}

// 3. Add to plugin conversion (packages/compiler/src/plugins/camera-director.plugin.ts)
if (effect.type === "whipPan") {
  trackEvents.push({
    at: effect.timestamp,
    kind: "CAMERA",
    type: "WHIP_PAN",
    payload: effect.params
  });
}

// 4. Add to behaviors if applicable
```

---

## Architecture

See [NEXT_GEN.md](/later/NEXT_GEN.md) for full plugin architecture.

**Key Concepts:**

- **IR as Event Bus** - Plugin reads events from IR
- **Multi-Pass Compilation** - Plugin runs after track events collected
- **Two-Sided Plugins** - Compile (generate events) + Render (components)

---

## Migration Guide

### From Manual to Plugin

**Before (200 lines):**

```typescript
.camera(cam => {
  const messages = [
    { time: 1, from: "Sarah", text: "Hey", order: 0 },
    // ... 50 lines of duplication
  ];

  const events = messages.map(...); // Convert
  const director = new CameraDirector();
  const effects = director.choreograph(events);
  applyCameraEffects(cam, effects);
})
```

**After (1 line):**

```typescript
.use(new CameraDirectorPlugin())
```

---

## Examples

See working examples in:

- `packages/episodes/src/showcases/mega-camera-director.episode.ts` - Plugin
- `packages/episodes/src/showcases/mega-camera-showcase.episode.ts` - Manual
- `packages/episodes/src/showcases/camera-director-full.episode.ts` - Plugin with preset

---

## See Also

- [Plugin Architecture](/later/NEXT_GEN.md)
- [DSL Reference](../dsl/README.md)
- [Episode Examples](../episodes/README.md)
