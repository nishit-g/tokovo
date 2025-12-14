# Camera & Audio Systems

> **Location**: `@tokovo/core` (types), `@tokovo/dsl` (events)

The Camera and Audio systems provide cinematic effects that make videos feel professional and immersive.

---

## Camera System

### Overview

The camera system supports:
- **Zoom** - Scale in/out with customizable origin
- **Pan** - Translate camera position
- **Shake** - Screen shake for dramatic moments
- **Focus** - Highlight specific areas
- **Reset** - Return to default view

### Camera State

```typescript
interface CameraState {
    baseView: "APP_VIEW" | "LOCKSCREEN_VIEW" | "HOMESCREEN_VIEW";
    activeDeviceId: string;
    layout: CameraLayoutConfig;
    activeEffects: ActiveEffect[];
    transform: CameraTransform;
    deviceTransforms: Record<string, CameraTransform>;
}

interface CameraTransform {
    translateX: number;
    translateY: number;
    scale: number;
    rotation: number;
    originX: number;    // 0-1, center of zoom
    originY: number;    // 0-1, center of zoom
    shakeX: number;
    shakeY: number;
}
```

### DSL Events

#### Zoom

```typescript
// Simple zoom
dsl.camera.zoom(100, 1.3, 30)  // Zoom to 130% over 30 frames

// Zoom with custom origin
dsl.camera.zoom(100, 1.3, 30, { 
    originX: 0.5,   // Center horizontally
    originY: 0.7    // Focus on lower part of screen
})
```

#### Pan

```typescript
// Pan right and up
dsl.camera.pan(200, 100, -50, 20)

// Parameters: at, x, y, duration
```

#### Shake

```typescript
// Basic shake
dsl.camera.shake(300, 5, 15)

// With options
dsl.camera.shake(300, 5, 15, {
    frequency: 20,  // Shake speed
    decay: 0.8      // Fade out rate
})
```

#### Focus

```typescript
// Focus on specific point
dsl.camera.focus(400, 0.5, 0.3, 1.2, 25)

// Parameters: at, x, y, scale, duration
```

#### Reset

```typescript
// Return to default view
dsl.camera.reset(500, 25)
```

### Use Cases

| Effect | When to Use |
|--------|-------------|
| **Zoom** | Reading important message |
| **Pan** | Following action |
| **Shake** | Dramatic moment, notification |
| **Focus** | Highlighting specific UI |
| **Reset** | Returning to normal view |

### Example

```typescript
const events = [
    // Conversation happening...
    dsl.messages.receive(100, "dm", "Alex", "OMG!! You won't believe this!"),
    
    // Zoom in on dramatic message
    dsl.camera.zoom(110, 1.25, 20, { originY: 0.7 }),
    
    // Small shake for impact
    dsl.camera.shake(130, 3, 12, { decay: 0.9 }),
    
    // Hold for a beat, then reset
    dsl.camera.reset(200, 25),
];
```

---

## Audio System

### Overview

The audio system manages:
- **Sound Effects** - UI sounds, notifications
- **Background Music** - Ambient music beds
- **Volume Control** - Fade in/out
- **Bus System** - Music, SFX, UI, Voice channels

### Audio State

```typescript
interface AudioState {
    activeSounds: Record<string, ActiveSound>;
    buses: {
        music: AudioBusConfig;
        ui: AudioBusConfig;
        sfx: AudioBusConfig;
        voice: AudioBusConfig;
    };
    backgroundMusic?: {
        soundId: string;
        volume: number;
        loop: boolean;
        startFrame: number;
    };
}

interface ActiveSound {
    soundId: string;
    instanceId: string;
    volume: number;
    startFrame: number;
    bus: AudioBus;
    envelope?: AudioEnvelope;
}
```

### DSL Events

#### Play Sound

```typescript
// Play notification sound
dsl.audio.play(100, "whatsapp_received", 0.8)

// Play with default volume
dsl.audio.play(100, "message_sent")

// Available sounds depend on your asset library
```

#### Stop Sound

```typescript
// Stop a specific sound instance
dsl.audio.stop(200, "bgm_1")
```

#### Fade Volume

```typescript
// Fade background music to 30% over 1 second
dsl.audio.fade(300, "bgm_1", 0.3, 30)
```

#### Background Music

```typescript
// Start looping background music
dsl.audio.backgroundMusic(0, "ambient_tension", {
    volume: 0.4,
    loop: true,
})
```

### Sound IDs

Common sound effects in Tokovo:

| Sound ID | Description |
|----------|-------------|
| `whatsapp_received` | Incoming WhatsApp message |
| `whatsapp_sent` | Outgoing WhatsApp message |
| `message_sent` | Generic send sound |
| `notification` | System notification |
| `key_click` | Keyboard key press |

### Example

```typescript
const events = [
    // Background music starts
    dsl.audio.backgroundMusic(0, "chill_ambient", { volume: 0.3 }),
    
    // Message arrives
    dsl.messages.receive(100, "dm", "Alex", "Hey!"),
    dsl.audio.play(100, "whatsapp_received", 0.8),
    
    // User types and sends
    dsl.messages.send(200, "dm", "What's up?"),
    dsl.audio.play(200, "whatsapp_sent", 0.7),
    
    // Dramatic moment - music swells
    dsl.audio.fade(300, "bgm_1", 0.6, 30),
    
    // Shocking revelation
    dsl.messages.receive(400, "dm", "Alex", "I know what you did."),
    dsl.audio.play(400, "notification", 1.0),
    dsl.camera.shake(410, 5, 15),
    
    // Music fades out
    dsl.audio.fade(500, "bgm_1", 0.0, 60),
];
```

---

## File Locations

| System | Location |
|--------|----------|
| Camera Types | `packages/core/src/types.ts` |
| Camera Engine | `packages/core/src/camera.ts` |
| Camera DSL | `packages/dsl/src/events/camera.ts` |
| Audio Types | `packages/core/src/types.ts` |
| Audio Engine | `packages/core/src/engine.ts` |
| Audio DSL | `packages/dsl/src/events/audio.ts` |
| AudioLayer | `packages/renderer/src/AudioLayer.tsx` |
