# @tokovo/compiler

Enterprise-grade compilation system for Tokovo episodes with plugin architecture.

## Features

- **Plugin System** - Extensible compile-time transformations
- **Multi-Pass Compilation** - Ordered plugin execution with dependencies
- **Type-Safe Events** - Strong typing for IR events
- **Director Plugins** - Auto-generate camera, audio, OS state
- **Zero Runtime Cost** - All transformations at compile-time

---

## Installation

```bash
pnpm add @tokovo/compiler
```

---

## Quick Start

```typescript
import { episode } from "@tokovo/dsl";
import {
  CameraDirectorPlugin,
  AudioDirectorPlugin,
  OSDirectorPlugin,
} from "@tokovo/compiler";

episode("demo", { fps: 30, duration: "30s" })
  .track("whatsapp", factory, (wa) => {
    wa.at("1s").receive("Sarah", "Hey!");
    wa.at("3s").send("Hey there!");
  })
  .use(new CameraDirectorPlugin())
  .use(new AudioDirectorPlugin({ mood: "chill" }))
  .use(new OSDirectorPlugin({ startBattery: 85 }))
  .build();
```

**Result:** Camera movements, background music, and OS state auto-generated from messages!

---

## Plugin System

### **What Are Plugins?**

Plugins are compile-time transformations that:

- Read events from IR (Intermediate Representation)
- Generate new events (camera, audio, OS, etc.)
- Run during `.build()` phase
- Are pure functions (deterministic)

### **When to Use Plugins**

**✅ Use plugins when:**

- Pattern repeats across episodes (camera movements, audio, OS)
- Want consistent quality
- Don't need per-event customization

**❌ Don't use plugins when:**

- Need artistic control (custom camera sequences)
- Per-event variation required
- Showcase/demo episodes (demonstrate manual system)

---

## Built-in Plugins

### **1. CameraDirectorPlugin** ✅

Auto-generates camera movements from conversation events.

```typescript
import { CameraDirectorPlugin } from "@tokovo/compiler";

// Default behavior (energetic)
.use(new CameraDirectorPlugin())

// Use preset
.use(new CameraDirectorPlugin("fluid-tennis-dramatic"))

// Custom behaviors
.use(new CameraDirectorPlugin({
  behaviors: {
    MESSAGE_RECEIVED: "fluid-tennis-dramatic",
    NOTIFICATION_SHOWN: "interrupt-focus",
    TYPING_START: "static"
  }
}))
```

**Available Presets:**

- `fluid-tennis-casual` - Calm conversations (scale 1.1, shake 2)
- `fluid-tennis-energetic` - **DEFAULT** - Normal chat (scale 1.2, shake 3)
- `fluid-tennis-dramatic` - Intense/emotional (scale 1.25, shake 6)
- `interrupt-focus` - Notifications (scale 1.3, no shake)
- `drift-anticipation` - Typing indicators (scale 1.05, no shake)
- `static` - No movement (scale 1.0, no shake)

**Impact:** Eliminates 100-300 lines of camera code per episode

**See:** [device-camera README](../device-camera/README.md) for full API

---

### **2. AudioDirectorPlugin** ✅

Auto-generates background music for episodes.

```typescript
import { AudioDirectorPlugin } from "@tokovo/compiler";

.use(new AudioDirectorPlugin({
  mood: "chill",     // Mood preset
  volume: 0.15,      // Volume (0-1)
  fadeIn: "2s",      // Fade in duration
  fadeOut: "3s"      // Fade out duration
}))
```

**Available Moods:**

- `chill` → lofi_chill
- `casual` → ambient_light
- `upbeat` → ambient_upbeat
- `intense` → dramatic_swell
- `dramatic` → ambient_dramatic
- `epic` → epic_tension
- `soft` → ambient_soft
- `tension` → tension_ambient
- `dark` → synth_dark
- `romantic` → romantic_tension

**Impact:** Eliminates 4-6 lines of audio code per episode

---

### **3. OSDirectorPlugin** ✅

Auto-generates realistic OS state updates (time, battery, network).

