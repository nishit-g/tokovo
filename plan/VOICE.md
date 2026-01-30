# Voice System Architecture

> Enterprise-grade TTS integration for Tokovo video production

## Overview

The Voice System enables AI-generated narration with multi-speaker support, emotion control, and frame-perfect timing synchronization with visual events.

```
SCRIPT → GENERATE → COMPOSE → RENDER
```

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Architecture](#architecture)
3. [Script Format](#script-format)
4. [Generation Pipeline](#generation-pipeline)
5. [DSL Integration](#dsl-integration)
6. [Package Structure](#package-structure)
7. [Type Definitions](#type-definitions)
8. [API Reference](#api-reference)
9. [Provider System](#provider-system)
10. [Caching Strategy](#caching-strategy)
11. [Future: Captions](#future-captions)
12. [Validation & Research](#validation--research)

---

## Core Concepts

### Separation of Concerns

| Layer        | Responsibility                        | Output                        |
| ------------ | ------------------------------------- | ----------------------------- |
| **Script**   | Creative content (who says what, how) | `script.json`                 |
| **Generate** | TTS API calls, audio production       | `audio.mp3` + `manifest.json` |
| **Compose**  | Timing, placement, adjustments        | DSL episode                   |
| **Render**   | Frame-perfect video output            | MP4                           |

### Key Insight

**Voice timing ≠ Visual timing.** The manifest provides audio _content_ and _duration_. The DSL controls _when_ and _how_ audio plays relative to visual events.

```typescript
// Manifest says: segment 0 is 2.3 seconds long
// DSL says: play it starting at 1 second mark
voice.at("1s").play("seg_0");
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  SCRIPT LAYER                                                    │
│  ─────────────────────────────────────────────────────────────  │
│  {                                                               │
│    "id": "drama-001",                                           │
│    "voices": { "narrator": "voice_id", "sarah": "voice_id" },   │
│    "lines": [                                                    │
│      { "speaker": "narrator", "text": "[calm] Watch this..." }, │
│      { "speaker": "sarah", "text": "[excited] Oh my god!" }     │
│    ]                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  GENERATION LAYER                                                │
│  ─────────────────────────────────────────────────────────────  │
│  • Parse script                                                  │
│  • Check cache (content hash → existing audio)                  │
│  • Call TTS provider (ElevenLabs Text-to-Dialogue)              │
│  • Save audio file + manifest with timing                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OUTPUT                                                          │
│  ─────────────────────────────────────────────────────────────  │
│  generated/drama-001/                                           │
│  ├── audio.mp3              (full conversation)                 │
│  └── manifest.json          (segment timing)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DSL COMPOSITION                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  episode("viral", { fps: 30, duration: "30s" })                 │
│    .useVoice("drama-001")                                       │
│    .track("voice", (v) => {                                     │
│      v.at("1s").play("seg_0");                                  │
│      v.at("5s").play("seg_1", { speed: 1.1 });                  │
│    })                                                            │
│    .track("whatsapp", (wa) => {                                 │
│      wa.at("4.5s").showTyping({ duration: "2s" });              │
│      wa.at("6.5s").receiveMessage({ text: "..." });             │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  RENDER                                                          │
│  ─────────────────────────────────────────────────────────────  │
│  VoiceLayer → Remotion <Sequence><Audio /></Sequence>           │
│  Mixer → Voice bus auto-ducks music to 15%                      │
│  Output → MP4 with synced voice                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Script Format

### Structure

```typescript
interface VoiceScript {
  /** Unique identifier for caching and referencing */
  id: string;

  /** Voice assignments: speaker name → provider voice ID */
  voices: Record<string, string>;

  /** Ordered dialogue lines */
  lines: VoiceLine[];

  /** Optional metadata */
  meta?: {
    title?: string;
    description?: string;
    createdAt?: string;
    createdBy?: string; // "human" | "claude" | etc.
  };
}

interface VoiceLine {
  /** Speaker identifier (must exist in voices map) */
  speaker: string;

  /** Text with optional emotion tags */
  text: string;

  /** Optional per-line overrides */
  options?: {
    speed?: number; // Playback speed hint
    pause?: number; // Pause after line (ms)
  };
}
```

### Example

```json
{
  "id": "drama-001",
  "voices": {
    "narrator": "EXAVITQu4vr4xnSDxMaL",
    "sarah": "21m00Tcm4TlvDq8ikWAM",
    "mike": "AZnzlk1XvdvUeBnXmlld"
  },
  "lines": [
    {
      "speaker": "narrator",
      "text": "[calm] Watch what happens when she replies..."
    },
    { "speaker": "sarah", "text": "[excited] Oh my god, did you see that?!" },
    { "speaker": "mike", "text": "[shocked] No way. No way she said that." },
    { "speaker": "narrator", "text": "[dramatic pause] But it gets worse..." }
  ],
  "meta": {
    "title": "Drama Reveal",
    "createdBy": "claude"
  }
}
```

### Emotion Tags

ElevenLabs v3 supports audio tags for emotion control:

| Tag            | Effect                     |
| -------------- | -------------------------- |
| `[excited]`    | Energetic, upbeat delivery |
| `[calm]`       | Relaxed, measured pace     |
| `[whispers]`   | Quiet, intimate            |
| `[shocked]`    | Surprised, taken aback     |
| `[sarcastic]`  | Dry, ironic tone           |
| `[dramatic]`   | Intense, theatrical        |
| `[laughing]`   | Spoken while laughing      |
| `[sighs]`      | Includes audible sigh      |
| `[curious]`    | Questioning, interested    |
| `[frustrated]` | Annoyed, impatient         |

**Punctuation also matters:**

- `...` → Natural pause, hesitation
- `!` → Emphasis, excitement
- `?!` → Shocked question
- `CAPS` → Stressed words

---

## Generation Pipeline

### Process

```
1. Parse script.json
2. Compute content hash for caching
3. Check cache → if hit, return cached manifest
4. Transform lines to API format
5. Call ElevenLabs Text-to-Dialogue
6. Decode audio, save to file
7. Extract segment timing from response
8. Generate manifest.json
9. Store in cache
10. Return manifest
```

### ElevenLabs Text-to-Dialogue API

**Endpoint:** `POST /v1/text-to-dialogue/with-timestamps`

**Request:**

```json
{
  "model_id": "eleven_v3",
  "inputs": [
    { "text": "[calm] Watch what happens...", "voice_id": "abc123" },
    { "text": "[excited] Oh my god!", "voice_id": "def456" }
  ]
}
```

**Response:**

```json
{
  "audio_base64": "base64_encoded_audio...",
  "voice_segments": [
    {
      "voice_id": "abc123",
      "start_time_seconds": 0.0,
      "end_time_seconds": 2.34,
      "dialogue_input_index": 0
    },
    {
      "voice_id": "def456",
      "start_time_seconds": 2.34,
      "end_time_seconds": 4.12,
      "dialogue_input_index": 1
    }
  ],
  "alignment": {
    "characters": ["W", "a", "t", "c", "h", ...],
    "character_start_times_seconds": [0.0, 0.08, 0.12, ...],
    "character_end_times_seconds": [0.08, 0.12, 0.18, ...]
  }
}
```

### Manifest Output

```json
{
  "scriptId": "drama-001",
  "audioFile": "audio.mp3",
  "durationMs": 4120,
  "generatedAt": "2025-01-28T15:30:00Z",
  "provider": "elevenlabs",
  "model": "eleven_v3",
  "segments": [
    {
      "index": 0,
      "speaker": "narrator",
      "text": "[calm] Watch what happens when she replies...",
      "startMs": 0,
      "endMs": 2340,
      "durationMs": 2340
    },
    {
      "index": 1,
      "speaker": "sarah",
      "text": "[excited] Oh my god, did you see that?!",
      "startMs": 2340,
      "endMs": 4120,
      "durationMs": 1780
    }
  ],
  "alignment": {
    "characters": [...],
    "startTimesMs": [...],
    "endTimesMs": [...]
  }
}
```

---

## DSL Integration

### Loading Voice Manifest

```typescript
episode("viral", { fps: 30, duration: "30s" }).useVoice("drama-001"); // Loads generated/drama-001/manifest.json
```

### Placing Segments

```typescript
.track("voice", (v) => {
  // Play segment at absolute time
  v.at("1s").play("seg_0");

  // Play with adjustments
  v.at("5s").play("seg_1", {
    speed: 1.2,      // 20% faster
    volume: 0.8,     // 80% volume
  });

  // Play by index
  v.at("8s").play(2);  // Third segment

  // Play by speaker (first matching)
  v.at("10s").play({ speaker: "narrator" });
})
```

### Relative Timing

```typescript
.track("voice", (v) => {
  v.at("1s").play("seg_0");
  v.after("0.5s").play("seg_1");  // 0.5s after seg_0 ends
  v.after("0s").play("seg_2");    // Immediately after seg_1
})
```

### Syncing with Visuals

```typescript
episode("drama", { fps: 30, duration: "20s" })
  .useVoice("drama-001")

  .track("whatsapp", (wa) => {
    wa.at("0s").openChat("Sarah");
    wa.at("3s").showTyping({ duration: "2s" });
    wa.at("5s").receiveMessage({ text: "OMG did you see what he said?!" });
  })

  .track("voice", (v) => {
    // Narrator during chat view
    v.at("0.5s").play("seg_0"); // "Watch what happens..."

    // Sarah's voice synced with message appear
    v.at("5s").play("seg_1"); // "Oh my god!"
  });
```

---

## Package Structure

```
packages/voice/
├── src/
│   ├── index.ts                 # Public exports
│   │
│   ├── types/
│   │   ├── script.ts            # VoiceScript, VoiceLine
│   │   ├── manifest.ts          # VoiceManifest, VoiceSegment
│   │   └── index.ts
│   │
│   ├── providers/
│   │   ├── types.ts             # TTSProvider interface
│   │   ├── elevenlabs/
│   │   │   ├── client.ts        # API client
│   │   │   ├── types.ts         # API request/response types
│   │   │   └── index.ts
│   │   └── index.ts             # Provider registry
│   │
│   ├── generate/
│   │   ├── generate.ts          # Main generation logic
│   │   ├── transform.ts         # Script → API format
│   │   └── index.ts
│   │
│   ├── cache/
│   │   ├── types.ts             # CacheProvider interface
│   │   ├── file-cache.ts        # Local file system cache
│   │   ├── hash.ts              # Content hashing
│   │   └── index.ts
│   │
│   ├── dsl/
│   │   ├── voice-track.ts       # VoiceTrackBuilder
│   │   ├── types.ts             # VoiceEvent, VoicePlayOptions
│   │   └── index.ts
│   │
│   └── render/
│       ├── VoiceLayer.tsx       # Remotion component
│       ├── useVoiceManifest.ts  # Hook to load manifest
│       └── index.ts
│
├── scripts/                     # Input scripts (gitignored in prod)
│   └── examples/
│       └── drama-001.json
│
├── generated/                   # Output (gitignored)
│   └── drama-001/
│       ├── audio.mp3
│       └── manifest.json
│
├── bin/
│   └── generate.ts              # CLI entry point
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Type Definitions

### Script Types

```typescript
// types/script.ts

export interface VoiceScript {
  id: string;
  voices: Record<string, string>;
  lines: VoiceLine[];
  meta?: VoiceScriptMeta;
}

export interface VoiceLine {
  speaker: string;
  text: string;
  options?: VoiceLineOptions;
}

export interface VoiceLineOptions {
  speed?: number;
  pause?: number;
}

export interface VoiceScriptMeta {
  title?: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
}
```

### Manifest Types

```typescript
// types/manifest.ts

export interface VoiceManifest {
  scriptId: string;
  audioFile: string;
  durationMs: number;
  generatedAt: string;
  provider: string;
  model: string;
  segments: VoiceSegment[];
  alignment?: VoiceAlignment;
}

export interface VoiceSegment {
  index: number;
  speaker: string;
  text: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

export interface VoiceAlignment {
  characters: string[];
  startTimesMs: number[];
  endTimesMs: number[];
}
```

### Provider Types

```typescript
// providers/types.ts

export interface TTSProvider {
  name: string;

  generateDialogue(request: DialogueRequest): Promise<DialogueResult>;

  estimateCost(script: VoiceScript): number;

  validateScript(script: VoiceScript): ValidationResult;
}

export interface DialogueRequest {
  inputs: DialogueInput[];
  model?: string;
  outputFormat?: "mp3" | "wav";
}

export interface DialogueInput {
  text: string;
  voiceId: string;
}

export interface DialogueResult {
  audioBuffer: Buffer;
  durationMs: number;
  segments: SegmentTiming[];
  alignment?: AlignmentData;
}

export interface SegmentTiming {
  index: number;
  voiceId: string;
  startMs: number;
  endMs: number;
}

export interface AlignmentData {
  characters: string[];
  startTimesSeconds: number[];
  endTimesSeconds: number[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### DSL Types

```typescript
// dsl/types.ts

export interface VoiceEvent {
  type: "play";
  segmentRef: SegmentRef;
  startFrame: number;
  options: VoicePlayOptions;
}

export type SegmentRef =
  | string // "seg_0" or segment id
  | number // index
  | { speaker: string; index?: number }; // by speaker

export interface VoicePlayOptions {
  speed?: number; // 0.5 - 2.0, default 1.0
  volume?: number; // 0.0 - 1.0, default 1.0
  trim?: {
    startMs?: number;
    endMs?: number;
  };
}
```

---

## API Reference

### Generate CLI

```bash
# Generate audio from script
pnpm voice:generate scripts/drama-001.json

# Generate with options
pnpm voice:generate scripts/drama-001.json --output ./custom/path --force

# Validate script without generating
pnpm voice:validate scripts/drama-001.json
```

### Programmatic API

```typescript
import { generateFromScript, loadManifest } from "@tokovo/voice";

// Generate
const manifest = await generateFromScript({
  scriptPath: "scripts/drama-001.json",
  outputDir: "generated/drama-001",
  provider: "elevenlabs",
  cache: true,
});

// Load existing manifest
const manifest = await loadManifest("drama-001");
```

---

## Provider System

### Interface

All TTS providers implement the `TTSProvider` interface, enabling swappable backends.

```typescript
// providers/types.ts

export interface TTSProvider {
  name: string;
  generateDialogue(request: DialogueRequest): Promise<DialogueResult>;
  estimateCost(script: VoiceScript): number;
  validateScript(script: VoiceScript): ValidationResult;
}
```

### ElevenLabs Provider (Default)

```typescript
// providers/elevenlabs/index.ts

export class ElevenLabsProvider implements TTSProvider {
  name = "elevenlabs";

  private client: ElevenLabsClient;

  constructor(config: ElevenLabsConfig) {
    this.client = new ElevenLabsClient(config.apiKey);
  }

  async generateDialogue(request: DialogueRequest): Promise<DialogueResult> {
    const response = await this.client.textToDialogue({
      model_id: "eleven_v3",
      inputs: request.inputs.map((i) => ({
        text: i.text,
        voice_id: i.voiceId,
      })),
    });

    return {
      audioBuffer: Buffer.from(response.audio_base64, "base64"),
      durationMs: this.calculateDuration(response.voice_segments),
      segments: response.voice_segments.map((seg, i) => ({
        index: i,
        voiceId: seg.voice_id,
        startMs: seg.start_time_seconds * 1000,
        endMs: seg.end_time_seconds * 1000,
      })),
      alignment: response.alignment
        ? {
            characters: response.alignment.characters,
            startTimesSeconds: response.alignment.character_start_times_seconds,
            endTimesSeconds: response.alignment.character_end_times_seconds,
          }
        : undefined,
    };
  }

  estimateCost(script: VoiceScript): number {
    const totalChars = script.lines.reduce((sum, l) => sum + l.text.length, 0);
    // ElevenLabs v3: ~$0.30 per 1000 chars (estimate)
    return (totalChars / 1000) * 0.3;
  }

  validateScript(script: VoiceScript): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check voice limit
    const uniqueVoices = new Set(Object.values(script.voices));
    if (uniqueVoices.size > 10) {
      errors.push(`Too many voices: ${uniqueVoices.size} (max 10)`);
    }

    // Check character limit
    const totalChars = script.lines.reduce((sum, l) => sum + l.text.length, 0);
    if (totalChars > 5000) {
      errors.push(`Script too long: ${totalChars} chars (max 5000)`);
    }

    // Check speaker references
    for (const line of script.lines) {
      if (!script.voices[line.speaker]) {
        errors.push(`Unknown speaker: ${line.speaker}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
```

### Adding New Providers (Future)

```typescript
// providers/azure/index.ts (future)

export class AzureProvider implements TTSProvider {
  name = "azure";
  // ... implementation
}

// providers/openai/index.ts (future)

export class OpenAIProvider implements TTSProvider {
  name = "openai";
  // ... implementation
}
```

### Provider Registry

```typescript
// providers/index.ts

const providers: Record<string, TTSProvider> = {};

export function registerProvider(provider: TTSProvider): void {
  providers[provider.name] = provider;
}

export function getProvider(name: string): TTSProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown provider: ${name}`);
  }
  return provider;
}

// Auto-register default providers
registerProvider(
  new ElevenLabsProvider({ apiKey: process.env.ELEVENLABS_API_KEY }),
);
```

---

## Caching Strategy

### Content-Addressed Cache

Cache key = hash of script content + provider + model

```typescript
// cache/hash.ts

import { createHash } from "crypto";

export function computeScriptHash(
  script: VoiceScript,
  provider: string,
  model: string,
): string {
  const content = JSON.stringify({
    voices: script.voices,
    lines: script.lines,
    provider,
    model,
  });

  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}
```

### File Cache (Development)

```typescript
// cache/file-cache.ts

export class FileCache implements CacheProvider {
  constructor(private baseDir: string = ".voice-cache") {}

  async get(hash: string): Promise<CachedResult | null> {
    const manifestPath = path.join(this.baseDir, hash, "manifest.json");

    if (!fs.existsSync(manifestPath)) {
      return null;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const audioPath = path.join(this.baseDir, hash, "audio.mp3");

    return { manifest, audioPath };
  }

  async set(
    hash: string,
    audio: Buffer,
    manifest: VoiceManifest,
  ): Promise<void> {
    const dir = path.join(this.baseDir, hash);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, "audio.mp3"), audio);
    fs.writeFileSync(
      path.join(dir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
  }
}
```

### S3 Cache (Production - Future)

```typescript
// cache/s3-cache.ts (future)

export class S3Cache implements CacheProvider {
  constructor(
    private bucket: string,
    private prefix: string = "voice/",
  ) {}

  async get(hash: string): Promise<CachedResult | null> {
    // Check S3 for existing audio
  }

  async set(
    hash: string,
    audio: Buffer,
    manifest: VoiceManifest,
  ): Promise<void> {
    // Upload to S3 with content-addressed path
  }
}
```

---

## Future: Captions

The `alignment` data in the manifest enables TikTok-style captions (word-by-word highlighting). This is **Phase 2** - not part of initial implementation.

### Character-to-Word Conversion

```typescript
// future: captions/char-to-word.ts

export function extractWords(alignment: VoiceAlignment): WordTiming[] {
  const words: WordTiming[] = [];
  let currentWord = "";
  let wordStart = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const startMs = alignment.startTimesMs[i];
    const endMs = alignment.endTimesMs[i];

    if (char === " " || char === "\n") {
      if (currentWord) {
        words.push({
          text: currentWord,
          startMs: wordStart,
          endMs: alignment.endTimesMs[i - 1],
        });
        currentWord = "";
      }
    } else {
      if (!currentWord) {
        wordStart = startMs;
      }
      currentWord += char;
    }
  }

  // Don't forget last word
  if (currentWord) {
    words.push({
      text: currentWord,
      startMs: wordStart,
      endMs: alignment.endTimesMs[alignment.endTimesMs.length - 1],
    });
  }

  return words;
}
```

### Remotion Caption Integration

```typescript
// future: Using @remotion/captions

import { createTikTokStyleCaptions } from "@remotion/captions";

const captions = words.map((w) => ({
  text: ` ${w.text}`, // Leading space required
  startMs: w.startMs,
  endMs: w.endMs,
  timestampMs: w.startMs,
  confidence: 1,
}));

const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});
```

---

## Validation & Research

### ElevenLabs Text-to-Dialogue API ✅

**Confirmed working.** Endpoint exists and returns expected data.

- Endpoint: `POST /v1/text-to-dialogue/with-timestamps`
- Max voices: 10 per request
- Max characters: 5,000 (v3 model)
- Returns: audio + segment timing + character alignment
- Status: v3 is alpha but API is stable

### Tokovo Audio System ✅

**Fully compatible.** Existing infrastructure supports our needs.

- Voice bus exists with auto-ducking to music (15%)
- `AudioTrackBuilder` pattern to follow for `VoiceTrackBuilder`
- `AudioLayer` uses Remotion `<Sequence>` + `<Audio>`
- External audio URLs supported

### Remotion Audio ✅

**All features confirmed.**

| Feature                  | Support              |
| ------------------------ | -------------------- |
| `playbackRate`           | ✅ 0.5 - 16x         |
| `volume`                 | ✅ Static or dynamic |
| `trimBefore`/`trimAfter` | ✅                   |
| External URLs            | ✅                   |
| `<Sequence>` timing      | ✅                   |

---

## Limitations

| Limitation                 | Impact                     | Mitigation                        |
| -------------------------- | -------------------------- | --------------------------------- |
| Max 10 voices per API call | Limits speakers per script | Split into multiple scripts       |
| 5,000 char limit (v3)      | ~5 min of dialogue         | Split long scripts                |
| v3 is alpha                | Potential quirks           | Monitor, fallback to per-line TTS |
| ElevenLabs only (for now)  | Vendor lock-in             | Provider abstraction ready        |

---

## Implementation Phases

### Phase 1: Core Voice System (Current)

- [ ] Package setup
- [ ] Types
- [ ] ElevenLabs provider
- [ ] Generate CLI
- [ ] File cache
- [ ] VoiceTrackBuilder DSL
- [ ] VoiceLayer component
- [ ] Integration with audio mixer

### Phase 2: Captions (Future)

- [ ] Character-to-word extraction
- [ ] @remotion/captions integration
- [ ] TikTok-style component
- [ ] Caption DSL options

### Phase 3: Scale (Future)

- [ ] S3 cache
- [ ] Additional providers (Azure, OpenAI)
- [ ] Batch generation
- [ ] Cost estimation dashboard

---

## Environment Variables

```bash
# Required
ELEVENLABS_API_KEY=your_api_key_here

# Optional
VOICE_CACHE_DIR=.voice-cache
VOICE_OUTPUT_DIR=generated
```

---

## Quick Start

```bash
# 1. Create a script
cat > scripts/test.json << 'EOF'
{
  "id": "test-001",
  "voices": {
    "narrator": "EXAVITQu4vr4xnSDxMaL"
  },
  "lines": [
    { "speaker": "narrator", "text": "[excited] Hello world, this is a test!" }
  ]
}
EOF

# 2. Generate audio
pnpm voice:generate scripts/test.json

# 3. Use in episode
# episode.ts
episode("test", { fps: 30, duration: "10s" })
  .useVoice("test-001")
  .track("voice", (v) => {
    v.at("1s").play("seg_0");
  });
```
