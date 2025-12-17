# FUCKING_MESS.md
## The Definitive Tokovo Architecture Fix

> **One file to rule them all. Read this, understand everything.**

---

# SECTION 1: THE ROOT CAUSE

## 1.1 The One Sentence Summary

You built a compiler + adapters + DSL, but your runtime path still often consumes **handcrafted RuntimeEvents** because the **canonical pipeline wasn't enforced**.

## 1.2 The Type Split That Causes EVERYTHING

You have THREE representations that don't match:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   DSL Layer (@tokovo/dsl)                                               │
│   ─────────────────────────                                             │
│   BeatBuilder produces: SceneOp                                         │
│   Example: { kind: "ReceiveMessage", actor: "Sarah", text: "Hi" }       │
│   NO FRAME NUMBERS. NO TIME. Just semantic intent.                      │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Compiler Layer (@tokovo/compiler)                                     │
│   ─────────────────────────────────                                     │
│   Produces: TimelineOp                                                  │
│   Example: { at: 60, kind: "MessageReceived", actor: "Sarah", ... }     │
│   HAS FRAME NUMBERS. But still "IR kinds" not "runtime kinds".          │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Runtime Layer (@tokovo/core)                                          │
│   ────────────────────────────                                          │
│   Expects: TimelineEvent                                                │
│   Example: { at: 60, kind: "APP", type: "MESSAGE_RECEIVED", ... }       │
│   DIFFERENT SHAPE. "APP" kind with "type" field.                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**THE BREAK**: Nobody enforces the transformation between layers.

---

## 1.3 Every Symptom Has The Same Root Cause

| What You Saw | Why It Happened |
|--------------|-----------------|
| "Passed SceneIR to replay(), nothing happened" | SceneIR has no frames, wrong shape |
| "WhatsApp reducer expects X, adapter emits Y" | TimelineOp shape ≠ RuntimeEvent shape |
| "Audio rules don't match" | Rules match `MessageReceived`, events are `APP`+`MESSAGE_RECEIVED` |
| "6 manual steps per episode" | No `prepareEpisode()` function |
| "Screen name mismatch" | No type-safe literals |
| "Family group messages don't appear" | Reducer expects `from` at event level, adapter put it inside `message` |

**ALL SAME DISEASE**: No canonical pipeline.

---

# SECTION 2: WHAT WE WANT (Enterprise Definition)

## 2.1 The Hard Constraints

1. **ONE executable input to runtime**: `CompiledEpisode`
2. **ONE canonical event schema**: `RuntimeEvent`
3. **NO bypass paths**: You cannot pass raw arrays to render
4. **DETERMINISM**: Same episode → identical render every time
5. **STRICT validation**: Errors, not silent failures

## 2.2 The Plugin Ecosystem

- Core knows NOTHING about WhatsApp/Twitter
- Plugins "teach" the system via registries
- When you register a plugin, its types become available everywhere

---

# SECTION 3: THE CANONICAL ARCHITECTURE

## 3.1 The Data Pipeline (Memorize This)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   1. AUTHOR writes DSL                                                  │
│   ──────────────────────                                                │
│   episode("whatsapp-demo", ep => {                                      │
│       ep.device("phone", d => {                                         │
│           d.whatsapp.receive("Sarah", "Hey!");  // <-- plugin DSL       │
│       });                                                               │
│   });                                                                   │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                    │                                    │
│                                    ▼                                    │
│                                                                         │
│   2. DSL produces: SceneIR                                              │
│   ────────────────────────                                              │
│   { episodeId, devices: [{ beats: [{ ops: [...] }] }] }                 │
│   No frame numbers yet. Just semantic operations.                       │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                    │                                    │
│                                    ▼                                    │
│                                                                         │
│   3. COMPILER runs: compile(sceneIR)                                    │
│   ──────────────────────────────────                                    │
│   - Resolves timing (durations → frame numbers)                         │
│   - Validates conversations exist                                       │
│   - Normalizes operations                                               │
│   Produces: TimelineIR { ops: TimelineOp[] }                            │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                    │                                    │
│                                    ▼                                    │
│                                                                         │
│   4. ADAPTER runs: lowerAll(timelineIR)                                 │
│   ─────────────────────────────────────                                 │
│   - Each plugin provides its own lowering logic                         │
│   - Converts TimelineOp → RuntimeEvent                                  │
│   Produces: RuntimeEvent[]                                              │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                    │                                    │
│                                    ▼                                    │
│                                                                         │
│   5. PACKAGER creates: CompiledEpisode                                  │
│   ────────────────────────────────────                                  │
│   - Derives initialWorld from SceneIR                                   │
│   - Bundles events + assets                                             │
│   - Validates everything                                                │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                    │                                    │
│                                    ▼                                    │
│                                                                         │
│   6. RUNTIME runs: replay(episode, t)                                   │
│   ───────────────────────────────────                                   │
│   - Applies RuntimeEvent[] to WorldState                                │
│   - Renderer displays WorldState                                        │
│   - Audio plays from AUDIO events                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3.2 The Golden Rule

```typescript
// THE ONLY WAY TO RENDER AN EPISODE:
const compiled = prepareEpisode(mySchema);
const world = run(compiled, frame);
<TokovoRenderer world={world} />

// THESE ARE ALL FORBIDDEN:
❌ replay(sceneIR, events, t)           // SceneIR not allowed
❌ replay(world, rawEventArray, t)      // Raw arrays not allowed
❌ <TokovoRenderer world={handCraftedWorld} />  // Hand-crafted not allowed
```

---

# SECTION 4: THE RUNTIME EVENT SCHEMA

## 4.1 The Canonical Shape (CORRECTED)

> ⚠️ **CRITICAL FIX**: All plugin-specific data goes in `payload` field.
> This prevents "from/text location mismatch" bugs forever.

