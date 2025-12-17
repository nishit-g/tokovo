# Event System

> The RuntimeEvent schema and event-driven architecture

---

## Overview

Tokovo uses an **event-driven architecture**. All state changes happen through **RuntimeEvents**. This ensures:

- **Determinism** - Same events → same output
- **Debuggability** - Trace any state to its source event
- **Extensibility** - Plugins add new event types

---

## RuntimeEvent Schema

All events follow the canonical schema:

```typescript
interface RuntimeEvent {
    at: number;              // Frame number (required)
    kind: RuntimeEventKind;  // Event category
    type?: string;           // Event type within kind
    payload?: unknown;       // Event-specific data
    
    // Optional metadata
    _trace?: EventTrace;     // Source location for debugging
    _signal?: EventSignal;   // Semantic signal for DirectorLite
    silent?: boolean;        // Suppress audio for this event
}
```

---

## Event Kinds

### APP Events

For app-specific actions (messaging, etc.):

```typescript
interface AppRuntimeEvent {
    at: number;
    kind: "APP";
    appId: string;           // "app_whatsapp", "app_twitter"
    type: string;            // "MESSAGE_RECEIVED", "TYPING_START"
    deviceId?: string;
    payload: {
        // ALL app data goes here
        from?: string;
        text?: string;
        conversationId?: string;
        message?: MessageData;
    };
}
```

**Example:**

```typescript
{
    at: 60,
    kind: "APP",
    appId: "app_whatsapp",
    type: "MESSAGE_RECEIVED",
    payload: {
        from: "Sarah",
        text: "Hey!",
        conversationId: "dm_sarah",
        message: {
            id: "msg_001",
            from: "Sarah",
            text: "Hey!",
            type: "text"
        }
    }
}
```

---

### DEVICE Events

For device-level actions:

```typescript
interface DeviceRuntimeEvent {
    at: number;
    kind: "DEVICE";
    deviceId: string;
    type: DeviceEventType;
    payload?: {
        appId?: string;
    };
}

type DeviceEventType =
    | "LOCK"
    | "UNLOCK"
    | "OPEN_APP"
    | "CLOSE_APP"
    | "GO_HOME"
    | "SHOW_NOTIFICATION"
    | "DISMISS_NOTIFICATION"
    | "TAP_NOTIFICATION"
    | "INCOMING_CALL"
    | "CALL_ANSWERED"
    | "CALL_ENDED";
```

**Example:**

```typescript
{
    at: 0,
    kind: "DEVICE",
    deviceId: "phone",
    type: "UNLOCK"
}
```

---

### CAMERA Events

For cinematic camera movements:

```typescript
interface CameraRuntimeEvent {
    at: number;
    kind: "CAMERA";
    type: CameraEventType;
    deviceId?: string;
    payload: CameraPayload;
}

type CameraEventType =
    | "ZOOM"
    | "PAN"
    | "SHAKE"
    | "FOCUS"
    | "CUT"
    | "RESET"
    | "ANCHOR_FOCUS"
    | "ANCHOR_TRACK"
    | "LAYOUT"
    | "HOLD";
```

**Example:**

```typescript
{
    at: 90,
    kind: "CAMERA",
    type: "ZOOM",
    payload: {
        scale: 1.3,
        duration: 15,
        originX: 0.5,
        originY: 0.7,
        easing: "easeOut"
    }
}
```

---

### AUDIO Events

For sound effects and music:

```typescript
interface AudioRuntimeEvent {
    at: number;
    kind: "AUDIO";
    type: AudioEventType;
    payload: AudioPayload;
}

type AudioEventType =
    | "PLAY_SOUND"
    | "STOP_SOUND"
    | "FADE_VOLUME"
    | "BACKGROUND_MUSIC"
    | "PLAY_ONE_SHOT"
    | "DUCK";
```

**Example:**

```typescript
{
    at: 60,
    kind: "AUDIO",
    type: "PLAY_SOUND",
    payload: {
        soundId: "message_received",
        volume: 0.8,
        instanceId: "sound_001"
    }
}
```

---

### KEYBOARD Events

For typing simulation:

