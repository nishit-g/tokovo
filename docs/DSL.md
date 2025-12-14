# DSL Events Module

> **Location**: `@tokovo/dsl` (packages/dsl)

The DSL module provides a centralized, type-safe API for creating timeline events. Instead of manually constructing event objects, use the DSL for cleaner, more maintainable code.

---

## Installation

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";
```

---

## Quick Start

```typescript
const events = [
    // Show keyboard
    dsl.keyboard.show(0, "phone"),
    
    // Type with realistic humanization
    ...generateTyping(30, "phone", "Hello world!", { speed: "casual" }),
    
    // Send message
    dsl.messages.send(150, "dm_friend", "Hello world!"),
    
    // Camera zoom
    dsl.camera.zoom(200, 1.2, 30),
    
    // Play sound
    dsl.audio.play(200, "message_sent", 0.8),
    
    // Device OS updates
    dsl.os.setBattery(300, 85),
    dsl.os.setTime(300, Date.now()),
];
```

---

## Available Modules

| Module | Purpose | Events |
|--------|---------|--------|
| `dsl.keyboard` | Virtual keyboard | show, hide, typeChar, backspace, clear |
| `dsl.messages` | Messaging | send, receive, typingStart, typingEnd, markRead |
| `dsl.camera` | Camera effects | zoom, pan, shake, focus, reset |
| `dsl.audio` | Sound effects | play, stop, fade, backgroundMusic |
| `dsl.os` | Device OS state | setTime, setBattery, setNetwork, setDND |
| `dsl.touch` | Touch gestures | tap, longPress, drag, scroll |

---

## Keyboard Events

### `dsl.keyboard.show(at, deviceId, layout?)`

Shows the virtual keyboard.

```typescript
dsl.keyboard.show(0, "phone")           // Default qwerty
dsl.keyboard.show(0, "phone", "emoji")  // Emoji keyboard
```

### `dsl.keyboard.hide(at, deviceId)`

Hides the keyboard.

```typescript
dsl.keyboard.hide(300, "phone")
```

### `dsl.keyboard.typeChar(at, deviceId, char)`

Types a single character (shows key highlight).

```typescript
dsl.keyboard.typeChar(50, "phone", "H")
dsl.keyboard.typeChar(55, "phone", "i")
```

### `dsl.keyboard.backspace(at, deviceId)`

Deletes last character.

```typescript
dsl.keyboard.backspace(100, "phone")
```

### `dsl.keyboard.clear(at, deviceId)`

Clears all input text.

```typescript
dsl.keyboard.clear(200, "phone")
```

---

## Typing Simulation

The `generateTyping` function creates realistic typing sequences with:
- Variable speed
- Typos and corrections
- Natural pauses

### `generateTyping(startFrame, deviceId, text, options?)`

```typescript
import { generateTyping, TYPING_SPEEDS } from "@tokovo/dsl";

// Basic usage
const events = generateTyping(0, "phone", "Hello!");

// With options
const events = generateTyping(0, "phone", "Hello world!", {
    speed: "casual",           // "slow" | "normal" | "casual" | "fast" | "burst"
    typoPositions: [5, 12],    // Where to make typos
});
```

### Typing Speeds

| Speed | Frames/Char | Description |
|-------|-------------|-------------|
| `slow` | 12 | Careful, thoughtful typing |
| `normal` | 8 | Standard typing |
| `casual` | 6 | Comfortable pace |
| `fast` | 4 | Quick typing |
| `burst` | 2 | Very fast |

---

## Message Events

### `dsl.messages.send(at, conversationId, text)`

Sends message from device owner ("me").

```typescript
dsl.messages.send(100, "dm_alex", "Hey!")
```

### `dsl.messages.receive(at, conversationId, from, text)`

Receives message from another person.

```typescript
dsl.messages.receive(150, "dm_alex", "Alex 💎", "What's up?")
```

### `dsl.messages.typingStart(at, conversationId, from)`

Shows typing indicator.

```typescript
dsl.messages.typingStart(0, "dm_alex", "Alex 💎")
```

### `dsl.messages.typingEnd(at, conversationId, from)`

Hides typing indicator.

```typescript
dsl.messages.typingEnd(60, "dm_alex", "Alex 💎")
```

### Message Status (Tick Progression)

```typescript
// Mark message as sent (single gray tick)
dsl.messages.markSent(100, "dm_alex", "msg_1")

// Mark message as delivered (double gray ticks)
dsl.messages.markDelivered(130, "dm_alex", "msg_1")

