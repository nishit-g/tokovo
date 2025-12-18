# Camera System Guide

> **Cinematic camera controls for dramatic effect.**

---

## Overview

The Tokovo camera system provides:

- **Zoom** - Scale the viewport
- **Pan** - Move the viewport
- **Shake** - Intensity effects
- **Focus** - Follow semantic anchors
- **Track** - Follow element for duration
- **Reset** - Return to default

---

## DSL Camera API

```typescript
.camera(cam => {
    // Point events (happen at a moment)
    cam.at("0s").set({ scale: 1, x: 0, y: 0 });
    cam.at("5s").animate({ scale: 1.3, duration: "0.5s", easing: "easeOut" });
    cam.at("10s").focus("dm_alex.message[last]", { scale: 1.2 });
    cam.at("15s").shake({ intensity: 0.5, duration: "0.3s" });
    cam.at("20s").reset({ duration: "0.5s" });
    
    // Span events (cover a duration)
    cam.span("5s", "15s").track("message_bubble");
})
```

---

## Camera Methods Reference

### at(time).set(options)

Set camera immediately:

| Option | Type | Description |
|--------|------|-------------|
| `scale` | number | Zoom level (1 = normal) |
| `x` | number | X offset (pixels) |
| `y` | number | Y offset (pixels) |
| `rotation` | number | Rotation (degrees) |

### at(time).animate(options)

Animate to target:

| Option | Type | Description |
|--------|------|-------------|
| `scale` | number | Target zoom |
| `x` | number | Target X |
| `y` | number | Target Y |
| `duration` | string | Animation time ("0.5s") |
| `easing` | string | Easing function |

### at(time).focus(target, options?)

Focus on semantic anchor:

| Option | Type | Description |
|--------|------|-------------|
| `target` | string | Anchor ID ("message[last]") |
| `scale` | number | Zoom level |
| `offsetX` | number | X offset from anchor |
| `offsetY` | number | Y offset from anchor |

### at(time).shake(options)

Camera shake effect:

| Option | Type | Description |
|--------|------|-------------|
| `intensity` | number | 0-1 (higher = more shake) |
| `frequency` | number | Oscillations per second |
| `duration` | string | How long to shake |

### at(time).reset(options?)

Return to default:

| Option | Type | Description |
|--------|------|-------------|
| `duration` | string | Animation time |

### span(start, end).track(target)

Follow element for duration:

```typescript
cam.span("5s", "15s").track("message_bubble");
```

---

## Semantic Anchors

Anchors are named points in the UI that camera can focus on.

### Built-in Anchors

| Anchor | Description |
|--------|-------------|
| `message[last]` | Most recent message |
| `message[first]` | First message |
| `input` | Message input field |
| `header` | App header |
| `notification` | Active notification |
| `typing` | Typing indicator |

### Using Anchors

```typescript
.camera(cam => {
    cam.at("5s").focus("message[last]", { scale: 1.15 });
})
```

### Plugin-Defined Anchors

Plugins register their own anchors:

```typescript
anchors: [
    { 
        id: "lastMessage", 
        resolver: (world) => ({
            x: 0.5,
            y: getLastMessageY(world),
            width: 1,
            height: 0.15
        })
    }
]
```

---

## Easing Functions

| Easing | Description |
|--------|-------------|
| `linear` | Constant speed |
| `easeIn` | Start slow, speed up |
| `easeOut` | Start fast, slow down |
| `easeInOut` | Slow start and end |
| `cinematic` | Professional feel |

---

## DirectorLite (Auto-Camera)

Enable auto-camera for automatic movements:

```typescript
episode("demo", { fps: 30, duration: "30s" })
    .director("ViralDramaV1")  // Auto camera
    .device(...)
    .build();
```

### Director Styles

| Style | Description |
|-------|-------------|
| `ViralDramaV1` | Fast, dramatic zooms |
| `Cinematic` | Film-style movements |
| `Documentary` | Subtle, steady |

### Priority System

1. **Manual DSL** (highest) - Explicit camera calls
2. **Semantic** - Focus on anchors
3. **DirectorLite** (lowest) - Auto-reactions

Manual camera suspends DirectorLite.

---

## Multi-Device Layouts

For scenes with multiple devices:

```typescript
// In future: layout events
{ kind: "CAMERA", type: "LAYOUT", payload: { mode: "SPLIT" } }
```

| Mode | Description |
|------|-------------|
| `SINGLE` | One device fills screen |
| `SPLIT` | Two devices side by side |
| `PIP` | Picture-in-picture |
| `GRID` | Multiple devices |

---

## Camera State

Camera state in WorldState:

```typescript
world.camera = {
    scale: 1.2,
    translateX: 0,
    translateY: -50,
    rotation: 0,
    isAnimating: true,
    focusTarget: "message[last]",
    shake: null
};
```

---

## Complete Example

```typescript
.camera(cam => {
    // Start zoomed out
    cam.at("0s").set({ scale: 0.9 });
    
    // Zoom in as conversation starts
    cam.at("2s").animate({ scale: 1.1, duration: "0.5s", easing: "easeOut" });
    
    // Focus on message as it arrives
    cam.at("5s").focus("message[last]", { scale: 1.2 });
    
    // Dramatic shake for revelation
    cam.at("10s").shake({ intensity: 0.3, duration: "0.3s" });
    
    // Slow zoom for tension
    cam.at("12s").animate({ scale: 1.3, duration: "2s", easing: "cinematic" });
    
    // Reset for resolution
    cam.at("20s").reset({ duration: "0.5s" });
})
```
