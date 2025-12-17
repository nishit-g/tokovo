# Camera System

> Cinematic camera controls for dramatic effect

---

## Overview

The Tokovo camera system provides cinematic controls:

- **Zoom** - Scale the view
- **Pan** - Move the viewport
- **Shake** - Intensity effects
- **Focus** - Follow content
- **Cut** - Scene transitions

All camera changes are **RuntimeEvents**, ensuring determinism.

---

## Camera Events

### ZOOM

```typescript
{
    at: 60,
    kind: "CAMERA",
    type: "ZOOM",
    payload: {
        scale: 1.3,          // 1.0 = normal
        duration: 15,        // frames
        originX: 0.5,        // 0-1, horizontal anchor
        originY: 0.7,        // 0-1, vertical anchor
        easing: "easeOut"    // animation curve
    }
}
```

### PAN

```typescript
{
    at: 90,
    kind: "CAMERA",
    type: "PAN",
    payload: {
        translateX: 50,      // pixels
        translateY: -100,    // pixels
        relative: true,      // add to current position
        duration: 30,
        easing: "easeInOut"
    }
}
```

### SHAKE

```typescript
{
    at: 120,
    kind: "CAMERA",
    type: "SHAKE",
    payload: {
        intensity: 0.5,      // 0-1
        frequency: 10,       // oscillations per second
        duration: 15,
        decay: 0.9          // reduce over time
    }
}
```

### FOCUS

Focus on semantic content:

```typescript
{
    at: 150,
    kind: "CAMERA",
    type: "ANCHOR_FOCUS",
    payload: {
        anchor: "lastMessage",  // semantic anchor
        scale: 1.2,
        duration: 20,
        easing: "cinematic"
    }
}
```

### RESET

Return to default view:

```typescript
{
    at: 200,
    kind: "CAMERA",
    type: "RESET",
    payload: {
        duration: 15,
        easing: "easeOut"
    }
}
```

---

## DSL Camera API

Within a beat, use the camera builder:

```typescript
b.camera(c => {
    // Zoom in on action
    c.zoom(1.2, { duration: "0.5s", easing: "easeOut" });
    
    // Pan down to follow content
    c.pan(0, 100, { duration: "1s" });
    
    // Shake for emphasis
    c.shake(0.3, { duration: "0.3s" });
    
    // Focus on last message
    c.focus("lastMessage", { scale: 1.1 });
    
    // Reset to normal
    c.reset({ duration: "0.5s" });
});
```

### Camera Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `zoom(scale, opts)` | scale, duration, origin, easing | Scale the view |
| `pan(x, y, opts)` | pixels, duration, relative, easing | Move viewport |
| `shake(intensity, opts)` | 0-1, duration, frequency, decay | Camera shake |
| `focus(anchor, opts)` | anchor name, scale, duration | Focus on content |
| `reset(opts)` | duration, easing | Return to default |
| `hold(duration)` | duration | Hold current view |

---

## Semantic Anchors

Anchors are named points in the UI:

| Anchor | Description |
|--------|-------------|
| `lastMessage` | The most recent message |
| `inputArea` | The message input field |
| `header` | The app header |
| `notification` | Active notification |
| `typingIndicator` | Typing bubble |

### Using Anchors

```typescript
b.camera(c => {
    c.focus("lastMessage", { 
        scale: 1.15, 
        duration: "0.5s" 
    });
});
```

Plugins register their own anchors:

```typescript
anchors: {
    providers: {
        "lastMessage": (world, deviceId) => {
            const msgs = getMessages(world, deviceId);
            const last = msgs[msgs.length - 1];
            return { 
                x: 0.5, 
                y: last.offsetY / DEVICE_HEIGHT,
                width: 1,
                height: 0.15
            };
        }
    }
}
```

---

## Camera State

Camera state in WorldState:

```typescript
interface CameraState {
    transform: {
        scale: number;
        translateX: number;
        translateY: number;
        rotation: number;
    };
    
    targetTransform?: CameraTransform;  // For animations
    animationFrame?: number;
    animationDuration?: number;
    
    // Multi-device
    layout?: {
        mode: "SINGLE" | "SPLIT" | "PIP";
        primaryDevice: string;
        secondaryDevice?: string;
    };
}
```

---

## Multi-Device Layouts

For split-screen or picture-in-picture:

### LAYOUT Event

```typescript
{
    at: 0,
    kind: "CAMERA",
    type: "LAYOUT",
    payload: {
        mode: "SPLIT",
        primaryDeviceId: "phone_alice",
        secondaryDeviceId: "phone_bob",
        duration: 15
    }
}
```

### Layout Modes

| Mode | Description |
|------|-------------|
| `SINGLE` | One device fills screen |
| `SPLIT` | Two devices side by side |
| `PIP` | Main device with small inset |
| `GRID` | Multiple devices in grid |

---

## DirectorLite Integration

DirectorLite auto-generates camera events based on content:

```typescript
// DirectorLite reacts to signals
const directorRules = [
    {
        match: { type: "NewMessage", intensity: { gte: 0.7 } },
        action: "ZOOM",
        scale: 1.1,
        duration: 20,
        anchorId: "lastMessage"
    },
    {
        match: { type: "TypingStarted" },
        action: "FOCUS",
        anchorId: "inputArea",
        scale: 1.05
    }
];
```

### Priority System

1. **Manual DSL** (highest) - Explicit `b.camera()` calls
2. **Semantic** - `b.camera.focus("anchor")`  
3. **DirectorLite** (lowest) - Auto-reactions

If manual camera is active, DirectorLite is suspended.

---

## Easing Functions

| Value | Description |
|-------|-------------|
| `linear` | Constant speed |
| `easeIn` | Start slow, speed up |
| `easeOut` | Start fast, slow down |
| `easeInOut` | Slow, fast, slow |
| `cinematic` | Professional feel |

---

## Complete Example

```typescript
d.beat("dramatic-reveal", b => {
    // Start zoomed in on typing
    b.camera(c => {
        c.focus("inputArea", { scale: 1.3 });
    });
    
    b.typing("Sarah").for("2s");
    
    // Zoom out slightly as message arrives
    b.camera(c => {
        c.zoom(1.1, { duration: "0.3s", easing: "easeOut" });
    });
    
    b.receive("Sarah", "I have something important to tell you...", {
        mood: "tense"
    });
    
    // Hold for dramatic effect
    b.camera(c => {
        c.hold("1s");
    });
    
    // Slow zoom on the message
    b.camera(c => {
        c.focus("lastMessage", { 
            scale: 1.2, 
            duration: "2s",
            easing: "cinematic" 
        });
    });
});
```
