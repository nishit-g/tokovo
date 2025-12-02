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
      index.ts
      Root.tsx
      Video.tsx
    package.json
    remotion.config.ts
    tsconfig.json
packages/
  apps-whatsapp/
    src/
      index.ts
      runtime.ts
      types.ts
      ui.tsx
    package.json
    README.md
    tsconfig.json
  core/
    src/
      engine.test.ts
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
      index.ts
      reducer.test.ts
      reducer.ts
      StatusBar.tsx
      types.ts
    package.json
    README.md
    tsconfig.json
  episodes/
    src/
      examples/
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
      registry.ts
      TokovoRenderer.tsx
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
        "@tokovo/core": "workspace:*",
        "@tokovo/devices": "workspace:*",
        "@tokovo/apps-whatsapp": "workspace:*",
        "@tokovo/renderer": "workspace:*",
        "@tokovo/episodes": "workspace:*",
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "remotion": "latest",
        "@remotion/cli": "latest",
        "zod": "^3.0.0"
    },
    "devDependencies": {
        "@types/react": "^18.0.0",
        "@types/web": "^0.0.61",
        "eslint": "^8.0.0",
        "typescript": "^5.0.0",
        "prettier": "^3.0.0"
    }
}
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
        "react": "^18.0.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0"
    }
}
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

## File: packages/core/src/engine.test.ts
```typescript
import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { replay, WorldState, TimelineEvent, ReducerRegistry } from "./index";

// Mock reducer for testing
const mockReducer = (draft: WorldState, event: TimelineEvent) => {
    if (event.kind === "DEVICE" && event.type === "UNLOCK") {
        draft.devices[event.deviceId].isLocked = false;
    }
};

describe("Core Engine", () => {
    it("should replay events correctly", () => {
        // Register mock reducer
        ReducerRegistry.registerDeviceReducer(mockReducer);

        const initialWorld: WorldState = {
            devices: {
                "test_device": { id: "test_device", profileId: "test_profile", isLocked: true }
            },
            conversations: {},
            camera: { type: "APP_VIEW" }
        };

        const events: TimelineEvent[] = [
            { at: 10, kind: "DEVICE", deviceId: "test_device", type: "UNLOCK" }
        ];

        // Replay at t=0 (before event)
        const world0 = replay(initialWorld, events, 0);
        expect(world0.devices["test_device"].isLocked).toBe(true);

        // Replay at t=10 (at event)
        const world10 = replay(initialWorld, events, 10);
        expect(world10.devices["test_device"].isLocked).toBe(false);

        // Replay at t=20 (after event)
        const world20 = replay(initialWorld, events, 20);
        expect(world20.devices["test_device"].isLocked).toBe(false);
    });

    it("should handle multiple events in order", () => {
        const initialWorld: WorldState = {
            devices: {
                "test_device": { id: "test_device", profileId: "test_profile", isLocked: true }
            },
            conversations: {},
            camera: { type: "APP_VIEW" }
        };

        const events: TimelineEvent[] = [
            { at: 10, kind: "DEVICE", deviceId: "test_device", type: "UNLOCK" },
            { at: 20, kind: "DEVICE", deviceId: "test_device", type: "LOCK" } // Assuming mockReducer handled LOCK, but it doesn't. Let's update mockReducer or just test UNLOCK.
        ];

        // Let's use a more comprehensive mock reducer for this test
        const comprehensiveMockReducer = (draft: WorldState, event: TimelineEvent) => {
            if (event.kind === "DEVICE") {
                if (event.type === "UNLOCK") draft.devices[event.deviceId].isLocked = false;
                if (event.type === "LOCK") draft.devices[event.deviceId].isLocked = true;
            }
        };
        ReducerRegistry.registerDeviceReducer(comprehensiveMockReducer);

        const world15 = replay(initialWorld, events, 15);
        expect(world15.devices["test_device"].isLocked).toBe(false);

        const world25 = replay(initialWorld, events, 25);
        expect(world25.devices["test_device"].isLocked).toBe(true);
    });
});
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

## File: packages/devices/src/iphone16/Frame.tsx
```typescript
import React from "react";

export const iPhone16Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{
            width: 1290,
            height: 2796,
            backgroundColor: "black",
            borderRadius: 160,
            padding: 30, // Bezel
            boxSizing: "border-box",
            position: "relative",
            boxShadow: "0 0 0 10px #333, 0 0 0 20px #111" // Outer frame simulation
        }}>
            {/* Screen Area */}
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                borderRadius: 130,
                overflow: "hidden",
                position: "relative"
            }}>
                {children}
            </div>

            {/* Dynamic Island / Notch */}
            <div style={{
                position: "absolute",
                top: 60,
                left: "50%",
                transform: "translateX(-50%)",
                width: 370,
                height: 110,
                backgroundColor: "black",
                borderRadius: 60,
                zIndex: 100
            }} />
        </div>
    );
};
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

