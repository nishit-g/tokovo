This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: *.md
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  video-runner/
    public/
      assets/
        iphone16/
          frame.png
          mask.png
    src/
      AndroidVideo.tsx
      index.ts
      InstagramVideo.tsx
      Root.tsx
      Video.tsx
    package.json
    remotion.config.ts
    tsconfig.json
packages/
  apps-instagram/
    src/
      index.ts
      runtime.ts
      ui.tsx
    package.json
    tsconfig.json
  apps-whatsapp/
    src/
      index.ts
      runtime.ts
      types.ts
      TypingBubble.tsx
      ui.tsx
    package.json
    README.md
    tsconfig.json
  core/
    src/
      engine.ts
      index.ts
      types.ts
    package.json
    README.md
    tsconfig.json
  devices/
    src/
      iphone16/
        Frame.tsx
        profile.ts
      pixel/
        Frame.tsx
        profile.ts
      index.ts
      reducer.ts
      StatusBar.tsx
      types.ts
    package.json
    README.md
    tsconfig.json
  episodes/
    src/
      examples/
        android-test.json
        instagram-test.json
        whatsapp-breakup-01.json
      index.ts
      schema.ts
    package.json
    tsconfig.json
  renderer/
    src/
      DeviceFrame.tsx
      index.ts
      LayoutEngine.ts
      NotificationOverlay.tsx
      registry.ts
      TokovoRenderer.tsx
      VisualDebugger.tsx
    package.json
    tsconfig.json
.gitignore
.tool-versions
package.json
pnpm-workspace.yaml
repomix.config.json
tsconfig.base.json
turbo.json
```

# Files

## File: apps/video-runner/src/index.ts
```typescript
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

## File: apps/video-runner/src/InstagramVideo.tsx
```typescript
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { replay, WorldState } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { instagramEpisode } from "@tokovo/episodes";

// Ensure reducers are registered
import "@tokovo/devices";
import "@tokovo/apps-whatsapp";
import "@tokovo/apps-instagram";

export const InstagramVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Calculate scale to fit device in composition with some padding
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleX = availableWidth / iPhone16Profile.dimensions.width;
    const scaleY = availableHeight / iPhone16Profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate time t
    const t = frame;

    // Replay
    // Note: We cast to any because the JSON types might be slightly loose compared to strict TS types
    const world = replay(instagramEpisode.initialState as unknown as WorldState, instagramEpisode.timeline as any, t);

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#111", position: "relative" }}>
            <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: iPhone16Profile.dimensions.width,
                height: iPhone16Profile.dimensions.height
            }}>
                <TokovoRenderer world={world} t={t} debug={true} />
            </div>
        </div>
    );
};
```

## File: apps/video-runner/remotion.config.ts
```typescript
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

## File: apps/video-runner/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": ".",
        "jsx": "react-jsx"
    },
    "include": [
        "src/**/*",
        "remotion.config.ts"
    ]
}
```

## File: packages/apps-instagram/src/index.ts
```typescript
export * from "./runtime";
export * from "./ui";
```

## File: packages/apps-instagram/src/runtime.ts
```typescript
import { produce } from "immer";
import { WorldState, TimelineEvent } from "@tokovo/core";

export const instagramRuntime = (state: WorldState, event: TimelineEvent) => {
    if (event.kind !== "APP" || event.appId !== "app_instagram") return state;

    return produce(state, (draft) => {
        const { conversationId, type } = event;

        // Ensure conversation exists
        if (!draft.conversations[conversationId]) {
            draft.conversations[conversationId] = {
                id: conversationId,
                messages: [],
                typing: {}
            };
        }

        const conversation = draft.conversations[conversationId];

        switch (type) {
            case "MESSAGE_RECEIVED":
                conversation.messages.push({
                    id: `msg_${Date.now()}_${Math.random()}`,
                    from: event.from,
                    text: event.text,
                    at: event.at,
                    liked: false // Instagram specific
                });
                break;

            case "TYPING_START":
                if (!conversation.typing) conversation.typing = {};
                conversation.typing[event.from] = true;
                break;

            case "TYPING_END":
                if (conversation.typing) {
                    conversation.typing[event.from] = false;
                }
                break;
        }
    });
};
```

## File: packages/apps-instagram/src/ui.tsx
```typescript
import React from "react";
import { WorldState } from "@tokovo/core";

// --- Icons ---
const BackIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const VideoIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const InfoIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const MicIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const ImageIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const StickerIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// --- Components ---

const Header: React.FC<{ contactName: string }> = ({ contactName }) => (
    <div style={{
        height: 200,
        display: "flex",
        alignItems: "center",
        padding: "0 45px",
        marginTop: 150,
        zIndex: 10,
        color: "white"
    }}>
        <BackIcon />
        <div style={{ flex: 1, display: "flex", alignItems: "center", marginLeft: 30 }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", backgroundColor: "#333", marginRight: 20 }} />
            <div style={{ fontSize: 42, fontWeight: "600" }}>{contactName}</div>
        </div>
        <div style={{ display: "flex", gap: 60 }}>
            <VideoIcon />
            <InfoIcon />
        </div>
    </div>
);

const MessageBubble: React.FC<{ msg: any; layout?: any }> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const animation = layout?.messageAnimations?.[msg.id] || { opacity: 1, translateY: 0 };
    const { opacity, translateY } = animation;

    return (
        <div style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            backgroundColor: isMe ? "#3797F0" : "#262626", // Instagram Blue or Dark Grey
            color: "white",
            padding: "30px 42px",
            borderRadius: 60,
            maxWidth: "70%",
            fontSize: 48,
            lineHeight: "60px",
            marginBottom: 12,
            opacity,
            transform: `translateY(${translateY}px)`
        }}>
            {msg.text}
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; layout?: any }> = ({ messages, layout }) => {
    const scrollY = layout?.scrollY || 0;

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{
                padding: "30px 45px",
                display: "flex",
                flexDirection: "column",
                gap: 15,
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.3s ease-out",
                minHeight: "100%",
                justifyContent: "flex-end" // Instagram starts from bottom
            }}>
                {messages.map((msg: any) => (
                    <MessageBubble key={msg.id} msg={msg} layout={layout} />
                ))}
            </div>
        </div>
    );
};

const InputArea: React.FC = () => (
    <div style={{
        height: 180,
        display: "flex",
        alignItems: "center",
        padding: "0 45px",
        gap: 30,
        marginBottom: 60
    }}>
        <div style={{
            flex: 1,
            height: 130,
            backgroundColor: "#262626",
            borderRadius: 65,
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            gap: 30
        }}>
            <CameraIcon />
            <div style={{ flex: 1, fontSize: 48, color: "#888" }}>Message...</div>
            <MicIcon />
            <ImageIcon />
            <StickerIcon />
        </div>
    </div>
);

export const InstagramChatView: React.FC<{ world: WorldState; t: number; layout?: any }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: "white"
        }}>
            <Header contactName="instagram_user" />
            <MessageList messages={messages} layout={layout} />
            <InputArea />
        </div>
    );
};
```

