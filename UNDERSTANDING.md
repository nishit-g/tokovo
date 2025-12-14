# Tokovo Codebase Understanding

## 1. Project Overview

Tokovo is a **programmable phone-simulation engine** designed to generate high-fidelity phone UI videos from structured data (JSON/TS episodes). It leverages **React** and **Remotion** to render these videos deterministically.

The project is structured as a **PNPM monorepo** using **Turbo** for build orchestration. It separates the core logic (state management, event replay) from the presentation layer (device frames, app UIs) and the content layer (episodes).

### Core Value Proposition
- **Deterministic Rendering**: The entire video is a function of `initialWorld` + `events[]` over time.
- **Modularity**: Devices and Apps are pluggable modules.
- **AI-Ready**: The "Episode as Code" (JSON) approach makes it ideal for LLM-generated content.
- **Reality Simulation**: Device OS, keyboard, touch gestures make videos indistinguishable from real recordings.

---

## 2. Architecture Analysis

The architecture follows a clean **layered approach**:

### Layer 1: Core Engine (`packages/core`)
- **Responsibility**: Pure logic and state management. No UI dependencies.
- **Key Concepts**:
    - `TimelineEvent`: A discriminated union of all possible actions (DEVICE, APP, CAMERA, AUDIO, KEYBOARD, OS, TOUCH).
    - `WorldState`: The complete state of the simulation at any given time `t`.
    - `replay(initial, events, t)`: A pure function that computes the `WorldState` by applying events up to time `t`.
- **Tech Stack**: TypeScript, Immer (for immutable state updates).

### Layer 2: DSL Layer (`packages/dsl`) — **NEW**
- **Responsibility**: Centralized event creation API.
- **Key Modules**:
    - `dsl.keyboard` — Virtual keyboard events (show, hide, typeChar, backspace)
    - `dsl.messages` — Message lifecycle (send, receive, markRead, markDelivered)
    - `dsl.camera` — Cinematic effects (zoom, pan, shake, focus)
    - `dsl.audio` — Sound effects (play, stop, fade)
    - `dsl.os` — Device OS state (time, battery, network, DND)
    - `dsl.touch` — Gesture visualization (tap, drag, longPress)
    - `generateTyping()` — Realistic typing simulation

### Layer 3: Presentation Layer (`packages/devices`, `packages/apps-*`, `packages/renderer`)
- **Responsibility**: Visualizing the `WorldState`.
- **Components**:
    - **Devices**: `packages/devices` exports `DeviceProfile` (assets, dimensions, safe areas), `StatusBar`, `IOSKeyboard`.
    - **Apps**: `packages/apps-whatsapp`, `packages/apps-twitter` export runtime reducers and React UI components.
    - **Renderer**: `packages/renderer` orchestrates the rendering. Uses a **Layout Engine** and **DirectorLite** for camera automation.
- **Registry**: A central `PluginManager` maps `appId` to its corresponding runtime and view.

### Layer 4: Content Layer (`packages/episodes`)
- **Responsibility**: Defining the stories.
- **Format**: JSON files (or TS showcases) containing `initialWorld` and an array of `events`.
- **Validation**: Uses **Zod** schemas to ensure episode validity before rendering.

### Layer 5: Execution Layer (`apps/video-runner`)
- **Responsibility**: The actual Remotion application that loads episodes and renders the video.
- **Entry Point**: `pnpm turbo dev --filter=video-runner`.

---

## 3. Current Implementation Status

### ✅ Phase 1 — Foundation (COMPLETE)
- Monorepo Structure with PNPM and Turbo
- Core Types: `TimelineEvent`, `WorldState`, `DeviceState`, `ConversationState`
- Episode Structure with JSON examples
- Basic Event Types: DEVICE, APP, CAMERA
- WhatsApp App with full chat UI
- iPhone 16 device profile

### ✅ Phase 2 — Production Engine (COMPLETE)
- **Centralized DSL Module** (`@tokovo/dsl`)
    - Keyboard events with key pop-ups
    - Message lifecycle (send → sent → delivered → read)
    - Camera effects (zoom, pan, shake, focus, reset)
    - Audio orchestration (play, stop, fade)
- **Device OS Layer**
    - Clock, battery, network, DND in status bar
    - OS events (`SET_TIME`, `SET_BATTERY`, `SET_NETWORK`, `SET_DND`)
    - StatusBar reads from `device.os`
- **Keyboard System**
    - Production IOSKeyboard with key highlights
    - `generateTyping()` for humanized typing
    - Typing speeds: slow, normal, casual, fast, burst
- **Touch Gestures** (core types ready)
    - TouchOverlay for tap visualization
- **Camera System**
    - DirectorLite automation
    - Zoom, pan, shake, focus effects
- **Audio System**
    - AudioLayer component
    - Bus system (music, SFX, UI, voice)

### ⏳ Phase 3 — Content Factory (IN PROGRESS)
- AI episode generation pipeline
- Multi-app episodes (WhatsApp + Twitter + Instagram)
- Episode editor GUI
- Platform presets (TikTok/Shorts/Reels)

---

## 4. Package Structure

