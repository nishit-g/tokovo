# 🔌 TOKOVO PLUGIN ECOSYSTEM

**Last Updated:** Jan 30, 2026  
**Status:** Production-Ready (v1.0)

---

## 📋 TABLE OF CONTENTS

1. [What Are Plugins?](#what-are-plugins)
2. [Architecture](#architecture)
3. [Current Plugins](#current-plugins)
4. [Plugin Roadmap](#plugin-roadmap)
5. [How to Create a Plugin](#how-to-create-a-plugin)
6. [Best Practices](#best-practices)
7. [Testing Plugins](#testing-plugins)
8. [FAQ](#faq)

---

## 🎯 WHAT ARE PLUGINS?

**Problem:** Episodes duplicate the same patterns over and over.

**Before Plugins:**

```typescript
// EVERY episode repeats this 150-line camera block
.camera((cam) => {
  cam.at("1s").focus("message-0", { scale: 1.2 });
  cam.at("1s").shake({ intensityX: 3, intensityY: 2 });
  cam.at("3s").focus("message-1", { scale: 1.2 });
  cam.at("3s").shake({ intensityX: 3, intensityY: 2 });
  // ... 140 more lines of duplication
})
```

**After Plugins:**

```typescript
// Plugin auto-generates camera movements from messages
.use(new CameraDirectorPlugin())
```

**Result:** 505 lines eliminated (44% reduction) across 5 episodes.

---

## 🏛️ ARCHITECTURE

### **Two Plugin Systems (Don't Confuse Them!)**

Tokovo has **TWO separate plugin systems** for different purposes:

| System                   | Purpose                         | When It Runs                                | Example              |
| ------------------------ | ------------------------------- | ------------------------------------------- | -------------------- |
| **CompilerPlugin**       | Event transformation (DSL → IR) | **Compile-time** (when you call `.build()`) | CameraDirectorPlugin |
| **TokovoPluginContract** | State management, rendering, UI | **Runtime** (when video plays)              | DeviceCameraPlugin   |

**THIS DOCUMENT COVERS:** `CompilerPlugin` only (the DSL/compiler layer).

---

### **CompilerPlugin Architecture**

```
┌─────────────────────────────────────────────────────┐
│ EPISODE (DSL)                                        │
│ .track("whatsapp", ...)                              │
│ .use(new CameraDirectorPlugin())   ← Register plugin│
│ .build()                           ← Triggers compile│
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ COMPILER (Multi-Pass)                                │
│                                                       │
│ Pass 1: Track builders emit events                   │
│   → MESSAGE_RECEIVED, MESSAGE_SENT, TYPING_START     │
│                                                       │
│ Pass 2: Plugins transform events                     │
│   → CameraDirectorPlugin sees MESSAGE_RECEIVED       │
│   → Generates CAMERA_FOCUS, CAMERA_SHAKE             │
│                                                       │
│ Pass 3: Sort by (timestamp, declarationOrder)        │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ IR (Intermediate Representation)                     │
│ All events: messages, camera, audio, os, etc.        │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ RUNTIME RENDERER                                     │
│ TokovoPluginContract (WhatsApp, Camera, etc.)       │
└─────────────────────────────────────────────────────┘
```

**Key Insight:** CompilerPlugins convert events → events (pure functions).

---

### **CompilerPlugin Interface**

```typescript
interface CompilerPlugin {
  // Metadata
  name: string;
  version: string;

  // Event filtering
  subscribesTo: EventType[]; // Which events to listen for
  emits?: EventType[]; // Which events to generate

  // Core logic
  process(
    events: TrackEvent[], // Events this plugin subscribed to
    context: CompilerContext, // fps, devices, sections, etc.
  ): TrackEvent[]; // New events to add

  // Optional
  renderTrack?(context: CompilerContext): TrackDefinition;
  validate?(ir: TrackEpisodeIR): ValidationResult;
  dependsOn?: string[]; // Plugin execution order
}
```

**Example Event Flow:**

```typescript
// INPUT: Track builder emits this
{
  at: 30,                    // Frame 30 (1 second at 30fps)
  kind: "APP",
  type: "MESSAGE_RECEIVED",
  payload: { from: "Sarah", text: "Hey!", order: 0 }
}

// PLUGIN TRANSFORMS IT
class CameraDirectorPlugin {
  process([messageEvent], context) {
    return [
      {
        at: 30,
        kind: "CAMERA",
        type: "FOCUS",
        payload: { targetId: "message-0", scale: 1.2 }
      },
      {
        at: 30,
        kind: "CAMERA",
        type: "SHAKE_START",
        payload: { intensityX: 3, intensityY: 2, frequency: 15 }
      }
    ];
  }
}

// OUTPUT: Two camera events generated
```

---

## 🔧 CURRENT PLUGINS

### **1. CameraDirectorPlugin** ✅ Production

**Status:** Shipped, proven (505 lines eliminated, 44% reduction)

**What It Does:** Auto-generates camera movements from conversation events.

**Usage:**

```typescript
import { CameraDirectorPlugin } from "@tokovo/compiler";

episode("tennis-match", config)
  .track("whatsapp", WhatsAppTrackBuilder, (wa) => {
    wa.at("1s").receive("Sarah", "Match point!");
    wa.at("3s").send("Let's go!");
  })
  .use(new CameraDirectorPlugin()) // 👈 Replaces 150-line .camera() block
  .build();
```

**Behavior Presets:**

| Preset                             | Scale | Shake Intensity | Use Case            |
| ---------------------------------- | ----- | --------------- | ------------------- |
| `fluid-tennis-casual`              | 1.1   | 2               | Chill conversations |
| `fluid-tennis-energetic` (default) | 1.2   | 3               | Standard messaging  |
| `fluid-tennis-dramatic`            | 1.25  | 6               | Intense arguments   |
| `interrupt-focus`                  | 1.15  | 0               | Notifications       |
| `drift-anticipation`               | 1.05  | 0               | Typing indicators   |
| `static`                           | 1.0   | 0               | No movement         |

**Custom Preset:**

```typescript
.use(new CameraDirectorPlugin("fluid-tennis-dramatic"))
```

**How It Works:**

1. Subscribes to: `MESSAGE_RECEIVED`, `MESSAGE_SENT`, `NOTIFICATION_SHOW`, `TYPING_START`
2. Uses `CameraDirector` from `@tokovo/device-camera` (domain logic)
3. Applies behavior preset to generate camera effects
4. Emits: `CAMERA_FOCUS`, `CAMERA_SHAKE`, `CAMERA_ZOOM`, `CAMERA_RESET`

**Files:**

- Plugin: `packages/compiler/src/plugins/camera-director.plugin.ts` (192 lines)
- Domain Logic: `packages/device-camera/src/director/director.ts` (145 lines)
- Behaviors: `packages/device-camera/src/director/behaviors.ts` (233 lines)

---

### **2. LoggingPlugin** ✅ Example Only

**Status:** Demo/debugging tool (not for production)

**What It Does:** Logs event counts during compilation.

**Usage:**

```typescript
.use(new LoggingPlugin({ verbose: true }))
```

**Output:**

```
[LoggingPlugin] Processing 47 events
[LoggingPlugin] MESSAGE_RECEIVED: 12
[LoggingPlugin] MESSAGE_SENT: 8
[LoggingPlugin] TYPING_START: 15
```

**Files:**

- `packages/compiler/src/plugins/logging.plugin.ts` (17 lines)

---

## 🗓️ PLUGIN ROADMAP

### **Phase 1: Director Plugins (Week 1)** 🔜

High-impact code elimination plugins.

#### **TypingIndicatorPlugin** (HIGHEST PRIORITY)

**Problem:** Every WhatsApp episode duplicates typing indicators.

**Before (20+ lines per episode):**

```typescript
wa.span("0.5s", "2s").typing("Sarah");
wa.at("2s").receive("Sarah", "Hey!");
wa.span("3s", "5s").typing("me");
wa.at("5s").send("Hey!");
// ... repeat 20 times
```

**After (plugin auto-generates):**

```typescript
wa.at("2s").receive("Sarah", "Hey!");
wa.at("5s").send("Hey!");

.use(new TypingIndicatorPlugin({
  duration: "auto"  // Based on message length
}))
```

**Estimated Impact:** 500+ lines eliminated (BIGGEST WIN!)

---

#### **AudioDirectorPlugin**

**Problem:** 10+ episodes duplicate identical audio blocks.

**Before (4 lines per episode):**

```typescript
.audio((audio) => {
  audio.span("0s", "90s").bgm("lofi_chill", {
    volume: 0.15, fadeIn: "2s", fadeOut: "3s"
  });
})
```

**After:**

```typescript
.use(new AudioDirectorPlugin({
  mood: "chill",   // Maps to "lofi_chill"
  volume: 0.15
}))
```

**Estimated Impact:** 400 lines eliminated

**Moods:**

- `chill` → lofi_chill
- `intense` → dramatic_swell
- `epic` → epic_tension

---

#### **OSDirectorPlugin**

**Problem:** Episodes manually calculate time progression.

**Before (12+ lines):**

```typescript
.os((os) => {
  os.at("0s").set({ time: "10:00", battery: 34 });
  os.at("15s").update({ time: "10:15", battery: 32 });  // Manual math!
  os.at("30s").update({ time: "10:30", battery: 30 });
  os.at("45s").update({ time: "10:45", battery: 28 });
  // ... 8 more lines
})
```

**After:**

```typescript
.use(new OSDirectorPlugin({
  startTime: "10:00",
  batteryDrain: 1,      // % per 15s
  updateInterval: "15s",
  realTimeRatio: 1.0    // 1.0 = real-time, 2.0 = 2x speed
}))
```

**Estimated Impact:** 150 lines eliminated

**Features:**

- Auto-increments time (10:00 → 10:15 → 10:30)
- Linear battery drain (34% → 32% → 30%)
- Network status changes (optional)
- Realistic time progression

---

### **Phase 2: Realism Plugins (Week 2)** 🔜

DX improvements, no massive code elimination.

#### **ReadReceiptPlugin**

Auto-generates read receipts (blue checkmarks).

```typescript
.use(new ReadReceiptPlugin({
  delay: "1s",     // Read 1s after receiving
  readAll: true    // Mark all messages read
}))
```

---

#### **NotificationTriggerPlugin**

Ambient notifications during conversation (Instagram, Twitter, etc.).

```typescript
.use(new NotificationTriggerPlugin({
  apps: ["instagram", "twitter", "gmail"],
  frequency: "medium",  // 1-2 per minute
  timing: "story-beats" // Align to marks/sections
}))
```

---

#### **Plugin Preset System**

One-liner episode setup (Netflix-style templates).

```typescript
// Instead of:
.use(new CameraDirectorPlugin("fluid-tennis-dramatic"))
.use(new AudioDirectorPlugin({ mood: "intense" }))
.use(new OSDirectorPlugin({ realTimeRatio: 1.0 }))

// Write:
.preset("conversation-dramatic")
```

**Available Presets:**

- `conversation-casual` (chill camera, lofi music, slow battery)
- `conversation-dramatic` (intense camera, epic music, network drops)
- `conversation-comedy` (energetic camera, notification bursts)

---

### **Phase 3: Advanced (Future)** ⏳

Complex plugins requiring more research.

#### **ConversationPacingPlugin**

Eliminates ALL timestamp calculations.

```typescript
// No .at() needed - plugin auto-spaces
wa.receive("Sarah", "Hey!");
wa.send("Hey!");
wa.receive("Sarah", "How are you?");

.use(new ConversationPacingPlugin({
  pace: "natural",  // or "fast", "slow"
  variance: 0.3     // ±30% randomness
}))
```

---

#### **StoryStructurePlugin**

Auto-generates story beats from conversation timing.

```typescript
.use(new StoryStructurePlugin("three-act", {
  duration: "90s"  // Auto-calculates: intro=0s, midpoint=45s, outro=90s
}))
```

**Templates:** `three-act`, `five-beat`, `hero-journey`

---

#### **TimingValidatorPlugin**

Catches common UX mistakes.

```typescript
.use(new TimingValidatorPlugin())

// Warns:
// ⚠️ Camera shake during typing indicator (jarring UX)
// ⚠️ Notification during camera focus (distracting)
// ⚠️ Audio crossfade during voice narration (overlap)
```

---

#### **PacingAnalyzerPlugin**

Console warnings for pacing issues.

```typescript
.use(new PacingAnalyzerPlugin())

// Output:
// ⚠️ High message density (12 msgs in 10s) - consider spacing
// ⚠️ 30s gap between messages - pacing issue
// ⚠️ Climax section has no camera movement
```

---

## 🛠️ HOW TO CREATE A PLUGIN

### **Step 1: Define Your Plugin Class**

```typescript
// packages/compiler/src/plugins/my-plugin.ts
import { CompilerPlugin, CompilerContext, TrackEvent } from "./types";

export class MyPlugin implements CompilerPlugin {
  name = "my-plugin";
  version = "1.0.0";

  subscribesTo = ["MESSAGE_RECEIVED", "MESSAGE_SENT"];
  emits = ["CAMERA_FOCUS"];

  constructor(private config: { intensity: number }) {}

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const newEvents: TrackEvent[] = [];

    for (const event of events) {
      if (event.type === "MESSAGE_RECEIVED") {
        // Generate camera focus for each message
        newEvents.push({
          at: event.at,
          kind: "CAMERA",
          type: "FOCUS",
          payload: {
            targetId: `message-${event.payload.order}`,
            scale: 1.0 + this.config.intensity,
          },
        });
      }
    }

    return newEvents;
  }
}
```

---

### **Step 2: Export from Plugin Index**

```typescript
// packages/compiler/src/plugins/index.ts
export * from "./my-plugin";
```

---

### **Step 3: Use in Episodes**

```typescript
import { MyPlugin } from "@tokovo/compiler";

episode("demo", config)
  .track("whatsapp", WhatsAppTrackBuilder, (wa) => {
    wa.at("1s").receive("Sarah", "Hey!");
  })
  .use(new MyPlugin({ intensity: 0.2 }))
  .build();
```

---

### **Step 4: Test Your Plugin**

```typescript
// packages/compiler/src/plugins/__tests__/my-plugin.test.ts
import { describe, test, expect } from "vitest";
import { MyPlugin } from "../my-plugin";

describe("MyPlugin", () => {
  test("generates CAMERA_FOCUS for MESSAGE_RECEIVED", () => {
    const plugin = new MyPlugin({ intensity: 0.2 });

    const input: TrackEvent[] = [
      {
        at: 30,
        kind: "APP",
        type: "MESSAGE_RECEIVED",
        payload: { from: "Sarah", text: "Hey!", order: 0 },
      },
    ];

    const output = plugin.process(input, mockContext({ fps: 30 }));

    expect(output).toHaveLength(1);
    expect(output[0]).toMatchObject({
      kind: "CAMERA",
      type: "FOCUS",
      payload: { scale: 1.2 },
    });
  });
});
```

---

## 📚 BEST PRACTICES

### ✅ **DO**

1. **Keep Plugins Pure**
   - No side effects (file writes, network calls)
   - Pure function: `events in → events out`
   - Deterministic (same input → same output)

2. **Use dependsOn for Ordering**

   ```typescript
   class NotificationDirector implements CompilerPlugin {
     dependsOn = ["camera-director"]; // Run after camera
   }
   ```

3. **Wrap Domain Logic**
   - Plugin = thin adapter
   - Heavy logic in separate class (like `CameraDirector`)
   - Plugin just converts events → calls domain logic → returns events

4. **Validate Inputs**

   ```typescript
   constructor(config: MyConfig) {
     if (config.intensity < 0 || config.intensity > 1) {
       throw new Error("intensity must be 0-1");
     }
   }
   ```

5. **Document Behavior Clearly**
   - What events it subscribes to
   - What events it emits
   - Side effects (if any)

---

### ❌ **DON'T**

1. **Don't Make Plugins Async**

   ```typescript
   // ❌ BAD: Async breaks determinism
   async process(events, context) {
     const result = await fetch("https://api.com/data");
     return generateEvents(result);
   }
   ```

2. **Don't Modify Input Events**

   ```typescript
   // ❌ BAD: Mutating input
   process(events, context) {
     events[0].payload.modified = true;  // WRONG!
   }

   // ✅ GOOD: Return new events
   process(events, context) {
     return events.map(e => ({ ...e, payload: { ...e.payload } }));
   }
   ```

3. **Don't Mix Compile-Time + Runtime Logic**
   - CompilerPlugin = compile-time only
   - TokovoPluginContract = runtime only
   - Never combine them

4. **Don't Over-Abstract**
   - Keep plugins simple
   - One plugin = one responsibility
   - Don't build "universal plugin interface"

5. **Don't Forget dependsOn**
   ```typescript
   // If your plugin needs marks from StoryStructurePlugin:
   class MyPlugin {
     dependsOn = ["story-structure"]; // Required!
   }
   ```

---

## 🧪 TESTING PLUGINS

### **Unit Testing Pattern**

```typescript
// packages/compiler/src/plugins/__tests__/camera-director.test.ts
import { describe, test, expect } from "vitest";
import { CameraDirectorPlugin } from "../camera-director.plugin";

const mockContext = (overrides = {}): CompilerContext => ({
  fps: 30,
  devices: [],
  anchors: {},
  sections: [],
  marks: [],
  ...overrides,
});

describe("CameraDirectorPlugin", () => {
  test("converts MESSAGE_RECEIVED to FOCUS + SHAKE", () => {
    const plugin = new CameraDirectorPlugin("fluid-tennis-energetic");

    const input: TrackEvent[] = [
      {
        at: 30,
        kind: "APP",
        type: "MESSAGE_RECEIVED",
        payload: { from: "Sarah", text: "Hey!", order: 0 },
      },
    ];

    const output = plugin.process(input, mockContext());

    expect(output).toHaveLength(2);
    expect(output[0].type).toBe("FOCUS");
    expect(output[1].type).toBe("SHAKE_START");
  });

  test("respects behavior presets", () => {
    const casual = new CameraDirectorPlugin("fluid-tennis-casual");
    const dramatic = new CameraDirectorPlugin("fluid-tennis-dramatic");

    const input = [
      /* same input */
    ];

    const casualOutput = casual.process(input, mockContext());
    const dramaticOutput = dramatic.process(input, mockContext());

    // Dramatic has higher shake intensity
    expect(dramaticOutput[1].payload.intensityX).toBeGreaterThan(
      casualOutput[1].payload.intensityX,
    );
  });
});
```

---

### **Integration Testing**

```typescript
// Test plugin with real episode builder
test("integrates with episode builder", () => {
  const ep = episode("test", config)
    .track("whatsapp", WhatsAppTrackBuilder, (wa) => {
      wa.at("1s").receive("Sarah", "Hey!");
    })
    .use(new CameraDirectorPlugin())
    .build();

  const cameraEvents = ep.events.filter((e) => e.kind === "CAMERA");
  expect(cameraEvents.length).toBeGreaterThan(0);
});
```

---

### **Snapshot Testing**

```typescript
test("generates expected events", () => {
  const plugin = new CameraDirectorPlugin();
  const output = plugin.process(inputEvents, mockContext());

  expect(output).toMatchSnapshot(); // Auto-updates on changes
});
```

---

## ❓ FAQ

### **Q: What's the difference between CompilerPlugin and TokovoPluginContract?**

**A:** Two separate systems for different layers:

- **CompilerPlugin** = Compile-time (DSL → IR transformation)
- **TokovoPluginContract** = Runtime (state management, rendering)

**Example:**

- `CameraDirectorPlugin` (compiler) converts `MESSAGE_RECEIVED` → `CAMERA_FOCUS`
- `DeviceCameraPlugin` (runtime) renders camera animations on screen

---

### **Q: Should I move CameraDirector to compiler package?**

**A:** **NO.** `CameraDirector` is domain logic (behaviors, presets). Keep it in `device-camera`. The plugin just wraps it.

**Architecture:**

```
device-camera/director/director.ts  ← Domain logic (KEEP HERE)
        ↑
        │ imports from
        │
compiler/plugins/camera-director.plugin.ts  ← Thin wrapper (KEEP HERE)
```

---

### **Q: Can plugins be async?**

**A:** **NO.** Async breaks determinism. Plugins must be pure, synchronous functions.

**If you need external data:**

- Fetch at episode creation time (before `.build()`)
- Pass as plugin config

```typescript
// ❌ BAD
.use(new MyPlugin({ apiKey: "..." }))  // Plugin fetches data

// ✅ GOOD
const data = await fetchData();
.use(new MyPlugin({ data }))  // Data passed in
```

---

### **Q: How do plugins communicate?**

**A:** Use `dependsOn` to ensure execution order, then access shared context.

```typescript
class PluginB implements CompilerPlugin {
  dependsOn = ["plugin-a"];

  process(events, context) {
    // PluginA's events are in the events array
    const pluginAEvents = events.filter((e) => e.kind === "PLUGIN_A_EVENT");

    // Or access context data (future feature)
    const marks = context.marks; // From StoryStructurePlugin
  }
}
```

---

### **Q: Can I override plugin behavior?**

**A:** **YES.** Manual DSL always takes precedence.

```typescript
.use(new CameraDirectorPlugin())  // Auto-generates camera
.camera((cam) => {
  // Manual camera overrides plugin for this specific moment
  cam.at("30s").focus("message-5", { scale: 2.0 });
})
```

**Hybrid mode:** Plugin handles baseline, manual for special moments.

---

### **Q: How do I debug plugins?**

**A:** Use `LoggingPlugin` or console.log in `process()`.

```typescript
class MyPlugin {
  process(events, context) {
    console.log(`[MyPlugin] Processing ${events.length} events`);
    console.log(events);

    const output = generateEvents(events);
    console.log(`[MyPlugin] Generated ${output.length} events`);

    return output;
  }
}
```

---

### **Q: Can I build plugins for other teams?**

**A:** Not yet. Plugin marketplace is a future feature (Phase 3). For now, plugins are internal only.

**When marketplace arrives:**

- Schema validation (Zod)
- Sandboxing (isolated workers)
- Permission system (filesystem, network, etc.)

---

### **Q: What's the performance impact of plugins?**

**A:** Minimal. Plugins are pure functions that run once during `.build()`.

**Measured:**

- CameraDirectorPlugin: ~5ms for 50 events
- 10 plugins: ~50ms total compilation time

**Not a concern until you have 20+ plugins.**

---

## 📊 IMPACT SUMMARY

### **Current State (Jan 30, 2026)**

| Metric                     | Value                                    |
| -------------------------- | ---------------------------------------- |
| **Plugins Shipped**        | 2 (CameraDirector + Logging)             |
| **Episodes Using Plugins** | 9 / 23 (39%)                             |
| **Lines Eliminated**       | 505 (44% reduction in migrated episodes) |
| **Plugins In Development** | 3 (Typing, Audio, OS)                    |

---

### **Projected Impact (Week 2)**

After Phase 1 plugins ship:

| Plugin                | Lines Saved | Episodes Impacted |
| --------------------- | ----------- | ----------------- |
| TypingIndicatorPlugin | 500+        | 18 (all WhatsApp) |
| AudioDirectorPlugin   | 400         | 10 (all with BGM) |
| OSDirectorPlugin      | 150         | 8 (all with OS)   |
| **TOTAL**             | **1,050+**  | **23**            |

**Total reduction:** ~1,550 lines eliminated (current 505 + future 1,050)

---

## 🎯 NEXT STEPS

### **For Plugin Authors**

1. Read this document
2. Review `CameraDirectorPlugin` source code
3. Copy template from "How to Create a Plugin"
4. Write tests first (TDD)
5. Submit PR with plugin + tests + docs

---

### **For Episode Writers**

1. Use `.use(new CameraDirectorPlugin())` in all new episodes
2. Migrate old episodes when you touch them
3. Request new plugins via GitHub issues
4. Report plugin bugs with episode reproduction

---

### **For Core Team**

1. Ship Phase 1 plugins (Typing, Audio, OS) - Week 1
2. Build plugin preset system - Week 2
3. Write plugin authoring guide - Week 2
4. Plan Phase 2 (Realism plugins) - Week 3

---

## 📚 RESOURCES

- **Plugin Source:** `packages/compiler/src/plugins/`
- **Plugin Tests:** `packages/compiler/src/plugins/__tests__/`
- **Example Episodes:** `packages/episodes/src/showcases/`
- **CameraDirector (domain logic):** `packages/device-camera/src/director/`

---

## 📝 CHANGELOG

### v1.0.0 (Jan 30, 2026)

- Initial plugin system release
- CameraDirectorPlugin shipped (505 lines eliminated)
- LoggingPlugin added (example)
- 5 episodes migrated to plugins

### Planned v1.1.0 (Feb 7, 2026)

- TypingIndicatorPlugin
- AudioDirectorPlugin
- OSDirectorPlugin
- Plugin preset system

---

**Questions?** Ask in #plugins Slack channel or open GitHub issue.
