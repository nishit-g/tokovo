# @tokovo/core

Core engine for Tokovo - deterministic phone simulator for video production.

## Features

- **Engine**: Frame-perfect event replay with deterministic state management
- **Types**: Comprehensive TypeScript types for WorldState, TimelineEvent, Device, etc.
- **Registry**: Plugin system via ReducerRegistry for extensibility
- **Audio**: Enterprise-grade audio engine with buses, ducking, crossfade, and policies

## Installation

```bash
pnpm add @tokovo/core
```

## Quick Start

```typescript
import {
  WorldState,
  TimelineEvent,
  processEvent,
  AudioState,
  SoundCue,
} from "@tokovo/core";

// Create initial state
const initialState: WorldState = {
  devices: {},
  audio: DEFAULT_AUDIO_STATE,
};

// Process events to build state
const nextState = processEvent(state, event, context);
```

## Audio System

Full documentation: [docs/AUDIO.md](./docs/AUDIO.md)

### Core Concepts

| Concept      | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| **SoundCue** | Individual sound with volume, bus, priority, envelope, ducking  |
| **MusicBed** | Background music with crossfade and mood tagging                |
| **AudioBus** | Routing channels: `music`, `ui`, `sfx`, `voice`, `master`       |
| **Ducking**  | Auto-lower one bus when another plays (e.g., voice ducks music) |
| **Policies** | Spam prevention and concurrency limits                          |

### Example: Play Sound

```typescript
const event: TimelineEvent = {
  kind: "AUDIO",
  type: "PLAY_SOUND",
  at: 100,
  soundId: "ui/notification.mp3",
  bus: "ui",
  volume: 0.8,
};
```

### Example: Voice with Ducking

```typescript
const voiceEvent: VoicePlaySegmentEvent = {
  type: "PLAY_SEGMENT",
  at: 100,
  audioPath: "voice/narrator.mp3",
  segmentId: "seg_001",
  startMs: 0,
  endMs: 5000,
};
// Voice automatically ducks music to 15%
```

### Example: Music Crossfade

```typescript
const crossfadeEvent: TimelineEvent = {
  kind: "AUDIO",
  type: "CROSSFADE",
  at: 300,
  toSoundId: "music/dramatic.mp3",
  crossfadeDuration: 60,
};
```

## Package Structure

```
src/
├── audio/           # Audio engine
│   ├── mixer.ts     # Volume calculations, ducking
│   ├── music-bed.ts # Crossfade, easing curves
│   └── policies.ts  # Spam prevention, concurrency
├── engine/          # Event processing
│   ├── handlers/    # Event handlers by type
│   └── replay.ts    # State machine
├── types/           # TypeScript definitions
│   ├── audio.ts     # Audio types
│   ├── device.ts    # Device types
│   └── layout.ts    # Layout types
└── registry/        # Plugin system
```

## Types

| Type            | Purpose                               |
| --------------- | ------------------------------------- |
| `WorldState`    | Complete application state at a frame |
| `TimelineEvent` | Event to be processed at a frame      |
| `SoundCue`      | Active sound with mixing metadata     |
| `MusicBed`      | Background music configuration        |
| `AudioState`    | Complete audio state                  |
| `DeviceState`   | Individual device state               |

## License

Private - All rights reserved.