```
tokovo/
├── apps/
│   └── video-runner/              # Remotion app to render episodes
│
├── packages/
│   ├── core/                      # WorldState, TimelineEvent, replay engine
│   │   ├── types.ts               # All type definitions
│   │   ├── engine.ts              # replay(), processOSEvent, processKeyboardEvent
│   │   ├── plugin.ts              # PluginManager, TokovoPlugin
│   │   └── camera.ts              # Camera state computation
│   │
│   ├── dsl/                       # Centralized event factories (NEW)
│   │   └── events/
│   │       ├── keyboard.ts        # Keyboard events
│   │       ├── messages.ts        # Message events
│   │       ├── camera.ts          # Camera events
│   │       ├── audio.ts           # Audio events
│   │       ├── os.ts              # Device OS events
│   │       ├── touch.ts           # Touch gesture events
│   │       └── typing.ts          # generateTyping() humanizer
│   │
│   ├── devices/                   # Device profiles + deviceReducer
│   │   ├── StatusBar.tsx          # Reads from device.os
│   │   ├── iPhone16Frame.tsx      # Device frame
│   │   └── keyboards/             # IOSKeyboard with key pop-ups
│   │
│   ├── apps-whatsapp/             # WhatsApp runtime + UI
│   ├── apps-twitter/              # Twitter/X runtime + UI
│   │
│   ├── renderer/                  # TokovoRenderer + DeviceFrame
│   │   ├── TokovoRenderer.tsx     # Main renderer
│   │   ├── DeviceFrame.tsx        # Passes device to StatusBar
│   │   ├── AudioLayer.tsx         # Sound playback
│   │   └── TouchOverlay.tsx       # Gesture visualization
│   │
│   ├── episodes/                  # Example episodes (JSON definitions)
│   └── ir/                        # Scene IR + Timeline IR
│
├── docs/                          # Documentation (NEW)
│   ├── README.md                  # Index
│   ├── DSL.md                     # DSL API reference
│   ├── DEVICE_OS.md               # Device OS layer
│   ├── KEYBOARD.md                # Keyboard system
│   └── CAMERA_AUDIO.md            # Camera & audio
│
└── pnpm-workspace.yaml
```

---

## 5. Key Event Types

| Kind | Events | Purpose |
|------|--------|---------|
| DEVICE | LOCK, UNLOCK, OPEN_APP, CLOSE_APP | Device state |
| APP | MESSAGE_RECEIVED, TYPING_START, MESSAGE_STATUS | App logic |
| CAMERA | ZOOM, PAN, SHAKE, FOCUS, RESET | Cinematic effects |
| AUDIO | PLAY_SOUND, STOP_SOUND, FADE_VOLUME | Sound effects |
| KEYBOARD | SHOW, HIDE, TYPE_CHAR, BACKSPACE, CLEAR | Virtual keyboard |
| OS | SET_TIME, SET_BATTERY, SET_NETWORK, SET_DND | Status bar |
| TOUCH | TAP, LONG_PRESS, DRAG, SCROLL | Gesture visualization |

---

## 6. WorldState Structure

```typescript
interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    appState: Record<AppId, any>;
    camera: CameraState;
    audio: AudioState;
    touches?: TouchState[];
}

interface DeviceState {
    id: string;
    profileId: string;
    isLocked: boolean;
    foregroundAppId?: string;
    notifications: NotificationIR[];
    os?: DeviceOSState;        // NEW: Clock, battery, network, DND
    keyboard?: KeyboardState;   // NEW: Virtual keyboard state
}

interface DeviceOSState {
    clock: number;              // Unix timestamp
    battery: number;            // 0-100
    charging: boolean;
    network: NetworkType;       // "wifi" | "5G" | "4G" | "LTE"
    wifiStrength: number;       // 0-3
    cellStrength: number;       // 0-4
    dnd: boolean;
    lowPowerMode: boolean;
    airplaneMode: boolean;
}
```

---

## 7. DSL Usage Example

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";

const events = [
    // Device OS
    dsl.os.setTime(0, Date.now()),
    dsl.os.setBattery(0, 87),
    
    // Keyboard + typing
    dsl.keyboard.show(30, "phone"),
    ...generateTyping(50, "phone", "Hello!", { speed: "casual" }),
    
    // Messages
    dsl.messages.send(150, "dm_friend", "Hello!"),
    dsl.messages.markDelivered(180, "dm_friend", "msg_1"),
    dsl.messages.markRead(210, "dm_friend", "msg_1"),
    
    // Camera
    dsl.camera.zoom(220, 1.2, 30, { originY: 0.7 }),
    
    // Audio
    dsl.audio.play(220, "message_sent", 0.8),
    
    // Hide keyboard
    dsl.keyboard.hide(250, "phone"),
    dsl.keyboard.clear(255, "phone"),
];
```

---

## 8. Architectural Principles

1. **Determinism is Sacred**: `Frame = f(initialWorld, events, t)`
2. **Layers Do Not Cross**: DSL → IR → Engine → Renderer
3. **Story Beats Technology**: Writers write intent, not implementation
4. **Plugin Architecture**: Apps are plugins, not hardcoded
5. **AI is Primary User**: Structured output, validation, constraints

---

## 9. Documentation

| Document | Purpose |
|----------|---------|
| [docs/README.md](./docs/README.md) | Documentation index |
| [docs/DSL.md](./docs/DSL.md) | DSL API reference |
| [docs/DEVICE_OS.md](./docs/DEVICE_OS.md) | Device OS layer |
| [docs/KEYBOARD.md](./docs/KEYBOARD.md) | Keyboard system |
| [docs/CAMERA_AUDIO.md](./docs/CAMERA_AUDIO.md) | Camera & audio |
| [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md) | Design principles |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guide |

---

## 10. Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm turbo dev --filter=video-runner

# Open http://localhost:3000
# Select "FullRealityShowcase" to see all features
```
