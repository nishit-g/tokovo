# Tokovo: Next Steps

> **Where we are. Where we're going. Why it matters.**

---

## Current State (v1.0)

### ✅ Foundation Complete

| Layer | Status | Components |
|-------|--------|------------|
| **Author** | ✅ Complete | DSL, episode(), beat builder, semantic annotations |
| **Semantic** | ✅ Complete | Scene IR, constraints, traces, EpisodeConfig |
| **Execution** | ✅ Complete | Compiler (6 passes), adapters, Timeline IR |
| **Rendering** | ✅ Complete | DirectorLite, Engine, Renderer, Plugins |
| **Documentation** | ✅ Complete | 37 Nextra pages, 3 root docs, verification |

### What Works Today

```typescript
// You can write this
episode("drama", ep => {
  ep.config({ pacing: "slow-burn", director: "auto" });
  ep.device("Phone", d => {
    d.conversation("dm_bob", { name: "Bob" });
    d.beat("tension", b => {
      b.typing("Bob").for("2s");
      b.receive("Bob", "We need to talk.", { mood: "tense", intensity: 0.8 });
    });
  });
});

// And get deterministic video output with automatic camera
```

---

## The Roadmap

### Phase 1: Polish (v1.1) — 2 weeks

**Goal:** Production-ready for first users.

#### 1.1 Complete Instagram Adapter

**Why:** Multi-platform is table stakes. Instagram DMs are equally viral.

```
packages/apps-instagram/
├── src/
│   ├── views/dm.tsx      # DM view (like WhatsApp)
│   ├── runtime.ts        # Event reducer
│   └── plugin.ts         # Plugin registration
```

**Effort:** 3-5 days
**Blocked by:** Nothing
**Test:** One episode renders on both WhatsApp and Instagram

---

#### 1.2 README.md

**Why:** 80% of projects get judged by README. Ours is missing.

**Structure:**
```markdown
# Tokovo

> The deterministic story engine.

[Quick demo GIF]

## What is Tokovo?

Tokovo compiles drama into video. You write the story, it handles the cinematography.

## Quick Start

```bash
pnpm install
npx turbo dev --filter=video-runner
```

## Documentation

[Link to docs]

## Architecture

[Diagram]

## License
```

**Effort:** 1 day

---

#### 1.3 Example Episodes Gallery

**Why:** "Show, don't tell." People need to see output.

**Create:**
- `examples/breakup.ts` — Dramatic revelation
- `examples/confession.ts` — Romantic tension
- `examples/fight.ts` — Angry exchange
- `examples/ghost.ts` — Slow-burn mystery

**Each example:**
- Full DSL code
- Semantic annotations
- Exported video (GIF or MP4)

**Effort:** 2-3 days

---

### Phase 2: Intelligence (v1.5) — 1 month

**Goal:** DirectorLite becomes semantic-aware.

#### 2.1 DirectorLite v2: Semantic Camera

**Why:** This is the moat. No one else has drama-aware cinematography.

**Current (v1):**
```
Event occurs → Rule fires → Camera moves
```

**v2:**
```
Event occurs + SemanticMeta → Smart rule selection → Context-aware camera
```

**Implementation:**

```typescript
// Rules become semantic-aware
const newRule: SemanticRule = {
  signal: "NewMessage",
  conditions: {
    mood: ["angry", "tense"],
    intensity: { min: 0.7 }
  },
  effect: "ZoomToRect",
  scale: 1.4,  // More aggressive than default
  shake: { intensity: 3 }  // Add shake for anger
};
```

**Why this matters:**
- "We need to talk" at intensity 0.9 → aggressive zoom
- "Ok" at intensity 0.2 → subtle zoom
- Same event type, different treatment

**Effort:** 2-3 weeks
**Blocked by:** Nothing

---

#### 2.2 AI Generation Pipeline

**Why:** The DSL is AI-shaped by design. Time to prove it.

**Create:**
```
packages/ai/
├── src/
│   ├── generate.ts        # LLM → DSL
│   ├── validate.ts        # Schema validation
│   ├── feedback.ts        # Error → retry
│   └── prompts/           # Prompt templates
```

**Flow:**
```
User prompt
    ↓
LLM generates DSL
    ↓
validateConstraints()
    ↓
compile({ mode: "strict" })
    ↓
If error → feedback loop
    ↓
If success → render
```

**Metrics:**
- First-shot success rate
- Retry success rate
- Token efficiency

**Effort:** 2 weeks
**Blocked by:** DirectorLite v2 (for best output)

---

#### 2.3 Voice Note Support

**Why:** Voice notes are top-3 most viral content. Must have.

**Reserve in Scene IR (already done):**
```typescript
type SceneOp = 
  | ...existing...
  | VoiceNoteSentOp
  | VoiceNoteReceivedOp;
```

**Implement:**
1. DSL method: `b.voiceNote("Alice", "3s")`
2. Timeline lowering
3. Adapter handling
4. UI component (waveform animation)

**Effort:** 1 week

---

### Phase 3: Distribution (v2.0) — 2 months

**Goal:** Platform-native export.

#### 3.1 Platform Presets

**Why:** TikTok, Shorts, Reels have different optimal formats.