```typescript
import { OSDirectorPlugin } from "@tokovo/compiler";

.use(new OSDirectorPlugin({
  startTime: new Date("2024-12-17T19:30:00"),  // Start time
  startBattery: 78,                            // Battery % (0-100)
  batteryDrainRate: 1,                         // % per interval
  updateInterval: "15s",                       // How often to update
  networkFluctuations: false                   // Enable network drops
}))
```

**Features:**

- Time increments automatically (10:00 → 10:15 → 10:30)
- Battery drains linearly
- Optional network fluctuations
- Aligned updates (every N seconds)

**Impact:** Eliminates 10-15 lines of OS code per episode

---

## Plugin API Reference

### **CompilerPlugin Interface**

```typescript
interface CompilerPlugin {
  // Metadata
  name: string;
  version: string;

  // Event filtering
  subscribesTo: EventType[]; // Which events to listen for
  emits?: EventType[]; // Which events to generate

  // Core transformation
  process(
    events: TrackEvent[], // Events this plugin subscribed to
    context: CompilerContext, // fps, devices, sections, etc.
  ): TrackEvent[]; // New events to add

  // Optional hooks
  renderTrack?(context: CompilerContext): TrackDefinition;
  validate?(ir: TrackEpisodeIR): ValidationResult;
  dependsOn?: string[]; // Plugin execution order
}
```

### **CompilerContext**

```typescript
interface CompilerContext {
  fps: number; // Frames per second
  durationInFrames: number; // Total episode duration
  devices: DeviceConfig[]; // Registered devices
  anchors: Record<string, Anchor>; // Semantic anchors
  sections: Section[]; // Story sections
  marks: Mark[]; // Story beats
}
```

---

## Creating Custom Plugins

### **Step 1: Define Plugin Class**

```typescript
import { CompilerPlugin, CompilerContext, TrackEvent } from "@tokovo/compiler";

export class MyPlugin implements CompilerPlugin {
  name = "my-plugin";
  version = "1.0.0";

  subscribesTo = ["MESSAGE_RECEIVED", "MESSAGE_SENT"];
  emits = ["CUSTOM_EVENT"];

  constructor(private config: { intensity: number }) {}

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const newEvents: TrackEvent[] = [];

    for (const event of events) {
      if (event.type === "MESSAGE_RECEIVED") {
        newEvents.push({
          at: event.at,
          kind: "CUSTOM",
          type: "CUSTOM_EVENT",
          payload: {
            intensity: this.config.intensity,
            text: event.payload.text,
          },
          _declarationOrder: 0, // Auto-assigned by compiler
        });
      }
    }

    return newEvents;
  }
}
```

### **Step 2: Export from Package**

```typescript
// packages/compiler/src/plugins/index.ts
export * from "./my-plugin";
```

### **Step 3: Use in Episodes**

```typescript
import { MyPlugin } from "@tokovo/compiler";

episode("demo", config)
  .track("whatsapp", factory, (wa) => {
    wa.at("1s").receive("Sarah", "Hey!");
  })
  .use(new MyPlugin({ intensity: 5 }))
  .build();
```

---

## Plugin Best Practices

### **✅ DO**

1. **Keep Plugins Pure**
   - No side effects (file writes, network calls)
   - Deterministic (same input → same output)
   - Pure function: events in → events out

2. **Use dependsOn for Ordering**

   ```typescript
   class PluginB implements CompilerPlugin {
     dependsOn = ["plugin-a"]; // Run after plugin-a
   }
   ```

3. **Validate Inputs**

   ```typescript
   constructor(config: MyConfig) {
     if (config.intensity < 0 || config.intensity > 10) {
       throw new Error("intensity must be 0-10");
     }
   }
   ```

4. **Document Behavior**
   - What events it subscribes to
   - What events it emits
   - Configuration options

5. **Test Thoroughly**
   ```typescript
   test("generates events correctly", () => {
     const plugin = new MyPlugin({ intensity: 5 });
     const output = plugin.process(inputEvents, mockContext());
     expect(output).toMatchSnapshot();
   });
   ```

### **❌ DON'T**