## File: packages/apps-instagram/package.json
```json
{
    "name": "@tokovo/apps-instagram",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "dependencies": {
        "@tokovo/core": "workspace:*",
        "react": "^18.0.0",
        "immer": "^10.0.0"
    },
    "devDependencies": {
        "@types/react": "^18.0.0",
        "typescript": "^5.0.0"
    }
}
```

## File: packages/apps-instagram/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "jsx": "react-jsx"
    },
    "include": [
        "src/**/*"
    ]
}
```

## File: packages/apps-whatsapp/src/index.ts
```typescript
export * from "./types";
export * from "./runtime";
export * from "./ui";
```

## File: packages/apps-whatsapp/src/types.ts
```typescript
export interface WhatsAppState {
    // Add specific state if needed, for now using generic ConversationState from core
}
```

## File: packages/apps-whatsapp/src/TypingBubble.tsx
```typescript
import React from "react";

export const TypingBubble: React.FC = () => {
    return (
        <div style={{
            padding: "24px 36px",
            marginLeft: 48,
            marginBottom: 12,
            backgroundColor: "#FFFFFF",
            borderRadius: 48,
            borderTopLeftRadius: 12,
            alignSelf: "flex-start",
            width: "fit-content",
            boxShadow: "0 3px 3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 66 // Match line height of text
        }}>
            <Dot delay={0} />
            <Dot delay={0.2} />
            <Dot delay={0.4} />
        </div>
    );
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
    <div style={{
        width: 18,
        height: 18,
        backgroundColor: "#B1B1B1",
        borderRadius: "50%",
        animation: `typingBounce 1.4s infinite ease-in-out both`,
        animationDelay: `${delay}s`
    }}>
        <style>{`
            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `}</style>
    </div>
);
```

## File: packages/apps-whatsapp/README.md
```markdown
# @tokovo/apps-whatsapp

WhatsApp clone app for Tokovo.

## Features
- **Runtime**: Handles `MESSAGE_RECEIVED`, `TYPING_START`, `TYPING_END`.
- **UI**: `WhatsappChatView` with high-fidelity styling, animations, and auto-scroll.
```

## File: packages/apps-whatsapp/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "jsx": "react-jsx"
    },
    "include": [
        "src/**/*"
    ]
}
```

## File: packages/core/src/engine.ts
```typescript
import { produce } from "immer";
import { TimelineEvent, WorldState, DeviceState } from "./types";

export type DeviceReducer = (state: Record<string, DeviceState>, event: TimelineEvent) => Record<string, DeviceState>;
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;

export const ReducerRegistry = {
    deviceReducer: null as DeviceReducer | null,
    appReducers: {} as Record<string, AppReducer>,

    registerDeviceReducer(reducer: DeviceReducer) {
        this.deviceReducer = reducer;
    },
    registerAppReducer(appId: string, reducer: AppReducer) {
        this.appReducers[appId] = reducer;
    }
};

export function replay(initial: WorldState, events: TimelineEvent[], t: number): WorldState {
    const relevant = events.filter(e => e.at <= t);

    return relevant.reduce((state, event) => {
        return produce(state, draft => {
            if (event.kind === "DEVICE") {
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
            }
            if (event.kind === "APP") {
                const reducer = ReducerRegistry.appReducers[event.appId];
                reducer?.(draft, event);
            }
            if (event.kind === "CAMERA") {
                draft.camera = event.view;
            }
        });
    }, initial);
}
```

## File: packages/core/src/index.ts
```typescript
export * from "./types";
export * from "./engine";
```

## File: packages/core/package.json
```json
{
    "name": "@tokovo/core",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "scripts": {
        "lint": "eslint . --ext .ts,.tsx"
    },
    "dependencies": {
        "immer": "^10.0.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0"
    }
}
```

## File: packages/core/README.md
```markdown
# @tokovo/core

Core logic for the Tokovo engine.

## Features
- **Engine**: `replay` function to compute world state from events.
- **Types**: Core type definitions (`WorldState`, `TimelineEvent`, etc.).
- **Registry**: `ReducerRegistry` for managing device and app reducers.
```

## File: packages/core/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src"
    },
    "include": [
        "src/**/*"
    ]
}
```

## File: packages/devices/src/iphone16/profile.ts
```typescript
import { DeviceProfile } from "../types";

export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    dimensions: { width: 1290, height: 2796 },
    statusBarHeight: 110,
};
```

## File: packages/devices/src/pixel/profile.ts
```typescript
import { DeviceProfile } from "../types";

