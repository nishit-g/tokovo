# Camera DSL API Reference

Complete method reference for Tokovo's Camera Track DSL.

## Overview

The Camera DSL provides two builder classes:

- **CameraTrackBuilder**: Main entry point for scheduling camera operations
- **CameraPointBuilder**: Defines instant camera operations at specific timestamps

---

## CameraTrackBuilder

Main builder for defining camera behavior over time.

### `.at(time)`

Creates a point operation at a specific timestamp.

**Parameters:**

- `time`: `string | number` - Timestamp in seconds (number) or time string format (e.g., "2.5s", "1000ms")

**Returns:** `CameraPointBuilder` - Builder for defining the operation at this timestamp

**Example:**

```typescript
camera.at(0).focus("character1").at(2.5).shake({ intensity: 10 });
```

---

## CameraPointBuilder

Defines instant camera operations at a specific point in time.

### `.focus(anchorId, options?)`

Focus the camera on a target anchor with optional animation.

**Purpose:** Centers the camera on an anchor (character, UI element, etc.) with configurable fill and transition style.

**Parameters:**

- `anchorId`: `string` - ID of the anchor to focus on
- `options`: `CameraFocusOptions` (optional)
  - `targetFill`: `number` (optional) - How much of the frame the anchor should fill (scale factor)
  - `autoReset`: `boolean` (optional) - Whether to reset after focus
  - `blendStyle`: `"gentle" | "snappy" | "stiff" | "none"` (optional) - Animation easing style
    - `"gentle"` → easeInOut
    - `"snappy"` → easeOut
    - `"stiff"` → linear
    - `"none"` → linear (default)

**Returns:** `void`

**Example:**

```typescript
camera
  .at(1)
  .focus("hero", {
    targetFill: 0.8,
    blendStyle: "gentle",
  })
  .at(3)
  .focus("villain", {
    targetFill: 1.2,
    blendStyle: "snappy",
  });
```

---

### `.shake(options?)`

Add camera shake effect (screen shake).

**Purpose:** Creates tremor/shake effects for impacts, earthquakes, tension, or emotional moments.

**Parameters:**

- `options`: `CameraShakeOptions` (optional)
  - `intensity`: `number` (optional, default: `5`) - Shake magnitude in pixels
  - `frequency`: `number` (optional) - Shake speed/oscillation rate
  - `decay`: `number` (optional) - How quickly shake diminishes

**Returns:** `void`

**Example:**

```typescript
camera
  .at(2.5)
  .shake({
    intensity: 15,
    frequency: 20,
    decay: 0.9,
  })
  .at(5)
  .shake(); // Uses default intensity: 5
```

---

### `.pan(x, y, options?)`

Manually position the camera using x/y offsets.

**Purpose:** Direct pixel-based camera positioning with optional animation duration.

**Parameters:**

- `x`: `number` - Horizontal offset in pixels
- `y`: `number` - Vertical offset in pixels
- `options`: `CameraPanOptions` (optional)
  - `duration`: `number` (optional) - Animation duration in seconds
  - `easing`: `"linear" | "easeIn" | "easeOut" | "easeInOut"` (optional) - Easing function

**Returns:** `void`

**Example:**

```typescript
camera
  .at(1)
  .pan(100, -50, {
    duration: 1.5,
    easing: "easeInOut",
  })
  .at(3)
  .pan(0, 0, {
    duration: 1,
    easing: "easeOut",
  });
```

---

### `.reset(options?)`

Reset camera to default state (neutral position and zoom).

**Purpose:** Return to initial camera view, useful after focus/pan/shake operations.

**Parameters:**

- `options`: `CameraResetOptions` (optional)
  - `blendStyle`: `"gentle" | "snappy" | "stiff" | "none"` (optional) - Transition style
    - `"gentle"` → easeInOut
    - `"snappy"` → easeOut
    - Other values → no easing

**Returns:** `void`

**Example:**

```typescript
camera.at(5).reset({ blendStyle: "gentle" }).at(8).reset(); // Instant reset, no easing
```

---

### `.cut()`

Instant camera cut with no transition.

