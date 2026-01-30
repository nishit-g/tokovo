# @tokovo/voice

Frame-perfect AI voice narration for Tokovo video episodes.

## Quick Start (2 Commands)

```bash
# 1. Generate voice from script
pnpm voice:generate scripts/drama.json

# 2. Sync to project (copies assets + generates types)
pnpm voice:sync
```

That's it. Now use type-safe voice in your episode:

```typescript
import { episode } from "@tokovo/dsl";
import { drama } from "@tokovo/voice";

episode("my-ep", { fps: 30, duration: "20s" })
  .voice(drama, (v) => {
    v.at("0s").play("seg_0"); // ← Full autocomplete
    v.at("5s").play("seg_1"); // ← Type-safe segment IDs
    v.at("12s").play("seg_2");
  })
  .track(
    "app_whatsapp",
    () => wa,
    (wa) => {
      wa.at(drama.end("seg_0")).receive("Sarah", "..."); // ← Event anchoring
    },
  )
  .build();
```

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           VOICE DX PIPELINE                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. pnpm voice:generate scripts/drama.json                             │
│     └─→ ElevenLabs API → audio.mp3 + manifest.json (cached)            │
│                                                                        │
│  2. pnpm voice:sync                                                    │
│     └─→ Copy assets to public/voice/                                   │
│     └─→ Generate TypeScript: src/scripts/drama.ts                      │
│         └─→ Type-safe segment IDs with autocomplete                    │
│         └─→ start(), end(), duration() helpers                         │
│                                                                        │
│  3. import { drama } from "@tokovo/voice"                              │
│     └─→ Full IntelliSense, zero manual wiring                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Script Format

Create a JSON script with characters and dialogue:

```json
{
  "id": "drama",
  "title": "Drama Script",
  "characters": {
    "narrator": {
      "voiceId": "pNInz6obpgDQGcFmaJgB",
      "name": "Narrator"
    },
    "sarah": {
      "voiceId": "21m00Tcm4TlvDq8ikWAM",
      "name": "Sarah"
    }
  },
  "segments": [
    {
      "characterId": "narrator",
      "text": "What you're about to see will shock you."
    },
    {
      "characterId": "sarah",
      "text": "Oh my god, I can't believe this is happening!"
    },
    { "characterId": "narrator", "text": "But wait... there's more." },
    {
      "characterId": "sarah",
      "text": "I never should have opened that message."
    }
  ]
}
```

## Generated TypeScript

After `voice:sync`, you get type-safe exports:

```typescript
// Auto-generated: src/scripts/drama.ts

export type drama_SegmentId = "seg_0" | "seg_1" | "seg_2" | "seg_3";

export const drama = {
  id: "drama",
  manifestPath: "/voice/drama-manifest.json",
  audioPath: "/voice/drama.mp3",
  durationMs: 10443,
  segments: ["seg_0", "seg_1", "seg_2", "seg_3"] as const,

  start(segmentId: drama_SegmentId): number { ... },
  end(segmentId: drama_SegmentId): number { ... },
  duration(segmentId: drama_SegmentId): number { ... },
};
```

## Episode Integration

### Basic Voice (Linear Playback)

```typescript
episode("my-ep", { fps: 30, duration: "15s" })
  .voice(drama) // Plays entire audio from frame 0
  .build();
```

### Scheduled Segments (Gaps Between Dialogue)

```typescript
episode("my-ep", { fps: 30, duration: "20s" })
  .voice(drama, (v) => {
    v.at("0s").play("seg_0"); // Narrator intro
    v.at("5s").play("seg_1"); // 5s pause, then Sarah
    v.at("12s").play("seg_2"); // 7s pause, then narrator
    v.at("16s").play("seg_3"); // Final line
  })
  .build();
```

### Event Anchoring (Sync Visuals to Voice)

```typescript
episode("my-ep", { fps: 30, duration: "20s" })
  .voice(drama, (v) => {
    v.at("0s").play("seg_0");
    v.at("5s").play("seg_1");
  })
  .track(
    "app_whatsapp",
    () => wa,
    (wa) => {
      // Message appears exactly when segment ends
      wa.at(drama.end("seg_0")).receive("Sarah", "OMG!");

      // Or use segment start time
      wa.at(drama.start("seg_1")).typing("them");
    },
  )
  .camera((cam) => {
    // Zoom when dramatic line starts
    cam.at(drama.start("seg_2")).animate({
      scale: 1.2,
      duration: drama.duration("seg_2"),
    });
  })
  .build();
```

