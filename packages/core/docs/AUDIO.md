# Audio System

Tokovo's audio system handles background music, UI sounds, voice narration, and sound effects in a deterministic, frame-based manner suitable for video rendering.

## Core Concepts

### Sound Identification

- **soundId**: The asset path to the audio file (e.g., `"ui/notification.mp3"`). This identifies WHAT sound to play.
- **instanceId**: A unique runtime identifier for each playing instance (e.g., `"sound_42"`). This identifies a SPECIFIC playback instance. Multiple instances of the same soundId can play simultaneously.

Example: Playing the same notification sound twice creates one soundId with two different instanceIds.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUDIO PIPELINE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Timeline Events          Handlers              State                │
│  ──────────────          ────────              ─────                 │
│  PLAY_SOUND    ────────► audio.ts ──────────► AudioState            │
│  STOP_SOUND              voice.ts              ├─ activeSounds      │
│  CROSSFADE                                     ├─ musicBed          │
│  FADE_OUT                                      ├─ outgoingMusicBed  │
│  STOP_ALL                                      └─ buses             │
│  PLAY_SEGMENT                                                        │
│  STOP_VOICE                                                          │
│                                                                      │
│  AudioState               Mixer                 Renderer             │
│  ──────────              ─────                 ────────              │
│  activeSounds ─────────► computeBusStates ───► AudioLayer.tsx       │
│  musicBed                computeSoundVolume    ├─ SoundInstance     │
│  buses                   computeCrossfade      └─ MusicBedInstance  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Types

### SoundCue

Primary sound representation. All active sounds are `SoundCue` instances.

```typescript
interface SoundCue {
  readonly soundId: string; // Asset path (e.g., "ui/notification.mp3")
  readonly startFrame: number; // Composition frame when sound starts
  volume: number; // 0.0 - 1.0
  bus: AudioBus; // "music" | "ui" | "sfx" | "voice" | "master"
  priority: number; // Higher = survives culling (voice=100, sfx=50)

  // Optional
  loop?: boolean;
  duration?: number; // In frames
  deviceId?: string; // For device-specific audio
  origin?: SoundOrigin; // "device" | "app" | "world"

  // Fade
  fadeTarget?: number;
  fadeDuration?: number;
  fadeStartFrame?: number;

  // Envelope (attack/release)
  envelope?: AudioEnvelope;

  // Ducking (this sound ducks another bus)
  duck?: DuckRule;

  // Playback control
  audioStartFrom?: number; // Trim start (frames)
  playbackRate?: number; // Speed multiplier (1.0 = normal)
  toneFrequency?: number; // Pitch correction (server-side only)
  loopVolumeCurveBehavior?: "repeat" | "extend";

  // Metadata
  metadata?: SoundCueMetadata;
}
```

### MusicBed

Background music with crossfade support.

```typescript
interface MusicBed {
  readonly id?: string;
  readonly soundId: string;
  readonly startFrame: number;
  loop: boolean;
  baseGain: number; // Base volume (typically 0.25-0.4)
  moodTag?: MoodTag; // "tense" | "romantic" | "chaotic" | "calm" | "dramatic"
  crossfadeFrames?: number; // Duration of crossfade (default: 30)
  crossfadeCurve?: CrossfadeCurve; // "linear" | "easeIn" | "easeOut" | "easeInOut"
  fadeOutStart?: number;
  fadeOutDuration?: number;
}
```

### AudioState

Complete audio state at any frame.

```typescript
interface AudioState {
  activeSounds: Record<string, SoundCue>;
  buses: {
    music: AudioBusConfig; // { baseGain: 0.35, maxConcurrent: 1 }
    ui: AudioBusConfig; // { baseGain: 0.9, maxConcurrent: 3 }
    sfx: AudioBusConfig; // { baseGain: 0.8, maxConcurrent: 4 }
    voice: AudioBusConfig; // { baseGain: 1.0, maxConcurrent: 1 }
  };
  musicBed?: MusicBed;
  outgoingMusicBed?: MusicBed; // During crossfade
}
```

## Audio Buses

| Bus      | Base Gain | Max Concurrent | Purpose                  |
| -------- | --------- | -------------- | ------------------------ |
| `music`  | 0.35      | 1              | Background music beds    |
| `ui`     | 0.90      | 3              | UI sounds (taps, swipes) |
| `sfx`    | 0.80      | 4              | Sound effects            |
| `voice`  | 1.00      | 1              | Voice narration/TTS      |
| `master` | 1.00      | ∞              | Bypass bus               |

## Ducking

Voice automatically ducks music. Configured via `DuckRule`:

```typescript
interface DuckRule {
  targetBus: AudioBus; // Bus to duck (usually "music")
  amount: number; // Target multiplier (0.15 = duck to 15%)
  attack: number; // Frames to reach full duck
  release: number; // Frames to release after source ends
}

// Default voice duck config
const DEFAULT_VOICE_DUCK: DuckRule = {
  targetBus: "music",
  amount: 0.15,
  attack: 6,
  release: 12,
};
```

## Event Handlers

### Audio Events (audio.ts)

