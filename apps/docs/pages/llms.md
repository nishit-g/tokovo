# Tokovo - LLM Complete Reference

> A programmable phone-simulation engine for cinematic video storytelling.
> Version: 1.0.0
> Last Updated: 2024-12-14

---

## QUICK START

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";

// Create episode
const episode = {
    initialWorld: { /* WorldState */ },
    events: [
        dsl.messages.receive(60, "dm_alice", "Alice", "Hey!"),
        dsl.keyboard.show(90, "phone"),
        ...generateTyping(100, "phone", "Hi there!"),
        dsl.messages.send(180, "dm_alice", "Hi there!"),
        dsl.camera.zoom(200, 1.2, 30),
    ]
};

// Render at frame N
const worldAtFrame = replay(episode.initialWorld, episode.events, frameN);
```

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOKOVO ENGINE                            │
├─────────────────────────────────────────────────────────────────┤
│  Episode (JSON/TS)                                               │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────┐                                             │
│  │   Core Engine   │  replay(initialWorld, events, frame)       │
│  │   @tokovo/core  │                                             │
│  └────────┬────────┘                                             │
│           │ WorldState at frame N                                │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │    Renderer     │  TokovoRenderer                             │
│  │ @tokovo/renderer│                                             │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │    Remotion     │  Video output                               │
│  │                 │                                             │
│  └─────────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Deterministic** - At any frame `t`, world state is reproducible
2. **Composable** - Add devices/apps without modifying core
3. **Data-driven** - Episodes define everything; no hidden state
4. **Cinematic** - Optimized for rendering, not interaction

---

## PACKAGES

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@tokovo/core` | Engine, types, state management | `replay()`, `WorldState`, `TimelineEvent`, `PluginManager` |
| `@tokovo/dsl` | Event factories for authoring | `dsl`, `generateTyping` |
| `@tokovo/renderer` | React rendering layer | `TokovoRenderer`, `AudioLayer`, `DeviceFrame` |
| `@tokovo/devices` | Device profiles, StatusBar, Keyboard | `iPhone16Profile`, `IOSKeyboard`, `StatusBar` |
| `@tokovo/apps-whatsapp` | WhatsApp chat UI | `WhatsAppApp` |
| `@tokovo/apps-phone` | Phone call simulation | `PhoneApp` |
| `@tokovo/apps-twitter` | Twitter/X UI | `TwitterApp` |
| `@tokovo/apps-instagram` | Instagram UI | `InstagramApp` |
| `@tokovo/apps-spotify` | Spotify UI | `SpotifyApp` |
| `@tokovo/compiler` | Scene compilation | `compile()` |
| `@tokovo/ir` | Intermediate representation | Scene IR types |

---

## DSL EVENTS REFERENCE

### Import

```typescript
import { dsl, generateTyping, TYPING_SPEEDS } from "@tokovo/dsl";
```

### All Event Types

| Module | Method | Signature |
|--------|--------|-----------|
| **keyboard** | `show` | `(at, deviceId, layout?)` |
| | `hide` | `(at, deviceId)` |
| | `typeChar` | `(at, deviceId, char)` |
| | `backspace` | `(at, deviceId)` |
| | `clear` | `(at, deviceId)` |
| **messages** | `send` | `(at, conversationId, text)` |
| | `receive` | `(at, conversationId, from, text)` |
| | `typingStart` | `(at, conversationId, from)` |
| | `typingEnd` | `(at, conversationId, from)` |
| | `sendImage` | `(at, conversationId, imageUrl, caption?)` |
| | `receiveImage` | `(at, conversationId, from, imageUrl, caption?)` |
| | `markSent` | `(at, conversationId, messageId)` |
| | `markDelivered` | `(at, conversationId, messageId)` |
| | `markRead` | `(at, conversationId, messageId)` |
| **camera** | `zoom` | `(at, scale, duration, opts?)` |
| | `pan` | `(at, translateX, translateY, duration)` |
| | `shake` | `(at, intensity, duration, opts?)` |
| | `reset` | `(at, duration)` |
| **audio** | `play` | `(at, soundId, volume?, opts?)` |
| | `stop` | `(at, instanceId)` |
| | `fade` | `(at, instanceId, toVolume, duration)` |
| | `backgroundMusic` | `(at, soundId, volume?, loop?)` |
| **os** | `setTime` | `(at, timestamp, deviceId?)` |
| | `setBattery` | `(at, level, charging?, deviceId?)` |
| | `setNetwork` | `(at, network, strength?, deviceId?)` |
| | `setDND` | `(at, enabled, deviceId?)` |
| | `setLowPower` | `(at, enabled, deviceId?)` |
| | `setAirplane` | `(at, enabled, deviceId?)` |
| **touch** | `tap` | `(at, x, y, deviceId?)` |
| | `longPress` | `(at, x, y, duration, deviceId?)` |
| | `drag` | `(at, startX, startY, endX, endY, duration)` |
| | `scroll` | `(at, y, velocity?, deviceId?)` |
| **call** | `incoming` | `(at, callerId, callerName, opts?)` |
| | `answer` | `(at, deviceId?)` |
| | `decline` | `(at, deviceId?)` |
| | `end` | `(at, deviceId?)` |
| | `toggleMute` | `(at, deviceId?)` |
| | `toggleSpeaker` | `(at, deviceId?)` |
| | `toggleHold` | `(at, deviceId?)` |

