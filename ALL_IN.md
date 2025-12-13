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
8. [DSL System (Narrative Authoring)](#dsl-system-narrative-authoring)
9. [Device System](#device-system)
10. [App System](#app-system)
11. [Camera System](#camera-system)
12. [DirectorLite (Automatic Camera)](#directorlite-automatic-camera)
13. [Audio System](#audio-system)
14. [Multi-Device & POV](#multi-device--pov)
15. [Renderer Architecture](#renderer-architecture)
16. [Creating New Apps](#creating-new-apps)
17. [Quick Reference](#quick-reference)

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
    │       ├── engine.ts      # replay() function + ReducerRegistry
    │       ├── camera/        # Camera controller (memoized)
    │       ├── director-lite/ # ✨ DirectorLite (automatic camera)
    │       │   ├── types.ts   # Signals, effects, layout model
    │       │   ├── rules.ts   # ViralDramaV1 baked rules
    │       │   ├── derive.ts  # Pure function: deriveDirectorEffects()
    │       │   └── signals.ts # Extract signals from timeline
    │       ├── tokens.ts      # Design tokens (iOS/Android)
    │       ├── sounds.ts      # Sound ID registry
    │       ├── constants.ts   # ✨ Magic numbers (TIMING, LAYOUT, DEFAULTS)
    │       ├── typeGuards.ts  # ✨ 25+ type guards for events
    │       ├── plugin.ts      # ✨ Plugin system (PluginManager)
    │       ├── transitions.ts # ✨ Transition system (8 types, 6 presets)
    │       └── eventUtils.ts  # ✨ Event indexing for performance
    │
    ├── renderer/              # 🎨 Visual - React components
    │   └── src/
    │       ├── TokovoRenderer.tsx      # Main device renderer
    │       ├── MultiDeviceRenderer.tsx # Multi-device layouts
    │       ├── DeviceFrame.tsx         # Phone bezel
    │       ├── AudioLayer.tsx          # Sound playback
    │       ├── layout/                 # Layout computation
    │       │   ├── strategies/         # Chat, feed, story layouts
    │       │   └── director-adapter.ts # DirectorLite layout model
    │       ├── camera-composer.ts      # Apply director effects
    │       └── registry.ts             # AppRegistry (class-based)
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
    ├── ir/                    # 🔢 Intermediate Representations (DSL)
    │   └── src/
    │       ├── scene.ts       # Scene IR (semantic, no frames)
    │       ├── timeline.ts    # Timeline IR (frame-based)
    │       ├── trace.ts       # Debug trace model
    │       ├── ordering.ts    # Deterministic ordering contract
    │       └── validate.ts    # IR invariants
    │
    ├── dsl/                   # ✍️ Author DSL (fluent API)
    │   └── src/
    │       ├── author/
    │       │   ├── episode-builder.ts  # episode() entry point
    │       │   ├── device-builder.ts   # Device context
    │       │   └── beat-builder.ts     # Beat actions
    │       ├── types.ts       # DSL-specific types
    │       └── examples/      # Example episodes in DSL
    │
    ├── compiler/              # ⚙️ Scene IR → Timeline IR
    │   └── src/
    │       ├── compile.ts     # Main entry point
    │       ├── context.ts     # Compiler state (cursor, IDs)
    │       └── passes/        # Pure transformation passes
    │           ├── normalize.ts        # Expand sugar
    │           ├── resolve-refs.ts     # Assign message IDs
    │           ├── virtual-device.ts   # Auto-unlock/open
    │           ├── time-lowering.ts    # Duration → frames
    │           ├── validate.ts         # Semantic checks
    │           └── sort.ts             # Canonical ordering
    │
    ├── adapters/              # 🔌 Timeline IR → Runtime Events
    │   └── src/
    │       ├── adapter.ts     # Adapter interface
    │       ├── registry.ts    # Adapter registry
    │       └── whatsapp/      # WhatsApp adapter
    │
    ├── apps-whatsapp/         # 💬 WhatsApp clone
    │   └── src/
    │       ├── ui.tsx         # Main UI view
    │       ├── runtime.ts     # Event reducer (type-safe)
    │       ├── plugin.ts      # ✨ WhatsApp plugin definition
    │       └── components/    # ✨ Split components
    │           ├── icons/     # SVG icon components
    │           ├── Header.tsx
    │           └── MessageBubble.tsx
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

# DSL System (Narrative Authoring)

The Tokovo DSL is a **Narrative Operating System** — a layered architecture that separates **Storytelling** (what writers see), **Meaning** (semantic intent), **Execution** (frame-based timeline), and **Cinematography** (automatic camera).

## Philosophy

```
Writers write INTENT → Compiler produces STRUCTURE → Runtime executes EVENTS → DirectorLite adds CINEMA
```

This separation enables:
- **Human-friendly authoring** — No frames, no camera commands
- **AI-friendly generation** — Structured, deterministic output
- **GUI editor compatibility** — Same IR format
- **Future-proof episodes** — FPS changes don't break stories

---

## Architecture Overview

```
┌───────────────────────────┐
│        AUTHOR DSL         │  ← writers / AI / GUI
│  (TypeScript fluent API)  │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│        SCENE IR           │  ← semantic intent (no frames)
│  (beats, actions, waits)  │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│     COMPILER PASSES       │  ← pure, deterministic
│  (normalize → lower)      │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│       TIMELINE IR         │  ← frame-based execution
│  (at=frame, payload)      │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│         ADAPTERS          │  ← WhatsApp, IG, X
│  (domain → engine events) │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│      EPISODE JSON         │  ← runtime input
│  (initialWorld + events)  │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│     RUNTIME + DIRECTOR    │
│  (execution + cinema)     │
└───────────────────────────┘
```

---

## Package Dependencies

```
@tokovo/ir        ← no dependencies (pure types)
      ↑
@tokovo/dsl       ← depends on @tokovo/ir
      ↑
@tokovo/compiler  ← depends on @tokovo/ir
      ↑
@tokovo/adapters  ← depends on @tokovo/ir
      ↑
@tokovo/core      ← runtime (no DSL dependency)
```

**Rule:** DSL packages never import runtime. Runtime never imports DSL.

---

## Scene IR (Semantic Truth)

Scene IR represents **WHAT HAPPENS**, not WHEN or HOW. It has:
- **No frames**
- **No layout assumptions**
- **No camera commands**
- **No platform specifics**

### SceneOp Types

```typescript
import { SceneOp, DurationExpr, MessageRef } from "@tokovo/ir";

type SceneOp =
  | { kind: "Wait"; duration: DurationExpr }
  | { kind: "TypingStart"; actor: string; conversationId: string }
  | { kind: "TypingEnd"; actor: string; conversationId: string }
  | { kind: "SendMessage"; actor: string; text: string; conversationId: string }
  | { kind: "ReceiveMessage"; actor: string; text: string; conversationId: string }
  | { kind: "ReadMessage"; ref: MessageRef }
  | { kind: "DeleteMessage"; ref: MessageRef }
  | { kind: "Concurrent"; tracks: SceneOp[][] }
```

### Duration Expressions

Human-readable durations that compile to frames:

```typescript
type DurationExpr = "1.5s" | "300ms" | "45frames"

// Parsing (at 30 FPS):
// "1.5s"     → 45 frames
// "300ms"    → 9 frames
// "45frames" → 45 frames
```

### MessageRef

References to messages include full context for cross-device operations:

```typescript
interface MessageRef {
  _type: "MessageRef";
  id: string;
  deviceId: string;
  appId: string;
  conversationId: string;
}
```

### Scene Structure

```typescript
interface SceneIR {
  episodeId: string;
  meta: { title?: string; fps: number };
  devices: DeviceScene[];
}

interface DeviceScene {
  deviceId: string;
  profileId: string;  // "iphone16"
  appId: string;       // "app_whatsapp"
  conversations: ConversationDef[];
  beats: Beat[];
}

interface Beat {
  name: string;   // "typing-tension"
  ops: SceneOp[];
}
```

---

## Author DSL (Fluent API)

The DSL is a TypeScript fluent API that produces Scene IR.

### Basic Usage

```typescript
import { episode } from "@tokovo/dsl";

const sceneIR = episode("breakup-01", ep => {
  ep.config({ fps: 30, title: "The Breakup" });
  
  ep.device("AlicePhone", "iphone16", d => {
    d.app("app_whatsapp");
    d.conversation("dm_bob", { name: "Bob", avatar: "bob.png" });
    
    d.beat("silence", b => {
      b.wait("2s");
    });
    
    d.beat("typing-tension", b => {
      b.typing("Bob").for("1.5s");
      const msg = b.receive("Bob", "We need to talk.");
      b.wait("0.8s");
      b.read(msg);
    });
  });
});
```

### BeatBuilder Methods

| Method | Description | Example |
|--------|-------------|---------|
| `wait(duration)` | Pause (no event) | `b.wait("2s")` |
| `typing(actor).for(duration)` | Typing indicator | `b.typing("Bob").for("1.5s")` |
| `typingStart(actor)` | Start typing (manual end) | `b.typingStart("Bob")` |
| `typingEnd(actor)` | End typing | `b.typingEnd("Bob")` |
| `send(text)` | Send message (from "me") | `b.send("Hello!")` |
| `receive(actor, text)` | Receive message | `b.receive("Bob", "Hi!")` |
| `read(ref)` | Mark message read | `b.read(msg)` |
| `readLast()` | Read last message | `b.readLast()` |
| `delete(ref)` | Delete message | `b.delete(msg)` |
| `deleteLast()` | Delete last message | `b.deleteLast()` |
| `concurrent(tracks)` | Parallel operations | See below |

### Concurrent Operations

Run multiple tracks in parallel:

```typescript
d.beat("overlap", b => {
  b.concurrent([
    t => t.typing("Bob").for("2s"),
    t => t.wait("0.5s").receive("Bob", "Message during typing!")
  ]);
  // Cursor advances to max(track ends)
});
```

**Compiler behavior:**
1. Fork cursor for each track
2. Compile tracks independently  
3. Join cursor at `max(trackEnds)`
4. Preserve `trackId` in trace for debugging

---

## Compiler Pipeline

The compiler transforms Scene IR → Timeline IR through pure passes.

### Pipeline Overview

```typescript
import { compile } from "@tokovo/compiler";

const { timeline, validation, durationInFrames } = compile(sceneIR, {
  mode: "lenient",  // or "strict"
  debug: true,
});
```

### Pass Order (Fixed)

```
1. normalize      → Expand sugar (typing.for → start+wait+end)
2. resolveRefs    → Assign deterministic message IDs
3. virtualDevice  → Auto-insert unlock/open/navigate
4. timeLowering   → Convert Duration → frames, assign `at`
5. validate       → Semantic checks (read before send?)
6. sort           → Canonical ordering
```

### Pass Details

#### 1. Normalize

Expands syntactic sugar:

```typescript
// Input
b.typing("Bob").for("1.5s")

// Output (3 SceneOps)
{ kind: "TypingStart", actor: "Bob", ... }
{ kind: "Wait", duration: "1.5s" }
{ kind: "TypingEnd", actor: "Bob", ... }
```

#### 2. Resolve Refs

Assigns stable message IDs:

```typescript
// Input
const msg = b.receive("Bob", "Hello");
b.read(msg);

// After resolve-refs
msg._resolvedMessageId = "msg_AlicePhone_dm_bob_1"
```

#### 3. Virtual Device State

Tracks device state and auto-inserts glue events:

```typescript
// Virtual state per device:
{
  isLocked: true,
  foregroundAppId: undefined,
  activeConversationId: undefined,
}

// If first operation needs conversation open:
→ Insert DeviceUnlocked at frame 0
→ Insert AppOpened at frame 0  
→ Insert ConversationOpened at frame 0
```

#### 4. Time Lowering

Converts Scene IR to Timeline IR:

```typescript
// Input (Scene IR)
{ kind: "Wait", duration: "1.5s" }
{ kind: "ReceiveMessage", actor: "Bob", text: "Hi" }

// Output (Timeline IR)
// Wait advances cursor but emits no event
{ at: 45, kind: "MessageReceived", message: {...}, ... }
```

#### 5. Validate

Checks semantic correctness:

| Check | Strict Mode | Lenient Mode |
|-------|-------------|--------------|
| Read before send | Error | Warning |
| Delete missing message | Error | Warning |
| Negative frame | Error | Error |

#### 6. Sort

Canonical ordering for determinism:

```typescript
// Sort key: (at, phase, priority, trackId, sceneOpIndex)

enum Phase {
  DEVICE = 0,  // unlock, lock
  NAV = 10,    // open app, goto conversation
  APP = 20,    // typing, messages, read, delete
  FX = 30,     // reserved
}
```

---

## Timeline IR (Execution Contract)

Timeline IR is **frame-based** and **platform-agnostic**.

### TimelineOp Types

```typescript
type TimelineOp =
  | DeviceUnlockedOp    // { at, kind: "DeviceUnlocked", deviceId }
  | AppOpenedOp         // { at, kind: "AppOpened", deviceId, appId }
  | ConversationOpenedOp
  | TypingStartedOp
  | TypingEndedOp
  | MessageReceivedOp   // { at, kind: "MessageReceived", message: {...} }
  | MessageSentOp
  | MessageReadOp
  | MessageDeletedOp
```

### Trace Model (Debug Spine)

Every Timeline IR operation carries trace metadata:

```typescript
interface Trace {
  episodeId: string;
  deviceId: string;
  beat: string;          // "typing-tension"
  trackId: string;       // "main" or "track_0"
  sceneOpIndex: number;  // Index in original scene ops
  source?: { file?: string; line?: number };
}
```

This enables:
- Perfect debugging (trace any event to its beat)
- Golden tests (same input → same trace)
- AI explainability

---

## Adapters (Reality Bridge)

Adapters convert Timeline IR → Runtime Events (what `@tokovo/core` expects).

### Adapter Interface

```typescript
interface AppAdapter {
  appId: string;
  supports(op: TimelineOp): boolean;
  lower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[];
}
```

### WhatsApp Adapter

```typescript
// Timeline IR
{ at: 45, kind: "MessageReceived", message: { id: "msg_1", text: "Hi" } }

// → Runtime Event
{
  at: 45,
  kind: "APP",
  type: "MESSAGE_RECEIVED",
  appId: "app_whatsapp",
  conversationId: "dm_bob",
  from: "Bob",
  message: {
    id: "msg_1",
    type: "text",
    text: "Hi",
    status: "delivered",
  }
}
```

### Adapter Registry

```typescript
import { adapterRegistry } from "@tokovo/adapters";

const runtimeEvents = adapterRegistry.lowerAll(timelineIR);
```

---

## Complete Example

```typescript
import { episode } from "@tokovo/dsl";
import { compile } from "@tokovo/compiler";
import { adapterRegistry } from "@tokovo/adapters";

// 1. Write episode using DSL
const sceneIR = episode("drama-01", ep => {
  ep.device("Phone", d => {
    d.conversation("dm_ex");
    d.beat("tension", b => {
      b.typing("Ex").for("2s");
      const msg = b.receive("Ex", "We need to talk.");
      b.wait("1s");
      b.read(msg);
    });
  });
});

// 2. Compile to Timeline IR
const { timeline, validation } = compile(sceneIR);

// 3. Convert to runtime events
const events = adapterRegistry.lowerAll(timeline);

// 4. Use with Tokovo runtime
const episodeJSON = {
  meta: { fps: 30, durationInFrames: timeline.durationInFrames },
  initialWorld: buildInitialWorld(sceneIR),
  events,
};
```

---

## DirectorLite Compatibility

The DSL automatically produces events that DirectorLite observes:

| DSL Action | Runtime Event | DirectorLite Signal | Camera Effect |
|------------|---------------|---------------------|---------------|
| `typing().for()` | `TYPING_START` | `TypingStarted` | PushIn |
| `receive()` | `MESSAGE_RECEIVED` | `NewMessage` | ZoomToRect |
| `read()` | `MESSAGE_READ` | `MessageRead` | ZoomToRect |
| `delete()` | `MESSAGE_DELETED` | `MessageDeleted` | MicroShake |

**No DirectorLite changes needed.** DSL events flow through the existing signal extraction.

---

## Determinism Guarantees

1. **Same script → Same Scene IR** (DSL is deterministic)
2. **Same Scene IR → Same Timeline IR** (Compiler is pure)
3. **Same Timeline IR → Same Runtime Events** (Adapters are pure)
4. **Same Runtime Events → Same frames** (Engine is deterministic)

This enables:
- Golden tests
- Scrubbing without artifacts
- AI reproducibility

---

## File Locations

| What | Where |
|------|-------|
| Scene IR types | `packages/ir/src/scene.ts` |
| Timeline IR types | `packages/ir/src/timeline.ts` |
| Trace model | `packages/ir/src/trace.ts` |
| Ordering contract | `packages/ir/src/ordering.ts` |
| Semantic types | `packages/ir/src/semantic.ts` |
| Constraints | `packages/ir/src/constraints.ts` |
| Author DSL | `packages/dsl/src/author/` |
| episode() entry | `packages/dsl/src/author/episode-builder.ts` |
| Compiler passes | `packages/compiler/src/passes/` |
| compile() entry | `packages/compiler/src/compile.ts` |
| WhatsApp adapter | `packages/adapters/src/whatsapp/` |
| Example episodes | `packages/dsl/examples/` |

---

## Narrative OS Extensions

These extensions transform Tokovo from a video generator into a **Programmable Narrative Operating System**.

### Episode Configuration

Episode-level brain for AI and DirectorLite:

```typescript
ep.config({
  fps: 30,
  pacing: "slow-burn",      // slow-burn | normal | chaotic | explosive
  director: "auto",         // auto | manual | hybrid
  aspectRatio: "9:16",      // 9:16 | 1:1 | 16:9
  theme: "dark",
  tags: ["breakup", "drama"]
})
```

| Field | Type | Description |
|-------|------|-------------|
| `pacing` | string | Overall pacing style |
| `director` | string | Camera control mode |
| `aspectRatio` | string | Output aspect ratio |
| `theme` | string | Visual theme |
| `tags` | string[] | Content categorization |
| `targetDuration` | string | Duration hint for AI |

### Semantic Annotations

Attach meaning to messages for camera intelligence and AI:

```typescript
b.receive("Bob", "We need to talk.", {
  mood: "tense",
  intensity: 0.7,
  secrecy: "high",
  urgency: 0.8,
  subtext: "breakup-coming"
})
```

| Field | Type | Description |
|-------|------|-------------|
| `mood` | Mood | calm, tense, angry, sad, anxious, excited, confused, neutral |
| `intensity` | 0-1 | Emotional intensity |
| `secrecy` | string | low, medium, high |
| `urgency` | 0-1 | How urgent is this? |
| `intimacy` | 0-1 | How intimate? |
| `subtext` | string | AI/human hint |
| `tags` | string[] | Custom tags |

### Beat Metadata

Story rhythm per beat:

```typescript
d.beat("climax", { tempo: "fast", emotionalPeak: true }, b => {
  // Operations...
})
```

| Field | Type | Description |
|-------|------|-------------|
| `tempo` | string | slow, medium, fast |
| `emotionalPeak` | boolean | Is this a peak moment? |
| `release` | boolean | Is this tension release? |
| `function` | string | setup, buildup, climax, release, resolution |

### POV Primitives

Camera as story grammar:

```typescript
// Switch to another device's perspective
b.pov("BobPhone", "crossfade")  // cut | crossfade | wipe

// Split screen showing multiple devices
b.splitPov(["AlicePhone", "BobPhone"], "horizontal")  // horizontal | vertical | pip
```

### Reserved Signal Operations

Future-proof drama events:

```typescript
// Add reaction to message
b.react(msg, "me", "❤️")

// Screenshot taken notification (drama!)
b.screenshot()

// Missed call
b.missedCall("Bob", "video")  // voice | video
```

**All reserved signals in Scene IR:**

| Operation | Description |
|-----------|-------------|
| `ReactionAddedOp` | Emoji reaction to message |
| `VoiceNoteSentOp` | Voice note sent |
| `VoiceNoteReceivedOp` | Voice note received |
| `MissedCallOp` | Missed voice/video call |
| `OnlineStatusChangedOp` | online/offline/typing |
| `ScreenshotTakenOp` | Screenshot taken alert |
| `BlockedUserOp` | User blocked |

### Narrative Constraints

Validation rules that ensure story correctness:

```typescript
import { validateConstraints } from "@tokovo/ir";

const result = validateConstraints(sceneIR);
if (!result.valid) {
  console.log("Violations:", result.violations);
}
```

**Constraint checks:**

| Check | Severity |
|-------|----------|
| Typing end without start | Error |
| POV switch to non-existent device | Error |
| SplitPOV with invalid devices | Error |
| Invalid semantic values (intensity > 1) | Error |
| Unclosed typing indicators | Warning |

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

# DirectorLite (Automatic Camera)

DirectorLite is an **automated camera director** that reacts to chat events in real-time. It creates TikTok-style dramatic camera movements without requiring manual CAMERA events.

## How It Works

```
Timeline Events → Signal Extraction → Rule Matching → Effect Generation → Camera Transform
```

1. **Signal Extraction**: Scans events in a window (`t-90` to `t+15` frames)
2. **Rule Matching**: Matches signals to baked rules ("ViralDramaV1")
3. **Cooldown**: Prevents effect spam (configurable per-rule)
4. **Arbitration**: Only 1 framing effect wins; shake effects can stack
5. **Composition**: Applies winning effects to camera transform

## Enabling DirectorLite

Pass `eventIndex` to TokovoRenderer:

```tsx
import { createEventIndex } from "@tokovo/core";

const eventIndex = useMemo(
    () => createEventIndex(episode.events),
    [episode.events]
);

<TokovoRenderer
    world={world}
    t={t}
    eventIndex={eventIndex}
    directorEnabled={true}
    directorDebug={false}  // Set true to log per-frame decisions
/>
```

## Baked Rules (ViralDramaV1)

| Signal | Effect | Scale | Duration | Cooldown |
|--------|--------|-------|----------|----------|
| `TypingStarted` | PushIn | 1.12x | 45 frames | 90 frames |
| `NewMessage` | ZoomToRect | 1.2x | 25 frames | 20 frames |
| `MessageRead` | ZoomToRect | 1.08x | 18 frames | 45 frames |
| `MessageDeleted` | MicroShake | intensity=6 | 12 frames | 60 frames |
| `CallIncoming` | PullBack | 0.88x | 40 frames | 0 frames |

## Effect Categories

- **Framing Effects** (`PushIn`, `ZoomToRect`, `PullBack`): Only 1 wins per frame (highest priority)
- **Shake Effects** (`MicroShake`): Stack up to 2, decay over progress

## Targeting

| Target Type | What It Targets |
|-------------|----------------|
| `message` | The specific message bubble (by `messageId`) |
| `inputArea` | The chat input area (always exists) |
| `lastMessage` | The most recent message in the conversation |

## Manual Camera Override

If the timeline has active CAMERA events, DirectorLite automatically **skips** to avoid conflicts:

```
Timeline CAMERA event active at frame t → Director returns empty effects
```

This allows episodes like `camera-showcase.json` to use manual camera without interference.

## Disabling DirectorLite

```tsx
<TokovoRenderer
    world={world}
    t={t}
    directorEnabled={false}  // Only use timeline CAMERA events
/>
```

## Console Debug Output

With `directorDebug={true}`:

```
[DirectorLite] t=45 { signalsInWindow: 3, matchedRules: 1, winningFraming: "PushIn", skippedCooldown: 0 }
[DirectorLite] t=120 { signalsInWindow: 5, matchedRules: 2, winningFraming: "ZoomToRect", skippedCooldown: 1 }
```

## File Structure

```
packages/core/src/director-lite/
├── types.ts        # LayoutRect, DirectorSignal, DerivedCameraEffect
├── rules.ts        # ViralDramaV1 baked rules (pre-indexed)
├── signals.ts      # Extract signals from timeline events
├── derive.ts       # Pure function: deriveDirectorEffects()
└── index.ts        # Module exports

packages/renderer/src/
├── camera-composer.ts        # Apply effects to camera transform
└── layout/director-adapter.ts # Create layout model for targeting
```

## Tuning the Feel

Edit `packages/core/src/director-lite/rules.ts`:

```typescript
{
    id: "message-zoom",
    signal: "NewMessage",
    effect: "ZoomToRect",
    category: "framing",
    priority: 30,
    cooldownFrames: 20,    // Adjust for more/less frequent
    durationFrames: 25,    // Adjust for faster/slower
    targetType: "message",
    scale: 1.2,            // Adjust zoom intensity
}
```

## Key Design Decisions

1. **Pure Function**: `deriveDirectorEffects()` has no internal state — safe for scrubbing
2. **Deterministic**: Same frame always produces same result
3. **Director Owns Framing**: When effects fire, they replace base camera transform
4. **Single Source of Truth**: Layout rects are computed once in the renderer

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

# Configuration System

Everything is configurable via `world.config` and `device.theme`.

## VideoConfig (Global)

Set in `initialWorld.config`:

```json
{
    "initialWorld": {
        "config": {
            "backgroundColor": "#1a1a2e",
            "layout": {
                "splitLineColor": "#444444",
                "splitLineWidth": 3,
                "pipBorderColor": "#ffffff",
                "pipShadow": "0 10px 40px rgba(0,0,0,0.7)"
            },
            "watermark": {
                "text": "@myhandle",
                "position": "bottom-right",
                "opacity": 0.5
            }
        }
    }
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `backgroundColor` | `#0a0a1a` | Video canvas background |
| `layout.splitLineColor` | `#333333` | Divider color in split views |
| `layout.splitLineWidth` | `2` | Divider thickness (px) |
| `layout.pipBorderColor` | `#333333` | PIP overlay border |
| `layout.pipShadow` | Drop shadow | PIP box shadow |

## DeviceTheme (Per-Device)

Set in each device:

```json
{
    "devices": {
        "alice_phone": {
            "id": "alice_phone",
            "profileId": "iphone16",
            "theme": {
                "platform": "ios",
                "frameColor": "#1a1a1a",
                "wallpaper": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "statusBarStyle": "light",
                "accentColor": "#ff6b35"
            }
        }
    }
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `platform` | `ios` | UI style (ios/android) |
| `frameColor` | `black` | Device bezel color |
| `wallpaper` | - | Lock/home background (URL/CSS) |
| `statusBarStyle` | `light` | Status bar text color |
| `accentColor` | - | App tint color override |

---

# Plugin System

Tokovo uses a **plugin architecture** to manage apps. Each app (WhatsApp, Instagram) is a self-contained plugin.

## Creating a Plugin

```typescript
// apps-whatsapp/src/plugin.ts
import { definePlugin, PluginManager } from "@tokovo/core";

export const WhatsAppPlugin = definePlugin({
    id: "app_whatsapp",
    name: "WhatsApp",
    icon: "whatsapp-icon.png",
    primaryColor: "#25D366",
    
    // The React component for the app view
    appView: WhatsappChatView,
    
    // The Redux-style reducer for state
    reducer: whatsappReducer,
    
    // Sound effects map
    sounds: {
        "message_in": "whatsapp-received.mp3"
    }
});

// Register it
PluginManager.register(WhatsAppPlugin);
```

---

# Transition System

The engine supports cinematic transitions between screens and apps.

## Key Concepts

- **TransitionType**: The animation style (`FADE`, `SLIDE_LEFT`, `ZOOM_IN`, etc.)
- **Preset**: Pre-configured animations for common actions (`appOpen`, `push`, `pop`)
- **Event**: How you trigger it in the timeline

## Transition Types

| Type | Description |
|------|-------------|
| `FADE` | Opacity fade |
| `SLIDE_LEFT/RIGHT` | Standard navigation slides |
| `SLIDE_UP/DOWN` | Modal presentations |
| `ZOOM_IN/OUT` | iOS app open/close effect |
| `CROSS_DISSOLVE` | Smooth blending |

## Event Example

```json
{
    "at": 60,
    "kind": "TRANSITION",
    "type": "ZOOM_IN",
    "from": "homescreen",
    "to": "app_whatsapp",
    "duration": 15
}
```

---

# Design System

Tokovo uses **authentic platform tokens** to ensure pixel-perfect replication of iOS/Android UIs.

## Tokens (`@tokovo/core`)

```typescript
import { iOSTokens } from "@tokovo/core";

const styles = {
    fontFamily: iOSTokens.fontFamily,
    backgroundColor: iOSTokens.colors.systemGroupedBackground,
    borderRadius: iOSTokens.radii.l // 12px
};
```

## Icons

Use **SVG replications** instead of generic icon libraries (Lucide/FontAwesome) to match the platform look exactly.

---

---

# Core Utilities (`@tokovo/core`)

We provide built-in utilities to ensure type safety and code consistency.

## Constants

Avoid magic numbers. Use `constants.ts`.

```typescript
import { TIMING, LAYOUT, DEFAULTS } from "@tokovo/core";

// ❌ bad
setTimeout(fn, 1000);

// ✅ good
setTimeout(fn, TIMING.MOMENT); // 1.5s
```

## Type Guards

Safely narrow types in reducers and components.

```typescript
import { isAppEvent, isTypingStartEvent } from "@tokovo/core";

if (isAppEvent(event) && isTypingStartEvent(event)) {
    // event is typed as AppTypingStartEvent
    console.log(event.from);
}
```

## Event Utils

Optimized for frame-by-frame lookups.

```typescript
import { getEventsAtFrame } from "@tokovo/core";

// O(1) lookup instead of O(n) filter
const frameEvents = getEventsAtFrame(events, frame);
```

---

# File Locations

| What | Where |
|------|-------|
| Episode JSON | `packages/episodes/src/examples/` |
| Core Types | `packages/core/src/types.ts` |
| Engine | `packages/core/src/engine.ts` |
| **DirectorLite** | `packages/core/src/director-lite/` |
| Renderer | `packages/renderer/src/TokovoRenderer.tsx` |
| Camera Composer | `packages/renderer/src/camera-composer.ts` |
| WhatsApp UI | `packages/apps-whatsapp/src/ui.tsx` |
| Device Profiles | `packages/devices/src/` |
| Sound Files | `apps/video-runner/public/sounds/` |
| Video Wrapper | `apps/video-runner/src/*Video.tsx` |

---

**🎬 Now go build something viral.**
