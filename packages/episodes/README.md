# @tokovo/episodes

> **Enterprise Episode Management with Zero-File Auto-Discovery**

Create video episodes by writing a single `.episode.ts` file. Episodes automatically appear in Remotion Studio without any manual registration.

---

## Quick Start

```bash
# Create a new episode (coming soon)
pnpm turbo gen episode

# Or manually create in production/
touch packages/episodes/src/production/my-episode.episode.ts
```

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
    build: () => episode("my-episode", { fps: 30, duration: "30s", title: "My Episode" })
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [{ id: "dm_contact", name: "Contact", avatar: "" }],
        })
        .track("app_whatsapp",
            () => new WhatsAppTrackBuilder(30, "phone", "dm_contact", getOrder),
            wa => {
                wa.at("1s").receive("Contact", "Hello!");
                wa.at("3s").send("Hi there!");
            }
        )
        .build(),
});
```

```bash
# Add to production/index.ts
echo 'import "./my-episode.episode";' >> packages/episodes/src/production/index.ts

# Restart dev server - episode appears automatically!
```

---

## Package Structure

```
packages/episodes/src/
├── index.ts              # Main exports (registry, types, templates)
├── schema.ts             # Zod schemas for episode content validation
│
├── registry/             # Auto-discovery system
│   ├── index.ts
│   └── episode-registry.ts
│
├── types/                # Episode type definitions
│   ├── index.ts
│   └── episode-definition.ts
│
├── templates/            # Video format presets
│   ├── index.ts
│   └── formats.ts
│
├── production/           # Production-ready episodes
│   ├── index.ts          # Import to register all
│   ├── track-demo.episode.ts
│   └── bakchodi-bros.episode.ts
│
├── showcases/            # Demo/feature showcase episodes
│   └── index.ts
│
├── tests/                # Test episodes
│   └── index.ts
│
└── legacy/               # Old V1 episodes (not auto-imported)
    └── *.episode.ts
```

---

## Core Concepts

### 1. `defineEpisode()` - Auto-Registration

```typescript
import { defineEpisode } from "@tokovo/episodes";

export default defineEpisode({
    meta: { ... },    // Display info
    config: { ... },  // Video settings
    build: () => ..., // Episode content
});
```

When this file is imported, the episode is automatically registered with the global registry.

### 2. Episode Registry

```typescript
import { episodeRegistry } from "@tokovo/episodes";

// Get all episodes
const all = episodeRegistry.all();

// Filter by category
const production = episodeRegistry.filter({ category: "production" });
const showcases = episodeRegistry.filter({ category: "showcase" });
const tests = episodeRegistry.filter({ category: "test" });

// Get specific episode
const ep = episodeRegistry.get("my-episode");
```

### 3. Format Templates

```typescript
import { getFormat, FORMATS, listFormats } from "@tokovo/episodes";

// Available formats
const formats = listFormats();
// ["1080x1920", "1080x1920@60", "1080x1080", "1920x1080", "3840x2160", "iphone-16-pro", "iphone-15", "pixel-8"]

// Get format details
const format = getFormat("1080x1920");
// { width: 1080, height: 1920, fps: 30, name: "Portrait HD" }

// Use in episode
defineEpisode({
    config: {
        format: "1080x1920",  // or "iphone-16-pro"
        // ...
    },
});
```

---

## Episode Categories

| Category | Folder | Purpose |
|----------|--------|---------|
| `production` | `production/` | Real content for release |
| `showcase` | `showcases/` | Feature demonstrations |
| `test` | `tests/` | Quality assurance |

Episodes are organized into Remotion Studio folders based on category:

```
Remotion Studio
├── Production/          ← production category
│   ├── track-demo-v2
│   └── bakchodi-bros
├── Showcases/           ← showcase category
└── Tests/               ← test category
```

---

## Episode Definition Schema

```typescript
interface EpisodeDefinition {
    meta: {
        id: string;                                  // Unique kebab-case ID
        title: string;                               // Display name
        description?: string;                        // What it shows
        category: "production" | "showcase" | "test";
        tags?: string[];                             // For filtering
        thumbnail?: string;                          // Preview image path
    };
    config: {
        format: FormatId | CustomFormat;             // Video dimensions
        durationInFrames: number;                    // Total frames
        apps: string[];                              // Required plugins
    };
    build: () => TrackEpisodeIR;                    // Content builder
}

// Custom format if needed
interface CustomFormat {
    width: number;
    height: number;
    fps: number;
}
```

---

## Video-Runner Integration

The `video-runner` app automatically loads episodes:

```typescript
// apps/video-runner/src/Root.tsx

// Import episode folders (side-effect: auto-registers)
import "@tokovo/episodes/src/production";
import "@tokovo/episodes/src/showcases";
import "@tokovo/episodes/src/tests";

