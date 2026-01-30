# VISUAL TIMELINE EDITOR: Deep Dive

**Question**: Can we make a visual editor where you can stretch camera/audio durations like a video editor?

**Answer**: **YES - and you already planned for it!** The `@tokovo/studio` package exists for exactly this.

---

## What You Already Have

### **Studio Package** (`packages/studio/`)

- ✅ Exists (Vite-based dev app)
- ✅ Has `EpisodeRenderer` for preview
- ❌ Timeline editor **planned but NOT implemented**
- ❌ Drag-drop editing **future feature**

**From docs:**

> "Timeline editor is currently under development"
> "Planned features: multi-track timeline, drag-drop reordering (future), keyframe editing (future)"

---

## The Architecture Challenge: Code ↔ Visual Round-Trip

### **The Tension**

**You have two paradigms:**

1. **Declarative DSL** (code-first)

   ```typescript
   episode()
     .track("whatsapp", wa => wa.at("1s").receive(...))
     .camera(cam => cam.at("2s").focus(..., { duration: "0.5s" }))
   ```

2. **Visual Timeline** (GUI-first)
   ```
   [WhatsApp Track]  |===== Message at 1s =====|
   [Camera Track]           |== Focus 2s-2.5s ==|
                            ^ drag to stretch duration
   ```

**The question:** How do these stay in sync?

---

## Three Possible Architectures

### **Option 1: Visual Editor → Code Generation (One-way)**

```
User drags in timeline → Generates DSL code → User copies to episode file
```

**How it works:**

```typescript
// User drags camera focus from 2s-2.5s to 2s-3s in timeline

// Studio generates code:
const generatedCode = `
cam.at("2s").focus("message-0", {
  duration: "1s",  // <- Updated!
  scale: 1.2
});
`;

// User copies code → paste into episode file → rebuild
```

**Pros:**

- ✅ Simple (no two-way sync)
- ✅ Code is still source of truth
- ✅ Git-friendly (episodes are code)

**Cons:**

- ❌ Manual copy-paste workflow
- ❌ Can't "save" from timeline directly
- ❌ Visual → code is lossy (comments, formatting lost)

---

### **Option 2: IR as Source of Truth (Recommended)**

```
User edits episode file → IR → Studio renders timeline → Drag to edit IR → Export updated IR
```

**How it works:**

```typescript
// 1. Load IR in studio
const ir = await loadEpisode("mega-camera-showcase");

// 2. Studio renders visual timeline from IR
<Timeline events={ir.events} onChange={handleEdit} />

// 3. User drags camera focus duration
function handleEdit(eventId, updates) {
  // Mutate IR directly
  const event = ir.events.find(e => e.id === eventId);
  event.duration = updates.duration;  // 30 frames → 90 frames

  // Preview updates in real-time
  rerender();
}

// 4. Export edited IR
fs.writeFile("mega-camera-showcase.ir.json", JSON.stringify(ir));

// 5. Episode can load pre-compiled IR
episode.fromIR("mega-camera-showcase.ir.json");
```

**Pros:**

- ✅ IR is single source of truth
- ✅ Real-time preview (drag → instant update)
- ✅ Can save edited IR directly
- ✅ Episode can load IR instead of compiling

**Cons:**

- ❌ DSL code becomes "template" (IR diverges from code)
- ❌ Git diffs show IR changes (JSON, not readable code)
- ❌ Lose DSL benefits (reusability, abstraction)

---

### **Option 3: Hybrid (IR + DSL Sync)**

```
Episode DSL ⇄ IR ⇄ Studio Timeline
```

**How it works:**

```typescript
// 1. Episode compiles to IR
const ir = episode().track(...).camera(...).build();

// 2. Studio loads IR + original episode file
<Studio ir={ir} episodeFile="mega.episode.ts" />

// 3. User drags camera duration in timeline
// Studio tries to update DSL code:

// Before:
cam.at("2s").focus("message-0", { duration: "0.5s" })

// After (auto-updated by Studio):
cam.at("2s").focus("message-0", { duration: "1s" })  // ← Changed

// 4. Studio re-compiles episode → new IR → preview updates

// 5. User saves → episode file updated
```

**Pros:**

- ✅ True round-trip (code ↔ visual)
- ✅ DSL stays source of truth
- ✅ Git-friendly (code changes, not IR JSON)
- ✅ Best developer experience

**Cons:**

- ❌ **EXTREMELY HARD** to implement
- ❌ AST manipulation (parse TypeScript, modify, re-format)
- ❌ Ambiguous mappings (what if same event defined in loop?)
- ❌ Lossy transformations (comments, conditionals lost)