```typescript
export type RuntimeEvent =
  | AppEvent
  | DeviceEvent
  | CameraEvent
  | AudioEvent
  | KeyboardEvent;

// ═══════════════════════════════════════════════════════════════════════
// APP EVENT - Uses discriminated payload
// ═══════════════════════════════════════════════════════════════════════
interface AppEvent<AppId extends string = string, Type extends string = string, Payload = unknown> {
  at: number;            // Frame number
  kind: "APP";           // Always "APP"
  appId: AppId;          // e.g., "app_whatsapp"
  type: Type;            // e.g., "MESSAGE_RECEIVED"
  deviceId?: string;     // Optional device context
  payload: Payload;      // 👈 ALL plugin data goes here
}

// Example:
// { at: 60, kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED",
//   payload: { from: "Sarah", text: "Hi", conversationId: "dm_sarah" } }

// ═══════════════════════════════════════════════════════════════════════
// OTHER EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════
interface DeviceEvent {
  at: number;
  kind: "DEVICE";
  deviceId: string;
  type: "UNLOCK" | "LOCK" | "OPEN_APP" | "CLOSE_APP" | "NOTIFICATION";
  payload?: unknown;
}

interface CameraEvent {
  at: number;
  kind: "CAMERA";
  type: "ZOOM" | "PAN" | "SHAKE" | "FOCUS" | "CUT";
  deviceId?: string;
  payload: { scale?: number; duration?: number; easing?: string; };
}

interface AudioEvent {
  at: number;
  kind: "AUDIO";
  type: "PLAY_ONE_SHOT" | "START_LOOP" | "STOP" | "DUCK";
  payload: { soundId: string; instanceId?: string; volume?: number; };
}

interface KeyboardEvent {
  at: number;
  kind: "KEYBOARD";
  deviceId: string;
  type: "SHOW" | "HIDE" | "KEY_DOWN" | "KEY_UP";
  payload?: { key?: string; };
}
```

**WHY `payload` FIELD?**
- Reducers always read `event.payload.from`, not `event.from`
- Eliminates 50% of mismatch bugs
- Payload shape is typed per plugin via augmentation

## 4.2 Type Safety Via Module Augmentation (CORRECTED)

> ⚠️ **IMPORTANT**: Type augmentation happens at **compile time** (when package is imported),
> NOT at runtime when you call `registerPlugin()`. These are separate.

```typescript
// In @tokovo/apps-whatsapp/src/augment.ts
// This file ships with the plugin package
// Types become available when app imports the plugin

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

// Usage in reducer:
if (event.appId === "app_whatsapp" && event.type === "MESSAGE_RECEIVED") {
  event.payload.from  // TypeScript: string ✓
  event.payload.text  // TypeScript: string ✓
}
```

**HOW TO MAKE IT "FEEL" AUTOMATIC**:
```typescript
// In apps/video-runner/src/plugins.ts
import "@tokovo/apps-whatsapp";  // 👈 Import triggers type augmentation
import "@tokovo/apps-twitter";

// Now all plugin types are available everywhere
```

---

# SECTION 5: THE COMPILED EPISODE

## 5.1 The Structure

```typescript
export interface CompiledEpisode {
  // Metadata
  id: string;
  title?: string;
  durationInFrames: number;
  fps: number;

  // The only runtime inputs
  initialWorld: WorldState;  // DERIVED, not hand-crafted
  events: RuntimeEvent[];    // Sorted by `at`

  // Assets (validated at compile time)
  assets: {
    sounds: Record<string, string>;  // soundId -> path
    images?: Record<string, string>;
    fonts?: Record<string, string>;
  };

  // Multi-device layout
  layout?: {
    mode: "SINGLE" | "SPLIT" | "GRID";
    devices: Array<{
      deviceId: string;
      region: { x: number; y: number; width: number; height: number };
    }>;
  };

  // Debugging
  debug?: {
    sourceMap?: Map<RuntimeEvent, { file: string; line: number }>;
    buildInfo?: { timestamp: number; version: string };
  };
}
```

## 5.2 initialWorld Is DERIVED (Not Hand-Crafted)

**OLD WAY (BROKEN)**:
```typescript
// You had to write this manually:
const initialWorld: WorldState = {
  devices: { phone: { ... } },
  conversations: { dm_sarah: { id: "dm_sarah", messages: [] } },  // Manual!
  appState: { app_whatsapp: { screen: "chats" } },  // Manual!
};
```

**NEW WAY (AUTOMATIC)**:
```typescript
// SceneIR defines conversations:
d.conversation("dm_sarah", { name: "Sarah ❤️", type: "dm" });

// prepareEpisode() DERIVES initialWorld:
initialWorld.conversations["dm_sarah"] = {
  id: "dm_sarah",
  name: "Sarah ❤️",
  type: "dm",
  messages: [],  // Auto-created empty
  typing: {},    // Auto-created empty
};
```

---

# SECTION 6: THE PLUGIN CONTRACT (CORRECTED)

## 6.1 Plugin Tiers (NOT Everything Is Required)

> ⚠️ **CRITICAL FIX**: Making DSL helpers required slows ecosystem growth.
> Some plugin authors only want to ship runtime or only IR lowering.

**Plugin Tier System**:

| Tier | Name | What's Required | Use Case |
|------|------|-----------------|----------|
| A | Runtime-only | reducer + views + assets | Consume events, render UI |
| B | IR Lowering | + lowering handlers | Compile TimelineOp → RuntimeEvent |
| C | Authoring | + DSL helpers | Full DSL support for authors |
| D | Compiler | + compile validators/optimizers | Advanced compile-time logic |

**You can ship a Tier A plugin and upgrade later.**

## 6.2 The Plugin Interface (Tiered)