// Registry now contains all episodes
const production = episodeRegistry.filter({ category: "production" });
```

---

## Available Formats

| Format ID | Dimensions | FPS | Use Case |
|-----------|------------|-----|----------|
| `1080x1920` | 1080×1920 | 30 | TikTok, Reels, Shorts |
| `1080x1920@60` | 1080×1920 | 60 | High-quality portrait |
| `1080x1080` | 1080×1080 | 30 | Instagram feed |
| `1920x1080` | 1920×1080 | 30 | YouTube landscape |
| `3840x2160` | 3840×2160 | 30 | 4K content |
| `iphone-16-pro` | 1290×2796 | 60 | iPhone 16 Pro native |
| `iphone-15` | 1179×2556 | 60 | iPhone 15 native |
| `pixel-8` | 1080×2400 | 60 | Pixel 8 native |

---

## Legacy Episodes (V1)

Legacy episodes using the beat-based DSL are in `legacy/` and are **not auto-imported**.

```typescript
// V1 Pattern (DEPRECATED)
episode("name", ep => {
    ep.beat("opening", b => {
        b.send("message");  // Old API
    });
});

// V2 Pattern (USE THIS)
episode("name", { fps: 30, duration: "30s" })
    .track("app_whatsapp", () => builder, wa => {
        wa.at("1s").send("message");  // Track-based API
    })
    .build();
```

Do NOT use V1 episodes in new code. Migrate them to V2 when needed.

---

## API Reference

### Exports from `@tokovo/episodes`

```typescript
// Registry
export { episodeRegistry, EpisodeRegistry } from "./registry";

// Types
export { defineEpisode } from "./types";
export type { EpisodeMeta, EpisodeConfig, EpisodeDefinition, FormatId, CustomFormat } from "./types";
export { EpisodeMetaSchema, EpisodeConfigSchema, EpisodeDefinitionSchema } from "./types";

// Formats
export { FORMATS, getFormat, listFormats, getFormatsByAspectRatio } from "./templates";
export type { VideoFormat } from "./templates";

// Schema (Zod validators)
export * from "./schema";
```

---

## Creating New Episodes

### Step 1: Create Episode File

```bash
touch packages/episodes/src/production/my-awesome-episode.episode.ts
```

### Step 2: Define Episode

```typescript
import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl/src/v2";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
    meta: {
        id: "my-awesome-episode",
        title: "My Awesome Episode",
        description: "Shows amazing things",
        category: "production",
        tags: ["whatsapp", "demo"],
    },
    config: {
        format: "1080x1920",
        durationInFrames: 900,
        apps: ["app_whatsapp"],
    },
    build: () => episode("my-awesome-episode", {
        fps: 30,
        duration: "30s",
        title: "My Awesome Episode",
    })
        .device("phone", "iphone16", {
            app: "app_whatsapp",
            conversations: [
                { id: "dm_friend", name: "Friend", avatar: "/avatars/friend.png" },
            ],
        })
        .track("app_whatsapp",
            () => new WhatsAppTrackBuilder(30, "phone", "dm_friend", getOrder),
            wa => {
                wa.at("1s").receive("Friend", "Hey! How's it going?");
                wa.span("3s", "5s").typing("me");
                wa.at("5s").send("Great! Just testing Tokovo 🚀");
                wa.at("7s").receive("Friend", "That's awesome!");
            }
        )
        .camera(cam => {
            cam.at("5s").animate({ scale: 1.1, duration: "0.3s" });
        })
        .build(),
});
```

### Step 3: Register in Barrel

```typescript
// packages/episodes/src/production/index.ts
import "./track-demo.episode";
import "./bakchodi-bros.episode";
import "./my-awesome-episode.episode";  // Add this line
```

### Step 4: Restart Dev Server

```bash
npx turbo dev --filter=video-runner
```

Episode appears in Remotion Studio under "Production" folder!

---

## Best Practices

1. **Use Format Templates** - Don't hardcode dimensions, use `format: "1080x1920"`
2. **Unique IDs** - Episode IDs must be unique and kebab-case
3. **Category Matters** - Use appropriate category for organization
4. **Duration = fps × seconds** - `durationInFrames: 900` = 30fps × 30s
5. **Order Counter** - Always use `getOrder()` for event ordering
6. **Add to Barrel** - Don't forget to import in `index.ts`

---

## See Also

- [EPISODE-ARCH.md](../../docs-v2/EPISODE-ARCH.md) - Full architecture documentation
- [DSL Reference](../../docs-v2/03-DSL-REFERENCE.md) - V2 DSL API
- [@tokovo/dsl](../dsl/README.md) - DSL package
