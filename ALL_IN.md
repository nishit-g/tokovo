# 📖 TOKOVO: THE COMPLETE BIBLE

> **Everything you need to know about building viral phone videos with code.**

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Package Structure](#package-structure)
4. [Core Concepts](#core-concepts)
5. [WorldState Deep Dive](#worldstate-deep-dive)
6. [Timeline Event System](#timeline-event-system)
7. [Episode Creation Guide](#episode-creation-guide)
8. [Device System](#device-system)
9. [App System](#app-system)
10. [Camera System](#camera-system)
11. [Audio System](#audio-system)
12. [Multi-Device & POV](#multi-device--pov)
13. [Renderer Architecture](#renderer-architecture)
14. [Creating New Apps](#creating-new-apps)
15. [Quick Reference](#quick-reference)

---

# Philosophy

Tokovo is a **declarative video engine**. You describe **what happens** (events), and the engine figures out **how to render it**.

```
Episode JSON → Engine (replay) → WorldState → Renderer → Video Frame
```

Think of it like React for videos:
- **WorldState** = Component State
- **Timeline Events** = Actions/Reducers
- **Engine** = Redux Store
- **Renderer** = React Components
- **Episode** = Your App's Data

---

# Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VIDEO RUNNER (Remotion)                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     MultiDeviceRenderer                      │   │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │   AudioLayer    │  │       TokovoRenderer            │   │   │
│  │  │  (sounds/music) │  │  ┌─────────────────────────────┐│   │   │
│  │  └─────────────────┘  │  │       DeviceFrame          ││   │   │
│  │                       │  │  ┌─────────────────────────┐││   │   │
│  │                       │  │  │      App View           │││   │   │
│  │                       │  │  │  (WhatsApp/Instagram)   │││   │   │
│  │                       │  │  └─────────────────────────┘││   │   │
│  │                       │  │  ┌─────────────────────────┐││   │   │
│  │                       │  │  │     Notification        │││   │   │
│  │                       │  │  │       Overlays          │││   │   │
│  │                       │  │  └─────────────────────────┘││   │   │
│  │                       │  └─────────────────────────────┘│   │   │
│  │                       └─────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                    ┌───────────────┴───────────────┐
                    │         ENGINE (replay)        │
                    │  Applies events to WorldState  │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │         EPISODE JSON           │
                    │   initialWorld + events[]      │
                    └───────────────────────────────┘
```

---

# Package Structure

```
tokovo/
├── apps/
│   └── video-runner/          # Remotion video project
│       ├── src/
│       │   ├── Root.tsx       # Composition registry
│       │   └── *Video.tsx     # Video wrappers for episodes
│       └── public/
│           └── sounds/        # Audio files (MP3s)
│
└── packages/
    ├── core/                  # 🧠 Brain - Types, Engine, Camera
    │   └── src/
    │       ├── types.ts       # ALL type definitions
    │       ├── engine.ts      # replay() function
    │       ├── camera/        # Camera controller
    │       ├── tokens.ts      # Design tokens (iOS/Android)
    │       └── sounds.ts      # Sound ID registry
    │
    ├── renderer/              # 🎨 Visual - React components
    │   └── src/
    │       ├── TokovoRenderer.tsx      # Main device renderer
    │       ├── MultiDeviceRenderer.tsx # Multi-device layouts
    │       ├── DeviceFrame.tsx         # Phone bezel
    │       ├── AudioLayer.tsx          # Sound playback
    │       ├── layout/                 # Layout computation
    │       └── registry.ts             # App → Component mapping
    │
    ├── devices/               # 📱 Device profiles
    │   └── src/
    │       ├── iphone16.ts    # iPhone 16 dimensions/notch
    │       └── pixel.ts       # Google Pixel
    │
    ├── episodes/              # 📝 Story data
    │   └── src/
    │       └── examples/      # JSON episode files
    │
    ├── apps-whatsapp/         # 💬 WhatsApp clone
    │   └── src/
    │       ├── ui.tsx         # UI components
    │       └── runtime.ts     # Event reducer
    │
    └── apps-instagram/        # 📸 Instagram clone
        └── src/
            ├── views/         # Feed, Story, DM views
            └── runtime.ts     # Event reducer
```

---

# Core Concepts

## The Golden Rule

> **Frame = f(initialWorld, events, t)**

At any frame `t`, the video's state is computed by:
1. Starting with `initialWorld`
2. Applying all events where `event.at <= t`
3. Rendering the resulting `WorldState`

This is **deterministic** - same input always produces same output.

## Key Types

| Type | Description |
|------|-------------|
| `WorldState` | Complete state of everything at a point in time |
| `TimelineEvent` | Something that happens at a specific frame |
| `DeviceState` | One phone's state (locked, apps, notifications) |
| `ConversationState` | Chat messages, typing indicators |
| `CameraState` | Zoom, pan, shake effects |
| `AudioState` | Playing sounds, background music |

---

# WorldState Deep Dive

The `WorldState` is the **single source of truth**:

```typescript
interface WorldState {
    devices: Record<DeviceId, DeviceState>;       // All phones
    conversations: Record<ConversationId, ConversationState>;  // All chats
    appState: Record<AppId, any>;                 // App-specific state
    camera: CameraState;                          // Camera effects
    audio: AudioState;                            // Active sounds
}
```

## DeviceState

```typescript
interface DeviceState {
    id: string;                    // "alice_phone"
    profileId: string;             // "iphone16" | "pixel"
    ownerName?: string;            // "Alice" - for POV alignment
    isLocked: boolean;             // Show lockscreen?
    foregroundAppId?: string;      // "app_whatsapp"
    notifications: Notification[]; // Pending notifications
    call?: CallState;              // Incoming/active call
    homeScreen?: HomeScreenConfig; // App grid layout
}
```

## ConversationState

```typescript
interface ConversationState {
    id: string;
    type?: "dm" | "group";
    name?: string;                 // Contact/group name
    avatar?: string;
    members?: GroupMember[];       // For groups
    messages: Message[];
    typing?: Record<string, boolean>;
}
```

## Message

```typescript
interface Message {
    id: string;
    from: string;                  // Sender name or "me"
    text?: string;
    type?: "text" | "image" | "voice" | "system" | "deleted";
    status?: "sent" | "delivered" | "read";
    timestamp?: string;            // "10:42 AM"
}
```

---

# Timeline Event System

Events are the **heartbeat** of your video. Every change happens via an event.

## Event Structure

```typescript
{
    at: number;      // Frame number (0 = start)
    kind: string;    // "DEVICE" | "APP" | "CAMERA" | "AUDIO"
    type: string;    // Event-specific type
    // ... other properties
}
```

## Event Categories

### 🔧 DEVICE Events

Control the phone itself:

| Event | Description |
|-------|-------------|
| `LOCK` | Lock the device |
| `UNLOCK` | Unlock the device |
| `OPEN_APP` | Open an app |
| `CLOSE_APP` | Close current app |
| `GO_HOME` | Go to home screen |
| `SHOW_NOTIFICATION` | Show a notification |
| `DISMISS_NOTIFICATION` | Dismiss notification |
| `INCOMING_CALL` | Show call UI |
| `CALL_ANSWERED` | Start active call |
| `CALL_ENDED` | End call |

```json
{ "at": 30, "kind": "DEVICE", "deviceId": "alice_phone", "type": "UNLOCK" }
{ "at": 60, "kind": "DEVICE", "deviceId": "alice_phone", "type": "OPEN_APP", "appId": "app_whatsapp" }
```

### 💬 APP Events

Control app content:

| Event | Description |
|-------|-------------|
| `MESSAGE_RECEIVED` | New message in chat |
| `MESSAGE_READ` | Mark message as read |
| `TYPING_START` | Show typing indicator |
| `TYPING_END` | Hide typing indicator |
| `VOICE_MESSAGE_RECEIVED` | Voice message |

```json
{
    "at": 90,
    "kind": "APP",
    "appId": "app_whatsapp",
    "type": "MESSAGE_RECEIVED",
    "conversationId": "chat_1",
    "from": "Alice",
    "message": {
        "id": "m1",
        "type": "text",
        "text": "Hey! 👋",
        "status": "delivered"
    }
}
```

### 🎥 CAMERA Events

Cinematic effects:

| Event | Description |
|-------|-------------|
| `ZOOM` | Zoom in/out to a point |
| `PAN` | Move camera position |
| `SHAKE` | Dramatic shake effect |
| `FOCUS` | Focus on element |
| `RESET` | Return to normal |
| `CUT` | Switch to another device |
| `LAYOUT` | Change multi-device layout |

```json
{ "at": 120, "kind": "CAMERA", "type": "ZOOM", "scale": 1.3, "originX": 0.5, "originY": 0.7, "duration": 30, "easing": "easeOut" }
{ "at": 200, "kind": "CAMERA", "type": "SHAKE", "intensity": 8, "frequency": 16, "duration": 20 }
{ "at": 300, "kind": "CAMERA", "type": "LAYOUT", "mode": "SPLIT_HORIZONTAL", "primaryDeviceId": "alice_phone", "secondaryDeviceId": "bob_phone" }
```

### 🔊 AUDIO Events

Sound effects and music:

| Event | Description |
|-------|-------------|
| `PLAY_SOUND` | Play a sound effect |
| `STOP_SOUND` | Stop a playing sound |
| `FADE_VOLUME` | Fade sound volume |
| `BACKGROUND_MUSIC` | Set background track |

```json
{ "at": 30, "kind": "AUDIO", "type": "PLAY_SOUND", "soundId": "whatsapp_received" }
{ "at": 0, "kind": "AUDIO", "type": "BACKGROUND_MUSIC", "soundId": "suspense", "volume": 0.3 }
```

---

# Episode Creation Guide

An episode is a JSON file with two parts: `initialWorld` and `events`.

## Minimal Episode

```json
{
    "meta": {
        "title": "My First Episode",
        "fps": 30,
        "durationInFrames": 300
    },
    "initialWorld": {
        "devices": {
            "phone_1": {
                "id": "phone_1",
                "profileId": "iphone16",
                "ownerName": "You",
                "isLocked": false,
                "foregroundAppId": "app_whatsapp",
                "notifications": []
            }
        },
        "conversations": {
            "chat_1": {
                "id": "chat_1",
                "type": "dm",
                "name": "Alice",
                "messages": []
            }
        },
        "appState": {
            "app_whatsapp": {
                "screen": "chat",
                "conversationId": "chat_1"
            }
        },
        "camera": {
            "baseView": "APP_VIEW",
            "activeDeviceId": "phone_1",
            "layout": { "mode": "SINGLE", "primaryDeviceId": "phone_1" },
            "activeEffects": [],
            "transform": { "translateX": 0, "translateY": 0, "scale": 1, "rotation": 0, "originX": 0.5, "originY": 0.5, "shakeX": 0, "shakeY": 0 },
            "deviceTransforms": {}
        },
        "audio": { "activeSounds": {} }
    },
    "events": [
        {
            "at": 30,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "chat_1",
            "from": "Alice",
            "message": { "id": "m1", "type": "text", "text": "Hey!", "status": "delivered" }
        }
    ]
}
```

## Episode Checklist

- [ ] Set `meta.fps` (usually 30)
- [ ] Set `meta.durationInFrames` (fps × seconds)
- [ ] Define at least one device in `devices`
- [ ] Set device `profileId` ("iphone16", "pixel")
- [ ] Set device `ownerName` for POV alignment
- [ ] Create conversations with initial messages
- [ ] Set `camera.layout.primaryDeviceId`
- [ ] Add `audio` state (even if empty)
- [ ] Add events in chronological order by `at`

## Timing Reference

At 30 FPS:
| Time | Frames |
|------|--------|
| 1 second | 30 |
| 5 seconds | 150 |
| 10 seconds | 300 |
| 30 seconds | 900 |
| 1 minute | 1800 |

---

# Device System

## Device Profiles

Stored in `packages/devices/`:

```typescript
export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    name: "iPhone 16",
    dimensions: { width: 1179, height: 2556 },
    bezel: { radius: 160, padding: 0 },
    notch: { type: "dynamic-island", width: 370, height: 120 },
    homeIndicator: { width: 420, height: 15 },
};
```

| Profile | Dimensions | Features |
|---------|------------|----------|
| `iphone16` | 1179×2556 | Dynamic Island |
| `pixel` | 1080×2340 | Punch-hole camera |

## Device Resolution

The renderer automatically scales devices to fit the composition while maintaining aspect ratio.

---

# App System

## App Registry

Apps are registered in `packages/renderer/src/registry.ts`:

```typescript
export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView,
        "app_instagram": InstagramApp,
    },
    getView(appId: string) {
        return this.views[appId];
    }
};
```

## App Components

Each app provides:
1. **UI Component** - React component that renders the app
2. **Runtime Reducer** - Handles events for this app

### WhatsApp Structure

```
packages/apps-whatsapp/
├── ui.tsx           # WhatsappChatView, MessageBubble, Header, etc.
├── runtime.ts       # whatsappReducer - handles MESSAGE_RECEIVED, etc.
├── types.ts         # WhatsApp-specific types
└── TypingBubble.tsx # Animated typing indicator
```

### Runtime Reducer Pattern

```typescript
export function whatsappReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_whatsapp") return;

    switch (event.type) {
        case "MESSAGE_RECEIVED":
            const conversation = draft.conversations[event.conversationId];
            conversation.messages.push({
                id: event.message.id,
                from: event.from,
                text: event.message.text,
                type: event.message.type,
                status: event.message.status,
            });
            break;
        // ... other cases
    }
}

// Register the reducer
ReducerRegistry.registerAppReducer("app_whatsapp", whatsappReducer);
```

---

# Camera System

The camera system provides cinematic effects.

## Camera Transform

```typescript
interface CameraTransform {
    translateX: number;  // Horizontal offset (px)
    translateY: number;  // Vertical offset (px)
    scale: number;       // Zoom level (1 = normal)
    rotation: number;    // Rotation (degrees)
    originX: number;     // Transform origin X (0-1)
    originY: number;     // Transform origin Y (0-1)
    shakeX: number;      // Shake offset X
    shakeY: number;      // Shake offset Y
}
```

## Effect Types

### ZOOM

```json
{
    "at": 60,
    "kind": "CAMERA",
    "type": "ZOOM",
    "scale": 1.5,
    "originX": 0.5,
    "originY": 0.8,
    "duration": 30,
    "easing": "easeInOut"
}
```

### SHAKE

```json
{
    "at": 120,
    "kind": "CAMERA",
    "type": "SHAKE",
    "intensity": 10,
    "frequency": 20,
    "decay": 0.95,
    "duration": 30
}
```

### PAN

```json
{
    "at": 180,
    "kind": "CAMERA",
    "type": "PAN",
    "translateX": 100,
    "translateY": -50,
    "duration": 45,
    "easing": "easeOut"
}
```

## Per-Device Camera

Add `deviceId` to target specific devices:

```json
{
    "at": 200,
    "kind": "CAMERA",
    "type": "SHAKE",
    "deviceId": "alice_phone",
    "intensity": 15,
    "frequency": 20,
    "duration": 20
}
```

Only Alice's phone shakes; other devices stay still.

---

# Audio System

## Sound Registry

In `packages/core/src/sounds.ts`:

```typescript
export const SOUND_REGISTRY: Record<string, string> = {
    "whatsapp_sent": "whatsapp-sent.mp3",
    "whatsapp_received": "whatsapp-received.mp3",
    "notification": "notification.mp3",
    "ringtone": "ringtone.mp3",
    // ...
};
```

## Sound Files

Place MP3 files in: `apps/video-runner/public/sounds/`

## Playing Sounds

```json
{ "at": 30, "kind": "AUDIO", "type": "PLAY_SOUND", "soundId": "whatsapp_received" }
```

## Background Music

```json
{ "at": 0, "kind": "AUDIO", "type": "BACKGROUND_MUSIC", "soundId": "suspense", "volume": 0.3, "loop": true }
```

## Per-Device Sound

```json
{ "at": 50, "kind": "AUDIO", "type": "PLAY_SOUND", "soundId": "notification", "deviceId": "alice_phone" }
```

---

# Multi-Device & POV

## Layout Modes

| Mode | Description |
|------|-------------|
| `SINGLE` | One device fills frame |
| `SPLIT_HORIZONTAL` | Two devices side-by-side |
| `SPLIT_VERTICAL` | Two devices stacked |
| `PIP` | Main device + mini overlay |

## Layout Event

```json
{
    "at": 180,
    "kind": "CAMERA",
    "type": "LAYOUT",
    "mode": "SPLIT_HORIZONTAL",
    "primaryDeviceId": "alice_phone",
    "secondaryDeviceId": "bob_phone"
}
```

## POV Message Alignment

Messages align based on `device.ownerName`:
- On Alice's phone → Alice's messages on **right** (green)
- On Bob's phone → Bob's messages on **right** (green)

In split view, you see both perspectives simultaneously!

---

# Renderer Architecture

## TokovoRenderer

The main workhorse. Renders ONE device.

```
TokovoRenderer
├── DeviceFrame (bezel + notch)
│   ├── AppView (WhatsApp/Instagram)
│   ├── NotificationOverlay
│   ├── HeadsUpNotification
│   ├── CallOverlay
│   └── LockscreenView
└── Camera Transform (zoom, pan, shake)
```

## MultiDeviceRenderer

Orchestrates multiple TokovoRenderers:

```
MultiDeviceRenderer
├── AudioLayer (global sounds)
└── Layout Component
    ├── SingleDeviceLayout
    ├── SplitHorizontalLayout
    ├── SplitVerticalLayout
    └── PIPLayout
```

## Rendering Pipeline

```
1. Episode loaded
2. Remotion calls component at each frame
3. replay(initialWorld, events, t) → WorldState
4. MultiDeviceRenderer receives WorldState
5. Layout mode determines arrangement
6. Each TokovoRenderer renders its device
7. Camera transforms applied
8. Frame captured → Video
```

---

# Creating New Apps

## Step 1: Create Package

```bash
mkdir -p packages/apps-myapp/src
```

## Step 2: Define UI

```typescript
// packages/apps-myapp/src/ui.tsx
import React from "react";
import { WorldState } from "@tokovo/core";

export const MyAppView: React.FC<{
    world: WorldState;
    t: number;
    deviceId?: string;
}> = ({ world, t, deviceId }) => {
    return (
        <div style={{ background: "#fff", height: "100%" }}>
            {/* Your app UI */}
        </div>
    );
};
```

## Step 3: Create Runtime

```typescript
// packages/apps-myapp/src/runtime.ts
import { WorldState, TimelineEvent, ReducerRegistry } from "@tokovo/core";

export function myappReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_myapp") return;
    
    switch (event.type) {
        case "CUSTOM":
            // Handle custom events
            break;
    }
}

ReducerRegistry.registerAppReducer("app_myapp", myappReducer);
```

## Step 4: Register App

```typescript
// packages/renderer/src/registry.ts
import { MyAppView } from "@tokovo/apps-myapp";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView,
        "app_instagram": InstagramApp,
        "app_myapp": MyAppView,  // Add here
    },
    // ...
};
```

## Step 5: Use in Episode

```json
{
    "devices": {
        "phone": {
            "foregroundAppId": "app_myapp"
        }
    }
}
```

---

# Quick Reference

## Frame Timing (30 FPS)

| Frames | Time |
|--------|------|
| 1 | 0.033s |
| 15 | 0.5s |
| 30 | 1s |
| 60 | 2s |
| 90 | 3s |
| 150 | 5s |
| 300 | 10s |
| 900 | 30s |

## Event Cheat Sheet

```json
// Unlock device
{ "at": 0, "kind": "DEVICE", "deviceId": "phone", "type": "UNLOCK" }

// Open app
{ "at": 30, "kind": "DEVICE", "deviceId": "phone", "type": "OPEN_APP", "appId": "app_whatsapp" }

// Receive message
{ "at": 60, "kind": "APP", "appId": "app_whatsapp", "type": "MESSAGE_RECEIVED", "conversationId": "chat", "from": "Alice", "message": { "id": "m1", "type": "text", "text": "Hey!" } }

// Play sound
{ "at": 60, "kind": "AUDIO", "type": "PLAY_SOUND", "soundId": "whatsapp_received" }

// Zoom in
{ "at": 90, "kind": "CAMERA", "type": "ZOOM", "scale": 1.3, "duration": 20 }

// Show notification
{ "at": 120, "kind": "DEVICE", "deviceId": "phone", "type": "SHOW_NOTIFICATION", "appId": "app_whatsapp", "title": "Alice", "body": "New message" }

// Split screen
{ "at": 180, "kind": "CAMERA", "type": "LAYOUT", "mode": "SPLIT_HORIZONTAL", "primaryDeviceId": "alice", "secondaryDeviceId": "bob" }
```

## Sound IDs

| ID | File |
|----|------|
| `whatsapp_received` | whatsapp-received.mp3 |
| `whatsapp_sent` | whatsapp-sent.mp3 |
| `notification` | notification.mp3 |

## Device Profiles

| ID | Dimensions |
|----|------------|
| `iphone16` | 1179×2556 |
| `pixel` | 1080×2340 |

---

# File Locations

| What | Where |
|------|-------|
| Episode JSON | `packages/episodes/src/examples/` |
| Core Types | `packages/core/src/types.ts` |
| Engine | `packages/core/src/engine.ts` |
| Renderer | `packages/renderer/src/TokovoRenderer.tsx` |
| WhatsApp UI | `packages/apps-whatsapp/src/ui.tsx` |
| Device Profiles | `packages/devices/src/` |
| Sound Files | `apps/video-runner/public/sounds/` |
| Video Wrapper | `apps/video-runner/src/*Video.tsx` |

---

**🎬 Now go build something viral.**