```typescript
export interface TokovoPlugin<AppId extends string = string> {
  // ═══════════════════════════════════════════════════════════════════════
  // TIER A: Runtime-only (REQUIRED for all plugins)
  // ═══════════════════════════════════════════════════════════════════════
  id: AppId;
  version: string;
  displayName: string;
  
  /** Reducer: applies RuntimeEvent to WorldState */
  reducer: (state: WorldState, event: RuntimeEvent) => void;
  
  /** Views: React components for rendering */
  views: {
    AppRoot: React.FC<{ world: WorldState; deviceId: string }>;
  };
  
  /** Assets (recommended) */
  assets?: {
    sounds?: Record<string, string>;
    icons?: Record<string, string>;
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // TIER B: IR Lowering (optional but needed for DSL usage)
  // ═══════════════════════════════════════════════════════════════════════
  lowering?: {
    handles: string[];  // e.g., ["MessageReceived", "TypingStarted"]
    lower: (op: TimelineOp, ctx: LowerContext) => RuntimeEvent[];
  };
  
  // ═══════════════════════════════════════════════════════════════════════
  // TIER C: Authoring DSL (optional but recommended)
  // ═══════════════════════════════════════════════════════════════════════
  dsl?: {
    /** Returns DSL API object - NO PROTOTYPE MUTATION */
    createApi: (builder: BeatBuilder) => PluginDslApi;
  };
  
  /** Audio rules (recommended) */
  audioRules?: AutoSoundRule[];
  
  /** Initial state factory */
  createInitialState?: () => any;
}
```

## 6.3 DSL API Pattern (NO Prototype Mutation)

> ⚠️ **CRITICAL FIX**: Don't attach to `BeatBuilder.prototype`.
> That's global mutation → collisions → hard to type → hard to sandbox.

**❌ WRONG (prototype mutation)**:
```typescript
// This causes namespace collisions and is hard to type
dsl: {
  extend: (builder) => {
    builder.whatsapp = { ... };  // Mutating prototype!
  }
}
```

**✅ CORRECT (scoped API via `b.use()`)**:
```typescript
// In WhatsApp plugin:
const WhatsAppPlugin: TokovoPlugin = {
  id: "app_whatsapp",
  dsl: {
    createApi: (builder) => ({
      receive: (from: string, text: string) => {
        builder.ops.push({
          kind: "ReceiveMessage",
          actor: from,
          text,
          conversationId: builder.conversationId,
        });
        return builder;  // Enable chaining
      },
      send: (text: string) => { /* ... */ },
      typing: (from: string, duration: string) => { /* ... */ },
    })
  }
};

// Author writes:
d.beat("message", b => {
  b.use("app_whatsapp").receive("Sarah", "Hi");
  // OR with alias:
  b.app("app_whatsapp").receive("Sarah", "Hi");
});
```

**Benefits**:
- No name collisions (`b.use("app_whatsapp")` vs `b.use("app_twitter")`)
- Scoped APIs per device/app
- Fully typeable without hacks
- Can sandbox per-device

## 6.4 What Happens at Runtime Registration

When you call `engine.registerPlugin(WhatsAppPlugin)`:

| Step | What Happens |
|------|-------------|
| 1 | Reducer added to reducer registry |
| 2 | Lowering handlers added to adapter registry (if Tier B+) |
| 3 | Audio rules added to AutoSoundRegistry |
| 4 | DSL API factory registered (if Tier C) |
| 5 | Assets manifest merged |

**Note**: TypeScript types are **compile-time only** (via package imports), not runtime.

---

# SECTION 7: THE CRITICAL GAPS (Explained In Detail)

## Gap #1: Initial World Derivation

### What's Broken Now
You write DSL:
```typescript
d.conversation("dm_sarah", { name: "Sarah ❤️" });
```

But you ALSO have to manually create:
```typescript
initialWorld.conversations["dm_sarah"] = { ... };
```

Two places defining the same thing = bugs.

### The Fix
`prepareEpisode()` reads SceneIR and auto-generates:
```typescript
function deriveInitialWorld(sceneIR: SceneIR): WorldState {
  const world = createEmptyWorld();
  
  for (const device of sceneIR.devices) {
    // Add device
    world.devices[device.deviceId] = {
      id: device.deviceId,
      profileId: device.profileId,
      isLocked: false,
      foregroundAppId: device.appId,
    };
    
    // Add conversations
    for (const conv of device.conversations) {
      world.conversations[conv.id] = {
        id: conv.id,
        name: conv.name,
        type: conv.type,
        avatar: conv.avatar,
        messages: conv.initialMessages || [],
        typing: {},
      };
    }
    
    // Set initial app state
    world.appState[device.appId] = {
      screen: "chats",  // Default, can override
      conversationId: null,
    };
  }
  
  return world;
}
```

---

## Gap #2: Multi-Device Sync

### What's Broken Now
When you have two devices in split-screen, events for both devices get compiled, but:
- No explicit layout in CompiledEpisode
- Renderer has to guess positioning
- POV switches are hacky

### The Fix
CompiledEpisode includes layout:
```typescript
compiled.layout = {
  mode: "SPLIT",
  devices: [
    { deviceId: "phone_alice", region: { x: 0, y: 0, width: 0.5, height: 1 } },
    { deviceId: "phone_bob", region: { x: 0.5, y: 0, width: 0.5, height: 1 } },
  ]
};
```

Renderer uses this to position devices without guessing.

---

## Gap #3: Camera As RuntimeEvent

### What's Broken Now
DirectorLite mutates camera state directly:
```typescript
// Inside DirectorLite
world.camera.transform.scale = 1.2;  // Direct mutation!
```

This bypasses the event system entirely.

### The Fix
Camera changes are RuntimeEvents:
```typescript
// DirectorLite emits events instead
emit({
  at: currentFrame,
  kind: "CAMERA",
  type: "ZOOM",
  scale: 1.2,
  duration: 30,
  easing: "easeOut"
});

// Camera reducer applies them
cameraReducer(world, event) {
  if (event.kind === "CAMERA" && event.type === "ZOOM") {
    world.camera.transform.scale = event.scale;
  }
}
```

Now camera is deterministic and debuggable.

---

## Gap #4: Event Ordering Contract

### What's Broken Now
Two events at same frame (at: 60):
```typescript
{ at: 60, kind: "APP", type: "MESSAGE_RECEIVED" }
{ at: 60, kind: "DEVICE", type: "NOTIFICATION" }
```