---

## Recommended Approach: **Hybrid Lite**

Best of both worlds without full AST manipulation:

### **Phase 1: IR Editor (Quick Win)**

```typescript
// Studio loads compiled IR
const ir = compileEpisode("mega-camera-showcase");

// Render visual timeline
<Timeline
  events={ir.events}
  onChange={(eventId, updates) => {
    // Mutate IR
    updateEvent(ir, eventId, updates);

    // Save edited IR
    saveIR("mega-camera-showcase.edited.ir.json");
  }}
/>

// Episode can use edited IR
episode.fromIR("mega-camera-showcase.edited.ir.json");
```

**Use case:** Quick tweaks without re-coding

---

### **Phase 2: Visual Preview + Code Hints**

```typescript
// Studio shows code alongside timeline
<Studio>
  <Timeline
    events={ir.events}
    onDrag={(event, newDuration) => {
      // Don't auto-update code
      // Show suggested change:
      showCodeHint(`
        Change line 42:
        - duration: "${event.duration}ms"
        + duration: "${newDuration}ms"
      `);
    }}
  />

  <CodeEditor file="mega.episode.ts" />
</Studio>

// User manually applies hint
// Re-compile → timeline updates
```

**Use case:** Visual feedback while coding

---

### **Phase 3: Smart Code Generation (Advanced)**

```typescript
// For simple cases, auto-update code
if (canAutoUpdate(event)) {
  updateDSLCode("mega.episode.ts", {
    line: event.sourceLocation.line,
    replace: `duration: "${newDuration}"`,
  });

  recompile();
} else {
  // Show manual hint for complex cases
  showCodeHint(...);
}
```

**Use case:** Best of both for 80% of edits

---

## Technical Implementation

### **Timeline Component**

```typescript
interface TimelineProps {
  events: TrackEvent[];
  tracks: TrackDefinition[];
  durationInFrames: number;
  fps: number;
  onChange: (eventId: string, updates: Partial<TrackEvent>) => void;
}

function Timeline({ events, tracks, onChange }: TimelineProps) {
  const [playhead, setPlayhead] = useState(0);

  return (
    <div className="timeline">
      <Playhead frame={playhead} onSeek={setPlayhead} />

      {tracks.map(track => (
        <TrackRow key={track.name} name={track.name} zIndex={track.zIndex}>
          {events
            .filter(track.filterEvents)
            .map(event => (
              <EventClip
                key={event.id}
                event={event}
                onDragDuration={(newDuration) => {
                  onChange(event.id, { duration: newDuration });
                }}
                onDragPosition={(newFrame) => {
                  onChange(event.id, { at: newFrame });
                }}
              />
            ))}
        </TrackRow>
      ))}
    </div>
  );
}
```

### **Draggable Event Clip**

```typescript
function EventClip({ event, onDragDuration, onDragPosition }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className="event-clip"
      style={{
        left: `${(event.at / totalFrames) * 100}%`,
        width: `${((event.duration || 1) / totalFrames) * 100}%`,
        backgroundColor: EVENT_COLORS[event.kind]
      }}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDrag={(e) => {
        const newFrame = pixelsToFrames(e.clientX);
        onDragPosition(newFrame);
      }}
    >
      <ResizeHandle
        side="right"
        onDrag={(deltaX) => {
          const deltaFrames = pixelsToFrames(deltaX);
          onDragDuration((event.duration || 1) + deltaFrames);
        }}
      />

      <EventLabel>{event.type}</EventLabel>
    </div>
  );
}
```

### **Multi-Track Layout**

```typescript
function TrackRow({ name, zIndex, children }) {
  const trackColor = TRACK_COLORS[name];

  return (
    <div className="track-row" style={{ order: zIndex }}>
      <div className="track-label">
        {name}
        <TrackControls />
      </div>

      <div className="track-clips">
        {children}
      </div>
    </div>
  );
}

// Layout:
// ┌─────────────┬────────────────────────────────────────┐
// │ Camera      │ |==Focus==|   |==Zoom==|              │
// ├─────────────┼────────────────────────────────────────┤
// │ WhatsApp    │ |Msg| |Msg|     |Msg|                 │
// ├─────────────┼────────────────────────────────────────┤
// │ Audio       │ |============ BGM ==================| │
// ├─────────────┼────────────────────────────────────────┤
// │ Subtitles   │ |Sub1| |Sub2|    |Sub3|              │
// └─────────────┴────────────────────────────────────────┘
//                0s    5s    10s   15s    20s    25s    30s
```

