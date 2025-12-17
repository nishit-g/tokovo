# 📚 TOKOVO DEVELOPER BIBLE

> **The definitive guide to the Tokovo platform.**  
> Version 2.0 | Enterprise Edition

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture](#2-architecture)
3. [Core Concepts](#3-core-concepts)
4. [The Pipeline](#4-the-pipeline)
5. [Plugin System](#5-plugin-system)
6. [DSL Reference](#6-dsl-reference)
7. [Renderer](#7-renderer)
8. [Camera System](#8-camera-system)
9. [Audio System](#9-audio-system)
10. [Creating Episodes](#10-creating-episodes)
11. [Creating Plugins](#11-creating-plugins)
12. [Type Reference](#12-type-reference)
13. [Troubleshooting](#13-troubleshooting)

---

# 1. Platform Overview

## What is Tokovo?

Tokovo is a **video authoring platform** for creating cinematic phone UI simulations. Think "Final Cut Pro for phone screen recordings" - but with superpowers:

- **Deterministic rendering** via Remotion
- **DSL-first authoring** - write scripts, not timelines
- **Plugin architecture** - add any app (WhatsApp, Twitter, Instagram)
- **Cinematic camera** - ZOOM, PAN, SHAKE, FOCUS
- **Audio-reactive** - sounds sync to events automatically

## Tech Stack

| Layer | Technology |
|-------|------------|
| Video Render | [Remotion](https://remotion.dev) |
| UI | React 18 + TypeScript |
| State | Immer (immutable updates) |
| Package Manager | pnpm (monorepo) |
| Build | Turbo + TypeScript |

---

# 2. Architecture

## Package Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                           apps/video-runner                         │
│                        (Remotion Compositions)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         @tokovo/renderer                            │
│                 (TokovoRenderer, Camera, Layout)                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
           │ @tokovo/core  │ │ @tokovo/apps- │ │ @tokovo/      │
           │               │ │ whatsapp      │ │ devices       │
           │ - Engine      │ │ - Views       │ │ - iPhone      │
           │ - Reducers    │ │ - Reducer     │ │ - Android     │
           │ - prepare()   │ │ - DSL         │ │               │
           └───────────────┘ └───────────────┘ └───────────────┘
                    │
                    ▼
           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
           │ @tokovo/dsl   │ │ @tokovo/      │ │ @tokovo/ir    │
           │               │ │ compiler      │ │               │
           │ - episode()   │ │ - compile()   │ │ - Types       │
           │ - d.beat()    │ │ - timing      │ │ - SceneIR     │
           └───────────────┘ └───────────────┘ └───────────────┘
```

## Data Flow

```
DSL → SceneIR → compile() → TimelineOps → lower() → RuntimeEvents → replay() → WorldState → render()
```

---

# 3. Core Concepts

## WorldState

The **single source of truth** for the entire simulation at any frame:

```typescript
interface WorldState {
    devices: Record<string, DeviceState>;    // Phone states
    conversations: Record<string, Conversation>; // Chat data
    appState: Record<string, any>;           // Per-app state
    camera: CameraState;                     // Camera effects
    audio: AudioState;                       // Active sounds
    touches: TouchState[];                   // Active touches
}
```

## RuntimeEvent

An **immutable fact** that happened at a specific frame:

```typescript
interface RuntimeEvent {
    at: number;           // Frame number
    kind: "APP" | "DEVICE" | "CAMERA" | "AUDIO" | "KEYBOARD";
    type: string;         // Event subtype
    payload: unknown;     // Event data
    _trace?: Trace;       // Source location (for debugging)
}
```

## CompiledEpisode

The **only input to the runtime**:

```typescript
interface CompiledEpisode {
    id: string;
    durationInFrames: number;
    fps: number;
    initialWorld: WorldState;    // DERIVED, not hand-crafted
    events: RuntimeEvent[];      // Sorted by `at`
    assets: AssetManifest;       // Validated at compile time
}
```

## Plugin

A **self-contained app package**:

```typescript
interface TokovoPluginContract {
    id: string;                  // "app_whatsapp"
    version: string;
    displayName: string;
    
    // Tier A: Runtime
    reducer: PluginReducer;
    views: { AppRoot: React.FC };
    
    // Tier B: Lowering (optional)
    lowering?: LoweringHandler;
    
    // Tier C: DSL (optional)
    dsl?: { createApi: (b) => DslApi };
}
```

---

# 4. The Pipeline

## The Golden Rule

```typescript
// THE ONLY WAY TO RENDER AN EPISODE:
const compiled = prepareEpisode(input, plugins, options);
const world = runEpisode(compiled, frame);
<TokovoRenderer world={world} t={frame} />

// THESE ARE ALL FORBIDDEN:
❌ replay(sceneIR, events, t)           // SceneIR not allowed
❌ replay(world, rawEventArray, t)      // Raw arrays not allowed
❌ <TokovoRenderer world={handCraftedWorld} />  // Hand-crafted forbidden
```

## Pipeline Stages

### Stage 1: DSL Authoring

```typescript
import { episode, d, b } from "@tokovo/dsl";

export const myEpisode = episode("demo", ep => {
    ep.device("phone", d => {
        d.app("app_whatsapp");
        d.conversation("dm_sarah", { name: "Sarah ❤️", type: "dm" });
        
        d.beat("intro", b => {
            b.receive("Sarah", "Hey!");
            b.typing("me", "1s");
            b.send("Hi there!");
        });
    });
});
```

### Stage 2: Compile

```typescript
import { compile } from "@tokovo/compiler";

const { timeline, validation } = compile(myEpisode);
// timeline.ops = TimelineOp[] with frame numbers
```

### Stage 3: Prepare

```typescript
import { prepareEpisode } from "@tokovo/core";

const compiled = prepareEpisode(
    { id: "demo", events: timeline.ops, sceneIR: myEpisode, ... },
    [WhatsAppPluginV2],
    { mode: "preview", strict: false }
);
```

### Stage 4: Replay

```typescript
import { runEpisode } from "@tokovo/core";

// In your Remotion component:
const frame = useCurrentFrame();
const world = useMemo(() => runEpisode(compiled, frame), [frame]);
```

### Stage 5: Render

```typescript
import { TokovoRenderer } from "@tokovo/renderer";

return <TokovoRenderer world={world} t={frame} />;
```

---

# 5. Plugin System

## Plugin Tiers

| Tier | Name | Required | Purpose |
|------|------|----------|---------|
| A | Runtime | ✓ | reducer, views, assets |
| B | Lowering | ○ | TimelineOp → RuntimeEvent |
| C | DSL | ○ | b.use("appId").method() |
| D | Compiler | ○ | Validation, optimization |

## Creating a Plugin

```bash
pnpm create-plugin instagram
```

This generates:

```
packages/apps-instagram/
├── package.json
└── src/
    ├── index.ts          # Exports
    ├── plugin.ts         # TokovoPluginContract
    ├── types.ts          # Message, Conversation types
    ├── lowering.ts       # TimelineOp → RuntimeEvent
    ├── dsl-extension.ts  # b.use() API
    └── logic/
        └── reducer.ts    # State reducer
```

## DSL Extension Pattern

```typescript
// In your plugin:
dsl: {
    createApi: (builder) => ({
        post: (text: string, images?: string[]) => {
            builder.ops.push({
                kind: "CreatePost",
                text,
                images,
            });
            return builder;
        },
    }),
}

// Usage in episode:
d.beat("post", b => {
    b.use("app_instagram").post("Hello world!", ["img1.jpg"]);
});
```

---

# 6. DSL Reference

## Episode Structure

```typescript
episode("id", ep => {
    ep.fps(30);                    // Frames per second
    ep.duration("10s");            // Total duration
    
    ep.device("phone", d => {
        d.profile("iphone16");     // Device profile
        d.app("app_whatsapp");     // Foreground app
        
        d.conversation("id", { name, type, avatar });
        
        d.beat("name", b => {
            // Message events
            b.receive("from", "text");
            b.send("text");
            b.typing("who", "duration");
            
            // Camera events
            b.zoom(1.2, { duration: "0.5s" });
            b.pan({ x: 100, y: 0 });
            b.shake({ intensity: 5 });
            
            // Audio events
            b.sfx("sound_id");
            b.music("track", { volume: 0.5 });
        });
    });
});
```

## Timing

```typescript
// Duration strings
"30f"     // 30 frames
"1s"      // 1 second (= 30 frames at 30fps)
"500ms"   // 500 milliseconds
"1.5s"    // 1.5 seconds

// Beat timing
d.beat("intro", 60, b => { ... });  // Start at frame 60
d.beat("outro", "2s", b => { ... }); // Start at 2 seconds
```

---

# 7. Renderer

## TokovoRenderer Props

```typescript
interface TokovoRendererProps {
    world: WorldState;         // Required
    t: number;                 // Current frame
    debug?: boolean;           // Show debug overlay
    eventIndex?: EventIndex;   // For DirectorLite
    directorEnabled?: boolean; // Auto camera
    pluginManager?: PluginManagerClass;
}
```

## Layers

1. **App View** - The actual app UI
2. **System Overlays** - Notifications, Dynamic Island
3. **Keyboard** - Virtual keyboard surface
4. **Camera Transform** - Wraps everything

---

# 8. Camera System

## Camera Events

| Type | Payload | Description |
|------|---------|-------------|
| ZOOM | `{ scale, originX, originY, duration, easing }` | Scale camera |
| PAN | `{ translateX, translateY, duration, easing }` | Move camera |
| SHAKE | `{ intensity, frequency, duration, decay }` | Screen shake |
| FOCUS | `{ anchorId, scale, duration }` | Focus on anchor |
| RESET | `{ duration, easing }` | Return to default |
| CUT | `{ scale, translateX, translateY }` | Instant change |

## DSL Usage

```typescript
d.beat("drama", b => {
    b.zoom(1.5, { origin: "center", duration: "0.5s", easing: "ease-out" });
    b.pan({ x: -50, y: 0 }, { duration: "0.3s" });
    b.shake({ intensity: 10, duration: "0.5s" });
    b.focus("anchor_message_3", { scale: 1.2 });
});
```

## Anchors

Anchors are semantic identifiers for UI elements:

```typescript
// In app view:
<div data-anchor="message_sarah_3">...</div>

// In DSL:
b.focus("message_sarah_3"); // Camera finds and zooms to this element
```

---

# 9. Audio System

## Audio Events

| Type | Payload | Description |
|------|---------|-------------|
| PLAY_ONE_SHOT | `{ soundId, volume }` | Play sound once |
| START_LOOP | `{ soundId, instanceId }` | Start looping sound |
| STOP | `{ instanceId }` | Stop sound |
| DUCK | `{ targetBus, amount, duration }` | Duck audio |

## Auto Sound

Plugins can declare audio rules:

```typescript
audioRules: [
    {
        matchEvent: { kind: "APP", type: "MESSAGE_RECEIVED" },
        sound: "message_in",
        volume: 1.0,
    },
]
```

---

# 10. Creating Episodes

## Quick Start

```bash
pnpm create-episode my-drama
```

## Video Component

```typescript
// apps/video-runner/src/MyDramaVideo.tsx
import { useCurrentFrame } from "remotion";
import { prepareEpisode, runEpisode } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { myDrama } from "@tokovo/episodes";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";

const compiled = prepareEpisode(myDrama, [WhatsAppPluginV2]);

export const MyDramaVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const world = useMemo(() => runEpisode(compiled, frame), [frame]);
    
    return <TokovoRenderer world={world} t={frame} />;
};
```

## Register in Root.tsx

```typescript
<Composition
    id="MyDrama"
    component={MyDramaVideo}
    durationInFrames={compiled.durationInFrames}
    fps={compiled.fps}
    width={430}
    height={932}
/>
```

---

# 11. Creating Plugins

## Quick Start

```bash
pnpm create-plugin instagram
```

## Plugin Structure

### plugin.ts

```typescript
export const InstagramPlugin: TokovoPluginContract = {
    id: "app_instagram",
    version: "1.0.0",
    displayName: "Instagram",
    
    reducer: instagramReducer,
    views: { AppRoot: InstagramView },
    assets: {
        sounds: { notification: "/audio/instagram/notif.mp3" },
        icons: { app: "/icons/instagram.svg" },
    },
    
    lowering: {
        handles: ["CreatePost", "Like", "Comment"],
        lower: (op, ctx) => { ... },
    },
    
    dsl: {
        createApi: (builder) => ({
            post: (text, images) => { ... },
        }),
    },
};
```

### types.ts

```typescript
export interface InstagramPost {
    id: string;
    author: string;
    text: string;
    images: string[];
    likes: number;
    comments: Comment[];
}

export interface InstagramState {
    feed: InstagramPost[];
    stories: Story[];
}
```

### reducer.ts

```typescript
export function instagramReducer(draft: WorldState, event: RuntimeEvent): void {
    if (event.kind !== "APP" || event.appId !== "app_instagram") return;
    
    const state = getInstagramState(draft);
    
    switch (event.type) {
        case "POST_CREATED":
            state.feed.unshift(event.payload);
            break;
        // ...
    }
}
```

---

# 12. Type Reference

## Event Kinds

```typescript
type RuntimeEventKind = "APP" | "DEVICE" | "CAMERA" | "AUDIO" | "KEYBOARD";
```

## Device Event Types

```typescript
type DeviceEventType = 
    | "UNLOCK" 
    | "LOCK" 
    | "OPEN_APP" 
    | "CLOSE_APP" 
    | "GO_HOME"
    | "SHOW_NOTIFICATION";
```

## Camera Event Types

```typescript
type CameraEventType = 
    | "ZOOM" 
    | "PAN" 
    | "SHAKE" 
    | "FOCUS" 
    | "RESET" 
    | "CUT"
    | "ANCHOR_FOCUS"
    | "SET_LAYOUT";
```

## Audio Event Types

```typescript
type AudioEventType = 
    | "PLAY_ONE_SHOT" 
    | "START_LOOP" 
    | "STOP" 
    | "DUCK" 
    | "CROSSFADE";
```

---

# 13. Troubleshooting

## Common Issues

### "Black screen in device frame"

**Cause**: Plugin not registered, or app state not initialized.

**Fix**:
1. Check plugin is passed to `prepareEpisode()`
2. Check `world.appState` has the app ID
3. Enable `debug={true}` on TokovoRenderer

### "Events not applied"

**Cause**: Event format mismatch or wrong frame timing.

**Fix**:
1. Check `event.at` is a number
2. Check `event.kind` matches reducer
3. Check `event.payload` has required fields
4. Log events in reducer

### "Camera not moving"

**Cause**: Camera events not in timeline, or DirectorLite disabled.

**Fix**:
1. Check events include CAMERA kind
2. Enable `directorEnabled={true}`
3. Check `world.camera.activeEffects`

### "Type errors with as any"

**Cause**: Event types don't match between packages.

**Fix**:
1. Use `RuntimeEvent` from `@tokovo/core`
2. Check package versions match
3. Run `pnpm install` to sync

## Debug Mode

```typescript
<TokovoRenderer
    world={world}
    t={frame}
    debug={true}           // Shows visual debugger
    directorDebug={true}   // Logs camera decisions
/>
```

## Console Logs

```typescript
// In your video component:
console.log("[Debug] WorldState:", world);
console.log("[Debug] Events:", compiled.events);
console.log("[Debug] AppState:", world.appState);
```

---

# Appendix

## Package Versions

| Package | Version |
|---------|---------|
| @tokovo/core | 1.0.0 |
| @tokovo/dsl | 1.0.0 |
| @tokovo/compiler | 1.0.0 |
| @tokovo/renderer | 1.0.0 |
| @tokovo/ir | 1.0.0 |
| remotion | 4.x |

## File Locations

| What | Where |
|------|-------|
| Episodes | `packages/episodes/src/*.episode.ts` |
| Plugins | `packages/apps-*/src/` |
| Video Components | `apps/video-runner/src/*Video.tsx` |
| Device Profiles | `packages/devices/src/*.ts` |
| Documentation | `docs/*.md` |

## Contact

- **Maintainer**: Tokovo Team
- **Repository**: github.com/tokovo/tokovo

---

> *"Write scripts, not timelines."*  
> — The Tokovo Way