// Mark message as read (double blue ticks)
dsl.messages.markRead(160, "dm_alex", "msg_1")
```

---

## Camera Events

### `dsl.camera.zoom(at, scale, duration, options?)`

Zooms in/out.

```typescript
dsl.camera.zoom(100, 1.3, 30)                    // Zoom to 130%
dsl.camera.zoom(100, 1.3, 30, { originY: 0.7 })  // Zoom toward bottom
```

### `dsl.camera.pan(at, x, y, duration)`

Pans the camera.

```typescript
dsl.camera.pan(200, 100, -50, 20)  // Move right and up
```

### `dsl.camera.shake(at, intensity, duration, options?)`

Camera shake effect.

```typescript
dsl.camera.shake(300, 5, 15)                            // Basic shake
dsl.camera.shake(300, 5, 15, { frequency: 20, decay: 0.8 })
```

### `dsl.camera.reset(at, duration)`

Resets camera to default.

```typescript
dsl.camera.reset(400, 25)
```

---

## Audio Events

### `dsl.audio.play(at, soundId, volume?)`

Plays a sound effect.

```typescript
dsl.audio.play(100, "message_sent", 0.8)
dsl.audio.play(150, "whatsapp_received")
```

### `dsl.audio.stop(at, instanceId)`

Stops a playing sound.

```typescript
dsl.audio.stop(200, "bgm_1")
```

### `dsl.audio.fade(at, instanceId, targetVolume, duration)`

Fades volume.

```typescript
dsl.audio.fade(300, "bgm_1", 0.3, 30)
```

---

## Device OS Events

The Device OS layer controls system-level UI elements like the status bar.

### `dsl.os.setTime(at, timestamp, deviceId?)`

Sets the clock display.

```typescript
const now = new Date();
now.setHours(14, 45, 0, 0);
dsl.os.setTime(0, now.getTime())
```

### `dsl.os.setBattery(at, level, charging?, deviceId?)`

Sets battery percentage.

```typescript
dsl.os.setBattery(0, 87)              // 87%
dsl.os.setBattery(100, 85, true)      // 85%, charging
```

### `dsl.os.setNetwork(at, network, strength?, deviceId?)`

Sets network type.

```typescript
dsl.os.setNetwork(0, "wifi", 3)       // WiFi with 3 bars
dsl.os.setNetwork(0, "5G", 4)         // 5G cellular
dsl.os.setNetwork(0, "no-service")    // No signal
```

**Network Types**: `"wifi"` | `"5G"` | `"4G"` | `"LTE"` | `"3G"` | `"no-service"`

### `dsl.os.setDND(at, enabled, deviceId?)`

Toggles Do Not Disturb mode.

```typescript
dsl.os.setDND(0, true)   // Shows moon icon
```

### `dsl.os.setAirplane(at, enabled, deviceId?)`

Toggles Airplane mode (disables network).

```typescript
dsl.os.setAirplane(0, true)  // Disables all radios
```

---

## Touch Events (Gesture Visualization)

### `dsl.touch.tap(at, x, y, deviceId?)`

Shows tap circle at coordinates.

```typescript
dsl.touch.tap(100, 540, 960)  // Tap at x=540, y=960
```

### `dsl.touch.longPress(at, x, y, duration, deviceId?)`

Long press gesture.

```typescript
dsl.touch.longPress(200, 540, 960, 30)  // 1 second hold
```

### `dsl.touch.drag(at, startX, startY, endX, endY, duration, deviceId?)`

Drag gesture.

```typescript
dsl.touch.drag(300, 540, 500, 540, 1500, 20)  // Swipe down
```

---

## Complete Example

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";

// Starting at 2:45 PM
const START_TIME = new Date();
START_TIME.setHours(14, 45, 0, 0);

const events = [
    // Set initial device state
    dsl.os.setTime(0, START_TIME.getTime()),
    dsl.os.setBattery(0, 87),
    
    // Friend starts typing
    dsl.messages.typingStart(0, "dm_alex", "Alex 💎"),
    
    // Time advances
    dsl.os.setTime(60, START_TIME.getTime() + 2000),
    
    // Friend sends message
    dsl.messages.typingEnd(60, "dm_alex", "Alex 💎"),
    dsl.messages.receive(60, "dm_alex", "Alex 💎", "Hey! You free tonight?"),
    dsl.audio.play(60, "whatsapp_received"),
    
    // User types response
    dsl.keyboard.show(90, "phone"),
    ...generateTyping(110, "phone", "Yeah! What's up?", { speed: "casual" }),
    dsl.messages.send(200, "dm_alex", "Yeah! What's up?"),
    dsl.audio.play(200, "whatsapp_sent"),
    dsl.keyboard.hide(210, "phone"),
    
    // Camera focuses on chat
    dsl.camera.zoom(220, 1.15, 20, { originY: 0.7 }),
    
    // Battery drain over time
    dsl.os.setBattery(300, 86),
];
```

---

## Architecture

```
@tokovo/dsl
├── events/
│   ├── index.ts      # Barrel export + dsl object
│   ├── keyboard.ts   # Keyboard event factories
│   ├── messages.ts   # Message event factories
│   ├── camera.ts     # Camera event factories
│   ├── audio.ts      # Audio event factories
│   ├── os.ts         # Device OS event factories
│   ├── touch.ts      # Touch gesture event factories
│   └── typing.ts     # Typing simulation (generateTyping)
└── index.ts          # Package entry point
```

All event factories return properly-typed `TimelineEvent` objects.