## File: packages/devices/src/index.ts
```typescript
export * from "./types";
export * from "./iphone16/profile";
export * from "./types";
export * from "./iphone16/profile";
export * from "./iphone16/Frame";
export * from "./StatusBar";
export * from "./reducer";
```

## File: packages/devices/src/reducer.test.ts
```typescript
import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { deviceReducer } from "./reducer";
import { WorldState, TimelineEvent } from "@tokovo/core";

describe("Device Reducer", () => {
    const initialWorld: WorldState = {
        devices: {
            "test_device": { id: "test_device", profileId: "test_profile", isLocked: true }
        },
        conversations: {},
        camera: { type: "APP_VIEW" }
    };

    it("should handle UNLOCK event", () => {
        const event: TimelineEvent = { at: 10, kind: "DEVICE", deviceId: "test_device", type: "UNLOCK" };
        const nextState = produce(initialWorld, (draft) => {
            deviceReducer(draft, event);
        });
        expect(nextState.devices["test_device"].isLocked).toBe(false);
    });

    it("should handle OPEN_APP event", () => {
        // First unlock
        const unlockedState = produce(initialWorld, (draft) => {
            draft.devices["test_device"].isLocked = false;
        });

        const event: TimelineEvent = { at: 20, kind: "DEVICE", deviceId: "test_device", type: "OPEN_APP", appId: "app_test" };
        const nextState = produce(unlockedState, (draft) => {
            deviceReducer(draft, event);
        });
        expect(nextState.devices["test_device"].foregroundAppId).toBe("app_test");
    });

    it("should handle CLOSE_APP event", () => {
        const openAppState = produce(initialWorld, (draft) => {
            draft.devices["test_device"].isLocked = false;
            draft.devices["test_device"].foregroundAppId = "app_test";
        });

        const event: TimelineEvent = { at: 30, kind: "DEVICE", deviceId: "test_device", type: "CLOSE_APP" };
        const nextState = produce(openAppState, (draft) => {
            deviceReducer(draft, event);
        });
        expect(nextState.devices["test_device"].foregroundAppId).toBeUndefined();
    });
});
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
        }
    });
}

// Register itself
ReducerRegistry.registerDeviceReducer(deviceReducer);
```

## File: packages/devices/src/StatusBar.tsx
```typescript
import React from "react";

export const StatusBar: React.FC<{ time?: string }> = ({ time = "9:41" }) => {
    return (
        <div style={{
            width: "100%",
            height: 60, // Approximate status bar height
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 30px",
            boxSizing: "border-box",
            fontSize: 24,
            fontWeight: "bold",
            color: "black",
            position: "absolute",
            top: 15,
            left: 0,
            zIndex: 20
        }}>
            <div>{time}</div>
            <div style={{ display: "flex", gap: 10 }}>
                {/* Icons placeholders */}
                <span>📶</span>
                <span>Wi-Fi</span>
                <span>🔋</span>
            </div>
        </div>
    );
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
        "react": "^18.0.0"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0"
    }
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

## File: packages/episodes/src/index.ts
```typescript
import exampleEpisode from "./examples/whatsapp-breakup-01.json";

export * from "./schema";
export { exampleEpisode };
```

## File: packages/episodes/src/schema.ts
```typescript
import { z } from "zod";

export const DeviceEventSchema = z.object({
    at: z.number(),
    kind: z.literal("DEVICE"),
    deviceId: z.string(),
    type: z.enum(["LOCK", "UNLOCK", "OPEN_APP", "CLOSE_APP"]),
    appId: z.string().optional()
});

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

export const TimelineEventSchema = z.discriminatedUnion("kind", [
    DeviceEventSchema,
    AppEventSchema,
    CameraEventSchema
]);

export const EpisodeSchema = z.object({
    initialWorld: z.object({
        devices: z.record(z.any()),
        conversations: z.record(z.any()),
        camera: z.any()
    }),
    events: z.array(TimelineEventSchema)
});
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

## File: packages/renderer/src/DeviceFrame.tsx
```typescript
import React from "react";
import { DeviceProfile, iPhone16Frame, StatusBar } from "@tokovo/devices";

export const DeviceFrame: React.FC<{ profile: DeviceProfile; children: React.ReactNode }> = ({ profile, children }) => {
    // Strategy pattern: Select frame component based on profile ID
    // In a full implementation, this might be a registry lookup
    const FrameComponent = profile.id === "iphone16" ? iPhone16Frame : React.Fragment;

    return (
        <FrameComponent>
            <StatusBar time="10:41" />
            {children}
        </FrameComponent>
    );
};
```