Which runs first? Currently undefined.

### The Fix
Explicit ordering rules:
```typescript
const EVENT_KIND_PRIORITY = {
  DEVICE: 1,    // Device events first
  APP: 2,       // Then app events
  CAMERA: 3,    // Then camera
  AUDIO: 4,     // Then audio
  KEYBOARD: 5,  // Keyboard last
};

// Events are sorted by:
// 1. at (frame number)
// 2. kind priority
// 3. original DSL order (stable sort)
```

---

## Gap #5: Source Maps / Tracing

### What's Broken Now
You see a bug in the render. You have:
```typescript
{ at: 180, kind: "APP", type: "MESSAGE_RECEIVED", from: "Sarah" }
```

Where did this come from in your DSL?

### The Fix
Every RuntimeEvent carries a trace:
```typescript
{
  at: 180,
  kind: "APP",
  type: "MESSAGE_RECEIVED",
  from: "Sarah",
  _trace: {
    file: "whatsapp-demo.dsl.ts",
    line: 45,
    beat: "sarah_message",
    sceneOpIndex: 2
  }
}
```

Debug tools can show: "Click to go to line 45 of whatsapp-demo.dsl.ts"

---

## Gap #6: Hot Reload

### What's Broken Now
You change DSL, Remotion fast-refreshes, but compiled episode might be stale.

### The Fix
```typescript
// In video component
const prepared = useMemo(() => {
  return prepareEpisode(schema);
}, [schema]);  // Re-compile when schema changes

// Remotion's fast refresh will update `schema` import
// useMemo will re-run prepareEpisode()
// Episode updates instantly
```

---

## Gap #7: Type-Safe Payloads

### What's Broken Now
```typescript
type RuntimeEvent = {
  at: number;
  kind: string;
  [k: string]: any;  // <-- This is a type hole
};

// No type safety:
event.from  // TypeScript: any
event.text  // TypeScript: any
```

### The Fix
Plugin type augmentation:
```typescript
// Plugin declares its payloads
declare module "@tokovo/core" {
  interface AppEventPayloads {
    app_whatsapp: {
      MESSAGE_RECEIVED: {
        from: string;
        text: string;
        conversationId: string;
      };
    };
  }
}

// Now in reducer:
if (event.appId === "app_whatsapp" && event.type === "MESSAGE_RECEIVED") {
  event.from  // TypeScript: string ✓
  event.text  // TypeScript: string ✓
}
```

---

## Gap #8: Asset Pipeline

### What's Broken Now
- Audio files are scattered
- No validation they exist
- Each showcase hardcodes paths

### The Fix
Standard locations:
```
public/
  audio/
    app_whatsapp/
      message_in.mp3
      message_out.mp3
      typing_loop.mp3
```

Plugins declare assets:
```typescript
WhatsAppPlugin.assets = {
  sounds: {
    "message_in": "/audio/app_whatsapp/message_in.mp3",
    "message_out": "/audio/app_whatsapp/message_out.mp3",
  }
};
```

`prepareEpisode()` validates all declared assets exist.

---

## Gap #9: Error Boundaries (CORRECTED)

### What's Broken Now
Plugin reducer throws → entire render crashes.

### The Fix (IMPORTANT: Flip The Default)

> ⚠️ **CRITICAL FIX**: For Remotion renders, "graceful continue" can produce
> corrupted output silently. Production must **fail fast**.

```typescript
// In replay()
for (const event of eventsAtFrame) {
  const plugin = getPluginForEvent(event);
  try {
    plugin.reducer(draft, event);
  } catch (error) {
    if (ctx.mode === "render") {
      // PRODUCTION RENDER: Fail fast - output must be correct
      throw new PluginError(plugin.id, event, error);
    } else {
      // DEV/PREVIEW: Show error overlay but continue
      console.error(`[${plugin.id}] Reducer failed:`, event, error);
      ctx.errors.push({ plugin: plugin.id, event, error });
      // Continue with unchanged state for dev preview
    }
  }
}
```

**The Rule**:
- `mode: "preview"` (Remotion Studio): overlay + continue
- `mode: "render"` (production render): **fail fast** (output must be correct)

---

# SECTION 8: THE MIGRATION PLAN

## Phase A: Stop The Bleeding (1 Day)

1. Create `RuntimeEvent` type in `@tokovo/core`
2. Create `CompiledEpisode` type
3. Create `prepareEpisode()` function
4. Route video-runner through it
5. Test with WhatsApp showcase

## Phase B: Make Plugins Real (2-3 Days)

1. Create `TokovoPlugin` interface
2. Migrate WhatsApp to full plugin contract
3. Migrate Twitter to full plugin contract
4. Auto-register types, audio rules, DSL helpers

## Phase C: DX World-Class (2-5 Days)

1. Episode auto-discovery
2. `initialWorld` derivation
3. Source maps / tracing
4. CLI: `tokovo render episodes/whatsapp-demo`
5. Golden tests

---

# SECTION 9: DEFINITION OF DONE (CORRECTED)

You are enterprise-level when:

| Requirement | Status |
|-------------|--------|
| `prepareEpisode()` is the only path to render | ⬜ |
| All episodes compile + lower + replay without manual wiring | ⬜ |
| WhatsApp/Twitter are pure plugins (core knows nothing) | ⬜ |
| **Plugin tiers work (Tier A runtime-only is valid)** | ⬜ |
| **DSL uses `b.use("appId")` pattern (no prototype mutation)** | ⬜ |
| **All event payloads use `payload` field** | ⬜ |
| **Type augmentation via package imports (compile-time)** | ⬜ |
| Determinism holds (repeat render identical) | ⬜ |
| **Fail-fast in render mode, continue in preview** | ⬜ |
| Plugin authors can add new app without touching core | ⬜ |
| `initialWorld` is derived from SceneIR | ⬜ |
| Multi-device layouts work | ⬜ |
| Camera events are RuntimeEvents | ⬜ |
| Source maps enable debugging | ⬜ |