---

## Plugin Integration

**Key insight:** Plugins determine track structure!

```typescript
// Each plugin defines its track
class CameraDirectorPlugin {
  renderTrack = {
    name: "Camera",
    zIndex: 10,
    color: "#3b82f6",  // Blue
    Component: CameraLayer
  };
}

// Studio reads plugins to build timeline
function Studio({ ir, plugins }) {
  const tracks = plugins.map(p => p.renderTrack);

  return (
    <>
      <Timeline events={ir.events} tracks={tracks} />
      <Preview ir={ir} frame={playhead} />
    </>
  );
}
```

**Plugins make timeline self-describing!**

---

## Real-World Workflow

```typescript
// 1. Developer writes episode
episode("demo")
  .track("whatsapp", (wa) => wa.at("1s").receive("Sarah", "Hi"))
  .use(new CameraDirectorPlugin("fluid-tennis"))
  .build();

// 2. Compile to IR
const ir = compileEpisode("demo");

// 3. Open in Studio
studio.load(ir);

// 4. Visual timeline shows:
// - WhatsApp track with message at 1s
// - Camera track with auto-generated focus at 1s

// 5. User drags camera focus duration from 0.5s → 1s

// 6. Studio updates IR in-memory

// 7. Preview updates instantly (no recompile)

// 8. User exports IR
studio.exportIR("demo.edited.ir.json");

// 9. Load in production
episode.fromIR("demo.edited.ir.json");

// OR: Studio shows code hint
// "Change line 23: duration: '0.5s' → duration: '1s'"
// User updates episode file manually
```

---

## The Answer to Your Question

### **Can you stretch durations in a timeline?**

**YES!** Here's what's possible:

### **Now (with IR editor):**

```
✅ Load compiled IR
✅ Visual timeline from IR events
✅ Drag to change duration/position
✅ Real-time preview
✅ Export edited IR
```

### **Future (with DSL sync):**

```
🔜 Auto-update simple duration changes in code
🔜 Code hints for complex changes
🔜 Round-trip editing (visual ↔ code)
```

### **What you need to build:**

1. **Timeline Component** (React)
   - Multi-track layout
   - Draggable event clips
   - Resize handles for duration
   - Playhead/scrubbing

2. **IR Mutation API**
   - `updateEvent(ir, eventId, { duration: 90 })`
   - `moveEvent(ir, eventId, newFrame)`
   - Validation (no overlaps, etc.)

3. **Studio Integration**
   - Load IR from episode
   - Render timeline
   - Preview changes
   - Export IR

4. **Optional: Code Sync** (hard!)
   - Parse TypeScript AST
   - Find duration literal
   - Update and reformat
   - Re-compile

---

## Recommended Path

### **Phase 1: Read-Only Timeline** (1 week)

- Display IR events as visual timeline
- Playhead scrubbing
- No editing yet

### **Phase 2: IR Editing** (2 weeks)

- Drag events to new positions
- Resize event durations
- Save edited IR
- Load edited IR in episodes

### **Phase 3: Code Hints** (1 week)

- Show suggested code changes
- User manually applies
- Best of both worlds

### **Phase 4: Auto-Sync** (4+ weeks, optional)

- AST manipulation
- Auto-update simple cases
- Complex cases fall back to hints

---

## Why This Matters for Plugin System

**Plugins define timeline structure!**

```typescript
// Without plugins: hardcoded timeline
Timeline shows: [Audio, Camera, WhatsApp]

// With plugins: dynamic timeline
episode()
  .use(new SubtitlePlugin())  // Adds subtitle track
  .use(new VoicePlugin())     // Adds voice track
  .use(new DebugPlugin())     // Adds debug track

Timeline shows: [Audio, Camera, WhatsApp, Subtitles, Voice, Debug]
```

**Timeline automatically shows all plugin tracks.**

---

## Final Answer

**Yes, you can absolutely make a visual editor to stretch camera/audio durations!**

**What exists:** Studio package shell, planned timeline  
**What's needed:** Timeline component + IR mutation API  
**Best approach:** IR editor (Phase 2) with code hints (Phase 3)  
**Plugin benefit:** Timeline structure comes from plugins automatically

**The plugin system makes the timeline editor EASIER** because:

- Tracks are self-describing (plugins define them)
- Event types are clear (kind + type)
- Rendering is modular (each plugin renders its track)

**Not bugging me** - this is a critical architecture question that affects the entire plugin design!

Want me to sketch out the Timeline component or IR mutation API?
