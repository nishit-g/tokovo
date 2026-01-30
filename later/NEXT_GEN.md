# NEXT GEN: Two-Sided Plugin Architecture (Compile + Render)

**Status**: Final Design Document  
**Created**: 2026-01-29  
**Updated**: 2026-01-29  
**Author**: Deep Architecture Analysis

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Problem We're Solving](#the-problem-were-solving)
3. [The Core Insight](#the-core-insight)
4. [Complete Architecture](#complete-architecture)
5. [Plugin System Design](#plugin-system-design)
6. [Deep Dive: Why Each Piece Exists](#deep-dive-why-each-piece-exists)
7. [Implementation Flow](#implementation-flow)
8. [Migration Path](#migration-path)
9. [Studio Integration (Future)](#studio-integration-future)

---

## Executive Summary

Transform Tokovo's camera system (and future systems) from manual DSL calls to an extensible **two-sided plugin architecture**:

1. **Compile-time**: Plugins generate IR events from other events
2. **Render-time**: Plugins provide Remotion tracks/layers to render those events

**Core Principles**:

- **IR is the event bus** - Plugins read and write IR events
- **Plugins are two-sided** - Both compile (generate events) and render (display events)
- **Compile once, render anywhere** - IR is frozen after compilation
- **Deterministic always** - Same IR = same video

**Why this architecture**:

- ✅ Eliminates event duplication (read from IR)
- ✅ Enables true extensibility (plugins add features without core changes)
- ✅ Self-describing tracks (renderer discovers layers from plugins)
- ✅ Preserves determinism (compile-time only, IR immutable)
- ✅ Enables visual timeline editor (plugins define track structure)

---

## The Problem We're Solving

### Current State: Massive Duplication

```typescript
// 1. Define messages in WhatsApp track
.track("whatsapp", (wa) => {
  wa.at("1s").receive("Sarah", "OMG");
  wa.at("1.5s").receive("Sarah", "You won't believe this");
  wa.at("2s").receive("Sarah", "I just saw Jake");
  // ... 19 messages total
})

// 2. MANUALLY RE-TYPE EVERYTHING for camera
.camera((cam) => {
  const messages = [
    { time: 1, from: "Sarah", text: "OMG", order: 0 },
    { time: 1.5, from: "Sarah", text: "You won't believe this", order: 1 },
    { time: 2, from: "Sarah", text: "I just saw Jake", order: 2 },
    // ... same 19 messages AGAIN, 150+ lines
  ];

  messages.forEach(msg => {
    events.push({
      type: "MESSAGE_RECEIVED",
      timestamp: msg.time * 30,
      payload: { from: msg.from, text: msg.text, order: msg.order }
    });
  });

  const director = new CameraDirector({ fps: 30 });
  const effects = director.choreograph(events);
  applyCameraEffects(cam, effects);
})
```

**~150 lines of duplication** just to use the Director!

### Root Cause Analysis

**Why duplication exists:**

1. **WhatsApp track generates events** → Stored in IR as `MESSAGE_RECEIVED`
2. **Camera Director needs those events** → But runs during DSL `.camera()` callback
3. **IR not available yet** → Still being compiled when camera code runs
4. **Must reconstruct manually** → Re-type all messages by hand

**The timing problem:**

```
DSL Execution:
  .track("whatsapp", ...)  ← Queues message events
  .camera((cam) => {
    // IR doesn't exist yet!
    // Can't read MESSAGE_RECEIVED events
    // Must manually create event list
  })
  .build()  ← Only NOW does compilation happen

Compilation:
  1. Process tracks → Create MESSAGE_RECEIVED events
  2. Process camera → Create CAMERA events
  3. Merge all events → Final IR
```

**Why this is fundamentally broken:**

- Camera needs to react to messages (cross-track coordination)
- DSL doesn't support cross-track data flow
- Manual duplication is the workaround

---

## The Core Insight

### IR Is Already The Event Bus

**The realization:** IR.events[] is a sorted timeline of events. This IS an event bus!

```typescript
// IR structure (after compilation)
TrackEpisodeIR {
  id: "mega-camera-showcase"
  fps: 30
  durationInFrames: 1200
  events: [
    { at: 30,  kind: "APP",    type: "MESSAGE_RECEIVED",    payload: {...} },
    { at: 45,  kind: "APP",    type: "MESSAGE_RECEIVED",    payload: {...} },
    { at: 60,  kind: "APP",    type: "MESSAGE_RECEIVED",    payload: {...} },
    { at: 90,  kind: "CAMERA", type: "FOCUS",               payload: {...} },
    { at: 120, kind: "CAMERA", type: "FOCUS",               payload: {...} },
    { at: 345, kind: "OS",     type: "NOTIFICATION_SHOWN",  payload: {...} },
    { at: 345, kind: "CAMERA", type: "INTERRUPT_FOCUS",     payload: {...} }
  ]
}
```

**Key properties:**

- ✅ Sorted by frame (`at` field)
- ✅ Typed events (`kind` + `type`)
- ✅ Single source of truth
- ✅ Frozen after compilation (immutable)
- ✅ Queryable (can filter by kind/type)

### The Solution: Multi-Pass Compilation

**Instead of:**

```
DSL → Compile → IR (done in one pass, can't coordinate)
```

**Do this:**

```
DSL → Base IR → Plugins Process IR → Final IR
      ↓            ↓                   ↓
   Messages    Director reads       CAMERA events
   created     messages, writes     merged in
```

**Why this works:**

1. **Pass 1**: Tracks compile to base IR (messages exist)
2. **Pass 2**: Plugins read IR, generate new events
3. **Pass 3**: Merge all events, sort, freeze

**Plugins can now:**

- Read MESSAGE_RECEIVED events
- Generate CAMERA events
- No duplication needed!

---

## Complete Architecture

### The Four Layers

```
┌──────────────────────────────────────────────────────────────┐
│ 1. DSL LAYER (Content Definition)                           │
│                                                              │
│   episode("demo")                                            │
│     .track("whatsapp", wa => {                               │
│       wa.at("1s").receive("Sarah", "OMG");                   │
│     })                                                       │
│     .use(new CameraDirectorPlugin("fluid-tennis"))           │
│     .build();                                                │
│                                                              │
│   WHY: Pure content, no cross-track coordination            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. COMPILER (Multi-Pass with Plugins)                       │
│                                                              │
│   Pass 1: Tracks → Base IR                                  │
│   ├─ WhatsApp:      MESSAGE_RECEIVED events                 │
│   ├─ Notifications: NOTIFICATION_SHOWN events               │
│   └─ Manual camera: CAMERA events (if any)                  │
│                                                              │
│   Pass 2: Plugin Processing (Compile-time)                  │
│   ├─ CameraDirectorPlugin                                   │
│   │   ├─ Reads: MESSAGE_RECEIVED, NOTIFICATION_SHOWN        │
│   │   └─ Writes: CAMERA events (FOCUS, SHAKE, etc)         │
│   ├─ SubtitlePlugin (future)                                │
│   │   ├─ Reads: MESSAGE_RECEIVED                            │
│   │   └─ Writes: SUBTITLE events                            │
│   └─ VoicePlugin (future)                                   │
│       ├─ Reads: MESSAGE_RECEIVED                            │
│       └─ Writes: VOICE events (TTS)                         │
│                                                              │
│   Pass 3: Registration (Render-time)                        │
│   └─ Each plugin registers its renderTrack → TrackRegistry  │
│                                                              │
│   Pass 4: Lowering & Optimization                           │
│   └─ ID resolution, frame calculation, validation           │
│                                                              │
│   Output: Final IR + Registered Tracks                      │
│                                                              │
│   WHY: Plugins need IR to exist before they can process it  │
│   WHY: Separate render registration for clean separation    │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. IR (Frozen Event Timeline)                               │
│                                                              │
│   TrackEpisodeIR {                                           │
│     events: TrackEvent[]  ← Sorted, immutable               │
│   }                                                          │
│                                                              │
│   WHY: Single source of truth for all events                │
│   WHY: Frozen = deterministic rendering                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. ENGINE (Runtime State Machine)                           │
│                                                              │
│   Engine.replay(frame) → WorldState                         │
│                                                              │
│   WHY: Pure function, no side effects                       │
│   WHY: Can jump to any frame instantly                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. RENDERER (Plugin-Driven Composition)                     │
│                                                              │
│   function TokovoRenderer({ ir }) {                          │
│     const tracks = useTrackRegistry();  ← Gets all plugins  │
│                                                              │
│     return tracks                                            │
│       .sort((a, b) => a.zIndex - b.zIndex)                   │
│       .map(track => (                                        │
│         <Sequence name={track.name}>                         │
│           <track.Component                                   │
│             events={track.filterEvents(ir.events)}           │
│           />                                                 │
│         </Sequence>                                          │
│       ));                                                    │
│   }                                                          │
│                                                              │
│   WHY: Renderer doesn't know about specific plugins         │
│   WHY: Plugins self-register their rendering layers         │
│   WHY: Extensible without editing renderer code             │
└──────────────────────────────────────────────────────────────┘
```

---

## Plugin System Design

### Two-Sided Plugin Interface

**Why two-sided?**

**Problem without render-time:** Plugins can generate events but can't display them.

```typescript
// Plugin generates SUBTITLE events ✅
class SubtitlePlugin {
  process(events) {
    return [...subtitleEvents];
  }
}

// But who renders SUBTITLE events? ❌
// Must manually edit TokovoRenderer.tsx to add <SubtitleLayer />
// This breaks the plugin model!
```

**Solution:** Plugins provide BOTH sides.

```typescript
interface CompilerPlugin {
  // METADATA
  name: string;
  version: string;

  // COMPILE-TIME SIDE (Event Generation)
  subscribesTo: string[]; // What events to read
  emits: string[]; // What events to write
  process(events: TrackEvent[], context: CompilerContext): TrackEvent[];

  // RENDER-TIME SIDE (Remotion Track)
  renderTrack?: RenderTrackDefinition;

  // OPTIONAL
  validate?(ir: TrackEpisodeIR): ValidationResult;
}

interface RenderTrackDefinition {
  name: string; // "Camera", "Subtitles"
  zIndex: number; // Layer ordering (0-100)
  color?: string; // Timeline editor color
  Component: React.ComponentType<TrackProps>; // Remotion component
  filterEvents: (events: TrackEvent[]) => TrackEvent[]; // Extract relevant events
}

interface CompilerContext {
  fps: number;
  durationInFrames: number;
  devices: DeviceNode[];
  anchors: AnchorRegistry; // Available semantic anchors
}
```

**Why each field:**

- `name` / `version`: Plugin identity, versioning, conflicts
- `subscribesTo`: Declarative dependencies (compiler can validate)
- `emits`: What event kinds this plugin creates (for type checking)
- `process()`: **Compile-time** - generates events from IR
- `renderTrack`: **Render-time** - how to display generated events
- `validate()`: Post-compilation checks (optional)
- `zIndex`: Layer ordering (camera at 10, subtitles at 90, etc)
- `filterEvents`: Extract only relevant events for this track

---

### Complete Plugin Example

```typescript
class CameraDirectorPlugin implements CompilerPlugin {
  // METADATA
  name = "camera-director";
  version = "1.0.0";

  constructor(
    private behavior: "fluid-tennis-casual" | "fluid-tennis-energetic" | "...",
  ) {}

  // COMPILE-TIME: What events to process
  subscribesTo = ["MESSAGE_RECEIVED", "NOTIFICATION_SHOWN", "TYPING_START"];
  emits = ["CAMERA"];

  // COMPILE-TIME: Generate CAMERA events
  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    // 1. Filter to events we care about
    const appEvents = events.filter((e) => this.subscribesTo.includes(e.type));

    // 2. Run Director choreography
    const director = new CameraDirector({ fps: context.fps });
    const cameraEffects = director.choreograph(appEvents, {
      behaviorMap: {
        MESSAGE_RECEIVED: this.behavior,
        NOTIFICATION_SHOWN: "interrupt-focus",
        TYPING_START: "drift-anticipation",
      },
    });

    // 3. Convert Director output to IR events
    return cameraEffects.map((effect) => ({
      at: effect.timestamp,
      kind: "CAMERA",
      type: effect.type, // "FOCUS", "SHAKE", "RESET", etc
      payload: effect.params,
      duration: effect.duration,
    }));
  }

  // RENDER-TIME: How to display CAMERA events
  renderTrack = {
    name: "Camera",
    zIndex: 10, // Above background, below content
    color: "#3b82f6", // Blue in timeline editor

    Component: CameraLayer, // React component

    filterEvents: (events) => events.filter((e) => e.kind === "CAMERA"),
  };

  // OPTIONAL: Validate output
  validate(ir: TrackEpisodeIR): ValidationResult {
    const cameraEvents = ir.events.filter((e) => e.kind === "CAMERA");

    // Check for overlapping focus events
    for (let i = 0; i < cameraEvents.length - 1; i++) {
      const current = cameraEvents[i];
      const next = cameraEvents[i + 1];

      if (current.type === "FOCUS" && next.type === "FOCUS") {
        const currentEnd = current.at + (current.duration || 1);
        if (next.at < currentEnd) {
          return {
            valid: false,
            errors: [
              {
                message: "Overlapping focus events",
                events: [current.id, next.id],
              },
            ],
          };
        }
      }
    }

    return { valid: true };
  }
}
```

**Why this structure:**

- **Compile-time logic**: Separated from rendering (testable in isolation)
- **Render-time component**: Remotion component (can use hooks, animations)
- **Self-contained**: Everything the system needs to know is in one plugin
- **Composable**: Multiple plugins work together automatically

---

### Episode Usage

```typescript
// Ultra-clean episode code!
episode("mega-camera-director")
  .track("whatsapp", (wa) => {
    wa.at("1s").receive("Sarah", "OMG");
    wa.at("1.5s").receive("Sarah", "You won't believe this");
    wa.at("2s").receive("Sarah", "I just saw Jake");
    // ... just content, no camera duplication
  })
  .track("notifications", (notif) => {
    notif.at("11.5s").show({
      app: "Messages",
      title: "Mom",
      body: "Dinner reminder!",
    });
  })

  // ONE LINE: Register plugin
  .use(new CameraDirectorPlugin("fluid-tennis-energetic"))

  .build();

// Director automatically:
// 1. Reads MESSAGE_RECEIVED events from IR
// 2. Reads NOTIFICATION_SHOWN events from IR
// 3. Generates CAMERA events using choreography
// 4. Merges CAMERA events into final IR
// 5. Registers CameraLayer for rendering
// Zero duplication!
```

**Code reduction:**

- Before: ~200 lines (messages + manual camera events)
- After: ~20 lines (messages only)
- Savings: 90% less code, zero duplication

---

## Deep Dive: Why Each Piece Exists

### Why Multi-Pass Compilation?

**Question:** Why not compile everything in one pass?

**Answer:** Cross-track coordination requires IR to exist.

**Attempt 1: Single pass (fails)**

```typescript
episode()
  .track("whatsapp", (wa) => {
    // Creates MESSAGE_RECEIVED events
    wa.at("1s").receive("Sarah", "Hi");
  })
  .camera((cam) => {
    // Runs during DSL execution
    // IR doesn't exist yet!
    // Can't read MESSAGE_RECEIVED events
    // MUST manually duplicate data
  })
  .build();
```

**Attempt 2: Multi-pass (works)**

```typescript
// Pass 1: Compile tracks
const baseIR = compileTracks(episode);
// baseIR.events = [{ kind: "APP", type: "MESSAGE_RECEIVED", ... }]

// Pass 2: Run plugins
for (const plugin of plugins) {
  const newEvents = plugin.process(baseIR.events, context);
  baseIR.events.push(...newEvents);
}
// baseIR.events = [...messages, ...cameraEvents]

// Pass 3: Sort & freeze
baseIR.events.sort((a, b) => a.at - b.at);
Object.freeze(baseIR);
```

**Why this works:**

- Tracks compile first (IR exists)
- Plugins run second (can read IR)
- Clean separation of concerns

---

### Why Plugins Have renderTrack?

**Question:** Why not just generate events? Let renderer figure it out?

**Answer:** Without renderTrack, plugins can't display their own events.

**Problem scenario:**

```typescript
// SubtitlePlugin generates SUBTITLE events ✅
class SubtitlePlugin {
  process(events) {
    return events.map(e => ({
      kind: "SUBTITLE",
      type: "SHOW",
      payload: { text: e.payload.content }
    }));
  }
}

// But TokovoRenderer is hardcoded:
function TokovoRenderer({ ir }) {
  return (
    <>
      <AudioLayer />
      <CameraLayer />
      <AppLayer />
      {/* WHERE DO SUBTITLES GO? */}
      {/* Must edit this file to add <SubtitleLayer /> */}
      {/* Breaks plugin model! */}
    </>
  );
}
```

**Solution: Plugin provides renderTrack**

```typescript
class SubtitlePlugin {
  // Compile-time: Generate events
  process(events) { ... }

  // Render-time: Provide rendering component
  renderTrack = {
    name: "Subtitles",
    zIndex: 90,
    Component: SubtitleLayer,
    filterEvents: (e) => e.filter(ev => ev.kind === "SUBTITLE")
  };
}

// Renderer becomes generic:
function TokovoRenderer({ ir }) {
  const tracks = useTrackRegistry();  // Gets ALL plugins' tracks

  return tracks.map(track => (
    <Sequence name={track.name}>
      <track.Component events={track.filterEvents(ir.events)} />
    </Sequence>
  ));
}

// Adding subtitle plugin:
episode().use(new SubtitlePlugin()).build();
// ✅ Subtitles automatically appear!
// ✅ No renderer changes needed!
```

**Why this is critical:**

- Renderer doesn't need to know about specific plugins
- Plugins are self-contained (events + rendering)
- True extensibility (add plugins without core changes)

---

### Why TrackRegistry?

**Question:** Why a global registry? Why not pass plugins to renderer?

**Answer:** Decouples compilation from rendering.

**Without registry:**

```typescript
// Compilation
const ir = episode()
  .use(plugin1)
  .use(plugin2)
  .build();

// Rendering (in different process/file)
<TokovoRenderer ir={ir} plugins={[plugin1, plugin2]} />
// Must pass plugins manually
// Tight coupling between compile and render
```

**With registry:**

```typescript
// Compilation
episode()
  .use(plugin1)  // Registers plugin1.renderTrack
  .use(plugin2)  // Registers plugin2.renderTrack
  .build();

// Rendering (in different process/file)
<TokovoRenderer ir={ir} />
// Renderer queries registry
// Plugins already registered during compilation
// No coupling
```

**Why this matters:**

- Render and compile can be in separate processes
- IR can be serialized without plugins
- Studio can discover tracks automatically
- Clean separation of concerns

---

### Why zIndex in renderTrack?

**Question:** Why manual layer ordering? Why not automatic?

**Answer:** Layer order has semantic meaning.

**Wrong approach: Alphabetical**

```typescript
tracks.sort((a, b) => a.name.localeCompare(b.name));

// Result:
// Audio      ← Wrong! Should be at bottom
// Camera     ← Wrong! Should apply to content
// Subtitles  ← Wrong! Should be on top
// WhatsApp   ← Wrong! Should be middle
```

**Wrong approach: Registration order**

```typescript
episode()
  .use(new AudioPlugin())
  .use(new CameraPlugin())
  .use(new SubtitlePlugin());

// Subtitles registered last, rendered last
// But subtitles should be ON TOP!
```

**Correct approach: Explicit zIndex**

```typescript
AudioPlugin.renderTrack.zIndex = 0; // Bottom layer
CameraPlugin.renderTrack.zIndex = 10; // Transform layer
AppPlugin.renderTrack.zIndex = 20; // Content layer
SubtitlePlugin.renderTrack.zIndex = 90; // Top layer
DebugPlugin.renderTrack.zIndex = 100; // Debug overlay

tracks.sort((a, b) => a.zIndex - b.zIndex);

// Result: Correct visual layering
```

**Standard zIndex ranges:**

```
0-9    : Background (audio, ambient, effects)
10-19  : Camera transform (applied to content)
20-29  : Primary content (apps, phone screen)
30-49  : System UI (notifications, status bar)
50-79  : Overlays (keyboard, menus)
80-89  : Subtitles, captions
90-99  : Voice waveform, indicators
100+   : Debug, metrics, dev tools
```

**Why manual ordering:**

- Semantic meaning (subtitles always on top)
- Predictable layering
- Plugin author specifies intent
- Renderer just sorts and composes

---

### Why filterEvents in renderTrack?

**Question:** Why not just pass all events to every track?

**Answer:** Performance + semantic correctness.

**Without filtering:**

```typescript
<CameraLayer events={allEvents} />
// CameraLayer receives:
// - MESSAGE_RECEIVED (doesn't care)
// - NOTIFICATION_SHOWN (doesn't care)
// - SUBTITLE (doesn't care)
// - CAMERA (only cares about this!)
// Must filter internally on every render
```

**With filtering:**

```typescript
filterEvents: (events) => events.filter(e => e.kind === "CAMERA")

<CameraLayer events={filteredEvents} />
// CameraLayer receives ONLY camera events
// No filtering needed
// Re-renders only when camera events change
```

**Why this matters:**

- **Performance**: React re-renders only when relevant events change
- **Correctness**: Track only sees events it cares about
- **Simplicity**: Track component doesn't need filtering logic

---

### Why CompilerContext Has Anchors?

**Question:** Can't plugins just query anchors when needed?

**Answer:** Anchors are resolved at compile-time, plugins need them.

**How anchors flow:**

```
1. DSL: wa.at("1s").receive("Sarah", "OMG")
   ↓ Creates anchor: "message-0"

2. Compilation: Anchor stored in IR
   DeviceNode.anchors["message-0"] = Rect {x, y, w, h}

3. Plugin needs anchor:
   plugin.process(events, context)
   context.anchors.get("message-0")  // Available!

4. Plugin generates event:
   { type: "FOCUS", payload: { anchorId: "message-0" } }

5. Runtime: Engine resolves anchor to coordinates
   anchor = getAnchor("message-0")
   camera.centerOn(anchor.x, anchor.y)
```

**Why context passes anchors:**

- Plugins generate events with anchor IDs
- Anchors are semantic (not pixel coordinates)
- Context provides anchor registry
- Plugins can validate anchors exist

**Example:**

```typescript
class CameraDirectorPlugin {
  process(events, context) {
    const messageAnchors = context.anchors
      .list()
      .filter((a) => a.id.startsWith("message-"));

    // Validate anchor exists before using
    return events.map((e) => {
      const anchorId = `message-${e.payload.order}`;
      if (!context.anchors.has(anchorId)) {
        throw new Error(`Anchor ${anchorId} not found`);
      }

      return {
        type: "FOCUS",
        payload: { anchorId },
      };
    });
  }
}
```

---

## Implementation Flow

### The Complete Compilation Pipeline

```typescript
// Episode definition (DSL)
const episodeDef = episode("demo")
  .track("whatsapp", (wa) => wa.at("1s").receive("Sarah", "Hi"))
  .use(new CameraDirectorPlugin("fluid-tennis"))
  .build();

// Build process expands to:

// STEP 1: Track compilation (Pass 1)
function compileEpisode(episodeDef) {
  const baseIR: TrackEpisodeIR = {
    id: "demo",
    fps: 30,
    durationInFrames: 1200,
    events: [],
    devices: [],
    markers: [],
  };

  // Compile WhatsApp track
  const whatsappEvents = compileWhatsAppTrack(episodeDef.tracks.whatsapp);
  baseIR.events.push(...whatsappEvents);
  // baseIR.events = [
  //   { at: 30, kind: "APP", type: "MESSAGE_RECEIVED", payload: {...} }
  // ]

  return baseIR;
}

// STEP 2: Plugin processing (Pass 2)
function applyPlugins(baseIR, plugins, context) {
  for (const plugin of plugins) {
    console.log(`Running plugin: ${plugin.name}`);

    // Plugin reads existing IR, generates new events
    const newEvents = plugin.process(baseIR.events, context);

    console.log(`Plugin ${plugin.name} generated ${newEvents.length} events`);

    // Add new events to IR
    baseIR.events.push(...newEvents);
  }

  return baseIR;
  // baseIR.events = [
  //   { at: 30, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  //   { at: 30, kind: "CAMERA", type: "FOCUS", ... }  ← Added by plugin
  // ]
}

// STEP 3: Track registration (Pass 3)
function registerPluginTracks(plugins) {
  for (const plugin of plugins) {
    if (plugin.renderTrack) {
      trackRegistry.register(plugin.renderTrack);
      console.log(`Registered track: ${plugin.renderTrack.name}`);
    }
  }
}

// STEP 4: Lowering & finalization
function finalizeIR(ir) {
  // Sort events by frame
  ir.events.sort((a, b) => a.at - b.at);

  // Resolve IDs, validate, etc
  lowering(ir);

  // Freeze (immutable)
  Object.freeze(ir);
  Object.freeze(ir.events);

  return ir;
}

// Complete build pipeline:
const baseIR = compileEpisode(episodeDef); // Pass 1
const context = buildContext(baseIR); // Build context
const processedIR = applyPlugins(baseIR, plugins, context); // Pass 2
registerPluginTracks(plugins); // Pass 3
const finalIR = finalizeIR(processedIR); // Pass 4

console.log(`Final IR: ${finalIR.events.length} events`);
```

**Why this order:**

1. **Tracks first**: Creates base events (messages, etc)
2. **Plugins second**: Can read base events, generate derived events
3. **Register third**: Plugins register rendering components
4. **Finalize fourth**: Sort, validate, freeze

**Key insight:** Plugins see partially-compiled IR, can augment it.

---

### Rendering Pipeline

```typescript
// Rendering (in Remotion)
function TokovoRenderer({ ir }: { ir: TrackEpisodeIR }) {
  // Query registry for all registered tracks
  const tracks = useTrackRegistry();

  // Sort by zIndex (layer order)
  const sortedTracks = tracks.sort((a, b) => a.zIndex - b.zIndex);

  console.log(`Rendering ${sortedTracks.length} tracks:`,
    sortedTracks.map(t => `${t.name} (z=${t.zIndex})`));

  return (
    <>
      {sortedTracks.map(track => {
        // Filter events for this track
        const trackEvents = track.filterEvents(ir.events);

        return (
          <Sequence
            key={track.name}
            from={0}
            durationInFrames={ir.durationInFrames}
            name={track.name}
          >
            <track.Component events={trackEvents} />
          </Sequence>
        );
      })}
    </>
  );
}

// Example output:
// Rendering 4 tracks: [
//   "Audio (z=0)",
//   "Camera (z=10)",
//   "Apps (z=20)",
//   "Subtitles (z=90)"
// ]
```

**Why this works:**

- Renderer is generic (doesn't know about specific plugins)
- Plugins self-register during compilation
- Renderer just queries registry and composes
- Adding new plugin = zero renderer changes

---

## Migration Path

### Phase 1: Core Plugin Infrastructure (Week 1-2)

**Goal:** Establish plugin system foundation

**Tasks:**

1. **Create plugin interfaces**

   ```typescript
   // packages/compiler/src/plugins/types.ts
   export interface CompilerPlugin { ... }
   export interface RenderTrackDefinition { ... }
   export interface CompilerContext { ... }
   ```

2. **Create TrackRegistry**

   ```typescript
   // packages/renderer/src/registry/TrackRegistry.ts
   class TrackRegistry {
     private tracks = new Map<string, RenderTrackDefinition>();
     register(track: RenderTrackDefinition) { ... }
     getAll(): RenderTrackDefinition[] { ... }
   }

   export const trackRegistry = new TrackRegistry();
   export function useTrackRegistry() { return trackRegistry.getAll(); }
   ```

3. **Update episode builder**
   ```typescript
   // packages/dsl/src/episode-builder.ts
   class EpisodeBuilder {
     private plugins: CompilerPlugin[] = [];

     use(plugin: CompilerPlugin) {
       this.plugins.push(plugin);
       return this;
     }

     build() {
       const baseIR = this.compileTracks();
       const context = this.buildContext(baseIR);
       const finalIR = this.applyPlugins(baseIR, context);
       this.registerTracks();
       return finalIR;
     }

     private applyPlugins(baseIR, context) {
       for (const plugin of this.plugins) {
         const newEvents = plugin.process(baseIR.events, context);
         baseIR.events.push(...newEvents);
       }
       return baseIR;
     }

     private registerTracks() {
       for (const plugin of this.plugins) {
         if (plugin.renderTrack) {
           trackRegistry.register(plugin.renderTrack);
         }
       }
     }
   }
   ```

**Deliverable:** `.use(plugin)` API works, plugins can be registered

---

### Phase 2: Refactor Camera Director to Plugin (Week 2-3)

**Goal:** Convert existing Director to plugin architecture

**Tasks:**

1. **Create CameraDirectorPlugin**

   ```typescript
   // packages/device-camera/src/plugins/CameraDirectorPlugin.ts
   export class CameraDirectorPlugin implements CompilerPlugin {
     name = "camera-director";
     version = "1.0.0";
     subscribesTo = ["MESSAGE_RECEIVED", "NOTIFICATION_SHOWN", "TYPING_START"];
     emits = ["CAMERA"];

     constructor(private behavior: BehaviorId) {}

     process(events, context) {
       const director = new CameraDirector({ fps: context.fps });
       const effects = director.choreograph(events, {
         behaviorMap: {
           MESSAGE_RECEIVED: this.behavior,
           NOTIFICATION_SHOWN: "interrupt-focus",
           TYPING_START: "drift-anticipation",
         },
       });

       return effects.map((e) => ({
         at: e.timestamp,
         kind: "CAMERA",
         type: e.type,
         payload: e.params,
         duration: e.duration,
       }));
     }

     renderTrack = {
       name: "Camera",
       zIndex: 10,
       Component: CameraLayer,
       filterEvents: (e) => e.filter((ev) => ev.kind === "CAMERA"),
     };
   }
   ```

2. **Update mega-camera-director episode**

   ```typescript
   // Before: 200+ lines with manual events

   // After: Clean plugin usage
   episode("mega-camera-director")
     .track("whatsapp", (wa) => {
       wa.at("1s").receive("Sarah", "OMG");
       // ... just messages
     })
     .use(new CameraDirectorPlugin("fluid-tennis-energetic"))
     .build();
   ```

3. **Verify all behaviors work**
   - fluid-tennis-casual
   - fluid-tennis-energetic
   - fluid-tennis-dramatic
   - interrupt-focus
   - drift-anticipation
   - static

**Deliverable:** Camera Director works as plugin, mega episode simplified

---

### Phase 3: Refactor Renderer to Use Registry (Week 3-4)

**Goal:** Make renderer plugin-aware

**Tasks:**

1. **Update TokovoRenderer**

   ```typescript
   // Before: Hardcoded layers
   function TokovoRenderer({ ir }) {
     return (
       <>
         <AudioLayer events={audioEvents} />
         <CameraTransform events={cameraEvents}>
           <PhoneView events={appEvents} />
         </CameraTransform>
         <SystemOverlays events={osEvents} />
       </>
     );
   }

   // After: Dynamic from registry
   function TokovoRenderer({ ir }) {
     const tracks = useTrackRegistry();

     return tracks
       .sort((a, b) => a.zIndex - b.zIndex)
       .map(track => (
         <Sequence key={track.name} from={0} durationInFrames={ir.durationInFrames}>
           <track.Component events={track.filterEvents(ir.events)} />
         </Sequence>
       ));
   }
   ```

2. **Convert existing layers to built-in plugins**

   ```typescript
   // Audio as plugin
   class AudioPlugin implements CompilerPlugin {
     renderTrack = {
       name: "Audio",
       zIndex: 0,
       Component: AudioLayer,
       filterEvents: (e) => e.filter((ev) => ev.kind === "AUDIO"),
     };
   }

   // Camera as plugin (built-in)
   class CameraPlugin implements CompilerPlugin {
     renderTrack = {
       name: "Camera",
       zIndex: 10,
       Component: CameraTransformProvider,
       filterEvents: (e) => e.filter((ev) => ev.kind === "CAMERA"),
     };
   }

   // App content as plugin
   class AppPlugin implements CompilerPlugin {
     renderTrack = {
       name: "Apps",
       zIndex: 20,
       Component: PhoneView,
       filterEvents: (e) => e.filter((ev) => ev.kind === "APP"),
     };
   }

   // Auto-register built-ins
   trackRegistry.register(AudioPlugin.renderTrack);
   trackRegistry.register(CameraPlugin.renderTrack);
   trackRegistry.register(AppPlugin.renderTrack);
   ```

**Deliverable:** Renderer is plugin-driven, existing features work

---

### Phase 4: Create Example Plugins (Week 4-5)

**Goal:** Prove extensibility with new plugins

**Tasks:**

1. **SubtitlePlugin**

   ```typescript
   class SubtitlePlugin implements CompilerPlugin {
     subscribesTo = ["MESSAGE_RECEIVED"];
     emits = ["SUBTITLE"];

     process(events) {
       return events
         .filter(e => e.type === "MESSAGE_RECEIVED")
         .map(e => ({
           at: e.at,
           kind: "SUBTITLE",
           type: "SHOW",
           payload: {
             text: e.payload.content,
             duration: 90
           }
         }));
     }

     renderTrack = {
       name: "Subtitles",
       zIndex: 90,
       Component: ({ events }) => {
         const frame = useCurrentFrame();
         const active = events.find(e =>
           frame >= e.at && frame < e.at + e.payload.duration
         );
         if (!active) return null;
         return <div className="subtitle">{active.payload.text}</div>;
       },
       filterEvents: (e) => e.filter(ev => ev.kind === "SUBTITLE")
     };
   }

   // Usage
   episode()
     .use(new SubtitlePlugin())
     .build();
   ```

2. **VoicePlugin**
3. **DebugOverlayPlugin**

**Deliverable:** Multiple plugins working together, prove extensibility

---

### Phase 5: Documentation (Week 5-6)

**Goal:** Enable others to create plugins

**Docs needed:**

- Plugin authoring guide
- CompilerContext reference
- Event type registry
- renderTrack best practices
- zIndex conventions
- Example plugin template

---

## Studio Integration (Future)

**Note:** This section describes future work. Focus is on the plugin system first.

### Why Studio Comes After Plugins

**Dependency chain:**

```
Plugin System
    ↓
TrackRegistry + RenderTrackDefinition
    ↓
Timeline Component (reads from registry)
    ↓
Studio Editor (just a consumer)
```

**Why this order:**

1. **Plugins define track structure** - Studio reads it
2. **Registry is the API** - Studio queries it
3. **Self-describing tracks** - Studio doesn't need plugin knowledge
4. **Extensibility proof** - Studio works with ANY plugin

---

### What Studio Will Do

**Core features:**

1. **Visual Timeline**

   ```typescript
   function Timeline({ ir }) {
     const tracks = useTrackRegistry();  // Gets all plugin tracks!

     return (
       <div className="timeline">
         {tracks.map(track => (
           <TrackRow
             name={track.name}      // From plugin
             color={track.color}    // From plugin
             zIndex={track.zIndex}  // From plugin
           >
             {ir.events
               .filter(track.filterEvents)  // From plugin
               .map(event => (
                 <EventClip event={event} />
               ))}
           </TrackRow>
         ))}
       </div>
     );
   }
   ```

2. **Drag-and-Drop Editing**

   ```typescript
   function EventClip({ event, onChange }) {
     return (
       <div
         draggable
         onDrag={(e) => {
           const newFrame = pixelsToFrame(e.clientX);
           onChange(event.id, { at: newFrame });
         }}
       >
         <ResizeHandle
           onDrag={(delta) => {
             onChange(event.id, {
               duration: event.duration + pixelsToFrames(delta)
             });
           }}
         />
       </div>
     );
   }
   ```

3. **IR Mutation**
   ```typescript
   function Studio({ episodeFile }) {
     const [ir, setIR] = useState(compileEpisode(episodeFile));

     function handleEventChange(eventId, updates) {
       const event = ir.events.find((e) => e.id === eventId);
       Object.assign(event, updates);
       setIR({ ...ir }); // Trigger re-render
     }

     function exportIR() {
       fs.writeFile(`${episodeFile}.edited.ir.json`, JSON.stringify(ir));
     }
   }
   ```

**Why plugins make Studio easier:**

| Without Plugins                   | With Plugins             |
| --------------------------------- | ------------------------ |
| Hardcode track list               | Read from registry       |
| Update Studio for new tracks      | Plugins auto-appear      |
| Couple Studio to camera/audio/etc | Generic consumer         |
| Manual track metadata             | Plugins provide metadata |

**Timeline automatically shows:**

- Camera track (from CameraDirectorPlugin)
- Subtitle track (from SubtitlePlugin)
- Voice track (from VoicePlugin)
- Any future plugin track (zero Studio changes)

---

### Studio Implementation Phases

**Phase 1: Read-Only Timeline** (Week 1)

- Display IR events as visual timeline
- Show all plugin tracks from registry
- Playhead scrubbing
- No editing yet

**Phase 2: IR Editing** (Week 2)

- Drag events to new positions
- Resize event durations
- Real-time preview
- Save edited IR

**Phase 3: Code Hints** (Week 3)

- Show suggested DSL code changes
- User manually applies to episode file
- Best of both worlds (visual + code)

**Phase 4: Integration** (Week 4)

- Episode file watcher
- Auto-recompile on changes
- Two-way sync (visual ↔ code)

**Future: Advanced**

- AST manipulation (auto-update code)
- Multi-episode timeline
- Collaboration features

---

## Conclusion

### What We've Designed

**Two-sided plugin architecture:**

- ✅ **Compile-time**: Plugins read IR events, generate new events
- ✅ **Render-time**: Plugins provide Remotion tracks/layers
- ✅ **Self-contained**: Each plugin packages logic + rendering
- ✅ **Extensible**: Add features without core changes
- ✅ **Deterministic**: Compile once, render anywhere

### Why This Architecture

**Solves core problems:**

- ✅ Eliminates event duplication (read from IR)
- ✅ Enables true extensibility (plugins add capabilities)
- ✅ Self-describing tracks (renderer discovers from registry)
- ✅ Preserves determinism (compile-time only)
- ✅ Enables visual editing (plugins define track structure)

**Fits existing system:**

- ✅ IR is already event bus (leverage existing design)
- ✅ Multi-pass compilation (natural fit)
- ✅ Remotion composition (plugins provide Sequences)
- ✅ Backwards compatible (existing code becomes built-in plugins)

**Enables future:**

- ✅ Visual timeline editor (reads from TrackRegistry)
- ✅ Community plugins (versioning, marketplace)
- ✅ Rapid feature development (plugin in days, not weeks)
- ✅ Experimentation (plugins are isolated)

### Next Action

**Implement Phase 1: Core Plugin Infrastructure**

- Create plugin interfaces
- Build TrackRegistry
- Add `.use()` to episode builder
- Validate with simple test plugin

**Then Phase 2: Camera Director Plugin**

- Refactor existing Director
- Prove the pattern works
- Simplify mega-camera-director episode
- Foundation for all future plugins

**The path is clear. Ready to build.**