### Typing Simulation

```typescript
generateTyping(startFrame, deviceId, text, options?)
```

**Options:**
- `speed`: `"slow"` | `"normal"` | `"casual"` | `"fast"` | `"burst"`
- `typoPositions`: `number[]` - indices where typos occur

**Typing Speeds:**
| Speed | Frames/Char |
|-------|-------------|
| slow | 12 |
| normal | 8 |
| casual | 6 |
| fast | 4 |
| burst | 2 |

---

## WORLD STATE STRUCTURE

```typescript
interface WorldState {
    devices: Record<string, DeviceState>;
    conversations: Record<string, ConversationState>;
    appState: Record<string, any>;
    camera: CameraState;
    audio: AudioState;
}

interface DeviceState {
    id: string;
    profileId: string;                 // "iphone16", "pixel8", etc.
    isLocked: boolean;
    foregroundAppId: string;           // "app_whatsapp", "app_phone", etc.
    notifications: Notification[];
    os: DeviceOSState;
    keyboard?: KeyboardState;
    call?: CallState;
}

interface DeviceOSState {
    clock: number;                     // Unix timestamp ms
    battery: number;                   // 0-100
    charging: boolean;
    network: NetworkType;              // "wifi", "5G", "4G", "LTE", "3G", "no-service"
    wifiStrength: number;              // 0-3
    cellStrength: number;              // 0-4
    dnd: boolean;                      // Do Not Disturb
    lowPowerMode: boolean;
    airplaneMode: boolean;
}

interface CallState {
    status: "incoming" | "ringing" | "connecting" | "active" | "ended" | "declined";
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo: boolean;
    callType: "voice" | "video" | "facetime";
    displayMode: "fullscreen" | "overlay" | "minimized";
    startedAt?: number;               // Frame when call started
    answeredAt?: number;              // Frame when answered
    isMuted?: boolean;
    isSpeakerOn?: boolean;
    isOnHold?: boolean;
    callerMetadata?: {
        posterImage?: string;         // Full-screen contact poster (iOS 17+)
        posterStyle?: string;
        posterNameFont?: string;
    };
}

interface ConversationState {
    id: string;
    type: "dm" | "group";
    name: string;
    messages: Message[];
    typing: Record<string, boolean>;
}
```

---

## APPS (PLUGINS)

### WhatsApp (`@tokovo/apps-whatsapp`)

**App ID:** `app_whatsapp`

**Screens:**
- `chat` - Chat view with messages
- `chatList` - List of conversations

**Features:**
- Message bubbles (text, image, voice)
- Typing indicators
- Read receipts (ticks)
- Group chats
- Emoji reactions

**Usage:**
```typescript
foregroundAppId: "app_whatsapp"
appState: {
    app_whatsapp: {
        screen: "chat",
        conversationId: "dm_friend"
    }
}
```

### Phone (`@tokovo/apps-phone`)

**App ID:** `app_phone`

**Features:**
- Incoming call screens (iOS 17 Contact Poster, Classic slide-to-answer)
- Active call with controls (mute, speaker, keypad)
- Dynamic Island widget
- Notification banner mode
- Platform variants (iOS/Android)

**Usage:**
```typescript
dsl.call.incoming(0, "alice", "Alice Johnson", {
    displayMode: "fullscreen",
    posterImage: "https://example.com/alice.jpg"
});
dsl.call.answer(120);
dsl.call.toggleMute(180);
dsl.call.end(300);
```

