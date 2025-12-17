# Architecture Overview

> The complete system design of Tokovo

---

## System Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   AUTHORING LAYER                                                          │
│   ───────────────                                                          │
│   Authors write episodes using the DSL                                      │
│   episode() → device() → beat() → actions                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                 │                                           │
│                                 ▼                                           │
│                                                                             │
│   COMPILATION LAYER                                                        │
│   ─────────────────                                                        │
│   DSL produces SceneIR (no timing)                                         │
│   Compiler resolves timing → TimelineOps                                   │
│   Lowering converts to RuntimeEvents                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                 │                                           │
│                                 ▼                                           │
│                                                                             │
│   RUNTIME LAYER                                                            │
│   ─────────────                                                            │
│   Engine applies RuntimeEvents to WorldState                               │
│   Reducers update state per event kind                                     │
│   State is immutable (Immer)                                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                 │                                           │
│                                 ▼                                           │
│                                                                             │
│   RENDERING LAYER                                                          │
│   ───────────────                                                          │
│   React components render WorldState                                       │
│   Plugins provide app-specific views                                       │
│   Remotion handles video export                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. SceneIR (Author Intent)

The DSL produces **SceneIR** - a semantic representation of what should happen:

```typescript
// No frame numbers, just intent
{
    episodeId: "demo",
    devices: [{
        deviceId: "phone",
        beats: [{
            name: "intro",
            ops: [
                { kind: "ReceiveMessage", actor: "Sarah", text: "Hey!" },
                { kind: "Wait", duration: "1s" },
                { kind: "SendMessage", actor: "me", text: "Hi!" }
            ]
        }]
    }]
}
```

### 2. TimelineOps (Compiled)

The compiler resolves timing:

```typescript
// Frame numbers added
[
    { at: 0, kind: "MessageReceived", from: "Sarah", text: "Hey!" },
    { at: 30, kind: "MessageSent", from: "me", text: "Hi!" }
]
```

### 3. RuntimeEvents (Canonical)

Lowering produces the canonical event format:

```typescript
// Enterprise schema with payload
[
    { 
        at: 0, 
        kind: "APP", 
        appId: "app_whatsapp", 
        type: "MESSAGE_RECEIVED",
        payload: { 
            from: "Sarah", 
            text: "Hey!", 
            conversationId: "dm_sarah" 
        }
    }
]
```

### 4. WorldState (Runtime)

The engine produces world state at each frame:

```typescript
{
    devices: { phone: { isLocked: false, foregroundAppId: "app_whatsapp" } },
    conversations: { dm_sarah: { messages: [...], typing: {} } },
    camera: { transform: { scale: 1.0, translateX: 0 } },
    audio: { activeSounds: [] }
}
```

---

## Key Abstractions

### CompiledEpisode

The single input to the runtime:

```typescript
interface CompiledEpisode {
    id: string;
    durationInFrames: number;
    fps: number;
    initialWorld: WorldState;       // Derived from SceneIR
    events: RuntimeEvent[];         // Sorted by frame
    assets: AssetManifest;          // Validated at compile
}
```

### RuntimeEvent

The canonical event schema:

```typescript
type RuntimeEvent =
    | AppRuntimeEvent      // App-specific (messaging, etc.)
    | DeviceRuntimeEvent   // Device actions (unlock, open app)
    | CameraRuntimeEvent   // Camera movements
    | AudioRuntimeEvent    // Sound effects
    | KeyboardRuntimeEvent // Typing simulation
    | OSRuntimeEvent       // Battery, network, time
    | TouchRuntimeEvent    // Tap, drag gestures
    | CallRuntimeEvent;    // Phone calls
```

### WorldState

The complete state at any frame:

```typescript
interface WorldState {
    devices: Record<string, DeviceState>;
    conversations: Record<string, ConversationState>;
    appState: Record<string, any>;
    camera: CameraState;
    audio: AudioState;
    touches: TouchState[];
}
```

---

## Plugin Architecture

Plugins extend Tokovo with new apps:

```typescript
interface TokovoPlugin {
    // Identity
    id: string;                              // "app_whatsapp"
    version: string;
    displayName: string;

    // Runtime (required)
    reducer: (state, event) => void;         // State updates
    views: { AppRoot: React.FC };            // UI components

    // Compilation (optional)
    lowering?: {
        handles: string[];                   // ["MessageReceived"]
        lower: (op, ctx) => RuntimeEvent[];
    };

    // Authoring (optional)
    dsl?: {
        createApi: (builder) => PluginDslApi;
    };

    // Assets (optional)
    assets?: { sounds?: Record<string, string> };
    audioRules?: AutoSoundRule[];
}
```

### Plugin Tiers

| Tier | Name | Required | Use Case |
|------|------|----------|----------|
| A | Runtime-only | reducer + views | Consume events, render UI |
| B | IR Lowering | + lowering | Compile TimelineOp → RuntimeEvent |
| C | Authoring | + DSL | Full DSL support |

---

## Determinism Guarantees

Tokovo guarantees **deterministic rendering**:

1. **No randomness** in event processing
2. **Stable sort** for same-frame events
3. **Immutable state** via Immer
4. **Pure reducers** (no side effects)
5. **Frame-based timing** (not wall clock)

```typescript
// These produce identical output:
runEpisode(compiled, 100);
runEpisode(compiled, 100);  // Same result!
```

---

## Error Handling

Two modes:

| Mode | Behavior | Use Case |
|------|----------|----------|
| `preview` | Log + continue | Remotion Studio |
| `render` | Fail fast | Production export |

```typescript
prepareEpisode(episode, plugins, { mode: "render" });  // Strict
prepareEpisode(episode, plugins, { mode: "preview" }); // Lenient
```
