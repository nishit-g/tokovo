# FINAL ARCHITECTURE PLAN: Plugin System + Remotion Track Composition

**Status**: Final Design Document  
**Created**: 2026-01-29  
**Author**: Deep Architecture Analysis

---

## The Critical Insight: Two Separate Systems

After researching Remotion and Tokovo's architecture, I now understand the distinction:

### **What You Meant By "Track"**

You're NOT asking about DSL `.span()` - you're asking about **Remotion's composition model**:

```tsx
// Remotion Track/Layer = <Sequence> wrapper
<Sequence from={30} durationInFrames={90} name="Audio Track">
  <Audio src="bgm.mp3" />
</Sequence>

<Sequence from={0} durationInFrames={1200} name="Video Track">
  <PhoneScreen />
</Sequence>

<Sequence from={150} durationInFrames={300} name="Subtitle Track">
  <Subtitles data={...} />
</Sequence>
```

**This is different from IR events!** Remotion Sequences are **render-time composition**, not compile-time events.

---

## The Architecture: Two Complementary Systems

### **System 1: Compile-Time Plugin System (IR Events)**

**What it does**: Generates event data

```typescript
episode()
  .track("whatsapp", ...)  // Generates MESSAGE_RECEIVED events
  .use(new CameraDirectorPlugin())  // Reads messages → generates CAMERA events
  .use(new SubtitlePlugin())  // Reads messages → generates SUBTITLE events
  .build()

// Result: IR with flat event list
IR.events = [
  { at: 30, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  { at: 30, kind: "CAMERA", type: "FOCUS", ... },
  { at: 30, kind: "SUBTITLE", type: "SHOW", ... }
]
```

**Responsibility**: Event generation, no rendering

---

### **System 2: Render-Time Track System (Remotion Sequences)**

**What it does**: Renders events as Remotion layers

```tsx
// Current: Hardcoded in TokovoRenderer
function TokovoRenderer({ ir }) {
  return (
    <>
      <AudioLayer events={ir.events} /> {/* Inline, not modular */}
      <PhoneView />
      <SystemOverlays />
    </>
  );
}

// Proposed: Plugin-based track registry
function TokovoRenderer({ ir }) {
  const tracks = useTrackRegistry();

  return (
    <>
      {tracks.map((track) => (
        <Sequence
          key={track.name}
          from={0}
          durationInFrames={ir.durationInFrames}
        >
          <track.Component events={track.filterEvents(ir.events)} />
        </Sequence>
      ))}
    </>
  );
}
```

---

## The Problem With Current Renderer

**Hardcoded layers** - can't extend without editing TokovoRenderer:

```tsx
// Current: All layers baked in
<>
  <AudioLayer /> {/* Can't remove */}
  <PhoneView /> {/* Can't reorder */}
  <SystemOverlays /> {/* Can't add new layers between */}
  {/* Want subtitles layer? Edit this file */}
  {/* Want voice layer? Edit this file */}
  {/* Want debug overlay? Edit this file */}
</>
```

**Plugin can generate events but can't render them:**

```typescript
// SubtitlePlugin generates SUBTITLE events ✅
class SubtitlePlugin {
  process(events) {
    return events.map((e) => ({
      at: e.at,
      kind: "SUBTITLE", // New event kind
      type: "SHOW",
      payload: { text: e.payload.content },
    }));
  }
}

// But who renders SUBTITLE events? ❌
// Must manually add <SubtitleLayer /> to TokovoRenderer
// This breaks the plugin model!
```

---

## The Solution: Two-Sided Plugin System

Plugins provide **BOTH** compile-time (IR generation) **AND** render-time (React component) logic:

```typescript
interface CompilerPlugin {
  name: string;
  version: string;

  // Compile-time: Generate events
  subscribesTo: string[];
  emits: string[];
  process(events: TrackEvent[], context: CompilerContext): TrackEvent[];

  // Render-time: Render events
  renderTrack?: RenderTrackDefinition;
}

interface RenderTrackDefinition {
  name: string;
  zIndex: number; // Layer ordering
  Component: React.ComponentType<{ events: TrackEvent[] }>;
  filterEvents: (events: TrackEvent[]) => TrackEvent[];
}
```

---

## Complete Plugin Example

