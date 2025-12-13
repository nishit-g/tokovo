# Tokovo Design Philosophy

This document captures the core design decisions that make Tokovo what it is.

---

## The Vision

> **Tokovo is a compiler for drama.**

Not a video editor. Not a Remotion wrapper. Not a template engine.

A **compiler** that transforms human intent into deterministic video.

---

## The Four Laws

### Law 1: Determinism is Sacred

```
Same script → Same Scene IR → Same Timeline IR → Same frames → Same pixels
```

**Why?**
- Reproducibility for AI
- Golden tests
- Scrubbing without artifacts
- Debugging across time

**How?**
- Pure functions everywhere
- Seeded randomness only
- Canonical ordering
- No external state

**Violation = Project failure.**

---

### Law 2: Layers Do Not Cross

```
┌─────────────────┐
│     AUTHOR      │  DSL, episode(), beats
├─────────────────┤
│    SEMANTIC     │  Scene IR, meaning
├─────────────────┤
│   EXECUTION     │  Timeline IR, frames
├─────────────────┤
│   RENDERING     │  DirectorLite, pixels
└─────────────────┘
```

**Rules:**
- DSL never imports Runtime
- IR has no dependencies
- Compiler is pure transformation
- Renderer only reads state

**Why?**
- FPS changes don't break stories
- Apps don't break camera
- AI can generate without rendering

---

### Law 3: Story Beats Technology

Technology serves story. Never the reverse.

**Good:**
```typescript
b.receive("Bob", "We need to talk.", { mood: "tense" })
```

**Bad:**
```typescript
b.receiveMessageWithAnimationDuration("Bob", "We need to talk.", { 
  animDuration: 500,
  easingCurve: "cubic-bezier(0.4, 0, 0.2, 1)"
})
```

Writers write intent. Technology figures out how.

---

### Law 4: IR Stability is Forever

Once an operation is in Scene IR, it **never changes shape**.

**Why?**
- AI models trained on IR don't break
- Saved episodes don't corrupt
- Migrations are evil

**How?**
- Reserve slots early
- Add fields, never remove
- Deprecate, don't delete

---

## The Three Truths

### Truth 1: Frame = f(initialWorld, events, t)

At any frame t, the state is:
1. Start with initialWorld
2. Apply all events where event.at <= t
3. Render the result

No accumulated state. No side effects. Pure computation.

---

### Truth 2: The Camera is Not Special

Camera is just another event category:

```typescript
{ at: 45, kind: "CAMERA", type: "ZOOM", ... }
```

DirectorLite is just a rule engine that **writes** camera events.

Not magic. Not special. Just data.

---

### Truth 3: AI is the Primary User

Future Tokovo users are AI agents, not humans.

**Design for AI:**
- Structured output (not prose)
- Validation (catch errors early)
- Traceability (explain decisions)
- Constraints (prevent impossible states)

Humans can use AI's interface. AI cannot use human's interface.

---

## The Five Decisions

### Decision 1: TypeScript, Not JSON

DSL is TypeScript, not JSON:

```typescript
// ✅ TypeScript DSL
episode("drama", ep => {
  ep.device("Phone", d => {
    d.beat("intro", b => {
      b.receive("Bob", "Hey!")
    })
  })
})
```

**Why?**
- IDE autocomplete
- Compile-time errors
- Refactoring support
- Composability

JSON is for serialization, not authoring.

---

### Decision 2: Two IRs, Not One

Scene IR (semantic) + Timeline IR (execution).

**Why not just one?**

Scene IR:
- "Wait 1.5 seconds"
- No frames
- Human-readable

Timeline IR:
- "Event at frame 45"
- Frame-precise
- Machine-executable

FPS changes? Only Timeline IR changes. Stories stay stable.

---

### Decision 3: Compiler Passes, Not Single Transform

Six explicit passes:
1. normalize
2. resolveRefs
3. virtualDevice
4. timeLowering
5. validate
6. sort

**Why?**
- Each pass is testable
- Each pass is explainable
- Each pass is replaceable
- Debugging is traceable

Monolithic transforms are debugging nightmares.

---

### Decision 4: Plugin Architecture, Not Hardcoded Apps

Apps are plugins:

```typescript
PluginManager.register({
  id: "app_whatsapp",
  reducer: whatsappReducer,
  appView: WhatsAppView,
})
```

**Why?**
- New apps don't modify core
- Apps own their logic
- Type-safe boundaries
- Easy testing

---

### Decision 5: DirectorLite, Not Manual Camera

Camera is automated:

```
Events → Signals → Rules → Effects → Transform
```

**Why?**
- Writers shouldn't think about camera
- Consistent cinematic language
- Drama drives framing
- Upgradeable independently

Manual camera is an escape hatch, not the default.

---

## The Hierarchy

```
Story Intent (DSL)
     ↓ pure
Semantic Truth (Scene IR)
     ↓ pure
Execution Plan (Timeline IR)
     ↓ pure
Runtime Events
     ↓ pure
World State
     ↓ render
Pixels
```

Each step is:
- Pure (no side effects)
- Typed (full TypeScript)
- Testable (golden tests)
- Traceable (debug info)

---

## What Tokovo Is NOT

| NOT | IS |
|-----|-----|
| Video editor | Story compiler |
| Remotion wrapper | Semantic engine |
| Template system | Programmable narrative |
| UI toolkit | Drama infrastructure |
| Animation library | Deterministic renderer |

---

## The Future

Tokovo is building toward:

1. **AI-generated episodes** — AI writes DSL, humans review
2. **Semantic-aware camera** — DirectorLite reads mood/intensity
3. **Platform-native export** — TikTok/Shorts/Reels presets
4. **Story graph** — Multi-episode narrative continuity
5. **Viewer-aware** — Analytics → better stories

The foundation is done. The future is deterministic.

---

## Final Words

Tokovo exists because:

> Drama is computable. Stories are data structures. Camera is a function.

If you believe this, you understand Tokovo.

Welcome to the future of storytelling.