### Twitter/X (`@tokovo/apps-twitter`)

**App ID:** `app_twitter`

**Features:**
- Tweet composition
- Timeline feed
- Profile views
- Like/Retweet animations

### Instagram (`@tokovo/apps-instagram`)

**App ID:** `app_instagram`

**Features:**
- Feed posts
- Stories
- DMs
- Reels

### Spotify (`@tokovo/apps-spotify`)

**App ID:** `app_spotify`

**Features:**
- Now Playing
- Playlists
- Mini player

---

## DEVICES

### Device Profiles

| Profile ID | Device | Dimensions | Platform |
|------------|--------|------------|----------|
| `iphone16` | iPhone 16 Pro | 1290×2796 | iOS |
| `iphone15` | iPhone 15 Pro | 1290×2796 | iOS |
| `iphone14` | iPhone 14 | 1170×2532 | iOS |
| `pixel8` | Pixel 8 | 1080×2400 | Android |
| `pixel7` | Pixel 7 | 1080×2400 | Android |
| `s24` | Samsung S24 | 1080×2340 | Android |

### Status Bar Elements

- Clock (dynamic via `dsl.os.setTime`)
- Battery (level + charging indicator)
- Network (WiFi bars / cellular signal)
- DND indicator (moon icon)

### Keyboard

- QWERTY layout
- Emoji keyboard
- Numeric keypad
- Key pop-ups on press
- Realistic typing simulation

---

## CAMERA SYSTEM

### Effects

| Effect | Description | Parameters |
|--------|-------------|------------|
| `zoom` | Scale view | `scale`, `duration`, `originX`, `originY` |
| `pan` | Translate view | `translateX`, `translateY`, `duration` |
| `shake` | Handheld effect | `intensity`, `duration`, `frequency`, `decay` |
| `reset` | Return to default | `duration` |

### Example

```typescript
// Dramatic reveal
dsl.camera.zoom(0, 1.3, 30, { originY: 0.8 }),    // Zoom into message
dsl.camera.shake(100, 5, 15),                     // Impact shake
dsl.camera.reset(150, 25),                        // Smooth reset
```

---

## AUDIO SYSTEM

### Sound IDs

| Category | Sound IDs |
|----------|-----------|
| WhatsApp | `whatsapp_sent`, `whatsapp_received` |
| Phone | `ringtone`, `call_end`, `dial_tone` |
| System | `notification`, `keyboard_click` |

### Buses

- `music` - Background music
- `sfx` - Sound effects
- `voice` - Voice/calls
- `ui` - UI sounds

---

## COMPLETE EXAMPLE

```typescript
import { dsl, generateTyping } from "@tokovo/dsl";
import { WorldState, TimelineEvent, DEFAULT_BUS_CONFIG } from "@tokovo/core";

const DEVICE_ID = "phone";
const CONVO_ID = "dm_friend";

function createEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const START_TIME = new Date();
    START_TIME.setHours(14, 45, 0, 0);

    const initialWorld: WorldState = {
        devices: {
            [DEVICE_ID]: {
                id: DEVICE_ID,
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
                os: {
                    clock: START_TIME.getTime(),
                    battery: 87,
                    charging: false,
                    network: "wifi",
                    wifiStrength: 3,
                    cellStrength: 4,
                    dnd: false,
                    lowPowerMode: false,
                    airplaneMode: false,
                },
            },
        },
        conversations: {
            [CONVO_ID]: {
                id: CONVO_ID,
                type: "dm",
                name: "Friend",
                messages: [
                    { id: "msg_1", type: "text", from: "Friend", text: "Hey!", status: "read" },
                ],
                typing: {},
            },
        },
        appState: {
            app_whatsapp: { screen: "chat", conversationId: CONVO_ID },
        },
        camera: {
            baseView: "APP_VIEW",
            activeDeviceId: DEVICE_ID,
            layout: { mode: "SINGLE", primaryDeviceId: DEVICE_ID },
            activeEffects: [],
            transform: {
                translateX: 0, translateY: 0, scale: 1, rotation: 0,
                originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: { activeSounds: {}, buses: DEFAULT_BUS_CONFIG },
    };

    const events: TimelineEvent[] = [
        // Scene 1: Friend typing
        dsl.messages.typingStart(0, CONVO_ID, "Friend"),
        dsl.camera.zoom(20, 1.1, 20, { originY: 0.7 }),
        
        // Message arrives
        dsl.messages.typingEnd(60, CONVO_ID, "Friend"),
        dsl.messages.receive(60, CONVO_ID, "Friend", "What are you up to?"),
        dsl.audio.play(60, "whatsapp_received"),
        
        // Scene 2: User responds
        dsl.camera.reset(80, 15),
        dsl.keyboard.show(90, DEVICE_ID),
        ...generateTyping(110, DEVICE_ID, "Not much, just chilling", { speed: "casual" }),
        dsl.messages.send(200, CONVO_ID, "Not much, just chilling"),
        dsl.audio.play(200, "whatsapp_sent"),
        dsl.keyboard.hide(210, DEVICE_ID),
        
        // Battery drains
        dsl.os.setBattery(250, 86),
        dsl.os.setTime(250, START_TIME.getTime() + 10000),
    ];

    return { initialWorld, events };
}
```