```typescript
class SubtitlePlugin implements CompilerPlugin {
  name = "subtitle-generator";
  version = "1.0.0";

  // 1. COMPILE-TIME: Generate SUBTITLE events from messages
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
          duration: 90  // 3 seconds
        }
      }));
  }

  // 2. RENDER-TIME: Provide Remotion track
  renderTrack = {
    name: "Subtitles",
    zIndex: 100,  // Above video, below debug

    Component: ({ events }) => {
      const frame = useCurrentFrame();
      const active = events.find(e =>
        frame >= e.at && frame < e.at + e.payload.duration
      );

      if (!active) return null;

      return (
        <div style={{
          position: 'absolute',
          bottom: 100,
          width: '100%',
          textAlign: 'center',
          fontSize: 24,
          color: 'white',
          textShadow: '2px 2px 4px black'
        }}>
          {active.payload.text}
        </div>
      );
    },

    filterEvents: (events) => events.filter(e => e.kind === "SUBTITLE")
  };
}
```

---

## How It Works End-to-End

```typescript
// 1. Episode uses plugin
episode("demo")
  .track("whatsapp", wa => wa.at("1s").receive("Sarah", "Hello!"))
  .use(new SubtitlePlugin())
  .build();

// 2. Compile-time: Plugin generates events
Compiler:
  Track events: [{ at: 30, kind: "APP", type: "MESSAGE_RECEIVED", ... }]
  Plugin.process(): [{ at: 30, kind: "SUBTITLE", type: "SHOW", ... }]
  Final IR: { events: [...both...] }

// 3. Build-time: Plugin registers render track
PluginRegistry.register(SubtitlePlugin.renderTrack);

// 4. Render-time: TokovoRenderer uses registry
function TokovoRenderer({ ir }) {
  const tracks = useTrackRegistry();  // Gets all registered tracks

  return (
    <>
      {tracks
        .sort((a, b) => a.zIndex - b.zIndex)  // Layer order
        .map(track => (
          <Sequence key={track.name} from={0} durationInFrames={ir.durationInFrames}>
            <track.Component events={track.filterEvents(ir.events)} />
          </Sequence>
        ))}
    </>
  );
}

// Result: Subtitles appear automatically!
// - Plugin generates SUBTITLE events
// - Plugin provides SubtitleLayer component
// - Renderer composes all tracks
// Zero manual edits to renderer
```

---

## Benefits: Why This Architecture

### ✅ **True Extensibility**

Add features without touching core:

```typescript
episode()
  .use(new SubtitlePlugin())
  .use(new VoicePlugin())
  .use(new DebugOverlayPlugin())
  .use(new ScreenRecordingPlugin())
  .build();

// Each plugin:
// - Generates its own events
// - Renders its own Remotion layer
// - Composes with others automatically
```

### ✅ **Proper Separation of Concerns**

| Layer            | Responsibility            |
| ---------------- | ------------------------- |
| DSL              | Content definition        |
| Plugin (compile) | Event generation          |
| IR               | Event storage             |
| Plugin (render)  | Layer rendering           |
| TokovoRenderer   | Composition orchestration |

### ✅ **Remotion Best Practices**

From Remotion skill:

> **Rule**: Use <Sequence> for time-based composition  
> **Rule**: Keep sequences modular and composable  
> **Rule**: Use zIndex for layer ordering

Plugins follow these exactly - each provides a modular `<Sequence>` wrapper.

### ✅ **No Breaking Changes**

Existing code still works:

```typescript
// Manual layers still work (built-in plugins)
episode().camera(cam => cam.at("1s").focus(...)).build();
// CameraPlugin is just a built-in plugin

// Manual renderer code still works
// Plugins are opt-in additions
```

---

## Track Registry Implementation

```typescript
// Global registry (populated at build time)
class TrackRegistry {
  private tracks = new Map<string, RenderTrackDefinition>();

  register(track: RenderTrackDefinition) {
    this.tracks.set(track.name, track);
  }

  getAll() {
    return Array.from(this.tracks.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  clear() {
    this.tracks.clear();
  }
}

// React hook
function useTrackRegistry() {
  return trackRegistry.getAll();
}

// Episode builder registers plugins
episode()
  .use(plugin) // Registers both compile + render sides
  .build();
```

---

## Built-in Tracks (Migration)

Existing layers become built-in plugins:

