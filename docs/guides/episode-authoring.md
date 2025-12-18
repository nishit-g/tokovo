# Episode Authoring Guide

> **Complete guide to creating Tokovo episodes.**

---

## Overview

Episodes are the core content unit. Each episode is:

- A single video
- Defined in one `.episode.ts` file
- Auto-discovered by the system

---

## Quick Start

### 1. Generate Episode

```bash
pnpm turbo gen episode
```

### 2. Create Manually

```typescript
// packages/episodes/src/production/my-episode.episode.ts
import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
    meta: {
        id: "my-episode",
        title: "My Episode",
        category: "production",
    },
    config: {
        format: "1080x1920",
        durationInFrames: 900,
        apps: ["app_whatsapp"],
    },
    build: () => episode("my-episode", { fps: 30, duration: "30s" })
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [{ id: "dm_alex", name: "Alex" }],
        })
        .track("app_whatsapp",
            () => new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder),
            wa => {
                wa.at("2s").receive("Alex", "Hey!");
                wa.at("4s").send("Hi!");
            }
        )
        .build(),
});
```

### 3. Add to Barrel

```typescript
// packages/episodes/src/production/index.ts
import "./my-episode.episode";
```

### 4. See in Remotion Studio

```bash
pnpm dev --filter=video-runner
# Open http://localhost:3000
# Episode appears in Production folder
```

---

## Episode Structure

```typescript
defineEpisode({
    // Metadata
    meta: {
        id: string;        // Unique kebab-case ID
        title: string;     // Display title
        description?: string;
        category: "production" | "showcase" | "test";
        tags?: string[];
    },
    
    // Video config
    config: {
        format: FormatId;           // "1080x1920" etc
        durationInFrames: number;   // fps × seconds
        apps: string[];             // Required plugins
    },
    
    // Build function (returns IR)
    build: () => TrackEpisodeIR
})
```

---

## Episode Builder API

### episode(id, config)

```typescript
episode("my-episode", {
    fps: 30,
    duration: "30s",
    title: "My Episode"
})
```

### .device(id, profile, options)

```typescript
.device("phone", "iphone16", {
    app: "app_whatsapp",
    conversations: [
        { id: "dm_alex", name: "Alex", avatar: "/avatars/alex.png" }
    ],
    os: {
        battery: 85,
        network: "5G",
        time: new Date("2024-01-01T10:30:00")
    }
})
```

### .track(trackId, factory, fn)

```typescript
.track("app_whatsapp",
    () => new WhatsAppTrackBuilder(30, "phone", "dm_alex", getOrder),
    wa => {
        wa.at("1s").receive("Alex", "Hello!");
        wa.span("2s", "4s").typing("me");
        wa.at("4s").send("Hi there!");
    }
)
```

### .camera(fn)

```typescript
.camera(cam => {
    cam.at("0s").set({ scale: 1 });
    cam.at("5s").animate({ scale: 1.2, duration: "0.5s" });
    cam.at("10s").focus("message[last]", { scale: 1.3 });
})
```

### .audio(fn)

```typescript
.audio(audio => {
    audio.span("0s", "30s").bgm("lofi_chill", { volume: 0.2 });
    audio.at("10s").play("dramatic_reveal");
})
```

### .mark(id, time) / .section(id, start, end)

```typescript
.mark("climax", "15s")
.section("intro", "0s", "10s")
.section("main", "10s", "25s")
```

### .build()

```typescript
.build()  // Returns TrackEpisodeIR
```

---

## Video Formats

| Format ID | Dimensions | FPS | Use Case |
|-----------|------------|-----|----------|
| `1080x1920` | 1080×1920 | 30 | TikTok, Reels |
| `1080x1920@60` | 1080×1920 | 60 | High-quality |
| `1920x1080` | 1920×1080 | 30 | YouTube |
| `1080x1080` | 1080×1080 | 30 | Instagram |
| `iphone-16-pro` | 1290×2796 | 60 | iPhone native |

---

## Categories

| Category | Folder | Purpose |
|----------|--------|---------|
| `production` | `src/production/` | Final videos |
| `showcase` | `src/showcases/` | Demos, examples |
| `test` | `src/tests/` | Testing |

---

## Conversation Setup

### Direct Message

```typescript
conversations: [
    { id: "dm_alex", name: "Alex", avatar: "/avatars/alex.png" }
]
```

### Group Chat

```typescript
conversations: [
    {
        id: "group_bros",
        name: "The Bros 🔥",
        type: "group",
        participants: ["Alex", "Sam", "Jordan"]
    }
]
```

---

## WhatsApp Events

| Method | Description |
|--------|-------------|
| `receive(sender, text)` | Receive message |
| `send(text)` | Send message |
| `typing(who).for(duration)` | Typing indicator |
| `span(start, end).typing(who)` | Typing span |
| `read(who)` | Read receipts |
| `online(who)` / `offline(who)` | Status |

---

## Complete Example

```typescript
import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
    meta: {
        id: "drama-episode",
        title: "The Confrontation",
        description: "A dramatic WhatsApp exchange",
        category: "production",
        tags: ["drama", "viral"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 1350,  // 45s at 30fps
        apps: ["app_whatsapp"],
    },
    build: () => episode("drama-episode", { fps: 30, duration: "45s", title: "The Confrontation" })
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [
                { id: "dm_sarah", name: "Sarah 💕", avatar: "/avatars/sarah.png" }
            ],
            os: { battery: 78, network: "5G" }
        })
        
        // Music
        .audio(audio => {
            audio.span("0s", "45s").bgm("tense_ambience", { volume: 0.2 });
        })
        
        // Camera
        .camera(cam => {
            cam.at("0s").set({ scale: 1 });
            cam.at("15s").animate({ scale: 1.15, duration: "0.5s" });
            cam.at("30s").reset({ duration: "0.5s" });
        })
        
        // Conversation
        .track("app_whatsapp",
            () => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder),
            wa => {
                // The confrontation
                wa.at("2s").receive("Sarah 💕", "We need to talk...");
                
                wa.span("5s", "8s").typing("me");
                wa.at("8s").send("What's wrong?");
                
                wa.span("10s", "13s").typing("Sarah 💕");
                wa.at("13s").receive("Sarah 💕", "I saw your Insta story 👀");
                wa.at("15s").receive("Sarah 💕", "Who was that??");
                
                // The relief
                wa.span("18s", "22s").typing("me");
                wa.at("22s").send("That's my cousin! She's visiting 😅");
                
                wa.at("26s").receive("Sarah 💕", "Omg I'm so sorry 😂😂");
                wa.at("28s").send("Haha it's fine babe ❤️");
                
                wa.at("32s").read("Sarah 💕");
            }
        )
        
        // Markers
        .section("confrontation", "0s", "18s")
        .section("resolution", "18s", "35s")
        
        .build(),
});
```

---

## Best Practices

1. **ID = filename** - `my-episode.episode.ts` → `id: "my-episode"`
2. **Duration = fps × seconds** - 30fps × 30s = 900 frames
3. **Always add to barrel** - Import in `index.ts`
4. **Use format templates** - Don't hardcode dimensions
5. **Order matters** - Use `getOrder()` for declaration order