1. **Don't Make Plugins Async**

   ```typescript
   // ❌ BAD
   async process(events, context) {
     const result = await fetch("https://api.com/data");
     return generateEvents(result);
   }
   ```

2. **Don't Modify Input Events**

   ```typescript
   // ❌ BAD
   process(events, context) {
     events[0].payload.modified = true;  // WRONG!
   }

   // ✅ GOOD
   process(events, context) {
     return events.map(e => ({ ...e, payload: { ...e.payload } }));
   }
   ```

3. **Don't Mix Compile-Time + Runtime**
   - CompilerPlugin = compile-time only
   - TokovoPluginContract (from @tokovo/core) = runtime only
   - Never combine them

4. **Don't Use Global State**

   ```typescript
   // ❌ BAD
   let globalCounter = 0;

   process() {
     globalCounter++;  // Non-deterministic!
   }
   ```

---

## Multi-Pass Compilation

Plugins run in multiple passes during `.build()`:

```
Episode DSL
    ↓
Pass 1: Track Builders Emit Events
    → MESSAGE_RECEIVED, MESSAGE_SENT, TYPING_START, etc.
    ↓
Pass 2: Plugins Transform Events (ordered by dependsOn)
    → CameraDirectorPlugin sees MESSAGE_RECEIVED
    → Generates CAMERA_FOCUS, CAMERA_SHAKE
    ↓
Pass 3: Sort Events by (timestamp, _declarationOrder)
    ↓
IR (Intermediate Representation)
    ↓
Runtime Renderer
```

**Key Points:**

- Plugins run AFTER track builders
- Plugins can read ALL events from IR
- Plugin order determined by `dependsOn`
- `_declarationOrder` prevents timestamp collisions

---

## Hybrid Mode (Plugin + Manual)

Combine auto-choreography with manual artistic moments:

```typescript
.use(new CameraDirectorPlugin())  // Auto-handles 90%
.use(new AudioDirectorPlugin({ mood: "chill" }))
.camera(cam => {
  // Manual override for ONE climax moment
  cam.at("26s").focus("message-12", { scale: 1.6 });
  cam.at("26s").shake({ intensityX: 12 });
})
```

**Manual DSL always takes precedence over plugins.**

---

## Performance

**Compilation Time:**

- CameraDirectorPlugin: ~5ms for 50 events
- AudioDirectorPlugin: ~1ms
- OSDirectorPlugin: ~2ms
- **Total: ~10ms** for 3 plugins

**Runtime:** Zero cost (all work done at compile-time)

---

## Migration Guide

### **From Manual Camera to Plugin**

**Before (150 lines):**

```typescript
.camera(cam => {
  cam.at("1s").focus("message-0", { scale: 1.2 });
  cam.at("1s").shake({ intensityX: 3 });
  cam.at("3s").focus("message-1", { scale: 1.2 });
  cam.at("3s").shake({ intensityX: 3 });
  // ... 140 more lines
})
```

**After (1 line):**

```typescript
.use(new CameraDirectorPlugin())
```

**Reduction:** 99% (149/150 lines eliminated)

---

## Examples

See working examples in:

- `packages/episodes/src/showcases/tennis-dramatic.episode.ts` - All 3 plugins
- `packages/episodes/src/production/bakchodi-bros.episode.ts` - Camera + Audio + OS
- `packages/episodes/src/showcases/camera-director-full.episode.ts` - Camera only

---

## See Also

- **[Plugin Ecosystem Guide](/later/PLUGIN_ECO.md)** - Complete plugin documentation
- **[Camera README](../device-camera/README.md)** - Camera system details
- **[Pain Points & Solutions](/later/PLUGIN_PAIN_POINTS_SOLUTIONS.md)** - Future improvements
- **[DSL Reference](../dsl/README.md)** - Episode builder API

---

## Contributing

When adding new plugins:

1. Create plugin in `packages/compiler/src/plugins/`
2. Export from `packages/compiler/src/plugins/index.ts`
3. Export from `packages/compiler/src/index.ts`
4. Add documentation to this README
5. Write tests in `__tests__/`
6. Update PLUGIN_ECO.md

---

## License

MIT