```typescript
// AudioPlugin (existing AudioLayer)
class AudioPlugin implements CompilerPlugin {
  renderTrack = {
    name: "Audio",
    zIndex: 0, // Bottom layer
    Component: AudioLayer, // Existing component
    filterEvents: (e) => e.filter((ev) => ev.kind === "AUDIO"),
  };
}

// CameraPlugin (existing camera system)
class CameraPlugin implements CompilerPlugin {
  renderTrack = {
    name: "Camera",
    zIndex: 10, // Camera transform applied to content
    Component: CameraTransformProvider,
    filterEvents: (e) => e.filter((ev) => ev.kind === "CAMERA"),
  };
}

// AppPlugin (existing PhoneView)
class AppPlugin implements CompilerPlugin {
  renderTrack = {
    name: "Apps",
    zIndex: 20,
    Component: PhoneView,
    filterEvents: (e) => e.filter((ev) => ev.kind === "APP"),
  };
}

// Auto-registered in core
trackRegistry.register(AudioPlugin.renderTrack);
trackRegistry.register(CameraPlugin.renderTrack);
trackRegistry.register(AppPlugin.renderTrack);
```

---

## Layer Ordering (zIndex)

```
100+ : Debug overlays (metrics, fps, event inspector)
90   : Subtitles (above everything)
80   : Voice waveform visualization
50   : System UI (notifications, status bar)
20   : App content (WhatsApp, Instagram)
10   : Camera transform (applied to app layer)
5    : Background effects (blur, vignette)
0    : Audio (no visual, just playback)
-10  : Reference layers (safe area guides)
```

Plugins specify zIndex, renderer sorts and composes.

---

## Example: Full Stack

```typescript
// 1. Episode
episode("demo")
  .track("whatsapp", wa => {
    wa.at("1s").receive("Sarah", "Hello!");
    wa.at("3s").receive("Sarah", "How are you?");
  })
  .use(new CameraDirectorPlugin("fluid-tennis"))
  .use(new SubtitlePlugin({ position: "bottom" }))
  .use(new VoicePlugin({ voice: "sarah" }))
  .use(new DebugOverlayPlugin())
  .build();

// 2. Compile (IR generation)
IR.events = [
  { at: 30, kind: "APP", type: "MESSAGE_RECEIVED", ... },        // WhatsApp
  { at: 30, kind: "CAMERA", type: "FOCUS", ... },                // Director
  { at: 30, kind: "SUBTITLE", type: "SHOW", text: "Hello!" },    // Subtitle
  { at: 30, kind: "VOICE", type: "SPEAK", text: "Hello!" },      // Voice
  { at: 90, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  { at: 90, kind: "CAMERA", type: "FOCUS", ... },
  { at: 90, kind: "SUBTITLE", type: "SHOW", text: "How are you?" },
  { at: 90, kind: "VOICE", type: "SPEAK", text: "How are you?" }
]

// 3. Render (Remotion composition)
<>
  <Sequence name="Audio" from={0}>
    <AudioLayer events={audioEvents} />
  </Sequence>

  <Sequence name="Camera" from={0}>
    <CameraTransformProvider events={cameraEvents}>
      <Sequence name="Apps" from={0}>
        <PhoneView events={appEvents} />
      </Sequence>
    </CameraTransformProvider>
  </Sequence>

  <Sequence name="Subtitles" from={0}>
    <SubtitleLayer events={subtitleEvents} />
  </Sequence>

  <Sequence name="Voice" from={0}>
    <VoiceLayer events={voiceEvents} />
  </Sequence>

  <Sequence name="Debug" from={0}>
    <DebugOverlay events={allEvents} />
  </Sequence>
</>
```

---

## Strong Justification: Why This Is Right

### **1. Addresses Real Limitation**

**Current**: Plugins can generate events but can't render them  
**Solution**: Plugins provide both event generation AND rendering

### **2. Follows Remotion Patterns**

**Remotion**: Modular `<Sequence>` composition  
**Tokovo**: Each plugin = one `<Sequence>` track  
**Result**: Idiomatic Remotion code

### **3. Enables True Plugin Ecosystem**

```typescript
// Community plugins just work
import { CinematicTransitionsPlugin } from "tokovo-plugins-transitions";
import { MotionGraphicsPlugin } from "tokovo-plugins-motion";

episode()
  .use(new CinematicTransitionsPlugin())
  .use(new MotionGraphicsPlugin())
  .build();

// No core changes needed
// Plugins handle everything
```

### **4. Maintains Determinism**

- Compile-time: Events generated (deterministic)
- Render-time: Pure components (deterministic)
- Same IR + same plugins = same video

