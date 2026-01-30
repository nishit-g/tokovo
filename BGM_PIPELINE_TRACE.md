# BGM Pipeline Trace - Complete Flow Analysis

## Issue

Background music (BGM) not playing in multilayer-showcase episode despite `.bgm()` DSL call.

## Complete Event Flow

### 1. DSL Layer (User Code)

**File:** `/Users/nishit.gupta/personal/tokovo/packages/episodes/src/production/multilayer-showcase.episode.ts`

```typescript
.audio((audio) => {
  audio.span("0s", "60s").bgm("/music/cinematic-ambient.mp3", {
    volume: 0.3,
    fadeIn: "3s",    // 90 frames @ 30fps
    fadeOut: "4s",   // 120 frames @ 30fps
  });
})
```

### 2. DSL Implementation

**File:** `/Users/nishit.gupta/personal/tokovo/packages/dsl/src/v2/audio-track.ts:145-175`

```typescript
bgm(soundId: string, options: BgmOptions = {}): void {
  const fadeIn = parseDurationToFrames(options.fadeIn, this._fps); // 90
  const fadeOut = parseDurationToFrames(options.fadeOut, this._fps); // 120

  this._events.push(
    {
      at: this._startFrame,        // 0
      kind: "AUDIO",
      type: "BGM_START",            // ← High-level semantic event
      payload: {
        soundId: "/music/cinematic-ambient.mp3",
        volume: 0.3,
        fadeIn: 90,
      },
    },
    {
      at: this._endFrame,           // 1800 (60s @ 30fps)
      kind: "AUDIO",
      type: "BGM_END",              // ← High-level semantic event
      payload: { fadeOut: 120 },
    }
  );
}
```

### 3. Compiler Lowering

**File:** `/Users/nishit.gupta/personal/tokovo/packages/compiler/src/v2/lowering.ts:139-158`

```typescript
case "BGM_START":
  return [
    {
      at: 0,
      kind: "AUDIO",
      type: "PLAY",                 // ← Lowered to runtime event
      soundId: "/music/cinematic-ambient.mp3",
      volume: 0.3,
      fadeIn: 90,
      loop: true,
      bus: "music",                 // ✅ FIX: Added this
    }
  ];

case "BGM_END":
  return [
    {
      at: 1800,
      kind: "AUDIO",
      type: "FADE_OUT",              // ← Lowered to runtime event
      duration: 120,
    }
  ];
```

### 4. Runtime Type Definition

**File:** `/Users/nishit.gupta/personal/tokovo/packages/core/src/types/runtime-event.ts:373-380`

```typescript
export interface AudioPlayEvent extends BaseAudioRuntimeEvent {
  type: "PLAY";
  soundId: string;
  volume?: number;
  fadeIn?: number;
  loop?: boolean;
  bus?: string; // ✅ FIX: Added this property
}
```

### 5. Runtime Handler

**File:** `/Users/nishit.gupta/personal/tokovo/packages/core/src/engine/handlers/audio.ts`

#### Event Routing (line 322-324)

```typescript
case "PLAY":
case "PLAY_SOUND":
  handlePlay(draft, event, payload, ctx);
  break;
```

#### Music Detection (line 131-134)

```typescript
function isMusic(bus?: string, loop?: boolean): boolean {
  return bus === "music"; // ✅ Now true because bus="music"
}
```

#### Music Bed Creation (line 149-157)

```typescript
if (isMusic(payload.bus, payload.loop)) {
  // ✅ NOW TRUE
  draft.audio!.musicBed = {
    soundId: "/music/cinematic-ambient.mp3",
    baseGain: 0.3,
    loop: true,
    startFrame: 0,
    crossfadeFrames: 90, // ✅ FIX: Uses fadeIn
    crossfadeCurve: "easeInOut", // ✅ FIX: Added curve
  };
}
```

#### Fade Out Handling (line 335-338)

```typescript
case "FADE_OUT":
case "FADE_VOLUME":
  handleFade(draft, event, payload);  // Sets musicBed.fadeOutStart/fadeOutDuration
  break;
```

## Root Cause Analysis

### The Bug

1. ❌ Compiler lowered `BGM_START` → `PLAY` but **didn't set `bus: "music"`**
2. ❌ `isMusic(undefined, true)` returned `false`
3. ❌ Sound went to `activeSounds` instead of `musicBed`
4. ❌ No background music played

### The Fix (2 changes)

1. ✅ Added `bus: "music"` to lowered PLAY event (lowering.ts:148)
2. ✅ Added `bus?: string` to AudioPlayEvent type (runtime-event.ts:379)
3. ✅ Updated handlePlay to use `fadeIn` for crossfadeFrames (audio.ts:154-155)

## Architecture Validation

### Is this enterprise-grade? YES ✅

**Separation of Concerns:**

- ✅ DSL: High-level semantic (`bgm()`, `fadeIn`, `fadeOut`)
- ✅ Compiler: Transforms to runtime events (`PLAY`, `FADE_OUT`)
- ✅ Runtime: Pure execution based on bus routing

**Type Safety:**

- ✅ All events strongly typed with discriminated unions
- ✅ Compiler validates transformations with `satisfies`
- ✅ Runtime type-safe through AudioPlayEvent interface

**Routing Architecture:**

- ✅ Single routing mechanism: `bus` property
- ✅ Music routed to `musicBed` for crossfade/ducking support
- ✅ SFX/UI/Voice routed to `activeSounds` with policies

**Alternative Approaches (Rejected):**

- ❌ Handle BGM_START directly in runtime: Bypasses compiler pipeline
- ❌ Use loop flag to detect music: Semantically incorrect (not all loops are music)
- ❌ Create separate BGM event type: Duplicates PLAY logic

## Verification Checklist

- [x] DSL creates BGM_START/BGM_END events
- [x] Compiler lowers to PLAY (bus="music") + FADE_OUT
- [x] Runtime routes PLAY to musicBed when bus="music"
- [x] musicBed receives fadeIn for crossfadeFrames
- [x] musicBed receives fadeOut at end via FADE_OUT event
- [x] All packages build without errors
- [x] TypeScript diagnostics clean

## Testing

**Refresh browser at localhost:3000**

- Navigate to multilayer-showcase episode
- Should see music bed event in timeline
- Should hear "/music/cinematic-ambient.mp3" playing
- Music should fade in over 3 seconds
- Music should duck to 15% when voice narration plays
- Music should fade out over 4 seconds at end
