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

# FINAL TRUTH

You don't need more features.

You need **one canonical truth**:

```
CompiledEpisode + RuntimeEvent schema + strict pipeline + plugin contract
```

Everything else becomes composable.
