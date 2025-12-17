# DSL Revamp v2 - Complete Specification

> Beats are dead. Long live tracks.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Episode Builder API](#episode-builder-api)
4. [Track System](#track-system)
5. [App Track (Plugin System)](#app-track-plugin-system)
6. [Camera Track - God Mode](#camera-track---god-mode)
7. [Audio Track](#audio-track)
8. [OS Track](#os-track)
9. [Anchors System](#anchors-system)
10. [TrackEvent Schema](#trackevent-schema) (Typed Payloads)
11. [Frame Rounding Rules](#frame-rounding-rules)
12. [Span Lifecycle Events](#span-lifecycle-events)
13. [Conflict Resolution](#conflict-resolution)
14. [Build Layering](#build-layering)
15. [Canonical Truth: No Bypass](#canonical-truth-no-bypass)
16. [Implementation Plan](#implementation-plan)
17. [Migration Guide](#migration-guide)
18. [Complete Examples](#complete-examples)

---

## Philosophy

### Why Remove Beats?

| Old (Beats) | Problem |
|-------------|---------|
| `d.beat("intro", b => b.receive(...))` | Implicit timing (wait-based) |
| Mixed concerns | BeatBuilder does messaging, camera, audio, everything |
| Not auditable | "What happened at frame 90?" is hard to answer |
| Not scalable | Adding new features = bloating BeatBuilder |

### Why Tracks?

| New (Tracks) | Benefit |
|--------------|---------|
| `ep.track("app_whatsapp", wa => wa.at("3s").receive(...))` | Explicit timing (frame-based) |
| Separation of concerns | Each track owns one domain |
| Auditable | Every event has `at` frame, easy to inspect |
| Scalable | New domain = new track, no core changes |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           AUTHOR DSL                                 │
│                                                                      │
│  episode() → device() → track("app", ...) → build() → TrackEvent[] │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           COMPILER                                   │
│                                                                      │
│  TrackEvent[] → lowerToRuntimeEvents() → RuntimeEvent[]              │
│  (spans expand to START/END, conflicts resolved, assets collected)   │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           ENGINE                                     │
│                                                                      │
│  prepareEpisode() → CompiledEpisode                                  │
│  runEpisode(compiled, frame) → WorldState                            │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          RENDERER                                    │
│                                                                      │
│  TokovoRenderer(world, frame) → React Component                      │
│  Uses Remotion: useCurrentFrame(), interpolate(), spring()          │
└────────────────────────────────────────────────────────────────────┘
```

---

## Episode Builder API

### Creating an Episode

```typescript
// @tokovo/dsl/src/timeline-episode.ts

import { episode } from "@tokovo/dsl";

const ep = episode("episode-id", {
    fps: 30,                    // Required
    duration: "60s",            // Required: "Ns" or frames number
    title?: "My Episode",       // Optional metadata
    description?: "...",        // Optional metadata
});
```

### Adding Devices

```typescript
ep.device(deviceId: string, profile: DeviceProfile, options: DeviceOptions);

// Example
ep.device("phone", "iphone16", {
    app: "app_whatsapp",        // Initial foreground app
    conversations: [
        { id: "dm_sarah", name: "Sarah ❤️", avatar?: "/avatars/sarah.jpg" },
        { id: "dm_boss", name: "Boss 👔" },
        { id: "family_group", name: "Family 👨‍👩‍👧", type: "group" }
    ],
    os?: {
        time: new Date("2024-12-17T19:30:00"),
        battery: 87,
        network: "5G"
    }
});
```

### Device Profiles

| Profile | Dimensions | Platform |
|---------|------------|----------|
| `iphone16` | 393x852 | iOS |
| `iphone16_pro` | 402x874 | iOS |
| `iphone16_pro_max` | 440x956 | iOS |
| `pixel_8` | 412x915 | Android |

### Adding Director (Optional)

```typescript
// Enable auto-camera based on signals
ep.director(style: DirectorStyle);

// Example
ep.director("ViralDramaV1");  // The only style currently
```

When director is enabled, it provides lowest-priority camera effects.
Manual camera track overrides director.

### Adding Tracks

```typescript
ep.track(trackId: string, fn: (t: Track) => void);

// Built-in track types
ep.track("camera", cam => { ... });
ep.track("audio", audio => { ... });
ep.track("os", os => { ... });

// Plugin tracks (registered by plugins)
ep.track("app_whatsapp", wa => { ... });
ep.track("app_twitter", tw => { ... });
ep.track("app_phone", phone => { ... });
```

### Adding Markers (Debugging)

```typescript
// Point markers
ep.mark(id: string, time: string | number);
ep.mark("first_message", "0s");
ep.mark("climax", "45s");

// Section markers (regions)
ep.section(id: string, start: string, end: string);
ep.section("intro", "0s", "15s");
ep.section("conflict", "15s", "45s");
ep.section("resolution", "45s", "60s");
```

### Building

```typescript
const compiled: CompiledEpisode = ep.build();

// Returns:
interface CompiledEpisode {
    id: string;
    fps: number;
    durationInFrames: number;
    events: RuntimeEvent[];
    initialWorld: WorldState;
    assets: AssetManifest;
    metadata: {
        title?: string;
        markers: Array<{ id: string; frame: number }>;
        sections: Array<{ id: string; start: number; end: number }>;
    };
}
```

---

## Track System

### Timing: Points vs Spans

Every track operation is either a **point** (instant) or a **span** (duration).

```typescript
// POINT - happens at a single frame
track.at("3s").doSomething();
track.at(90).doSomething();  // frame 90

// SPAN - happens over a range of frames
track.span("1s", "3s").doSomething();  // from 1s to 3s
track.span(30, 90).doSomething();      // from frame 30 to 90
```

### Time String Format

| Format | Example | Frames (at 30fps) |
|--------|---------|-------------------|
| Seconds | `"3s"` | 90 |
| Milliseconds | `"500ms"` | 15 |
| Frames | `90` | 90 |

### Span Expansion

Spans compile to START and END events:

```typescript
// Input
wa.span("1s", "3s").typing("dm_sarah", "me");

// Compiles to
[
    { at: 30, kind: "APP", type: "TYPING_START", payload: { ... } },
    { at: 90, kind: "APP", type: "TYPING_END", payload: { ... } }
]
```

---

## App Track (Plugin System)

Each app plugin provides its own track API.

### Plugin Track Contract

```typescript
// @tokovo/core/src/types/plugin-track-contract.ts

interface PluginTrackContract<AppId extends string> {
    id: AppId;
    
    // Track methods exposed to DSL
    trackMethods: TrackMethodRegistry;
    
    // Convert TrackEvent → RuntimeEvent[]
    lower: (event: TrackEvent) => RuntimeEvent[];
    
    // Handle RuntimeEvents in engine
    reducer: PluginReducer<AppId>;
    
    // Anchors this plugin provides
    anchors: AnchorRegistry;
}
```

### WhatsApp Track

```typescript
ep.track("app_whatsapp", wa => {
    // ──────────────────────────────────────
    // MESSAGING
    // ──────────────────────────────────────
    
    // Receive message
    wa.at("0s").receive(conversationId, {
        from: string,           // Required: sender name
        text: string,           // Required: message text
        silent?: boolean,       // Default: false (plays sound)
        replyTo?: MessageRef,   // Optional: quote message
    });
    
    // Send message
    wa.at("2s").send(conversationId, {
        text: string,
        silent?: boolean,
    });
    
    // ──────────────────────────────────────
    // TYPING
    // ──────────────────────────────────────
    
    // Typing span (most common)
    wa.span("1s", "2s").typing(conversationId, actor);
    
    // ──────────────────────────────────────
    // MEDIA
    // ──────────────────────────────────────
    
    wa.at("5s").receiveImage(conversationId, {
        from: string,
        url: string,
        caption?: string,
        height?: number,    // Default: 400
    });
    
    wa.at("6s").receiveVideo(conversationId, {
        from: string,
        url: string,
        durationSeconds: number,
        thumbnail?: string,
    });
    
    wa.at("7s").receiveVoice(conversationId, {
        from: string,
        durationSeconds: number,
    });
    
    wa.at("8s").receiveGif(conversationId, {
        from: string,
        url: string,
    });
    
    // ──────────────────────────────────────
    // REACTIONS
    // ──────────────────────────────────────
    
    wa.at("10s").react(messageRef, emoji);
    
    // ──────────────────────────────────────
    // READ RECEIPTS
    // ──────────────────────────────────────
    
    wa.at("11s").read(conversationId);
});
```

### Twitter Track

```typescript
ep.track("app_twitter", tw => {
    tw.at("0s").tweet({
        text: string,
        media?: Array<{ url: string; type: "image" | "video" }>,
    });
    
    tw.at("2s").receiveTweet({
        author: { name: string; handle: string; verified?: "blue" | "gold" },
        text: string,
        replyCount?: number,
        likeCount?: number,
    });
    
    tw.at("3s").like(tweetRef);
    tw.at("4s").retweet(tweetRef);
});
```

---

## Camera Track - God Mode

Full manual control over camera position, zoom, effects.

### Camera State

```typescript
interface CameraState {
    x: number;          // Horizontal translate (px)
    y: number;          // Vertical translate (px)  
    scale: number;      // Zoom level (1.0 = 100%)
    rotation: number;   // Rotation (degrees)
    originX: number;    // Transform origin X (0-1)
    originY: number;    // Transform origin Y (0-1)
}

// Default
const DEFAULT_CAMERA: CameraState = {
    x: 0,
    y: 0,
    scale: 1.0,
    rotation: 0,
    originX: 0.5,
    originY: 0.5
};
```

### API

```typescript
ep.track("camera", cam => {
    // ──────────────────────────────────────
    // SET - Instant state change
    // ──────────────────────────────────────
    
    cam.at("0s").set({
        x?: number,
        y?: number,
        scale?: number,
        rotation?: number,
        originX?: number,
        originY?: number
    });
    
    // ──────────────────────────────────────
    // ANIMATE - Smooth transition
    // ──────────────────────────────────────
    
    cam.at("1s").animate({
        x?: number,
        y?: number,
        scale?: number,
        rotation?: number,
        originX?: number,
        originY?: number,
        duration: string,       // Required
        easing?: EasingType     // Default: "linear"
    });
    
    // ──────────────────────────────────────
    // FOCUS - Anchor-based positioning
    // ──────────────────────────────────────
    
    cam.at("3s").focus(anchorId, {
        scale?: number,         // Target scale
        padding?: number,       // Pixels around anchor
        duration?: string,      // Animation time
        easing?: EasingType
    });
    
    // ──────────────────────────────────────
    // TRACK - Continuous following
    // ──────────────────────────────────────
    
    cam.span("5s", "10s").track(anchorId, {
        scale?: number,
        lag?: number,           // Smoothing factor (0-1)
    });
    
    // ──────────────────────────────────────
    // SHAKE - Screen shake effect
    // ──────────────────────────────────────
    
    cam.at("8s").shake({
        intensityX: number,     // Horizontal shake (px)
        intensityY: number,     // Vertical shake (px)
        frequency?: number,     // Hz (default: 20)
        decay?: number,         // 0-1 (default: 0.8)
        duration: string        
    });
    
    // ──────────────────────────────────────
    // RESET - Return to default
    // ──────────────────────────────────────
    
    cam.at("12s").reset({
        duration?: string,
        easing?: EasingType
    });
});
```

### Easing Types

| Easing | Description |
|--------|-------------|
| `"linear"` | Constant speed |
| `"easeIn"` | Slow start |
| `"easeOut"` | Slow end |
| `"easeInOut"` | Slow start + end |
| `"cinematic"` | Custom bezier for film feel |

### Camera Implementation (Renderer)

```typescript
// @tokovo/renderer/src/camera.ts

function applyCameraTransform(
    world: WorldState,
    frame: number
): React.CSSProperties {
    const { camera } = world;
    
    // Interpolate between keyframes
    const state = interpolateCameraState(camera.keyframes, frame);
    
    return {
        transform: `
            translate(${state.x}px, ${state.y}px)
            scale(${state.scale})
            rotate(${state.rotation}deg)
        `,
        transformOrigin: `${state.originX * 100}% ${state.originY * 100}%`
    };
}
```

---

## Audio Track

### API

```typescript
ep.track("audio", audio => {
    // ──────────────────────────────────────
    // BACKGROUND MUSIC (Span)
    // ──────────────────────────────────────
    
    audio.span("0s", "30s").bgm(soundId, {
        volume?: number,        // 0-1 (default: 0.3)
        fadeIn?: string,        // Fade in duration
        fadeOut?: string,       // Fade out duration
    });
    
    // ──────────────────────────────────────
    // CROSSFADE
    // ──────────────────────────────────────
    
    audio.at("28s").crossfade(soundId, {
        duration: string,
        volume?: number
    });
    
    // ──────────────────────────────────────
    // ONE-SHOT SOUND
    // ──────────────────────────────────────
    
    audio.at("10s").play(soundId, {
        volume?: number,
        loop?: boolean
    });
    
    // ──────────────────────────────────────
    // STOP
    // ──────────────────────────────────────
    
    audio.at("20s").stop(soundId);
    audio.at("25s").stopAll();
    
    // ──────────────────────────────────────
    // FADE OUT EVERYTHING
    // ──────────────────────────────────────
    
    audio.at("55s").fadeOut({
        duration: string
    });
});
```

### Sound IDs

Plugins register sounds in their asset manifest:

```typescript
// @tokovo/apps-whatsapp/src/assets.ts
export const WhatsAppAssets = {
    sounds: {
        received: "/sounds/whatsapp/received.mp3",
        sent: "/sounds/whatsapp/sent.mp3",
        typing: "/sounds/whatsapp/typing.mp3"
    }
};

// Usage in episode
audio.at("0s").play("app_whatsapp.received");
```

---

## OS Track

### API

```typescript
ep.track("os", os => {
    // ──────────────────────────────────────
    // SET FULL STATE
    // ──────────────────────────────────────
    
    os.at("0s").set({
        time: Date | number,    // Date or timestamp ms
        battery: number,        // 0-100
        charging?: boolean,
        network: "wifi" | "5G" | "4G" | "3G" | "none",
        strength?: number,      // 1-4 bars
        dnd?: boolean,
        lowPowerMode?: boolean
    });
    
    // ──────────────────────────────────────
    // INDIVIDUAL UPDATES
    // ──────────────────────────────────────
    
    os.at("30s").time(new Date("2024-12-17T20:00"));
    os.at("30s").battery(50);
    os.at("30s").battery(20, { charging: true });
    os.at("45s").network("wifi", { strength: 3 });
    os.at("50s").dnd(true);
    
    // ──────────────────────────────────────
    // NOTIFICATIONS
    // ──────────────────────────────────────
    
    os.at("10s").notification({
        appId: string,
        title: string,
        body: string,
        icon?: string,
        mode?: "headsup" | "lockscreen" | "both"
    });
    
    os.at("15s").dismissNotification(notificationId);
    os.at("20s").dismissAllNotifications();
});
```

---

## Anchors System

Anchors allow camera to focus on semantic content, not pixel coordinates.

### Anchor Registry

Each plugin registers its anchors:

```typescript
// @tokovo/apps-whatsapp/src/anchors.ts

import { AnchorProvider } from "@tokovo/core";

export const WhatsAppAnchors: Record<string, AnchorProvider> = {
    lastMessage: (world, deviceId) => {
        const messages = world.conversations["dm_sarah"]?.messages || [];
        if (messages.length === 0) return null;
        
        // Return bounding rect
        return {
            x: 20,
            y: lastMessageTop,
            width: 340,
            height: lastMessageHeight
        };
    },
    
    inputArea: (world, deviceId) => ({
        x: 0,
        y: 800,
        width: 393,
        height: 52
    }),
    
    header: (world, deviceId) => ({
        x: 0,
        y: 0,
        width: 393,
        height: 60
    }),
    
    // Dynamic anchor for specific message
    "message:*": (world, deviceId, messageId) => {
        const msg = findMessageById(world, messageId);
        return msg?.rect || null;
    }
};
```

### Using Anchors

```typescript
ep.track("camera", cam => {
    cam.at("1s").focus("lastMessage", { scale: 1.15, duration: "0.5s" });
    cam.at("3s").focus("inputArea", { scale: 1.1 });
    cam.at("5s").focus("message:msg_001", { scale: 1.2 });
});
```

### Anchor Resolution (Runtime)

```typescript
// @tokovo/core/src/anchors.ts

function resolveAnchor(
    anchorId: string,
    world: WorldState,
    deviceId: string
): Rect | null {
    // Check all registered plugins
    for (const plugin of PluginRegistry.getAll()) {
        if (plugin.anchors[anchorId]) {
            return plugin.anchors[anchorId](world, deviceId);
        }
        
        // Check wildcard patterns (e.g., "message:*")
        for (const [pattern, resolver] of Object.entries(plugin.anchors)) {
            if (pattern.endsWith(":*")) {
                const prefix = pattern.slice(0, -2);
                if (anchorId.startsWith(prefix + ":")) {
                    const id = anchorId.slice(prefix.length + 1);
                    return resolver(world, deviceId, id);
                }
            }
        }
    }
    
    return null;
}
```

---

## Conflict Resolution

When multiple sources set camera at the same frame:

### Priority Levels

| Priority | Source | Override? |
|----------|--------|-----------|
| **100** | Manual camera track | Always wins |
| **50** | Focus/Track commands | Wins over auto |
| **10** | DirectorLite | Lowest priority |
| **0** | Default state | Fallback |

### Resolution Rules

1. **Per-property resolution**: Each property (x, y, scale) resolves independently
2. **Higher priority wins**: At same frame, higher priority takes precedence
3. **Active animations continue**: An ongoing animation isn't interrupted by lower-priority instant
4. **Last-write-wins within same priority**: If two commands at same priority and frame, later in track wins

### Example

```typescript
// Frame 60:
// - DirectorLite wants: scale=1.1
// - Manual track says: y=-50 (no scale)

// Result: scale=1.1 (from director), y=-50 (from manual)
```

---

## TrackEvent Schema

> **World-class rule**: All app-specific data goes in `payload`. Only routing at top-level.

### Type-Safe Payload Map

```typescript
// @tokovo/ir/src/track-payloads.ts

interface TrackPayloads {
    app_whatsapp: {
        MESSAGE_RECEIVED: {
            conversationId: string;
            from: string;
            text: string;
            silent?: boolean;
            replyTo?: MessageRef;
        };
        MESSAGE_SENT: {
            conversationId: string;
            text: string;
            silent?: boolean;
        };
        TYPING_START: {
            conversationId: string;
            actor: string;
        };
        TYPING_END: {
            conversationId: string;
            actor: string;
        };
        IMAGE_RECEIVED: {
            conversationId: string;
            from: string;
            url: string;
            caption?: string;
        };
        REACT: {
            messageRef: MessageRef;
            emoji: string;
        };
    };
    
    camera: {
        SET: {
            x?: number;
            y?: number;
            scale?: number;
            rotation?: number;
            originX?: number;
            originY?: number;
        };
        ANIMATE_START: {
            x?: number;
            y?: number;
            scale?: number;
            rotation?: number;
            easing: EasingType;
        };
        ANIMATE_END: {};
        FOCUS: {
            anchorId: string;
            scale?: number;
            padding?: number;
            easing?: EasingType;
        };
        TRACK_START: {
            anchorId: string;
            scale?: number;
            lag?: number;
        };
        TRACK_END: {};
        SHAKE: {
            intensityX: number;
            intensityY: number;
            frequency?: number;
            decay?: number;
        };
        RESET: {
            easing?: EasingType;
        };
    };
    
    audio: {
        BGM_START: {
            soundId: string;
            volume: number;
            fadeIn?: number;
        };
        BGM_END: {
            fadeOut?: number;
        };
        PLAY: {
            soundId: string;
            volume?: number;
            loop?: boolean;
        };
        STOP: {
            soundId: string;
        };
        CROSSFADE: {
            soundId: string;
            volume: number;
        };
        FADE_OUT: {};
    };
    
    os: {
        SET_TIME: { time: number };
        SET_BATTERY: { level: number; charging?: boolean };
        SET_NETWORK: { type: string; strength?: number };
        SET_DND: { enabled: boolean };
        NOTIFICATION_SHOW: {
            id: string;
            appId: string;
            title: string;
            body: string;
            icon?: string;
        };
        NOTIFICATION_DISMISS: { id: string };
    };
}
```

### TrackEvent Type (Fully Typed)

```typescript
// @tokovo/ir/src/track-event.ts

type AppId = keyof TrackPayloads;
type AppEventType<A extends AppId> = keyof TrackPayloads[A];

// Base event (shared fields)
interface TrackEventBase {
    at: number;              // Start frame (required)
    duration?: number;       // For spans (frames)
    deviceId?: string;       // Routing only
    appId?: string;          // Routing only (APP events)
}

// Typed event union
type TrackEvent =
    | { kind: "APP"; appId: "app_whatsapp"; type: keyof TrackPayloads["app_whatsapp"]; payload: TrackPayloads["app_whatsapp"][keyof TrackPayloads["app_whatsapp"]] } & TrackEventBase
    | { kind: "CAMERA"; type: keyof TrackPayloads["camera"]; payload: TrackPayloads["camera"][keyof TrackPayloads["camera"]] } & TrackEventBase
    | { kind: "AUDIO"; type: keyof TrackPayloads["audio"]; payload: TrackPayloads["audio"][keyof TrackPayloads["audio"]] } & TrackEventBase
    | { kind: "OS"; type: keyof TrackPayloads["os"]; payload: TrackPayloads["os"][keyof TrackPayloads["os"]] } & TrackEventBase
    | { kind: "MARKER"; type: "MARK" | "SECTION_START" | "SECTION_END"; payload: { id: string } } & TrackEventBase;
```

### Routing vs Payload Separation

| Field | Location | Purpose |
|-------|----------|---------|
| `deviceId` | Top-level | Routing to device |
| `appId` | Top-level | Routing to app reducer |
| `conversationId` | **payload** | App-specific, not routing |
| `from`, `text`, etc. | **payload** | App-specific data |

```typescript
// ✅ CORRECT: conversationId in payload
{
    at: 0,
    kind: "APP",
    appId: "app_whatsapp",
    type: "MESSAGE_RECEIVED",
    payload: {
        conversationId: "dm_sarah",  // ← HERE
        from: "Sarah",
        text: "Hey!"
    }
}

// ❌ WRONG: conversationId at top-level
{
    at: 0,
    kind: "APP",
    appId: "app_whatsapp",
    conversationId: "dm_sarah",  // ← NO!
    payload: { from: "Sarah", text: "Hey!" }
}
```

---

## Frame Rounding Rules

### The Problem

Time strings can produce fractional frames:

| Time | FPS | Raw Frames | Problem |
|------|-----|------------|---------|
| `"500ms"` | 30 | 15.0 | ✅ Exact |
| `"100ms"` | 30 | 3.0 | ✅ Exact |
| `"100ms"` | 24 | 2.4 | ⚠️ Fraction |
| `"1.1s"` | 30 | 33.0 | ✅ Exact |
| `"1.1s"` | 24 | 26.4 | ⚠️ Fraction |

### The Solution: Round to Nearest

```typescript
// @tokovo/dsl/src/utils/time.ts

function parseTimeToFrames(time: string | number, fps: number): number {
    if (typeof time === "number") return time;  // Already frames
    
    let seconds: number;
    if (time.endsWith("ms")) {
        seconds = parseFloat(time) / 1000;
    } else if (time.endsWith("s")) {
        seconds = parseFloat(time);
    } else {
        throw new Error(`Invalid time format: ${time}`);
    }
    
    return Math.round(seconds * fps);  // ← ROUND, not floor/ceil
}
```

### Ordering Stability

When two events resolve to the same frame, maintain **declaration order**:

```typescript
// These both resolve to frame 30 at 30fps
wa.at("1s").receive(...);    // Order: 1
wa.at("1000ms").send(...);   // Order: 2

// Runtime processes in declaration order: receive → send
```

---

## Span Lifecycle Events

### The Problem

Spans like `cam.span("1s", "5s").track(...)` should NOT emit 120 per-frame events.

### The Solution: START/END Lifecycle

```typescript
// Span compiles to exactly 2 events
cam.span("1s", "5s").track("lastMessage", { lag: 0.1 });

// Compiles to:
[
    { at: 30, kind: "CAMERA", type: "TRACK_START", payload: { anchorId: "lastMessage", lag: 0.1 } },
    { at: 150, kind: "CAMERA", type: "TRACK_END", payload: {} }
]
```

### Lifecycle Event Types

| Base Type | START Event | END Event |
|-----------|-------------|-----------|
| `TYPING` | `TYPING_START` | `TYPING_END` |
| `ANIMATE` | `ANIMATE_START` | `ANIMATE_END` |
| `TRACK` | `TRACK_START` | `TRACK_END` |
| `BGM` | `BGM_START` | `BGM_END` |
| `SHAKE` | `SHAKE_START` | `SHAKE_END` |

### Runtime Resolution

The engine interpolates smoothly between START and END:

```typescript
// @tokovo/core/src/camera/interpolator.ts

function resolveCameraAtFrame(
    activeDrivers: CameraDriver[],
    frame: number
): CameraState {
    // Find all active spans at this frame
    const active = activeDrivers.filter(d => 
        d.startFrame <= frame && frame <= d.endFrame
    );
    
    // Interpolate each property
    return {
        x: interpolateProperty(active, "x", frame),
        y: interpolateProperty(active, "y", frame),
        scale: interpolateProperty(active, "scale", frame),
        // ...
    };
}
```

---

## Conflict Resolution

### Priority Levels

| Priority | Source | Can Interrupt? |
|----------|--------|----------------|
| **100** | Manual camera track | Yes, always |
| **50** | Presets (focus, shake) | Yes, lower priority |
| **10** | DirectorLite | No |
| **0** | Default state | - |

### Interruption Rules

> **Critical rule**: Higher priority CAN interrupt lower priority mid-animation.

```typescript
// Example: Manual interrupts Director mid-animation
//
// Frame 0: Director starts animate to scale=1.2 over 60 frames
// Frame 30: Manual track sets scale=1.5
//
// Result: At frame 30, scale snaps to 1.5 (Manual wins)
```

### Span Overlap Rules

When two camera spans overlap:

| Scenario | Resolution |
|----------|------------|
| Same priority, overlapping spans | Last-declared wins (per-property) |
| Different priority, overlapping | Higher priority wins |
| Partial overlap | Higher priority active during overlap |

```typescript
// Example: Two spans overlap
cam.span("0s", "10s").track("header", { scale: 1.1 });       // A: frames 0-300
cam.span("5s", "15s").track("lastMessage", { scale: 1.2 }); // B: frames 150-450

// Result:
// Frames 0-149: A active (scale=1.1, anchor=header)
// Frames 150-300: B wins (last-declared, scale=1.2, anchor=lastMessage)
// Frames 301-450: B active
```

### Implementation

```typescript
// @tokovo/core/src/camera/resolver.ts

function resolveConflicts(drivers: CameraDriver[], frame: number): CameraState {
    const result: CameraState = { ...DEFAULT_CAMERA };
    
    for (const prop of CAMERA_PROPERTIES) {
        // Get drivers affecting this property at this frame
        const active = drivers
            .filter(d => d.property === prop && d.startFrame <= frame && frame <= d.endFrame)
            .sort((a, b) => {
                // 1. Higher priority wins
                if (b.priority !== a.priority) return b.priority - a.priority;
                // 2. Same priority: later declaration wins
                return b.declarationOrder - a.declarationOrder;
            });
        
        if (active.length > 0) {
            const winner = active[0];
            result[prop] = interpolate(
                frame,
                [winner.startFrame, winner.endFrame],
                [winner.startValue, winner.endValue],
                { easing: winner.easing }
            );
        }
    }
    
    return result;
}
```

---

## Build Layering

### The Question

`ep.build()` returns what?

| Option | Returns | Coupling | Use Case |
|--------|---------|----------|----------|
| **A (Cleanest)** | `TrackEpisodeIR` | DSL only | Enterprise layering |
| **B (Best DX)** | `CompiledEpisode` | DSL + Compiler + Core | Creator convenience |

### Decision: Option A (Cleanest Layering)

```typescript
// @tokovo/dsl returns intermediate representation
const ir: TrackEpisodeIR = ep.build();

interface TrackEpisodeIR {
    id: string;
    fps: number;
    durationInFrames: number;
    devices: DeviceConfig[];
    tracks: TrackEvent[];
    markers: Marker[];
    sections: Section[];
    director?: DirectorStyle;
}

// @tokovo/compiler + @tokovo/core transform to final
const compiled: CompiledEpisode = prepareEpisode(ir, plugins);
```

### Why Option A?

1. **Clear package boundaries**: DSL doesn't import compiler/core
2. **Testable in isolation**: Each layer can be unit tested
3. **Future extensibility**: New compilers, interpreters, etc.
4. **No hidden registries**: Explicit plugin passing

### Video Component Usage

```typescript
// apps/video-runner/src/MyVideo.tsx

import { episode } from "@tokovo/dsl";
import { prepareEpisode, runEpisode } from "@tokovo/core";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";

// 1. Author (DSL → TrackEpisodeIR)
const ir = episode("demo", { fps: 30, duration: "30s" })
    .device("phone", "iphone16", { ... })
    .track("app_whatsapp", wa => { ... })
    .build();

// 2. Prepare (TrackEpisodeIR → CompiledEpisode)
const compiled = prepareEpisode(ir, [WhatsAppPluginV2]);

// 3. Run (per-frame)
export const MyVideo = () => {
    const frame = useCurrentFrame();
    const world = runEpisode(compiled, frame);
    return <TokovoRenderer world={world} t={frame} />;
};
```

---

## Canonical Truth: No Bypass

> **World-class rule**: The runtime ONLY accepts `CompiledEpisode`. No legacy paths.

### Enforced Constraints

| Rule | Enforcement |
|------|-------------|
| Runtime only accepts `CompiledEpisode` | TypeScript: `runEpisode(compiled: CompiledEpisode, frame)` |
| Engine only replays `RuntimeEvent[]` | `CompiledEpisode.events: RuntimeEvent[]` |
| No handcrafted world | `initialWorld` derived from `TrackEpisodeIR` |
| No legacy `TimelineEvent` | Deprecated, removed from public API |

### What Gets Deprecated

```typescript
// ❌ DEPRECATED - Direct world manipulation
const world: WorldState = { devices: {...}, conversations: {...} };
runEpisode({ world }, frame);  // NO!

// ❌ DEPRECATED - Raw events array
const events: RuntimeEvent[] = [...];
runEpisode({ events }, frame);  // NO!

// ❌ DEPRECATED - Beat-based DSL
episode("demo", ep => {
    ep.device("Phone", "iphone16", d => {
        d.beat("intro", b => { ... });  // NO MORE BEATS
    });
});

// ✅ CORRECT - Track-based DSL → IR → Compiled
const ir = episode("demo", { ... }).track(...).build();
const compiled = prepareEpisode(ir, plugins);
runEpisode(compiled, frame);
```

### Type-Level Enforcement

```typescript
// @tokovo/core/src/run.ts

export function runEpisode(
    compiled: CompiledEpisode,  // ← ONLY this type
    frame: number,
    options?: RunOptions
): WorldState {
    // No overloads, no legacy paths
}

// Compile-time errors if you try:
runEpisode({ events: [] }, 0);  // ❌ Type error
runEpisode({ world: {} }, 0);   // ❌ Type error
```

---

## Implementation Plan

### Phase 1: Core Types (2 hours)

| File | Change |
|------|--------|
| `@tokovo/ir/src/track-event.ts` | NEW: `TrackEvent` interface |
| `@tokovo/core/src/types/anchor.ts` | NEW: `Anchor`, `AnchorProvider` types |
| `@tokovo/core/src/types/plugin-track-contract.ts` | NEW: Plugin track contract |

### Phase 2: Timeline Episode Builder (3 hours)

| File | Change |
|------|--------|
| `@tokovo/dsl/src/timeline-episode.ts` | NEW: `episode()`, `TimelineEpisode` class |
| `@tokovo/dsl/src/track-builder.ts` | NEW: Base `TrackBuilder` class |
| `@tokovo/dsl/src/camera-track.ts` | NEW: `CameraTrack` with god mode |
| `@tokovo/dsl/src/audio-track.ts` | NEW: `AudioTrack` |
| `@tokovo/dsl/src/os-track.ts` | NEW: `OSTrack` |

### Phase 3: Anchor System (2 hours)

| File | Change |
|------|--------|
| `@tokovo/core/src/anchors/registry.ts` | NEW: Global anchor registry |
| `@tokovo/core/src/anchors/resolver.ts` | NEW: Anchor resolution |
| `@tokovo/apps-whatsapp/src/anchors.ts` | NEW: WhatsApp anchors |

### Phase 4: Conflict Resolution (2 hours)

| File | Change |
|------|--------|
| `@tokovo/core/src/camera/resolver.ts` | NEW: Camera conflict resolution |
| `@tokovo/core/src/camera/interpolator.ts` | NEW: Keyframe interpolation |

### Phase 5: Plugin Track Integration (3 hours)

| File | Change |
|------|--------|
| `@tokovo/apps-whatsapp/src/track.ts` | NEW: WhatsApp track builder |
| `@tokovo/apps-whatsapp/src/contract.ts` | NEW: Track contract implementation |
| `@tokovo/compiler/src/lowering/track.ts` | NEW: Track → RuntimeEvent lowering |

### Phase 6: Testing & Docs (2 hours)

| File | Change |
|------|--------|
| `packages/episodes/src/track-demo.episode.ts` | NEW: Demo episode using new API |
| `docs-v2/03-DSL-REFERENCE.md` | UPDATE: New track-based DSL |

### Total Effort: ~14 hours

---

## Migration Guide

### Old (Beats)

```typescript
const sceneIR = episode("demo", ep => {
    ep.device("Phone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_sarah", { name: "Sarah" });
        
        d.beat("intro", b => {
            b.wait("500ms");
            b.receive("Sarah", "Hey!");
            b.wait("1s");
            b.typing("me").for("1.5s");
            b.send("Hi!");
            b.camera(c => c.focus("lastMessage"));
        });
    });
});
```

### New (Tracks)

```typescript
const ep = episode("demo", { fps: 30, duration: "10s" });

ep.device("phone", "iphone16", {
    app: "app_whatsapp",
    conversations: [{ id: "dm_sarah", name: "Sarah" }]
});

ep.track("app_whatsapp", wa => {
    wa.at("500ms").receive("dm_sarah", { from: "Sarah", text: "Hey!" });
    wa.span("1.5s", "3s").typing("dm_sarah", "me");
    wa.at("3s").send("dm_sarah", { text: "Hi!" });
});

ep.track("camera", cam => {
    cam.at("3.5s").focus("lastMessage", { scale: 1.1, duration: "0.5s" });
});

const compiled = ep.build();
```

---

## Complete Examples

### Example 1: Romantic Drama

```typescript
const ep = episode("romantic-drama", { fps: 30, duration: "60s" });

ep.device("phone", "iphone16", {
    app: "app_whatsapp",
    conversations: [
        { id: "dm_sarah", name: "Sarah ❤️" }
    ],
    os: { time: new Date("2024-12-17T19:30"), battery: 87 }
});

ep.director("ViralDramaV1");

ep.track("audio", audio => {
    audio.span("0s", "25s").bgm("romantic_ambient", { volume: 0.2 });
    audio.at("23s").crossfade("tense_strings", { duration: "4s", volume: 0.4 });
    audio.at("55s").fadeOut({ duration: "5s" });
});

ep.track("app_whatsapp", wa => {
    // Opening
    wa.at("0s").receive("dm_sarah", { from: "Sarah", text: "Hey baby! 💕" });
    wa.span("2s", "4s").typing("dm_sarah", "me");
    wa.at("4s").send("dm_sarah", { text: "Hey you! 😊" });
    
    // Building tension
    wa.span("6s", "8s").typing("dm_sarah", "Sarah");
    wa.at("8s").receive("dm_sarah", { from: "Sarah", text: "I need to tell you something..." });
    
    // Long pause
    wa.span("12s", "18s").typing("dm_sarah", "Sarah");
    
    // The reveal
    wa.at("18s").receive("dm_sarah", { from: "Sarah", text: "I got the job! We can move in together! 🎉🏠" });
    
    // Celebration
    wa.span("20s", "21s").typing("dm_sarah", "me");
    wa.at("21s").send("dm_sarah", { text: "OMG YES!! 🎊🎊🎊" });
});

ep.track("camera", cam => {
    cam.at("0s").set({ scale: 1 });
    cam.at("1s").focus("lastMessage", { scale: 1.05, duration: "0.5s" });
    
    // Dramatic zoom during tension
    cam.at("8s").animate({ scale: 1.15, y: -30, duration: "2s", easing: "cinematic" });
    
    // Hold during long typing
    cam.at("12s").animate({ scale: 1.25, duration: "6s", easing: "linear" });
    
    // Shake on reveal
    cam.at("18s").shake({ intensityX: 8, intensityY: 5, duration: "0.4s" });
    
    // Pull back for celebration
    cam.at("20s").reset({ duration: "1s" });
});

ep.track("os", os => {
    os.at("30s").time(new Date("2024-12-17T19:45"));
    os.at("45s").battery(75);
});

ep.mark("opening", "0s");
ep.mark("tension", "8s");
ep.mark("reveal", "18s");
ep.section("intro", "0s", "8s");
ep.section("climax", "8s", "22s");
ep.section("resolution", "22s", "60s");

const compiled = ep.build();
```

### Example 2: Multi-App Notification Drama

```typescript
const ep = episode("notification-chaos", { fps: 30, duration: "30s" });

ep.device("phone", "iphone16", {
    app: "app_whatsapp",
    conversations: [
        { id: "dm_sarah", name: "Sarah" },
        { id: "dm_boss", name: "Boss 👔" }
    ]
});

ep.track("app_whatsapp", wa => {
    wa.at("0s").receive("dm_sarah", { from: "Sarah", text: "Dinner tonight?" });
    wa.span("2s", "4s").typing("dm_sarah", "me");
    wa.at("4s").send("dm_sarah", { text: "Sure! What time?" });
});

ep.track("os", os => {
    // Boss interrupts
    os.at("5s").notification({
        appId: "app_whatsapp",
        title: "Boss 👔",
        body: "WHERE IS THE REPORT?!",
        mode: "headsup"
    });
});

ep.track("camera", cam => {
    cam.at("5s").shake({ intensityX: 10, intensityY: 6, duration: "0.5s" });
    cam.at("5.5s").animate({ scale: 0.9, duration: "0.3s" });  // Pull back to show notification
});

const compiled = ep.build();
```