### **5. Backwards Compatible**

- Existing episodes work (built-in plugins)
- Existing renderer works (registry is additive)
- Migration is opt-in

### **6. Debuggable**

```typescript
// Debug overlay plugin can inspect ALL events
class DebugOverlayPlugin {
  renderTrack = {
    name: "Debug",
    zIndex: 999,
    Component: ({ events }) => {
      const frame = useCurrentFrame();
      const activeEvents = events.filter(e =>
        e.at <= frame && frame < e.at + (e.duration || 1)
      );

      return (
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          Frame: {frame}
          Active: {activeEvents.map(e => e.type).join(", ")}
        </div>
      );
    }
  };
}
```

---

## Implementation Plan

### **Phase 1: Track Registry (Foundational)**

1. Create `TrackRegistry` class
2. Create `RenderTrackDefinition` interface
3. Add `useTrackRegistry()` hook
4. Refactor `TokovoRenderer` to use registry

**Result**: Renderer becomes plugin-driven

### **Phase 2: Built-in Track Plugins**

1. `AudioTrackPlugin` (existing AudioLayer)
2. `CameraTrackPlugin` (existing camera)
3. `AppTrackPlugin` (existing PhoneView)
4. `OSTrackPlugin` (existing SystemOverlays)

**Result**: Existing features work via plugin system

### **Phase 3: Plugin Interface Update**

1. Add `renderTrack` to `CompilerPlugin` interface
2. Update episode builder `.use()` to register both sides
3. Add zIndex-based layer sorting

**Result**: Plugins can provide Remotion tracks

### **Phase 4: New Plugins**

1. `SubtitlePlugin` (proof of concept)
2. `VoicePlugin` (TTS integration)
3. `DebugOverlayPlugin` (dev tools)

**Result**: Demonstrate extensibility

### **Phase 5: Migration**

1. Update existing episodes to use new plugins
2. Document plugin authoring
3. Create plugin template/generator

**Result**: Production-ready plugin system

---

## Open Design Questions

### **1. Nested Sequences**

Some tracks need nesting (camera wraps app):

```tsx
<Sequence name="Camera">
  <CameraTransform>
    <Sequence name="App">
      <PhoneView />
    </Sequence>
  </CameraTransform>
</Sequence>
```

**Solution**: Plugins specify `parentTrack` for nesting:

```typescript
CameraPlugin.renderTrack = {
  name: "Camera",
  zIndex: 10,
  children: ["App", "OS"], // These render inside camera transform
  Component: CameraTransformProvider,
};
```

### **2. Shared State**

Can plugins share state (e.g., camera transform used by multiple layers)?

**Solution**: React Context + track hierarchy:

```typescript
<CameraContext.Provider value={cameraTransform}>
  <AppLayer />  {/* Can consume camera context */}
  <SubtitleLayer />  {/* Can consume camera context */}
</CameraContext.Provider>
```

### **3. Plugin Dependencies**

Can plugin B require plugin A?

```typescript
class SubtitlePlugin {
  requires = ["camera-director"]; // Won't work without camera
}
```

**Solution**: Compiler validates plugin dependencies before building.

---

## Conclusion: The Complete Picture

```
┌───────────────────────────────────────────────────────────────┐
│ EPISODE DSL                                                   │
│   .track("whatsapp", ...).use(plugins).build()               │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│ COMPILER (Multi-pass)                                         │
│   Pass 1: Tracks → Base IR events                            │
│   Pass 2: Plugins.process() → Generated events               │
│   Pass 3: Merge & sort → Final IR                            │
│   Pass 4: Register plugin.renderTrack → TrackRegistry        │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│ IR (Frozen Event List)                                        │
│   Single source of truth                                      │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│ ENGINE                                                        │
│   replay(t) → WorldState                                     │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│ RENDERER (Plugin-driven Composition)                          │
│   TrackRegistry.getAll() → Sorted tracks                     │
│   {tracks.map(t => <Sequence><t.Component /></Sequence>)}    │
└───────────────────────────────────────────────────────────────┘
                              ↓
                          VIDEO OUTPUT
```

**This architecture solves:**

- ✅ Event duplication (plugins read from IR)
- ✅ Render extensibility (plugins provide tracks)
- ✅ Remotion composition (modular `<Sequence>` layers)
- ✅ Plugin ecosystem (community can extend)
- ✅ Determinism (compile-time + pure render)

**Ready to implement?**
