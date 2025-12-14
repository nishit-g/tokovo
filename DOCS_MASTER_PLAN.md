# Tokovo Documentation System – Master Plan

This document defines the canonical documentation structure for Tokovo.
All docs must align with this structure to preserve clarity, determinism, and long-term scalability.

---

## 1. Documentation Goals

Tokovo documentation must satisfy five audiences:

1. **Newcomer** – "What is this?"
2. **Power User** – "How do I write stories?"
3. **Engineer** – "How does this work internally?"
4. **AI Agent** – "How do I generate valid Tokovo episodes?"
5. **Contributor** – "Where do I add things without breaking invariants?"

---

## 2. Docs Stack

- **Framework:** Nextra
- **Format:** MDX
- **Location:** `apps/docs`
- **Navigation:** `_meta.json` driven
- **Philosophy:** Docs mirror architecture

---

## 3. Top-Level Docs Structure (FINAL)

```
apps/docs/pages/
├── index.mdx                  # What Tokovo is
├── glossary.mdx               # Canonical terminology
├── verification.mdx           # Guarantees, invariants, laws
│
├── guides/                    # How to USE Tokovo
│   ├── quickstart.mdx
│   ├── first-episode.mdx
│   ├── multi-device.mdx
│   ├── ai-generation.mdx
│   └── custom-apps.mdx
│
├── dsl/                       # How to WRITE stories
│   ├── episode.mdx
│   ├── device.mdx
│   ├── beat.mdx
│   ├── semantic.mdx
│   └── pov.mdx
│
├── ir/                        # Semantic truth layer
│   ├── index.mdx
│   ├── scene-ir.mdx
│   ├── timeline-ir.mdx
│   ├── trace.mdx
│   └── constraints.mdx
│
├── compiler/                  # Transformation engine
│   ├── index.mdx
│   ├── passes.mdx
│   └── adapters.mdx
│
├── director/                  # Cinematic intelligence
│   ├── index.mdx
│   ├── signals.mdx
│   ├── rules.mdx
│   └── effects.mdx
│
├── runtime/                   # Execution model
│   ├── index.mdx
│   ├── engine.mdx
│   ├── events.mdx
│   └── world-state.mdx
│
└── architecture/              # System laws
    ├── index.mdx
    ├── boundaries.mdx
    ├── data-flow.mdx
    ├── determinism.mdx
    ├── monorepo.mdx
    └── plugins.mdx
```

---

## 4. Mandatory Documentation Laws

### 4.1 No Doc Without a Layer

Every doc must belong to **exactly one layer**:

| Layer | Docs |
|-------|------|
| **Author** | guides/, dsl/ |
| **Semantic** | ir/ |
| **Execution** | compiler/, runtime/ |
| **Rendering** | director/ |
| **Meta** | architecture/, glossary, verification |

If unclear → doc is invalid.

---

### 4.2 Every Concept Must Answer These

Each page must answer:

1. **What is it?** — One sentence definition
2. **Why does it exist?** — The problem it solves
3. **What layer owns it?** — Semantic/Execution/Rendering
4. **What it is NOT allowed to do** — Boundaries
5. **One minimal example** — Copy-paste ready

---

### 4.3 Determinism Callouts (Required)

Any page that introduces behavior must include:

```markdown
## Determinism Notes

- Is this pure? Yes/No
- Is ordering stable? Yes/No
- Is randomness seeded? Yes/No/N/A
```

---

## 5. Layer Ownership Table

| Concept | Owner Layer | Package |
|---------|-------------|---------|
| episode() | Author | @tokovo/dsl |
| Beat | Author | @tokovo/dsl |
| generateTyping() | Author | @tokovo/dsl |
| dsl.keyboard | Author | @tokovo/dsl |
| dsl.messages | Author | @tokovo/dsl |
| dsl.camera | Author | @tokovo/dsl |
| dsl.audio | Author | @tokovo/dsl |
| dsl.os | Author | @tokovo/dsl |
| dsl.touch | Author | @tokovo/dsl |
| SemanticMeta | Semantic | @tokovo/ir |
| SceneOp | Semantic | @tokovo/ir |
| TimelineOp | Execution | @tokovo/ir |
| compile() | Execution | @tokovo/compiler |
| Adapter | Execution | @tokovo/adapters |
| Engine (replay) | Execution | @tokovo/core |
| processOSEvent | Execution | @tokovo/core |
| processKeyboardEvent | Execution | @tokovo/core |
| DeviceOSState | Execution | @tokovo/core |
| KeyboardState | Execution | @tokovo/core |
| DirectorLite | Rendering | @tokovo/core |
| TokovoRenderer | Rendering | @tokovo/renderer |
| DeviceFrame | Rendering | @tokovo/renderer |
| StatusBar | Rendering | @tokovo/devices |
| IOSKeyboard | Rendering | @tokovo/devices |
| AudioLayer | Rendering | @tokovo/renderer |
| TouchOverlay | Rendering | @tokovo/renderer |
| Plugin | Rendering | @tokovo/core |


---

## 6. Feature Status

### ✅ Complete (Phase 1)

- [x] DSL fluent API
- [x] Scene IR
- [x] Timeline IR
- [x] Compiler passes (6)
- [x] Adapters (WhatsApp)
- [x] DirectorLite (ViralDramaV1)
- [x] Determinism guarantees
- [x] Plugin system
- [x] Trace model

### ✅ Complete (Phase 2 — Production Engine)

- [x] Centralized DSL module (`@tokovo/dsl`)
- [x] dsl.keyboard — Keyboard events
- [x] dsl.messages — Message lifecycle (send/receive/markRead)
- [x] dsl.camera — Camera effects (zoom/pan/shake/focus)
- [x] dsl.audio — Audio events (play/stop/fade)
- [x] dsl.os — Device OS events (time/battery/network/DND)
- [x] dsl.touch — Touch gestures (tap/drag/longPress)
- [x] generateTyping() — Typing humanizer
- [x] Device OS Layer (DeviceOSState)
- [x] StatusBar reads from device.os
- [x] IOSKeyboard with key pop-ups
- [x] KeyboardState management
- [x] Camera effects engine
- [x] AudioLayer component
- [x] TouchOverlay component
- [x] Documentation (docs/ folder)

### ✅ Implemented (Needs Docs Lock)

- [x] EpisodeConfig
- [x] SemanticMeta
- [x] BeatMeta
- [x] POV primitives
- [x] Reserved signals
- [x] Constraints validation

### ⏳ Future (Reserved)

- [ ] DirectorLite v2 (semantic-aware)
- [ ] AI generation contract
- [ ] Lifecycle hooks
- [ ] Voice notes adapter
- [ ] Instagram adapter completion
- [ ] Platform presets (TikTok/Shorts/Reels)
- [ ] Nextra docs migration (35+ pages)

---

## 7. What NOT to Build Yet

❌ GUI editor  
❌ Marketplace  
❌ Style editor  
❌ Monetization  
❌ Realtime playback  

Focus: **Building the compiler of drama.**

---

## 8. The Truth

Tokovo is not "Remotion stuff".

Tokovo is:

- A **story compiler**
- A **semantic IR**
- A **deterministic drama engine**
- A **camera AI**
- A **future AI-writer substrate**

This is **multi-million dollar infrastructure**, not a feature.

Document it like one.

---

## 9. Updating This Document

This document is the **source of truth** for documentation structure.

To modify:

1. Propose change in PR
2. Update this file
3. Update corresponding docs
4. Update verification.mdx

Never add docs without updating DOCS_MASTER_PLAN.md first.