## CLI Reference

### voice:generate

```bash
# Generate voice from script
pnpm voice:generate scripts/drama.json

# Environment variable required
ELEVENLABS_API_KEY=sk_... pnpm voice:generate scripts/drama.json
```

Output is cached in `generated/voice-cache/`. Same script content = no API calls.

### voice:sync

```bash
# Sync all generated voice assets
pnpm voice:sync

# Watch mode (auto-sync on changes)
pnpm voice:sync --watch
```

This command:

1. Copies audio + manifest to `apps/video-runner/public/voice/`
2. Generates TypeScript types in `src/scripts/`
3. Re-exports from package index for clean imports

## Audio Integration

Voice playback integrates with `@tokovo/core` audio system:

### Automatic Ducking

When voice plays, music is automatically ducked (lowered):

```typescript
const DEFAULT_VOICE_DUCK: DuckRule = {
  targetBus: "music", // Duck the music bus
  amount: 0.15, // To 15% volume
  attack: 6, // 6 frames fade down (~200ms at 30fps)
  release: 12, // 12 frames fade up (~400ms at 30fps)
};
```

### Voice Events

| Event          | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| `PLAY_SEGMENT` | Play a voice segment with timing, speed, metadata        |
| `STOP_VOICE`   | Stop voice playback (optionally target specific segment) |

### SoundCue Metadata

Voice segments store metadata for targeting:

```typescript
cue.metadata = {
  segmentId: "seg_001", // Used by STOP_VOICE for targeted stop
  speaker: "Narrator",
  text: "Hello world",
};
```

### Targeted Stop

Stop a specific segment without affecting others:

```typescript
const stopEvent: VoiceStopEvent = {
  type: "STOP_VOICE",
  at: 250,
  segmentId: "seg_001", // Only stops this segment
};
```

## Performance

- **Cached Generation**: SHA-256 hash-based caching. Identical scripts skip API calls.
- **Lazy Loading**: Manifests loaded on-demand via `staticFile()`.
- **Frame-Perfect**: Audio timing computed from manifest, zero drift.
- **Parallel Segments**: Multiple `<Audio>` components render independently.

## Types

```typescript
import type {
  VoiceScriptDefinition,
  VoiceManifest,
  VoiceSegment,
  VoicePlayEvent,
} from "@tokovo/voice";
```

### VoiceScriptDefinition<T>

Generated script interface with segment ID type parameter:

```typescript
interface VoiceScriptDefinition<T extends string> {
  id: string;
  manifestPath: string;
  audioPath: string;
  durationMs: number;
  segments: readonly T[];
  start(segmentId: T): number;
  end(segmentId: T): number;
  duration(segmentId: T): number;
}
```

### VoiceManifest

Runtime manifest loaded from JSON:

```typescript
interface VoiceManifest {
  id: string;
  segments: VoiceSegment[];
  durationMs: number;
  generatedAt: string;
  hash: string;
}

interface VoiceSegment {
  id: string;
  characterId: string;
  text: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}
```

## Troubleshooting

### Import Not Resolving

After `voice:sync`, restart TypeScript server or run:

```bash
pnpm install  # Re-links workspace
```

### Segment ID Autocomplete Not Working

Ensure you imported from the correct path:

```typescript
// ✅ Correct
import { drama } from "@tokovo/voice";

// ❌ Wrong - direct file import bypasses types
import { drama } from "@tokovo/voice/src/scripts/drama";
```

### Audio Not Playing

1. Check browser console for 404 errors
2. Verify files exist in `apps/video-runner/public/voice/`
3. Run `pnpm voice:sync` to copy assets

### Timing Seems Off

1. Verify FPS matches between episode config and Remotion
2. Check `drama.start()` / `drama.end()` returns frame numbers, not milliseconds
3. Use manifest timing for precise sync

## Exports

```typescript
// Browser + Node
import {
  // Components
  SimpleVoiceLayer,
  VoiceLayer,

  // DSL
  VoiceTrackBuilder,

  // Generated scripts (after voice:sync)
  drama,
  drama_segments,

  // Types
  type VoiceManifest,
  type VoiceSegment,
  type VoiceScriptDefinition,
} from "@tokovo/voice";

// Node.js only (generation)
import { generateVoice, ElevenLabsProvider } from "@tokovo/voice/server";
```