---

## VIDEO COMPONENT TEMPLATE

```tsx
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, createEventIndex } from "@tokovo/core";
import { TokovoRenderer, AudioLayer } from "@tokovo/renderer";

export const MyVideo: React.FC = () => {
    const frame = useCurrentFrame();
    
    const episode = useMemo(() => createEpisode(), []);
    const eventIndex = useMemo(() => createEventIndex(episode.events), [episode.events]);
    const world = replay(episode.initialWorld, episode.events, frame);
    
    return (
        <AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
            <AudioLayer world={world} t={frame} />
            <TokovoRenderer
                world={world}
                t={frame}
                eventIndex={eventIndex}
                directorEnabled={true}
            />
        </AbsoluteFill>
    );
};
```

---

## FILE STRUCTURE

```
tokovo/
├── apps/
│   ├── docs/              # Nextra documentation site
│   └── video-runner/      # Remotion video app
├── packages/
│   ├── core/              # Engine, types, replay()
│   ├── dsl/               # Event factories
│   ├── renderer/          # TokovoRenderer, DeviceFrame
│   ├── devices/           # Device profiles, StatusBar, Keyboard
│   ├── apps-whatsapp/     # WhatsApp plugin
│   ├── apps-phone/        # Phone call plugin
│   ├── apps-twitter/      # Twitter plugin
│   ├── apps-instagram/    # Instagram plugin
│   ├── apps-spotify/      # Spotify plugin
│   ├── compiler/          # Scene compiler
│   ├── ir/                # Intermediate representation
│   └── adapters/          # Platform adapters
└── docs/                  # Markdown documentation
```

---

## COMMON PATTERNS

### Typo and Correction

```typescript
...generateTyping(0, "phone", "helo"),           // Type with typo
dsl.keyboard.backspace(50, "phone"),              // Backspace
...generateTyping(55, "phone", "Hello!"),         // Retype correctly
```

### Incoming Call Flow

```typescript
dsl.call.incoming(0, "caller_id", "Caller Name", { posterImage: "url" }),
dsl.call.answer(120),
dsl.call.toggleMute(180),
dsl.call.toggleSpeaker(210),
dsl.call.end(300),
```

### Message Exchange

```typescript
dsl.messages.typingStart(0, "dm_id", "Friend"),
dsl.messages.typingEnd(60, "dm_id", "Friend"),
dsl.messages.receive(60, "dm_id", "Friend", "Hey!"),
dsl.keyboard.show(90, "phone"),
...generateTyping(100, "phone", "Hi!"),
dsl.messages.send(180, "dm_id", "Hi!"),
```

### Dramatic Camera Work

```typescript
dsl.camera.zoom(0, 1.2, 30, { originY: 0.8 }),    // Zoom in
dsl.camera.shake(100, 8, 20),                     // Impact
dsl.camera.pan(150, 50, 0, 25),                   // Pan right
dsl.camera.reset(200, 30),                        // Reset
```

---

## API REFERENCE LINKS

- Core Types: `@tokovo/core/src/types.ts`
- DSL Events: `@tokovo/dsl/src/events/`
- Device Profiles: `@tokovo/devices/src/profiles/`
- Renderer: `@tokovo/renderer/src/TokovoRenderer.tsx`

---

> Generated for LLM consumption. Use this document to understand Tokovo capabilities.