---

# SECTION 10: REMOTION INTEGRATION

## 10.1 What Remotion Gives Us (Already Using)

| Feature | How We Use It | Status |
|---------|---------------|--------|
| `useCurrentFrame()` | Drive all animation from frame number | ✅ Correct |
| `<Composition>` | Register episodes with duration/fps | ✅ Correct |
| `<Audio>` | Play sounds synchronized to timeline | ✅ In AudioLayer |
| `<AbsoluteFill>` | Layering device + overlays | ✅ Correct |

## 10.2 What Remotion Has That We Should Use More

### `staticFile()` for Assets
```typescript
// Instead of hardcoded paths:
sound: "/audio/app_whatsapp/message_in.mp3"

// Use Remotion's staticFile():
import { staticFile } from "remotion";
sound: staticFile("audio/app_whatsapp/message_in.mp3")
```
**Benefit**: Works in both dev and production, validated at bundle time.

### `<Sequence>` for Scene Timing
```typescript
// Instead of managing scene timing manually:
<Sequence from={60} durationInFrames={120}>
  <Scene1 />
</Sequence>
<Sequence from={180}>
  <Scene2 />
</Sequence>
```
**Benefit**: `useCurrentFrame()` inside Sequence is relative to sequence start.

### `<TransitionSeries>` for Scene Transitions
```typescript
import { TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={120}>
    <ChatListScene />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={slide()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={300}>
    <ChatScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```
**Benefit**: Built-in slide/fade/wipe transitions for scene changes.

### `calculateMetadata()` for Dynamic Duration
```typescript
// In Root.tsx - duration based on compiled episode
<Composition
  id="WhatsAppDemo"
  component={WhatsAppDemo}
  calculateMetadata={async () => {
    const compiled = await prepareEpisode(schema);
    return {
      durationInFrames: compiled.durationInFrames,
      fps: compiled.fps,
      props: { compiled }
    };
  }}
/>
```
**Benefit**: Episode duration is calculated, not hardcoded.

## 10.3 Auto-Registration Using Remotion's Patterns

Remotion discovers compositions in Root.tsx. We should auto-generate:

```typescript
// packages/episodes/*.episode.ts are auto-discovered
// Video-runner generates this automatically:

export const RemotionRoot = () => {
  const episodes = discoverEpisodes(); // Scans packages/episodes/
  
  return (
    <>
      {episodes.map(ep => (
        <Composition
          key={ep.id}
          id={ep.id}
          component={EpisodeRenderer}
          calculateMetadata={() => prepareAndGetMetadata(ep)}
          defaultProps={{ episodeId: ep.id }}
        />
      ))}
    </>
  );
};
```

**Result**: Add new .episode.ts file → auto-appears in Remotion Studio.

---

# SECTION 11: NOTIFICATION SYSTEM

## 11.1 The Problem

Notifications are **cross-app interruptions**. WhatsApp message arrives while user is on Twitter.
This is a DEVICE event, not an APP event.

## 11.2 The RuntimeEvent

```typescript
interface NotificationEvent {
  at: number;
  kind: "DEVICE";
  deviceId: string;
  type: "SHOW_NOTIFICATION";
  payload: {
    id: string;
    appId: string;          // Source app (app_whatsapp)
    title: string;
    body: string;
    threadKey?: string;     // For grouping (e.g., "whatsapp_chat_sarah")
    priority: "HIGH" | "DEFAULT" | "LOW";
    actions?: Array<{ label: string; action: string }>;
  };
}
```

## 11.3 The Scheduler (Core)

Core owns the **NotificationScheduler**:
- FIFO queue
- 10-frame gap between banners
- 150-frame (5s) display duration
- Grouping by `threadKey`

## 11.4 The Adapter (Plugin)

Plugins provide **NotificationAdapter**:
```typescript
// In WhatsApp plugin
notificationAdapter: {
  format: (event: NotificationEvent): FormattedNotification => ({
    icon: staticFile("icons/whatsapp.svg"),
    color: "#25D366",
    title: event.payload.title,
    body: event.payload.body,
  })
}
```

---

# SECTION 12: DIRECTORLITE → EVENTS

## 12.1 The Problem

DirectorLite currently mutates camera state directly:
```typescript
// WRONG: Direct mutation
world.camera.transform.scale = 1.08;
```

This breaks determinism and bypasses the event system.

## 12.2 The Solution

DirectorLite must EMIT CameraEvents, not mutate:
```typescript
// DirectorLite watches signals
onSignal("NewMessage", (signal, ctx) => {
  ctx.emit({
    at: ctx.frame,
    kind: "CAMERA",
    type: "ZOOM",
    payload: {
      scale: 1.08,
      duration: 15,
      easing: "easeOut",
      anchorId: "lastMessage",  // 👈 Reference anchor, not coordinates
    }
  });
});
```

## 12.3 The Priority System

Camera has 3 drivers with strict priority:
1. **Manual DSL** (highest): `b.camera.zoom(1.5)` 
2. **Semantic**: `b.camera.focus("lastMessage")`
3. **DirectorLite** (lowest): Auto-reacts to signals

If MANUAL or SEMANTIC is active, DirectorLite is SUSPENDED.

---

# SECTION 13: ANCHOR REGISTRY

## 13.1 The Problem

Camera needs to focus on "the last message", but:
- Position changes based on previous messages
- Content is dynamic

## 13.2 The Solution: Anchor Providers

Plugins register **anchor providers**:
```typescript
// In WhatsApp plugin
anchors: {
  providers: {
    "lastMessage": (world, deviceId) => {
      const msgs = world.apps[deviceId]?.app_whatsapp?.messages || [];
      const lastMsg = msgs[msgs.length - 1];
      if (!lastMsg) return null;
      // Return bounding box
      return { x: 0.5, y: lastMsg.offsetY / DEVICE_HEIGHT, width: 1, height: 0.1 };
    },
    "inputArea": () => ({ x: 0.5, y: 0.95, width: 1, height: 0.1 }),
    "header": () => ({ x: 0.5, y: 0.05, width: 1, height: 0.1 }),
  }
}
```

