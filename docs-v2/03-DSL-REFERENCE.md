# DSL Reference

> Complete API reference for the Tokovo DSL

---

## Overview

The Tokovo DSL (Domain-Specific Language) provides a fluent, type-safe API for authoring episodes. It's designed to be:

- **Readable** - Code reads like a script
- **Type-safe** - Full TypeScript support
- **Composable** - Nest operations naturally
- **Extensible** - Plugins add custom actions

---

## Core Builders

### episode()

Creates a new episode:

```typescript
import { episode } from "@tokovo/dsl";

const myEpisode = episode("unique-id", ep => {
    ep.config({ fps: 30, aspectRatio: "9:16" });
    ep.device("phone", d => { ... });
});
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fps` | number | 30 | Frames per second |
| `aspectRatio` | string | "9:16" | Output aspect ratio |
| `duration` | string | auto | Episode duration |

---

### device()

Registers a device in the episode:

```typescript
ep.device("phone", d => {
    d.platform("ios");
    d.app("app_whatsapp");
    d.conversation("dm_sarah", { name: "Sarah ❤️", type: "dm" });
    d.beat("intro", b => { ... });
});
```

**Device Options:**

| Option | Type | Description |
|--------|------|-------------|
| `platform` | "ios" \| "android" | Device platform |
| `model` | string | Device model (e.g., "iphone_16_pro") |
| `app` | string | Initial foreground app |

---

### conversation()

Declares a conversation on the device:

```typescript
d.conversation("dm_sarah", {
    name: "Sarah ❤️",
    type: "dm",
    avatar: "/avatars/sarah.jpg",
    participants: ["sarah"]
});

d.conversation("family_group", {
    name: "Family Group 👨‍👩‍👧‍👦",
    type: "group",
    members: [
        { id: "mom", name: "Mom", avatar: "/avatars/mom.jpg" },
        { id: "dad", name: "Dad", avatar: "/avatars/dad.jpg" }
    ]
});
```

---

### beat()

A beat is a named sequence of actions:

```typescript
d.beat("intro", b => {
    b.receive("Sarah", "Hey! What's up?");
    b.wait("1s");
    b.send("Not much, just chilling 😊");
});
```

Beats are compiled in order. The compiler calculates frame numbers automatically.

---

## Message Actions

### b.receive()

Receive a message from someone:

```typescript
b.receive("Sarah", "Hey there!");
b.receive("Sarah", "How are you?", { 
    mood: "friendly",
    intensity: 0.5 
});
```

### b.send()

Send a message (from the device owner):

```typescript
b.send("I'm good, thanks!");
b.send("Check this out", { 
    replyTo: previousMessage 
});
```

### b.typing()

Show typing indicator:

```typescript
b.typing("Sarah").for("2s");
// or
b.typingStart("Sarah");
b.wait("2s");
b.typingEnd("Sarah");
```

---

## Media Actions

### b.sendImage() / b.receiveImage()

```typescript
b.sendImage("/images/photo.jpg", { 
    caption: "Look at this!",
    height: 300 
});

b.receiveImage("Sarah", "/images/selfie.jpg", {
    caption: "Here's a pic"
});
```

### b.sendVideo() / b.receiveVideo()

```typescript
b.sendVideo("/videos/clip.mp4", 15, {
    thumbnailUrl: "/thumbnails/clip.jpg",
    caption: "Watch this"
});
```

### b.sendGif() / b.receiveGif()

```typescript
b.receiveGif("Sarah", "https://giphy.com/...", {
    height: 200
});
```

### b.sendVoice() / b.receiveVoice()

```typescript
b.receiveVoice("Sarah", 45);  // 45 seconds
b.sendVoice(30);
```

---

## The b.use() Pattern

For app-scoped operations, use `b.use()`:

```typescript
d.beat("intro", b => {
    // Get app-scoped API
    const wa = b.use("app_whatsapp");
    
    // All operations scoped to WhatsApp
    wa.receive("dm_sarah", { from: "Sarah", text: "Hey!" });
    wa.send("dm_sarah", { text: "Hi there!" });
    wa.typing("dm_sarah", "Sarah", "2s");
});
```

**Benefits:**
- Explicit app context
- Type-safe per-app APIs
- No namespace collisions
- Works with any plugin

---

## Camera Actions

### b.camera()

Access camera controls within a beat:

```typescript
b.camera(c => {
    c.zoom(1.2, { duration: "0.5s", easing: "easeOut" });
    c.pan(0, 50, { duration: "1s" });
    c.shake(0.3, { duration: "0.5s" });
    c.focus("lastMessage");
    c.reset();
});
```

### Camera Methods

| Method | Description |
|--------|-------------|
| `zoom(scale, opts)` | Zoom to scale (1.0 = normal) |
| `pan(x, y, opts)` | Pan by x,y pixels |
| `shake(intensity, opts)` | Camera shake effect |
| `focus(anchor)` | Focus on semantic anchor |
| `reset()` | Reset to default view |

---

## Wait & Timing

### b.wait()

Pause execution:

```typescript
b.wait("1s");      // 1 second
b.wait("500ms");   // 500 milliseconds
b.wait("30f");     // 30 frames
```

### Concurrent Actions

Execute actions simultaneously:

```typescript
b.concurrent([
    track => {
        track.typing("Sarah").for("3s");
    },
    track => {
        track.wait("2s");
        track.receive("Mom", "Call me!");
    }
]);
```

---

## Semantic Annotations

Add meaning to actions for Director AI:

```typescript
b.receive("Sarah", "I love you", {
    mood: "romantic",
    intensity: 0.9,
    secrecy: "high",
    subtext: "Confession moment"
});
```

**Available Annotations:**

| Annotation | Type | Description |
|------------|------|-------------|
| `mood` | string | Emotional mood (romantic, tense, angry, etc.) |
| `intensity` | 0-1 | Importance level |
| `secrecy` | low/medium/high | Privacy level |
| `urgency` | 0-1 | Time pressure |
| `subtext` | string | Hidden meaning |

---

## Complete Example

```typescript
import { episode } from "@tokovo/dsl";

export const whatsappDemo = episode("whatsapp-demo", ep => {
    ep.config({ fps: 30 });

    ep.device("phone", d => {
        d.platform("ios");
        d.app("app_whatsapp");
        
        d.conversation("dm_sarah", {
            name: "Sarah ❤️",
            type: "dm",
            avatar: "/avatars/sarah.jpg"
        });

        d.beat("intro", b => {
            b.receive("Sarah", "Hey! Are you free tonight?", {
                mood: "excited"
            });
            b.wait("500ms");
            
            b.camera(c => {
                c.zoom(1.1, { duration: "0.3s" });
            });
            
            b.typing("me").for("1s");
            b.send("Yeah! What did you have in mind?");
        });

        d.beat("reply", b => {
            b.typing("Sarah").for("2s");
            b.receive("Sarah", "Let's go to that new restaurant!");
            
            b.camera(c => {
                c.focus("lastMessage");
            });
        });
    });
});
```
