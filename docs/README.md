# Tokovo Documentation

Welcome to the Tokovo documentation. Tokovo is a programmable phone-simulation engine for cinematic storytelling.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [DSL](./DSL.md) | Centralized event factories for all timeline events |
| [Keyboard](./KEYBOARD.md) | Virtual keyboard and typing simulation |
| [Device OS](./DEVICE_OS.md) | Clock, battery, network, status bar |
| [Camera & Audio](./CAMERA_AUDIO.md) | Cinematic effects and sound |

---

## What's New

### Centralized DSL Module

All event creation is now centralized in `@tokovo/dsl`:

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";

const events = [
    dsl.keyboard.show(0, "phone"),
    ...generateTyping(30, "phone", "Hello world!"),
    dsl.messages.send(150, "dm_friend", "Hello world!"),
    dsl.camera.zoom(200, 1.2, 30),
    dsl.audio.play(200, "message_sent"),
    dsl.os.setBattery(300, 85),
];
```

### Device OS Layer

StatusBar now reads from device state:
- **Clock** updates via `dsl.os.setTime()`
- **Battery** drains via `dsl.os.setBattery()`
- **Network** switches via `dsl.os.setNetwork()`
- **DND** toggles via `dsl.os.setDND()`

### Production Keyboard

IOSKeyboard with authentic iOS styling:
- Key pop-ups when pressed
- Typing humanization (variable speed, typos)
- QWERTY, emoji, and numeric layouts

---

## Package Overview

```
tokovo/
├── packages/
│   ├── core/           # Engine, types, replay()
│   ├── dsl/            # DSL event factories
│   ├── devices/        # Device profiles, StatusBar, Keyboard
│   ├── renderer/       # TokovoRenderer, DeviceFrame
│   ├── apps-whatsapp/  # WhatsApp chat UI
│   └── apps-twitter/   # Twitter/X UI
└── apps/
    └── video-runner/   # Remotion video app
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm turbo dev --filter=video-runner

# Open http://localhost:3000
```

---

## Creating an Episode

```typescript
import { WorldState, TimelineEvent } from "@tokovo/core";
import { dsl, generateTyping } from "@tokovo/dsl";

function createEpisode() {
    const initialWorld: WorldState = {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                foregroundAppId: "app_whatsapp",
                notifications: [],
                os: {
                    clock: Date.now(),
                    battery: 87,
                    network: "wifi",
                    // ... see DEVICE_OS.md
                },
            },
        },
        conversations: {
            dm_friend: {
                id: "dm_friend",
                type: "dm",
                name: "Friend",
                messages: [],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_friend",
            },
        },
        camera: { /* ... */ },
        audio: { activeSounds: {} },
    };
    
    const events: TimelineEvent[] = [
        // Your story events here
        dsl.keyboard.show(0, "phone"),
        ...generateTyping(30, "phone", "Hey!", { speed: "casual" }),
        dsl.messages.send(100, "dm_friend", "Hey!"),
        dsl.keyboard.hide(110, "phone"),
    ];
    
    return { initialWorld, events };
}
```

---

## Architecture

```
Episode JSON/TS
      │
      ▼
┌─────────────────┐
│   Core Engine   │
│    replay()     │
└────────┬────────┘
         │ WorldState
         ▼
┌─────────────────┐
│  Layout Engine  │
│  (computed)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Renderer     │
│   (React/JSX)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Remotion     │
│     Video       │
└─────────────────┘
```

---

## Principles

1. **Deterministic** - At any frame `t`, world state is reproducible
2. **Composable** - Add devices/apps without modifying core
3. **Data-driven** - Episodes define everything; no hidden state
4. **Cinematic** - Optimized for rendering, not interaction