```typescript
interface KeyboardRuntimeEvent {
    at: number;
    kind: "KEYBOARD";
    deviceId: string;
    type: KeyboardEventType;
    payload?: {
        key?: string;
        char?: string;
        text?: string;
    };
}

type KeyboardEventType =
    | "SHOW"
    | "HIDE"
    | "KEY_DOWN"
    | "KEY_UP"
    | "TYPE_CHAR"
    | "BACKSPACE"
    | "SET_TEXT"
    | "CLEAR";
```

---

### OS Events

For device simulation:

```typescript
interface OSRuntimeEvent {
    at: number;
    kind: "OS";
    type: OSEventType;
    deviceId?: string;
    time?: number;
    level?: number;
    network?: string;
    enabled?: boolean;
}

type OSEventType =
    | "SET_TIME"
    | "SET_BATTERY"
    | "DRAIN_BATTERY"
    | "SET_NETWORK"
    | "SET_DND"
    | "SET_LOW_POWER"
    | "SET_AIRPLANE";
```

---

### TOUCH Events

For gesture visualization:

```typescript
interface TouchRuntimeEvent {
    at: number;
    kind: "TOUCH";
    type: TouchEventType;
    deviceId?: string;
    x?: number;
    y?: number;
    duration?: number;
}

type TouchEventType =
    | "TAP"
    | "LONG_PRESS"
    | "DRAG"
    | "SCROLL";
```

---

## V2 Native Ops

The engine also supports native IR ops from `@tokovo/ir`:

```typescript
// These are valid RuntimeEvents
{ at: 60, kind: "MessageReceived", deviceId: "phone", ... }
{ at: 90, kind: "MessageSent", deviceId: "phone", ... }
{ at: 120, kind: "TypingStarted", ... }
{ at: 150, kind: "CameraZoom", scale: 1.2, ... }
```

This allows episodes compiled with the IR compiler to work directly.

---

## Event Ordering

Events at the same frame are ordered by:

1. **Frame number** (`at`)
2. **Kind priority** (DEVICE → APP → CAMERA → AUDIO → KEYBOARD)
3. **Original DSL order** (stable sort)

```typescript
// Priority order
const KIND_PRIORITY = {
    DEVICE: 1,
    APP: 2,
    CAMERA: 3,
    AUDIO: 4,
    KEYBOARD: 5,
    OS: 6,
    TOUCH: 7
};
```

---

## Event Tracing

Every event can carry a trace for debugging:

```typescript
interface EventTrace {
    file?: string;          // Source file
    line?: number;          // Line number
    beat?: string;          // Beat name
    sceneOpIndex?: number;  // Operation index
    episodeId?: string;     // Episode ID
}
```

**Example:**

```typescript
{
    at: 60,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { ... },
    _trace: {
        file: "demo.episode.ts",
        line: 45,
        beat: "intro",
        sceneOpIndex: 2
    }
}
```

---

## Type Augmentation

Plugins declare their payload types via module augmentation:

```typescript
// In @tokovo/apps-whatsapp
declare module "@tokovo/core" {
    interface AppEventPayloads {
        app_whatsapp: {
            MESSAGE_RECEIVED: {
                from: string;
                text: string;
                conversationId: string;
                message: WhatsAppMessage;
            };
            TYPING_START: {
                conversationId: string;
                from: string;
            };
        };
    }
}
```

**Usage:**

```typescript
// In your code
if (event.appId === "app_whatsapp" && event.type === "MESSAGE_RECEIVED") {
    event.payload.from;  // TypeScript: string ✓
    event.payload.text;  // TypeScript: string ✓
}
```

---

## Creating Events

In plugins, create events using the canonical schema:

```typescript
// In lowering handler
lower(op: TimelineOp, ctx: LowerContext): RuntimeEvent[] {
    return [{
        at: ctx.frame,
        kind: "APP",
        appId: "app_whatsapp",
        type: "MESSAGE_RECEIVED",
        deviceId: ctx.deviceId,
        payload: {
            from: op.from,
            text: op.text,
            conversationId: ctx.conversationId,
            message: {
                id: `msg_${ctx.frame}`,
                from: op.from,
                text: op.text,
                type: "text"
            }
        }
    }];
}
```