| Event                      | Payload                                            | Behavior                                                                    |
| -------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `PLAY` / `PLAY_SOUND`      | `soundId`, `volume?`, `loop?`, `bus?`, `deviceId?` | Creates SoundCue. If `bus="music"` or `loop=true`, creates MusicBed instead |
| `STOP` / `STOP_SOUND`      | `instanceId?` or `soundId?`                        | Removes matching sounds                                                     |
| `STOP_ALL`                 | `bus?`                                             | Removes all sounds (or all on specified bus)                                |
| `FADE_OUT` / `FADE_VOLUME` | `toVolume?`, `duration?`                           | Fades sound/music                                                           |
| `CROSSFADE`                | `toSoundId` or `soundId`, `crossfadeDuration?`     | Crossfades music beds                                                       |

### Voice Events (voice.ts)

| Event          | Payload                                                           | Behavior                                                             |
| -------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `PLAY_SEGMENT` | `audioPath`, `segmentId`, `startMs`, `endMs`, `volume?`, `speed?` | Creates voice SoundCue with duck rule                                |
| `STOP_VOICE`   | `segmentId?`                                                      | Stops voice sounds. If `segmentId` provided, only stops that segment |

## Mixer Functions

### computeBusStates(audioState, frame)

Computes per-bus volume multipliers including ducking.

```typescript
const busStates = computeBusStates(audio, currentFrame);
// Returns: { music: { baseGain: 0.35, duckMultiplier: 0.15 }, ... }
```

### computeSoundVolume(sound, frame, busStates)

Computes final volume for a sound at a specific frame.

```typescript
const volume = computeSoundVolume(sound, frame, busStates);
// Considers: cue volume × bus gain × duck multiplier × envelope × fade
```

### computeCrossfade(outgoing, incoming, frame)

Computes crossfade volumes between two music beds.

```typescript
const { outVolume, inVolume } = computeCrossfade(outgoingBed, musicBed, frame);
// Uses configurable easing curve (default: easeInOut)
```

## Crossfade Curves

| Curve       | Formula         | Use Case             |
| ----------- | --------------- | -------------------- |
| `linear`    | `t`             | Quick cuts           |
| `easeIn`    | `t²`            | Slow start, fast end |
| `easeOut`   | `1 - (1-t)²`    | Fast start, slow end |
| `easeInOut` | `t² × (3 - 2t)` | Smooth (default)     |

## Policies

### Spam Prevention

Prevents rapid-fire duplicate sounds:

```typescript
const { allowed, updatedRecentSounds } = checkSpamPure(
  cue,
  recentSounds,
  currentFrame,
  { windowFrames: 3, maxPerWindow: 2 },
);
```

### Bus Concurrency

Enforces max concurrent sounds per bus:

```typescript
const { state, rejected } = enforceBusConcurrency(audioState, newCue);
// Evicts lowest-priority sounds if over limit
```

## Renderer Integration

### AudioLayer Component

```tsx
<AudioLayer
  world={worldState} // Contains audio state
  t={currentFrame} // Composition frame
  focusDeviceId="phone1" // Optional: filter by device
/>
```

### Performance Features

- `React.memo()` on all components
- `useCallback()` for volume functions
- `muted` prop instead of conditional rendering
- `premountFor={30}` on all sequences

### Volume Callback Pattern

```tsx
// Remotion-native approach for smooth volume changes
<Audio
  src={src}
  volume={(localFrame) => {
    const absoluteFrame = sound.startFrame + localFrame;
    return computeSoundVolume(sound, absoluteFrame, busStates);
  }}
/>
```

## Usage Examples

### Play a UI Sound

```typescript
const event: TimelineEvent = {
  kind: "AUDIO",
  type: "PLAY_SOUND",
  at: 150,
  soundId: "ui/tap.mp3",
  bus: "ui",
  volume: 0.8,
};
```

### Crossfade Music

```typescript
const event: TimelineEvent = {
  kind: "AUDIO",
  type: "CROSSFADE",
  at: 300,
  toSoundId: "music/dramatic.mp3",
  crossfadeDuration: 60, // 2 seconds at 30fps
};
```

### Voice with Ducking

```typescript
const voiceEvent: VoicePlaySegmentEvent = {
  type: "PLAY_SEGMENT",
  at: 100,
  audioPath: "voice/narrator_001.mp3",
  segmentId: "seg_001",
  startMs: 0,
  endMs: 5000,
  volume: 1.0,
  speed: 1.0,
  speaker: "Narrator",
  text: "Hello world",
};
// Automatically ducks music to 15%
```

### Stop Specific Voice Segment

```typescript
const stopEvent: VoiceStopEvent = {
  type: "STOP_VOICE",
  at: 250,
  segmentId: "seg_001", // Only stops this segment
};
```

## Determinism Guarantees

- **Frame-perfect**: Same input = same output, every time
- **No randomness**: All calculations are deterministic
- **Pure functions**: Mixer functions have no side effects
- **Immutable state**: `readonly` fields prevent accidental mutation

## Files

| File                       | Purpose                      |
| -------------------------- | ---------------------------- |
| `types/audio.ts`           | Type definitions             |
| `audio/mixer.ts`           | Volume calculations, ducking |
| `audio/music-bed.ts`       | Crossfade, easing curves     |
| `audio/policies.ts`        | Spam prevention, concurrency |
| `engine/handlers/audio.ts` | Audio event processing       |
| `engine/handlers/voice.ts` | Voice event processing       |