## 13.3 Camera Resolution

When camera needs to focus:
```typescript
// 1. DSL says:
b.camera.focus("lastMessage");

// 2. Compiler emits:
{ kind: "CAMERA", type: "FOCUS", payload: { anchorId: "lastMessage" } }

// 3. Runtime resolves:
const anchor = pluginRegistry.resolveAnchor("lastMessage", world, deviceId);
const { x, y } = anchor;

// 4. Apply camera transform
world.camera.transform = { originX: x, originY: y, scale: 1.2 };
```

---

# SECTION 14: PLATFORM STRATEGIES

## 14.1 The Problem

Same plugin (WhatsApp) must render differently on iOS vs Android.

## 14.2 The Solution: UI Strategies

```typescript
// Plugin defines strategies
views: {
  strategies: {
    ios: {
      ChatList: IosChatListScreen,
      Chat: IosChatScreen,
      Header: IosHeader,
      MessageBubble: IosMessageBubble,
    },
    android: {
      ChatList: AndroidChatListScreen,
      Chat: AndroidChatScreen,
      Header: AndroidHeader,
      MessageBubble: AndroidMessageBubble,
    }
  },
  AppRoot: ({ world, deviceId }) => {
    const platform = world.devices[deviceId].platform; // "ios" | "android"
    const Strategy = views.strategies[platform];
    return <Strategy.ChatList world={world} />;
  }
}
```

## 14.3 Device Profiles

Devices carry platform info:
```typescript
interface DeviceProfile {
  id: string;
  platform: "ios" | "android";
  model: "iphone_16_pro" | "pixel_8" | ...;
  width: number;
  height: number;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
}
```

---

# SECTION 15: SEMANTIC SIGNALS

## 15.1 The Problem

DirectorLite needs to know "something important happened" without parsing every event.

## 15.2 The Solution: Signals

Events emit **signals** as metadata:
```typescript
// RuntimeEvent with signal
{
  at: 60,
  kind: "APP",
  appId: "app_whatsapp",
  type: "MESSAGE_RECEIVED",
  payload: { from: "Sarah", text: "I love you" },
  _signal: {
    type: "NewMessage",
    mood: "romantic",     // emotional context
    intensity: 0.9,       // 0-1 importance
    pacing: "slow",       // timing hint
  }
}
```

## 15.3 DirectorLite Rules

DirectorLite subscribes to signals:
```typescript
const directorRules = [
  {
    match: { type: "NewMessage", intensity: { gte: 0.7 } },
    action: "ZOOM",
    scale: 1.1,
    duration: 20,
    anchorId: "lastMessage"
  },
  {
    match: { type: "TypingStarted", mood: "tense" },
    action: "SHAKE",
    intensity: 0.2
  }
];
```

---

# SECTION 16: HYPER-DETAILED IMPLEMENTATION PHASES

## PHASE 0: PREPARATION (Day 0)

### Checkpoint 0.1: Clean Slate
- [ ] Commit all current changes
- [ ] Create branch `feat/enterprise-pipeline`
- [ ] Document current broken tests (so we know what to fix)

### Checkpoint 0.2: Dependencies
- [ ] Verify `@tokovo/ir` exports all needed types
- [ ] Verify `@tokovo/core` has clean package.json
- [ ] Remove any circular dependencies

---

## PHASE 1: TYPES FOUNDATION (Day 1)

### Checkpoint 1.1: RuntimeEvent Types
**File**: `@tokovo/core/src/types/runtime-event.ts`

```typescript
// Create these types:
export type RuntimeEventKind = "APP" | "DEVICE" | "CAMERA" | "AUDIO" | "KEYBOARD";

export interface BaseEvent {
  at: number;
  kind: RuntimeEventKind;
  _trace?: EventTrace;
  _signal?: EventSignal;
}

export interface AppEvent<AppId extends string, Type extends string, P> extends BaseEvent {
  kind: "APP";
  appId: AppId;
  type: Type;
  deviceId?: string;
  payload: P;
}

// ... all event interfaces
```

**Verification**:
- [ ] All events have `payload` field
- [ ] No `[k: string]: any`
- [ ] Type augmentation interface exists

### Checkpoint 1.2: CompiledEpisode Type
**File**: `@tokovo/core/src/types/compiled-episode.ts`

```typescript
export interface CompiledEpisode {
  id: string;
  durationInFrames: number;
  fps: number;
  initialWorld: WorldState;
  events: RuntimeEvent[];
  assets: AssetManifest;
  layout?: LayoutConfig;
  debug?: DebugInfo;
}
```

**Verification**:
- [ ] Type exported from package
- [ ] No references to IR types

### Checkpoint 1.3: Plugin Contract Types
**Files**: 
- `@tokovo/core/src/types/plugin.ts`
- `@tokovo/core/src/types/plugin-tiers.ts`

```typescript
export interface TokovoPlugin<AppId extends string = string> {
  // Tier A (required)
  id: AppId;
  version: string;
  displayName: string;
  reducer: PluginReducer;
  views: PluginViews;
  
  // Tier B (optional)
  lowering?: LoweringHandler;
  
  // Tier C (optional)
  dsl?: DslExtension;
  
  // Assets
  assets?: AssetManifest;
  audioRules?: AutoSoundRule[];
  anchors?: AnchorRegistry;
  notificationAdapter?: NotificationAdapter;
}
```

**Verification**:
- [ ] Plugin interface has optional tiers
- [ ] No prototype mutation in DSL type

---

## PHASE 2: CORE FUNCTIONS (Day 2)

### Checkpoint 2.1: prepareEpisode()
**File**: `@tokovo/core/src/prepare.ts`