```typescript
ep.config({
  preset: "tiktok",  // 9:16, 60fps, <60s
  // OR
  preset: "shorts",  // 9:16, 60fps, <60s
  // OR
  preset: "reels",   // 9:16, 30fps, <90s
});
```

**Presets include:**
- Aspect ratio
- FPS
- Max duration
- Optimal pacing
- Platform-specific overlays

**Effort:** 1 week

---

#### 3.2 Batch Rendering Pipeline

**Why:** AI generates 100 episodes. You need to render 100 episodes.

**Create:**
```
packages/batch/
├── src/
│   ├── queue.ts           # Job queue
│   ├── worker.ts          # Render worker
│   ├── storage.ts         # Output storage
│   └── progress.ts        # Progress tracking
```

**Interface:**
```typescript
await batchRender([
  { episodeId: "drama-1", output: "s3://bucket/drama-1.mp4" },
  { episodeId: "drama-2", output: "s3://bucket/drama-2.mp4" },
  // ...100 more
], {
  parallelism: 4,
  preset: "tiktok"
});
```

**Effort:** 2 weeks

---

#### 3.3 Analytics Hooks

**Why:** Know what works. Improve AI → better content → more views.

**Emit:**
```typescript
interface EpisodeAnalytics {
  episodeId: string;
  beatsRendered: { name: string; startFrame: number; endFrame: number }[];
  semanticProfile: { avgIntensity: number; moodDistribution: Record<Mood, number> };
  directorDecisions: { signal: string; effect: string; frame: number }[];
  renderDuration: number;
}
```

**Use for:**
- A/B testing story patterns
- Training better AI prompts
- Optimizing pacing

**Effort:** 1 week

---

### Phase 4: Scale (v3.0) — 3+ months

**Goal:** Multi-episode narratives.

#### 4.1 Story Graph

**Why:** Single episodes are samples. Story arcs are products.

**Concept:**
```typescript
storyArc("breakup-saga", arc => {
  arc.episode("the-hint", ep => { /* foreshadowing */ });
  arc.episode("the-talk", ep => { /* confrontation */ });
  arc.episode("the-aftermath", ep => { /* resolution */ });
  
  arc.continuity({
    characters: ["Alice", "Bob"],
    relationshipArc: "lovers → strangers"
  });
});
```

**Value:**
- Character consistency across episodes
- Relationship tracking
- Narrative callbacks
- Series generation

**Effort:** 1 month+

---

#### 4.2 Viewer-Aware Generation

**Why:** Feedback loop closes the gap between "content we make" and "content people watch."

**Concept:**
```
Views/Watch-time → Analytics → Adjust generation → Better content
```

**Implementation:**
- Track anonymized view metrics
- Correlate with semantic profiles
- Tune AI prompts automatically

**This is the long game.**

---

## Priority Matrix

| Item | Impact | Effort | Blocked By | Priority |
|------|--------|--------|------------|----------|
| README.md | High | Low | Nothing | 🔴 Now |
| Example gallery | High | Medium | Nothing | 🔴 Now |
| Instagram adapter | Medium | Medium | Nothing | 🟡 Soon |
| DirectorLite v2 | Very High | High | Nothing | 🟡 Soon |
| AI pipeline | Very High | High | DirectorLite v2 | 🟢 Next |
| Voice notes | Medium | Low | Nothing | 🟢 Next |
| Platform presets | Medium | Low | Nothing | 🟢 Next |
| Batch rendering | High | Medium | AI pipeline | 🔵 Later |
| Analytics | Medium | Low | Batch rendering | 🔵 Later |
| Story graph | Very High | Very High | Everything | ⚪ Future |

---

## What NOT to Build

❌ **GUI editor** — DSL is the interface. GUI is distraction.

❌ **Marketplace** — No users yet. Marketplace for whom?

❌ **Style editor** — ViralDramaV1 is the style. Customization is scope creep.

❌ **Monetization** — Build value first. Money follows.

❌ **Realtime playback** — Remotion handles this. Don't reinvent.

---

## The Vision Check

Every decision should pass this test:

> **Does this make AI-generated drama better, faster, or more viral?**

- README → More contributors → Better AI training data ✅
- Instagram → More platforms → More viral surface area ✅
- DirectorLite v2 → Smarter camera → Better output ✅
- GUI editor → Slower iteration → ❌

---

## Success Metrics

### Phase 1 (v1.1)
- [ ] README with demo GIF
- [ ] 4+ example episodes
- [ ] Instagram adapter working

### Phase 2 (v1.5)
- [ ] DirectorLite reads SemanticMeta
- [ ] AI generates valid episodes >80% first-shot
- [ ] Voice notes render

### Phase 3 (v2.0)
- [ ] Platform presets for 3 platforms
- [ ] Batch render 100 episodes/hour
- [ ] Analytics dashboard exists

### Phase 4 (v3.0)
- [ ] Multi-episode arcs work
- [ ] Character continuity maintained
- [ ] Viewer feedback improves generation

---

## Final Words

Tokovo is not a video tool. It's **infrastructure for programmatic storytelling**.

The foundation is complete. The documentation is world-class. The architecture is sound.

What's next is execution at the edges:
1. **Polish** — Make it usable
2. **Intelligence** — Make it smart
3. **Distribution** — Make it scalable
4. **Scale** — Make it compound

The drama compiler is built. Now we compile drama at scale.
