# Getting Started

> Installation or bootstrapping an episode from scratch

---

## Prerequisites

- Node.js 18+
- TypeScript 5+
- Remotion 4+ (for video rendering)

---

## Installation

### In Existing Project

```bash
npm install @tokovo/core @tokovo/dsl @tokovo/compiler @tokovo/renderer
npm install @tokovo/apps-whatsapp  # Optional: WhatsApp plugin
```

### New Project with Remotion

```bash
npx create-video@latest my-tokovo-project
cd my-tokovo-project

npm install @tokovo/core @tokovo/dsl @tokovo/compiler @tokovo/renderer
npm install @tokovo/apps-whatsapp
```

---

## Your First Episode

### 1. Create Episode File

Create `src/episodes/hello.episode.ts`:

```typescript
import { episode } from "@tokovo/dsl";

export const helloEpisode = episode("hello-world", ep => {
    ep.config({ fps: 30 });

    ep.device("phone", d => {
        d.platform("ios");
        d.app("app_whatsapp");
        
        d.conversation("dm_friend", {
            name: "Friend",
            type: "dm"
        });

        d.beat("greeting", b => {
            b.receive("Friend", "Hey! 👋");
            b.wait("500ms");
            b.send("Hello! How are you?");
        });
    });
});
```

### 2. Create Video Component

Create `src/HelloVideo.tsx`:

```tsx
import { useCurrentFrame } from "remotion";
import { prepareEpisode, runEpisode, setCompiler } from "@tokovo/core";
import { compile } from "@tokovo/compiler";
import { TokovoRenderer } from "@tokovo/renderer";
import { WhatsAppPluginV2 } from "@tokovo/apps-whatsapp";
import { helloEpisode } from "./episodes/hello.episode";

// Initialize compiler (once)
setCompiler(compile);

// Compile episode (outside component for performance)
const compiled = prepareEpisode(helloEpisode, [WhatsAppPluginV2]);

export const HelloVideo = () => {
    const frame = useCurrentFrame();
    const world = runEpisode(compiled, frame);
    
    return <TokovoRenderer world={world} />;
};
```

### 3. Register Composition

In `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { HelloVideo } from "./HelloVideo";

export const RemotionRoot = () => {
    return (
        <Composition
            id="HelloWorld"
            component={HelloVideo}
            durationInFrames={300}
            fps={30}
            width={1080}
            height={1920}
        />
    );
};
```

### 4. Preview

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
my-tokovo-project/
├── src/
│   ├── Root.tsx              # Remotion root
│   ├── episodes/
│   │   └── hello.episode.ts  # Episode definitions
│   └── videos/
│       └── HelloVideo.tsx    # Video components
├── public/
│   └── audio/                # Sound effects
│       └── app_whatsapp/
│           ├── message_received.mp3
│           └── message_sent.mp3
└── package.json
```

---

## Adding More Features

### Multiple Conversations

```typescript
ep.device("phone", d => {
    d.conversation("dm_alice", { name: "Alice", type: "dm" });
    d.conversation("dm_bob", { name: "Bob", type: "dm" });
    
    d.beat("multi", b => {
        b.receive("Alice", "Hey!");
        b.wait("500ms");
        b.receive("Bob", "Yo!");
    });
});
```

### Camera Effects

```typescript
d.beat("dramatic", b => {
    b.camera(c => {
        c.zoom(1.2, { duration: "0.5s" });
    });
    
    b.receive("Friend", "I have news...");
    
    b.camera(c => {
        c.focus("lastMessage");
    });
});
```

### Typing Indicators

```typescript
d.beat("reply", b => {
    b.typing("Friend").for("2s");
    b.receive("Friend", "Finally!");
});
```

---

## Next Steps

1. **[DSL Reference](./03-DSL-REFERENCE.md)** - All DSL methods
2. **[Event System](./05-EVENT-SYSTEM.md)** - How events work
3. **[Camera System](./06-CAMERA-SYSTEM.md)** - Cinematic effects
4. **[Plugin Development](./04-PLUGIN-DEVELOPMENT.md)** - Custom apps
