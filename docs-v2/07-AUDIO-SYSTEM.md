# Audio System

> Synchronized sound effects and music

---

## Overview

Tokovo's audio system provides:

- **Automatic sounds** - Events trigger sounds via rules
- **Manual control** - Explicit sound playback
- **Volume management** - Ducking, fading
- **Bus routing** - voice, sfx, ui, music

---

## Audio Events

### PLAY_SOUND

```typescript
{
    at: 60,
    kind: "AUDIO",
    type: "PLAY_SOUND",
    payload: {
        soundId: "message_received",
        instanceId: "sound_001",    // For stopping later
        volume: 0.8,
        loop: false,
        deviceId: "phone"          // Optional
    }
}
```

### STOP_SOUND

```typescript
{
    at: 120,
    kind: "AUDIO",
    type: "STOP_SOUND",
    payload: {
        instanceId: "sound_001"
    }
}
```

### FADE_VOLUME

```typescript
{
    at: 90,
    kind: "AUDIO",
    type: "FADE_VOLUME",
    payload: {
        instanceId: "sound_001",
        toVolume: 0.3,
        duration: 30
    }
}
```

### BACKGROUND_MUSIC

```typescript
{
    at: 0,
    kind: "AUDIO",
    type: "BACKGROUND_MUSIC",
    payload: {
        soundId: "chill_bgm",
        volume: 0.4,
        loop: true
    }
}
```

---

## Auto Sound Rules

Plugins define rules to play sounds automatically:

```typescript
audioRules: [
    {
        match: { 
            kind: "APP", 
            appId: "app_whatsapp", 
            type: "MESSAGE_RECEIVED" 
        },
        sound: "message_received",
        volume: 0.8,
        bus: "sfx"
    },
    {
        match: { 
            kind: "APP", 
            appId: "app_whatsapp", 
            type: "MESSAGE_SENT" 
        },
        sound: "message_sent",
        volume: 0.7,
        bus: "sfx"
    },
    {
        match: { 
            kind: "KEYBOARD", 
            type: "KEY_DOWN" 
        },
        sound: "key_tap",
        volume: 0.3,
        bus: "ui"
    }
]
```

### Rule Matching

| Field | Description |
|-------|-------------|
| `kind` | Event kind to match |
| `type` | Event type (optional) |
| `appId` | App ID for APP events |
| `condition` | Custom function |

---

## Sound Assets

Place sound files in the public directory:

```
public/audio/
├── app_whatsapp/
│   ├── message_received.mp3
│   ├── message_sent.mp3
│   └── typing.mp3
├── app_twitter/
│   └── notification.mp3
└── ui/
    ├── key_tap.mp3
    └── click.mp3
```

### Declaring Assets

Plugins declare their sounds:

```typescript
assets: {
    sounds: {
        "message_received": "/audio/app_whatsapp/message_received.mp3",
        "message_sent": "/audio/app_whatsapp/message_sent.mp3",
        "typing": "/audio/app_whatsapp/typing.mp3"
    }
}
```

---

## Audio Buses

Route sounds to different buses:

| Bus | Purpose | Default Volume |
|-----|---------|----------------|
| `voice` | Voice messages | 1.0 |
| `sfx` | Sound effects | 0.8 |
| `ui` | UI clicks | 0.5 |
| `music` | Background music | 0.4 |

### Ducking

Lower music when voice plays:

```typescript
{
    at: 60,
    kind: "AUDIO",
    type: "DUCK",
    payload: {
        target: "music",
        amount: 0.5,     // Reduce to 50%
        duration: 90     // For 90 frames
    }
}
```

---

## Silent Events

Suppress sound for specific events:

```typescript
// In DSL
b.receive("Friend", "Hey!", { silent: true });

// Results in
{
    at: 60,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    silent: true,  // No sound played
    payload: { ... }
}
```

---

## Remotion Integration

Tokovo uses Remotion's `<Audio>` component:

```tsx
import { Audio } from "remotion";

export const AudioLayer = ({ world }: { world: WorldState }) => {
    return (
        <>
            {world.audio.activeSounds.map(sound => (
                <Audio
                    key={sound.instanceId}
                    src={sound.src}
                    volume={sound.volume}
                    startFrom={sound.startFrame}
                />
            ))}
        </>
    );
};
```
