# Audio System Guide

> **Synchronized sound effects and background music.**

---

## Overview

Tokovo's audio system provides:

- **Background Music (BGM)** - Looping tracks
- **Sound Effects (SFX)** - One-shot sounds
- **Volume Control** - Fading, crossfading
- **Auto Sounds** - Trigger on events
- **Bus Routing** - Music, SFX, UI, Voice

---

## DSL Audio API

```typescript
.audio(audio => {
    // Background music (spans)
    audio.span("0s", "30s").bgm("lofi_chill", { volume: 0.3 });
    
    // Sound effects (points)
    audio.at("5s").play("notification_ding");
    audio.at("10s").play("message_sent", { volume: 0.8 });
    
    // Transitions
    audio.at("20s").crossfade("lofi_chill", "epic_drums", "2s");
    audio.at("28s").fadeOut("epic_drums", "2s");
    
    // Ducking (lower music for voice)
    audio.at("15s").duck("music", { amount: 0.5, duration: "3s" });
})
```

---

## Audio Methods Reference

### span(start, end).bgm(trackId, options?)

Background music loop:

| Option | Type | Description |
|--------|------|-------------|
| `volume` | number | 0-1 |
| `loop` | boolean | Loop track (default: true) |

### at(time).play(soundId, options?)

One-shot sound effect:

| Option | Type | Description |
|--------|------|-------------|
| `volume` | number | 0-1 |
| `bus` | string | "sfx", "ui", "voice" |

### at(time).stop(trackId)

Stop a playing track.

### at(time).crossfade(from, to, duration)

Crossfade between tracks:

```typescript
audio.at("20s").crossfade("track_a", "track_b", "2s");
```

### at(time).fadeOut(trackId, duration)

Fade out track:

```typescript
audio.at("28s").fadeOut("background_music", "2s");
```

### at(time).duck(bus, options)

Lower a bus temporarily:

| Option | Type | Description |
|--------|------|-------------|
| `amount` | number | Reduce to this level (0.5 = 50%) |
| `duration` | string | How long to duck |

---

## Audio Buses

Route sounds to different buses:

| Bus | Purpose | Default Volume |
|-----|---------|----------------|
| `voice` | Voice messages | 1.0 |
| `sfx` | Sound effects | 0.8 |
| `ui` | UI clicks | 0.5 |
| `music` | Background music | 0.4 |

### Ducking Example

Lower music when voice plays:

```typescript
audio.at("10s").duck("music", { amount: 0.3, duration: "5s" });
audio.at("10s").play("voice_message", { bus: "voice" });
```

---

## Auto Sound Rules

Plugins define rules to play sounds automatically:

```typescript
// In plugin definition
audioRules: [
    {
        match: { kind: "APP", appId: "app_whatsapp", type: "MESSAGE_RECEIVED" },
        sound: "message_received",
        volume: 0.8,
        bus: "sfx"
    },
    {
        match: { kind: "APP", appId: "app_whatsapp", type: "MESSAGE_SENT" },
        sound: "message_sent",
        volume: 0.7,
        bus: "sfx"
    },
    {
        match: { kind: "KEYBOARD", type: "KEY_DOWN" },
        sound: "key_tap",
        volume: 0.3,
        bus: "ui"
    }
]
```

### Silent Events

Suppress sound for specific events:

```typescript
wa.at("5s").receive("Alex", "Quiet message", { silent: true });
```

---

## Sound Assets

Place sound files in public directory:

```
public/audio/
├── app_whatsapp/
│   ├── message_received.mp3
│   ├── message_sent.mp3
│   └── typing.mp3
├── music/
│   ├── lofi_chill.mp3
│   └── epic_drums.mp3
└── ui/
    ├── key_tap.mp3
    └── click.mp3
```

### Plugin Sound Declaration

```typescript
// In plugin
sounds: [
    { id: "message_received", url: "/audio/app_whatsapp/message_received.mp3" },
    { id: "message_sent", url: "/audio/app_whatsapp/message_sent.mp3" }
]
```

---

## Audio State

Audio state in WorldState:

```typescript
world.audio = {
    activeSounds: {
        "bgm_lofi": { soundId: "lofi_chill", volume: 0.3, isPlaying: true },
    },
    buses: {
        music: { baseGain: 1.0 },
        sfx: { baseGain: 1.0 },
        voice: { baseGain: 1.0 }
    },
    muted: false
};
```

---

## Remotion Integration

Tokovo uses Remotion's `<Audio>` component:

```tsx
import { Audio } from "remotion";

export const AudioLayer = ({ world }: { world: WorldState }) => (
    <>
        {Object.values(world.audio.activeSounds).map(sound => (
            <Audio
                key={sound.id}
                src={sound.url}
                volume={sound.volume}
                loop={sound.loop}
            />
        ))}
    </>
);
```

---

## Complete Example

```typescript
episode("dramatic-reveal", { fps: 30, duration: "45s" })
    .audio(audio => {
        // Atmospheric background
        audio.span("0s", "45s").bgm("tense_ambience", { volume: 0.2 });
        
        // Message sounds happen automatically via plugin rules
        
        // Music shift at climax
        audio.at("25s").crossfade("tense_ambience", "dramatic_reveal", "2s");
        
        // Duck music for important message
        audio.at("30s").duck("music", { amount: 0.3, duration: "5s" });
        
        // Fade out at end
        audio.at("40s").fadeOut("dramatic_reveal", "5s");
    })
    .build();
```