```typescript
export function prepareEpisode(
  input: SceneIR | EpisodeFactory,
  plugins: TokovoPlugin[],
  options?: PrepareOptions
): CompiledEpisode {
  // 1. Extract SceneIR
  const sceneIR = typeof input === "function" ? input() : input;
  
  // 2. Build registries
  const registry = buildPluginRegistry(plugins);
  
  // 3. Compile
  const timelineIR = compile(sceneIR, registry);
  
  // 4. Lower
  const events = lower(timelineIR, registry);
  
  // 5. Derive audio
  const audioEvents = deriveAudioEvents(events, registry);
  
  // 6. Merge and sort
  const allEvents = sortEvents([...events, ...audioEvents]);
  
  // 7. Derive initial world
  const initialWorld = deriveInitialWorld(sceneIR, registry);
  
  // 8. Validate
  validateEpisode({ events: allEvents, initialWorld }, options);
  
  // 9. Return
  return {
    id: sceneIR.id,
    durationInFrames: sceneIR.durationInFrames,
    fps: sceneIR.fps,
    initialWorld,
    events: allEvents,
    assets: collectAssets(registry),
  };
}
```

**Verification**:
- [ ] Function compiles without error
- [ ] Returns typed CompiledEpisode
- [ ] Validation throws on error in strict mode

### Checkpoint 2.2: deriveInitialWorld()
**File**: `@tokovo/core/src/derive-world.ts`

```typescript
export function deriveInitialWorld(sceneIR: SceneIR, registry: PluginRegistry): WorldState {
  const world = createEmptyWorld();
  
  for (const device of sceneIR.devices) {
    // Add device
    world.devices[device.id] = createDeviceState(device);
    
    // Let plugins initialize their state
    for (const plugin of registry.plugins) {
      if (plugin.createInitialState) {
        world.apps[device.id] = world.apps[device.id] || {};
        world.apps[device.id][plugin.id] = plugin.createInitialState();
      }
    }
    
    // Add conversations
    for (const conv of device.conversations || []) {
      world.conversations[conv.id] = createConversationState(conv);
    }
  }
  
  return world;
}
```

**Verification**:
- [ ] No manual initialWorld needed in episodes
- [ ] Plugin initial states work

### Checkpoint 2.3: run() function
**File**: `@tokovo/core/src/run.ts`

```typescript
export function run(episode: CompiledEpisode, frame: number, mode: "preview" | "render"): WorldState {
  // Get events up to current frame
  const eventsToApply = episode.events.filter(e => e.at <= frame);
  
  // Apply via replay
  return replay(episode.initialWorld, eventsToApply, {
    mode,
    plugins: getRegisteredPlugins(),
  });
}
```

**Verification**:
- [ ] Works with CompiledEpisode only
- [ ] Mode controls error handling

---

## PHASE 3: PLUGIN MIGRATION (Day 3-4)

### Checkpoint 3.1: WhatsApp Plugin Contract
**File**: `@tokovo/apps-whatsapp/src/plugin.ts`

```typescript
import { TokovoPlugin } from "@tokovo/core";
import { whatsappReducer } from "./logic/reducer";
import { WhatsAppAppRoot } from "./ui/AppRoot";
import { whatsappLowering } from "./lowering";
import { whatsappDsl } from "./dsl";
import { whatsappAssets } from "./assets";
import { whatsappAudioRules } from "./assets/audio-rules";
import { whatsappAnchors } from "./anchors";

export const WhatsAppPlugin: TokovoPlugin<"app_whatsapp"> = {
  id: "app_whatsapp",
  version: "1.0.0",
  displayName: "WhatsApp",
  
  // Tier A
  reducer: whatsappReducer,
  views: {
    AppRoot: WhatsAppAppRoot,
    strategies: { ios: iosViews, android: androidViews },
  },
  
  // Tier B
  lowering: whatsappLowering,
  
  // Tier C
  dsl: whatsappDsl,
  
  // Assets
  assets: whatsappAssets,
  audioRules: whatsappAudioRules,
  anchors: whatsappAnchors,
};
```

**Verification**:
- [ ] Plugin compiles
- [ ] All required exports exist
- [ ] Reducer uses `event.payload.x` not `event.x`

### Checkpoint 3.2: WhatsApp Lowering
**File**: `@tokovo/apps-whatsapp/src/lowering.ts`

```typescript
export const whatsappLowering: LoweringHandler = {
  handles: ["MessageReceived", "MessageSent", "TypingStarted", "TypingEnded"],
  
  lower: (op: TimelineOp, ctx: LowerContext): RuntimeEvent[] => {
    switch (op.kind) {
      case "MessageReceived":
        return [{
          at: op.at,
          kind: "APP",
          appId: "app_whatsapp",
          type: "MESSAGE_RECEIVED",
          payload: {
            from: op.actor,
            text: op.text,
            conversationId: op.conversationId,
            message: op.message,
          },
          _trace: op.trace,
        }];
      // ... other cases
    }
  }
};
```

**Verification**:
- [ ] All TimelineOp kinds handled
- [ ] Payload contains all fields
- [ ] Trace preserved

### Checkpoint 3.3: WhatsApp DSL (b.use pattern)
**File**: `@tokovo/apps-whatsapp/src/dsl.ts`

```typescript
export const whatsappDsl: DslExtension = {
  createApi: (builder: BeatBuilder) => ({
    receive: (from: string, text: string, options?: MessageOptions) => {
      builder.ops.push({
        kind: "ReceiveMessage",
        actor: from,
        text,
        conversationId: builder.conversationId,
        ...options,
      });
      return builder;
    },
    send: (text: string, options?: MessageOptions) => {
      builder.ops.push({
        kind: "SendMessage",
        actor: "me",
        text,
        conversationId: builder.conversationId,
        ...options,
      });
      return builder;
    },
    typing: (from: string, duration: string) => {
      builder.ops.push({ kind: "TypingStart", actor: from });
      builder.wait(duration);
      builder.ops.push({ kind: "TypingEnd", actor: from });
      return builder;
    },
  }),
};
```

**Verification**:
- [ ] No prototype mutation
- [ ] Returns builder for chaining
- [ ] TypeScript infers API correctly

