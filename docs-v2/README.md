# Tokovo Documentation

> **Version**: 2.0 (Enterprise Architecture)  
> **Last Updated**: December 2025

---

## What is Tokovo?

Tokovo is an **enterprise-grade video generation platform** for creating realistic mobile phone mockup videos. It renders interactive phone UI simulations—messaging apps, notifications, calls, and more—into production-quality video content.

### Key Features

- 📱 **Realistic Phone Simulations** - iOS/Android mockups with pixel-perfect UI
- 💬 **Messaging Apps** - WhatsApp, iMessage, Instagram, Twitter
- 🎬 **Cinematic Camera** - Zoom, pan, shake, focus effects
- 🔊 **Synchronized Audio** - Message sounds, typing, notifications
- ⌨️ **Keyboard Simulation** - Realistic typing with key presses
- 🔌 **Plugin Architecture** - Extend with new apps easily

---

## Quick Start

```typescript
import { episode, prepareEpisode, runEpisode } from "@tokovo/core";
import { compile } from "@tokovo/compiler";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";

// 1. Define your episode
const myEpisode = episode("demo", ep => {
    ep.device("phone", d => {
        d.whatsapp("dm_sarah", ctx => {
            ctx.receive("Sarah", "Hey! What's up?");
            ctx.send("Not much, just chilling 😊");
        });
    });
});

// 2. Compile and prepare
const compiled = prepareEpisode(myEpisode, [WhatsAppPlugin]);

// 3. Render at any frame
const worldAtFrame60 = runEpisode(compiled, 60);
```

---

## Documentation Structure

| Document | Description |
|----------|-------------|
| [Architecture Overview](./01-ARCHITECTURE.md) | System design and data flow |
| [Getting Started](./02-GETTING-STARTED.md) | Installation and first episode |
| [DSL Reference](./03-DSL-REFERENCE.md) | Complete DSL API reference |
| [Plugin Development](./04-PLUGIN-DEVELOPMENT.md) | Creating custom app plugins |
| [Event System](./05-EVENT-SYSTEM.md) | RuntimeEvent schema and types |
| [Camera System](./06-CAMERA-SYSTEM.md) | Cinematic camera controls |
| [Audio System](./07-AUDIO-SYSTEM.md) | Sound effects and music |
| [Keyboard System](./08-KEYBOARD-SYSTEM.md) | Typing simulation |
| [Renderer](./09-RENDERER.md) | React components and rendering |
| [Best Practices](./10-BEST-PRACTICES.md) | Patterns and anti-patterns |

---

## Core Concepts

### The Pipeline

```
DSL Author → SceneIR → Compiler → TimelineOps → Lowering → RuntimeEvents → Engine → WorldState → Renderer
```

### The Golden Rule

```typescript
// THE ONLY WAY TO RENDER:
const compiled = prepareEpisode(myEpisode, plugins);
const world = runEpisode(compiled, frame);
<TokovoRenderer world={world} />
```

**Never bypass the pipeline.** Always use `prepareEpisode()` → `runEpisode()`.

---

## Package Structure

```
packages/
├── @tokovo/core         # Engine, types, reducers
├── @tokovo/dsl          # Author-facing DSL
├── @tokovo/ir           # Intermediate representation
├── @tokovo/compiler     # SceneIR → TimelineOps
├── @tokovo/renderer     # React rendering components
├── @tokovo/apps-whatsapp # WhatsApp plugin
├── @tokovo/apps-twitter  # Twitter plugin
└── @tokovo/episodes     # Example episodes
```

---

## Design Principles

1. **Determinism** - Same episode → identical render every time
2. **Type Safety** - Full TypeScript, no `any` in public APIs
3. **Plugin Isolation** - Core knows nothing about specific apps
4. **Single Entry Point** - `prepareEpisode()` is the only path
5. **Event-Driven** - All state changes via RuntimeEvents