export const PixelProfile: DeviceProfile = {
    id: "pixel",
    dimensions: {
        width: 1080, // Pixel 7 Pro approx width
        height: 2400, // Pixel 7 Pro approx height
    },
    statusBarHeight: 90, // Approx 30px * 3
};
```

## File: packages/devices/src/types.ts
```typescript
export interface DeviceProfile {
    id: string;
    dimensions: { width: number; height: number };
    statusBarHeight: number;
}
```

## File: packages/devices/README.md
```markdown
# @tokovo/devices

Device profiles and reducers.

## Features
- **Profiles**: `iPhone16Profile` with high-res assets.
- **Components**: `iPhone16Frame`, `StatusBar`.
- **Reducer**: `deviceReducer` for handling device events (LOCK, UNLOCK, OPEN_APP).
```

## File: packages/devices/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "jsx": "react-jsx"
    },
    "include": [
        "src/**/*"
    ]
}
```

## File: packages/episodes/src/examples/android-test.json
```json
{
    "initialWorld": {
        "devices": {
            "bob_phone": {
                "id": "bob_phone",
                "profileId": "pixel",
                "isLocked": true,
                "notifications": []
            }
        },
        "conversations": {
            "conv_1": {
                "id": "conv_1",
                "messages": [
                    {
                        "id": "m1",
                        "from": "other",
                        "text": "Hey Bob!",
                        "at": 0
                    }
                ]
            }
        },
        "camera": {
            "type": "APP_VIEW"
        }
    },
    "events": [
        {
            "at": 10,
            "kind": "DEVICE",
            "deviceId": "bob_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_whatsapp",
            "title": "Alice",
            "body": "Hey Bob!"
        },
        {
            "at": 60,
            "kind": "DEVICE",
            "deviceId": "bob_phone",
            "type": "UNLOCK"
        },
        {
            "at": 70,
            "kind": "DEVICE",
            "deviceId": "bob_phone",
            "type": "OPEN_APP",
            "appId": "app_whatsapp"
        }
    ]
}
```

## File: packages/episodes/src/examples/instagram-test.json
```json
{
    "id": "instagram-dm-test",
    "title": "Instagram DM Test",
    "durationInFrames": 300,
    "fps": 30,
    "width": 1080,
    "height": 1920,
    "initialState": {
        "devices": {
            "alice_phone": {
                "profileId": "iphone16",
                "isLocked": false,
                "foregroundAppId": "app_instagram",
                "notifications": []
            }
        },
        "conversations": {
            "conv_1": {
                "id": "conv_1",
                "messages": [
                    {
                        "id": "m1",
                        "from": "other",
                        "text": "Yo! Did you see that post?",
                        "at": -60,
                        "liked": false
                    },
                    {
                        "id": "m2",
                        "from": "me",
                        "text": "Yeah, crazy right?",
                        "at": -30,
                        "liked": true
                    }
                ],
                "typing": {}
            }
        },
        "camera": {
            "type": "static",
            "deviceId": "alice_phone"
        }
    },
    "timeline": [
        {
            "at": 30,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "other"
        },
        {
            "at": 90,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "other"
        },
        {
            "at": 95,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "other",
            "text": "We should go there next week!"
        },
        {
            "at": 150,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "Totally down. Let's book it."
        }
    ]
}
```

## File: packages/episodes/package.json
```json
{
    "name": "@tokovo/episodes",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "scripts": {
        "lint": "eslint . --ext .ts,.tsx"
    },
    "dependencies": {
        "@tokovo/core": "workspace:*",
        "zod": "^3.0.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0"
    }
}
```

## File: packages/episodes/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "resolveJsonModule": true
    },
    "include": [
        "src/**/*"
    ]
}
```

## File: packages/renderer/src/index.ts
```typescript
export * from "./registry";
export * from "./LayoutEngine";
export * from "./DeviceFrame";
export * from "./TokovoRenderer";
```

## File: packages/renderer/src/NotificationOverlay.tsx
```typescript
import React from "react";
import { Notification } from "@tokovo/core";

export const NotificationOverlay: React.FC<{ notifications?: Notification[]; variant?: "ios" | "android" }> = ({ notifications = [], variant = "ios" }) => {
    if (!notifications || notifications.length === 0) return null;

    // Only show the latest notification for now
    const latest = notifications[notifications.length - 1];

    const isAndroid = variant === "android";

    return (
        <div style={{
            position: "absolute",
            top: isAndroid ? 40 : 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "92%",
            zIndex: 100,
            pointerEvents: "none" // Let clicks pass through
        }}>
            <div style={{
                backgroundColor: isAndroid ? "#303030" : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(20px)",
                borderRadius: isAndroid ? 24 : 36,
                padding: "30px 40px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 30,
                color: isAndroid ? "white" : "black",
                animation: "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20,
                    backgroundColor: "#25D366", // WhatsApp Green
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 50,
                    color: "white"
                }}>
                    W
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 36, fontWeight: "bold", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                        <span>{latest.title}</span>
                        <span style={{ fontSize: 28, opacity: 0.5, fontWeight: "normal" }}>now</span>
                    </div>
                    <div style={{ fontSize: 36, opacity: 0.8 }}>
                        {latest.body}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-150%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
```

## File: packages/renderer/src/VisualDebugger.tsx
```typescript
import React from "react";
import { WorldState } from "@tokovo/core";

export const VisualDebugger: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    return (
        <div style={{
            position: "absolute",
            bottom: 50,
            right: 50,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#0f0",
            fontFamily: "monospace",
            fontSize: 24,
            padding: 20,
            borderRadius: 10,
            zIndex: 9999,
            pointerEvents: "none",
            maxWidth: 600
        }}>
            <div><strong>Frame:</strong> {t.toFixed(0)}</div>
            <div><strong>Active App:</strong> {Object.values(world.devices)[0]?.foregroundAppId || "Home"}</div>
            <div><strong>Events:</strong></div>
            {/* We would need access to events here, but world state doesn't store history. 
                Just showing state for now. */}
            <div style={{ marginTop: 10, fontSize: 18, opacity: 0.8 }}>
                Camera: {world.camera.type}
            </div>
        </div>
    );
};
```

## File: packages/renderer/tsconfig.json
```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "jsx": "react-jsx"
    },
    "include": [
        "src/**/*"
    ]
}
```

## File: .gitignore
```
# Dependencies
node_modules
.pnpm-store