**Purpose:** Abrupt camera change, like a film cut. Useful for dramatic transitions or scene changes.

**Parameters:** None

**Returns:** `void`

**Example:**

```typescript
camera.at(2).focus("character1").at(3).cut().at(3.1).focus("character2");
```

---

### `.dutchTilt(angle, options?)`

Apply Z-axis rotation (Dutch angle) for tension or unease.

**Purpose:** Tilts the camera on the Z-axis, creating a disorienting or dramatic effect.

**Parameters:**

- `angle`: `number` - Rotation angle in degrees
- `options`: `CameraDutchTiltOptions` (optional)
  - `blendStyle`: `"gentle" | "snappy" | "stiff" | "none"` (optional) - (Currently unused in implementation)

**Returns:** `void`

**Example:**

```typescript
camera.at(4).dutchTilt(15).at(6).dutchTilt(0); // Return to level
```

---

### `.flash(options?)`

Add flash overlay effect.

**Purpose:** Creates a white/colored flash overlay for transitions, impacts, or stylistic effects.

**Parameters:**

- `options`: `CameraFlashOptions` (optional)
  - `color`: `string` (optional) - Flash color (CSS color string)
  - `intensity`: `number` (optional) - Flash brightness/opacity

**Returns:** `void`

**Example:**

```typescript
camera
  .at(1.5)
  .flash({
    color: "white",
    intensity: 1,
  })
  .at(3)
  .flash({
    color: "#ff0000",
    intensity: 0.7,
  });
```

---

## Complete Example

```typescript
import { episode } from "@tokovo/dsl";

episode("cinematic-sequence", (ep) => {
  const { camera, character } = ep;

  // Define characters
  character("hero", { x: 100, y: 200 });
  character("villain", { x: 800, y: 200 });

  // Camera choreography
  camera
    // Start: Focus on hero gently
    .at(0)
    .focus("hero", {
      targetFill: 0.9,
      blendStyle: "gentle",
    })

    // 2s: Impact shake
    .at(2)
    .shake({
      intensity: 20,
      frequency: 25,
      decay: 0.85,
    })

    // 3s: Quick cut and focus villain
    .at(3)
    .cut()
    .at(3.1)
    .focus("villain", {
      targetFill: 1.1,
      blendStyle: "snappy",
    })

    // 4s: Add tension with dutch tilt
    .at(4)
    .dutchTilt(12)

    // 5s: Flash transition
    .at(5)
    .flash({ color: "white", intensity: 1 })

    // 6s: Reset to neutral
    .at(6.5)
    .reset({ blendStyle: "gentle" })
    .dutchTilt(0);
});
```

---

## Type Definitions

### CameraFocusOptions

```typescript
interface CameraFocusOptions {
  targetFill?: number;
  autoReset?: boolean;
  blendStyle?: "gentle" | "snappy" | "stiff" | "none";
}
```

### CameraShakeOptions

```typescript
interface CameraShakeOptions {
  intensity?: number; // Default: 5
  frequency?: number;
  decay?: number;
}
```

### CameraPanOptions

```typescript
interface CameraPanOptions {
  duration?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
}
```

### CameraResetOptions

```typescript
interface CameraResetOptions {
  blendStyle?: "gentle" | "snappy" | "stiff" | "none";
}
```

### CameraDutchTiltOptions

```typescript
interface CameraDutchTiltOptions {
  blendStyle?: "gentle" | "snappy" | "stiff" | "none";
}
```

### CameraFlashOptions

```typescript
interface CameraFlashOptions {
  color?: string;
  intensity?: number;
}
```

---

## Notes

- All methods on `CameraPointBuilder` return `void` - they schedule events but don't return chainable builders
- Time parsing supports both numeric seconds and string formats ("2s", "1500ms")
- Blend styles map to easing functions internally:
  - `"gentle"` → `"easeInOut"`
  - `"snappy"` → `"easeOut"`
  - Other values → `"linear"` or no easing
- The `.zoom()` method has been removed - use `.focus()` with `targetFill` option instead
- Camera operations are declarative - they schedule events in the timeline rather than executing immediately