## File: packages/renderer/src/index.ts
```typescript
export * from "./registry";
export * from "./LayoutEngine";
export * from "./DeviceFrame";
export * from "./TokovoRenderer";
```

## File: packages/renderer/src/LayoutEngine.ts
```typescript
import { WorldState } from "@tokovo/core";

export function computeLayout(world: WorldState) {
    // Placeholder for layout engine logic
    // In the future, this would compute scroll positions, bubble sizes, etc.
    return {
        // ...
    };
}
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
        "react": "^18.0.0",
        "remotion": "latest"
    },
    "devDependencies": {
        "typescript": "^5.0.0",
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0"
    }
}
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

## File: apps/video-runner/src/Root.tsx
```typescript
import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";

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
        </>
    );
};
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
                "messages": []
            }
        },
        "camera": {
            "type": "APP_VIEW",
            "appId": "app_whatsapp"
        }
    },
    "events": [
        {
            "at": 0,
            "kind": "DEVICE",
            "deviceId": "alice_phone",
            "type": "UNLOCK"
        },
        {
            "at": 10,
            "kind": "DEVICE",
            "deviceId": "alice_phone",
            "type": "OPEN_APP",
            "appId": "app_whatsapp"
        },
        {
            "at": 30,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "other"
        },
        {
            "at": 60,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "other"
        },
        {
            "at": 65,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "other",
            "text": "We need to talk..."
        }
    ]
}
```

## File: packages/renderer/src/registry.ts
```typescript
import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView
    } as Record<string, React.FC<{ world: WorldState; t?: number }>>,

    getView(appId: string) {
        return this.views[appId];
    }
};
```

## File: packages/renderer/src/TokovoRenderer.tsx
```typescript
import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceProfile } from "@tokovo/devices";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";

export const TokovoRenderer: React.FC<{ world: WorldState; deviceId: string; deviceProfile: DeviceProfile; t?: number }> = ({ world, deviceId, deviceProfile, t = 0 }) => {
    const deviceState = world.devices[deviceId];
    if (!deviceState) {
        return <div style={{ color: "red" }}>Device {deviceId} not found</div>;
    }

    const activeAppId = deviceState.foregroundAppId;
    const AppView = activeAppId ? AppRegistry.getView(activeAppId) : null;

    return (
        <DeviceFrame profile={deviceProfile}>
            {AppView ? <AppView world={world} t={t} /> : <div style={{ backgroundColor: "black", height: "100%" }} />}
        </DeviceFrame>
    );
};
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

## File: packages/apps-whatsapp/src/ui.tsx
```typescript
import React, { useEffect, useRef } from "react";
import { WorldState } from "@tokovo/core";

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

const MessageBubble: React.FC<{ msg: any; t: number }> = ({ msg, t }) => {
    const isMe = msg.from === "me";

    // Animation logic
    const age = t - msg.at;
    const opacity = Math.min(Math.max(age / 10, 0), 1); // Fade in over 10 frames
    const translateY = Math.max(60 - age * 6, 0); // Slide up (scaled)

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

const MessageList: React.FC<{ messages: any[]; t: number }> = ({ messages, t }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <div style={{
            flex: 1,
            padding: "30px 48px", // 10*3, 16*3
            display: "flex",
            flexDirection: "column",
            gap: 18,
            overflowY: "auto",
            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", // WhatsApp Doodle background
            backgroundSize: "cover"
        }}>
            {messages.map((msg: any) => (
                <MessageBubble key={msg.id} msg={msg} t={t} />
            ))}
            <div ref={bottomRef} />
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

export const WhatsappChatView: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    // Determine if typing (mock logic for now, ideally from state)
    const isTyping = false; // logic to check if 'me' is typing
    const draftText = ""; // logic to get draft text

    return (
        <WhatsApp.Root>
            <WhatsApp.Header contactName="Alice" />
            <WhatsApp.MessageList messages={messages} t={t} />
            <WhatsApp.InputArea text={draftText} />
            <Keyboard visible={isTyping} />
        </WhatsApp.Root>
    );
};
```

## File: packages/core/src/types.ts
```typescript
export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface DeviceState {
    id: DeviceId; // The instance ID (e.g., "alice_phone")
    profileId: string; // The hardware profile ID (e.g., "iphone16")
    isLocked: boolean;
    foregroundAppId?: AppId;
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
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig };
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
    const world = replay(exampleEpisode.initialWorld as WorldState, exampleEpisode.events as any, t);

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
                <TokovoRenderer world={world} deviceId="alice_phone" deviceProfile={iPhone16Profile} t={t} />
            </div>
        </div>
    );
};
```