### Checkpoint 3.4: Twitter Plugin (Same Pattern)
- [ ] Create `TwitterPlugin` following same structure
- [ ] Verify both plugins work

---

## PHASE 4: EPISODE MIGRATION (Day 5)

### Checkpoint 4.1: Update WhatsApp Showcase
**File**: `packages/episodes/src/whatsapp-showcase.episode.ts`

```typescript
import { defineEpisode, BeatBuilder } from "@tokovo/dsl";

export const whatsappShowcase = defineEpisode("whatsapp-showcase", ep => {
  ep.duration("30s");
  ep.fps(30);
  
  ep.device("phone", d => {
    d.platform("ios");
    d.app("app_whatsapp");
    d.conversation("dm_sarah", { name: "Sarah ❤️", avatar: "..." });
    
    d.beat("intro", b => {
      b.use("app_whatsapp").receive("Sarah", "Hey babe!");
      b.wait("1s");
      b.use("app_whatsapp").typing("me", "2s");
      b.use("app_whatsapp").send("Hey! What's up?");
    });
  });
});
```

**Verification**:
- [ ] Episode uses `b.use()` pattern
- [ ] No manual initialWorld
- [ ] No inline adapter

### Checkpoint 4.2: Video Runner Integration
**File**: `apps/video-runner/src/WhatsAppShowcase.tsx`

```typescript
import { prepareEpisode, run } from "@tokovo/core";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { whatsappShowcase } from "@tokovo/episodes";
import { useCurrentFrame } from "remotion";

const episode = prepareEpisode(whatsappShowcase, [WhatsAppPlugin]);

export const WhatsAppShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const world = run(episode, frame, "preview");
  
  return <TokovoRenderer world={world} />;
};
```

**Verification**:
- [ ] Works with prepared episode
- [ ] No inline adapters
- [ ] No manual event transformations

---

## PHASE 5: VERIFICATION (Day 6)

### Checkpoint 5.1: Type Safety Verification
```bash
# Run full type check
pnpm typecheck

# Expected: 0 errors
```

- [ ] No `any` types in core pipeline
- [ ] Plugin payloads fully typed
- [ ] Event payloads fully typed

### Checkpoint 5.2: Determinism Test
```typescript
// Run same episode twice, compare output
const world1 = run(episode, 100, "render");
const world2 = run(episode, 100, "render");
assert.deepEqual(world1, world2);
```

- [ ] Identical WorldState
- [ ] Identical audio schedule
- [ ] No Math.random()

### Checkpoint 5.3: Error Handling
```typescript
// In render mode, errors throw
expect(() => {
  run(brokenEpisode, 50, "render");
}).toThrow(PluginError);

// In preview mode, errors are collected
const world = run(brokenEpisode, 50, "preview");
expect(world._errors).toHaveLength(1);
```

- [ ] Fail-fast in render mode
- [ ] Continue in preview mode

### Checkpoint 5.4: Full Pipeline Test
```bash
# Render the showcase
pnpm render whatsapp-showcase

# Expected: Video renders without errors
```

- [ ] Audio plays correctly
- [ ] Messages appear
- [ ] Camera moves
- [ ] No console errors

---

## PHASE 6: TEMPLATES & DX (Day 7+)

### Checkpoint 6.1: Plugin Template
**File**: `packages/plugin-template/`

```bash
tokovo create plugin my-app
# Generates:
# packages/apps-myapp/
#   src/
#     plugin.ts
#     reducer.ts
#     lowering.ts
#     dsl.ts
#     types.ts
#     assets/
#     ui/
```

### Checkpoint 6.2: Episode Template
**File**: `packages/episode-template/`

```bash
tokovo create episode my-demo
# Generates:
# packages/episodes/src/my-demo.episode.ts
```

### Checkpoint 6.3: Auto-Discovery
**File**: `apps/video-runner/src/Root.tsx`

```typescript
const episodes = await discoverEpisodes("packages/episodes/src/*.episode.ts");
const plugins = await discoverPlugins("packages/apps-*/src/plugin.ts");
```

- [ ] New episodes auto-register
- [ ] New plugins auto-register
- [ ] No manual Root.tsx changes

---

# SECTION 17: DEFINITION OF DONE (FINAL)

| # | Requirement | Phase | Status |
|---|-------------|-------|--------|
| 1 | `RuntimeEvent` with `payload` field | 1 | ⬜ |
| 2 | `CompiledEpisode` type exists | 1 | ⬜ |
| 3 | `TokovoPlugin` contract with tiers | 1 | ⬜ |
| 4 | `prepareEpisode()` single entry point | 2 | ⬜ |
| 5 | `deriveInitialWorld()` auto-generates | 2 | ⬜ |
| 6 | WhatsApp migrated to plugin contract | 3 | ⬜ |
| 7 | DSL uses `b.use()` pattern | 3 | ⬜ |
| 8 | Reducer uses `event.payload.x` | 3 | ⬜ |
| 9 | Type augmentation in plugin packages | 3 | ⬜ |
| 10 | Episodes use `prepareEpisode()` only | 4 | ⬜ |
| 11 | No inline adapters in video components | 4 | ⬜ |
| 12 | Full type check passes | 5 | ⬜ |
| 13 | Determinism test passes | 5 | ⬜ |
| 14 | Fail-fast in render mode | 5 | ⬜ |
| 15 | WhatsApp showcase renders | 5 | ⬜ |
| 16 | Plugin template works | 6 | ⬜ |
| 17 | Episode auto-discovery | 6 | ⬜ |

---

# FINAL TRUTH

You don't need more features.

You need **one canonical truth**:

```
CompiledEpisode + RuntimeEvent(payload) + strict pipeline + plugin tiers + no prototype mutation
```

When ALL checkboxes are ✅, Tokovo becomes a **platform**.

Plugin authors will ship apps.
Episode authors will create stories.
You will never debug pipeline issues again.

**This is the enterprise standard. Ship it.**