# Next.js
.next
out
build
dist

# Remotion
.remotion
render

# Turbo
.turbo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env
*.env.*

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode
.idea
*.swp
*.swo
```

## File: .tool-versions
```
nodejs 25.2.0
```

## File: package.json
```json
{
    "name": "tokovo-monorepo",
    "version": "0.0.0",
    "private": true,
    "scripts": {
        "build": "turbo run build",
        "dev": "turbo run dev",
        "lint": "turbo run lint",
        "format": "prettier --write \"**/*.{ts,tsx,md}\""
    },
    "devDependencies": {
        "turbo": "latest",
        "prettier": "latest"
    },
    "packageManager": "pnpm@9.0.0",
    "engines": {
        "node": ">=18"
    }
}
```

## File: pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## File: repomix.config.json
```json
{
  "$schema": "https://repomix.com/schemas/latest/schema.json",
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "tokovo.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "truncateBase64": false,
    "copyToClipboard": false,
    "includeFullDirectoryStructure": false,
    "tokenCountTree": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false,
      "includeLogs": false,
      "includeLogsCount": 50
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDotIgnore": true,
    "useDefaultPatterns": true,
    "customPatterns": [
      "*.md"
    ]
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

## File: tsconfig.base.json
```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true,
        "jsx": "react-jsx",
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    }
}
```

## File: turbo.json
```json
{
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
        "build": {
            "dependsOn": [
                "^build"
            ],
            "outputs": [
                ".next/**",
                "!.next/cache/**",
                "dist/**"
            ]
        },
        "lint": {},
        "dev": {
            "cache": false,
            "persistent": true
        }
    }
}
```

## File: apps/video-runner/src/AndroidVideo.tsx
```typescript
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { replay, WorldState } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { PixelProfile } from "@tokovo/devices";
import { androidEpisode } from "@tokovo/episodes";

export const AndroidVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Calculate scale to fit device in composition with some padding
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleX = availableWidth / PixelProfile.dimensions.width;
    const scaleY = availableHeight / PixelProfile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate time t
    const t = frame;

    // Replay
    const world = replay(androidEpisode.initialWorld as unknown as WorldState, androidEpisode.events as any, t);

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "white", position: "relative" }}>
            <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: PixelProfile.dimensions.width,
                height: PixelProfile.dimensions.height
            }}>
                <TokovoRenderer world={world} t={t} />
            </div>
        </div>
    );
};
```

## File: packages/apps-whatsapp/package.json
```json
{
    "name": "@tokovo/apps-whatsapp",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "scripts": {
        "lint": "eslint . --ext .ts,.tsx"
    },
    "dependencies": {
        "@tokovo/core": "workspace:*",
        "immer": "^10.0.0",
        "react": "18.2.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "18.2.0"
    }
}
```

## File: packages/devices/src/iphone16/Frame.tsx
```typescript
import React from "react";
import { iPhone16Profile } from "./profile";

export const iPhone16Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { width, height } = iPhone16Profile.dimensions;

    return (
        <div style={{
            width,
            height,
            backgroundColor: "black",
            borderRadius: 165, // Scaled radius (55 * 3)
            boxShadow: "0 0 0 30px #3a3a3a, 0 0 0 36px #000", // Scaled borders
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Dynamic Island */}
            <div style={{
                position: "absolute",
                top: 33, // 11 * 3
                left: "50%",
                transform: "translateX(-50%)",
                width: 378, // 126 * 3
                height: 111, // 37 * 3
                backgroundColor: "black",
                borderRadius: 60, // 20 * 3
                zIndex: 1000
            }} />

            {/* Screen Content */}
            <div style={{
                flex: 1,
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                position: "relative"
            }}>
                {children}
            </div>
        </div>
    );
};
```

## File: packages/devices/src/pixel/Frame.tsx
```typescript
import React from "react";
import { PixelProfile } from "./profile";

export const PixelFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { width, height } = PixelProfile.dimensions;

    return (
        <div style={{
            width,
            height,
            backgroundColor: "black",
            borderRadius: 60, // Less rounded than iPhone
            boxShadow: "0 0 0 15px #3a3a3a, 0 0 0 18px #000", // Thinner borders
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Camera Hole Punch */}
            <div style={{
                position: "absolute",
                top: 36, // 12 * 3
                left: "50%",
                transform: "translateX(-50%)",
                width: 36, // 12 * 3
                height: 36, // 12 * 3
                backgroundColor: "black",
                borderRadius: "50%",
                zIndex: 1000
            }} />

            {/* Screen Content */}
            <div style={{
                flex: 1,
                backgroundColor: "#121212", // Dark mode default for Android
                display: "flex",
                flexDirection: "column",
                position: "relative",
                color: "white"
            }}>
                {/* Pass variant="android" to StatusBar if it was imported/used here. 
                    Since StatusBar isn't imported in the original file, I assume it's rendered by the Renderer or needs to be added here.
                    However, looking at the architecture, DeviceFrame usually renders the StatusBar. 
                    Let's check packages/renderer/src/DeviceFrame.tsx to see where StatusBar is rendered.
                    Wait, I should probably just update the style here for now and let the renderer handle the status bar prop if it's passed down.
                    But the plan said "Pass variant='android' to StatusBar". 
                    If StatusBar is not in this file, I can't pass it here.
                    Let me check DeviceFrame.tsx first.
                */}
                {children}
            </div>
        </div>
    );
};
```

## File: packages/devices/src/reducer.ts
```typescript
import { produce } from "immer";
import { TimelineEvent, DeviceState } from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

export function deviceReducer(devices: Record<string, DeviceState>, event: TimelineEvent): Record<string, DeviceState> {
    return produce(devices, draft => {
        if (event.kind !== "DEVICE") return;

        const device = draft[event.deviceId];
        if (!device) return; // Or initialize?

        switch (event.type) {
            case "LOCK":
                device.isLocked = true;
                break;
            case "UNLOCK":
                device.isLocked = false;
                break;
            case "OPEN_APP":
                device.foregroundAppId = event.appId;
                break;
            case "CLOSE_APP":
                device.foregroundAppId = undefined;
                break;
            case "SHOW_NOTIFICATION":
                if (!device.notifications) device.notifications = [];
                device.notifications.push({
                    id: `notif_${event.at}_${event.appId}`,
                    appId: event.appId,
                    title: event.title,
                    body: event.body,
                    at: event.at
                });
                break;
        }
    });
}

// Register itself
ReducerRegistry.registerDeviceReducer(deviceReducer);
```

## File: packages/devices/src/StatusBar.tsx
```typescript
import React from "react";

export const StatusBar: React.FC<{ time?: string; variant?: "ios" | "android" }> = ({ time = "9:41", variant = "ios" }) => {
    const isAndroid = variant === "android";

    return (
        <div style={{
            width: "100%",
            height: isAndroid ? 90 : 60, // Android status bar is usually taller
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isAndroid ? "0 45px" : "0 30px",
            boxSizing: "border-box",
            fontSize: isAndroid ? 36 : 24,
            fontWeight: "bold",
            color: isAndroid ? "white" : "black", // Default to white for Android (usually on dark bg or transparent)
            position: "absolute",
            top: isAndroid ? 15 : 15,
            left: 0,
            zIndex: 20,
            fontFamily: isAndroid ? "Roboto, sans-serif" : "inherit"
        }}>
            <div>{time}</div>
            <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                {isAndroid ? (
                    <>
                        {/* Android Icons */}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L24 6H0L12 21Z" /></svg> {/* Wifi-ish */}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg> {/* Battery */}
                    </>
                ) : (
                    <>
                        {/* iOS Icons placeholders */}
                        <span>📶</span>
                        <span>Wi-Fi</span>
                        <span>🔋</span>
                    </>
                )}
            </div>
        </div>
    );
};
```

## File: packages/devices/package.json
```json
{
    "name": "@tokovo/devices",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "scripts": {
        "lint": "eslint . --ext .ts,.tsx"
    },
    "dependencies": {
        "@tokovo/core": "workspace:*",
        "immer": "^10.0.0",
        "react": "18.2.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "18.2.0"
    }
}
```

## File: apps/video-runner/package.json
```json
{
    "name": "video-runner",
    "version": "0.0.0",
    "private": true,
    "scripts": {
        "start": "npx remotion studio",
        "dev": "npx remotion studio",
        "build": "npx remotion render",
        "upgrade": "remotion upgrade",
        "test": "eslint src --ext ts,tsx"
    },
    "dependencies": {
        "@remotion/cli": "4.0.380",
        "@tokovo/apps-whatsapp": "workspace:*",
        "@tokovo/apps-instagram": "workspace:*",
        "@tokovo/core": "workspace:*",
        "@tokovo/devices": "workspace:*",
        "@tokovo/episodes": "workspace:*",
        "@tokovo/renderer": "workspace:*",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "remotion": "4.0.380",
        "zod": "^3.0.0"
    },
    "devDependencies": {
        "@types/react": "18.2.0",
        "@types/web": "^0.0.61",
        "eslint": "^8.0.0",
        "prettier": "^3.0.0",
        "typescript": "^5.0.0"
    }
}
```

## File: packages/apps-whatsapp/src/runtime.ts
```typescript
import { produce } from "immer";
import { TimelineEvent, WorldState, ReducerRegistry } from "@tokovo/core";

export function whatsappReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_whatsapp") return;

    const conversationId = event.conversationId;
    if (!draft.conversations[conversationId]) {
        draft.conversations[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

    switch (event.type) {
        case "MESSAGE_RECEIVED":
            conversation.messages.push({
                id: `msg_${event.at}_${event.from}_${event.text?.substring(0, 5)}`, // Deterministic ID
                from: event.from,
                text: event.text,
                at: event.at
            });
            break;
        case "TYPING_START":
            if (!conversation.typing) conversation.typing = {};
            conversation.typing[event.from] = true;
            break;
        case "TYPING_END":
            if (conversation.typing) {
                delete conversation.typing[event.from];
            }
            break;
    }
}

// Register itself
ReducerRegistry.registerAppReducer("app_whatsapp", whatsappReducer);
```

## File: packages/devices/src/index.ts
```typescript
export * from "./types";
export * from "./iphone16/profile";
export * from "./iphone16/Frame";
export * from "./pixel/profile";
export * from "./pixel/Frame";
export * from "./reducer";
export * from "./StatusBar";
```

## File: packages/episodes/src/examples/whatsapp-breakup-01.json
```json
{
    "initialWorld": {
        "devices": {
            "alice_phone": {
                "id": "alice_phone",
                "profileId": "iphone16",
                "isLocked": true
            }
        },
        "conversations": {
            "conv_1": {
                "id": "conv_1",
                "messages": [
                    {
                        "id": "m1",
                        "from": "me",
                        "text": "We need to talk...",
                        "at": 0
                    },
                    {
                        "id": "m2",
                        "from": "other",
                        "text": "Oh no. What happened?",
                        "at": 30
                    },
                    {
                        "id": "m3",
                        "from": "me",
                        "text": "It's not you, it's me.",
                        "at": 60
                    }
                ],
                "typing": {
                    "other": false
                }
            }
        },
        "camera": {
            "type": "APP_VIEW"
        }
    },
    "events": [
        {
            "at": 10,
            "kind": "DEVICE",
            "deviceId": "alice_phone",
            "type": "UNLOCK"
        },
        {
            "at": 20,
            "kind": "DEVICE",
            "deviceId": "alice_phone",
            "type": "OPEN_APP",
            "appId": "app_whatsapp"
        },
        {
            "at": 40,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "other"
        },
        {
            "at": 55,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "other"
        },
        {
            "at": 60,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "other",
            "text": "Oh no. What happened?"
        }
    ]
}
```

## File: packages/episodes/src/index.ts
```typescript
import exampleEpisode from "./examples/whatsapp-breakup-01.json";

import androidEpisode from "./examples/android-test.json";

import instagramEpisode from "./examples/instagram-test.json";

export * from "./schema";
export { exampleEpisode, androidEpisode, instagramEpisode };
```

## File: packages/episodes/src/schema.ts
```typescript
import { z } from "zod";

export const DeviceEventSchema = z.discriminatedUnion("type", [
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.enum(["LOCK", "UNLOCK", "OPEN_APP", "CLOSE_APP"]),
        appId: z.string().optional()
    }),
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("SHOW_NOTIFICATION"),
        appId: z.string(),
        title: z.string(),
        body: z.string()
    })
]);

export const AppEventSchema = z.object({
    at: z.number(),
    kind: z.literal("APP"),
    appId: z.string(),
    type: z.enum(["MESSAGE_RECEIVED", "TYPING_START", "TYPING_END"]),
    conversationId: z.string(),
    from: z.string(),
    text: z.string().optional()
});

export const CameraEventSchema = z.object({
    at: z.number(),
    kind: z.literal("CAMERA"),
    type: z.literal("SET_VIEW"),
    view: z.object({
        type: z.literal("APP_VIEW"),
        appId: z.string().optional()
    })
});

export const TimelineEventSchema = z.union([
    DeviceEventSchema,
    AppEventSchema,
    CameraEventSchema
]);

// --- World State Schemas ---

export const DeviceStateSchema = z.object({
    id: z.string(),
    profileId: z.string(),
    isLocked: z.boolean(),
    foregroundAppId: z.string().optional(),
    notifications: z.array(z.object({
        id: z.string(),
        appId: z.string(),
        title: z.string(),
        body: z.string(),
        at: z.number(),
    })).optional(),
});

export const ConversationStateSchema = z.object({
    id: z.string(),
    messages: z.array(z.object({
        id: z.string(),
        from: z.string(),
        text: z.string().optional(),
        at: z.number(),
    })),
    typing: z.record(z.boolean()).optional(),
});

export const CameraViewSchema = z.object({
    type: z.literal("APP_VIEW"),
    appId: z.string().optional(),
});

export const EpisodeSchema = z.object({
    initialWorld: z.object({
        devices: z.record(DeviceStateSchema),
        conversations: z.record(ConversationStateSchema),
        camera: CameraViewSchema,
    }),
    events: z.array(TimelineEventSchema),
});
```

## File: packages/renderer/package.json
```json
{
    "name": "@tokovo/renderer",
    "version": "0.0.0",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "scripts": {
        "lint": "eslint . --ext .ts,.tsx"
    },
    "dependencies": {
        "@tokovo/core": "workspace:*",
        "@tokovo/devices": "workspace:*",
        "@tokovo/apps-whatsapp": "workspace:*",
        "@tokovo/apps-instagram": "workspace:*",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "remotion": "4.0.211"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "18.2.0",
        "@types/react-dom": "18.2.0"
    }
}
```

## File: apps/video-runner/src/Root.tsx
```typescript
import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { AndroidVideo } from "./AndroidVideo";
import { InstagramVideo } from "./InstagramVideo";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="TokovoExample"
                component={Video}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="AndroidNotificationTest"
                component={AndroidVideo}
                durationInFrames={150}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="InstagramDMTest"
                component={InstagramVideo}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
```

## File: packages/renderer/src/LayoutEngine.ts
```typescript
import { WorldState } from "@tokovo/core";

export interface LayoutState {
    scrollToBottom: boolean;
    scrollY: number;
    messageAnimations: Record<string, { opacity: number; translateY: number }>;
}

export function computeLayout(world: WorldState, t: number = 0): LayoutState {
    const layout: LayoutState = {
        scrollToBottom: true,
        scrollY: 0,
        messageAnimations: {}
    };

    // Calculate message animations
    let totalHeight = 0;
    const messageHeights: Record<string, number> = {}; // Mock heights for now, ideally measured

    for (const convId in world.conversations) {
        const conversation = world.conversations[convId];
        for (const msg of conversation.messages) {
            const age = t - msg.at;
            // Animation logic: Fade in over 10 frames, slide up from 60px
            const opacity = Math.min(Math.max(age / 10, 0), 1);
            const translateY = Math.max(60 - age * 6, 0);

            layout.messageAnimations[msg.id] = { opacity, translateY };

            // Estimate height (mock) - in real implementation, this needs measureText or fixed heights
            const estimatedHeight = 150 + (msg.text?.length || 0) * 2;
            messageHeights[msg.id] = estimatedHeight;

            if (age >= 0) {
                totalHeight += estimatedHeight + 20; // 20px gap
            }
        }
    }

    // Smooth scroll logic
    // Target scroll is totalHeight - viewportHeight (approx 2000 for iPhone)
    // We want to scroll to the bottom if new messages appear
    const viewportHeight = 2000;
    const targetScroll = Math.max(0, totalHeight - viewportHeight + 300); // +300 padding

    // Simple linear interpolation for smoothness, or just snap for now if t is large
    // For a real spring, we'd need previous state, but here we are pure function of t.
    // So we make scroll dependent on the latest message timestamp.

    // Find latest message time
    let lastMsgTime = 0;
    for (const convId in world.conversations) {
        for (const msg of world.conversations[convId].messages) {
            if (msg.at > lastMsgTime && msg.at <= t) lastMsgTime = msg.at;
        }
    }

    const timeSinceLastMsg = t - lastMsgTime;
    // Scroll animation duration = 20 frames
    const scrollProgress = Math.min(timeSinceLastMsg / 20, 1);

    // This is a simplification. Ideally we interpolate from "previous target" to "current target".
    // Since we don't have previous state, we can assume the "previous target" was valid at lastMsgTime - 1.
    // For MVP Phase 2, we will just output the targetScroll. 
    // The UI component can use CSS transitions for the actual smooth visual if needed, 
    // OR we can implement a deterministic scroll function here if we knew the history.

    layout.scrollY = targetScroll;

    return layout;
}
```

## File: packages/renderer/src/registry.ts
```typescript
import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";
import { InstagramChatView } from "@tokovo/apps-instagram";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView,
        "app_instagram": InstagramChatView
    } as Record<string, React.FC<{ world: WorldState; t?: number; layout?: any }>>,

    getView(appId: string) {
        return this.views[appId];
    }
};
```

## File: apps/video-runner/src/Video.tsx
```typescript
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { replay, WorldState } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { exampleEpisode } from "@tokovo/episodes";

// Ensure reducers are registered
import "@tokovo/devices";
import "@tokovo/apps-whatsapp";

export const Video: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Calculate scale to fit device in composition with some padding
    const padding = 50;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const scaleX = availableWidth / iPhone16Profile.dimensions.width;
    const scaleY = availableHeight / iPhone16Profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate time t
    const t = frame;

    // Replay
    const world = replay(exampleEpisode.initialWorld as unknown as WorldState, exampleEpisode.events as any, t);

    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "white", position: "relative" }}>
            <div style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: iPhone16Profile.dimensions.width,
                height: iPhone16Profile.dimensions.height
            }}>
                <TokovoRenderer world={world} t={t} />
            </div>
        </div>
    );
};
```

## File: packages/core/src/types.ts
```typescript
export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface Notification {
    id: string;
    appId: string;
    title: string;
    body: string;
    at: number;
}

export interface DeviceState {
    id: string; // The instance ID (e.g., "alice_phone")
    profileId: string; // The hardware profile ID (e.g., "iphone16")
    isLocked: boolean;
    foregroundAppId?: string;
    notifications: Notification[];
    sound?: {
        activeSoundId?: string;
    };
}

export interface ConversationState {
    id: ConversationId;
    messages: any[]; // To be defined more specifically if needed
    typing?: Record<string, boolean>;
}

export interface CameraViewConfig {
    type: "APP_VIEW"; // For MVP
    appId?: AppId;
}

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    camera: CameraViewConfig;
}

// Event Union
export type TimelineEvent =
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP"; appId?: AppId }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SHOW_NOTIFICATION"; appId: string; title: string; body: string }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig }
    | { at: number; kind: "AUDIO"; type: "PLAY_SOUND"; soundId: string; volume?: number };
```

## File: packages/renderer/src/DeviceFrame.tsx
```typescript
import React from "react";
import { DeviceProfile, iPhone16Frame, PixelFrame, StatusBar } from "@tokovo/devices";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices"; // Import profiles to look them up

export const DeviceFrame: React.FC<{ profileId: string; isLocked?: boolean; notifications?: any[]; children: React.ReactNode; variant?: "ios" | "android" }> = ({ profileId, isLocked, notifications, children, variant }) => {
    // Strategy pattern: Select frame component based on profile ID
    const FrameComponent = profileId === "iphone16" ? iPhone16Frame :
        profileId === "pixel" ? PixelFrame : React.Fragment;

    // Determine props to pass to the FrameComponent
    const frameProps = {};
    if (profileId === "iphone16" || profileId === "pixel") {
        if (variant) {
            Object.assign(frameProps, { variant });
        }
    }

    return (
        <FrameComponent {...frameProps}>
            <StatusBar time="10:41" variant={variant} />
            {children}
            {isLocked && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)", // Dimmed lock screen
                    backdropFilter: "blur(20px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 300,
                    color: "white",
                    zIndex: 2000
                }}>
                    <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 60 }}>Locked</div>

                    {/* Notifications Stack */}
                    <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 24 }}>
                        {notifications?.map((notif) => (
                            <div key={notif.id} style={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                backdropFilter: "blur(40px)",
                                borderRadius: 42,
                                padding: "36px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 39, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                                    <span>{notif.appId === "app_whatsapp" ? "WhatsApp" : notif.appId}</span>
                                    <span style={{ fontWeight: 400, fontSize: 36, color: "rgba(255,255,255,0.6)" }}>now</span>
                                </div>
                                <div style={{ fontSize: 42, fontWeight: 600 }}>{notif.title}</div>
                                <div style={{ fontSize: 42 }}>{notif.body}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </FrameComponent>
    );
};
```

## File: packages/apps-whatsapp/src/ui.tsx
```typescript
import React, { useEffect, useRef } from "react";
import { WorldState } from "@tokovo/core";
import { TypingBubble } from "./TypingBubble";

// --- Icons (Scaled 3x: 24 -> 72) ---
const BackIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const PlusIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const MicIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const CheckIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// --- Components ---

const Header: React.FC<{ contactName: string }> = ({ contactName }) => (
    <div style={{
        height: 270, // 90 * 3
        backgroundColor: "rgba(245, 245, 245, 0.95)",
        backdropFilter: "blur(30px)",
        display: "flex",
        alignItems: "center",
        padding: "0 45px", // 15 * 3
        borderBottom: "3px solid #d1d1d6",
        marginTop: 150, // Below status bar (approx)
        zIndex: 10
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15, color: "#007AFF", fontSize: 51 }}>
            <BackIcon />
            <span style={{ marginRight: 15 }}>98</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: "#8E8E93", marginBottom: 6 }} />
            <div style={{ fontSize: 42, fontWeight: "600", color: "black" }}>{contactName}</div>
        </div>

        <div style={{ display: "flex", gap: 60 }}>
            <VideoCallIcon />
            <PhoneIcon />
        </div>
    </div>
);

const MessageBubble: React.FC<{ msg: any; layout?: any }> = ({ msg, layout }) => {
    const isMe = msg.from === "me";

    // Animation logic from layout engine
    const animation = layout?.messageAnimations?.[msg.id] || { opacity: 1, translateY: 0 };
    const { opacity, translateY } = animation;

    return (
        <div style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            backgroundColor: isMe ? "#DCF8C6" : "#FFFFFF",
            padding: "24px 36px", // 8*3, 12*3
            borderRadius: 48, // 16*3
            borderTopLeftRadius: !isMe ? 12 : 48,
            borderTopRightRadius: isMe ? 12 : 48,
            maxWidth: "75%",
            fontSize: 51, // 17*3
            lineHeight: "66px", // 22*3
            boxShadow: "0 3px 3px rgba(0,0,0,0.1)",
            position: "relative",
            marginBottom: 12,
            opacity,
            transform: `translateY(${translateY}px)`
        }}>
            <div>{msg.text}</div>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 12,
                marginTop: 6,
                fontSize: 33, // 11*3
                color: "rgba(0,0,0,0.45)"
            }}>
                <span>10:42</span> {/* Mock time for now */}
                {isMe && <CheckIcon />}
            </div>
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; layout?: any; isTyping?: boolean }> = ({ messages, layout, isTyping }) => {
    const scrollY = layout?.scrollY || 0;

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden", // Hide scrollbar, we control position manually
            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", // WhatsApp Doodle background
            backgroundSize: "cover"
        }}>
            <div style={{
                padding: "30px 48px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.3s ease-out", // Smooth visual transition if scrollY jumps
                minHeight: "100%"
            }}>
                {messages.map((msg: any) => (
                    <MessageBubble key={msg.id} msg={msg} layout={layout} />
                ))}
                {isTyping && <TypingBubble />}
            </div>
        </div>
    );
};

const InputArea: React.FC<{ text?: string }> = ({ text }) => (
    <div style={{
        minHeight: 180, // 60*3
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        borderTop: "3px solid #d1d1d6",
        gap: 30
    }}>
        <PlusIcon />
        <div style={{
            flex: 1,
            minHeight: 108, // 36*3
            backgroundColor: "white",
            borderRadius: 54, // 18*3
            padding: "24px 48px",
            display: "flex",
            alignItems: "center",
            fontSize: 51,
            color: text ? "black" : "#C7C7CC",
            border: "3px solid #E5E5EA"
        }}>
            {text || "iMessage"}
        </div>
        {text ? (
            <div style={{ color: "#007AFF", fontWeight: "bold", fontSize: 51 }}>Send</div>
        ) : (
            <>
                <CameraIcon />
                <MicIcon />
            </>
        )}
    </div>
);

const Keyboard: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return <div style={{ height: 102 }} />; // Home indicator spacer (34*3)
    return (
        <div style={{
            height: 870, // 290*3
            backgroundColor: "#D1D5DB",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 72,
            color: "#555",
            borderTop: "3px solid #ccc"
        }}>
            Keyboard
        </div>
    );
};

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ backgroundColor: "#E5E5EA", height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
    </div>
);

export const WhatsApp = {
    Root,
    Header,
    MessageList,
    InputArea
};

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: any }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    // Check typing state
    const isTyping = conversation?.typing?.["other"] || false;
    const draftText = ""; // logic to get draft text

    return (
        <WhatsApp.Root>
            <WhatsApp.Header contactName="Alice" />
            <WhatsApp.MessageList messages={messages} layout={layout} isTyping={isTyping} />
            <WhatsApp.InputArea text={draftText} />
            <Keyboard visible={false} />
        </WhatsApp.Root>
    );
};
```

## File: packages/renderer/src/TokovoRenderer.tsx
```typescript
import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./LayoutEngine";
import { NotificationOverlay } from "./NotificationOverlay";
import { VisualDebugger } from "./VisualDebugger";
import { Audio, staticFile } from "remotion";

export const TokovoRenderer: React.FC<{ world: WorldState; t: number; debug?: boolean }> = ({ world, t, debug }) => {
    // 1. Determine active device & app
    // For MVP, we assume single device "alice_phone" or "bob_phone"
    const deviceId = Object.keys(world.devices)[0];
    const device = world.devices[deviceId];
    const appId = device?.foregroundAppId;

    // 2. Compute Layout
    const layout = computeLayout(world, t);

    // 3. Select App View
    let AppView = null;
    if (appId && AppRegistry.views[appId]) {
        AppView = AppRegistry.views[appId];
    }

    // 4. Determine Device Variant (simple heuristic for now)
    const isPixel = device.profileId.includes("pixel");
    const variant = isPixel ? "android" : "ios";

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {/* Audio Layer - Placeholder logic. 
                In a real implementation, we'd map audio events to <Audio /> components with startFrom/endAt 
                or use an AudioContext manager. For now, we assume a simple sound effect if triggered.
            */}
            {/* <Audio src={staticFile("assets/sounds/typing.mp3")} /> */}

            <DeviceFrame profileId={device.profileId} variant={variant}>
                {AppView ? (
                    <AppView world={world} t={t} layout={layout} />
                ) : (
                    <div style={{ flex: 1, backgroundColor: "black" }} /> // Lock screen / Home
                )}

                {/* Overlays */}
                <NotificationOverlay notifications={device?.notifications} variant={variant} />
            </DeviceFrame>

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
```
