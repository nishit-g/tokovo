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
- Files matching these patterns are excluded: *.md, *.mp3
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
      sounds/
        notification.mp3
        whatsapp-received.mp3
        whatsapp-sent.mp3
    src/
      AndroidVideo.tsx
      BreakupDramaDSLVideo.tsx
      CameraShowcaseVideo.tsx
      HomeScreenGroupDemoVideo.tsx
      index.ts
      InstagramVideo.tsx
      MultiPovDemoVideo.tsx
      NotificationCallDemoVideo.tsx
      Root.tsx
      Video.tsx
      WhatsappPsychoticDemoVideo.tsx
    package.json
    remotion.config.ts
    tsconfig.json
packages/
  adapters/
    src/
      whatsapp/
        index.ts
      adapter.ts
      index.ts
      registry.ts
    package.json
    tsconfig.json
    tsconfig.tsbuildinfo
  apps-instagram/
    src/
      views/
        dm/
          InstagramChatView.tsx
        explore/
          ExploreView.tsx
        feed/
          FeedView.tsx
        notifications/
          NotificationsView.tsx
        post/
          PostView.tsx
        profile/
          ProfileView.tsx
        reels/
          ReelsView.tsx
        stories/
          StoriesView.tsx
        BottomNav.tsx
      index.ts
      runtime.ts
      types.ts
      ui.tsx
    package.json
    tsconfig.json
  apps-whatsapp/
    src/
      components/
        icons/
          index.tsx
        Header.tsx
        index.ts
        MessageBubble.tsx
      index.ts
      plugin.ts
      runtime.ts
      types.ts
      TypingBubble.tsx
      ui.tsx
    package.json
    README.md
    tsconfig.json
  compiler/
    src/
      passes/
        index.ts
        normalize.ts
        resolve-refs.ts
        sort.ts
        time-lowering.ts
        validate.ts
        virtual-device.ts
      compile.ts
      context.ts
      generate.ts
      index.ts
    package.json
    tsconfig.json
    tsconfig.tsbuildinfo
  core/
    src/
      camera/
        index.ts
      director-lite/
        derive.ts
        index.ts
        rules.ts
        signals.ts
        types.ts
      constants.ts
      engine.ts
      eventUtils.ts
      index.ts
      plugin.ts
      sounds.ts
      tokens.ts
      transitions.ts
      typeGuards.ts
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
  dsl/
    examples/
      breakup-01.dsl.ts
    src/
      author/
        beat-builder.ts
        device-builder.ts
        episode-builder.ts
        index.ts
      index.ts
      types.ts
    package.json
    tsconfig.json
    tsconfig.tsbuildinfo
  episodes/
    src/
      examples/
        android-test.json
        camera-showcase.json
        homescreen-group-demo.json
        instagram-test.json
        multi-pov-demo.json
        notification-call-demo.json
        whatsapp-breakup-01.json
        whatsapp-psychotic-demo.json
      index.ts
      schema.ts
    package.json
    tsconfig.json
  ir/
    src/
      index.ts
      ordering.ts
      scene.ts
      timeline.ts
      trace.ts
      validate.ts
    package.json
    tsconfig.json
    tsconfig.tsbuildinfo
  renderer/
    src/
      layout/
        strategies/
          chat.ts
          feed.ts
          lockscreen.ts
          story.ts
          transition.ts
        config.ts
        director-adapter.ts
        index.ts
        types.ts
      shared/
        Components.tsx
        index.ts
      AppTransition.tsx
      AudioLayer.tsx
      CallOverlay.tsx
      camera-composer.ts
      DeviceFrame.tsx
      HeadsUpNotification.tsx
      HomeScreenView.tsx
      index.ts
      LockscreenView.tsx
      MultiDeviceRenderer.tsx
      NotificationOverlay.tsx
      registry.ts
      TokovoRenderer.tsx
      types.ts
      VisualDebugger.tsx
    package.json
    README.md
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

## File: apps/video-runner/src/BreakupDramaDSLVideo.tsx
````typescript
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * DSL Breakup Drama Episode
 * 
 * This episode is defined using the DSL and compiled inline.
 * DirectorLite enabled - camera automatically reacts to events.
 */

// Define the episode inline (later this will come from DSL compilation)
function createBreakupDramaEpisode(): { initialWorld: WorldState; events: TimelineEvent[] } {
    const fps = 30;

    // Initial world state
    const initialWorld: WorldState = {
        devices: {
            AlicePhone: {
                id: "AlicePhone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            }
        },
        conversations: {
            dm_bob: {
                id: "dm_bob",
                type: "dm" as const,
                name: "Bob",
                avatar: undefined,
                messages: [],
                typing: {},
            }
        },
        appState: {
            app_whatsapp: {
                screen: "chat",
                conversationId: "dm_bob",
            }
        },
        camera: {
            baseView: "APP_VIEW" as const,
            activeDeviceId: "AlicePhone",
            layout: {
                mode: "SINGLE" as const,
                primaryDeviceId: "AlicePhone",
            },
            activeEffects: [],
            transform: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotation: 0,
                originX: 0.5,
                originY: 0.5,
                shakeX: 0,
                shakeY: 0,
            },
            deviceTransforms: {},
        },
        audio: { activeSounds: {} },
    };

    // Timeline events (what DSL compiler would generate)
    const events: TimelineEvent[] = [
        // Beat: silence - just wait 2s (60 frames)

        // Beat: typing-tension (starts at frame 60)
        {
            at: 60,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,

        // Concurrent: message arrives at frame 81 (0.7s after typing starts)
        {
            at: 81,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob",
            message: {
                id: "msg_1",
                type: "text",
                text: "We need to talk.",
                status: "delivered",
            },
        } as any,

        // Typing ends at frame 105 (1.5s after start)
        {
            at: 105,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,

        // Beat: aftermath (starts at frame 120)
        {
            at: 120,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "Bob",
            message: {
                id: "msg_2",
                type: "text",
                text: "I'm sorry. It's over.",
                status: "delivered",
            },
        } as any,

        // Read message at frame 156 (1.2s later)
        {
            at: 156,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_READ",
            conversationId: "dm_bob",
            messageId: "msg_2",
        } as any,

        // Beat: panic (starts at frame 171)
        {
            at: 171,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "me",
            message: {
                id: "msg_3",
                type: "text",
                text: "Wait, what?",
                status: "sent",
            },
        } as any,

        // Second panic message at frame 195
        {
            at: 195,
            kind: "APP",
            appId: "app_whatsapp",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_bob",
            from: "me",
            message: {
                id: "msg_4",
                type: "text",
                text: "Can we talk about this?",
                status: "sent",
            },
        } as any,

        // Beat: silence-after (starts at frame 225)
        // Wait 2s then Bob starts typing...
        {
            at: 285,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_START",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,

        // Typing ends but no message...
        {
            at: 345,
            kind: "APP",
            appId: "app_whatsapp",
            type: "TYPING_END",
            conversationId: "dm_bob",
            from: "Bob",
        } as any,
    ];

    return { initialWorld, events };
}

export const BreakupDramaDSLVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Get episode data
    const episode = useMemo(() => createBreakupDramaEpisode(), []);

    // Create event index for DirectorLite
    const eventIndex = useMemo(
        () => createEventIndex(episode.events),
        [episode.events]
    );

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a2e",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={true}
                />
            </div>
        </AbsoluteFill>
    );
};
````

## File: apps/video-runner/src/CameraShowcaseVideo.tsx
````typescript
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraShowcase } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * CameraShowcaseVideo
 * Demonstrates the cinematic camera system:
 * - ZOOM with different easing functions
 * - PAN for smooth translation
 * - SHAKE with frequency and decay
 * - FOCUS on specific points
 * - RESET to return to default view
 * - Combo effects (zoom + shake)
 */
export const CameraShowcaseVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = cameraShowcase as { initialWorld: WorldState; events: TimelineEvent[] };

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
````

## File: apps/video-runner/src/HomeScreenGroupDemoVideo.tsx
````typescript
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { homeScreenGroupDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * HomeScreenGroupDemoVideo
 * Demonstrates Home Screen and WhatsApp Group Chat features:
 * - Configurable home screen with app grid
 * - Dock with badges
 * - WhatsApp group chat with system messages
 * - Group member add/remove events
 */
export const HomeScreenGroupDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = homeScreenGroupDemo as { initialWorld: WorldState; events: TimelineEvent[] };

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a2e",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                />
            </div>
        </AbsoluteFill>
    );
};
````

## File: apps/video-runner/src/index.ts
````typescript
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
````

## File: apps/video-runner/src/MultiPovDemoVideo.tsx
````typescript
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { multiPovDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { MultiDeviceRenderer } from "@tokovo/renderer";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * MultiPovDemoVideo
 * Demonstrates the multi-device POV system:
 * - Multiple phones (Alice and Bob)
 * - CUT between devices
 * - SPLIT_HORIZONTAL layout (side by side)
 * - SPLIT_VERTICAL layout (stacked)
 * - PIP layout (picture in picture)
 */
export const MultiPovDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = multiPovDemo as { initialWorld: WorldState; events: TimelineEvent[] };

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#0a0a1a",
        }}>
            <MultiDeviceRenderer
                world={world}
                t={t}
                debug={false}
                compositionWidth={1080}
                compositionHeight={1920}
            />
        </AbsoluteFill>
    );
};
````

## File: apps/video-runner/src/NotificationCallDemoVideo.tsx
````typescript
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { notificationCallDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * NotificationCallDemoVideo
 * Demonstrates all notification and call features:
 * - Lockscreen notifications
 * - Heads-up notifications  
 * - Incoming voice call
 * - Active call with timer
 * - FaceTime call
 */
export const NotificationCallDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame; // Using frame as time unit

    // Episode data
    const episode = notificationCallDemo as { initialWorld: WorldState; events: TimelineEvent[] };

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a2e",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                    notificationConfig={{
                        headsUpDuration: 150, // 5 seconds
                        showHeadsUpWhenAppOpen: true
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
````

## File: apps/video-runner/remotion.config.ts
````typescript
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
````

## File: apps/video-runner/tsconfig.json
````json
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
````

## File: packages/adapters/src/whatsapp/index.ts
````typescript
/**
 * WhatsApp Adapter
 * 
 * Transforms Timeline IR operations to WhatsApp runtime events.
 * These events match the format expected by @tokovo/apps-whatsapp.
 */

import { TimelineOp } from "@tokovo/ir";
import { AppAdapter, RuntimeEvent, AdapterContext } from "../adapter";

/**
 * WhatsApp adapter implementation.
 */
export const WhatsAppAdapter: AppAdapter = {
    appId: "app_whatsapp",

    supports(op: TimelineOp): boolean {
        // Handle all app-related operations for WhatsApp
        if ("appId" in op && op.appId === "app_whatsapp") {
            return true;
        }
        // Also handle device operations targeting WhatsApp
        return false;
    },

    lower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[] {
        switch (op.kind) {
            case "DeviceUnlocked":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "UNLOCK",
                    deviceId: op.deviceId,
                    _trace: op.trace,
                }];

            case "AppOpened":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "OPEN_APP",
                    deviceId: op.deviceId,
                    appId: op.appId,
                    _trace: op.trace,
                }];

            case "ConversationOpened":
                // WhatsApp uses app state to navigate to conversation
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "NAVIGATE",
                    appId: op.appId,
                    screen: "chat",
                    conversationId: op.conversationId,
                    _trace: op.trace,
                }];

            case "TypingStarted":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "TYPING_START",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: op.actor,
                    _trace: op.trace,
                }];

            case "TypingEnded":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "TYPING_END",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: op.actor,
                    _trace: op.trace,
                }];

            case "MessageReceived":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_RECEIVED",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: op.message.from,
                    message: {
                        id: op.message.id,
                        type: op.message.type ?? "text",
                        text: op.message.text,
                        status: "delivered",
                        timestamp: op.message.timestamp,
                    },
                    _trace: op.trace,
                }];

            case "MessageSent":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_RECEIVED",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    from: "me",
                    message: {
                        id: op.message.id,
                        type: op.message.type ?? "text",
                        text: op.message.text,
                        status: "sent",
                        timestamp: op.message.timestamp,
                    },
                    _trace: op.trace,
                }];

            case "MessageRead":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_READ",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    messageId: op.messageId,
                    _trace: op.trace,
                }];

            case "MessageDeleted":
                return [{
                    at: op.at,
                    kind: "APP",
                    type: "MESSAGE_DELETED",
                    appId: op.appId,
                    conversationId: op.conversationId,
                    messageId: op.messageId,
                    _trace: op.trace,
                }];

            default:
                return [];
        }
    },
};
````

## File: packages/adapters/src/adapter.ts
````typescript
/**
 * Adapter Interface
 * 
 * Adapters translate Timeline IR → Runtime Events.
 * Each adapter is responsible for a specific app/platform.
 */

import { TimelineOp, Trace } from "@tokovo/ir";

/**
 * Runtime event that the Tokovo engine can execute.
 * This matches the existing TimelineEvent structure in @tokovo/core.
 */
export interface RuntimeEvent {
    at: number;
    kind: "DEVICE" | "APP" | "CAMERA" | "AUDIO";
    type: string;
    deviceId?: string;
    appId?: string;
    [key: string]: unknown;

    /** Preserved trace for debugging */
    _trace?: Trace;
}

/**
 * Adapter context provides environment info.
 */
export interface AdapterContext {
    fps: number;
    episodeId: string;
}

/**
 * App adapter interface.
 */
export interface AppAdapter {
    /** App ID this adapter handles */
    readonly appId: string;

    /** Check if this adapter can handle the operation */
    supports(op: TimelineOp): boolean;

    /** Transform Timeline IR op to runtime events */
    lower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[];
}
````

## File: packages/adapters/src/index.ts
````typescript
/**
 * @tokovo/adapters
 * 
 * Timeline IR → Runtime Events transformation.
 * 
 * Usage:
 * ```ts
 * import { adapterRegistry } from "@tokovo/adapters";
 * 
 * const runtimeEvents = adapterRegistry.lowerAll(timelineIR);
 * ```
 */

export * from "./adapter";
export { WhatsAppAdapter } from "./whatsapp";
export { adapterRegistry } from "./registry";
````

## File: packages/adapters/src/registry.ts
````typescript
/**
 * Adapter Registry
 * 
 * Central registry for all app adapters.
 * Allows looking up adapters by app ID.
 */

import { TimelineOp, TimelineIR } from "@tokovo/ir";
import { AppAdapter, RuntimeEvent, AdapterContext } from "./adapter";
import { WhatsAppAdapter } from "./whatsapp";

/**
 * Registry of all available adapters.
 */
class AdapterRegistry {
    private adapters: Map<string, AppAdapter> = new Map();

    constructor() {
        // Register default adapters
        this.register(WhatsAppAdapter);
    }

    /**
     * Register an adapter.
     */
    register(adapter: AppAdapter): void {
        this.adapters.set(adapter.appId, adapter);
    }

    /**
     * Get adapter for an app ID.
     */
    get(appId: string): AppAdapter | undefined {
        return this.adapters.get(appId);
    }

    /**
     * Find an adapter that can handle the operation.
     */
    findFor(op: TimelineOp): AppAdapter | undefined {
        for (const adapter of this.adapters.values()) {
            if (adapter.supports(op)) {
                return adapter;
            }
        }
        return undefined;
    }

    /**
     * Lower all Timeline IR operations to runtime events.
     */
    lowerAll(timeline: TimelineIR): RuntimeEvent[] {
        const ctx: AdapterContext = {
            fps: timeline.fps,
            episodeId: timeline.episodeId,
        };

        const events: RuntimeEvent[] = [];

        for (const op of timeline.ops) {
            const adapter = this.findFor(op);
            if (adapter) {
                events.push(...adapter.lower(op, ctx));
            } else {
                // Fallback: try generic lowering
                events.push(...this.genericLower(op, ctx));
            }
        }

        // Sort by frame
        return events.sort((a, b) => a.at - b.at);
    }

    /**
     * Generic lowering for operations without specific adapter.
     */
    private genericLower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[] {
        switch (op.kind) {
            case "DeviceUnlocked":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "UNLOCK",
                    deviceId: op.deviceId,
                }];

            case "AppOpened":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "OPEN_APP",
                    deviceId: op.deviceId,
                    appId: op.appId,
                }];

            default:
                console.warn(`No adapter found for operation: ${op.kind}`);
                return [];
        }
    }
}

/**
 * Default adapter registry instance.
 */
export const adapterRegistry = new AdapterRegistry();
````

## File: packages/adapters/package.json
````json
{
    "name": "@tokovo/adapters",
    "version": "0.0.1",
    "description": "Tokovo Adapters - Timeline IR to Runtime Events",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "files": [
        "dist"
    ],
    "scripts": {
        "build": "tsc",
        "dev": "tsc --watch"
    },
    "dependencies": {
        "@tokovo/ir": "workspace:*"
    },
    "devDependencies": {
        "typescript": "^5.0.0"
    }
}
````

## File: packages/adapters/tsconfig.json
````json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "declaration": true,
        "declarationMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}
````

## File: packages/adapters/tsconfig.tsbuildinfo
````
{"root":["./src/adapter.ts","./src/index.ts","./src/registry.ts","./src/whatsapp/index.ts"],"version":"5.9.3"}
````

## File: packages/apps-instagram/src/views/explore/ExploreView.tsx
````typescript
import React from "react";
import { InstagramState } from "../../types";

const SearchBar = () => (
    <div style={{
        height: 80,
        backgroundColor: "#262626",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        margin: "20px 30px",
        gap: 20
    }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div style={{ fontSize: 32, color: "#888" }}>Search</div>
    </div>
);

export const ExploreView: React.FC<{ state: InstagramState }> = ({ state }) => {
    // Generate some mock explore content
    const exploreItems = Array.from({ length: 15 }).map((_, i) => ({
        id: `exp_${i}`,
        image: `https://picsum.photos/seed/exp${i}/500/500`,
        isLarge: i % 10 === 0 // Every 10th item is large (2x2)
    }));

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{ marginTop: 60 }}>
                <SearchBar />
            </div>

            <div style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                alignContent: "flex-start"
            }}>
                {exploreItems.map((item, i) => (
                    <div key={item.id} style={{
                        width: item.isLarge ? "calc(66.66% - 2px)" : "calc(33.33% - 2px)",
                        aspectRatio: item.isLarge ? "1/1" : "1/1",
                        backgroundColor: "#222",
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative"
                    }}>
                        {i % 5 === 0 && (
                            <div style={{ position: "absolute", top: 10, right: 10 }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                                    <path d="M2 2l20 20" stroke="none" />
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="none" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/views/notifications/NotificationsView.tsx
````typescript
import React from "react";
import { InstagramState } from "../../types";

const NotificationItem: React.FC<{ type: string; username: string; time: string; text?: string; avatar: string }> = ({ type, username, time, text, avatar }) => (
    <div style={{ display: "flex", alignItems: "center", padding: "20px 30px", gap: 20 }}>
        <div style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            backgroundImage: `url(${avatar})`,
            backgroundSize: "cover",
            backgroundColor: "#333"
        }} />
        <div style={{ flex: 1, fontSize: 30, lineHeight: "1.3" }}>
            <span style={{ fontWeight: "bold" }}>{username}</span>
            {" "}
            {type === "like" && "liked your photo."}
            {type === "follow" && "started following you."}
            {type === "comment" && `commented: ${text}`}
            {" "}
            <span style={{ color: "#888" }}>{time}</span>
        </div>
        {type === "follow" ? (
            <div style={{
                backgroundColor: "#0095f6",
                color: "white",
                padding: "10px 30px",
                borderRadius: 10,
                fontSize: 28,
                fontWeight: "600"
            }}>
                Follow
            </div>
        ) : (
            <div style={{
                width: 90,
                height: 90,
                backgroundColor: "#333",
                backgroundImage: `url(https://picsum.photos/seed/post1/100/100)`, // Mock post image
                backgroundSize: "cover"
            }} />
        )}
    </div>
);

export const NotificationsView: React.FC<{ state: InstagramState }> = ({ state }) => {
    // Mock notifications
    const notifications = [
        { id: "n1", type: "like", username: "alice_wonder", time: "2m", avatar: "https://i.pravatar.cc/150?u=alice" },
        { id: "n2", type: "follow", username: "bob_builder", time: "15m", avatar: "https://i.pravatar.cc/150?u=bob" },
        { id: "n3", type: "comment", username: "charlie_chaplin", time: "1h", text: "Great shot! 🔥", avatar: "https://i.pravatar.cc/150?u=charlie" },
        { id: "n4", type: "like", username: "dave_diver", time: "3h", avatar: "https://i.pravatar.cc/150?u=dave" },
        { id: "n5", type: "follow", username: "eve_hacker", time: "5h", avatar: "https://i.pravatar.cc/150?u=eve" },
    ];

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                padding: "0 30px",
                marginTop: 60,
                fontSize: 42,
                fontWeight: "bold",
                borderBottom: "1px solid #222"
            }}>
                Notifications
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ padding: "20px 0" }}>
                    <div style={{ padding: "0 30px 20px", fontSize: 32, fontWeight: "bold" }}>New</div>
                    {notifications.slice(0, 2).map(n => (
                        <NotificationItem key={n.id} {...n} />
                    ))}
                    <div style={{ padding: "40px 30px 20px", fontSize: 32, fontWeight: "bold" }}>Today</div>
                    {notifications.slice(2).map(n => (
                        <NotificationItem key={n.id} {...n} />
                    ))}
                </div>
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/views/post/PostView.tsx
````typescript
import React from "react";
import { InstagramState } from "../../types";

// Reuse icons from FeedView or create shared icon library
const BackIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={filled ? "#ed4956" : "none"} stroke={filled ? "#ed4956" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CommentIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

export const PostView: React.FC<{ state: InstagramState }> = ({ state }) => {
    // Mock single post data
    const post = {
        username: "instagram_user",
        avatar: "https://i.pravatar.cc/150?u=instagram_user",
        image: "https://picsum.photos/seed/insta1/1080/1080",
        caption: "Living my best life! 🌟 #blessed",
        likes: 1234,
        comments: 42,
        liked: false,
        saved: false
    };

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Header */}
            <div style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                padding: "0 30px",
                marginTop: 60,
                borderBottom: "1px solid #222"
            }}>
                <BackIcon />
                <div style={{ marginLeft: 30, fontSize: 36, fontWeight: "bold" }}>Posts</div>
            </div>

            {/* Post Content (Similar to Feed Item) */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", padding: "20px 30px" }}>
                    <div style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        backgroundImage: `url(${post.avatar})`,
                        backgroundSize: "cover",
                        backgroundColor: "#333",
                        marginRight: 20
                    }} />
                    <div style={{ flex: 1, color: "white", fontSize: 32, fontWeight: "600" }}>{post.username}</div>
                    <div style={{ color: "white", fontSize: 40 }}>...</div>
                </div>

                <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    backgroundColor: "#222",
                    backgroundImage: `url(${post.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 30px" }}>
                    <div style={{ display: "flex", gap: 40 }}>
                        <HeartIcon filled={post.liked} />
                        <CommentIcon />
                        <ShareIcon />
                    </div>
                    <BookmarkIcon filled={post.saved} />
                </div>

                <div style={{ padding: "0 30px" }}>
                    <div style={{ color: "white", fontSize: 32, fontWeight: "600", marginBottom: 10 }}>
                        {post.likes.toLocaleString()} likes
                    </div>
                    <div style={{ color: "white", fontSize: 32 }}>
                        <span style={{ fontWeight: "600", marginRight: 10 }}>{post.username}</span>
                        {post.caption}
                    </div>
                    <div style={{ color: "#888", fontSize: 28, marginTop: 10 }}>
                        View all {post.comments} comments
                    </div>
                    <div style={{ color: "#888", fontSize: 24, marginTop: 10, textTransform: "uppercase" }}>
                        2 hours ago
                    </div>
                </div>
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/types.ts
````typescript
export type InstagramView = 'dm' | 'feed' | 'stories' | 'profile' | 'post' | 'explore' | 'notifications' | 'reels';

export interface Post {
    id: string;
    username: string;
    avatar: string;
    image: string;
    caption: string;
    likes: number;
    comments: number;
    liked: boolean;
    saved: boolean;
}

export interface Story {
    id: string;
    image: string;
    seen: boolean;
}

export interface StoryUser {
    username: string;
    avatar: string;
    stories: Story[];
    hasUnseen: boolean;
}

export interface Notification {
    id: string;
    type: 'like' | 'follow' | 'comment' | 'mention';
    username: string;
    avatar: string;
    text?: string;
    time: string;
}

export interface InstagramState {
    currentView: InstagramView;
    feed: {
        posts: Post[];
        scrollPosition: number;
    };
    stories: {
        users: StoryUser[];
        activeStoryId?: string;
    };
    notifications: {
        items: Notification[];
    };
    // Add other module states here
}

export const initialInstagramState: InstagramState = {
    currentView: 'dm', // Default to DM for now as it's the most developed
    feed: {
        posts: [],
        scrollPosition: 0
    },
    stories: {
        users: [],
    },
    notifications: {
        items: []
    }
};
````

## File: packages/apps-instagram/package.json
````json
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
````

## File: packages/apps-instagram/tsconfig.json
````json
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
````

## File: packages/apps-whatsapp/src/components/icons/index.tsx
````typescript
/**
 * WhatsApp Icons - Authentic iOS SVG replicas
 */

import React from "react";

export const ChevronLeftIcon = () => (
    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const VideoCallIcon = () => (
    <svg width="84" height="60" viewBox="0 0 28 20" fill="none">
        <rect x="1" y="3" width="18" height="14" rx="3" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M19 8L26 4V16L19 12V8Z" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

export const PhoneCallIcon = () => (
    <svg width="60" height="60" viewBox="0 0 20 20" fill="none">
        <path d="M18.5 14.3V16.8C18.5 17.4 18.1 17.9 17.5 18C17.1 18 16.7 18 16.3 18C8.5 17.3 2.7 11.5 2 3.7C2 3.3 2 2.9 2 2.5C2.1 1.9 2.6 1.5 3.2 1.5H5.7C6.2 1.5 6.6 1.8 6.7 2.3C6.8 3 7 3.7 7.2 4.3C7.3 4.7 7.2 5.1 6.9 5.4L5.7 6.6C6.9 8.8 8.7 10.6 10.9 11.8L12.1 10.6C12.4 10.3 12.8 10.2 13.2 10.3C13.8 10.5 14.5 10.7 15.2 10.8C15.7 10.9 16 11.3 16 11.8V14.3H18.5Z" stroke="#007AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlusCircleIcon = () => (
    <svg width="90" height="90" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="14" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M15 8V22M8 15H22" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const CameraFillIcon = () => (
    <svg width="84" height="72" viewBox="0 0 28 24" fill="#007AFF">
        <path d="M4 6C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H24C25.1 22 26 21.1 26 20V8C26 6.9 25.1 6 24 6H20L18 3H10L8 6H4ZM14 18C11.2 18 9 15.8 9 13C9 10.2 11.2 8 14 8C16.8 8 19 10.2 19 13C19 15.8 16.8 18 14 18Z" />
    </svg>
);

export const MicrophoneFillIcon = () => (
    <svg width="66" height="90" viewBox="0 0 22 30" fill="#007AFF">
        <rect x="6" y="2" width="10" height="16" rx="5" />
        <path d="M4 14V15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15V14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M11 23V28M8 28H14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const DoubleCheckIcon: React.FC<{ read?: boolean }> = ({ read = false }) => (
    <svg width="48" height="30" viewBox="0 0 16 10" fill="none">
        <path d="M1 5L4 8L10 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8 8L14 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M8 5V19L19 12L8 5Z" />
    </svg>
);

export const PauseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
    </svg>
);
````

## File: packages/apps-whatsapp/src/components/Header.tsx
````typescript
/**
 * WhatsApp Header Component
 * 
 * Authentic iOS WhatsApp navigation bar with configurable contact info.
 */

import React from "react";
import { Platform, getAppConfig, getTokens } from "@tokovo/core";
import { ChevronLeftIcon, VideoCallIcon, PhoneCallIcon } from "./icons";

export interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
    platform?: Platform;
}

export const Header: React.FC<HeaderProps> = ({
    contactName,
    avatarUrl,
    status = "online",
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            height: config.headerHeight,
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `0 ${config.bubbleMarginHorizontal}px`,
            marginTop: config.statusBarHeight,
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            zIndex: 10,
            fontFamily: tokens.fontFamily
        }}>
            {/* Back button with unread count */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <ChevronLeftIcon />
                <span style={{
                    fontSize: config.headerTitleSize,
                    color: platform === "ios" ? "#007AFF" : "#FFFFFF",
                    fontWeight: "400"
                }}>
                    4
                </span>
            </div>

            {/* Avatar + Name + Status (centered group) */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: -60
            }}>
                {/* Avatar */}
                <div style={{
                    width: config.avatarSize,
                    height: config.avatarSize,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginRight: config.avatarMargin,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: config.avatarSize * 0.4,
                    fontWeight: "600"
                }}>
                    {!avatarUrl && contactName.charAt(0).toUpperCase()}
                </div>

                {/* Name & Status */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{
                        fontSize: config.headerTitleSize,
                        fontWeight: "600",
                        color: platform === "ios" ? "#000000" : "#FFFFFF",
                        letterSpacing: -0.5
                    }}>
                        {contactName}
                    </span>
                    <span style={{
                        fontSize: config.headerSubtitleSize,
                        color: platform === "ios" ? "#8E8E93" : "rgba(255,255,255,0.7)"
                    }}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Action icons */}
            <div style={{ display: "flex", gap: config.headerIconGap, alignItems: "center" }}>
                <VideoCallIcon />
                <PhoneCallIcon />
            </div>
        </div>
    );
};
````

## File: packages/apps-whatsapp/src/components/index.ts
````typescript
/**
 * WhatsApp Components Index
 * 
 * Re-exports all WhatsApp UI components for easy importing.
 */

// Icons
export * from "./icons";

// Components
export { Header, type HeaderProps } from "./Header";
export { MessageBubble, type MessageBubbleProps, type MessageData } from "./MessageBubble";
````

## File: packages/apps-whatsapp/src/components/MessageBubble.tsx
````typescript
/**
 * WhatsApp Message Bubble Component
 * 
 * Authentic iOS WhatsApp message styling with timestamps and read receipts.
 */

import React from "react";
import { ChatMessageLayout } from "@tokovo/core";
import { DoubleCheckIcon } from "./icons";

export interface MessageData {
    id: string;
    from: string;
    text?: string;
    timestamp?: string;
    read?: boolean;
    type?: "text" | "image" | "voice" | "system";
}

export interface MessageBubbleProps {
    msg: MessageData;
    layout: ChatMessageLayout;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 36,
            right: isMe ? 36 : "auto",
            maxWidth: "78%",
            opacity,
            transform: `translateY(${translateY}px)`,
        }}>
            {/* Bubble with tail */}
            <div style={{
                position: "relative",
                backgroundColor: isMe ? "#E7FFDB" : "#FFFFFF",
                padding: "24px 36px",
                borderRadius: 24,
                // Asymmetric corners for tail effect
                borderTopLeftRadius: isMe ? 24 : 6,
                borderTopRightRadius: isMe ? 6 : 24,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                display: "flex",
                flexDirection: "column",
                gap: 6
            }}>
                {/* Message text */}
                <span style={{
                    fontSize: 48,
                    lineHeight: "66px",
                    color: "#111B21",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    wordWrap: "break-word"
                }}>
                    {msg.text}
                </span>

                {/* Timestamp + Read receipts */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 9,
                    marginTop: 3
                }}>
                    <span style={{
                        fontSize: 33,
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {msg.timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={msg.read !== false} />}
                </div>
            </div>
        </div>
    );
};
````

## File: packages/apps-whatsapp/src/plugin.ts
````typescript
/**
 * WhatsApp Plugin Definition
 * 
 * Self-contained plugin registration for the WhatsApp app.
 * Registers reducer, view, sounds, and metadata with the PluginManager.
 */

import { definePlugin, PluginManager, APP_IDS, TokovoPlugin, AppViewComponent } from "@tokovo/core";
import { whatsappReducer } from "./runtime";
import { WhatsappChatView } from "./ui";

/**
 * WhatsApp Plugin Configuration
 */
export const WhatsAppPlugin: TokovoPlugin = definePlugin({
    id: APP_IDS.WHATSAPP,
    name: "WhatsApp",
    version: "1.0.0",

    // Branding
    icon: "whatsapp-icon.png",
    primaryColor: "#25D366",

    // Core functionality - cast to match AppViewComponent signature
    appView: WhatsappChatView as unknown as AppViewComponent,
    reducer: whatsappReducer,

    // Event types this plugin handles
    eventTypes: [
        "MESSAGE_RECEIVED",
        "MESSAGE_SENT",
        "TYPING_START",
        "TYPING_END",
        "MESSAGE_READ",
        "VOICE_MESSAGE_RECEIVED",
        "VOICE_MESSAGE_PLAY",
        "GROUP_MEMBER_ADDED",
        "GROUP_MEMBER_REMOVED",
    ],

    // Sound effects
    sounds: {
        "message_in": "whatsapp-received.mp3",
        "message_out": "whatsapp-sent.mp3",
        "typing": "whatsapp-typing.mp3",
    },

    notificationSound: "whatsapp-notification.mp3",
});

/**
 * Register the WhatsApp plugin
 */
export function registerWhatsAppPlugin(): void {
    PluginManager.register(WhatsAppPlugin);
}
````

## File: packages/apps-whatsapp/src/types.ts
````typescript
export interface WhatsAppState {
    // Add specific state if needed, for now using generic ConversationState from core
}
````

## File: packages/apps-whatsapp/README.md
````markdown
# @tokovo/apps-whatsapp

WhatsApp clone app for Tokovo.

## Features
- **Runtime**: Handles `MESSAGE_RECEIVED`, `TYPING_START`, `TYPING_END`.
- **UI**: `WhatsappChatView` with high-fidelity styling, animations, and auto-scroll.
````

## File: packages/apps-whatsapp/tsconfig.json
````json
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
````

## File: packages/compiler/src/passes/index.ts
````typescript
/**
 * Compiler Passes Index
 */

export { normalize } from "./normalize";
export { resolveRefs, ResolvedOp } from "./resolve-refs";
export { ensureUnlocked, ensureAppOpened, ensureConversationOpened } from "./virtual-device";
export { lowerToTimeline } from "./time-lowering";
export { validateTimeline, ValidationResult } from "./validate";
export { sort } from "./sort";
````

## File: packages/compiler/src/passes/normalize.ts
````typescript
/**
 * Normalize Pass
 * 
 * Expands sugar syntax in Scene IR:
 * - typing.for("2s") is already expanded by DSL
 * - Future: other sugar transformations
 * 
 * This pass is a pure transformation.
 */

import { SceneOp, ConcurrentOp } from "@tokovo/ir";

/**
 * Normalize a list of scene operations.
 * Currently a pass-through since DSL handles expansion.
 */
export function normalize(ops: SceneOp[]): SceneOp[] {
    return ops.map(normalizeOp);
}

/**
 * Normalize a single operation.
 */
function normalizeOp(op: SceneOp): SceneOp {
    if (op.kind === "Concurrent") {
        // Recursively normalize tracks
        return {
            ...op,
            tracks: op.tracks.map(track => normalize(track)),
        };
    }

    // All other ops pass through unchanged
    return op;
}
````

## File: packages/compiler/src/passes/resolve-refs.ts
````typescript
/**
 * Resolve Refs Pass
 * 
 * Assigns deterministic message IDs to all message operations.
 * Ensures referential integrity for read/delete operations.
 */

import { SceneOp, ConcurrentOp, SendMessageOp, ReceiveMessageOp, ReadMessageOp, DeleteMessageOp } from "@tokovo/ir";
import { CompilerContext } from "../context";

/**
 * Internal representation with resolved IDs.
 * Extends SceneOp with optional resolved message ID.
 */
export type ResolvedOp = SceneOp & {
    _resolvedMessageId?: string;
};

/**
 * Resolve message references in scene operations.
 * Assigns stable IDs and validates refs exist.
 */
export function resolveRefs(
    ops: SceneOp[],
    ctx: CompilerContext,
    deviceId: string,
    conversationId: string
): ResolvedOp[] {
    return ops.map((op, index) => resolveOp(op, ctx, deviceId, conversationId, index));
}

function resolveOp(
    op: SceneOp,
    ctx: CompilerContext,
    deviceId: string,
    conversationId: string,
    index: number
): ResolvedOp {
    switch (op.kind) {
        case "SendMessage":
        case "ReceiveMessage": {
            // Generate and register message ID
            const realId = ctx.generateMessageId(deviceId, conversationId);
            // Use index-based ref ID for mapping
            const refId = `ref_${deviceId}_${conversationId}_${index}`;
            ctx.registerMessageId(refId, realId);

            return {
                ...op,
                _resolvedMessageId: realId,
            };
        }

        case "ReadMessage":
        case "DeleteMessage": {
            // Resolve the message reference
            const refId = op.ref.id;
            const realId = ctx.resolveMessageId(refId) ?? op.ref.id;

            return {
                ...op,
                ref: {
                    ...op.ref,
                    id: realId,
                },
            };
        }

        case "Concurrent": {
            // Recursively resolve tracks
            return {
                ...op,
                tracks: op.tracks.map(track =>
                    resolveRefs(track, ctx, deviceId, conversationId)
                ),
            };
        }

        default:
            return op;
    }
}
````

## File: packages/compiler/src/passes/sort.ts
````typescript
/**
 * Sort Pass
 * 
 * Sorts Timeline IR operations in canonical order.
 * Uses the ordering contract defined in @tokovo/ir.
 */

import { TimelineOp, sortOps } from "@tokovo/ir";

/**
 * Sort timeline operations in canonical order.
 */
export function sort(ops: TimelineOp[]): TimelineOp[] {
    return sortOps(ops);
}
````

## File: packages/compiler/src/passes/time-lowering.ts
````typescript
/**
 * Time Lowering Pass
 * 
 * Converts Scene IR operations to Timeline IR operations.
 * - Resolves DurationExpr to frames
 * - Assigns `at` frame numbers
 * - Handles concurrent track compilation
 */

import {
    SceneOp,
    parseDuration,
    TimelineOp,
    TypingStartedOp,
    TypingEndedOp,
    MessageReceivedOp,
    MessageSentOp,
    MessageReadOp,
    MessageDeletedOp,
    Trace,
} from "@tokovo/ir";
import { CompilerContext, Cursor } from "../context";
import { ResolvedOp } from "./resolve-refs";
import { ensureConversationOpened } from "./virtual-device";

/**
 * Lower scene operations to timeline operations.
 */
export function lowerToTimeline(
    ops: SceneOp[],
    ctx: CompilerContext,
    cursor: Cursor,
    deviceId: string,
    appId: string,
    conversationId: string,
    beat: string,
    trackId: string = "main"
): TimelineOp[] {
    const timeline: TimelineOp[] = [];

    for (let i = 0; i < ops.length; i++) {
        const op = ops[i] as ResolvedOp;
        const trace: Trace = ctx.createTrace({
            deviceId,
            beat,
            trackId,
            sceneOpIndex: i,
        });

        const lowered = lowerOp(op, ctx, cursor, deviceId, appId, conversationId, trace);
        timeline.push(...lowered);
    }

    return timeline;
}

function lowerOp(
    op: ResolvedOp,
    ctx: CompilerContext,
    cursor: Cursor,
    deviceId: string,
    appId: string,
    conversationId: string,
    trace: Trace
): TimelineOp[] {
    const events: TimelineOp[] = [];
    const at = cursor.current;

    switch (op.kind) {
        case "Wait": {
            const frames = parseDuration(op.duration, ctx.config.fps);
            cursor.advance(frames);
            // Wait produces no events, just advances cursor
            return [];
        }

        case "TypingStart": {
            // Ensure conversation is open
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: TypingStartedOp = {
                at,
                kind: "TypingStarted",
                deviceId,
                appId,
                conversationId,
                actor: op.actor,
                trace,
            };
            events.push(event);
            return events;
        }

        case "TypingEnd": {
            const event: TypingEndedOp = {
                at,
                kind: "TypingEnded",
                deviceId,
                appId,
                conversationId,
                actor: op.actor,
                trace,
            };
            events.push(event);
            return events;
        }

        case "ReceiveMessage": {
            // Ensure conversation is open
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageReceivedOp = {
                at,
                kind: "MessageReceived",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: op._resolvedMessageId ?? `msg_${at}`,
                    text: op.text,
                    from: op.actor,
                    type: op.meta?.type ?? "text",
                },
                trace,
            };
            events.push(event);
            return events;
        }

        case "SendMessage": {
            // Ensure conversation is open
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            // Filter out "system" type since you can't send system messages
            const msgType = op.meta?.type;
            const sentType = msgType === "system" ? "text" : (msgType ?? "text");

            const event: MessageSentOp = {
                at,
                kind: "MessageSent",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: op._resolvedMessageId ?? `msg_${at}`,
                    text: op.text,
                    type: sentType as "text" | "image" | "voice",
                },
                trace,
            };
            events.push(event);
            return events;
        }

        case "ReadMessage": {
            const event: MessageReadOp = {
                at,
                kind: "MessageRead",
                deviceId,
                appId,
                conversationId: op.ref.conversationId,
                messageId: op.ref.id,
                trace,
            };
            events.push(event);
            return events;
        }

        case "DeleteMessage": {
            const event: MessageDeletedOp = {
                at,
                kind: "MessageDeleted",
                deviceId,
                appId,
                conversationId: op.ref.conversationId,
                messageId: op.ref.id,
                trace,
            };
            events.push(event);
            return events;
        }

        case "Concurrent": {
            // Fork cursor for each track
            const trackCursors: Cursor[] = [];
            const trackTimelines: TimelineOp[][] = [];

            for (let t = 0; t < op.tracks.length; t++) {
                const trackOps = op.tracks[t];
                const trackCursor = cursor.fork();
                const trackId = `track_${t}`;

                const trackTimeline = lowerToTimeline(
                    trackOps,
                    ctx,
                    trackCursor,
                    deviceId,
                    appId,
                    conversationId,
                    trace.beat,
                    trackId
                );

                trackCursors.push(trackCursor);
                trackTimelines.push(trackTimeline);
            }

            // Merge all track timelines
            for (const tl of trackTimelines) {
                events.push(...tl);
            }

            // Join cursors at max position
            const joined = Cursor.join(trackCursors);
            cursor.advance(joined.current - cursor.current);

            return events;
        }

        default:
            return [];
    }
}
````

## File: packages/compiler/src/passes/validate.ts
````typescript
/**
 * Validate Pass
 * 
 * Validates Timeline IR for semantic correctness:
 * - Read before send detection
 * - Delete missing message detection
 * - Frame ordering issues
 * 
 * Supports two modes:
 * - STRICT: Errors halt compilation
 * - LENIENT: Warnings + auto-fix where possible
 */

import { TimelineOp, validateTimelineIRFull, TimelineIR, ValidationError } from "@tokovo/ir";
import { CompilerContext } from "../context";

/**
 * Validation result.
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Validate timeline operations.
 */
export function validateTimeline(
    ops: TimelineOp[],
    ctx: CompilerContext
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check read/delete before send
    const sentMessages = new Set<string>();

    for (const op of ops) {
        if (op.kind === "MessageReceived" || op.kind === "MessageSent") {
            sentMessages.add(op.message.id);
        }

        if (op.kind === "MessageRead") {
            if (!sentMessages.has(op.messageId)) {
                const err: ValidationError = {
                    code: "READ_BEFORE_SEND",
                    message: `Message "${op.messageId}" is read at frame ${op.at} but not yet sent`,
                };

                if (ctx.config.mode === "strict") {
                    errors.push(err);
                } else {
                    warnings.push(err);
                }
            }
        }

        if (op.kind === "MessageDeleted") {
            if (!sentMessages.has(op.messageId)) {
                const err: ValidationError = {
                    code: "DELETE_MISSING",
                    message: `Message "${op.messageId}" is deleted at frame ${op.at} but never existed`,
                };

                if (ctx.config.mode === "strict") {
                    errors.push(err);
                } else {
                    warnings.push(err);
                }
            }
        }
    }

    // Check for negative frames
    for (const op of ops) {
        if (op.at < 0) {
            errors.push({
                code: "NEGATIVE_FRAME",
                message: `Operation at frame ${op.at} has negative frame number`,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
````

## File: packages/compiler/src/passes/virtual-device.ts
````typescript
/**
 * Virtual Device State Pass
 * 
 * Tracks virtual device state and auto-inserts:
 * - DeviceUnlocked before any action
 * - AppOpened before chat operations
 * - ConversationOpened before message operations
 * 
 * This ensures the episode JSON has all required glue events.
 */

import { TimelineOp, DeviceUnlockedOp, AppOpenedOp, ConversationOpenedOp, Trace } from "@tokovo/ir";
import { CompilerContext } from "../context";

/**
 * Check if device needs unlock and insert event.
 */
export function ensureUnlocked(
    ctx: CompilerContext,
    deviceId: string,
    at: number,
    trace: Trace
): TimelineOp[] {
    const state = ctx.getDeviceState(deviceId);

    if (state.isLocked) {
        ctx.updateDeviceState(deviceId, { isLocked: false });

        const op: DeviceUnlockedOp = {
            at,
            kind: "DeviceUnlocked",
            deviceId,
            trace,
        };
        return [op];
    }

    return [];
}

/**
 * Check if app needs to be opened and insert event.
 */
export function ensureAppOpened(
    ctx: CompilerContext,
    deviceId: string,
    appId: string,
    at: number,
    trace: Trace
): TimelineOp[] {
    const state = ctx.getDeviceState(deviceId);
    const events: TimelineOp[] = [];

    // First ensure unlocked
    events.push(...ensureUnlocked(ctx, deviceId, at, trace));

    if (state.foregroundAppId !== appId) {
        ctx.updateDeviceState(deviceId, { foregroundAppId: appId });

        const op: AppOpenedOp = {
            at,
            kind: "AppOpened",
            deviceId,
            appId,
            trace,
        };
        events.push(op);
    }

    return events;
}

/**
 * Check if conversation needs to be opened and insert event.
 */
export function ensureConversationOpened(
    ctx: CompilerContext,
    deviceId: string,
    appId: string,
    conversationId: string,
    at: number,
    trace: Trace
): TimelineOp[] {
    const state = ctx.getDeviceState(deviceId);
    const events: TimelineOp[] = [];

    // First ensure app is open
    events.push(...ensureAppOpened(ctx, deviceId, appId, at, trace));

    if (state.activeConversationId !== conversationId) {
        ctx.updateDeviceState(deviceId, { activeConversationId: conversationId });

        const op: ConversationOpenedOp = {
            at,
            kind: "ConversationOpened",
            deviceId,
            appId,
            conversationId,
            trace,
        };
        events.push(op);
    }

    return events;
}
````

## File: packages/compiler/src/compile.ts
````typescript
/**
 * Compile - Main Entry Point
 * 
 * Transforms Scene IR → Timeline IR through the pass pipeline.
 * 
 * Pipeline:
 *   normalize → resolveRefs → virtualDevice → timeLowering → validate → sort
 */

import { SceneIR, TimelineIR, TimelineOp } from "@tokovo/ir";
import { CompilerContext, CompilerConfig, Cursor } from "./context";
import {
    normalize,
    resolveRefs,
    lowerToTimeline,
    validateTimeline,
    sort,
    ValidationResult,
} from "./passes";

/**
 * Compilation result.
 */
export interface CompileResult {
    /** Compiled timeline IR */
    timeline: TimelineIR;

    /** Validation result */
    validation: ValidationResult;

    /** Computed duration in frames */
    durationInFrames: number;

    /** Debug info */
    debug?: {
        sceneIR: SceneIR;
        unsortedOps: TimelineOp[];
    };
}

/**
 * Compilation options.
 */
export interface CompileOptions {
    /** Validation mode */
    mode?: "strict" | "lenient";

    /** Include debug artifacts */
    debug?: boolean;
}

/**
 * Compile Scene IR to Timeline IR.
 */
export function compile(sceneIR: SceneIR, options: CompileOptions = {}): CompileResult {
    const config: CompilerConfig = {
        fps: sceneIR.meta.fps,
        episodeId: sceneIR.episodeId,
        mode: options.mode ?? "lenient",
    };

    const ctx = new CompilerContext(config);
    const allOps: TimelineOp[] = [];
    let maxFrame = 0;

    // Process each device
    for (const device of sceneIR.devices) {
        const cursor = new Cursor();

        // Process each beat
        for (const beat of device.beats) {
            // 1. Normalize operations
            let ops = normalize(beat.ops);

            // 2. Resolve message references
            ops = resolveRefs(
                ops,
                ctx,
                device.deviceId,
                device.conversations[0]?.id ?? ""
            );

            // 3. Lower to timeline (includes virtual device state)
            const timelineOps = lowerToTimeline(
                ops,
                ctx,
                cursor,
                device.deviceId,
                device.appId,
                device.conversations[0]?.id ?? "",
                beat.name
            );

            allOps.push(...timelineOps);
        }

        maxFrame = Math.max(maxFrame, cursor.current);
    }

    // 4. Validate
    const validation = validateTimeline(allOps, ctx);

    // 5. Sort
    const sortedOps = sort(allOps);

    // Build result
    const timeline: TimelineIR = {
        episodeId: sceneIR.episodeId,
        fps: sceneIR.meta.fps,
        durationInFrames: sceneIR.meta.durationInFrames ?? maxFrame + 30, // Add 1s buffer
        ops: sortedOps,
    };

    return {
        timeline,
        validation,
        durationInFrames: timeline.durationInFrames,
        debug: options.debug
            ? {
                sceneIR,
                unsortedOps: allOps,
            }
            : undefined,
    };
}
````

## File: packages/compiler/src/context.ts
````typescript
/**
 * Compiler Context
 * 
 * Shared state for compiler passes.
 * Maintains cursor (current frame), virtual device state, and message ID mapping.
 */

import { Trace, createTrace } from "@tokovo/ir";

/**
 * Virtual device state for auto-unlock/open/navigate passes.
 */
export interface VirtualDeviceState {
    isLocked: boolean;
    foregroundAppId?: string;
    activeConversationId?: string;
}

/**
 * Compiler configuration.
 */
export interface CompilerConfig {
    /** Frames per second */
    fps: number;

    /** Episode ID */
    episodeId: string;

    /** Validation mode */
    mode: "strict" | "lenient";
}

/**
 * Compiler context passed through all passes.
 */
export class CompilerContext {
    readonly config: CompilerConfig;

    /** Message ID counter */
    private messageCounter = 0;

    /** Map from DSL message ref to real message ID */
    private messageIdMap = new Map<string, string>();

    /** Virtual device states */
    private deviceStates = new Map<string, VirtualDeviceState>();

    constructor(config: CompilerConfig) {
        this.config = config;
    }

    /**
     * Get or create virtual device state.
     */
    getDeviceState(deviceId: string): VirtualDeviceState {
        if (!this.deviceStates.has(deviceId)) {
            this.deviceStates.set(deviceId, {
                isLocked: true,
                foregroundAppId: undefined,
                activeConversationId: undefined,
            });
        }
        return this.deviceStates.get(deviceId)!;
    }

    /**
     * Update virtual device state.
     */
    updateDeviceState(deviceId: string, update: Partial<VirtualDeviceState>): void {
        const state = this.getDeviceState(deviceId);
        Object.assign(state, update);
    }

    /**
     * Generate a unique message ID.
     */
    generateMessageId(deviceId: string, conversationId: string): string {
        return `msg_${deviceId}_${conversationId}_${++this.messageCounter}`;
    }

    /**
     * Register a message ID mapping.
     */
    registerMessageId(refId: string, realId: string): void {
        this.messageIdMap.set(refId, realId);
    }

    /**
     * Get real message ID from reference.
     */
    resolveMessageId(refId: string): string | undefined {
        return this.messageIdMap.get(refId);
    }

    /**
     * Create a trace for a scene operation.
     */
    createTrace(partial: Partial<Trace>): Trace {
        return createTrace({
            episodeId: this.config.episodeId,
            ...partial,
        });
    }
}

/**
 * Cursor tracks the current frame position during compilation.
 */
export class Cursor {
    private frame: number = 0;

    /**
     * Get current frame.
     */
    get current(): number {
        return this.frame;
    }

    /**
     * Advance cursor by frames.
     */
    advance(frames: number): void {
        this.frame += frames;
    }

    /**
     * Fork cursor for concurrent tracks.
     */
    fork(): Cursor {
        const forked = new Cursor();
        forked.frame = this.frame;
        return forked;
    }

    /**
     * Join cursors, taking the maximum position.
     */
    static join(cursors: Cursor[]): Cursor {
        const joined = new Cursor();
        joined.frame = Math.max(...cursors.map(c => c.current));
        return joined;
    }
}
````

## File: packages/compiler/src/generate.ts
````typescript
/**
 * Episode Generator
 * 
 * Converts DSL Scene IR → Episode JSON (compatible with @tokovo/core)
 */

import {
    SceneIR,
    TimelineIR,
    EpisodeMeta,
    DeviceScene,
    ConversationDef,
} from "@tokovo/ir";
import { compile } from "@tokovo/compiler";
import { adapterRegistry, RuntimeEvent } from "@tokovo/adapters";

/**
 * Episode JSON format (compatible with existing runtime)
 */
export interface EpisodeJSON {
    meta: {
        title: string;
        fps: number;
        durationInFrames: number;
    };
    initialWorld: {
        devices: Record<string, any>;
        conversations: Record<string, any>;
        appState: Record<string, any>;
        camera: any;
        audio: { activeSounds: {} };
    };
    events: RuntimeEvent[];
}

/**
 * Generate Episode JSON from Scene IR
 */
export function generateEpisode(sceneIR: SceneIR): EpisodeJSON {
    // Compile to Timeline IR
    const { timeline, durationInFrames } = compile(sceneIR);

    // Lower to runtime events
    const events = adapterRegistry.lowerAll(timeline);

    // Build initial world
    const initialWorld = buildInitialWorld(sceneIR);

    return {
        meta: {
            title: sceneIR.meta.title ?? sceneIR.episodeId,
            fps: sceneIR.meta.fps,
            durationInFrames,
        },
        initialWorld,
        events,
    };
}

/**
 * Build initial world state from device definitions
 */
function buildInitialWorld(sceneIR: SceneIR) {
    const devices: Record<string, any> = {};
    const conversations: Record<string, any> = {};
    const appState: Record<string, any> = {};

    for (const device of sceneIR.devices) {
        // Device state
        devices[device.deviceId] = {
            id: device.deviceId,
            profileId: device.profileId,
            isLocked: false, // Will be unlocked by events
            foregroundAppId: device.appId,
            notifications: [],
        };

        // Conversations
        for (const convo of device.conversations) {
            conversations[convo.id] = {
                id: convo.id,
                type: convo.type ?? "dm",
                name: convo.name ?? convo.id,
                avatar: convo.avatar,
                messages: [],
                typing: {},
            };
        }

        // App state
        if (device.appId) {
            appState[device.appId] = {
                screen: "chat",
                conversationId: device.conversations[0]?.id,
            };
        }
    }

    // Default camera
    const camera = {
        baseView: "APP_VIEW",
        activeDeviceId: sceneIR.devices[0]?.deviceId ?? "phone",
        layout: {
            mode: "SINGLE",
            primaryDeviceId: sceneIR.devices[0]?.deviceId ?? "phone",
        },
        activeEffects: [],
        transform: {
            translateX: 0,
            translateY: 0,
            scale: 1,
            rotation: 0,
            originX: 0.5,
            originY: 0.5,
            shakeX: 0,
            shakeY: 0,
        },
        deviceTransforms: {},
    };

    return {
        devices,
        conversations,
        appState,
        camera,
        audio: { activeSounds: {} },
    };
}
````

## File: packages/compiler/src/index.ts
````typescript
/**
 * @tokovo/compiler
 * 
 * Scene IR → Timeline IR transformation.
 * 
 * Usage:
 * ```ts
 * import { compile } from "@tokovo/compiler";
 * import { episode } from "@tokovo/dsl";
 * 
 * const sceneIR = episode("my-story", ep => { ... });
 * const { timeline, validation } = compile(sceneIR);
 * ```
 */

// Context
export { CompilerContext, CompilerConfig, Cursor } from "./context";

// Main entry point
export { compile, CompileResult, CompileOptions } from "./compile";

// Passes (for advanced usage)
export * from "./passes";
````

## File: packages/compiler/package.json
````json
{
    "name": "@tokovo/compiler",
    "version": "0.0.1",
    "description": "Tokovo Compiler - Scene IR to Timeline IR transformation",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "files": [
        "dist"
    ],
    "scripts": {
        "build": "tsc",
        "dev": "tsc --watch"
    },
    "dependencies": {
        "@tokovo/ir": "workspace:*"
    },
    "devDependencies": {
        "typescript": "^5.0.0"
    }
}
````

## File: packages/compiler/tsconfig.json
````json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "declaration": true,
        "declarationMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}
````

## File: packages/compiler/tsconfig.tsbuildinfo
````
{"root":["./src/compile.ts","./src/context.ts","./src/index.ts","./src/passes/index.ts","./src/passes/normalize.ts","./src/passes/resolve-refs.ts","./src/passes/sort.ts","./src/passes/time-lowering.ts","./src/passes/validate.ts","./src/passes/virtual-device.ts"],"version":"5.9.3"}
````

## File: packages/core/src/director-lite/derive.ts
````typescript
/**
 * DirectorLite Derive
 *
 * Pure function that derives camera effects for frame t.
 * Stateless, deterministic, scrubbing-safe.
 *
 * FIXES from review:
 * - Cooldown uses inline lastSeen (no map key mismatch)
 * - Signals assumed pre-sorted; debug guard if not
 * - Manual camera skip policy: if any manual camera active, skip director
 * - viewport removed from this function (only needed in composer)
 */

import {
    DirectorSignal,
    DirectorLayoutModel,
    DirectorOutput,
    DerivedCameraEffect,
    DirectorDebug,
    LayoutRect,
} from "./types";
import { Rule, RULES_BY_SIGNAL } from "./rules";
import { applyEasing } from "../camera";
import { ActiveCameraEffect } from "../types";

// =============================================================================
// MAIN ENTRY
// =============================================================================

export interface DeriveContext {
    t: number;
    signals: DirectorSignal[]; // Must be pre-sorted by `at`
    layoutModel: DirectorLayoutModel;
    seed?: number;
    debug?: boolean;
    // Manual camera skip: if any active effects from timeline, skip director
    manualCameraEffects?: ActiveCameraEffect[];
}

/**
 * Derive camera effects for frame t.
 *
 * PURE FUNCTION: No internal state.
 * O(n) complexity with inline cooldown tracking.
 */
export function deriveDirectorEffects(ctx: DeriveContext): DirectorOutput {
    const {
        t,
        signals,
        layoutModel,
        seed = 0,
        debug: debugEnabled = false,
        manualCameraEffects = [],
    } = ctx;

    // Policy A: Skip director if any manual camera event is active
    if (manualCameraEffects.length > 0) {
        const hasActiveManual = manualCameraEffects.some(
            (ae) => t >= ae.startFrame && t < ae.endFrame
        );
        if (hasActiveManual) {
            return {
                effects: [],
                skipped: "manual-camera-active",
                debug: debugEnabled
                    ? {
                        signalsInWindow: signals.length,
                        matchedRules: 0,
                        skippedCooldown: 0,
                    }
                    : undefined,
            };
        }
    }

    // Debug guard: check signals are sorted
    if (debugEnabled && signals.length > 1) {
        for (let i = 1; i < signals.length; i++) {
            if (signals[i].at < signals[i - 1].at) {
                console.warn(
                    `[DirectorLite] Signals not sorted! at[${i}]=${signals[i].at} < at[${i - 1}]=${signals[i - 1].at}`
                );
                break;
            }
        }
    }

    // Match rules with INLINE cooldown tracking (no separate map)
    const matches: Match[] = [];
    let skippedCooldown = 0;

    // Track last seen time per cooldown key (inline, as we iterate sorted signals)
    const lastSeenByKey = new Map<string, number>();

    for (const signal of signals) {
        const cooldownKey = getCooldownKey(signal);
        const prevAt = lastSeenByKey.get(cooldownKey) ?? -Infinity;

        // Get rules for this signal type (O(1) lookup)
        const rules = RULES_BY_SIGNAL[signal.type] || [];

        for (const rule of rules) {
            const startFrame = signal.at;
            const endFrame = startFrame + rule.durationFrames;

            // Active at time t?
            if (t < startFrame || t >= endFrame) continue;

            // Cooldown check
            const framesSinceLast = signal.at - prevAt;
            if (framesSinceLast < rule.cooldownFrames && prevAt !== -Infinity) {
                skippedCooldown++;
                continue;
            }

            matches.push({ rule, signal, startFrame, endFrame });
        }

        // Update lastSeen after processing this signal
        lastSeenByKey.set(cooldownKey, signal.at);
    }

    // Generate effects
    const allEffects: DerivedCameraEffect[] = [];

    for (const match of matches) {
        const effect = generateEffect(match, layoutModel, t, seed);
        if (effect) allEffects.push(effect);
    }

    // Arbitrate: 1 framing wins, shake stacks (max 2)
    const finalEffects = arbitrate(allEffects);

    // Debug (only if enabled)
    let debug: DirectorDebug | undefined;
    if (debugEnabled) {
        const framingWinner = finalEffects.find((e) => e.category === "framing");
        debug = {
            signalsInWindow: signals.length,
            matchedRules: matches.length,
            winningFraming: framingWinner?.type,
            skippedCooldown,
        };
    }

    return { effects: finalEffects, debug };
}

// =============================================================================
// HELPERS
// =============================================================================

interface Match {
    rule: Rule;
    signal: DirectorSignal;
    startFrame: number;
    endFrame: number;
}

/**
 * Cooldown key includes conversation to scope properly.
 * Typing in chat A won't cooldown typing in chat B.
 */
function getCooldownKey(signal: DirectorSignal): string {
    return `${signal.type}:${signal.deviceId}:${signal.appId}:${signal.conversationId ?? ""}`;
}

function generateEffect(
    match: Match,
    layout: DirectorLayoutModel,
    t: number,
    seed: number
): DerivedCameraEffect | null {
    const { rule, signal, startFrame, endFrame } = match;
    const duration = endFrame - startFrame;
    const localProgress = (t - startFrame) / duration;
    const progress = applyEasing(
        Math.min(1, Math.max(0, localProgress)),
        "ease-out"
    );

    // Resolve target
    const target = resolveTarget(signal, layout, rule.targetType);
    if (!target && rule.category === "framing" && rule.effect !== "PullBack") {
        return null;
    }

    return {
        type: rule.effect,
        category: rule.category,
        priority: rule.priority,
        progress,
        target: target ?? undefined,
        scale: rule.scale,
        intensity: rule.intensity,
        seed: seed + signal.at,
    };
}

function resolveTarget(
    signal: DirectorSignal,
    layout: DirectorLayoutModel,
    targetType: string
): LayoutRect | null {
    switch (targetType) {
        case "message":
            return signal.messageId ? layout.messageRects[signal.messageId] : null;
        case "inputArea":
            return layout.inputAreaRect;
        case "lastMessage":
            return layout.lastMessageRect ?? null;
        default:
            return null;
    }
}

/**
 * Arbitrate effects by category.
 * - Framing: exactly 1 wins (highest priority)
 * - Shake: max 2, stacks
 */
function arbitrate(effects: DerivedCameraEffect[]): DerivedCameraEffect[] {
    const result: DerivedCameraEffect[] = [];

    // Framing: exactly 1 wins (highest priority)
    const framing = effects
        .filter((e) => e.category === "framing")
        .sort((a, b) => b.priority - a.priority);

    if (framing.length > 0) {
        result.push(framing[0]);
    }

    // Shake: max 2
    const shake = effects
        .filter((e) => e.category === "shake")
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 2);

    result.push(...shake);

    return result;
}
````

## File: packages/core/src/director-lite/index.ts
````typescript
/**
 * DirectorLite
 *
 * Minimal, shippable camera director.
 * One baked style (ViralDramaV1), no framework.
 */

export * from "./types";
export { deriveDirectorEffects } from "./derive";
export type { DeriveContext } from "./derive";
export { extractSignals } from "./signals";
export { RULES, RULES_BY_SIGNAL } from "./rules";
export type { Rule } from "./rules";
````

## File: packages/core/src/director-lite/rules.ts
````typescript
/**
 * DirectorLite Rules
 *
 * ViralDramaV1 - The only style. Opinionated. Ships.
 * Pre-indexed by signal type for O(1) lookup.
 */

import { SignalType, EffectCategory } from "./types";

export interface Rule {
    id: string;
    signal: SignalType;
    effect: "PushIn" | "ZoomToRect" | "PullBack" | "MicroShake";
    category: EffectCategory;
    priority: number;
    cooldownFrames: number;
    durationFrames: number;
    targetType: "message" | "inputArea" | "lastMessage";
    scale?: number;
    intensity?: number;
}

/**
 * ViralDramaV1 - Baked rules for dramatic chat videos.
 */
export const RULES: Rule[] = [
    {
        id: "typing-push",
        signal: "TypingStarted",
        effect: "PushIn",
        category: "framing",
        priority: 10,
        cooldownFrames: 90,
        durationFrames: 45,
        targetType: "inputArea", // Always exists (not typing rect!)
        scale: 1.12,
    },
    {
        id: "message-zoom",
        signal: "NewMessage",
        effect: "ZoomToRect",
        category: "framing",
        priority: 30,
        cooldownFrames: 20,
        durationFrames: 25,
        targetType: "message",
        scale: 1.2,
    },
    {
        id: "read-zoom",
        signal: "MessageRead",
        effect: "ZoomToRect",
        category: "framing",
        priority: 40,
        cooldownFrames: 45,
        durationFrames: 18,
        targetType: "message",
        scale: 1.08,
    },
    {
        id: "deleted-shake",
        signal: "MessageDeleted",
        effect: "MicroShake",
        category: "shake",
        priority: 25,
        cooldownFrames: 60,
        durationFrames: 12,
        targetType: "message",
        intensity: 6,
    },
    {
        id: "call-pullback",
        signal: "CallIncoming",
        effect: "PullBack",
        category: "framing",
        priority: 50,
        cooldownFrames: 0,
        durationFrames: 40,
        targetType: "inputArea",
        scale: 0.88,
    },
];

/**
 * Pre-indexed rules by signal type for O(1) lookup.
 * Built once at module load.
 */
export const RULES_BY_SIGNAL: Record<SignalType, Rule[]> = RULES.reduce(
    (acc, rule) => {
        if (!acc[rule.signal]) acc[rule.signal] = [];
        acc[rule.signal].push(rule);
        return acc;
    },
    {} as Record<SignalType, Rule[]>
);
````

## File: packages/core/src/director-lite/signals.ts
````typescript
/**
 * DirectorLite Signal Extraction
 *
 * Extract DirectorSignals from timeline events.
 * Uses REAL message IDs from event payloads.
 */

import { TimelineEvent } from "../types";
import { DirectorSignal, SignalType } from "./types";

/**
 * Extract director signals from timeline events.
 *
 * @param events - Events in the signal window (caller filters by frame range)
 * @param deviceId - Scope signals to this device
 * @param appId - Scope signals to this app
 * @returns Signals sorted by `at` (ascending)
 */
export function extractSignals(
    events: TimelineEvent[],
    deviceId: string,
    appId: string
): DirectorSignal[] {
    const signals: DirectorSignal[] = [];

    for (const event of events) {
        const base = {
            deviceId,
            appId,
            at: event.at,
        };

        if (event.kind === "APP" && (event as any).appId === appId) {
            const appEvent = event as any;

            switch (event.type) {
                case "TYPING_START":
                    signals.push({
                        ...base,
                        type: "TypingStarted",
                        conversationId: appEvent.conversationId,
                        from: appEvent.from,
                    });
                    break;

                case "TYPING_END":
                    signals.push({
                        ...base,
                        type: "TypingEnded",
                        conversationId: appEvent.conversationId,
                        from: appEvent.from,
                    });
                    break;

                case "MESSAGE_RECEIVED": {
                    // REAL ID: Use message.id from payload, fallback to runtime pattern
                    const messageId =
                        appEvent.message?.id || `msg_${event.at}_${appEvent.from}`;
                    signals.push({
                        ...base,
                        type: "NewMessage",
                        conversationId: appEvent.conversationId,
                        messageId,
                        from: appEvent.from,
                    });
                    break;
                }

                case "MESSAGE_READ":
                    if (appEvent.messageId) {
                        signals.push({
                            ...base,
                            type: "MessageRead",
                            conversationId: appEvent.conversationId,
                            messageId: appEvent.messageId,
                        });
                    }
                    break;
            }
        }

        if (event.kind === "DEVICE") {
            const deviceEvent = event as any;
            if (deviceEvent.deviceId === deviceId) {
                switch (event.type) {
                    case "INCOMING_CALL":
                        signals.push({
                            ...base,
                            type: "CallIncoming",
                        });
                        break;
                }
            }
        }
    }

    // Return sorted by `at` (ascending) - required by derive function
    return signals.sort((a, b) => a.at - b.at);
}
````

## File: packages/core/src/director-lite/types.ts
````typescript
/**
 * DirectorLite Types
 *
 * Minimal types for the camera director system.
 * No framework, no configurability - just what ships.
 */

// =============================================================================
// LAYOUT
// =============================================================================

export interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DirectorLayoutModel {
    deviceId: string;
    appId: string;
    conversationId?: string;
    messageRects: Record<string, LayoutRect>;
    inputAreaRect: LayoutRect; // Always available
    typingIndicatorRect?: LayoutRect; // Only when typing
    lastMessageRect?: LayoutRect;
}

// =============================================================================
// SIGNALS
// =============================================================================

export type SignalType =
    | "TypingStarted"
    | "TypingEnded"
    | "NewMessage"
    | "MessageRead"
    | "MessageDeleted"
    | "CallIncoming";

export interface DirectorSignal {
    type: SignalType;
    deviceId: string;
    appId: string;
    conversationId?: string;
    at: number;
    messageId?: string;
    from?: string;
}

// =============================================================================
// EFFECTS
// =============================================================================

export type EffectCategory = "framing" | "shake";

export interface DerivedCameraEffect {
    type: "PushIn" | "ZoomToRect" | "PullBack" | "MicroShake";
    category: EffectCategory;
    priority: number;
    progress: number;
    // Framing effects
    target?: LayoutRect;
    scale?: number;
    // Shake effects
    intensity?: number;
    seed?: number;
}

// =============================================================================
// OUTPUT
// =============================================================================

export interface DirectorOutput {
    effects: DerivedCameraEffect[];
    debug?: DirectorDebug;
    skipped?: "manual-camera-active";
}

export interface DirectorDebug {
    signalsInWindow: number;
    matchedRules: number;
    winningFraming?: string;
    skippedCooldown: number;
}
````

## File: packages/core/src/constants.ts
````typescript
/**
 * Constants - Centralized configuration values
 * 
 * All magic numbers and default values should be defined here.
 * This makes the codebase more maintainable and configurable.
 */

// =============================================================================
// TIMING CONSTANTS
// =============================================================================

export const TIMING = {
    /** Default frames per second */
    FPS_DEFAULT: 30,

    /** Duration of heads-up notification in frames (5 seconds at 30fps) */
    HEADS_UP_DURATION: 150,

    /** Buffer frames to keep effects after they end (for smooth transitions) */
    EFFECT_CLEANUP_BUFFER: 30,

    /** Default typing indicator animation duration in frames */
    TYPING_ANIMATION_DURATION: 90,

    /** Default message appear animation duration in frames */
    MESSAGE_ANIMATION_DURATION: 15,
} as const;

// =============================================================================
// LAYOUT CONSTANTS (in 3x scale for Remotion)
// =============================================================================

export const LAYOUT = {
    /** Chat header height (status bar + nav bar) */
    CHAT_HEADER_HEIGHT: 414,

    /** Chat input area height (input field + home indicator) */
    CHAT_INPUT_HEIGHT: 272,

    /** Status bar height */
    STATUS_BAR_HEIGHT: 144,

    /** Navigation bar height */
    NAV_BAR_HEIGHT: 270,

    /** Home indicator height */
    HOME_INDICATOR_HEIGHT: 102,

    /** Split layout divider width */
    SPLIT_DIVIDER_WIDTH: 2,

    /** Message bubble max width ratio (0-1) */
    MESSAGE_BUBBLE_MAX_WIDTH: 0.75,

    /** Message bubble border radius */
    MESSAGE_BUBBLE_RADIUS: 54,

    /** Message spacing */
    MESSAGE_GAP: 12,
} as const;

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULTS = {
    /** Default audio volume (0-1) */
    VOLUME: 1,

    /** Default background music volume */
    BACKGROUND_MUSIC_VOLUME: 0.5,

    /** Default video background color */
    BACKGROUND_COLOR: "#0a0a1a",

    /** Default split layout divider color */
    SPLIT_LINE_COLOR: "#333333",

    /** Default zoom scale */
    ZOOM_SCALE: 1.3,

    /** Default shake intensity */
    SHAKE_INTENSITY: 10,

    /** Default shake frequency (shakes per second) */
    SHAKE_FREQUENCY: 16,

    /** Default shake decay */
    SHAKE_DECAY: 0.3,

    /** Default camera easing */
    CAMERA_EASING: "ease-out" as const,

    /** Default PIP scale */
    PIP_SCALE: 0.3,

    /** Default PIP position */
    PIP_POSITION: "bottom-right" as const,
} as const;

// =============================================================================
// APP IDENTIFIERS
// =============================================================================

export const APP_IDS = {
    WHATSAPP: "app_whatsapp",
    INSTAGRAM: "app_instagram",
    IMESSAGE: "app_imessage",
    TIKTOK: "app_tiktok",
    TWITTER: "app_twitter",
} as const;

// =============================================================================
// DEVICE IDENTIFIERS
// =============================================================================

export const DEVICE_PROFILES = {
    IPHONE_16: "iphone16",
    PIXEL: "pixel",
} as const;

// =============================================================================
// EVENT KINDS
// =============================================================================

export const EVENT_KINDS = {
    DEVICE: "DEVICE",
    APP: "APP",
    CAMERA: "CAMERA",
    AUDIO: "AUDIO",
} as const;

// =============================================================================
// SOUND IDENTIFIERS
// =============================================================================

export const SOUND_IDS = {
    WHATSAPP_RECEIVED: "whatsapp_received",
    WHATSAPP_SENT: "whatsapp_sent",
    NOTIFICATION: "notification",
    RINGTONE: "ringtone",
    TYPING: "typing",
    CAMERA_SHUTTER: "camera_shutter",
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert seconds to frames at given FPS
 */
export function secondsToFrames(seconds: number, fps: number = TIMING.FPS_DEFAULT): number {
    return Math.round(seconds * fps);
}

/**
 * Convert frames to seconds at given FPS
 */
export function framesToSeconds(frames: number, fps: number = TIMING.FPS_DEFAULT): number {
    return frames / fps;
}

/**
 * Get timing value in frames for common durations
 */
export const DURATION_FRAMES = {
    /** 0.5 seconds */
    HALF_SECOND: secondsToFrames(0.5),
    /** 1 second */
    ONE_SECOND: secondsToFrames(1),
    /** 2 seconds */
    TWO_SECONDS: secondsToFrames(2),
    /** 3 seconds */
    THREE_SECONDS: secondsToFrames(3),
    /** 5 seconds */
    FIVE_SECONDS: secondsToFrames(5),
    /** 10 seconds */
    TEN_SECONDS: secondsToFrames(10),
} as const;
````

## File: packages/core/src/eventUtils.ts
````typescript
/**
 * Event Utilities - Performance optimizations for event processing
 * 
 * These utilities help avoid O(n) filtering on every frame.
 */

import { TimelineEvent } from "./types";

// =============================================================================
// EVENT INDEXING
// =============================================================================

/**
 * EventIndex - Pre-processed event lookup for efficient frame-based access
 * 
 * Instead of filtering all events on every frame, events are indexed by
 * their `at` value for O(1) lookup per unique frame.
 */
export interface EventIndex {
    /** Events indexed by frame number */
    byFrame: Map<number, TimelineEvent[]>;

    /** Maximum frame number in the events */
    maxFrame: number;

    /** Total event count */
    totalEvents: number;

    /** Sorted unique frame numbers */
    frames: number[];
}

/**
 * Create an event index from a list of events
 * 
 * @param events - Array of timeline events
 * @returns Indexed events for efficient lookup
 */
export function createEventIndex(events: TimelineEvent[]): EventIndex {
    const byFrame = new Map<number, TimelineEvent[]>();
    let maxFrame = 0;

    for (const event of events) {
        const frameEvents = byFrame.get(event.at) || [];
        frameEvents.push(event);
        byFrame.set(event.at, frameEvents);
        maxFrame = Math.max(maxFrame, event.at);
    }

    const frames = Array.from(byFrame.keys()).sort((a, b) => a - b);

    return {
        byFrame,
        maxFrame,
        totalEvents: events.length,
        frames,
    };
}

/**
 * Get all events up to and including frame t
 * 
 * @param index - Pre-computed event index
 * @param t - Current frame number
 * @returns All events with `at <= t`
 */
export function getEventsUpTo(index: EventIndex, t: number): TimelineEvent[] {
    const result: TimelineEvent[] = [];

    for (const frame of index.frames) {
        if (frame > t) break;
        const events = index.byFrame.get(frame);
        if (events) {
            result.push(...events);
        }
    }

    return result;
}

/**
 * Get events that occur exactly at frame t
 * 
 * @param index - Pre-computed event index
 * @param t - Frame number to query
 * @returns Events at frame t (or empty array)
 */
export function getEventsAt(index: EventIndex, t: number): TimelineEvent[] {
    return index.byFrame.get(t) || [];
}

/**
 * Get events within a frame range (inclusive)
 * 
 * @param index - Pre-computed event index
 * @param start - Start frame
 * @param end - End frame
 * @returns Events where `start <= at <= end`
 */
export function getEventsInRange(index: EventIndex, start: number, end: number): TimelineEvent[] {
    const result: TimelineEvent[] = [];

    for (const frame of index.frames) {
        if (frame < start) continue;
        if (frame > end) break;
        const events = index.byFrame.get(frame);
        if (events) {
            result.push(...events);
        }
    }

    return result;
}

// =============================================================================
// EVENT FILTERING UTILITIES  
// =============================================================================

/**
 * Filter events by kind
 */
export function filterEventsByKind<K extends TimelineEvent["kind"]>(
    events: TimelineEvent[],
    kind: K
): Extract<TimelineEvent, { kind: K }>[] {
    return events.filter(e => e.kind === kind) as any;
}

/**
 * Filter events by app ID
 */
export function filterEventsForApp(events: TimelineEvent[], appId: string): TimelineEvent[] {
    return events.filter(e => e.kind === "APP" && (e as any).appId === appId);
}

/**
 * Filter events by device ID
 */
export function filterEventsForDevice(events: TimelineEvent[], deviceId: string): TimelineEvent[] {
    return events.filter(e => {
        if (e.kind === "DEVICE") return (e as any).deviceId === deviceId;
        if (e.kind === "CAMERA" || e.kind === "AUDIO") {
            const d = (e as any).deviceId;
            return !d || d === deviceId;
        }
        return true;
    });
}
````

## File: packages/core/src/plugin.ts
````typescript
/**
 * Plugin System - Self-contained app registration
 * 
 * Apps register themselves as plugins with all their dependencies:
 * - UI components
 * - State reducers  
 * - Sound effects
 * - Event types they handle
 */

import { WorldState } from "./types";
import { AppReducer, ReducerRegistry } from "./engine";

// =============================================================================
// PLUGIN TYPES
// =============================================================================

/**
 * Props passed to all app view components
 */
export interface AppViewProps {
    world: WorldState;
    t?: number;
    layout?: any;
    platform?: "ios" | "android";
    deviceId?: string;
}

/**
 * App view component type (generic, will be React.FC in renderer)
 */
export type AppViewComponent = (props: AppViewProps) => any;

/**
 * Plugin definition - everything an app needs to function
 */
export interface TokovoPlugin {
    /** Unique app ID (e.g., "app_whatsapp") */
    id: string;

    /** Display name */
    name: string;

    /** Plugin version */
    version: string;

    /** App icon for notifications/home screen */
    icon?: string;

    /** Primary color for theming */
    primaryColor?: string;

    /** React component to render the app view */
    appView?: AppViewComponent;

    /** State reducer for APP events */
    reducer?: AppReducer;

    /** Event types this plugin handles */
    eventTypes?: string[];

    /** Sound effect mappings */
    sounds?: Record<string, string>;

    /** Notification sound */
    notificationSound?: string;

    /** Default app state */
    defaultState?: any;
}

// =============================================================================
// PLUGIN MANAGER
// =============================================================================

/**
 * PluginManager - Central registry for all app plugins
 */
class PluginManagerClass {
    private plugins = new Map<string, TokovoPlugin>();
    private viewRegistry = new Map<string, AppViewComponent>();

    /**
     * Register a plugin
     */
    register(plugin: TokovoPlugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`[PluginManager] Overwriting plugin: ${plugin.id}`);
        }

        this.plugins.set(plugin.id, plugin);

        // Auto-register reducer
        if (plugin.reducer) {
            ReducerRegistry.registerAppReducer(plugin.id, plugin.reducer);
        }

        // Store view component
        if (plugin.appView) {
            this.viewRegistry.set(plugin.id, plugin.appView);
        }

        console.log(`[PluginManager] Registered plugin: ${plugin.name} (${plugin.id})`);
    }

    /**
     * Get a plugin by ID
     */
    get(id: string): TokovoPlugin | undefined {
        return this.plugins.get(id);
    }

    /**
     * Get app view component
     */
    getView(id: string): AppViewComponent | undefined {
        return this.viewRegistry.get(id);
    }

    /**
     * Get all registered plugins
     */
    getAll(): TokovoPlugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Get all registered app IDs
     */
    getAppIds(): string[] {
        return Array.from(this.plugins.keys());
    }

    /**
     * Check if plugin is registered
     */
    has(id: string): boolean {
        return this.plugins.has(id);
    }

    /**
     * Get plugin metadata for display
     */
    getMetadata(id: string): { name: string; icon?: string; color?: string } | undefined {
        const plugin = this.plugins.get(id);
        if (!plugin) return undefined;
        return {
            name: plugin.name,
            icon: plugin.icon,
            color: plugin.primaryColor,
        };
    }

    /**
     * Get sound for an event from plugin
     */
    getSound(pluginId: string, soundKey: string): string | undefined {
        const plugin = this.plugins.get(pluginId);
        return plugin?.sounds?.[soundKey];
    }
}

export const PluginManager = new PluginManagerClass();

// =============================================================================
// PLUGIN HELPERS
// =============================================================================

/**
 * Create a plugin definition with defaults
 */
export function definePlugin(config: Partial<TokovoPlugin> & { id: string; name: string }): TokovoPlugin {
    return {
        ...config,
        version: config.version ?? "1.0.0",
        eventTypes: config.eventTypes ?? [],
        sounds: config.sounds ?? {},
    } as TokovoPlugin;
}

/**
 * Register multiple plugins at once
 */
export function registerPlugins(plugins: TokovoPlugin[]): void {
    plugins.forEach(plugin => PluginManager.register(plugin));
}
````

## File: packages/core/src/sounds.ts
````typescript
/**
 * Sound Registry - Maps sound IDs to audio files
 * 
 * Place audio files in apps/video-runner/public/sounds/
 */

export const SOUND_REGISTRY: Record<string, string> = {
    // WhatsApp sounds
    "whatsapp_sent": "whatsapp-sent.mp3",
    "whatsapp_received": "whatsapp-received.mp3",
    "whatsapp_typing": "typing.mp3",

    // Notification sounds
    "notification": "notification.mp3",
    "notification_soft": "notification-soft.mp3",

    // Call sounds
    "ringtone": "ringtone.mp3",
    "call_end": "call-end.mp3",

    // UI sounds
    "camera_shutter": "camera-shutter.mp3",
    "screenshot": "screenshot.mp3",
    "lock": "lock.mp3",
    "unlock": "unlock.mp3",

    // Ambient / Music
    "suspense": "suspense.mp3",
    "dramatic": "dramatic.mp3",
};

/**
 * Get sound file path for a sound ID
 */
export function getSoundPath(soundId: string): string {
    const filename = SOUND_REGISTRY[soundId];
    if (!filename) {
        console.warn(`Unknown sound ID: ${soundId}`);
        return `sounds/${soundId}.mp3`; // Fallback to direct ID
    }
    return `sounds/${filename}`;
}
````

## File: packages/core/src/transitions.ts
````typescript
/**
 * Transition System - Screen transition rendering and state
 * 
 * Handles animated transitions between screens/apps.
 */

import { TransitionType, EasingType } from "./types";

// =============================================================================
// TRANSITION STATE
// =============================================================================

/**
 * Active transition state
 */
export interface TransitionState {
    active?: {
        type: TransitionType;
        from: string;
        to: string;
        startFrame: number;
        duration: number;
        easing?: EasingType;
    };
}

/**
 * Default transition state
 */
export const DEFAULT_TRANSITION_STATE: TransitionState = {};

// =============================================================================
// TRANSITION COMPUTATION
// =============================================================================

/**
 * Compute transition progress at frame t
 * Returns 0-1 progress value with easing applied
 */
export function computeTransitionProgress(
    transition: TransitionState["active"],
    t: number,
    applyEasing: (progress: number, easing: EasingType) => number
): number {
    if (!transition) return 1;

    const { startFrame, duration, easing = "ease-out" } = transition;
    const endFrame = startFrame + duration;

    if (t < startFrame) return 0;
    if (t >= endFrame) return 1;

    const rawProgress = (t - startFrame) / duration;
    return applyEasing(rawProgress, easing);
}

// =============================================================================
// TRANSITION STYLES
// =============================================================================

/**
 * CSS Properties type (compatible with React.CSSProperties)
 */
type CSSProperties = Record<string, string | number | undefined>;

/**
 * CSS transform/opacity for transition animations
 */
export interface TransitionStyles {
    from: CSSProperties;
    to: CSSProperties;
}

/**
 * Get CSS styles for a transition type at given progress
 */
export function getTransitionStyles(
    type: TransitionType,
    progress: number,
    isFrom: boolean
): CSSProperties {
    // Progress 0 = transition start, 1 = transition end
    // For "from" view: starts at 1 opacity, ends at 0
    // For "to" view: starts at 0 opacity, ends at 1

    const t = isFrom ? 1 - progress : progress;

    switch (type) {
        case "FADE":
            return {
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_LEFT":
            return {
                transform: isFrom
                    ? `translateX(${-progress * 100}%)`
                    : `translateX(${(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_RIGHT":
            return {
                transform: isFrom
                    ? `translateX(${progress * 100}%)`
                    : `translateX(${-(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_UP":
            return {
                transform: isFrom
                    ? `translateY(${-progress * 100}%)`
                    : `translateY(${(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_DOWN":
            return {
                transform: isFrom
                    ? `translateY(${progress * 100}%)`
                    : `translateY(${-(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "ZOOM_IN":
            return {
                transform: isFrom
                    ? `scale(${1 + progress * 0.2})`
                    : `scale(${0.8 + progress * 0.2})`,
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "ZOOM_OUT":
            return {
                transform: isFrom
                    ? `scale(${1 - progress * 0.2})`
                    : `scale(${1.2 - progress * 0.2})`,
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "CROSS_DISSOLVE":
            return {
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                mixBlendMode: "normal" as const,
            };

        default:
            return {
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };
    }
}

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

/**
 * Common transition presets
 */
export const TRANSITION_PRESETS = {
    /** iOS app open animation */
    appOpen: {
        type: "ZOOM_IN" as TransitionType,
        duration: 15,
        easing: "ease-out" as EasingType,
    },

    /** iOS app close animation */
    appClose: {
        type: "ZOOM_OUT" as TransitionType,
        duration: 12,
        easing: "ease-in" as EasingType,
    },

    /** Standard navigation push */
    push: {
        type: "SLIDE_LEFT" as TransitionType,
        duration: 18,
        easing: "ease-out" as EasingType,
    },

    /** Standard navigation pop */
    pop: {
        type: "SLIDE_RIGHT" as TransitionType,
        duration: 18,
        easing: "ease-out" as EasingType,
    },

    /** Modal presentation */
    modal: {
        type: "SLIDE_UP" as TransitionType,
        duration: 20,
        easing: "ease-out" as EasingType,
    },

    /** Lock screen unlock */
    unlock: {
        type: "FADE" as TransitionType,
        duration: 10,
        easing: "ease-out" as EasingType,
    },
} as const;
````

## File: packages/core/src/typeGuards.ts
````typescript
/**
 * Type Guards - Type-safe event discrimination
 * 
 * These guards eliminate the need for `as any` casts when handling events.
 * Each guard narrows the TimelineEvent type to a specific variant.
 */

import { TimelineEvent, Message } from "./types";

// =============================================================================
// DEVICE EVENT GUARDS
// =============================================================================

export function isDeviceEvent(e: TimelineEvent): e is TimelineEvent & { kind: "DEVICE" } {
    return e.kind === "DEVICE";
}

export function isLockEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "LOCK";
    deviceId: string;
} {
    return e.kind === "DEVICE" && e.type === "LOCK";
}

export function isUnlockEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "UNLOCK";
    deviceId: string;
} {
    return e.kind === "DEVICE" && e.type === "UNLOCK";
}

export function isOpenAppEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "OPEN_APP";
    deviceId: string;
    appId: string;
} {
    return e.kind === "DEVICE" && e.type === "OPEN_APP";
}

export function isShowNotificationEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "SHOW_NOTIFICATION";
    deviceId: string;
    appId: string;
    title: string;
    body: string;
    mode?: "lockscreen" | "headsup" | "both";
    icon?: string;
} {
    return e.kind === "DEVICE" && e.type === "SHOW_NOTIFICATION";
}

export function isIncomingCallEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "INCOMING_CALL";
    deviceId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
} {
    return e.kind === "DEVICE" && e.type === "INCOMING_CALL";
}

// =============================================================================
// APP EVENT GUARDS
// =============================================================================

export function isAppEvent(e: TimelineEvent): e is TimelineEvent & { kind: "APP" } {
    return e.kind === "APP";
}

/** Message payload type for type safety */
export interface MessagePayload {
    id: string;
    type?: "text" | "image" | "voice" | "system";
    text?: string;
    status?: "sending" | "sent" | "delivered" | "read";
    timestamp?: string;
}

export function isMessageReceivedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "MESSAGE_RECEIVED";
    appId: string;
    conversationId: string;
    from: string;
    text?: string;
    message?: MessagePayload;
} {
    return e.kind === "APP" && e.type === "MESSAGE_RECEIVED";
}

export function isTypingStartEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "TYPING_START";
    appId: string;
    conversationId: string;
    from: string;
} {
    return e.kind === "APP" && e.type === "TYPING_START";
}

export function isTypingEndEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "TYPING_END";
    appId: string;
    conversationId: string;
    from: string;
} {
    return e.kind === "APP" && e.type === "TYPING_END";
}

export function isTypingEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "TYPING_START" | "TYPING_END";
    appId: string;
    conversationId: string;
    from: string;
} {
    return e.kind === "APP" && (e.type === "TYPING_START" || e.type === "TYPING_END");
}

export function isMessageReadEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "MESSAGE_READ";
    appId: string;
    conversationId: string;
    messageId: string;
} {
    return e.kind === "APP" && e.type === "MESSAGE_READ";
}

export function isVoiceMessageReceivedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "VOICE_MESSAGE_RECEIVED";
    appId: string;
    conversationId: string;
    from: string;
    duration: number;
} {
    return e.kind === "APP" && e.type === "VOICE_MESSAGE_RECEIVED";
}

export function isGroupMemberAddedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "GROUP_MEMBER_ADDED";
    appId: string;
    conversationId: string;
    memberId: string;
    memberName: string;
    addedBy: string;
} {
    return e.kind === "APP" && e.type === "GROUP_MEMBER_ADDED";
}

export function isGroupMemberRemovedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "GROUP_MEMBER_REMOVED";
    appId: string;
    conversationId: string;
    memberId: string;
    memberName: string;
    removedBy: string;
} {
    return e.kind === "APP" && e.type === "GROUP_MEMBER_REMOVED";
}

// =============================================================================
// CAMERA EVENT GUARDS
// =============================================================================

export function isCameraEvent(e: TimelineEvent): e is TimelineEvent & { kind: "CAMERA" } {
    return e.kind === "CAMERA";
}

export function isZoomEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "ZOOM";
    scale: number;
    originX?: number;
    originY?: number;
    duration: number;
    deviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "ZOOM";
}

export function isPanEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "PAN";
    translateX: number;
    translateY: number;
    duration: number;
    deviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "PAN";
}

export function isShakeEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "SHAKE";
    intensity: number;
    frequency: number;
    duration: number;
    deviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "SHAKE";
}

export function isLayoutEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "LAYOUT";
    mode: string;
    primaryDeviceId: string;
    secondaryDeviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "LAYOUT";
}

// =============================================================================
// AUDIO EVENT GUARDS
// =============================================================================

export function isAudioEvent(e: TimelineEvent): e is TimelineEvent & { kind: "AUDIO" } {
    return e.kind === "AUDIO";
}

export function isPlaySoundEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "AUDIO";
    type: "PLAY_SOUND";
    soundId: string;
    instanceId?: string;
    volume?: number;
    loop?: boolean;
    deviceId?: string;
} {
    return e.kind === "AUDIO" && e.type === "PLAY_SOUND";
}

export function isBackgroundMusicEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "AUDIO";
    type: "BACKGROUND_MUSIC";
    soundId: string;
    volume?: number;
    loop?: boolean;
} {
    return e.kind === "AUDIO" && e.type === "BACKGROUND_MUSIC";
}

// =============================================================================
// UTILITY GUARDS
// =============================================================================

/**
 * Check if event belongs to a specific app
 */
export function isEventForApp(e: TimelineEvent, appId: string): boolean {
    return e.kind === "APP" && (e as any).appId === appId;
}

/**
 * Check if event belongs to a specific device
 */
export function isEventForDevice(e: TimelineEvent, deviceId: string): boolean {
    if (e.kind === "DEVICE") {
        return (e as any).deviceId === deviceId;
    }
    if (e.kind === "CAMERA" || e.kind === "AUDIO") {
        return (e as any).deviceId === deviceId || !(e as any).deviceId;
    }
    return true; // APP events apply to all
}
````

## File: packages/core/package.json
````json
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
````

## File: packages/core/README.md
````markdown
# @tokovo/core

Core logic for the Tokovo engine.

## Features
- **Engine**: `replay` function to compute world state from events.
- **Types**: Core type definitions (`WorldState`, `TimelineEvent`, etc.).
- **Registry**: `ReducerRegistry` for managing device and app reducers.
````

## File: packages/core/tsconfig.json
````json
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
````

## File: packages/devices/src/iphone16/profile.ts
````typescript
import { DeviceProfile } from "../types";

export const iPhone16Profile: DeviceProfile = {
    id: "iphone16",
    dimensions: { width: 1290, height: 2796 },
    statusBarHeight: 110,
};
````

## File: packages/devices/src/pixel/profile.ts
````typescript
import { DeviceProfile } from "../types";

export const PixelProfile: DeviceProfile = {
    id: "pixel",
    dimensions: {
        width: 1080, // Pixel 7 Pro approx width
        height: 2400, // Pixel 7 Pro approx height
    },
    statusBarHeight: 90, // Approx 30px * 3
};
````

## File: packages/devices/src/types.ts
````typescript
export interface DeviceProfile {
    id: string;
    dimensions: { width: number; height: number };
    statusBarHeight: number;
}
````

## File: packages/devices/README.md
````markdown
# @tokovo/devices

Device profiles and reducers.

## Features
- **Profiles**: `iPhone16Profile` with high-res assets.
- **Components**: `iPhone16Frame`, `StatusBar`.
- **Reducer**: `deviceReducer` for handling device events (LOCK, UNLOCK, OPEN_APP).
````

## File: packages/devices/tsconfig.json
````json
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
````

## File: packages/dsl/examples/breakup-01.dsl.ts
````typescript
/**
 * Breakup Drama Episode
 * 
 * This exports a pre-compiled Episode JSON for use in the video-runner.
 */

import { episode as createEpisode } from "../src/author";
import { SceneIR } from "@tokovo/ir";

/**
 * The DSL definition for breakup drama
 */
export const breakupDramaSceneIR: SceneIR = createEpisode("breakup-drama-01", ep => {
    ep.config({ fps: 30, title: "The Breakup Drama" });

    ep.device("AlicePhone", "iphone16", d => {
        d.app("app_whatsapp");
        d.conversation("dm_bob", { name: "Bob", avatar: "bob.png" });

        // Beat 1: Silence
        d.beat("silence", b => {
            b.wait("2s");
        });

        // Beat 2: Typing tension
        d.beat("typing-tension", b => {
            b.concurrent([
                t => t.typing("Bob").for("1.5s"),
                t => t.wait("0.7s").receive("Bob", "We need to talk.")
            ]);
            b.wait("0.5s");
        });

        // Beat 3: The message
        d.beat("aftermath", b => {
            const msg = b.receive("Bob", "I'm sorry. It's over.");
            b.wait("1.2s");
            b.read(msg);
            b.wait("0.5s");
        });

        // Beat 4: Panic
        d.beat("panic", b => {
            b.send("Wait, what?");
            b.wait("0.8s");
            b.send("Can we talk about this?");
            b.wait("1s");
        });

        // Beat 5: No response
        d.beat("silence-after", b => {
            b.wait("2s");
            b.typing("Bob").for("2s");
            // No message comes...
            b.wait("1s");
        });
    });
});

export { breakupDramaSceneIR as default };
````

## File: packages/dsl/src/author/beat-builder.ts
````typescript
/**
 * Beat Builder
 * 
 * Fluent API for defining actions within a beat.
 * A beat is a named group of sequential/concurrent operations.
 */

import {
    SceneOp,
    WaitOp,
    TypingStartOp,
    TypingEndOp,
    SendMessageOp,
    ReceiveMessageOp,
    ReadMessageOp,
    DeleteMessageOp,
    ConcurrentOp,
    MessageRef,
    messageRef,
} from "@tokovo/ir";
import { TypingBuilder, MessageHandle, TrackFn, TrackBuilder } from "../types";

/**
 * Beat builder collects operations within a beat.
 */
export class BeatBuilder {
    private readonly ops: SceneOp[] = [];
    private readonly deviceId: string;
    private readonly appId: string;
    private readonly conversationId: string;
    private messageCounter = 0;
    private lastMessageRef: MessageRef | undefined;

    constructor(deviceId: string, appId: string, conversationId: string) {
        this.deviceId = deviceId;
        this.appId = appId;
        this.conversationId = conversationId;
    }

    /**
     * Wait for a duration.
     */
    wait(duration: string): this {
        const op: WaitOp = { kind: "Wait", duration };
        this.ops.push(op);
        return this;
    }

    /**
     * Start typing indicator.
     * Returns a builder for fluent chaining: typing("Bob").for("2s")
     */
    typing(actor: string): TypingBuilder {
        const conversationId = this.conversationId;
        const ops = this.ops;

        return {
            for: (duration: string) => {
                // Expand to: TypingStart + Wait + TypingEnd
                const start: TypingStartOp = {
                    kind: "TypingStart",
                    actor,
                    conversationId,
                };
                const wait: WaitOp = { kind: "Wait", duration };
                const end: TypingEndOp = {
                    kind: "TypingEnd",
                    actor,
                    conversationId,
                };
                ops.push(start, wait, end);
            },
        };
    }

    /**
     * Start typing without specifying duration.
     * Use typingEnd() to stop.
     */
    typingStart(actor: string): this {
        const op: TypingStartOp = {
            kind: "TypingStart",
            actor,
            conversationId: this.conversationId,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Stop typing indicator.
     */
    typingEnd(actor: string): this {
        const op: TypingEndOp = {
            kind: "TypingEnd",
            actor,
            conversationId: this.conversationId,
        };
        this.ops.push(op);
        return this;
    }

    /**
     * Send a message (from device owner).
     */
    send(text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: SendMessageOp = {
            kind: "SendMessage",
            actor: "me",
            text,
            conversationId: this.conversationId,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Receive a message (from someone else).
     */
    receive(actor: string, text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${++this.messageCounter}`;
        const op: ReceiveMessageOp = {
            kind: "ReceiveMessage",
            actor,
            text,
            conversationId: this.conversationId,
        };
        this.ops.push(op);

        const ref = messageRef(id, this.deviceId, this.appId, this.conversationId);
        this.lastMessageRef = ref;
        return ref;
    }

    /**
     * Mark a message as read.
     */
    read(ref: MessageHandle): this {
        const op: ReadMessageOp = { kind: "ReadMessage", ref };
        this.ops.push(op);
        return this;
    }

    /**
     * Mark the last message as read.
     */
    readLast(): this {
        if (!this.lastMessageRef) {
            throw new Error("readLast() called but no previous message exists");
        }
        return this.read(this.lastMessageRef);
    }

    /**
     * Delete a message.
     */
    delete(ref: MessageHandle): this {
        const op: DeleteMessageOp = { kind: "DeleteMessage", ref };
        this.ops.push(op);
        return this;
    }

    /**
     * Delete the last message.
     */
    deleteLast(): this {
        if (!this.lastMessageRef) {
            throw new Error("deleteLast() called but no previous message exists");
        }
        return this.delete(this.lastMessageRef);
    }

    /**
     * Execute operations concurrently across multiple tracks.
     */
    concurrent(tracks: TrackFn[]): this {
        const trackOps: SceneOp[][] = tracks.map((fn) => {
            const trackBuilder = this.createTrackBuilder();
            fn(trackBuilder);
            return trackBuilder.getOps();
        });

        const op: ConcurrentOp = { kind: "Concurrent", tracks: trackOps };
        this.ops.push(op);
        return this;
    }

    /**
     * Create a track builder for concurrent operations.
     */
    private createTrackBuilder(): TrackBuilderImpl {
        return new TrackBuilderImpl(
            this.deviceId,
            this.appId,
            this.conversationId,
            () => ++this.messageCounter
        );
    }

    /**
     * Get collected operations.
     */
    getOps(): SceneOp[] {
        return this.ops;
    }
}

/**
 * Track builder implementation for concurrent operations.
 */
class TrackBuilderImpl implements TrackBuilder {
    private readonly ops: SceneOp[] = [];
    private readonly deviceId: string;
    private readonly appId: string;
    private readonly conversationId: string;
    private readonly getNextId: () => number;

    constructor(
        deviceId: string,
        appId: string,
        conversationId: string,
        getNextId: () => number
    ) {
        this.deviceId = deviceId;
        this.appId = appId;
        this.conversationId = conversationId;
        this.getNextId = getNextId;
    }

    wait(duration: string): this {
        this.ops.push({ kind: "Wait", duration });
        return this;
    }

    typing(actor: string): TypingBuilder {
        const conversationId = this.conversationId;
        const ops = this.ops;

        return {
            for: (duration: string) => {
                ops.push({ kind: "TypingStart", actor, conversationId });
                ops.push({ kind: "Wait", duration });
                ops.push({ kind: "TypingEnd", actor, conversationId });
            },
        };
    }

    send(actor: string, text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${this.getNextId()}`;
        this.ops.push({
            kind: "SendMessage",
            actor,
            text,
            conversationId: this.conversationId,
        });
        return messageRef(id, this.deviceId, this.appId, this.conversationId);
    }

    receive(actor: string, text: string): MessageHandle {
        const id = `msg_${this.deviceId}_${this.conversationId}_${this.getNextId()}`;
        this.ops.push({
            kind: "ReceiveMessage",
            actor,
            text,
            conversationId: this.conversationId,
        });
        return messageRef(id, this.deviceId, this.appId, this.conversationId);
    }

    getOps(): SceneOp[] {
        return this.ops;
    }
}
````

## File: packages/dsl/src/author/device-builder.ts
````typescript
/**
 * Device Builder
 * 
 * Fluent API for defining a device's story.
 * Manages conversation context and beat collection.
 */

import { DeviceScene, ConversationDef, Beat } from "@tokovo/ir";
import { BeatBuilder } from "./beat-builder";

/**
 * Beat callback function.
 */
export type BeatFn = (b: BeatBuilder) => void;

/**
 * Device builder collects conversations and beats for a device.
 */
export class DeviceBuilder {
    private readonly deviceId: string;
    private readonly profileId: string;
    private appId: string = "app_whatsapp"; // Default app
    private readonly conversations: ConversationDef[] = [];
    private readonly beats: Beat[] = [];
    private currentConversationId: string | undefined;

    constructor(deviceId: string, profileId: string = "iphone16") {
        this.deviceId = deviceId;
        this.profileId = profileId;
    }

    /**
     * Set the app for this device.
     */
    app(appId: string): this {
        this.appId = appId;
        return this;
    }

    /**
     * Define a conversation.
     * Also sets it as the current conversation for subsequent beats.
     */
    conversation(id: string, config?: { name?: string; avatar?: string; type?: "dm" | "group" }): this {
        const def: ConversationDef = {
            id,
            name: config?.name,
            avatar: config?.avatar,
            type: config?.type ?? "dm",
        };
        this.conversations.push(def);
        this.currentConversationId = id;
        return this;
    }

    /**
     * Define a beat (named group of actions).
     */
    beat(name: string, fn: BeatFn): this {
        if (!this.currentConversationId) {
            throw new Error(`beat("${name}") called but no conversation defined. Call conversation() first.`);
        }

        const builder = new BeatBuilder(
            this.deviceId,
            this.appId,
            this.currentConversationId
        );
        fn(builder);

        this.beats.push({
            name,
            ops: builder.getOps(),
        });

        return this;
    }

    /**
     * Build the device scene.
     */
    build(): DeviceScene {
        return {
            deviceId: this.deviceId,
            profileId: this.profileId,
            appId: this.appId,
            conversations: this.conversations,
            beats: this.beats,
        };
    }
}
````

## File: packages/dsl/src/author/episode-builder.ts
````typescript
/**
 * Episode Builder
 * 
 * Top-level fluent API for defining an episode.
 * Entry point: episode("my-episode", ep => { ... })
 */

import { SceneIR, EpisodeMeta } from "@tokovo/ir";
import { DeviceBuilder, BeatFn } from "./device-builder";
import { EpisodeConfig } from "../types";

/**
 * Device callback function.
 */
export type DeviceFn = (d: DeviceBuilder) => void;

/**
 * Episode builder collects devices and metadata.
 */
export class EpisodeBuilder {
    private readonly episodeId: string;
    private readonly meta: EpisodeMeta;
    private readonly deviceBuilders: DeviceBuilder[] = [];

    constructor(episodeId: string, config: EpisodeConfig = {}) {
        this.episodeId = episodeId;
        this.meta = {
            title: config.title ?? episodeId,
            fps: config.fps ?? 30,
        };
    }

    /**
     * Set episode metadata.
     */
    config(cfg: EpisodeConfig): this {
        if (cfg.fps) {
            (this.meta as any).fps = cfg.fps;
        }
        if (cfg.title) {
            (this.meta as any).title = cfg.title;
        }
        return this;
    }

    /**
     * Define a device with a story.
     */
    device(deviceId: string, fn: DeviceFn): this;
    device(deviceId: string, profileId: string, fn: DeviceFn): this;
    device(deviceId: string, profileIdOrFn: string | DeviceFn, maybeFn?: DeviceFn): this {
        let profileId: string;
        let fn: DeviceFn;

        if (typeof profileIdOrFn === "function") {
            profileId = "iphone16";
            fn = profileIdOrFn;
        } else {
            profileId = profileIdOrFn;
            fn = maybeFn!;
        }

        const builder = new DeviceBuilder(deviceId, profileId);
        fn(builder);
        this.deviceBuilders.push(builder);
        return this;
    }

    /**
     * Build the Scene IR.
     */
    build(): SceneIR {
        return {
            episodeId: this.episodeId,
            meta: this.meta,
            devices: this.deviceBuilders.map((b) => b.build()),
        };
    }
}

/**
 * Entry point for creating an episode.
 * 
 * @example
 * const ir = episode("breakup-01", ep => {
 *   ep.device("AlicePhone", d => {
 *     d.conversation("dm_bob", { name: "Bob" })
 *     d.beat("tension", b => {
 *       b.receive("Bob", "We need to talk.")
 *     })
 *   })
 * })
 */
export function episode(
    episodeId: string,
    fn: (ep: EpisodeBuilder) => void,
    config?: EpisodeConfig
): SceneIR {
    const builder = new EpisodeBuilder(episodeId, config);
    fn(builder);
    return builder.build();
}
````

## File: packages/dsl/src/author/index.ts
````typescript
/**
 * Author API exports
 */

export { BeatBuilder } from "./beat-builder";
export { DeviceBuilder, BeatFn } from "./device-builder";
export { EpisodeBuilder, DeviceFn, episode } from "./episode-builder";
````

## File: packages/dsl/src/index.ts
````typescript
/**
 * @tokovo/dsl
 * 
 * Author DSL for writing cinematic chat stories.
 * 
 * Usage:
 * ```ts
 * import { episode } from "@tokovo/dsl";
 * 
 * const sceneIR = episode("my-story", ep => {
 *   ep.device("Phone", d => {
 *     d.conversation("dm_alice")
 *     d.beat("intro", b => {
 *       b.receive("Alice", "Hey!")
 *     })
 *   })
 * })
 * ```
 */

// Types
export * from "./types";

// Author API
export * from "./author";
````

## File: packages/dsl/src/types.ts
````typescript
/**
 * DSL Types
 * 
 * Types specific to the author DSL layer.
 */

import { MessageRef } from "@tokovo/ir";

/**
 * Typing builder for fluent API.
 * Allows: typing("Bob").for("2s")
 */
export interface TypingBuilder {
    /**
     * Set duration for typing indicator.
     * Compiler expands to: TypingStart + Wait + TypingEnd
     */
    for(duration: string): void;
}

/**
 * Message handle returned by send/receive.
 * Can be passed to read() or delete().
 */
export type MessageHandle = MessageRef;

/**
 * Track builder for concurrent operations.
 */
export interface TrackBuilder {
    wait(duration: string): TrackBuilder;
    typing(actor: string): TypingBuilder;
    send(actor: string, text: string): MessageHandle;
    receive(actor: string, text: string): MessageHandle;
}

/**
 * Track function for concurrent().
 */
export type TrackFn = (t: TrackBuilder) => void;

/**
 * Episode configuration.
 */
export interface EpisodeConfig {
    fps?: number;
    title?: string;
}
````

## File: packages/dsl/package.json
````json
{
    "name": "@tokovo/dsl",
    "version": "0.0.1",
    "description": "Tokovo Author DSL - fluent API for writing cinematic chat stories",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "files": [
        "dist"
    ],
    "scripts": {
        "build": "tsc",
        "dev": "tsc --watch"
    },
    "dependencies": {
        "@tokovo/ir": "workspace:*"
    },
    "devDependencies": {
        "typescript": "^5.0.0"
    }
}
````

## File: packages/dsl/tsconfig.json
````json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "declaration": true,
        "declarationMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}
````

## File: packages/dsl/tsconfig.tsbuildinfo
````
{"root":["./src/index.ts","./src/types.ts","./src/author/beat-builder.ts","./src/author/device-builder.ts","./src/author/episode-builder.ts","./src/author/index.ts"],"version":"5.9.3"}
````

## File: packages/episodes/src/examples/android-test.json
````json
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
````

## File: packages/episodes/package.json
````json
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
````

## File: packages/episodes/tsconfig.json
````json
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
````

## File: packages/ir/src/index.ts
````typescript
/**
 * @tokovo/ir
 * 
 * Intermediate Representations for Tokovo DSL.
 * 
 * Two layers:
 * - Scene IR: Semantic truth (no frames, no platform)
 * - Timeline IR: Execution contract (frames, deterministic)
 */

// Trace model
export * from "./trace";

// Scene IR (semantic)
export * from "./scene";

// Timeline IR (execution)
export * from "./timeline";

// Ordering contract
export * from "./ordering";

// Validation
export * from "./validate";
````

## File: packages/ir/src/ordering.ts
````typescript
/**
 * Deterministic Ordering Contract
 * 
 * Same-frame operations are sorted by:
 *   (at, phase, priority, trackId, sceneOpIndex)
 * 
 * This guarantees:
 * - No randomness
 * - Stable refactors
 * - DirectorLite consistency
 */

import { TimelineOp } from "./timeline";

// =============================================================================
// PHASES
// =============================================================================

/**
 * Execution phases determine order within the same frame.
 * Lower phase number = earlier execution.
 */
export enum Phase {
    /** Device operations (unlock, lock) */
    DEVICE = 0,

    /** Navigation (open app, goto conversation) */
    NAV = 10,

    /** App operations (typing, messages, read, delete) */
    APP = 20,

    /** Effects (optional, reserved for future) */
    FX = 30,
}

/**
 * Get phase for a timeline operation.
 */
export function getPhase(op: TimelineOp): Phase {
    switch (op.kind) {
        case "DeviceUnlocked":
            return Phase.DEVICE;
        case "AppOpened":
        case "ConversationOpened":
            return Phase.NAV;
        case "TypingStarted":
        case "TypingEnded":
        case "MessageReceived":
        case "MessageSent":
        case "MessageRead":
        case "MessageDeleted":
            return Phase.APP;
        default:
            return Phase.FX;
    }
}

// =============================================================================
// PRIORITY WITHIN PHASE
// =============================================================================

/**
 * Get priority within phase.
 * Lower number = earlier execution.
 */
export function getPriority(op: TimelineOp): number {
    switch (op.kind) {
        case "TypingStarted":
            return 0;
        case "MessageReceived":
        case "MessageSent":
            return 10;
        case "TypingEnded":
            return 20;
        case "MessageRead":
            return 30;
        case "MessageDeleted":
            return 40;
        default:
            return 50;
    }
}

// =============================================================================
// CANONICAL SORT
// =============================================================================

/**
 * Compare function for deterministic ordering.
 * Sorts by: (at, phase, priority, trackId, sceneOpIndex)
 */
export function compareOps(a: TimelineOp, b: TimelineOp): number {
    // 1. By frame
    if (a.at !== b.at) return a.at - b.at;

    // 2. By phase
    const phaseA = getPhase(a);
    const phaseB = getPhase(b);
    if (phaseA !== phaseB) return phaseA - phaseB;

    // 3. By priority within phase
    const prioA = getPriority(a);
    const prioB = getPriority(b);
    if (prioA !== prioB) return prioA - prioB;

    // 4. By track ID (string comparison)
    if (a.trace.trackId !== b.trace.trackId) {
        return a.trace.trackId.localeCompare(b.trace.trackId);
    }

    // 5. By scene op index
    return a.trace.sceneOpIndex - b.trace.sceneOpIndex;
}

/**
 * Sort timeline operations in canonical order.
 * Returns a new sorted array.
 */
export function sortOps(ops: TimelineOp[]): TimelineOp[] {
    return [...ops].sort(compareOps);
}
````

## File: packages/ir/src/scene.ts
````typescript
/**
 * Scene IR - Semantic Truth
 * 
 * Scene IR represents WHAT HAPPENS, not WHEN or HOW.
 * 
 * RULES:
 * - No frames
 * - No layout
 * - No camera
 * - No platform assumptions
 * 
 * If FPS changes, layout changes, or Director logic changes,
 * Scene IR stays valid.
 */

// =============================================================================
// DURATION
// =============================================================================

/**
 * Human-readable duration expression.
 * Examples: "1.2s", "300ms", "45frames"
 */
export type DurationExpr = `${number}${"s" | "ms" | "frames"}` | string;

/**
 * Parse duration to frames
 */
export function parseDuration(expr: DurationExpr, fps: number): number {
    const match = expr.match(/^([\d.]+)(s|ms|frames)$/);
    if (!match) {
        throw new Error(`Invalid duration: ${expr}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2];

    switch (unit) {
        case "s":
            return Math.round(value * fps);
        case "ms":
            return Math.round((value / 1000) * fps);
        case "frames":
            return Math.round(value);
        default:
            throw new Error(`Unknown duration unit: ${unit}`);
    }
}

// =============================================================================
// MESSAGE REFERENCE
// =============================================================================

/**
 * Reference to a message.
 * MUST include full context for cross-device/conversation operations.
 */
export interface MessageRef {
    readonly _type: "MessageRef";
    readonly id: string;
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
}

/**
 * Create a message reference
 */
export function messageRef(
    id: string,
    deviceId: string,
    appId: string,
    conversationId: string
): MessageRef {
    return {
        _type: "MessageRef",
        id,
        deviceId,
        appId,
        conversationId,
    };
}

// =============================================================================
// MESSAGE METADATA
// =============================================================================

export interface MessageMeta {
    /** Message type */
    type?: "text" | "image" | "voice" | "system";

    /** For voice messages */
    voiceDuration?: number;

    /** Timestamp display */
    timestamp?: string;

    /** Custom metadata */
    [key: string]: unknown;
}

// =============================================================================
// SCENE OPERATIONS
// =============================================================================

/**
 * Wait for a duration.
 * This advances the cursor but emits no runtime event.
 */
export interface WaitOp {
    readonly kind: "Wait";
    readonly duration: DurationExpr;
}

/**
 * Start typing indicator.
 */
export interface TypingStartOp {
    readonly kind: "TypingStart";
    readonly actor: string;
    readonly conversationId: string;
}

/**
 * End typing indicator.
 */
export interface TypingEndOp {
    readonly kind: "TypingEnd";
    readonly actor: string;
    readonly conversationId: string;
}

/**
 * Send a message (from "me" / device owner).
 */
export interface SendMessageOp {
    readonly kind: "SendMessage";
    readonly actor: string;
    readonly text: string;
    readonly conversationId: string;
    readonly meta?: MessageMeta;
}

/**
 * Receive a message (from someone else).
 */
export interface ReceiveMessageOp {
    readonly kind: "ReceiveMessage";
    readonly actor: string;
    readonly text: string;
    readonly conversationId: string;
    readonly meta?: MessageMeta;
}

/**
 * Mark a message as read.
 */
export interface ReadMessageOp {
    readonly kind: "ReadMessage";
    readonly ref: MessageRef;
}

/**
 * Delete a message.
 */
export interface DeleteMessageOp {
    readonly kind: "DeleteMessage";
    readonly ref: MessageRef;
}

/**
 * Concurrent operations across multiple tracks.
 * Compiler forks cursor per track, compiles each independently,
 * then joins at max(trackEnds).
 */
export interface ConcurrentOp {
    readonly kind: "Concurrent";
    readonly tracks: SceneOp[][];
}

/**
 * Union of all scene operations.
 */
export type SceneOp =
    | WaitOp
    | TypingStartOp
    | TypingEndOp
    | SendMessageOp
    | ReceiveMessageOp
    | ReadMessageOp
    | DeleteMessageOp
    | ConcurrentOp;

// =============================================================================
// SCENE (TOP LEVEL)
// =============================================================================

/**
 * A beat is a named group of operations.
 * Used for semantic grouping and debugging.
 */
export interface Beat {
    readonly name: string;
    readonly ops: SceneOp[];
}

/**
 * A device context within a scene.
 */
export interface DeviceScene {
    readonly deviceId: string;
    readonly profileId: string;
    readonly appId: string;
    readonly conversations: ConversationDef[];
    readonly beats: Beat[];
}

/**
 * Conversation definition.
 */
export interface ConversationDef {
    readonly id: string;
    readonly name?: string;
    readonly avatar?: string;
    readonly type?: "dm" | "group";
}

/**
 * Complete scene IR for an episode.
 */
export interface SceneIR {
    readonly episodeId: string;
    readonly meta: EpisodeMeta;
    readonly devices: DeviceScene[];
}

/**
 * Episode metadata.
 */
export interface EpisodeMeta {
    readonly title?: string;
    readonly fps: number;
    readonly durationInFrames?: number;
}
````

## File: packages/ir/src/timeline.ts
````typescript
/**
 * Timeline IR - Execution Contract
 * 
 * Timeline IR is PLATFORM-AGNOSTIC but TIME-SPECIFIC.
 * 
 * RULES:
 * - All waits resolved to frames
 * - Fully deterministic
 * - No adapter-specific fields
 * - Sorted by canonical ordering
 * - Every op carries Trace
 */

import { Trace } from "./trace";

// =============================================================================
// TIMELINE OPERATIONS
// =============================================================================

/**
 * Base interface for all timeline operations.
 */
interface TimelineOpBase {
    /** Frame number when this operation occurs */
    readonly at: number;

    /** Operation kind (discriminator) */
    readonly kind: string;

    /** Debug trace */
    readonly trace: Trace;
}

/**
 * Device unlocked.
 */
export interface DeviceUnlockedOp extends TimelineOpBase {
    readonly kind: "DeviceUnlocked";
    readonly deviceId: string;
}

/**
 * App opened.
 */
export interface AppOpenedOp extends TimelineOpBase {
    readonly kind: "AppOpened";
    readonly deviceId: string;
    readonly appId: string;
}

/**
 * Conversation navigated to.
 */
export interface ConversationOpenedOp extends TimelineOpBase {
    readonly kind: "ConversationOpened";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
}

/**
 * Typing indicator started.
 */
export interface TypingStartedOp extends TimelineOpBase {
    readonly kind: "TypingStarted";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly actor: string;
}

/**
 * Typing indicator ended.
 */
export interface TypingEndedOp extends TimelineOpBase {
    readonly kind: "TypingEnded";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly actor: string;
}

/**
 * Message received.
 */
export interface MessageReceivedOp extends TimelineOpBase {
    readonly kind: "MessageReceived";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly message: {
        readonly id: string;
        readonly text: string;
        readonly from: string;
        readonly type?: "text" | "image" | "voice" | "system";
        readonly timestamp?: string;
    };
}

/**
 * Message sent (by device owner).
 */
export interface MessageSentOp extends TimelineOpBase {
    readonly kind: "MessageSent";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly message: {
        readonly id: string;
        readonly text: string;
        readonly type?: "text" | "image" | "voice";
        readonly timestamp?: string;
    };
}

/**
 * Message marked as read.
 */
export interface MessageReadOp extends TimelineOpBase {
    readonly kind: "MessageRead";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly messageId: string;
}

/**
 * Message deleted.
 */
export interface MessageDeletedOp extends TimelineOpBase {
    readonly kind: "MessageDeleted";
    readonly deviceId: string;
    readonly appId: string;
    readonly conversationId: string;
    readonly messageId: string;
}

/**
 * Union of all timeline operations.
 */
export type TimelineOp =
    | DeviceUnlockedOp
    | AppOpenedOp
    | ConversationOpenedOp
    | TypingStartedOp
    | TypingEndedOp
    | MessageReceivedOp
    | MessageSentOp
    | MessageReadOp
    | MessageDeletedOp;

// =============================================================================
// TIMELINE IR (COMPLETE)
// =============================================================================

/**
 * Complete Timeline IR for an episode.
 */
export interface TimelineIR {
    readonly episodeId: string;
    readonly fps: number;
    readonly durationInFrames: number;
    readonly ops: TimelineOp[];
}
````

## File: packages/ir/src/trace.ts
````typescript
/**
 * Trace Model
 * 
 * Every operation carries trace metadata for debugging,
 * golden tests, and AI explainability.
 * 
 * RULE: Every Timeline IR op and every runtime event must preserve Trace.
 */

/**
 * Canonical trace for any operation in the system.
 * This is the DEBUG SPINE of Tokovo.
 */
export interface Trace {
    /** Episode identifier */
    episodeId: string;

    /** Device this operation targets */
    deviceId: string;

    /** Beat name (semantic grouping) */
    beat: string;

    /** Track ID for concurrent operations */
    trackId: string;

    /** Index within the scene ops array */
    sceneOpIndex: number;

    /** Optional source location for debugging */
    source?: {
        file?: string;
        line?: number;
    };
}

/**
 * Create a default trace (for internal use)
 */
export function createTrace(partial: Partial<Trace>): Trace {
    return {
        episodeId: partial.episodeId ?? "",
        deviceId: partial.deviceId ?? "",
        beat: partial.beat ?? "",
        trackId: partial.trackId ?? "main",
        sceneOpIndex: partial.sceneOpIndex ?? 0,
        source: partial.source,
    };
}
````

## File: packages/ir/src/validate.ts
````typescript
/**
 * IR Invariants & Validation
 * 
 * Ensures IR types maintain their contracts.
 */

import { SceneIR, SceneOp, MessageRef } from "./scene";
import { TimelineIR, TimelineOp } from "./timeline";

// =============================================================================
// SCENE IR VALIDATION
// =============================================================================

export interface ValidationError {
    readonly code: string;
    readonly message: string;
    readonly path?: string;
}

/**
 * Validate Scene IR invariants.
 */
export function validateSceneIR(ir: SceneIR): ValidationError[] {
    const errors: ValidationError[] = [];

    // Must have episode ID
    if (!ir.episodeId) {
        errors.push({
            code: "MISSING_EPISODE_ID",
            message: "Episode ID is required",
        });
    }

    // Must have FPS
    if (!ir.meta.fps || ir.meta.fps <= 0) {
        errors.push({
            code: "INVALID_FPS",
            message: "FPS must be a positive number",
        });
    }

    // Must have at least one device
    if (ir.devices.length === 0) {
        errors.push({
            code: "NO_DEVICES",
            message: "At least one device is required",
        });
    }

    // Validate each device
    for (const device of ir.devices) {
        if (!device.deviceId) {
            errors.push({
                code: "MISSING_DEVICE_ID",
                message: "Device ID is required",
                path: `devices[${ir.devices.indexOf(device)}]`,
            });
        }
    }

    return errors;
}

// =============================================================================
// TIMELINE IR VALIDATION
// =============================================================================

/**
 * Validate Timeline IR invariants.
 */
export function validateTimelineIR(ir: TimelineIR): ValidationError[] {
    const errors: ValidationError[] = [];

    // Must have episode ID
    if (!ir.episodeId) {
        errors.push({
            code: "MISSING_EPISODE_ID",
            message: "Episode ID is required",
        });
    }

    // Must have FPS
    if (!ir.fps || ir.fps <= 0) {
        errors.push({
            code: "INVALID_FPS",
            message: "FPS must be a positive number",
        });
    }

    // All ops must have valid frame numbers
    for (let i = 0; i < ir.ops.length; i++) {
        const op = ir.ops[i];
        if (op.at < 0) {
            errors.push({
                code: "NEGATIVE_FRAME",
                message: `Operation at index ${i} has negative frame number`,
                path: `ops[${i}]`,
            });
        }

        // All ops must have trace
        if (!op.trace) {
            errors.push({
                code: "MISSING_TRACE",
                message: `Operation at index ${i} is missing trace`,
                path: `ops[${i}]`,
            });
        }
    }

    return errors;
}

// =============================================================================
// SEMANTIC VALIDATION
// =============================================================================

/**
 * Check if a message is read before it's sent.
 * Returns errors if found.
 */
export function validateReadBeforeSend(ops: TimelineOp[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const sentMessages = new Set<string>();

    for (const op of ops) {
        if (op.kind === "MessageReceived" || op.kind === "MessageSent") {
            sentMessages.add(op.message.id);
        }

        if (op.kind === "MessageRead" || op.kind === "MessageDeleted") {
            if (!sentMessages.has(op.messageId)) {
                errors.push({
                    code: "READ_BEFORE_SEND",
                    message: `Message ${op.messageId} is ${op.kind === "MessageRead" ? "read" : "deleted"} before it was sent`,
                });
            }
        }
    }

    return errors;
}

/**
 * Full validation of Timeline IR including semantic checks.
 */
export function validateTimelineIRFull(ir: TimelineIR): ValidationError[] {
    return [
        ...validateTimelineIR(ir),
        ...validateReadBeforeSend(ir.ops),
    ];
}
````

## File: packages/ir/package.json
````json
{
    "name": "@tokovo/ir",
    "version": "0.0.1",
    "description": "Tokovo IR types - Scene IR (semantic) and Timeline IR (execution)",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "files": [
        "dist"
    ],
    "scripts": {
        "build": "tsc",
        "dev": "tsc --watch"
    },
    "dependencies": {},
    "devDependencies": {
        "typescript": "^5.0.0"
    }
}
````

## File: packages/ir/tsconfig.json
````json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "declaration": true,
        "declarationMap": true
    },
    "include": [
        "src/**/*"
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}
````

## File: packages/ir/tsconfig.tsbuildinfo
````
{"root":["./src/index.ts","./src/ordering.ts","./src/scene.ts","./src/timeline.ts","./src/trace.ts","./src/validate.ts"],"version":"5.9.3"}
````

## File: packages/renderer/src/layout/strategies/feed.ts
````typescript
import { LayoutContext, FeedLayoutState, FeedItemLayout } from "../types";

export function computeFeedLayout(ctx: LayoutContext): FeedLayoutState {
    const { world, t, activeAppId, config, viewportHeight } = ctx;
    const feedConfig = config!.feed!;

    // Get feed data from app state
    // Heuristic: look for "feed" property in the active app state
    const appState = world.appState?.[activeAppId];
    const posts = appState?.feed?.posts || [];

    const itemLayouts: Record<string, FeedItemLayout> = {};
    let currentY = feedConfig.topPadding;

    // 1. Layout posts
    for (const post of posts) {
        // Calculate height
        // Heuristic: base height + caption lines
        const captionLength = post.caption?.length || 0;
        const lines = Math.ceil(Math.max(1, captionLength) / feedConfig.charsPerLine);
        const height = feedConfig.baseCardHeight + (lines * feedConfig.lineHeight);

        itemLayouts[post.id] = {
            id: post.id,
            y: currentY,
            height,
            opacity: 1,
            translateY: 0,
            scale: 1
        };

        currentY += height + feedConfig.verticalGap;
    }

    const contentHeight = currentY + feedConfig.bottomPadding;

    // 2. Scroll Position
    // Default: start at top (0)
    // If autoScroll is enabled, scroll over time
    let scrollY = 0;
    if (feedConfig.autoScroll) {
        // Simple auto-scroll: 50px per second (assuming 30fps)
        const speed = 50 / 30;
        scrollY = t * speed;
    } else if (appState?.feed?.scrollPosition !== undefined) {
        // Use scroll position from app state if available (manual control)
        scrollY = appState.feed.scrollPosition;
    }

    // Clamp scroll
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    scrollY = Math.min(scrollY, maxScroll);

    return {
        kind: "FEED",
        scrollY,
        contentHeight,
        isAtBottom: Math.abs(scrollY - maxScroll) < 10,
        itemLayouts,
        meta: {
            // TODO: Calculate visible items
        }
    };
}
````

## File: packages/renderer/src/layout/strategies/story.ts
````typescript
import { LayoutContext, StoryLayoutState, StoryItemLayout } from "../types";

export function computeStoryLayout(ctx: LayoutContext): StoryLayoutState {
    const { world, t, activeAppId, config } = ctx;
    const storyConfig = config!.story!;

    // Get stories from app state
    const appState = world.appState?.[activeAppId];
    // Find active user's stories
    // Heuristic: activeStoryId format "username:storyId"
    // Or just use the first user in the stories list for now if no ID
    const activeStoryId = ctx.activeStoryId || appState?.stories?.activeStoryId;

    let stories: any[] = [];
    let activeUserIndex = 0;

    if (activeStoryId) {
        const username = activeStoryId.split(':')[0];
        const user = appState?.stories?.users.find((u: any) => u.username === username);
        if (user) {
            stories = user.stories;
        }
    } else if (appState?.stories?.users?.length > 0) {
        // Fallback to first user
        stories = appState.stories.users[0].stories;
    }

    const storyCount = stories.length;
    if (storyCount === 0) {
        return {
            kind: "STORY",
            activeStoryIndex: 0,
            storyCount: 0,
            storyProgress: 0,
            storyLayouts: []
        };
    }

    // Calculate active index based on time
    // We assume t starts at 0 when the story view opens. 
    // In a real app, we might need a "startT" in the context or meta.
    // For now, let's assume global t maps to story progress.

    const totalDuration = storyCount * storyConfig.defaultStoryDuration;
    // Loop or clamp? Let's clamp.
    const effectiveT = Math.max(0, Math.min(t, totalDuration - 1));

    const activeStoryIndex = Math.floor(effectiveT / storyConfig.defaultStoryDuration);
    const timeInStory = effectiveT % storyConfig.defaultStoryDuration;
    const storyProgress = timeInStory / storyConfig.defaultStoryDuration;

    const storyLayouts: StoryItemLayout[] = stories.map((story: any, index: number) => {
        let opacity = 0;
        let scale = 1;
        let translateX = 0;

        if (index === activeStoryIndex) {
            opacity = 1;
            // Subtle zoom effect
            scale = 1 + (storyProgress * 0.05);
        } else if (index < activeStoryIndex) {
            // Previous story
            opacity = 0;
            translateX = -100; // Move left
        } else {
            // Next story
            opacity = 0;
            translateX = 100; // Move right
        }

        return {
            id: story.id,
            index,
            translateX,
            translateY: 0,
            scale,
            opacity
        };
    });

    return {
        kind: "STORY",
        activeStoryIndex,
        storyCount,
        storyProgress,
        storyLayouts
    };
}
````

## File: packages/renderer/src/layout/strategies/transition.ts
````typescript
import { LayoutContext, TransitionLayoutState } from "../types";

export function computeTransitionLayout(ctx: LayoutContext): TransitionLayoutState {
    const { world, t, config } = ctx;
    const transitionConfig = config!.transition!;

    // Basic transition logic based on camera state
    // If camera.type is "TRANSITION", we use its params
    // Otherwise we use defaults

    let deviceScale = transitionConfig.defaultScale;
    let deviceTranslateX = 0;
    let deviceTranslateY = 0;
    let deviceRotation = 0;
    let overlayOpacity = 0;

    if (world.camera?.type === "TRANSITION") {
        // TODO: Implement complex transitions based on camera params
        // For now, just a placeholder
    }

    return {
        kind: "TRANSITION",
        deviceTranslateX,
        deviceTranslateY,
        deviceScale,
        deviceRotation,
        overlayOpacity,
        meta: {}
    };
}
````

## File: packages/renderer/src/layout/types.ts
````typescript
export * from "@tokovo/core";
````

## File: packages/renderer/src/shared/Components.tsx
````typescript
/**
 * Shared UI Components
 * Reusable primitives that work across iOS and Android
 */

import React from "react";
import { iOSTokens, androidTokens, Platform, getTokens, sharedStyles } from "@tokovo/core";

// =============================================================================
// CHAT BUBBLE - Universal message bubble component
// =============================================================================

interface ChatBubbleProps {
    platform: Platform;
    isMe: boolean;
    senderName?: string;
    showSender?: boolean;
    timestamp?: string;
    status?: "sending" | "sent" | "delivered" | "read";
    children: React.ReactNode;
    customColors?: {
        myBubble?: string;
        otherBubble?: string;
    };
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    platform,
    isMe,
    senderName,
    showSender = false,
    timestamp,
    status,
    children,
    customColors
}) => {
    const tokens = getTokens(platform);
    const defaultMyColor = platform === "ios" ? "#E7FFDB" : "#E7FFDB";
    const defaultOtherColor = platform === "ios" ? "#FFFFFF" : "#FFFFFF";

    const bubbleColor = isMe
        ? (customColors?.myBubble || defaultMyColor)
        : (customColors?.otherBubble || defaultOtherColor);

    return (
        <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`
        }}>
            <div style={{
                backgroundColor: bubbleColor,
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                borderRadius: tokens.radii.lg,
                borderTopLeftRadius: isMe ? tokens.radii.lg : tokens.radii.sm,
                borderTopRightRadius: isMe ? tokens.radii.sm : tokens.radii.lg,
                boxShadow: tokens.shadows.sm,
                maxWidth: "78%",
                display: "flex",
                flexDirection: "column",
                gap: tokens.spacing.xs
            }}>
                {/* Sender name */}
                {showSender && senderName && !isMe && (
                    <div style={{
                        ...tokens.typography.footnote,
                        fontFamily: tokens.fontFamily,
                        color: iOSTokens.colors.whatsappGreen,
                        fontWeight: 600
                    }}>
                        {senderName}
                    </div>
                )}

                {/* Content */}
                <div style={{
                    ...tokens.typography.body,
                    fontFamily: tokens.fontFamily,
                    color: tokens.colors.label
                }}>
                    {children}
                </div>

                {/* Footer: timestamp + status */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: tokens.spacing.xs
                }}>
                    {timestamp && (
                        <span style={{
                            ...tokens.typography.caption2,
                            fontFamily: tokens.fontFamily,
                            color: tokens.colors.secondaryLabel
                        }}>
                            {timestamp}
                        </span>
                    )}
                    {isMe && status && (
                        <ReadReceipt status={status} platform={platform} />
                    )}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// READ RECEIPT - Check marks for message status
// =============================================================================

interface ReadReceiptProps {
    status: "sending" | "sent" | "delivered" | "read";
    platform: Platform;
}

const ReadReceipt: React.FC<ReadReceiptProps> = ({ status, platform }) => {
    const color = status === "read" ? "#53BDEB" : "#667781";
    const size = platform === "ios" ? 48 : 42;

    if (status === "sending") {
        return (
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill={color}>
                <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" opacity="0.3" />
            </svg>
        );
    }

    const showDouble = status === "delivered" || status === "read";

    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 24 14" fill="none">
            <path
                d={showDouble ? "M3 7l3.5 3.5L13 4" : "M5 7l4 4L18 2"}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {showDouble && (
                <path
                    d="M9 7l3.5 3.5L19 4"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
};

// =============================================================================
// APP HEADER - Universal header with back button
// =============================================================================

interface AppHeaderProps {
    platform: Platform;
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    avatarEmoji?: string;
    showBack?: boolean;
    backCount?: number;
    rightActions?: React.ReactNode;
    backgroundColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    platform,
    title,
    subtitle,
    avatarUrl,
    avatarEmoji,
    showBack = true,
    backCount,
    rightActions,
    backgroundColor
}) => {
    const tokens = getTokens(platform);
    const headerHeight = platform === "ios" ? 270 : 255;
    const statusBarHeight = platform === "ios" ? 144 : 120;

    return (
        <div style={{
            height: headerHeight,
            backgroundColor: backgroundColor || tokens.colors.background,
            marginTop: statusBarHeight,
            display: "flex",
            alignItems: "center",
            padding: `0 ${tokens.spacing.md}px`,
            borderBottom: `1px solid ${tokens.colors.separator}`,
            fontFamily: tokens.fontFamily
        }}>
            {/* Back button */}
            {showBack && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    color: tokens.colors.primary
                }}>
                    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
                        <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {backCount !== undefined && (
                        <span style={tokens.typography.body}>{backCount}</span>
                    )}
                </div>
            )}

            {/* Center content */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: showBack ? -60 : 0
            }}>
                {/* Avatar */}
                {(avatarUrl || avatarEmoji) && (
                    <div style={{
                        width: platform === "ios" ? 111 : 105,
                        height: platform === "ios" ? 111 : 105,
                        borderRadius: "50%",
                        background: avatarUrl
                            ? `url(${avatarUrl}) center/cover`
                            : `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.secondaryLabel} 100%)`,
                        marginRight: tokens.spacing.sm,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 45,
                        color: "white"
                    }}>
                        {!avatarUrl && avatarEmoji}
                    </div>
                )}

                {/* Title & subtitle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: avatarUrl || avatarEmoji ? "flex-start" : "center" }}>
                    <span style={{
                        ...tokens.typography.headline,
                        color: tokens.colors.label
                    }}>
                        {title}
                    </span>
                    {subtitle && (
                        <span style={{
                            ...tokens.typography.caption1,
                            color: tokens.colors.secondaryLabel
                        }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Right actions */}
            {rightActions && (
                <div style={{ display: "flex", gap: tokens.spacing.lg }}>
                    {rightActions}
                </div>
            )}
        </div>
    );
};

// =============================================================================
// TYPING INDICATOR - Universal typing dots
// =============================================================================

interface TypingIndicatorProps {
    platform: Platform;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ platform }) => {
    const tokens = getTokens(platform);
    const dotSize = platform === "ios" ? 24 : 21;

    return (
        <div style={{
            backgroundColor: tokens.colors.secondaryBackground,
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            borderRadius: tokens.radii.lg,
            borderTopLeftRadius: tokens.radii.sm,
            display: "inline-flex",
            gap: tokens.spacing.xs,
            alignItems: "center"
        }}>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: "50%",
                        backgroundColor: tokens.colors.tertiaryLabel,
                        opacity: 0.6
                    }}
                />
            ))}
        </div>
    );
};

// =============================================================================
// SYSTEM MESSAGE - Centered info pill
// =============================================================================

interface SystemMessageProps {
    platform: Platform;
    text: string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ platform, text }) => {
    const tokens = getTokens(platform);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            padding: `${tokens.spacing.sm}px ${tokens.spacing.xl}px`
        }}>
            <div style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`,
                borderRadius: tokens.radii.pill
            }}>
                <span style={{
                    ...tokens.typography.caption1,
                    fontFamily: tokens.fontFamily,
                    color: tokens.colors.secondaryLabel
                }}>
                    {text}
                </span>
            </div>
        </div>
    );
};
````

## File: packages/renderer/src/shared/index.ts
````typescript
export * from "./Components";
````

## File: packages/renderer/src/AppTransition.tsx
````typescript
import React from "react";

/**
 * AppTransition - Handles app open/close zoom animations
 * Creates an iOS-style scale & fade effect
 */

interface AppTransitionProps {
    children: React.ReactNode;
    isOpening: boolean;
    isClosing: boolean;
    progress: number; // 0 to 1
    originX?: number; // Icon position X (for zoom origin)
    originY?: number; // Icon position Y
}

export const AppTransition: React.FC<AppTransitionProps> = ({
    children,
    isOpening,
    isClosing,
    progress,
    originX = 0.5,
    originY = 0.5
}) => {
    // Easing function - Apple-style spring
    const easeOutSpring = (t: number) => {
        return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5);
    };

    // Calculate animation values
    let scale = 1;
    let opacity = 1;
    let borderRadius = 0;

    if (isOpening) {
        const easedProgress = easeOutSpring(progress);
        scale = 0.8 + 0.2 * easedProgress;
        opacity = easedProgress;
        borderRadius = 150 * (1 - easedProgress); // Starts rounded, ends square
    } else if (isClosing) {
        const easedProgress = easeOutSpring(1 - progress);
        scale = 0.8 + 0.2 * easedProgress;
        opacity = easedProgress;
        borderRadius = 150 * (1 - easedProgress);
    }

    return (
        <div style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                transform: `scale(${scale})`,
                transformOrigin: `${originX * 100}% ${originY * 100}%`,
                opacity,
                borderRadius,
                overflow: "hidden",
                transition: "none"
            }}>
                {children}
            </div>
        </div>
    );
};

/**
 * FaceIDAnimation - Face ID unlock animation
 */

interface FaceIDAnimationProps {
    phase: "scanning" | "success" | "failed" | "idle";
    progress: number; // 0 to 1 for animation
}

export const FaceIDAnimation: React.FC<FaceIDAnimationProps> = ({ phase, progress }) => {
    if (phase === "idle") return null;

    const isScanning = phase === "scanning";
    const isSuccess = phase === "success";

    // Scanning animation: lines moving
    const scanLineY = isScanning ? 50 + Math.sin(progress * Math.PI * 4) * 40 : 50;

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            pointerEvents: "none"
        }}>
            {/* Face ID icon */}
            <div style={{
                width: 180,
                height: 180,
                position: "relative"
            }}>
                {/* Corner brackets */}
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute" }}>
                    {/* Top-left corner */}
                    <path d="M10 50 L10 20 Q10 10 20 10 L50 10"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Top-right corner */}
                    <path d="M130 10 L160 10 Q170 10 170 20 L170 50"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Bottom-left corner */}
                    <path d="M10 130 L10 160 Q10 170 20 170 L50 170"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Bottom-right corner */}
                    <path d="M130 170 L160 170 Q170 170 170 160 L170 130"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Scanning line */}
                    {isScanning && (
                        <line
                            x1="30" y1={scanLineY}
                            x2="150" y2={scanLineY}
                            stroke="rgba(255,255,255,0.6)"
                            strokeWidth="2"
                        />
                    )}

                    {/* Success checkmark */}
                    {isSuccess && (
                        <path
                            d="M55 90 L80 115 L125 65"
                            stroke="#34C759"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: 100,
                                strokeDashoffset: 100 - progress * 100
                            }}
                        />
                    )}
                </svg>
            </div>
        </div>
    );
};

/**
 * UnlockTransition - Complete unlock flow with Face ID + swipe
 */

interface UnlockTransitionProps {
    phase: "locked" | "face_id" | "unlocking" | "unlocked";
    progress: number;
    children: React.ReactNode;
}

export const UnlockTransition: React.FC<UnlockTransitionProps> = ({
    phase,
    progress,
    children
}) => {
    let contentTransform = "translateY(0)";
    let contentOpacity = 1;
    let faceIdPhase: FaceIDAnimationProps["phase"] = "idle";

    switch (phase) {
        case "locked":
            contentOpacity = 0;
            break;
        case "face_id":
            faceIdPhase = progress < 0.7 ? "scanning" : "success";
            contentOpacity = 0;
            break;
        case "unlocking":
            contentTransform = `translateY(${(1 - progress) * 100}%)`;
            contentOpacity = progress;
            break;
        case "unlocked":
            contentTransform = "translateY(0)";
            contentOpacity = 1;
            break;
    }

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <FaceIDAnimation
                phase={faceIdPhase}
                progress={faceIdPhase === "scanning" ? progress / 0.7 : (progress - 0.7) / 0.3}
            />
            <div style={{
                width: "100%",
                height: "100%",
                transform: contentTransform,
                opacity: contentOpacity,
                transition: "none"
            }}>
                {children}
            </div>
        </div>
    );
};
````

## File: packages/renderer/src/AudioLayer.tsx
````typescript
/**
 * AudioLayer - Renders audio for the Tokovo timeline
 * 
 * Uses Remotion's <Audio> component to play sounds synchronized with video frames.
 * Supports both global sounds and per-device sounds.
 */

import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { WorldState, ActiveSound } from "@tokovo/core";
import { getSoundPath } from "@tokovo/core";

interface AudioLayerProps {
    world: WorldState;
    t: number;
    focusDeviceId?: string;  // If provided, only play sounds for this device
}

/**
 * AudioLayer component - renders all active sounds as Remotion Audio components
 */
export const AudioLayer: React.FC<AudioLayerProps> = ({ world, t, focusDeviceId }) => {
    const frame = useCurrentFrame();

    // Get audio state with safety check
    const audio = world.audio;
    if (!audio) {
        return null;
    }

    // Filter sounds based on focusDeviceId
    const activeSounds = Object.entries(audio.activeSounds).filter(([_, sound]) => {
        // If no deviceId on sound, it's global - always play
        if (!sound.deviceId) return true;
        // If no focusDeviceId specified, play all sounds
        if (!focusDeviceId) return true;
        // Only play if device matches
        return sound.deviceId === focusDeviceId;
    });

    return (
        <>
            {/* Active sounds */}
            {activeSounds.map(([instanceId, sound]) => (
                <SoundInstance
                    key={instanceId}
                    instanceId={instanceId}
                    sound={sound}
                    currentFrame={t}
                />
            ))}

            {/* Background music */}
            {audio.backgroundMusic && (
                <Sequence from={audio.backgroundMusic.startFrame}>
                    <Audio
                        src={staticFile(getSoundPath(audio.backgroundMusic.soundId))}
                        volume={audio.backgroundMusic.volume}
                        loop={audio.backgroundMusic.loop}
                    />
                </Sequence>
            )}
        </>
    );
};

/**
 * Individual sound instance - handles timing and volume
 */
const SoundInstance: React.FC<{
    instanceId: string;
    sound: ActiveSound;
    currentFrame: number;
}> = ({ instanceId, sound, currentFrame }) => {
    // Calculate if sound should be playing
    const soundFrame = currentFrame - sound.startFrame;

    // If sound has a duration and we're past it, don't render
    if (sound.duration && soundFrame > sound.duration) {
        return null;
    }

    // Calculate volume (could be fading)
    let volume = sound.volume;
    const fadeSound = sound as any;
    if (fadeSound.fadeTarget !== undefined && fadeSound.fadeStartFrame !== undefined) {
        const fadeProgress = Math.min(1, (currentFrame - fadeSound.fadeStartFrame) / fadeSound.fadeDuration);
        volume = sound.volume + (fadeSound.fadeTarget - sound.volume) * fadeProgress;
    }

    return (
        <Sequence from={sound.startFrame} durationInFrames={sound.duration || undefined}>
            <Audio
                src={staticFile(getSoundPath(sound.soundId))}
                volume={Math.max(0, Math.min(1, volume))}
                loop={sound.loop}
            />
        </Sequence>
    );
};

export default AudioLayer;
````

## File: packages/renderer/src/camera-composer.ts
````typescript
/**
 * Camera Composer
 *
 * Applies director effects to create final camera transform.
 * Director owns framing when enabled - base transform should be neutral.
 */

import {
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
} from "@tokovo/core";
import { DerivedCameraEffect, LayoutRect } from "@tokovo/core";

export interface Viewport {
    width: number;
    height: number;
    scrollY: number;
}

/**
 * Apply director effects to create final transform.
 *
 * POLICY: Director owns framing when enabled.
 * When director effects exist, we start from neutral and apply them.
 */
export function applyDirectorEffects(
    effects: DerivedCameraEffect[],
    viewport: Viewport
): CameraTransform {
    // Start fresh - director owns the frame
    const transform: CameraTransform = { ...DEFAULT_CAMERA_TRANSFORM };

    // Apply framing (there's at most 1 after arbitration)
    const framing = effects.find((e) => e.category === "framing");
    if (framing) {
        applyFramingEffect(transform, framing, viewport);
    }

    // Apply shake (additive, can stack)
    const shakes = effects.filter((e) => e.category === "shake");
    for (const shake of shakes) {
        applyShakeEffect(transform, shake);
    }

    return transform;
}

function applyFramingEffect(
    transform: CameraTransform,
    effect: DerivedCameraEffect,
    viewport: Viewport
): void {
    const { progress, scale, target } = effect;

    switch (effect.type) {
        case "PushIn":
        case "ZoomToRect": {
            if (!scale || !target) return;

            // Scale interpolation
            transform.scale = 1 + (scale - 1) * progress;

            // Origin: center on target rect (adjusted for scroll)
            const centerX = target.x + target.width / 2;
            const centerY = target.y + target.height / 2 - viewport.scrollY;

            transform.originX = centerX / viewport.width;
            transform.originY = centerY / viewport.height;
            break;
        }

        case "PullBack": {
            if (!scale) return;
            transform.scale = 1 + (scale - 1) * progress;
            // Origin stays centered for pullback
            transform.originX = 0.5;
            transform.originY = 0.5;
            break;
        }
    }
}

function applyShakeEffect(
    transform: CameraTransform,
    effect: DerivedCameraEffect
): void {
    const { intensity, seed, progress } = effect;
    if (!intensity || seed === undefined) return;

    // Decay shake over progress
    const decay = 1 - progress;
    const amp = intensity * decay;

    // Deterministic shake
    transform.shakeX += (seededRandom(seed) - 0.5) * 2 * amp;
    transform.shakeY += (seededRandom(seed + 1) - 0.5) * 2 * amp;
}

/**
 * Deterministic random (mulberry32)
 */
function seededRandom(seed: number): number {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
````

## File: packages/renderer/src/HeadsUpNotification.tsx
````typescript
import React from "react";
import { Notification } from "@tokovo/core";

/**
 * App icon mappings for notifications
 */
const APP_ICONS: Record<string, { bg: string; icon: string }> = {
    app_whatsapp: { bg: "#25D366", icon: "W" },
    app_instagram: { bg: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)", icon: "📷" },
    app_messages: { bg: "#34C759", icon: "💬" },
    app_facetime: { bg: "#32D74B", icon: "📹" },
    app_phone: { bg: "#32D74B", icon: "📞" },
};

interface HeadsUpNotificationProps {
    notification: Notification;
    currentTime: number;
    variant?: "ios" | "android";
    autoDismissAfter?: number; // frames
}

/**
 * Heads-Up Notification
 * Displays at the top of the screen when device is unlocked
 * Slides down and auto-dismisses after configurable duration
 */
export const HeadsUpNotification: React.FC<HeadsUpNotificationProps> = ({
    notification,
    currentTime,
    variant = "ios",
    autoDismissAfter = 150 // 5 seconds at 30fps
}) => {
    const isAndroid = variant === "android";

    // Calculate animation state
    const timeSinceAppear = currentTime - notification.at;
    const appearDuration = 15; // frames for slide-in animation
    const dismissDuration = 15; // frames for slide-out animation

    // Check if dismissed (manually or auto)
    const shouldAutoDismiss = timeSinceAppear > autoDismissAfter;
    const isDismissed = notification.dismissedAt !== undefined || shouldAutoDismiss;

    // Calculate animation progress
    let opacity = 1;
    let translateY = 0;

    if (timeSinceAppear < appearDuration) {
        // Slide in animation
        const progress = Math.min(1, timeSinceAppear / appearDuration);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        opacity = ease;
        translateY = -120 * (1 - ease); // Slide from above
    } else if (isDismissed) {
        // Slide out animation
        const dismissStartTime = notification.dismissedAt || (notification.at + autoDismissAfter);
        const timeSinceDismiss = currentTime - dismissStartTime;

        if (timeSinceDismiss < dismissDuration) {
            const progress = timeSinceDismiss / dismissDuration;
            const ease = Math.pow(progress, 2); // Ease in quad
            opacity = 1 - ease;
            translateY = -120 * ease; // Slide up
        } else {
            return null; // Fully dismissed
        }
    }

    // Get app icon
    const appInfo = APP_ICONS[notification.appId] || { bg: "#8E8E93", icon: "📱" };

    return (
        <div style={{
            position: "absolute",
            top: 165, // Below dynamic island
            left: "50%",
            transform: `translateX(-50%) translateY(${translateY}px)`,
            width: "92%",
            opacity,
            zIndex: 200,
            pointerEvents: "none"
        }}>
            <div style={{
                backgroundColor: isAndroid ? "rgba(48, 48, 48, 0.98)" : "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                borderRadius: isAndroid ? 30 : 48,
                padding: "30px 36px",
                boxShadow: "0 12px 48px rgba(0, 0, 0, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: 30,
                color: isAndroid ? "white" : "black"
            }}>
                {/* App Icon */}
                <div style={{
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    background: appInfo.bg,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 45,
                    color: "white",
                    flexShrink: 0
                }}>
                    {notification.icon || appInfo.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 9
                    }}>
                        <span style={{
                            fontSize: 39,
                            fontWeight: "600",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                        }}>
                            {notification.title}
                        </span>
                        <span style={{
                            fontSize: 33,
                            opacity: 0.5,
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                        }}>
                            now
                        </span>
                    </div>
                    <div style={{
                        fontSize: 36,
                        opacity: 0.85,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {notification.body}
                    </div>
                </div>
            </div>
        </div>
    );
};
````

## File: packages/renderer/src/types.ts
````typescript
export * from "@tokovo/core";
````

## File: packages/renderer/src/VisualDebugger.tsx
````typescript
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
````

## File: packages/renderer/README.md
````markdown
# Tokovo Layout System — Unified Spec (All UI Types)

## 0. Concept

The **Tokovo Layout System** is the layer that turns:

* `WorldState` (devices, conversations, notifications, camera, etc.)
* episode timeline (via `replay(...)`)
* current frame/time `t`
* active device + app + view type

into **view-specific layouts** for:

* Chat views
* Feed views
* Story views
* Lockscreen views
* Transitional/cinematic scenes

Each layout is:

* deterministic
* frame-driven
* Remotion-safe (no DOM measurement / no CSS transitions)

---

## 1. Core Types

### 1.1 ViewKind

```ts
export type ViewKind =
  | "CHAT"
  | "FEED"
  | "STORY"
  | "LOCKSCREEN"
  | "TRANSITION";
```

### 1.2 LayoutContext (global)

```ts
export interface LayoutContext {
  world: WorldState;
  t: number; // current frame
  activeDeviceId: string;
  activeAppId: string;
  viewKind: ViewKind;

  // View-specific selectors
  activeConversationId?: string;   // CHAT
  activeFeedId?: string;           // FEED (e.g. timeline id)
  activeStoryId?: string;          // STORY (e.g. story reel id)

  viewportWidth: number;
  viewportHeight: number;

  // Optional configuration overrides
  config?: Partial<LayoutConfig>;
}
```

> **Note:** different view kinds will care about different selectors (e.g., `activeConversationId` only matters for `"CHAT"`).

---

## 2. LayoutConfig (global + per-view strategy)

```ts
export interface LayoutConfig {
  // Global-ish things
  cinematicMode: "NONE" | "FOLLOW_LAST_MESSAGE" | "FOCUS_ON_RANGE";

  // Chat-specific
  chat: ChatLayoutConfig;

  // Feed-specific
  feed: FeedLayoutConfig;

  // Story-specific
  story: StoryLayoutConfig;

  // Lock screen
  lockscreen: LockscreenLayoutConfig;

  // Transitions
  transition: TransitionLayoutConfig;
}
```

You’ll define **per-view configs**:

### 2.1 ChatLayoutConfig (what we already designed)

```ts
export interface ChatLayoutConfig {
  bubbleWidth: number;
  baseBubbleHeight: number;
  charsPerLine: number;
  lineHeight: number;
  verticalGap: number;
  topPadding: number;
  bottomPadding: number;

  messageAppearDuration: number;
  messageAppearOffset: number;
  scrollEasingDuration: number;
  maxScrollCatchupSpeed: number;

  lockToBottom: boolean;
}
```

### 2.2 FeedLayoutConfig (for Instagram / X / TikTok feeds)

```ts
export interface FeedLayoutConfig {
  cardWidth: number;
  baseCardHeight: number;
  verticalGap: number;
  topPadding: number;
  bottomPadding: number;

  // For variable-height posts, same trick as chat:
  charsPerLine: number;
  lineHeight: number;

  scrollEasingDuration: number;
  maxScrollCatchupSpeed: number;

  startAtTop: boolean;      // typical feed behaviour
  autoScroll?: boolean;     // for cinematic auto-scroll episodes
}
```

### 2.3 StoryLayoutConfig (Instagram Stories / Snap)

```ts
export interface StoryLayoutConfig {
  // Each story = full-screen page
  defaultStoryDuration: number; // in frames
  progressBarHeight: number;
  storyGap: number;             // for 3D-ish page stack if needed

  // Animation
  storyTransitionDuration: number; // frames between stories
}
```

### 2.4 LockscreenLayoutConfig

```ts
export interface LockscreenLayoutConfig {
  topPadding: number;
  notificationGap: number;
  notificationWidth: number;
  baseNotificationHeight: number;
  charsPerLine: number;
  lineHeight: number;

  stackMaxNotifications: number; // older ones collapsed/hidden
  appearDuration: number;
}
```

### 2.5 TransitionLayoutConfig

```ts
export interface TransitionLayoutConfig {
  // Device position in composition
  defaultScale: number;
  zoomedScale: number;
  panDuration: number;
  zoomDuration: number;

  // Optionally, per-transition presets (open app, unlock, etc.)
}
```

---

## 3. LayoutState — Tagged Union (all view kinds)

Single function, **multi-view outputs**:

```ts
export type LayoutState =
  | ChatLayoutState
  | FeedLayoutState
  | StoryLayoutState
  | LockscreenLayoutState
  | TransitionLayoutState;
```

Each state has a `kind` field:

```ts
export interface BaseLayoutState {
  kind: ViewKind;
}
```

---

### 3.1 ChatLayoutState

```ts
export interface ChatLayoutState extends BaseLayoutState {
  kind: "CHAT";
  scrollY: number;
  contentHeight: number;
  isAtBottom: boolean;
  messageLayouts: Record<string, ChatMessageLayout>;
  typingLayout?: TypingLayout | null;
  meta: ChatLayoutMeta;
}
```

Where `ChatMessageLayout`, `TypingLayout`, `ChatLayoutMeta` are what we already specced (id, y, height, opacity, translateY, etc.).

---

### 3.2 FeedLayoutState

```ts
export interface FeedLayoutState extends BaseLayoutState {
  kind: "FEED";
  scrollY: number;
  contentHeight: number;
  isAtBottom: boolean;
  itemLayouts: Record<string, FeedItemLayout>;
  meta: FeedLayoutMeta;
}
```

```ts
export interface FeedItemLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
  scale: number;   // for subtle parallax / entry
}
```

`FeedLayoutMeta` can include:

```ts
export interface FeedLayoutMeta {
  firstVisibleItemId?: string;
  lastVisibleItemId?: string;
  focusedItemId?: string; // for cinematic highlight
}
```

The **geometry model** is similar to chat: stack cards with a deterministic height function (based on text length, optional media flags, etc.).

---

### 3.3 StoryLayoutState

```ts
export interface StoryLayoutState extends BaseLayoutState {
  kind: "STORY";
  activeStoryIndex: number;
  storyCount: number;
  storyProgress: number; // 0..1 within current story
  storyLayouts: StoryItemLayout[];
}
```

```ts
export interface StoryItemLayout {
  id: string;
  index: number;
  // For 3D card stack / page-motion effects:
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
}
```

Behaviour:

* Given timeline of stories (either from episode or world state),
* Given `t`, compute which story index is active and the progress inside that story:

  ```ts
  const storyIndex = floor((t - startT) / storyDuration);
  const localProgress = ((t - startT) % storyDuration) / storyDuration;
  ```
* Use `storyTransitionDuration` to add slide/fade between storyIndex and storyIndex+1.

---

### 3.4 LockscreenLayoutState

```ts
export interface LockscreenLayoutState extends BaseLayoutState {
  kind: "LOCKSCREEN";
  notificationLayouts: NotificationLayout[];
  meta: LockscreenLayoutMeta;
}
```

```ts
export interface NotificationLayout {
  id: string;
  y: number;
  height: number;
  opacity: number;
  translateY: number;
}
```

The inputs come from `device.notifications` in `WorldState`. 

Geometry is again deterministic: approximate height from title/body length and stack them with gap & padding. Animation: when a notification appears at `event.at`, fade/slide it in similar to messages.

---

### 3.5 TransitionLayoutState

```ts
export interface TransitionLayoutState extends BaseLayoutState {
  kind: "TRANSITION";
  // These values are for the outer DeviceFrame / TokovoRenderer
  deviceTranslateX: number;
  deviceTranslateY: number;
  deviceScale: number;
  deviceRotation: number;
  overlayOpacity: number;
  meta: TransitionLayoutMeta;
}
```

This layer treats the **device as an actor** in the composition:

* Unlock animation: fade in, scale up from center.
* Open app: slight bump-in, tilt, zoom.
* Cutscenes: pan device left/right, etc.

The inputs can be:

* Derived from `world.camera` (if you extend it with more camera modes) 
* Derived from timeline CAMERA events (already defined in your `TimelineEvent` union). 

---

## 4. The Core Function

Single entry point:

```ts
export function computeLayout(ctx: LayoutContext): LayoutState {
  switch (ctx.viewKind) {
    case "CHAT":
      return computeChatLayout(ctx);
    case "FEED":
      return computeFeedLayout(ctx);
    case "STORY":
      return computeStoryLayout(ctx);
    case "LOCKSCREEN":
      return computeLockscreenLayout(ctx);
    case "TRANSITION":
      return computeTransitionLayout(ctx);
  }
}
```

Each `computeXLayout` is:

* pure
* deterministic
* uses only `world`, `t`, `config` and known IDs.

---

## 5. Determinism & Remotion Rules (still apply for ALL)

For **every** viewKind:

* ❌ No DOM measurement / `getBoundingClientRect()`

* ❌ No CSS transitions / `transition: ...`

* ❌ No `setTimeout`, `requestAnimationFrame` inside animation logic

* ❌ No randomness (or if used, seed-based deterministic)

* ✅ All animation values: pure math from `(t, world, config)`

* ✅ `useCurrentFrame()` and `useVideoConfig()` only used to get `t` and fps

* ✅ Styling is done in React via inline styles using the LayoutState

This is consistent with Remotion’s SSR + frame-based rendering model and your current `TokovoRenderer` usage. 

---

## 6. Integration in TokovoRenderer

Your `TokovoRenderer` can now:

1. **Decide which viewKind** to use:

   * If device is locked → `LOCKSCREEN`
   * If app is WhatsApp/IG DM → `CHAT`
   * If app is Instagram feed → `FEED`
   * If app is stories → `STORY`
   * If you insert explicit camera transition scenes → `TRANSITION`

2. Call:

```ts
const layout = computeLayout({
  world,
  t,
  activeDeviceId,
  activeAppId,
  viewKind,
  activeConversationId,
  viewportWidth: deviceWidth,
  viewportHeight: deviceHeight,
});
```

3. Pass `layout` down to the specific App View, which will branch based on `layout.kind` and render accordingly.
````

## File: packages/renderer/tsconfig.json
````json
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
````

## File: .gitignore
````
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
````

## File: .tool-versions
````
nodejs 25.2.0
````

## File: package.json
````json
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
````

## File: pnpm-workspace.yaml
````yaml
packages:
  - "apps/*"
  - "packages/*"
````

## File: tsconfig.base.json
````json
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
````

## File: turbo.json
````json
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
````

## File: apps/video-runner/src/AndroidVideo.tsx
````typescript
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
````

## File: apps/video-runner/src/InstagramVideo.tsx
````typescript
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
    const world = replay(instagramEpisode.initialWorld as unknown as WorldState, instagramEpisode.events as any, t);

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
````

## File: apps/video-runner/src/WhatsappPsychoticDemoVideo.tsx
````typescript
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { whatsappPsychoticDemo } from "@tokovo/episodes";
import { replay, WorldState, TimelineEvent, createEventIndex } from "@tokovo/core";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";

// Import device reducer to ensure it's registered
import "@tokovo/devices";

/**
 * WhatsappPsychoticDemoVideo
 * Demonstrates advanced "psychotic" messaging features:
 * - Missed calls
 * - Deleted messages
 * - Screenshot alerts
 * - Voice notes with waveforms
 * - Edited messages
 * 
 * DirectorLite enabled - camera will automatically react to events
 */
export const WhatsappPsychoticDemoVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame;

    // Episode data
    const episode = whatsappPsychoticDemo as { initialWorld: WorldState; events: TimelineEvent[] };

    // Create event index once for DirectorLite (memoized)
    const eventIndex = useMemo(
        () => createEventIndex(episode.events),
        [episode.events]
    );

    // Replay world state at current time
    const world = replay(episode.initialWorld, episode.events, t);

    // Calculate scale to fit device in composition
    const compositionWidth = 1080;
    const compositionHeight = 1920;
    const deviceWidth = iPhone16Profile.dimensions.width;
    const deviceHeight = iPhone16Profile.dimensions.height;

    const scaleX = compositionWidth / deviceWidth;
    const scaleY = compositionHeight / deviceHeight;
    const scale = Math.min(scaleX, scaleY);

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a2e",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center"
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    debug={false}
                    eventIndex={eventIndex}
                    directorEnabled={true}
                    directorDebug={true}  // Enable debug logging for testing
                />
            </div>
        </AbsoluteFill>
    );
};
````

## File: packages/apps-instagram/src/views/BottomNav.tsx
````typescript
import React from "react";
import { InstagramView } from "../types";

// ============================================================================
// AUTHENTIC INSTAGRAM iOS BOTTOM NAV ICONS
// ============================================================================

// Home icon - Filled house shape (Instagram-specific)
const HomeIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        {active ? (
            // Filled version
            <path
                d="M12 2L3 9V22H9V15H15V22H21V9L12 2Z"
                fill="white"
            />
        ) : (
            // Outline version
            <path
                d="M12 3L4 10V21H10V15H14V21H20V10L12 3Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
            />
        )}
    </svg>
);

// Search/Explore icon - Magnifying glass
const SearchIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <circle
            cx="10.5"
            cy="10.5"
            r="7"
            stroke="white"
            strokeWidth={active ? "2.5" : "1.8"}
        />
        <line
            x1="15.5"
            y1="15.5"
            x2="21"
            y2="21"
            stroke="white"
            strokeWidth={active ? "2.5" : "1.8"}
            strokeLinecap="round"
        />
    </svg>
);

// Reels icon - Clapperboard style
const ReelsIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        {active ? (
            <>
                <rect x="3" y="3" width="18" height="18" rx="3" fill="white" />
                <polygon points="10,8 17,12 10,16" fill="black" />
            </>
        ) : (
            <>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8" fill="none" />
                <polygon points="10,8 17,12 10,16" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            </>
        )}
    </svg>
);

// Create/Add icon - Plus in square
const CreateIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="white"
            strokeWidth={active ? "2.2" : "1.8"}
            fill="none"
        />
        <line
            x1="12"
            y1="8"
            x2="12"
            y2="16"
            stroke="white"
            strokeWidth={active ? "2.2" : "1.8"}
            strokeLinecap="round"
        />
        <line
            x1="8"
            y1="12"
            x2="16"
            y2="12"
            stroke="white"
            strokeWidth={active ? "2.2" : "1.8"}
            strokeLinecap="round"
        />
    </svg>
);

// Profile icon - Avatar with optional ring
const ProfileIcon = ({ active, avatarUrl }: { active: boolean; avatarUrl?: string }) => (
    <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        border: active ? "6px solid white" : "none",
        padding: active ? 0 : 6,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <div style={{
            width: active ? 60 : 60,
            height: active ? 60 : 60,
            borderRadius: "50%",
            backgroundColor: "#444",
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }} />
    </div>
);

// ============================================================================
// BOTTOM NAVIGATION COMPONENT
// ============================================================================

export const BottomNav: React.FC<{ currentView: InstagramView }> = ({ currentView }) => {
    return (
        <div style={{
            height: 156, // 52pt * 3
            backgroundColor: "#000",
            borderTop: "1px solid #262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: 30, // Home indicator spacing
            paddingTop: 12
        }}>
            <HomeIcon active={currentView === 'feed'} />
            <SearchIcon active={currentView === 'explore'} />
            <ReelsIcon active={currentView === 'reels'} />
            <CreateIcon active={false} />
            <ProfileIcon active={currentView === 'profile'} />
        </div>
    );
};
````

## File: packages/apps-instagram/src/index.ts
````typescript
import { ReducerRegistry } from "@tokovo/core";
import { instagramRuntime } from "./runtime";

ReducerRegistry.registerAppReducer("app_instagram", instagramRuntime);

export * from "./runtime";
export * from "./ui";
export * from "./types";
````

## File: packages/apps-instagram/src/runtime.ts
````typescript
import { WorldState, TimelineEvent } from "@tokovo/core";

import { initialInstagramState, InstagramState } from "./types";

export const instagramRuntime = (draft: WorldState, event: TimelineEvent) => {
    if (event.kind !== "APP" || event.appId !== "app_instagram") return;

    // Initialize app state if missing
    if (!draft.appState) {
        draft.appState = {};
    }
    if (!draft.appState["app_instagram"]) {
        draft.appState["app_instagram"] = initialInstagramState;
    }

    const appState = draft.appState["app_instagram"] as InstagramState;

    // Handle generic custom events
    if (event.type === "CUSTOM") {
        console.log(`[InstagramRuntime] Processing CUSTOM event: ${event.name}`, event.payload);
        switch (event.name) {
            case "NAVIGATE":
                appState.currentView = event.payload.view;
                console.log(`[InstagramRuntime] Navigated to: ${appState.currentView}`);
                break;
            // Add other custom events here
        }
        return;
    }

    // Legacy/Specific events (DM)
    const { conversationId, type } = event as any; // Cast to access specific fields if needed

    if (conversationId) {
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
    }
};
````

## File: packages/apps-whatsapp/src/index.ts
````typescript
export * from "./types";
export * from "./runtime";
export * from "./ui";
export * from "./plugin";
export * from "./components";
````

## File: packages/apps-whatsapp/src/TypingBubble.tsx
````typescript
import React from "react";

/**
 * WhatsApp iOS Typing Indicator
 * Three bouncing grey dots in a white bubble that matches the incoming message style
 */
export const TypingBubble: React.FC = () => {
    return (
        <div style={{
            backgroundColor: "#FFFFFF",
            padding: "27px 36px",
            borderRadius: 24,
            borderTopLeftRadius: 6,
            alignSelf: "flex-start",
            width: "fit-content",
            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
            display: "flex",
            alignItems: "center",
            gap: 15,
            height: 72
        }}>
            <Dot delay={0} />
            <Dot delay={0.15} />
            <Dot delay={0.3} />
            <style>{`
                @keyframes whatsappTyping {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-9px);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
    <div style={{
        width: 24,
        height: 24,
        backgroundColor: "#8696A0",
        borderRadius: "50%",
        animation: `whatsappTyping 1.2s infinite ease-in-out`,
        animationDelay: `${delay}s`
    }} />
);
````

## File: packages/apps-whatsapp/package.json
````json
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
````

## File: packages/devices/package.json
````json
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
````

## File: packages/episodes/src/examples/camera-showcase.json
````json
{
    "meta": {
        "title": "Camera Showcase - Cinematic Demo",
        "fps": 30,
        "durationInFrames": 900
    },
    "initialWorld": {
        "devices": {
            "main_phone": {
                "id": "main_phone",
                "profileId": "iphone16",
                "isLocked": false,
                "foregroundAppId": "app_whatsapp",
                "notifications": []
            }
        },
        "conversations": {
            "conv_demo": {
                "id": "conv_demo",
                "type": "dm",
                "name": "Camera Director 🎬",
                "avatar": "",
                "messages": [
                    {
                        "id": "m1",
                        "from": "Camera Director 🎬",
                        "text": "Welcome to the Camera Showcase!",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "m2",
                        "from": "me",
                        "text": "Show me what you've got!",
                        "type": "text",
                        "status": "delivered"
                    }
                ],
                "typing": {}
            }
        },
        "appState": {
            "activeApp": "whatsapp",
            "whatsapp": {
                "screen": "chat",
                "conversationId": "conv_demo"
            }
        },
        "camera": {
            "baseView": "APP_VIEW",
            "activeEffects": [],
            "transform": {
                "translateX": 0,
                "translateY": 0,
                "scale": 1,
                "rotation": 0,
                "originX": 0.5,
                "originY": 0.5,
                "shakeX": 0,
                "shakeY": 0
            }
        }
    },
    "events": [
        {
            "at": 30,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_demo",
            "from": "Camera Director 🎬",
            "message": {
                "id": "m3",
                "type": "text",
                "text": "🎥 First up: ZOOM IN",
                "status": "read"
            }
        },
        {
            "at": 60,
            "kind": "CAMERA",
            "type": "ZOOM",
            "scale": 1.5,
            "originX": 0.2,
            "originY": 0.2,
            "duration": 45,
            "easing": "ease-out"
        },
        {
            "at": 120,
            "kind": "CAMERA",
            "type": "RESET",
            "duration": 30,
            "easing": "ease-out"
        },
        {
            "at": 150,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_demo",
            "from": "Camera Director 🎬",
            "message": {
                "id": "m4",
                "type": "text",
                "text": "📱 Now watch this SHAKE!",
                "status": "read"
            }
        },
        {
            "at": 180,
            "kind": "CAMERA",
            "type": "SHAKE",
            "intensity": 12,
            "frequency": 20,
            "decay": 0.4,
            "duration": 45
        },
        {
            "at": 240,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_demo",
            "from": "Camera Director 🎬",
            "message": {
                "id": "m5",
                "type": "text",
                "text": "👆 Smooth PAN coming up",
                "status": "read"
            }
        },
        {
            "at": 270,
            "kind": "CAMERA",
            "type": "PAN",
            "translateX": -100,
            "translateY": -80,
            "duration": 60,
            "easing": "ease-in-out"
        },
        {
            "at": 345,
            "kind": "CAMERA",
            "type": "RESET",
            "duration": 30,
            "easing": "cinematic"
        },
        {
            "at": 390,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_demo",
            "from": "Camera Director 🎬",
            "message": {
                "id": "m6",
                "type": "text",
                "text": "🎯 FOCUS on the message!",
                "status": "read"
            }
        },
        {
            "at": 420,
            "kind": "CAMERA",
            "type": "FOCUS",
            "target": {
                "type": "point",
                "x": 0.7,
                "y": 0.6
            },
            "scale": 1.8,
            "duration": 60,
            "easing": "ease-out"
        },
        {
            "at": 510,
            "kind": "CAMERA",
            "type": "RESET",
            "duration": 45,
            "easing": "cinematic"
        },
        {
            "at": 570,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_demo",
            "from": "Camera Director 🎬",
            "message": {
                "id": "m7",
                "type": "text",
                "text": "🔥 COMBO: Zoom + Shake!",
                "status": "read"
            }
        },
        {
            "at": 600,
            "kind": "CAMERA",
            "type": "ZOOM",
            "scale": 1.3,
            "originX": 0.5,
            "originY": 0.5,
            "duration": 90,
            "easing": "ease-out"
        },
        {
            "at": 615,
            "kind": "CAMERA",
            "type": "SHAKE",
            "intensity": 10,
            "frequency": 18,
            "decay": 0.5,
            "duration": 75
        },
        {
            "at": 720,
            "kind": "CAMERA",
            "type": "RESET",
            "duration": 45,
            "easing": "ease-in-out"
        },
        {
            "at": 780,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_demo",
            "from": "Camera Director 🎬",
            "message": {
                "id": "m8",
                "type": "text",
                "text": "🎬 That's a wrap! You're now a Director.",
                "status": "read"
            }
        },
        {
            "at": 810,
            "kind": "CAMERA",
            "type": "ZOOM",
            "scale": 0.9,
            "duration": 60,
            "easing": "cinematic"
        }
    ]
}
````

## File: packages/episodes/src/examples/homescreen-group-demo.json
````json
{
    "meta": {
        "title": "Home Screen & Group Chat Complete Demo",
        "fps": 30,
        "durationInFrames": 900
    },
    "initialWorld": {
        "devices": {
            "user_phone": {
                "id": "user_phone",
                "profileId": "iphone16",
                "isLocked": true,
                "notifications": [],
                "homeScreen": {
                    "wallpaper": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%)",
                    "pages": [
                        {
                            "apps": [
                                {
                                    "appId": "app_facetime",
                                    "label": "FaceTime",
                                    "icon": "📹"
                                },
                                {
                                    "appId": "app_calendar",
                                    "label": "Calendar",
                                    "icon": "📅"
                                },
                                {
                                    "appId": "app_photos",
                                    "label": "Photos",
                                    "icon": "📸"
                                },
                                {
                                    "appId": "app_camera",
                                    "label": "Camera",
                                    "icon": "📷"
                                },
                                {
                                    "appId": "app_mail",
                                    "label": "Mail",
                                    "icon": "✉️",
                                    "badge": 12
                                },
                                {
                                    "appId": "app_clock",
                                    "label": "Clock",
                                    "icon": "🕐"
                                },
                                {
                                    "appId": "app_maps",
                                    "label": "Maps",
                                    "icon": "🗺️"
                                },
                                {
                                    "appId": "app_wallet",
                                    "label": "Wallet",
                                    "icon": "💳"
                                },
                                {
                                    "appId": "app_notes",
                                    "label": "Notes",
                                    "icon": "📝"
                                },
                                {
                                    "appId": "app_reminders",
                                    "label": "Reminders",
                                    "icon": "✅",
                                    "badge": 3
                                },
                                {
                                    "appId": "app_news",
                                    "label": "News",
                                    "icon": "📰"
                                },
                                {
                                    "appId": "app_health",
                                    "label": "Health",
                                    "icon": "❤️"
                                },
                                {
                                    "appId": "app_settings",
                                    "label": "Settings",
                                    "icon": "⚙️"
                                },
                                {
                                    "appId": "app_music",
                                    "label": "Music",
                                    "icon": "🎵"
                                },
                                {
                                    "appId": "app_appstore",
                                    "label": "App Store",
                                    "icon": "🛒"
                                },
                                {
                                    "appId": "app_files",
                                    "label": "Files",
                                    "icon": "📁"
                                }
                            ]
                        }
                    ],
                    "dock": [
                        {
                            "appId": "app_phone",
                            "label": "Phone",
                            "icon": "📞",
                            "badge": 2
                        },
                        {
                            "appId": "app_messages",
                            "label": "Messages",
                            "icon": "💬",
                            "badge": 5
                        },
                        {
                            "appId": "app_whatsapp",
                            "label": "WhatsApp",
                            "icon": "💬",
                            "badge": 8
                        },
                        {
                            "appId": "app_instagram",
                            "label": "Instagram",
                            "icon": "📷"
                        }
                    ]
                }
            }
        },
        "conversations": {
            "group_family": {
                "id": "group_family",
                "type": "group",
                "name": "Family Group 👨‍👩‍👧",
                "members": [
                    {
                        "id": "mom",
                        "name": "Mom"
                    },
                    {
                        "id": "dad",
                        "name": "Dad"
                    },
                    {
                        "id": "sarah",
                        "name": "Sarah"
                    }
                ],
                "admins": [
                    "mom"
                ],
                "messages": [
                    {
                        "id": "msg1",
                        "from": "mom",
                        "text": "Good morning everyone! ☀️",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg2",
                        "from": "dad",
                        "text": "Morning! How's everyone doing?",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg3",
                        "from": "me",
                        "text": "Hi mom! Hi dad! 👋",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg4",
                        "from": "sarah",
                        "text": "Just woke up lol",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg5",
                        "from": "mom",
                        "text": "Don't forget we have dinner at 7pm tomorrow!",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg6",
                        "from": "me",
                        "text": "I'll be there! Should I bring anything? 🍕",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg7",
                        "from": "dad",
                        "text": "Just bring yourself 😊",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "msg8",
                        "from": "sarah",
                        "text": "Can I bring a friend?",
                        "type": "text",
                        "status": "delivered"
                    }
                ],
                "typing": {}
            }
        },
        "appState": {},
        "camera": {
            "type": "APP_VIEW"
        }
    },
    "events": [
        {
            "at": 0,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_whatsapp",
            "title": "Family Group 👨‍👩‍👧",
            "body": "Mom: Don't forget dinner tomorrow!",
            "mode": "lockscreen"
        },
        {
            "at": 60,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "UNLOCK"
        },
        {
            "at": 90,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "GO_HOME"
        },
        {
            "at": 180,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "OPEN_APP",
            "appId": "app_whatsapp"
        },
        {
            "at": 240,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "group_family",
            "from": "mom"
        },
        {
            "at": 300,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "group_family",
            "from": "mom"
        },
        {
            "at": 300,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "group_family",
            "from": "mom",
            "text": "Of course Sarah! Who do you want to bring?"
        },
        {
            "at": 360,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "group_family",
            "from": "sarah"
        },
        {
            "at": 420,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "group_family",
            "from": "sarah"
        },
        {
            "at": 420,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "group_family",
            "from": "sarah",
            "text": "My friend Emma! She's really nice 😊"
        },
        {
            "at": 480,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "GROUP_MEMBER_ADDED",
            "conversationId": "group_family",
            "memberId": "emma",
            "memberName": "Emma",
            "addedBy": "Sarah"
        },
        {
            "at": 540,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "group_family",
            "from": "emma"
        },
        {
            "at": 600,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "group_family",
            "from": "emma"
        },
        {
            "at": 600,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "group_family",
            "from": "emma",
            "text": "Hi everyone! Thanks for having me! 🙏"
        },
        {
            "at": 660,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "group_family",
            "from": "mom",
            "text": "Welcome Emma! We're happy to have you 💕"
        },
        {
            "at": 720,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "group_family",
            "from": "me",
            "text": "Looking forward to it! See you all tomorrow!"
        },
        {
            "at": 780,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "GO_HOME"
        },
        {
            "at": 780,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SET_BADGE",
            "appId": "app_whatsapp",
            "count": 0
        },
        {
            "at": 840,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_whatsapp",
            "title": "Emma",
            "body": "Thanks for adding me! 🙏",
            "mode": "headsup"
        }
    ]
}
````

## File: packages/episodes/src/examples/notification-call-demo.json
````json
{
    "name": "Notification & Call Demo",
    "description": "Comprehensive test of lockscreen, notifications, and call features",
    "initialWorld": {
        "devices": {
            "user_phone": {
                "id": "user_phone",
                "profileId": "iphone16",
                "isLocked": true,
                "notifications": []
            }
        },
        "conversations": {
            "conv_main": {
                "id": "conv_main",
                "messages": [],
                "typing": {}
            }
        },
        "appState": {},
        "camera": {
            "type": "APP_VIEW"
        }
    },
    "events": [
        {
            "at": 0,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_whatsapp",
            "title": "Sarah",
            "body": "Hey! Are you free tonight?",
            "mode": "lockscreen"
        },
        {
            "at": 45,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_instagram",
            "title": "mike_photos",
            "body": "Liked your photo ❤️",
            "mode": "lockscreen"
        },
        {
            "at": 90,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "UNLOCK"
        },
        {
            "at": 105,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "OPEN_APP",
            "appId": "app_whatsapp"
        },
        {
            "at": 120,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_main",
            "from": "other",
            "text": "Are you there?"
        },
        {
            "at": 150,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_instagram",
            "title": "Instagram",
            "body": "3 people liked your story",
            "mode": "headsup"
        },
        {
            "at": 210,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "INCOMING_CALL",
            "callerId": "sarah_id",
            "callerName": "Sarah",
            "callerAvatar": "https://i.pravatar.cc/300?u=sarah",
            "isVideo": false
        },
        {
            "at": 270,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "CALL_ANSWERED"
        },
        {
            "at": 390,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "CALL_ENDED"
        },
        {
            "at": 420,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "SHOW_NOTIFICATION",
            "appId": "app_whatsapp",
            "title": "Sarah",
            "body": "That was a great call! Talk later 👋",
            "mode": "headsup"
        },
        {
            "at": 510,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "INCOMING_CALL",
            "callerId": "mike_id",
            "callerName": "Mike",
            "isVideo": true
        },
        {
            "at": 570,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "CALL_ANSWERED"
        },
        {
            "at": 660,
            "kind": "DEVICE",
            "deviceId": "user_phone",
            "type": "CALL_ENDED"
        }
    ]
}
````

## File: packages/episodes/src/examples/whatsapp-psychotic-demo.json
````json
{
    "meta": {
        "title": "WhatsApp Features Demo",
        "fps": 30,
        "durationInFrames": 600
    },
    "initialWorld": {
        "devices": {
            "main_phone": {
                "id": "main_phone",
                "profileId": "iphone16",
                "isLocked": false,
                "foregroundAppId": "app_whatsapp",
                "notifications": []
            }
        },
        "conversations": {
            "conv_psycho": {
                "id": "conv_psycho",
                "type": "dm",
                "name": "Toxic Ex 🚩",
                "avatar": "",
                "messages": [
                    {
                        "id": "m1",
                        "from": "Toxic Ex 🚩",
                        "text": "",
                        "type": "call_missed",
                        "status": "read"
                    },
                    {
                        "id": "m2",
                        "from": "Toxic Ex 🚩",
                        "text": "",
                        "type": "deleted",
                        "status": "read"
                    }
                ],
                "typing": {}
            }
        },
        "appState": {
            "activeApp": "whatsapp",
            "whatsapp": {
                "screen": "chat",
                "conversationId": "conv_psycho"
            }
        },
        "camera": {
            "baseView": "APP_VIEW",
            "activeEffects": [],
            "transform": {
                "translateX": 0,
                "translateY": 0,
                "scale": 1,
                "rotation": 0,
                "originX": 0.5,
                "originY": 0.5,
                "shakeX": 0,
                "shakeY": 0
            }
        }
    },
    "events": [
        {
            "at": 60,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_psycho",
            "from": "Toxic Ex 🚩",
            "message": {
                "id": "m3",
                "type": "voice",
                "duration": 45,
                "status": "read"
            }
        },
        {
            "at": 120,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_psycho",
            "from": "Toxic Ex 🚩",
            "text": "Took a screenshot!",
            "message": {
                "id": "m4",
                "type": "screenshot_alert",
                "text": "Took a screenshot!",
                "status": "read"
            }
        },
        {
            "at": 180,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_SENT",
            "conversationId": "conv_psycho",
            "from": "me",
            "text": "Why are you doing this?",
            "message": {
                "id": "m5",
                "type": "text",
                "text": "Why are you doing this?",
                "status": "sent",
                "edited": true
            }
        }
    ]
}
````

## File: packages/renderer/src/layout/strategies/lockscreen.ts
````typescript
import { LayoutContext, LockscreenLayoutState, NotificationLayout } from "../types";

export function computeLockscreenLayout(ctx: LayoutContext): LockscreenLayoutState {
    const { world, t, activeDeviceId, config } = ctx;
    const lockConfig = config!.lockscreen!;

    const device = world.devices[activeDeviceId];
    const notifications = device?.notifications || [];

    const notificationLayouts: NotificationLayout[] = [];
    let currentY = lockConfig.topPadding;

    // Layout notifications
    // Show only the last N notifications
    const visibleNotifications = notifications.slice(-lockConfig.stackMaxNotifications);

    for (const notification of visibleNotifications) {
        // Calculate height
        // Heuristic: base height + text length
        const textLength = (notification.title?.length || 0) + (notification.body?.length || 0);
        const lines = Math.ceil(Math.max(1, textLength) / lockConfig.charsPerLine);
        const height = lockConfig.baseNotificationHeight + (lines * lockConfig.lineHeight);

        // Animation: Slide in
        const appearAt = notification.at || 0;
        const timeSinceAppear = t - appearAt;

        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear < lockConfig.appearDuration) {
            const progress = Math.max(0, timeSinceAppear / lockConfig.appearDuration);
            // Cubic bezier approximation for ease-out
            const ease = 1 - Math.pow(1 - progress, 3);

            opacity = ease;
            // Slide down from -50px
            translateY = -50 * (1 - ease);
        }

        notificationLayouts.push({
            id: notification.id,
            y: currentY,
            height,
            opacity,
            translateY
        });

        currentY += height + lockConfig.notificationGap;
    }

    return {
        kind: "LOCKSCREEN",
        notificationLayouts,
        meta: {}
    };
}
````

## File: packages/renderer/src/layout/director-adapter.ts
````typescript
/**
 * Director Layout Adapter
 *
 * Creates DirectorLayoutModel from computed chat layout.
 * This is the ONLY place layout rects are extracted for the director.
 * 
 * IMPORTANT: All rects must be in CONTENT-SPACE (not screen-space).
 * Content-space means y=0 is top of scrollable content, not top of viewport.
 */

import { DirectorLayoutModel, LayoutRect, LAYOUT } from "@tokovo/core";
import { ChatLayoutState } from "./types";

/**
 * Create DirectorLayoutModel from computed chat layout.
 * Both UI and Director use the same source (chat strategy computed rects).
 * 
 * @param chatLayout - Computed chat layout with scrollY and messageLayouts
 * @param deviceId - Device ID for scoping
 * @param appId - App ID for scoping
 * @param conversationId - Conversation ID for scoping
 * @param viewportWidth - Device viewport width (no hardcodes)
 * @param viewportHeight - Effective viewport height (content area)
 */
export function createDirectorLayoutModel(
    chatLayout: ChatLayoutState,
    deviceId: string,
    appId: string,
    conversationId: string,
    viewportWidth: number,
    viewportHeight: number
): DirectorLayoutModel {
    const messageRects: Record<string, LayoutRect> = {};

    for (const [id, layout] of Object.entries(chatLayout.messageLayouts)) {
        if (layout.rect) {
            messageRects[id] = layout.rect;
        }
    }

    // Input area rect in CONTENT-SPACE
    // The input bar is always visible at the bottom of the viewport.
    // In content-space, this means: scrollY + (viewportHeight - inputHeight)
    const inputHeight = LAYOUT.CHAT_INPUT_HEIGHT;
    const inputAreaRect: LayoutRect = {
        x: 0,
        y: chatLayout.scrollY + viewportHeight,  // Bottom of visible content area
        width: viewportWidth,
        height: inputHeight,
    };

    // Last message rect
    const lastMessageId = chatLayout.meta?.lastMessageId;
    const lastMessageRect = lastMessageId
        ? messageRects[lastMessageId]
        : undefined;

    return {
        deviceId,
        appId,
        conversationId,
        messageRects,
        inputAreaRect,
        typingIndicatorRect: chatLayout.typingLayout?.rect,
        lastMessageRect,
    };
}
````

## File: packages/renderer/src/layout/index.ts
````typescript
import { LayoutContext, LayoutState } from "./types";
import { defaultLayoutConfig } from "./config";
import { computeChatLayout } from "./strategies/chat";
import { computeFeedLayout } from "./strategies/feed";
import { computeStoryLayout } from "./strategies/story";
import { computeLockscreenLayout } from "./strategies/lockscreen";
import { computeTransitionLayout } from "./strategies/transition";

export * from "./types";
export * from "./config";

export function computeLayout(ctx: LayoutContext): LayoutState {
    // Deep merge provided config with defaults
    const config = {
        ...defaultLayoutConfig,
        ...ctx.config,
        chat: { ...defaultLayoutConfig.chat, ...ctx.config?.chat },
        feed: { ...defaultLayoutConfig.feed, ...ctx.config?.feed },
        story: { ...defaultLayoutConfig.story, ...ctx.config?.story },
        lockscreen: { ...defaultLayoutConfig.lockscreen, ...ctx.config?.lockscreen },
        transition: { ...defaultLayoutConfig.transition, ...ctx.config?.transition },
    };
    const fullCtx = { ...ctx, config };

    switch (ctx.viewKind) {
        case "CHAT":
            return computeChatLayout(fullCtx);
        case "FEED":
            return computeFeedLayout(fullCtx);
        case "STORY":
            return computeStoryLayout(fullCtx);
        case "LOCKSCREEN":
            return computeLockscreenLayout(fullCtx);
        case "TRANSITION":
            return computeTransitionLayout(fullCtx);
        default:
            // Fallback to empty transition state
            return {
                kind: "TRANSITION",
                deviceTranslateX: 0,
                deviceTranslateY: 0,
                deviceScale: 1,
                deviceRotation: 0,
                overlayOpacity: 0,
                meta: {}
            };
    }
}
````

## File: packages/renderer/src/CallOverlay.tsx
````typescript
import React from "react";
import { CallState } from "@tokovo/core";

// ============================================================================
// CALL CONTROL ICONS (SVG)
// ============================================================================

const MuteIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M1 14.75a6.75 6.75 0 0 1 6.75-6.75h8.5A6.75 6.75 0 0 1 23 14.75v6.5a.75.75 0 0 1-.75.75h-8.5v-3.5a1.75 1.75 0 0 0-3.5 0v3.5h-8.5a.75.75 0 0 1-.75-.75v-6.5zM12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    </svg>
);

const SpeakerIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2" fill="none" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="2" fill="none" />
    </svg>
);

const KeypadIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <circle cx="6" cy="6" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="12" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
    </svg>
);

const VideoIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M23 7l-7 5 7 5V7zM16 5H2a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" />
    </svg>
);

const AddCallIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
);

// ============================================================================
// CONTROL BUTTON COMPONENT
// ============================================================================

interface ControlButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    size?: "small" | "large";
    variant?: "default" | "destructive";
}

const ControlButton: React.FC<ControlButtonProps> = ({
    icon,
    label,
    isActive = false,
    size = "small",
    variant = "default"
}) => {
    const buttonSize = size === "large" ? 210 : 150;

    let bgColor = "rgba(255, 255, 255, 0.2)";
    if (isActive) bgColor = "white";
    if (variant === "destructive") bgColor = "#FF3B30";

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18
        }}>
            <div style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: "50%",
                backgroundColor: bgColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{ color: isActive ? "#000" : "#fff" }}>
                    {icon}
                </div>
            </div>
            <span style={{
                fontSize: 33,
                color: "white",
                opacity: 0.9
            }}>
                {label}
            </span>
        </div>
    );
};

// ============================================================================
// CALL TIMER
// ============================================================================

const CallTimer: React.FC<{ startedAt: number; currentTime: number; fps?: number }> = ({
    startedAt,
    currentTime,
    fps = 30
}) => {
    const elapsedFrames = currentTime - startedAt;
    const elapsedSeconds = Math.floor(elapsedFrames / fps);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
    );
};

// ============================================================================
// CALL OVERLAY COMPONENT
// ============================================================================

interface CallOverlayProps {
    call: CallState;
    currentTime: number;
    variant?: "ios" | "android";
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
    call,
    currentTime,
    variant = "ios"
}) => {
    if (call.status === "ended") return null;

    const isIncoming = call.status === "incoming";
    const isActive = call.status === "active";

    // Pulse animation for incoming call avatar
    const pulsePhase = Math.sin((currentTime * 0.1) % (Math.PI * 2));
    const avatarScale = isIncoming ? 1 + (pulsePhase * 0.03) : 1;

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: call.isVideo
                ? "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)"
                : "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "180px 45px 120px",
            zIndex: 500,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        }}>
            {/* Top Section: Avatar & Name */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 30
            }}>
                {/* Avatar */}
                <div style={{
                    width: isActive ? 270 : 360,
                    height: isActive ? 270 : 360,
                    borderRadius: "50%",
                    backgroundColor: "#8E8E93",
                    backgroundImage: call.callerAvatar
                        ? `url(${call.callerAvatar})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isActive ? 90 : 120,
                    color: "white",
                    fontWeight: "300",
                    transform: `scale(${avatarScale})`,
                    boxShadow: isIncoming ? "0 0 60px rgba(50, 215, 75, 0.3)" : "none"
                }}>
                    {!call.callerAvatar && call.callerName.charAt(0).toUpperCase()}
                </div>

                {/* Caller Name */}
                <div style={{
                    fontSize: isActive ? 60 : 78,
                    fontWeight: "300",
                    color: "white",
                    textAlign: "center"
                }}>
                    {call.callerName}
                </div>

                {/* Call Status */}
                <div style={{
                    fontSize: 42,
                    color: "rgba(255, 255, 255, 0.6)"
                }}>
                    {isIncoming && (call.isVideo ? "FaceTime Video..." : "Incoming call...")}
                    {isActive && call.startedAt && (
                        <CallTimer startedAt={call.startedAt} currentTime={currentTime} />
                    )}
                </div>
            </div>

            {/* Bottom Section: Controls */}
            {isIncoming ? (
                // Incoming Call: Accept/Decline
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 180,
                    width: "100%"
                }}>
                    <ControlButton
                        icon={<PhoneIcon />}
                        label="Decline"
                        variant="destructive"
                        size="large"
                    />
                    <ControlButton
                        icon={call.isVideo ? <VideoIcon /> : <PhoneIcon />}
                        label="Accept"
                        size="large"
                    />
                </div>
            ) : (
                // Active Call: Control Grid + End Button
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 60,
                    width: "100%"
                }}>
                    {/* Control Grid (2 rows x 3 columns) */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "45px 60px",
                        width: "100%",
                        maxWidth: 600,
                        justifyItems: "center"
                    }}>
                        <ControlButton icon={<MuteIcon />} label="mute" />
                        <ControlButton icon={<KeypadIcon />} label="keypad" />
                        <ControlButton icon={<SpeakerIcon />} label="speaker" />
                        <ControlButton icon={<AddCallIcon />} label="add call" />
                        <ControlButton icon={<VideoIcon />} label="FaceTime" />
                        <div style={{ width: 150 }} /> {/* Spacer */}
                    </div>

                    {/* End Call Button */}
                    <ControlButton
                        icon={<PhoneIcon />}
                        label="End"
                        variant="destructive"
                        size="large"
                    />
                </div>
            )}
        </div>
    );
};
````

## File: packages/renderer/src/HomeScreenView.tsx
````typescript
import React from "react";
import { HomeScreenConfig, AppIcon, AppFolder, Platform, getAppConfig } from "@tokovo/core";

// ============================================================================
// APP ICON COMPONENT
// ============================================================================

// ============================================================================
// APP ICON COMPONENT
// ============================================================================

interface AppIconItemProps {
    app: AppIcon;
    size?: number;
    styleConfig: any; // Using any to avoid complex type drilling for now
}

const AppIconItem: React.FC<AppIconItemProps> = ({ app, size, styleConfig }) => {
    const iconSize = size || styleConfig.iconSize;
    // Android icons are often circular or different shape; iOS are rounded rects
    const isEmoji = /^\p{Emoji}/u.test(app.icon);

    // Scale radius if size is overridden (e.g. in dock)
    const scale = iconSize / styleConfig.iconSize;
    const radius = styleConfig.iconRadius * scale;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: iconSize,
            gap: styleConfig.iconLabelGap
        }}>
            {/* Icon */}
            <div style={{
                width: iconSize,
                height: iconSize,
                borderRadius: radius,
                position: "relative",
                backgroundColor: isEmoji ? "rgba(255,255,255,0.15)" : "#333",
                backgroundImage: !isEmoji ? `url(${app.icon})` : undefined,
                backgroundSize: "cover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {isEmoji && (
                    <span style={{ fontSize: iconSize * 0.5 }}>{app.icon}</span>
                )}

                {/* Badge - Keeping hardcoded red for now as it's standard notification color */}
                {app.badge && app.badge > 0 && (
                    <div style={{
                        position: "absolute",
                        top: -12 * scale,
                        right: -12 * scale,
                        minWidth: 54 * scale,
                        height: 54 * scale,
                        borderRadius: 27 * scale,
                        backgroundColor: "#FF3B30",
                        color: "white",
                        fontSize: 33 * scale,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: `0 ${15 * scale}px`,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {app.badge > 99 ? "99+" : app.badge}
                    </div>
                )}
            </div>

            {/* Label */}
            <span style={{
                fontSize: styleConfig.iconLabelSize,
                color: styleConfig.iconLabelColor,
                textAlign: "center",
                maxWidth: iconSize + 20,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)"
            }}>
                {app.label}
            </span>
        </div>
    );
};

// ============================================================================
// FOLDER COMPONENT
// ============================================================================

interface FolderItemProps {
    folder: AppFolder;
    size?: number;
    styleConfig: any;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, size, styleConfig }) => {
    const iconSize = size || styleConfig.iconSize;
    const miniSize = (iconSize - 30) / 3; // Approx calculation for 3x3 grid
    const scale = iconSize / styleConfig.iconSize;
    const radius = styleConfig.iconRadius * scale;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: iconSize,
            gap: styleConfig.iconLabelGap
        }}>
            {/* Folder icon with mini app previews */}
            <div style={{
                width: iconSize,
                height: iconSize,
                borderRadius: radius,
                backgroundColor: styleConfig.folderBackdrop,
                backdropFilter: `blur(${styleConfig.folderBlur})`,
                display: "grid",
                gridTemplateColumns: `repeat(3, ${miniSize}px)`,
                gridTemplateRows: `repeat(3, ${miniSize}px)`,
                gap: styleConfig.folderPreviewGap * scale,
                padding: 15 * scale,
                justifyContent: "center",
                alignContent: "center"
            }}>
                {folder.apps.slice(0, 9).map((app, i) => (
                    <div key={i} style={{
                        width: miniSize,
                        height: miniSize,
                        borderRadius: miniSize * styleConfig.folderMiniIconRadius,
                        backgroundColor: "rgba(255,255,255,0.3)",
                        backgroundImage: !/^\p{Emoji}/u.test(app.icon) ? `url(${app.icon})` : undefined,
                        backgroundSize: "cover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: miniSize * 0.6
                    }}>
                        {/^\p{Emoji}/u.test(app.icon) && app.icon}
                    </div>
                ))}
            </div>

            {/* Label */}
            <span style={{
                fontSize: styleConfig.iconLabelSize,
                color: styleConfig.iconLabelColor,
                textAlign: "center",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)"
            }}>
                {folder.name}
            </span>
        </div>
    );
};

// ============================================================================
// DOCK COMPONENT
// ============================================================================

interface DockProps {
    apps: AppIcon[];
    styleConfig: any;
}

const Dock: React.FC<DockProps> = ({ apps, styleConfig }) => (
    <div style={{
        position: "absolute",
        bottom: styleConfig.dockBottom,
        left: "50%",
        transform: "translateX(-50%)",
        width: styleConfig.dockWidth,
        height: styleConfig.dockHeight,
        borderRadius: styleConfig.dockRadius,
        backgroundColor: styleConfig.dockBackdrop,
        backdropFilter: `blur(${styleConfig.dockBlur})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 30px"
    }}>
        {apps.slice(0, 4).map((app, i) => (
            <AppIconItem key={i} app={app} size={styleConfig.dockIconSize} styleConfig={styleConfig} />
        ))}
    </div>
);

// ============================================================================
// PAGE DOTS
// ============================================================================

interface PageDotsProps {
    count: number;
    activeIndex: number;
    styleConfig: any;
}

const PageDots: React.FC<PageDotsProps> = ({ count, activeIndex, styleConfig }) => (
    <div style={{
        display: "flex",
        gap: styleConfig.dotGap,
        marginBottom: styleConfig.dotMarginBottom
    }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
                width: styleConfig.dotSize,
                height: styleConfig.dotSize,
                borderRadius: "50%",
                backgroundColor: i === activeIndex ? styleConfig.dotActiveColor : styleConfig.dotInactiveColor,
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
            }} />
        ))}
    </div>
);

// ============================================================================
// HOME SCREEN VIEW
// ============================================================================

interface HomeScreenViewProps {
    config: HomeScreenConfig;
    variant?: "ios" | "android";
    activePage?: number;
    platform?: Platform; // Add platform prop to match other views
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
    config,
    variant = "ios",
    activePage = 0,
    platform
}) => {
    // Use platform prop if provided, otherwise fallback to variant
    const effectivePlatform = (platform || variant) as Platform;
    const styleConfig = getAppConfig("homescreen", effectivePlatform) as any;

    const currentPage = config.pages[activePage] || config.pages[0];
    const wallpaper = config.wallpaper || "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: wallpaper.startsWith("http") ? `url(${wallpaper}) center/cover` : wallpaper,
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* App Grid */}
            <div style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: `repeat(${styleConfig.gridColumns}, 1fr)`,
                gridTemplateRows: `repeat(${styleConfig.gridRows}, auto)`,
                gap: `${styleConfig.gridGapRow}px ${styleConfig.gridGapCol}px`,
                padding: `${styleConfig.gridPaddingTop}px ${styleConfig.gridPaddingHorizontal}px 0`,
                justifyItems: "center",
                overflow: "hidden"
            }}>
                {currentPage?.apps.map((item, i) => (
                    'type' in item && item.type === "folder"
                        ? <FolderItem key={i} folder={item} styleConfig={styleConfig} />
                        : <AppIconItem key={i} app={item as AppIcon} styleConfig={styleConfig} />
                ))}
            </div>

            {/* Page Dots */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 12
            }}>
                <PageDots count={config.pages.length} activeIndex={activePage} styleConfig={styleConfig} />
            </div>

            {/* Dock */}
            <Dock apps={config.dock} styleConfig={styleConfig} />

            {/* Home Indicator - Visible on iOS */}
            {effectivePlatform === "ios" && (
                <div style={{
                    position: "absolute",
                    bottom: 24,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 405,
                    height: 15,
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    borderRadius: 15
                }} />
            )}
        </div>
    );
};
````

## File: packages/renderer/src/LockscreenView.tsx
````typescript
import React from "react";
import { Notification } from "@tokovo/core";
import { LayoutState, LockscreenLayoutState } from "@tokovo/core";

/**
 * iOS 17/18 Lockscreen View
 * - Ultra-thin clock (font-weight: 100)
 * - Single-line date
 * - Notifications stacked at bottom
 * - App logo icons in notifications
 */

// App icons as actual images/gradients
const APP_LOGOS: Record<string, React.ReactNode> = {
    app_whatsapp: (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "#25D366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            </svg>
        </div>
    ),
    app_instagram: (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="18" cy="6" r="1.5" fill="white" />
            </svg>
        </div>
    ),
    app_messages: (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "#34C759",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        </div>
    )
};

interface LockscreenViewProps {
    notifications?: Notification[];
    layout?: LayoutState;
    variant?: "ios" | "android";
    time?: string;
    date?: string;
}

export const LockscreenView: React.FC<LockscreenViewProps> = ({
    notifications = [],
    layout,
    variant = "ios",
    time = "9:41",
    date
}) => {
    const isAndroid = variant === "android";
    const lockscreenLayout = layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;
    const displayDate = date || formatDate();

    const activeNotifications = notifications.filter(n => {
        if (n.dismissedAt !== undefined) return false;
        const mode = n.mode || "both";
        return mode === "lockscreen" || mode === "both";
    });

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(180deg, #000000 0%, #1C1C1E 100%)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            color: "white"
        }}>
            {/* Time Display - iOS 17 style ultra-thin */}
            <div style={{
                marginTop: 300,
                textAlign: "center"
            }}>
                <div style={{
                    fontSize: 300,
                    fontWeight: 100,  // Ultra-thin
                    letterSpacing: -12,
                    lineHeight: 0.9,
                    fontVariantNumeric: "tabular-nums"
                }}>
                    {time}
                </div>
                <div style={{
                    marginTop: 12,
                    fontSize: 54,
                    fontWeight: 500,
                    opacity: 0.9,
                    letterSpacing: 0
                }}>
                    {displayDate}
                </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* iOS 16+ Notifications - Bottom Stack */}
            {activeNotifications.length > 0 && (
                <div style={{
                    paddingBottom: 270,
                    paddingLeft: 48,
                    paddingRight: 48
                }}>
                    {activeNotifications.slice(-3).reverse().map((notification, index) => {
                        const nl = lockscreenLayout?.notificationLayouts.find(l => l.id === notification.id);
                        const opacity = nl?.opacity ?? 1;
                        const translateY = nl?.translateY ?? 0;
                        const stackOffset = index * 15;
                        const stackScale = 1 - (index * 0.02);

                        return (
                            <div
                                key={notification.id}
                                style={{
                                    marginBottom: index === 0 ? 0 : -120,
                                    opacity: opacity * (1 - index * 0.2),
                                    transform: `translateY(${translateY + stackOffset}px) scale(${stackScale})`,
                                    transformOrigin: "bottom center",
                                    zIndex: 10 - index
                                }}
                            >
                                <NotificationCard notification={notification} variant={variant} />
                            </div>
                        );
                    })}

                    {activeNotifications.length > 3 && (
                        <div style={{
                            textAlign: "center",
                            marginTop: 30,
                            fontSize: 36,
                            opacity: 0.5
                        }}>
                            +{activeNotifications.length - 3} more
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Buttons */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 270,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 60px"
            }}>
                {!isAndroid && (
                    <>
                        <LockscreenButton icon="flashlight" />
                        <LockscreenButton icon="camera" />
                    </>
                )}
            </div>

            {/* Home Indicator */}
            <div style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 405,
                height: 15,
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 15
            }} />
        </div>
    );
};

/**
 * Lockscreen control button
 */
const LockscreenButton: React.FC<{ icon: "flashlight" | "camera" }> = ({ icon }) => (
    <div style={{
        width: 150,
        height: 150,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        {icon === "flashlight" ? (
            <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
                <path d="M9 2h6v6l2 2v12H7V10l2-2V2zm2 2v4h2V4h-2zm-1 7.5v8h4v-8l-2-2-2 2z" />
            </svg>
        ) : (
            <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
        )}
    </div>
);

/**
 * Notification Card with app icon
 */
const NotificationCard: React.FC<{
    notification: Notification;
    variant?: "ios" | "android";
}> = ({ notification, variant = "ios" }) => {
    const appLogo = APP_LOGOS[notification.appId] || (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "#8E8E93",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            color: "white"
        }}>📱</div>
    );

    const appNames: Record<string, string> = {
        app_whatsapp: "WHATSAPP",
        app_instagram: "INSTAGRAM",
        app_messages: "MESSAGES"
    };
    const appName = appNames[notification.appId] || "APP";

    return (
        <div style={{
            backgroundColor: "rgba(40, 40, 40, 0.8)",
            backdropFilter: "blur(60px)",
            WebkitBackdropFilter: "blur(60px)",
            borderRadius: 54,
            padding: "36px 42px",
            color: "white"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginBottom: 15
            }}>
                {appLogo}
                <span style={{
                    fontSize: 30,
                    opacity: 0.6,
                    fontWeight: 600,
                    letterSpacing: 1.5
                }}>
                    {appName}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 27, opacity: 0.4 }}>
                    now
                </span>
            </div>

            {/* Content */}
            <div style={{ fontSize: 45, fontWeight: 600, marginBottom: 9 }}>
                {notification.title}
            </div>
            <div style={{ fontSize: 42, opacity: 0.9, lineHeight: 1.35 }}>
                {notification.body}
            </div>
        </div>
    );
};

/**
 * Format date
 */
function formatDate(): string {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}
````

## File: repomix.config.json
````json
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
      "*.md",
      "*.mp3"
    ]
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
````

## File: apps/video-runner/package.json
````json
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
````

## File: packages/apps-instagram/src/views/profile/ProfileView.tsx
````typescript
import React from "react";
import { InstagramState } from "../../types";
import { LayoutState, FeedLayoutState } from "@tokovo/core";

// ============================================================================
// ICONS
// ============================================================================

const GridIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "white" : "#A8A8A8"} strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const ReelsIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#A8A8A8"} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <polygon points="10,8 16,12 10,16" />
    </svg>
);

const TaggedIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#A8A8A8"} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const AddIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="42" height="42" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================================
// STAT ITEM
// ============================================================================

const StatItem: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        }}>
            {value}
        </div>
        <div style={{ fontSize: 36, opacity: 0.9 }}>{label}</div>
    </div>
);

// ============================================================================
// HIGHLIGHT BUBBLE
// ============================================================================

const HighlightBubble: React.FC<{ title: string; imageUrl?: string; isNew?: boolean }> = ({ title, imageUrl, isNew }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 36,
        width: 192
    }}>
        <div style={{
            width: 192,
            height: 192,
            borderRadius: "50%",
            border: isNew ? "none" : "3px solid #444",
            backgroundColor: "#1a1a1a",
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: "cover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            {isNew && (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            )}
        </div>
        <div style={{
            marginTop: 15,
            fontSize: 30,
            textAlign: "center",
            maxWidth: 192,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
        }}>
            {title}
        </div>
    </div>
);

// ============================================================================
// PROFILE VIEW - Main export
// ============================================================================

export const ProfileView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    // Mock user data
    const user = {
        username: "instagram_user",
        name: "Instagram User",
        bio: "Digital Creator 📸\nLiving the dream ✨\n📍 New York",
        posts: 42,
        followers: "1.2M",
        following: 250,
        avatar: "https://i.pravatar.cc/300?u=profile"
    };

    const highlights = [
        { title: "New", isNew: true },
        { title: "Travel ✈️", imageUrl: "https://picsum.photos/seed/h1/200" },
        { title: "Food 🍕", imageUrl: "https://picsum.photos/seed/h2/200" },
        { title: "Pets 🐕", imageUrl: "https://picsum.photos/seed/h3/200" },
    ];

    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            {/* Scrollable Content */}
            <div style={{
                transform: `translateY(-${scrollY}px)`,
                width: "100%"
            }}>
                {/* Header */}
                <div style={{
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 36px",
                    marginTop: 120
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 54, fontWeight: 700 }}>{user.username}</span>
                        <ChevronDownIcon />
                    </div>
                    <div style={{ display: "flex", gap: 48 }}>
                        <AddIcon />
                        <SettingsIcon />
                    </div>
                </div>

                {/* Profile Info Section */}
                <div style={{ padding: "24px 36px" }}>
                    {/* Avatar + Stats Row */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
                        {/* Avatar */}
                        <div style={{
                            width: 240,
                            height: 240,
                            borderRadius: "50%",
                            backgroundImage: `url(${user.avatar})`,
                            backgroundSize: "cover",
                            backgroundColor: "#333",
                            marginRight: 60
                        }} />

                        {/* Stats */}
                        <div style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "space-around"
                        }}>
                            <StatItem value={user.posts} label="Posts" />
                            <StatItem value={user.followers} label="Followers" />
                            <StatItem value={user.following} label="Following" />
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <div style={{ marginBottom: 27 }}>
                        <div style={{ fontSize: 39, fontWeight: 600, marginBottom: 6 }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: 39, whiteSpace: "pre-wrap", lineHeight: 1.35, opacity: 0.95 }}>
                            {user.bio}
                        </div>
                    </div>

                    {/* Edit & Share Buttons */}
                    <div style={{ display: "flex", gap: 24, marginBottom: 30 }}>
                        <div style={{
                            flex: 1,
                            height: 102,
                            backgroundColor: "#262626",
                            borderRadius: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 39,
                            fontWeight: 600
                        }}>
                            Edit profile
                        </div>
                        <div style={{
                            flex: 1,
                            height: 102,
                            backgroundColor: "#262626",
                            borderRadius: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 39,
                            fontWeight: 600
                        }}>
                            Share profile
                        </div>
                    </div>
                </div>

                {/* Highlights Row */}
                <div style={{
                    display: "flex",
                    padding: "12px 36px 30px",
                    overflowX: "hidden"
                }}>
                    {highlights.map((h, i) => (
                        <HighlightBubble key={i} {...h} />
                    ))}
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    borderTop: "1px solid #262626",
                    borderBottom: "1px solid #262626"
                }}>
                    <div style={{
                        flex: 1,
                        height: 132,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "3px solid white"
                    }}>
                        <GridIcon active={true} />
                    </div>
                    <div style={{
                        flex: 1,
                        height: 132,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <ReelsIcon active={false} />
                    </div>
                    <div style={{
                        flex: 1,
                        height: 132,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <TaggedIcon active={false} />
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {state.feed.posts.map(post => (
                        <div key={post.id} style={{
                            width: "calc(33.33% - 2px)",
                            aspectRatio: "1/1",
                            backgroundColor: "#1a1a1a",
                            backgroundImage: `url(${post.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/views/reels/ReelsView.tsx
````typescript
import React from "react";
import { InstagramState } from "../../types";

// ============================================================================
// REELS ICONS - Authentic Instagram style
// ============================================================================

const CameraIcon = () => (
    <svg width="66" height="66" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8" />
        <polygon points="10,8 17,12 10,16" fill="white" />
    </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="84" height="84" viewBox="0 0 24 24">
        <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill={filled ? "#FF3040" : "none"}
            stroke={filled ? "#FF3040" : "white"}
            strokeWidth="1.8"
        />
    </svg>
);

const CommentIcon = () => (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="1.8" />
    </svg>
);

const ShareIcon = () => (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MoreIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

const BookmarkIcon = () => (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

// ============================================================================
// AUDIO BAR - Scrolling song at bottom
// ============================================================================

const AudioBar: React.FC<{ song: string; artist: string }> = ({ song, artist }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        paddingRight: 30
    }}>
        {/* Music note icon */}
        <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="white" />
            <circle cx="18" cy="16" r="3" fill="white" />
        </svg>
        {/* Song text */}
        <div style={{
            fontSize: 36,
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: 600
        }}>
            {artist} · {song}
        </div>
    </div>
);

// ============================================================================
// ROTATING ALBUM COVER
// ============================================================================

const AlbumCover: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => (
    <div style={{
        width: 108,
        height: 108,
        borderRadius: 18,
        border: "3px solid rgba(255,255,255,0.6)",
        backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : "linear-gradient(135deg, #405DE6 0%, #833AB4 50%, #C13584 100%)",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        {!imageUrl && (
            <div style={{
                width: 45,
                height: 45,
                borderRadius: "50%",
                backgroundColor: "white",
                border: "3px solid #333"
            }} />
        )}
    </div>
);

// ============================================================================
// SIDE ACTION BUTTON
// ============================================================================

const SideAction: React.FC<{ icon: React.ReactNode; count?: string }> = ({ icon, count }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 9
    }}>
        {icon}
        {count && (
            <span style={{ fontSize: 30, fontWeight: 500 }}>{count}</span>
        )}
    </div>
);

// ============================================================================
// REELS VIEW - Main export
// ============================================================================

export const ReelsView: React.FC<{ state: InstagramState }> = ({ state }) => {
    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            position: "relative",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* Video Background */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(https://picsum.photos/seed/reel1/1080/1920)`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }} />

            {/* Gradient Overlay */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                pointerEvents: "none"
            }} />

            {/* Header */}
            <div style={{
                position: "absolute",
                top: 150,
                left: 36,
                right: 36,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10
            }}>
                <div style={{
                    fontSize: 54,
                    fontWeight: 700,
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}>
                    Reels
                </div>
                <CameraIcon />
            </div>

            {/* Right Side Actions */}
            <div style={{
                position: "absolute",
                bottom: 420,
                right: 30,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 48,
                zIndex: 10
            }}>
                <SideAction icon={<HeartIcon />} count="123K" />
                <SideAction icon={<CommentIcon />} count="1.2K" />
                <SideAction icon={<ShareIcon />} />
                <SideAction icon={<BookmarkIcon />} />
                <SideAction icon={<MoreIcon />} />
                <AlbumCover />
            </div>

            {/* Bottom Info Section */}
            <div style={{
                position: "absolute",
                bottom: 300,
                left: 36,
                right: 180, // Space for side actions
                zIndex: 10
            }}>
                {/* User Info */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    marginBottom: 21
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        border: "3px solid white",
                        backgroundImage: `url(https://i.pravatar.cc/150?u=reel)`,
                        backgroundSize: "cover"
                    }} />
                    {/* Username */}
                    <span style={{
                        fontSize: 42,
                        fontWeight: 600,
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                    }}>
                        reels_creator
                    </span>
                    {/* Follow Button */}
                    <div style={{
                        border: "2px solid white",
                        borderRadius: 12,
                        padding: "12px 30px",
                        fontSize: 36,
                        fontWeight: 600
                    }}>
                        Follow
                    </div>
                </div>

                {/* Caption */}
                <div style={{
                    fontSize: 39,
                    marginBottom: 21,
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                    lineHeight: 1.3
                }}>
                    Wait for the drop! 🎵🔥 #dance #viral #trending
                </div>

                {/* Audio Bar */}
                <AudioBar song="Original Audio" artist="reels_creator" />
            </div>
        </div>
    );
};
````

## File: packages/devices/src/iphone16/Frame.tsx
````typescript
import React from "react";
import { iPhone16Profile } from "./profile";

export const iPhone16Frame: React.FC<{ children: React.ReactNode; statusBar?: React.ReactNode }> = ({ children, statusBar }) => {
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
            {/* Dynamic Island Area */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 150, // Enough space for status bar
                zIndex: 1000,
                pointerEvents: "none",
                display: "flex",
                justifyContent: "space-between",
                padding: "40px 60px 0 60px"
            }}>
                {/* Status Bar Content (Time, Battery, etc.) */}
                {statusBar}
            </div>

            {/* Dynamic Island Cutout */}
            <div style={{
                position: "absolute",
                top: 33, // 11 * 3
                left: "50%",
                transform: "translateX(-50%)",
                width: 378, // 126 * 3
                height: 111, // 37 * 3
                backgroundColor: "black",
                borderRadius: 60, // 20 * 3
                zIndex: 1001
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
````

## File: packages/devices/src/pixel/Frame.tsx
````typescript
import React from "react";
import { PixelProfile } from "./profile";

export const PixelFrame: React.FC<{ children: React.ReactNode; statusBar?: React.ReactNode }> = ({ children, statusBar }) => {
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
            {/* Status Bar Area */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                zIndex: 1000,
                pointerEvents: "none",
                padding: "30px 40px 0 40px"
            }}>
                {statusBar}
            </div>

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
                zIndex: 1001
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

                {children}
            </div>
        </div>
    );
};
````

## File: packages/devices/src/StatusBar.tsx
````typescript
import React from "react";

/**
 * Authentic iOS Status Bar Component
 * Pixel-perfect SVG icons for signal, WiFi, and battery
 */

// iOS Signal Bars (4 bars, varying heights)
const SignalBarsIcon: React.FC<{ color?: string }> = ({ color = "currentColor" }) => (
    <svg width="51" height="33" viewBox="0 0 17 11" fill={color}>
        <rect x="0" y="8" width="3" height="3" rx="0.5" />
        <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" />
        <rect x="9" y="3" width="3" height="8" rx="0.5" />
        <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
    </svg>
);

// iOS WiFi Icon (3 arcs)
const WifiIcon: React.FC<{ color?: string }> = ({ color = "currentColor" }) => (
    <svg width="48" height="36" viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M1 4C4 1 12 1 15 4" />
        <path d="M3.5 6.5C5.5 4.5 10.5 4.5 12.5 6.5" />
        <path d="M6 9C7 8 9 8 10 9" />
        <circle cx="8" cy="11" r="1" fill={color} stroke="none" />
    </svg>
);

// iOS Battery Icon
const BatteryIcon: React.FC<{ color?: string; percentage?: number }> = ({ color = "currentColor", percentage = 100 }) => (
    <svg width="75" height="36" viewBox="0 0 25 12" fill="none">
        {/* Battery body */}
        <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={color} strokeWidth="1" />
        {/* Battery fill */}
        <rect
            x="2"
            y="2"
            width={Math.max(0, (percentage / 100) * 18)}
            height="8"
            rx="1"
            fill={percentage > 20 ? color : "#FF3B30"}
        />
        {/* Battery cap */}
        <path d="M23 4V8C24 8 25 7 25 6C25 5 24 4 23 4Z" fill={color} opacity="0.4" />
    </svg>
);

interface StatusBarProps {
    time?: string;
    variant?: "ios" | "android";
    theme?: "light" | "dark";
    batteryPercentage?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
    time = "9:41",
    variant = "ios",
    theme = "light",
    batteryPercentage = 100
}) => {
    const isAndroid = variant === "android";
    const textColor = theme === "dark" ? "white" : "black";

    if (isAndroid) {
        return (
            <div style={{
                width: "100%",
                height: 90,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 45px",
                boxSizing: "border-box",
                fontSize: 36,
                fontWeight: "500",
                color: "white",
                position: "absolute",
                top: 15,
                left: 0,
                zIndex: 20,
                fontFamily: "Roboto, sans-serif"
            }}>
                <div>{time}</div>
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <SignalBarsIcon color="white" />
                    <WifiIcon color="white" />
                    <BatteryIcon color="white" percentage={batteryPercentage} />
                </div>
            </div>
        );
    }

    // iOS Status Bar
    return (
        <div style={{
            width: "100%",
            height: 132, // 44pt * 3
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "45px 72px 0 72px",
            boxSizing: "border-box",
            color: textColor,
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 20
        }}>
            {/* Left side - Time */}
            <div style={{
                fontSize: 51,
                fontWeight: "600",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                letterSpacing: 0.5
            }}>
                {time}
            </div>

            {/* Right side - Status icons */}
            <div style={{
                display: "flex",
                gap: 15,
                alignItems: "center",
                marginTop: 6
            }}>
                <SignalBarsIcon color={textColor} />
                <WifiIcon color={textColor} />
                <BatteryIcon color={textColor} percentage={batteryPercentage} />
            </div>
        </div>
    );
};

/**
 * iOS Status Bar specifically styled for dark backgrounds (Instagram, etc.)
 */
export const DarkStatusBar: React.FC<{ time?: string; batteryPercentage?: number }> = ({
    time = "9:41",
    batteryPercentage = 100
}) => (
    <StatusBar time={time} theme="dark" batteryPercentage={batteryPercentage} />
);

/**
 * iOS Status Bar specifically styled for light backgrounds (WhatsApp, etc.)
 */
export const LightStatusBar: React.FC<{ time?: string; batteryPercentage?: number }> = ({
    time = "9:41",
    batteryPercentage = 100
}) => (
    <StatusBar time={time} theme="light" batteryPercentage={batteryPercentage} />
);
````

## File: packages/episodes/src/examples/multi-pov-demo.json
````json
{
    "meta": {
        "title": "Two Sides of the Story - Multi-POV Demo",
        "fps": 30,
        "durationInFrames": 900
    },
    "initialWorld": {
        "devices": {
            "alice_phone": {
                "id": "alice_phone",
                "profileId": "iphone16",
                "ownerName": "Alice",
                "isLocked": false,
                "foregroundAppId": "app_whatsapp",
                "notifications": []
            },
            "bob_phone": {
                "id": "bob_phone",
                "profileId": "iphone16",
                "ownerName": "Bob",
                "isLocked": false,
                "foregroundAppId": "app_whatsapp",
                "notifications": []
            }
        },
        "conversations": {
            "alice_bob_chat": {
                "id": "alice_bob_chat",
                "type": "dm",
                "name": "Alice",
                "avatar": "",
                "messages": [
                    {
                        "id": "m1",
                        "from": "Alice",
                        "text": "Hey, where are you?",
                        "type": "text",
                        "status": "read"
                    }
                ],
                "typing": {}
            }
        },
        "appState": {
            "app_whatsapp": {
                "screen": "chat",
                "conversationId": "alice_bob_chat"
            }
        },
        "camera": {
            "baseView": "APP_VIEW",
            "activeDeviceId": "alice_phone",
            "layout": {
                "mode": "SINGLE",
                "primaryDeviceId": "alice_phone"
            },
            "activeEffects": [],
            "transform": {
                "translateX": 0,
                "translateY": 0,
                "scale": 1,
                "rotation": 0,
                "originX": 0.5,
                "originY": 0.5,
                "shakeX": 0,
                "shakeY": 0
            },
            "deviceTransforms": {}
        },
        "audio": {
            "activeSounds": {}
        }
    },
    "events": [
        {
            "at": 30,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Bob",
            "message": {
                "id": "m2",
                "type": "text",
                "text": "On my way! 🚗",
                "status": "delivered"
            }
        },
        {
            "at": 30,
            "kind": "AUDIO",
            "type": "PLAY_SOUND",
            "soundId": "whatsapp_received"
        },
        {
            "at": 90,
            "kind": "CAMERA",
            "type": "CUT",
            "toDeviceId": "bob_phone"
        },
        {
            "at": 120,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Alice",
            "message": {
                "id": "m3",
                "type": "text",
                "text": "You said that 20 minutes ago 😤",
                "status": "read"
            }
        },
        {
            "at": 120,
            "kind": "AUDIO",
            "type": "PLAY_SOUND",
            "soundId": "whatsapp_received"
        },
        {
            "at": 180,
            "kind": "CAMERA",
            "type": "LAYOUT",
            "mode": "SPLIT_HORIZONTAL",
            "primaryDeviceId": "alice_phone",
            "secondaryDeviceId": "bob_phone"
        },
        {
            "at": 210,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Bob",
            "message": {
                "id": "m4",
                "type": "text",
                "text": "Traffic is crazy! 😅",
                "status": "delivered"
            }
        },
        {
            "at": 300,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Alice",
            "message": {
                "id": "m5",
                "type": "text",
                "text": "Send me your location",
                "status": "read"
            }
        },
        {
            "at": 360,
            "kind": "CAMERA",
            "type": "LAYOUT",
            "mode": "PIP",
            "primaryDeviceId": "bob_phone",
            "secondaryDeviceId": "alice_phone",
            "pipPosition": "top-right",
            "pipScale": 0.35
        },
        {
            "at": 420,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Bob",
            "message": {
                "id": "m6",
                "type": "text",
                "text": "📍 Sharing location...",
                "status": "delivered"
            }
        },
        {
            "at": 510,
            "kind": "CAMERA",
            "type": "ZOOM",
            "scale": 1.3,
            "originX": 0.5,
            "originY": 0.6,
            "duration": 45,
            "easing": "ease-out"
        },
        {
            "at": 600,
            "kind": "CAMERA",
            "type": "LAYOUT",
            "mode": "SPLIT_VERTICAL",
            "primaryDeviceId": "alice_phone",
            "secondaryDeviceId": "bob_phone"
        },
        {
            "at": 660,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Alice",
            "message": {
                "id": "m7",
                "type": "text",
                "text": "Wait... that's not the way here 🤔",
                "status": "read"
            }
        },
        {
            "at": 720,
            "kind": "CAMERA",
            "type": "SHAKE",
            "deviceId": "alice_phone",
            "intensity": 8,
            "frequency": 15,
            "decay": 0.5,
            "duration": 30
        },
        {
            "at": 780,
            "kind": "CAMERA",
            "type": "LAYOUT",
            "mode": "SINGLE",
            "primaryDeviceId": "alice_phone"
        },
        {
            "at": 810,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "alice_bob_chat",
            "from": "Alice",
            "message": {
                "id": "m8",
                "type": "text",
                "text": "WHERE ARE YOU GOING?! 😡",
                "status": "read"
            }
        },
        {
            "at": 870,
            "kind": "CAMERA",
            "type": "ZOOM",
            "scale": 1.5,
            "originX": 0.5,
            "originY": 0.7,
            "duration": 30,
            "easing": "ease-out"
        }
    ]
}
````

## File: packages/renderer/src/layout/config.ts
````typescript
import { LayoutConfig } from "./types";

export const defaultLayoutConfig: LayoutConfig = {
    cinematicMode: "NONE",
    chat: {
        bubbleWidth: 0.78,              // 78% max width for bubbles
        baseBubbleHeight: 120,          // Base height for message bubble (increased)
        charsPerLine: 26,               // Characters per line before wrap
        lineHeight: 66,                 // Line height for text (3x of 22px)
        verticalGap: 36,                // Gap between messages (3x of 12px)
        topPadding: 48,                 // Padding from top (reduced)
        bottomPadding: 120,             // Padding at bottom
        messageAppearDuration: 15,      // Animation duration (frames)
        messageAppearOffset: 30,        // Slide-in offset
        scrollEasingDuration: 20,       // Scroll animation duration
        maxScrollCatchupSpeed: 50,      // Max scroll speed
        lockToBottom: true              // Keep scrolled to bottom
    },
    feed: {
        cardWidth: 1.0, // 100% width
        baseCardHeight: 600,
        verticalGap: 20,
        topPadding: 150, // Header + Stories
        bottomPadding: 150, // Bottom nav
        charsPerLine: 40,
        lineHeight: 30,
        scrollEasingDuration: 20,
        maxScrollCatchupSpeed: 50,
        startAtTop: true,
        autoScroll: false
    },
    story: {
        defaultStoryDuration: 150, // 5 seconds at 30fps
        progressBarHeight: 4,
        storyGap: 0,
        storyTransitionDuration: 15
    },
    lockscreen: {
        topPadding: 150,
        notificationGap: 10,
        notificationWidth: 0.9,
        baseNotificationHeight: 100,
        charsPerLine: 40,
        lineHeight: 30,
        stackMaxNotifications: 5,
        appearDuration: 15
    },
    transition: {
        defaultScale: 1.0,
        zoomedScale: 1.2,
        panDuration: 30,
        zoomDuration: 30
    }
};
````

## File: packages/renderer/src/NotificationOverlay.tsx
````typescript
import React from "react";
import { Notification } from "@tokovo/core";
import { LayoutState, LockscreenLayoutState } from "./layout/types";

export const NotificationOverlay: React.FC<{ notifications?: Notification[]; variant?: "ios" | "android"; layout?: LayoutState }> = ({ notifications = [], variant = "ios", layout }) => {
    // If we have a Lockscreen layout, use it
    const lockscreenLayout = layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;

    // If no layout provided or not lockscreen, we might still want to show notifications (e.g. heads-up)
    // But for now, let's assume we only use this for lockscreen stacking or heads-up if layout engine supports it.
    // If layout is missing, fallback to nothing or old behavior? 
    // Let's stick to layout-driven. If no layout, no render.
    if (!lockscreenLayout) return null;

    const isAndroid = variant === "android";

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 100
        }}>
            {lockscreenLayout.notificationLayouts.map(nl => {
                const notification = notifications.find(n => n.id === nl.id);
                if (!notification) return null;

                return (
                    <div key={nl.id} style={{
                        position: "absolute",
                        top: nl.y,
                        left: "50%",
                        transform: `translateX(-50%) translateY(${nl.translateY}px)`,
                        width: "92%",
                        opacity: nl.opacity,
                        height: nl.height
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
                            height: "100%",
                            boxSizing: "border-box"
                        }}>
                            <div style={{
                                width: 100,
                                height: 100,
                                borderRadius: 20,
                                backgroundColor: "#25D366", // WhatsApp Green (Mock)
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: 50,
                                color: "white"
                            }}>
                                W
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                                    <span>{notification.title}</span>
                                    <span style={{ fontSize: 28, opacity: 0.5, fontWeight: "normal" }}>now</span>
                                </div>
                                <div style={{ fontSize: 36, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {notification.body}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
````

## File: packages/renderer/package.json
````json
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
````

## File: packages/apps-instagram/src/views/feed/FeedView.tsx
````typescript
import React from "react";
import { InstagramState, Post, StoryUser } from "../../types";
import { LayoutState, FeedLayoutState } from "@tokovo/core";

// ============================================================================
// HEADER ICONS - Authentic Instagram iOS
// ============================================================================

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
    </svg>
);

const MessengerIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={filled ? "#FF3040" : "none"} stroke={filled ? "#FF3040" : "white"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CommentIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ShareIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const MoreIcon = () => (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
    </svg>
);

// ============================================================================
// INSTAGRAM LOGO - Script font with dropdown
// ============================================================================

const InstagramLogo = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12
    }}>
        <span style={{
            fontFamily: "'Billabong', 'Grand Hotel', cursive, -apple-system",
            fontSize: 90,
            color: "white",
            letterSpacing: 1,
            fontWeight: 400
        }}>
            Instagram
        </span>
        <svg width="36" height="36" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

// ============================================================================
// STORY BUBBLE - Larger authentic Instagram style
// ============================================================================

const StoryBubble: React.FC<{ user: StoryUser; isYourStory?: boolean }> = ({ user, isYourStory }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 36,
        width: 210
    }}>
        {/* Story Ring */}
        <div style={{
            width: 210,
            height: 210,
            borderRadius: "50%",
            padding: 9,
            background: isYourStory
                ? "transparent"
                : user.hasUnseen
                    ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                    : "#444"
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "6px solid #000",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundImage: user.avatar ? `url(${user.avatar})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundColor: "#333"
                }} />

                {/* Your Story + icon */}
                {isYourStory && (
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "#0095F6",
                        border: "4px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                )}
            </div>
        </div>

        {/* Username */}
        <div style={{
            color: "white",
            fontSize: 30,
            marginTop: 15,
            maxWidth: 210,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center"
        }}>
            {isYourStory ? "Your story" : user.username}
        </div>
    </div>
);

// ============================================================================
// POST ITEM - Authentic Instagram post
// ============================================================================

const PostItem: React.FC<{ post: Post }> = ({ post }) => (
    <div style={{ marginBottom: 48 }}>
        {/* Header */}
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "24px 36px",
            gap: 24
        }}>
            {/* Avatar with story ring if applicable */}
            <div style={{
                width: 102,
                height: 102,
                borderRadius: "50%",
                padding: 6,
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
            }}>
                <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "4px solid #000",
                    backgroundImage: `url(${post.avatar})`,
                    backgroundSize: "cover",
                    backgroundColor: "#333"
                }} />
            </div>

            {/* Username + Location */}
            <div style={{ flex: 1 }}>
                <div style={{
                    color: "white",
                    fontSize: 39,
                    fontWeight: 600,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {post.username}
                </div>
            </div>

            <MoreIcon />
        </div>

        {/* Image */}
        <div style={{
            width: "100%",
            aspectRatio: "1/1",
            backgroundColor: "#1a1a1a",
            backgroundImage: `url(${post.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
        }} />

        {/* Actions */}
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "30px 36px 18px",
            alignItems: "center"
        }}>
            <div style={{ display: "flex", gap: 48 }}>
                <HeartIcon filled={post.liked} />
                <CommentIcon />
                <ShareIcon />
            </div>
            <BookmarkIcon filled={post.saved} />
        </div>

        {/* Likes */}
        <div style={{ padding: "0 36px", marginBottom: 12 }}>
            <div style={{
                color: "white",
                fontSize: 39,
                fontWeight: 600,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                {post.likes.toLocaleString()} likes
            </div>
        </div>

        {/* Caption */}
        <div style={{ padding: "0 36px", marginBottom: 12 }}>
            <span style={{
                color: "white",
                fontSize: 39,
                fontWeight: 600,
                marginRight: 12,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                {post.username}
            </span>
            <span style={{ color: "white", fontSize: 39 }}>
                {post.caption}
            </span>
        </div>

        {/* Comments link */}
        <div style={{ padding: "0 36px", marginBottom: 6 }}>
            <span style={{ color: "#A8A8A8", fontSize: 36 }}>
                View all {post.comments} comments
            </span>
        </div>

        {/* Timestamp */}
        <div style={{ padding: "0 36px" }}>
            <span style={{ color: "#A8A8A8", fontSize: 30, textTransform: "uppercase" }}>
                2 hours ago
            </span>
        </div>
    </div>
);

// ============================================================================
// FEED VIEW - Main export
// ============================================================================

export const FeedView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    // Create "Your Story" user for first position
    const yourStory: StoryUser = {
        username: "Your story",
        avatar: "",
        hasUnseen: false,
        stories: []
    };

    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                height: 156,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 36px",
                marginTop: 120,
                backgroundColor: "#000",
                zIndex: 10
            }}>
                <CameraIcon />
                <InstagramLogo />
                <div style={{ display: "flex", gap: 60 }}>
                    <HeartIcon />
                    <MessengerIcon />
                </div>
            </div>

            {/* Scrollable Content */}
            <div style={{
                flex: 1,
                overflow: "hidden",
                position: "relative"
            }}>
                <div style={{
                    transform: `translateY(-${scrollY}px)`
                }}>
                    {/* Stories Row */}
                    <div style={{
                        display: "flex",
                        padding: "24px 36px",
                        borderBottom: "1px solid #262626",
                        marginBottom: 6,
                        overflowX: "hidden"
                    }}>
                        <StoryBubble user={yourStory} isYourStory />
                        {state.stories.users.map(user => (
                            <StoryBubble key={user.username} user={user} />
                        ))}
                    </div>

                    {/* Posts */}
                    {state.feed.posts.map(post => (
                        <PostItem key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/views/stories/StoriesView.tsx
````typescript
import React from "react";
import { InstagramState, StoryUser } from "../../types";
import { LayoutState, StoryLayoutState } from "@tokovo/core";

// ============================================================================
// ICONS
// ============================================================================

const CloseIcon = () => (
    <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MoreIcon = () => (
    <svg width="66" height="66" viewBox="0 0 24 24" fill="white">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
    </svg>
);

const HeartIcon = () => (
    <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
    </svg>
);

// ============================================================================
// PROGRESS BAR
// ============================================================================

const ProgressBar: React.FC<{ count: number; activeIndex: number; progress: number }> = ({ count, activeIndex, progress }) => (
    <div style={{ display: "flex", gap: 9, padding: "30px 24px" }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
                flex: 1,
                height: 9,
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: 6,
                overflow: "hidden"
            }}>
                <div style={{
                    height: "100%",
                    width: i < activeIndex ? "100%" : i === activeIndex ? `${progress * 100}%` : "0%",
                    backgroundColor: "white",
                    borderRadius: 6,
                    transition: "width 0.1s linear"
                }} />
            </div>
        ))}
    </div>
);

// ============================================================================
// EMOJI SHORTCUTS
// ============================================================================

const EmojiShortcuts = () => (
    <div style={{ display: "flex", gap: 30 }}>
        {["❤️", "🔥", "👏", "😂", "😮", "😢"].map(emoji => (
            <span key={emoji} style={{ fontSize: 66 }}>{emoji}</span>
        ))}
    </div>
);

// ============================================================================
// STORIES VIEW - Main export
// ============================================================================

export const StoriesView: React.FC<{ state: InstagramState; t: number; layout?: LayoutState }> = ({ state, t, layout }) => {
    const storyLayout = layout?.kind === "STORY" ? (layout as StoryLayoutState) : null;

    if (!storyLayout) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeUser = state.stories.users.find(u => u.username === state.stories.activeStoryId?.split(':')[0]);
    if (!activeUser) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeIndex = storyLayout.activeStoryIndex;
    const progress = storyLayout.storyProgress;
    const activeStory = activeUser.stories[activeIndex];

    if (!activeStory) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* Story Images (with transitions) */}
            {storyLayout.storyLayouts.map(sl => {
                const story = activeUser.stories[sl.index];
                if (!story) return null;

                return (
                    <div key={story.id} style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${story.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: sl.opacity,
                        transform: `translateX(${sl.translateX}%) scale(${sl.scale})`
                    }} />
                );
            })}

            {/* Top Gradient */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 450,
                background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 5
            }} />

            {/* Bottom Gradient */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 450,
                background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 5
            }} />

            {/* Top UI */}
            <div style={{ position: "relative", zIndex: 10, paddingTop: 120 }}>
                {/* Progress bars */}
                <ProgressBar count={activeUser.stories.length} activeIndex={activeIndex} progress={progress} />

                {/* User info */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    marginTop: 12
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        backgroundImage: `url(${activeUser.avatar})`,
                        backgroundSize: "cover",
                        backgroundColor: "#333",
                        marginRight: 24
                    }} />

                    {/* Username + Time */}
                    <span style={{
                        fontSize: 42,
                        fontWeight: 600,
                        marginRight: 18
                    }}>
                        {activeUser.username}
                    </span>
                    <span style={{
                        fontSize: 36,
                        opacity: 0.7
                    }}>
                        12h
                    </span>

                    <div style={{ flex: 1 }} />

                    {/* Actions */}
                    <MoreIcon />
                    <div style={{ width: 30 }} />
                    <CloseIcon />
                </div>
            </div>

            {/* Bottom UI */}
            <div style={{
                position: "absolute",
                bottom: 60,
                left: 0,
                right: 0,
                padding: "0 36px",
                display: "flex",
                alignItems: "center",
                gap: 30,
                zIndex: 10
            }}>
                {/* Message Input */}
                <div style={{
                    flex: 1,
                    height: 132,
                    borderRadius: 66,
                    border: "3px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 42px",
                    fontSize: 42,
                    color: "rgba(255,255,255,0.8)"
                }}>
                    Send message
                </div>

                {/* Quick reactions */}
                <HeartIcon />
                <ShareIcon />
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/ui.tsx
````typescript
import React from "react";
import { WorldState, LayoutState } from "@tokovo/core";
import { InstagramState } from "./types";
import { InstagramChatView } from "./views/dm/InstagramChatView";
import { FeedView } from "./views/feed/FeedView";
import { StoriesView } from "./views/stories/StoriesView";
import { ProfileView } from "./views/profile/ProfileView";
import { ExploreView } from "./views/explore/ExploreView";
import { NotificationsView } from "./views/notifications/NotificationsView";
import { ReelsView } from "./views/reels/ReelsView";
import { PostView } from "./views/post/PostView";
import { BottomNav } from "./views/BottomNav";

export const InstagramApp: React.FC<{ world: WorldState; t: number; layout?: LayoutState }> = ({ world, t, layout }) => {
    const appState = world.appState?.["app_instagram"] as InstagramState;
    const currentView = appState?.currentView || "dm";

    console.log(`[InstagramApp] Current View: ${currentView}, t=${t}`);

    // Views that show the bottom navigation
    const showBottomNav = ['feed', 'explore', 'reels', 'profile'].includes(currentView);

    const renderView = () => {
        switch (currentView) {
            case "dm":
                return <InstagramChatView world={world} t={t} layout={layout} />;
            case "feed":
                return <FeedView state={appState} layout={layout} />;
            case "stories":
                return <StoriesView state={appState} t={t} layout={layout} />;
            case "profile":
                return <ProfileView state={appState} />;
            case "post":
                return <PostView state={appState} />;
            case "explore":
                return <ExploreView state={appState} />;
            case "notifications":
                return <NotificationsView state={appState} />;
            case "reels":
                return <ReelsView state={appState} />;
            default:
                return <InstagramChatView world={world} t={t} layout={layout} />;
        }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "black" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                {renderView()}
            </div>
            {showBottomNav && <BottomNav currentView={currentView} />}
        </div>
    );
};

// Re-export specific views if needed externally, but InstagramApp is the main entry
export { InstagramChatView };
````

## File: packages/core/src/camera/index.ts
````typescript
/**
 * Camera Module - Cinematic Camera System for Tokovo
 * 
 * This module provides production-grade camera effects including:
 * - ZOOM: Scale with configurable origin and easing
 * - PAN: Translation with smooth easing
 * - SHAKE: Screen shake with frequency, intensity, and decay
 * - FOCUS: Target-based zoom (app, notification, message, point)
 * - CUT: Instant transitions between views
 * - RESET: Smooth return to default camera position
 */

import {
    CameraState,
    CameraTransform,
    CameraEffect,
    ActiveCameraEffect,
    EasingType,
    DEFAULT_CAMERA_TRANSFORM,
    CameraZoomEffect,
    CameraPanEffect,
    CameraShakeEffect,
    CameraFocusEffect,
    CameraResetEffect,
} from "../types";

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

/**
 * Easing functions library - cinematic-grade timing curves
 * Input: t (0-1), Output: eased value (0-1)
 */
export const easingFunctions: Record<EasingType, (t: number) => number> = {
    "linear": (t) => t,

    "ease-in": (t) => t * t * t,

    "ease-out": (t) => 1 - Math.pow(1 - t, 3),

    "ease-in-out": (t) => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2,

    "bounce": (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    "elastic": (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },

    // Cinematic S-curve - smooth start, linear middle, smooth end
    // Inspired by film camera movements
    "cinematic": (t) => {
        // Custom bezier-like curve for film-quality motion
        if (t < 0.2) {
            // Smooth ease-in for first 20%
            return 0.5 * Math.pow(t / 0.2, 2) * 0.2;
        } else if (t > 0.8) {
            // Smooth ease-out for last 20%
            const localT = (t - 0.8) / 0.2;
            return 0.8 + 0.2 * (1 - Math.pow(1 - localT, 2));
        } else {
            // Linear middle section (60%)
            return 0.1 + (t - 0.2) * (0.7 / 0.6);
        }
    },
};

/**
 * Apply easing to a progress value
 */
export function applyEasing(progress: number, easing: EasingType = "ease-out"): number {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    return easingFunctions[easing](clampedProgress);
}

// =============================================================================
// SEEDED RANDOM FOR DETERMINISTIC SHAKE
// =============================================================================

/**
 * Seeded random number generator for deterministic shake effects
 * Uses mulberry32 algorithm for speed and quality
 */
function seededRandom(seed: number): () => number {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Generate shake offset for a given frame
 * Returns values between -1 and 1
 */
function getShakeOffset(frame: number, seed: number, frequency: number, fps: number = 30): { x: number; y: number } {
    // Calculate how many shake cycles per frame
    const cyclesPerSecond = frequency;
    const cyclesPerFrame = cyclesPerSecond / fps;

    // Create deterministic random based on frame and seed
    const rng = seededRandom(seed + Math.floor(frame * cyclesPerFrame));

    // Generate offset (-1 to 1)
    const x = (rng() - 0.5) * 2;
    const y = (rng() - 0.5) * 2;

    return { x, y };
}

// =============================================================================
// CAMERA CONTROLLER
// =============================================================================

/**
 * CameraController - Computes camera transforms at any given frame
 * 
 * This is the heart of the cinematic system. It takes:
 * - Current camera state (with active effects)
 * - Current frame number
 * 
 * And produces a final CameraTransform with all effects composited.
 */
export class CameraController {
    private fps: number;

    // Memoization cache for performance (LRU with max 500 entries)
    private transformCache = new Map<string, CameraTransform>();
    private readonly MAX_CACHE_SIZE = 500;

    constructor(fps: number = 30) {
        this.fps = fps;
    }

    /**
     * Generate cache key from camera state and frame
     */
    private getCacheKey(state: CameraState, t: number): string {
        // Key includes frame number and effect IDs with their start frames
        const effectsKey = state.activeEffects
            .map(e => `${e.id}:${e.startFrame}:${e.endFrame}`)
            .join('|');
        return `${t}:${effectsKey}`;
    }

    /**
     * Compute the final camera transform at frame t
     * 
     * Effects are applied in layers:
     * 1. Completed effects that ended before t - their final state persists
     * 2. Active effects at time t - animated based on progress
     * 
     * For overlapping effects:
     * - Scale is multiplicative (zoom 1.2 + zoom 1.5 = zoom 1.8)
     * - Translate is additive
     * - Origin uses the most recent effect's origin
     * - Shake is additive
     * 
     * Memoized for performance.
     */
    computeTransform(state: CameraState, t: number): CameraTransform {
        // Check cache first
        const cacheKey = this.getCacheKey(state, t);
        const cached = this.transformCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Start with default transform
        const transform: CameraTransform = { ...DEFAULT_CAMERA_TRANSFORM };

        // Sort effects by start time for consistent processing
        const sortedEffects = [...state.activeEffects].sort((a, b) => a.startFrame - b.startFrame);

        // Apply each effect using the helper methods
        for (const activeEffect of sortedEffects) {
            // Skip effects that haven't started yet
            if (t < activeEffect.startFrame) continue;

            // Apply effect using the unified method
            this.applyEffect(transform, activeEffect, t);
        }

        // Cache the result
        this.transformCache.set(cacheKey, transform);

        // LRU eviction - remove oldest entries if over limit
        if (this.transformCache.size > this.MAX_CACHE_SIZE) {
            const firstKey = this.transformCache.keys().next().value;
            if (firstKey) {
                this.transformCache.delete(firstKey);
            }
        }

        return transform;
    }

    /**
     * Clear the transform cache (call when starting a new video)
     */
    clearCache(): void {
        this.transformCache.clear();
    }

    /**
     * Apply a single effect to the transform
     */
    private applyEffect(transform: CameraTransform, activeEffect: ActiveCameraEffect, t: number): void {
        const { effect, startFrame, endFrame } = activeEffect;
        const duration = endFrame - startFrame;
        const localT = duration > 0 ? (t - startFrame) / duration : 1;

        switch (effect.type) {
            case "ZOOM":
                this.applyZoom(transform, effect, localT);
                break;
            case "PAN":
                this.applyPan(transform, effect, localT);
                break;
            case "SHAKE":
                this.applyShake(transform, effect, localT, t, startFrame);
                break;
            case "FOCUS":
                this.applyFocus(transform, effect, localT);
                break;
            case "RESET":
                this.applyReset(transform, effect, localT);
                break;
            // CUT is handled by the reducer, not here
        }
    }

    /**
     * ZOOM effect - scale with origin
     */
    private applyZoom(transform: CameraTransform, effect: CameraZoomEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");

        // Interpolate from current scale to target scale
        const startScale = transform.scale;
        const targetScale = effect.scale;
        transform.scale = startScale + (targetScale - startScale) * easedProgress;

        // Set transform origin if specified
        if (effect.originX !== undefined) {
            transform.originX = effect.originX;
        }
        if (effect.originY !== undefined) {
            transform.originY = effect.originY;
        }
    }

    /**
     * PAN effect - translate position
     */
    private applyPan(transform: CameraTransform, effect: CameraPanEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");

        // Add translation (effects are additive for pan)
        transform.translateX += effect.translateX * easedProgress;
        transform.translateY += effect.translateY * easedProgress;
    }

    /**
     * SHAKE effect - screen tremor with decay
     */
    private applyShake(
        transform: CameraTransform,
        effect: CameraShakeEffect,
        progress: number,
        absoluteFrame: number,
        startFrame: number
    ): void {
        const frameInEffect = absoluteFrame - startFrame;
        const seed = effect.seed ?? startFrame; // Use start frame as default seed for determinism

        // Get shake offset for this frame
        const offset = getShakeOffset(frameInEffect, seed, effect.frequency, this.fps);

        // Apply decay (1 = instant decay, 0 = no decay)
        const decay = effect.decay ?? 0.3; // Default 30% decay
        const decayMultiplier = 1 - (progress * decay);

        // Apply intensity and decay
        transform.shakeX += offset.x * effect.intensity * decayMultiplier;
        transform.shakeY += offset.y * effect.intensity * decayMultiplier;
    }

    /**
     * FOCUS effect - zoom to a target
     * Note: Actual target position calculation happens in the renderer
     * Here we just handle the zoom/pan animation
     */
    private applyFocus(transform: CameraTransform, effect: CameraFocusEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");
        const holdDuration = effect.holdDuration ?? 0;

        // If we have a hold duration, adjust the animation curve
        let animProgress = easedProgress;
        if (holdDuration > 0 && progress > 0.5) {
            // Hold at peak for specified duration
            animProgress = 1;
        }

        // Apply zoom (FOCUS is essentially targeted ZOOM)
        const targetScale = effect.scale ?? 1.5;
        transform.scale = 1 + (targetScale - 1) * animProgress;

        // Target-based origin will be set by renderer based on target position
        // For now, we handle point-based targets
        if (effect.target.type === "point") {
            transform.originX = effect.target.x;
            transform.originY = effect.target.y;
        }
    }

    /**
     * RESET effect - return to default camera position
     */
    private applyReset(transform: CameraTransform, effect: CameraResetEffect, progress: number): void {
        const easedProgress = applyEasing(progress, effect.easing || "ease-out");

        // Interpolate all values toward defaults
        transform.translateX = transform.translateX * (1 - easedProgress);
        transform.translateY = transform.translateY * (1 - easedProgress);
        transform.scale = transform.scale + (1 - transform.scale) * easedProgress;
        transform.rotation = transform.rotation * (1 - easedProgress);
        transform.originX = transform.originX + (0.5 - transform.originX) * easedProgress;
        transform.originY = transform.originY + (0.5 - transform.originY) * easedProgress;
    }
}

// =============================================================================
// CAMERA EVENT PROCESSING
// =============================================================================

/**
 * Convert a timeline camera event to an ActiveCameraEffect
 */
export function createActiveEffect(
    event: { at: number; kind: "CAMERA"; type: string;[key: string]: any },
    id: string
): ActiveCameraEffect | null {
    const { at, type, ...params } = event;

    // Skip non-effect events
    if (type === "SET_VIEW" || type === "CUT") {
        return null;
    }

    // Build effect based on type
    let effect: CameraEffect;
    const duration = params.duration ?? 30; // Default 1 second at 30fps

    switch (type) {
        case "ZOOM":
            effect = {
                type: "ZOOM",
                scale: params.scale ?? 1,
                originX: params.originX,
                originY: params.originY,
                duration,
                easing: params.easing,
            };
            break;
        case "PAN":
            effect = {
                type: "PAN",
                translateX: params.translateX ?? 0,
                translateY: params.translateY ?? 0,
                relative: params.relative,
                duration,
                easing: params.easing,
            };
            break;
        case "SHAKE":
            effect = {
                type: "SHAKE",
                intensity: params.intensity ?? 10,
                frequency: params.frequency ?? 15,
                decay: params.decay,
                duration,
                seed: params.seed,
            };
            break;
        case "FOCUS":
            effect = {
                type: "FOCUS",
                target: params.target ?? { type: "device" },
                scale: params.scale,
                duration,
                easing: params.easing,
                holdDuration: params.holdDuration,
            };
            break;
        case "RESET":
            effect = {
                type: "RESET",
                duration,
                easing: params.easing,
            };
            break;
        default:
            return null;
    }

    return {
        id,
        effect,
        startFrame: at,
        endFrame: at + duration,
        deviceId: params.deviceId,  // Per-device targeting
    };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { seededRandom, getShakeOffset };

// Default controller instance
export const defaultCameraController = new CameraController(30);
````

## File: packages/core/src/tokens.ts
````typescript
/**
 * Shared Design Tokens & UI Primitives
 * Ensures consistent styling across WhatsApp, Instagram, and future apps
 */

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export const iOSTokens = {
    // Colors
    colors: {
        // System colors
        primary: "#007AFF",
        success: "#34C759",
        warning: "#FF9500",
        danger: "#FF3B30",

        // Grays
        label: "#000000",
        secondaryLabel: "#8E8E93",
        tertiaryLabel: "#C7C7CC",
        background: "#FFFFFF",
        secondaryBackground: "#F2F2F7",
        separator: "rgba(60, 60, 67, 0.36)",

        // App-specific
        whatsappGreen: "#25D366",
        whatsappTeal: "#128C7E",
        instagramPink: "#E4405F",
        instagramPurple: "#833AB4",
        iMessageBlue: "#007AFF",
    },

    // Typography (in 3x scale for Remotion)
    typography: {
        largeTitle: { fontSize: 102, fontWeight: "700" as const, lineHeight: 123 },
        title1: { fontSize: 84, fontWeight: "700" as const, lineHeight: 102 },
        title2: { fontSize: 66, fontWeight: "700" as const, lineHeight: 78 },
        title3: { fontSize: 60, fontWeight: "600" as const, lineHeight: 72 },
        headline: { fontSize: 51, fontWeight: "600" as const, lineHeight: 63 },
        body: { fontSize: 51, fontWeight: "400" as const, lineHeight: 66 },
        callout: { fontSize: 48, fontWeight: "400" as const, lineHeight: 60 },
        subhead: { fontSize: 45, fontWeight: "400" as const, lineHeight: 57 },
        footnote: { fontSize: 39, fontWeight: "400" as const, lineHeight: 51 },
        caption1: { fontSize: 36, fontWeight: "400" as const, lineHeight: 48 },
        caption2: { fontSize: 33, fontWeight: "400" as const, lineHeight: 42 },
    },

    // Spacing (in 3x scale)
    spacing: {
        xs: 12,
        sm: 24,
        md: 48,
        lg: 72,
        xl: 96,
    },

    // Radii (in 3x scale)
    radii: {
        sm: 12,
        md: 24,
        lg: 36,
        xl: 48,
        pill: 999,
    },

    // Shadows
    shadows: {
        sm: "0 3px 9px rgba(0,0,0,0.08)",
        md: "0 6px 18px rgba(0,0,0,0.12)",
        lg: "0 12px 36px rgba(0,0,0,0.16)",
    },

    // Font family
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif",
};

export const androidTokens = {
    // Colors (Material You)
    colors: {
        primary: "#1A73E8",
        success: "#34A853",
        warning: "#FBBC04",
        danger: "#EA4335",

        label: "#202124",
        secondaryLabel: "#5F6368",
        tertiaryLabel: "#9AA0A6",
        background: "#FFFFFF",
        secondaryBackground: "#F8F9FA",
        separator: "rgba(0, 0, 0, 0.12)",

        whatsappGreen: "#25D366",
        instagramPink: "#E4405F",
    },

    // Typography (Material 3, in 3x scale)
    typography: {
        displayLarge: { fontSize: 171, fontWeight: "400" as const, lineHeight: 192 },
        displayMedium: { fontSize: 135, fontWeight: "400" as const, lineHeight: 156 },
        displaySmall: { fontSize: 108, fontWeight: "400" as const, lineHeight: 132 },
        headlineLarge: { fontSize: 96, fontWeight: "400" as const, lineHeight: 120 },
        headlineMedium: { fontSize: 84, fontWeight: "400" as const, lineHeight: 108 },
        headlineSmall: { fontSize: 72, fontWeight: "400" as const, lineHeight: 96 },
        titleLarge: { fontSize: 66, fontWeight: "400" as const, lineHeight: 84 },
        titleMedium: { fontSize: 48, fontWeight: "500" as const, lineHeight: 72 },
        titleSmall: { fontSize: 42, fontWeight: "500" as const, lineHeight: 60 },
        bodyLarge: { fontSize: 48, fontWeight: "400" as const, lineHeight: 72 },
        bodyMedium: { fontSize: 42, fontWeight: "400" as const, lineHeight: 60 },
        bodySmall: { fontSize: 36, fontWeight: "400" as const, lineHeight: 48 },
        labelLarge: { fontSize: 42, fontWeight: "500" as const, lineHeight: 60 },
        labelMedium: { fontSize: 36, fontWeight: "500" as const, lineHeight: 48 },
        labelSmall: { fontSize: 33, fontWeight: "500" as const, lineHeight: 48 },
    },

    // Spacing
    spacing: {
        xs: 12,
        sm: 24,
        md: 48,
        lg: 72,
        xl: 96,
    },

    // Radii
    radii: {
        sm: 12,
        md: 24,
        lg: 42,
        xl: 84,
        pill: 999,
    },

    // Font family
    fontFamily: "'Roboto', 'Google Sans', sans-serif",
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export type Platform = "ios" | "android";

export function getTokens(platform: Platform) {
    return platform === "ios" ? iOSTokens : androidTokens;
}

// Unified typography that maps semantic names to platform-specific styles
type SemanticTypography = "largeTitle" | "title" | "headline" | "body" | "callout" | "caption" | "footnote";

const typographyMap: Record<SemanticTypography, { ios: keyof typeof iOSTokens.typography; android: keyof typeof androidTokens.typography }> = {
    largeTitle: { ios: "largeTitle", android: "displaySmall" },
    title: { ios: "title1", android: "headlineLarge" },
    headline: { ios: "headline", android: "titleMedium" },
    body: { ios: "body", android: "bodyLarge" },
    callout: { ios: "callout", android: "bodyMedium" },
    caption: { ios: "caption1", android: "bodySmall" },
    footnote: { ios: "footnote", android: "labelMedium" }
};

export function getTypography(platform: Platform, semantic: SemanticTypography) {
    const map = typographyMap[semantic];
    if (platform === "ios") {
        return iOSTokens.typography[map.ios];
    }
    return androidTokens.typography[map.android];
}

// =============================================================================
// SHARED STYLES
// =============================================================================

export const sharedStyles = {
    // Flexbox utilities
    flexCenter: {
        display: "flex" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    flexBetween: {
        display: "flex" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
    },
    flexColumn: {
        display: "flex" as const,
        flexDirection: "column" as const,
    },

    // Full size
    absoluteFill: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    // Text truncation
    truncate: {
        overflow: "hidden" as const,
        textOverflow: "ellipsis" as const,
        whiteSpace: "nowrap" as const,
    },
};

// =============================================================================
// APP-SPECIFIC CONFIG
// =============================================================================

export const appConfigs = {
    whatsapp: {
        ios: {
            // Header
            headerHeight: 270,
            headerBg: "#F6F6F6",
            statusBarHeight: 144,
            avatarSize: 111,
            avatarMargin: 24,
            headerTitleSize: 51,
            headerSubtitleSize: 36,
            headerIconGap: 54,

            // Chat area
            chatBackground: "#ECE5DD",
            inputHeight: 180,

            // Message bubbles
            bubblePadding: 24,
            bubblePaddingHorizontal: 36,
            bubbleRadius: 24,
            bubbleTailRadius: 6,
            bubbleMaxWidth: "78%",
            bubbleMarginHorizontal: 36,
            bubbleGap: 12,  // Gap between consecutive messages
            bubbleShadow: "0 1px 0.5px rgba(0,0,0,0.13)",

            // Bubble colors
            bubbleMyColor: "#E7FFDB",
            bubbleOtherColor: "#FFFFFF",
            bubbleTextColor: "#111B21",

            // Message text
            messageTextSize: 48,
            messageLineHeight: 66,
            timestampSize: 33,
            timestampColor: "#667781",

            // Sender name (groups)
            senderNameSize: 33,
            senderNameColor: "#25D366",

            // Read receipts
            accentColor: "#25D366",
            readReceiptColor: "#53BDEB",
            unreadReceiptColor: "#8696A0",

            // Avatar (for contacts without photos)
            avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            avatarFontSize: 45,

            // Input area
            inputBg: "#FFFFFF",
            inputBorderRadius: 60,
            inputPlaceholderColor: "#8E8E93",
            inputTextColor: "#000000",
            inputIconColor: "#8E8E93",
            sendButtonColor: "#25D366",

            // Tuning indicator
            typingBubbleColor: "#FFFFFF",
            typingDotColor: "#8E8E93",
            typingDotSize: 24,

            // "Psychotic" Features
            editedLabelColor: "#8E8E93",
            editedLabelSize: 30,

            missedCallIconColor: "#FF3B30",
            missedCallBubbleColor: "#FFFFFF",

            adminBadgeColor: "#E1DAD0",
            adminTextColor: "#667781",

            waveformActiveColor: "#007AFF",
            waveformInactiveColor: "#C7C7CC",

            screenshotAlertBg: "rgba(255,59,48,0.1)",
            screenshotAlertText: "#FF3B30",
        },
        android: {
            // Header
            headerHeight: 255,
            headerBg: "#008069",
            statusBarHeight: 120,
            avatarSize: 105,
            avatarMargin: 24,
            headerTitleSize: 48,
            headerSubtitleSize: 33,
            headerIconGap: 48,

            // Chat area
            chatBackground: "#ECE5DD",
            inputHeight: 165,

            // Message bubbles
            bubblePadding: 21,
            bubblePaddingHorizontal: 33,
            bubbleRadius: 21,
            bubbleTailRadius: 6,
            bubbleMaxWidth: "78%",
            bubbleMarginHorizontal: 30,
            bubbleGap: 9,
            bubbleShadow: "0 1px 1px rgba(0,0,0,0.1)",

            // Bubble colors
            bubbleMyColor: "#E7FFDB",
            bubbleOtherColor: "#FFFFFF",
            bubbleTextColor: "#111B21",

            // Message text
            messageTextSize: 45,
            messageLineHeight: 63,
            timestampSize: 30,
            timestampColor: "#667781",

            // Sender name (groups)
            senderNameSize: 30,
            senderNameColor: "#25D366",

            // Read receipts
            accentColor: "#25D366",
            readReceiptColor: "#53BDEB",
            unreadReceiptColor: "#8696A0",

            // Avatar (for contacts without photos)
            avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            avatarFontSize: 42,

            // Input area
            inputBg: "#FFFFFF",
            inputBorderRadius: 60,
            inputPlaceholderColor: "#8E8E93",
            inputTextColor: "#000000",
            inputIconColor: "#8E8E93",
            sendButtonColor: "#008069", // Android Teal

            // Typing indicator
            typingBubbleColor: "#FFFFFF",
            typingDotColor: "#8E8E93",
            typingDotSize: 21,

            // "Psychotic" Features
            editedLabelColor: "#8E8E93",
            editedLabelSize: 27,

            missedCallIconColor: "#FF3B30",
            missedCallBubbleColor: "#FFFFFF",

            adminBadgeColor: "#E1DAD0",
            adminTextColor: "#54656F",

            waveformActiveColor: "#008069",
            waveformInactiveColor: "#C7C7CC",

            screenshotAlertBg: "rgba(255,59,48,0.1)",
            screenshotAlertText: "#FF3B30",
        },
    },
    instagram: {
        ios: {
            headerHeight: 264,
            navHeight: 147,
            storySize: 210,
            accentColor: "#E4405F",
        },
        android: {
            headerHeight: 252,
            navHeight: 144,
            storySize: 200,
            accentColor: "#E4405F",
        }
    },
    imessage: {
        ios: {
            bubbleMyColor: "#007AFF",
            bubbleMyTextColor: "#FFFFFF",
            bubbleOtherColor: "#E9E9EB",
            bubbleOtherTextColor: "#000000",
            accentColor: "#007AFF",
        },
        android: {
            bubbleMyColor: "#007AFF",
            bubbleMyTextColor: "#FFFFFF",
            bubbleOtherColor: "#E9E9EB",
            bubbleOtherTextColor: "#000000",
            accentColor: "#007AFF",
        }
    },
    homescreen: {
        ios: {
            // Grid
            gridColumns: 4,
            gridRows: 6,
            gridGapRow: 36,
            gridGapCol: 0,
            gridPaddingTop: 240,
            gridPaddingHorizontal: 30,

            // Icons
            iconSize: 180,
            iconRadius: 40, // 180 * 0.22 roughly
            iconLabelSize: 33,
            iconLabelColor: "#FFFFFF",
            iconLabelGap: 12,

            // Folders
            folderBackdrop: "rgba(255,255,255,0.2)",
            folderBlur: "30px",
            folderPreviewGap: 9,
            folderMiniIconRadius: 0.2, // relative to mini size

            // Dock
            dockHeight: 270,
            dockRadius: 90,
            dockBottom: 60,
            dockWidth: "92%",
            dockBackdrop: "rgba(255,255,255,0.2)",
            dockBlur: "60px",
            dockIconSize: 150,

            // Page Dots
            dotSize: 21,
            dotGap: 18,
            dotActiveColor: "#FFFFFF",
            dotInactiveColor: "rgba(255,255,255,0.4)",
            dotMarginBottom: 30,
        },
        android: {
            // Grid
            gridColumns: 5,
            gridRows: 6,
            gridGapRow: 48,
            gridGapCol: 0,
            gridPaddingTop: 150,
            gridPaddingHorizontal: 24,

            // Icons
            iconSize: 165,
            iconRadius: 82.5, // Circular
            iconLabelSize: 30,
            iconLabelColor: "#FFFFFF",
            iconLabelGap: 15,

            // Folders
            folderBackdrop: "rgba(255,255,255,0.15)",
            folderBlur: "20px",
            folderPreviewGap: 12,
            folderMiniIconRadius: 0.5,

            // Dock (Android usually simpler / just icons)
            dockHeight: 240,
            dockRadius: 0, // No dock background conventionally
            dockBottom: 30,
            dockWidth: "100%",
            dockBackdrop: "transparent",
            dockBlur: "0px",
            dockIconSize: 165,

            // Page Dots
            dotSize: 18,
            dotGap: 24,
            dotActiveColor: "#FFFFFF",
            dotInactiveColor: "rgba(255,255,255,0.4)",
            dotMarginBottom: 45,
        }
    }
};

// =============================================================================
// EXPORT CONFIG GETTER
// =============================================================================

export function getAppConfig<T extends keyof typeof appConfigs>(
    app: T,
    platform: Platform
): typeof appConfigs[T][Platform] {
    const config = appConfigs[app];
    return (config as any)[platform] || (config as any).ios;
}
````

## File: packages/devices/src/index.ts
````typescript
export * from "./types";
export * from "./iphone16/profile";
export * from "./iphone16/Frame";
export * from "./pixel/profile";
export * from "./pixel/Frame";
export * from "./reducer";
export * from "./StatusBar";

// Device profile registry for dynamic lookup
import { DeviceProfile } from "./types";
import { iPhone16Profile } from "./iphone16/profile";
import { PixelProfile } from "./pixel/profile";

const deviceProfileRegistry: Record<string, DeviceProfile> = {
    "iphone16": iPhone16Profile,
    "pixel": PixelProfile,
    "pixel9": PixelProfile,
};

/**
 * Get device profile by ID
 * @param profileId - Device profile ID (e.g., "iphone16", "pixel")
 * @returns DeviceProfile or default iPhone16Profile if not found
 */
export function getDeviceProfile(profileId: string): DeviceProfile {
    return deviceProfileRegistry[profileId] || iPhone16Profile;
}
````

## File: packages/devices/src/reducer.ts
````typescript
import { produce } from "immer";
import { TimelineEvent, DeviceState } from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

/**
 * Device Reducer
 * Handles all DEVICE events: lock/unlock, app open/close, notifications, calls, home screen
 */
export function deviceReducer(devices: Record<string, DeviceState>, event: TimelineEvent): Record<string, DeviceState> {
    return produce(devices, draft => {
        if (event.kind !== "DEVICE") return;

        const device = draft[event.deviceId];
        if (!device) return;

        switch (event.type) {
            // --- Lock/Unlock ---
            case "LOCK":
                device.isLocked = true;
                break;
            case "UNLOCK":
                device.isLocked = false;
                break;

            // --- App Management ---
            case "OPEN_APP":
                device.foregroundAppId = event.appId;
                break;
            case "CLOSE_APP":
                device.foregroundAppId = undefined;
                break;
            case "GO_HOME":
                device.foregroundAppId = undefined;
                break;

            // --- Badge ---
            case "SET_BADGE":
                if (device.homeScreen) {
                    // Update badge in dock
                    const dockIcon = device.homeScreen.dock.find(a => a.appId === event.appId);
                    if (dockIcon) {
                        dockIcon.badge = event.count > 0 ? event.count : undefined;
                    }
                    // Update badge in pages
                    device.homeScreen.pages.forEach(page => {
                        page.apps.forEach(item => {
                            if ('appId' in item && item.appId === event.appId) {
                                item.badge = event.count > 0 ? event.count : undefined;
                            }
                        });
                    });
                }
                break;

            // --- Notifications ---
            case "SHOW_NOTIFICATION":
                if (!device.notifications) device.notifications = [];
                device.notifications.push({
                    id: `notif_${event.at}_${event.appId}`,
                    appId: event.appId,
                    title: event.title,
                    body: event.body,
                    at: event.at,
                    mode: event.mode || "both",
                    icon: event.icon
                });
                break;

            case "DISMISS_NOTIFICATION":
                if (device.notifications) {
                    const notif = device.notifications.find(n => n.id === event.notificationId);
                    if (notif) {
                        notif.dismissedAt = event.at;
                    }
                }
                break;

            // --- Call Events ---
            case "INCOMING_CALL":
                device.call = {
                    status: "incoming",
                    callerId: event.callerId,
                    callerName: event.callerName,
                    callerAvatar: event.callerAvatar,
                    isVideo: event.isVideo || false,
                    startedAt: event.at
                };
                break;

            case "CALL_ANSWERED":
                if (device.call && device.call.status === "incoming") {
                    device.call.status = "active";
                }
                break;

            case "CALL_ENDED":
                if (device.call) {
                    device.call.status = "ended";
                    device.call.endedAt = event.at;
                }
                break;
        }
    });
}

// Register itself with the core engine
ReducerRegistry.registerDeviceReducer(deviceReducer);
````

## File: packages/episodes/src/examples/instagram-test.json
````json
{
    "initialWorld": {
        "devices": {
            "alice_phone": {
                "id": "alice_phone",
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
                        "from": "instagram_user",
                        "text": "Hey! Did you see my new post?",
                        "at": 0
                    }
                ]
            }
        },
        "appState": {
            "app_instagram": {
                "currentView": "feed",
                "feed": {
                    "posts": [
                        {
                            "id": "p1",
                            "username": "instagram_user",
                            "avatar": "https://i.pravatar.cc/150?u=instagram_user",
                            "image": "https://picsum.photos/seed/insta1/1080/1080",
                            "caption": "Living my best life! 🌟 #blessed",
                            "likes": 1234,
                            "comments": 42,
                            "liked": false,
                            "saved": false
                        },
                        {
                            "id": "p2",
                            "username": "travel_blogger",
                            "avatar": "https://i.pravatar.cc/150?u=travel",
                            "image": "https://picsum.photos/seed/insta2/1080/1080",
                            "caption": "Sunset vibes 🌅",
                            "likes": 890,
                            "comments": 12,
                            "liked": true,
                            "saved": true
                        }
                    ],
                    "scrollPosition": 0
                },
                "stories": {
                    "users": [
                        {
                            "username": "instagram_user",
                            "avatar": "https://i.pravatar.cc/150?u=instagram_user",
                            "hasUnseen": true,
                            "stories": [
                                {
                                    "id": "s1",
                                    "image": "https://picsum.photos/seed/story1/1080/1920",
                                    "seen": false
                                }
                            ]
                        },
                        {
                            "username": "friend_1",
                            "avatar": "https://i.pravatar.cc/150?u=friend1",
                            "hasUnseen": true,
                            "stories": [
                                {
                                    "id": "s2",
                                    "image": "https://picsum.photos/seed/story2/1080/1920",
                                    "seen": false
                                }
                            ]
                        }
                    ]
                },
                "notifications": {
                    "items": []
                }
            }
        },
        "camera": {
            "type": "APP_VIEW",
            "appId": "app_instagram"
        }
    },
    "events": [
        {
            "at": 30,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "stories"
            }
        },
        {
            "at": 60,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "feed"
            }
        },
        {
            "at": 90,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "explore"
            }
        },
        {
            "at": 120,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "reels"
            }
        },
        {
            "at": 150,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "notifications"
            }
        },
        {
            "at": 180,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "profile"
            }
        },
        {
            "at": 210,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "post"
            }
        },
        {
            "at": 240,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "CUSTOM",
            "name": "NAVIGATE",
            "payload": {
                "view": "dm"
            }
        },
        {
            "at": 260,
            "kind": "APP",
            "appId": "app_instagram",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "Wow, this app is huge!"
        }
    ]
}
````

## File: packages/episodes/src/examples/whatsapp-breakup-01.json
````json
{
    "meta": {
        "title": "WhatsApp Breakup Story - The End",
        "fps": 30,
        "durationInFrames": 900
    },
    "initialWorld": {
        "devices": {
            "main_phone": {
                "id": "main_phone",
                "profileId": "iphone16",
                "isLocked": true
            }
        },
        "conversations": {
            "conv_1": {
                "id": "conv_1",
                "type": "dm",
                "name": "Alex ❤️",
                "avatar": null,
                "messages": [
                    {
                        "id": "m1",
                        "from": "me",
                        "text": "Hey, are you free to talk?",
                        "type": "text",
                        "status": "read"
                    },
                    {
                        "id": "m2",
                        "from": "me",
                        "text": "There's something I need to tell you...",
                        "type": "text",
                        "status": "read"
                    }
                ],
                "typing": {}
            }
        },
        "appState": {},
        "camera": {
            "type": "APP_VIEW"
        }
    },
    "events": [
        {
            "at": 15,
            "kind": "DEVICE",
            "deviceId": "main_phone",
            "type": "UNLOCK"
        },
        {
            "at": 30,
            "kind": "DEVICE",
            "deviceId": "main_phone",
            "type": "OPEN_APP",
            "appId": "app_whatsapp"
        },
        {
            "at": 60,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 120,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 120,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "Yeah I'm here, what's going on?"
        },
        {
            "at": 150,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "You're scaring me..."
        },
        {
            "at": 180,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "I've been thinking a lot lately"
        },
        {
            "at": 210,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "About us. About where this is going."
        },
        {
            "at": 240,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 300,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 300,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "What do you mean? I thought everything was fine?"
        },
        {
            "at": 330,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "It's not you. It's really not."
        },
        {
            "at": 360,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "I just don't think I can do this anymore"
        },
        {
            "at": 390,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 420,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 420,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "Are you breaking up with me??"
        },
        {
            "at": 450,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "Over TEXT?!"
        },
        {
            "at": 480,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "I didn't know how else to say it"
        },
        {
            "at": 510,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "I'm sorry Alex. I really am."
        },
        {
            "at": 540,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 600,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 600,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "After 2 years? You're doing this over WhatsApp?"
        },
        {
            "at": 630,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "I gave you everything 😢"
        },
        {
            "at": 660,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "I know. And I'm grateful for every moment we had."
        },
        {
            "at": 690,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "me",
            "text": "But I need to focus on myself right now"
        },
        {
            "at": 720,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_START",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 780,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "TYPING_END",
            "conversationId": "conv_1",
            "from": "Alex ❤️"
        },
        {
            "at": 780,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "..."
        },
        {
            "at": 810,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "I hope you find what you're looking for"
        },
        {
            "at": 840,
            "kind": "APP",
            "appId": "app_whatsapp",
            "type": "MESSAGE_RECEIVED",
            "conversationId": "conv_1",
            "from": "Alex ❤️",
            "text": "Goodbye."
        }
    ]
}
````

## File: packages/renderer/src/MultiDeviceRenderer.tsx
````typescript
import React from "react";
import {
    WorldState,
    ViewLayoutMode,
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
    DeviceId,
    VideoConfig,
    DEFAULT_VIDEO_CONFIG,
} from "@tokovo/core";
import { TokovoRenderer } from "./TokovoRenderer";
import { AudioLayer } from "./AudioLayer";
import { getDeviceProfile } from "@tokovo/devices";

// Helper to get video config with defaults
const getVideoConfig = (world: WorldState): VideoConfig => ({
    ...DEFAULT_VIDEO_CONFIG,
    ...world.config,
    layout: {
        ...DEFAULT_VIDEO_CONFIG.layout,
        ...world.config?.layout,
    },
});

/**
 * MultiDeviceRenderer
 * 
 * Renders multiple devices based on the current ViewLayout mode.
 * Supports SINGLE, SPLIT_HORIZONTAL, SPLIT_VERTICAL, and PIP layouts.
 */
export const MultiDeviceRenderer: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    compositionWidth?: number;
    compositionHeight?: number;
}> = ({ world, t, debug = false, compositionWidth = 1080, compositionHeight = 1920 }) => {
    const layout = world.camera?.layout;

    if (!layout) {
        // Fallback to single device if no layout
        return (
            <>
                <AudioLayer world={world} t={t} />
                <SingleDeviceLayout
                    world={world}
                    t={t}
                    debug={debug}
                    deviceId={Object.keys(world.devices)[0]}
                    width={compositionWidth}
                    height={compositionHeight}
                />
            </>
        );
    }

    switch (layout.mode) {
        case "SINGLE":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SingleDeviceLayout
                        world={world}
                        t={t}
                        debug={debug}
                        deviceId={layout.primaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        case "SPLIT_HORIZONTAL":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SplitHorizontalLayout
                        world={world}
                        t={t}
                        debug={debug}
                        primaryDeviceId={layout.primaryDeviceId}
                        secondaryDeviceId={layout.secondaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        case "SPLIT_VERTICAL":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SplitVerticalLayout
                        world={world}
                        t={t}
                        debug={debug}
                        primaryDeviceId={layout.primaryDeviceId}
                        secondaryDeviceId={layout.secondaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        case "PIP":
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <PIPLayout
                        world={world}
                        t={t}
                        debug={debug}
                        primaryDeviceId={layout.primaryDeviceId}
                        secondaryDeviceId={layout.secondaryDeviceId}
                        pipPosition={layout.pipPosition || "bottom-right"}
                        pipScale={layout.pipScale || 0.3}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );

        default:
            return (
                <>
                    <AudioLayer world={world} t={t} />
                    <SingleDeviceLayout
                        world={world}
                        t={t}
                        debug={debug}
                        deviceId={layout.primaryDeviceId}
                        width={compositionWidth}
                        height={compositionHeight}
                    />
                </>
            );
    }
};

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

interface LayoutProps {
    world: WorldState;
    t: number;
    debug?: boolean;
    width: number;
    height: number;
}

/**
 * SingleDeviceLayout - One device fills the entire frame
 */
const SingleDeviceLayout: React.FC<LayoutProps & { deviceId: string }> = ({
    world,
    t,
    debug,
    deviceId,
    width,
    height,
}) => {
    const device = world.devices[deviceId];
    if (!device) {
        return <div style={{ width, height, background: "#1a1a2e" }} />;
    }

    const profile = getDeviceProfile(device.profileId);
    const scaleX = width / profile.dimensions.width;
    const scaleY = height / profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    return (
        <div
            style={{
                width,
                height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: getVideoConfig(world).backgroundColor,
                overflow: "hidden",
            }}
        >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer world={world} t={t} debug={debug} focusDeviceId={deviceId} />
            </div>
        </div>
    );
};

/**
 * SplitHorizontalLayout - Two devices side by side
 * ┌─────────┬─────────┐
 * │  Left   │  Right  │
 * │  (50%)  │  (50%)  │
 * └─────────┴─────────┘
 */
const SplitHorizontalLayout: React.FC<
    LayoutProps & { primaryDeviceId: string; secondaryDeviceId?: string }
> = ({ world, t, debug, primaryDeviceId, secondaryDeviceId, width, height }) => {
    const halfWidth = width / 2;

    return (
        <div
            style={{
                width,
                height,
                display: "flex",
                flexDirection: "row",
                background: "#0a0a1a",
                overflow: "hidden",
            }}
        >
            {/* Left - Primary Device */}
            <DevicePane
                world={world}
                t={t}
                debug={debug}
                deviceId={primaryDeviceId}
                paneWidth={halfWidth}
                paneHeight={height}
            />

            {/* Divider */}
            <div style={{ width: getVideoConfig(world).layout?.splitLineWidth || 2, background: getVideoConfig(world).layout?.splitLineColor || "#333" }} />

            {/* Right - Secondary Device */}
            {secondaryDeviceId && (
                <DevicePane
                    world={world}
                    t={t}
                    debug={debug}
                    deviceId={secondaryDeviceId}
                    paneWidth={halfWidth - 2}
                    paneHeight={height}
                />
            )}
        </div>
    );
};

/**
 * SplitVerticalLayout - Two devices stacked top/bottom
 * ┌─────────────────┐
 * │      Top        │
 * │     (50%)       │
 * ├─────────────────┤
 * │     Bottom      │
 * │     (50%)       │
 * └─────────────────┘
 */
const SplitVerticalLayout: React.FC<
    LayoutProps & { primaryDeviceId: string; secondaryDeviceId?: string }
> = ({ world, t, debug, primaryDeviceId, secondaryDeviceId, width, height }) => {
    const halfHeight = height / 2;

    return (
        <div
            style={{
                width,
                height,
                display: "flex",
                flexDirection: "column",
                background: getVideoConfig(world).backgroundColor,
                overflow: "hidden",
            }}
        >
            {/* Top - Primary Device */}
            <DevicePane
                world={world}
                t={t}
                debug={debug}
                deviceId={primaryDeviceId}
                paneWidth={width}
                paneHeight={halfHeight}
            />

            {/* Divider */}
            <div style={{ height: getVideoConfig(world).layout?.splitLineWidth || 2, background: getVideoConfig(world).layout?.splitLineColor || "#333" }} />

            {/* Bottom - Secondary Device */}
            {secondaryDeviceId && (
                <DevicePane
                    world={world}
                    t={t}
                    debug={debug}
                    deviceId={secondaryDeviceId}
                    paneWidth={width}
                    paneHeight={halfHeight - 2}
                />
            )}
        </div>
    );
};

/**
 * PIPLayout - Picture in Picture (main device + small overlay)
 * ┌─────────────────┐
 * │           ┌───┐ │
 * │   Main    │PIP│ │
 * │           └───┘ │
 * │                 │
 * └─────────────────┘
 */
const PIPLayout: React.FC<
    LayoutProps & {
        primaryDeviceId: string;
        secondaryDeviceId?: string;
        pipPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        pipScale: number;
    }
> = ({ world, t, debug, primaryDeviceId, secondaryDeviceId, pipPosition, pipScale, width, height }) => {
    // PIP window size
    const pipWidth = width * pipScale;
    const pipHeight = height * pipScale;
    const margin = 20;

    // Position based on pipPosition
    const pipStyle: React.CSSProperties = {
        position: "absolute",
        width: pipWidth,
        height: pipHeight,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        border: "2px solid rgba(255,255,255,0.1)",
    };

    switch (pipPosition) {
        case "top-left":
            pipStyle.top = margin;
            pipStyle.left = margin;
            break;
        case "top-right":
            pipStyle.top = margin;
            pipStyle.right = margin;
            break;
        case "bottom-left":
            pipStyle.bottom = margin;
            pipStyle.left = margin;
            break;
        case "bottom-right":
        default:
            pipStyle.bottom = margin;
            pipStyle.right = margin;
            break;
    }

    return (
        <div
            style={{
                width,
                height,
                position: "relative",
                background: getVideoConfig(world).backgroundColor,
                overflow: "hidden",
            }}
        >
            {/* Main device (full frame) */}
            <SingleDeviceLayout
                world={world}
                t={t}
                debug={debug}
                deviceId={primaryDeviceId}
                width={width}
                height={height}
            />

            {/* PIP overlay */}
            {secondaryDeviceId && (
                <div style={pipStyle}>
                    <DevicePaneFit
                        world={world}
                        t={t}
                        debug={false} // No debug overlay on PIP
                        deviceId={secondaryDeviceId}
                        paneWidth={pipWidth}
                        paneHeight={pipHeight}
                    />
                </div>
            )}
        </div>
    );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * DevicePane - Renders a device within a specific pane size
 * Used for split layouts
 */
const DevicePane: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    deviceId: string;
    paneWidth: number;
    paneHeight: number;
}> = ({ world, t, debug, deviceId, paneWidth, paneHeight }) => {
    const device = world.devices[deviceId];
    if (!device) {
        return (
            <div
                style={{
                    width: paneWidth,
                    height: paneHeight,
                    background: "#1a1a2e",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#666",
                }}
            >
                Device not found
            </div>
        );
    }

    const profile = getDeviceProfile(device.profileId);
    const scaleX = paneWidth / profile.dimensions.width;
    const scaleY = paneHeight / profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding

    // Create a world view focused on this specific device
    const deviceWorld: WorldState = {
        ...world,
        camera: {
            ...world.camera,
            activeDeviceId: deviceId,
            layout: { mode: "SINGLE", primaryDeviceId: deviceId },
        },
    };

    return (
        <div
            style={{
                width: paneWidth,
                height: paneHeight,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0d0d1a",
                overflow: "hidden",
            }}
        >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer world={deviceWorld} t={t} debug={debug} focusDeviceId={deviceId} />
            </div>
        </div>
    );
};

/**
 * DevicePaneFit - Renders a device to fit exactly within pane (for PIP)
 * Fills the entire pane without padding
 */
const DevicePaneFit: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    deviceId: string;
    paneWidth: number;
    paneHeight: number;
}> = ({ world, t, debug, deviceId, paneWidth, paneHeight }) => {
    const device = world.devices[deviceId];
    if (!device) {
        return <div style={{ width: paneWidth, height: paneHeight, background: "#1a1a2e" }} />;
    }

    const profile = getDeviceProfile(device.profileId);
    const scaleX = paneWidth / profile.dimensions.width;
    const scaleY = paneHeight / profile.dimensions.height;
    const scale = Math.min(scaleX, scaleY);

    // Create a world view focused on this specific device
    const deviceWorld: WorldState = {
        ...world,
        camera: {
            ...world.camera,
            activeDeviceId: deviceId,
            layout: { mode: "SINGLE", primaryDeviceId: deviceId },
        },
    };

    return (
        <div
            style={{
                width: paneWidth,
                height: paneHeight,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0d0d1a",
                overflow: "hidden",
            }}
        >
            <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
                <TokovoRenderer world={deviceWorld} t={t} debug={debug} focusDeviceId={deviceId} />
            </div>
        </div>
    );
};
````

## File: apps/video-runner/src/Video.tsx
````typescript
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
````

## File: packages/apps-instagram/src/views/dm/InstagramChatView.tsx
````typescript
import React from "react";
import { WorldState } from "@tokovo/core";
import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";

// ============================================================================
// AUTHENTIC INSTAGRAM DM ICONS (Pixel-Perfect SVG Replicas)
// ============================================================================

const ChevronLeftIcon = () => (
    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="78" height="60" viewBox="0 0 26 20" fill="none">
        <rect x="1" y="3" width="17" height="14" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M18 8L25 4V16L18 12V8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

const InfoIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.8" />
        <path d="M11 6V6.01M11 10V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const CameraCircleIcon = () => (
    <svg width="78" height="78" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12.5" fill="#0095F6" />
        <path d="M8 11C8 10.4 8.4 10 9 10H10.5L11.5 8.5H14.5L15.5 10H17C17.6 10 18 10.4 18 11V17C18 17.6 17.6 18 17 18H9C8.4 18 8 17.6 8 17V11Z" fill="white" />
        <circle cx="13" cy="13.5" r="2" fill="#0095F6" />
    </svg>
);

const MicrophoneIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <rect x="8" y="4" width="6" height="9" rx="3" stroke="white" strokeWidth="1.5" />
        <path d="M6 11V12C6 14.8 8.2 17 11 17C13.8 17 16 14.8 16 12V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 17V20M9 20H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const ImageIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="14" rx="2" stroke="white" strokeWidth="1.5" />
        <circle cx="8" cy="9" r="1.5" stroke="white" strokeWidth="1" />
        <path d="M3 15L8 11L12 15L16 11L19 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StickerIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" />
        <path d="M7 13C7.8 15 9.2 16 11 16C12.8 16 14.2 15 15 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="9" r="1" fill="white" />
        <circle cx="14" cy="9" r="1" fill="white" />
    </svg>
);

const HeartIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <path d="M11 18L10.4 17.5C6 13.5 3 10.8 3 7.5C3 4.9 5 3 7.5 3C8.9 3 10.3 3.7 11 4.8C11.7 3.7 13.1 3 14.5 3C17 3 19 4.9 19 7.5C19 10.8 16 13.5 11.6 17.5L11 18Z" stroke="white" strokeWidth="1.5" />
    </svg>
);

// ============================================================================
// HEADER COMPONENT - Authentic Instagram DM Navigation
// ============================================================================

interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    isActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ contactName, avatarUrl, isActive = true }) => (
    <div style={{
        height: 180,
        display: "flex",
        alignItems: "center",
        padding: "0 42px",
        marginTop: 144, // Below dynamic island
        zIndex: 10
    }}>
        {/* Back button */}
        <ChevronLeftIcon />

        {/* Avatar + Name Group */}
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            marginLeft: 36,
            gap: 30
        }}>
            {/* Avatar with active indicator */}
            <div style={{ position: "relative" }}>
                <div style={{
                    width: 102,
                    height: 102,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 42,
                    fontWeight: "600"
                }}>
                    {!avatarUrl && contactName.charAt(0).toUpperCase()}
                </div>
                {isActive && (
                    <div style={{
                        position: "absolute",
                        bottom: 3,
                        right: 3,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: "#44D62D",
                        border: "4px solid #000"
                    }} />
                )}
            </div>

            {/* Username + Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{
                    fontSize: 48,
                    fontWeight: "600",
                    color: "white",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                }}>
                    {contactName}
                </span>
                <span style={{
                    fontSize: 36,
                    color: "#A8A8A8",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {isActive ? "Active now" : "Active 2h ago"}
                </span>
            </div>
        </div>

        {/* Action icons */}
        <div style={{ display: "flex", gap: 54, alignItems: "center" }}>
            <VideoCallIcon />
            <InfoIcon />
        </div>
    </div>
);

// ============================================================================
// MESSAGE BUBBLE - Authentic Instagram DM Styling with Gradient
// ============================================================================

interface MessageBubbleProps {
    msg: { id: string; from: string; text: string };
    layout: ChatMessageLayout;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 42,
            right: isMe ? 42 : "auto",
            maxWidth: "70%",
            opacity,
            transform: `translateY(${translateY}px)`,
        }}>
            <div style={{
                // Instagram gradient for sent messages
                background: isMe
                    ? "linear-gradient(to right, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)"
                    : "#262626",
                color: "white",
                padding: "30px 42px",
                borderRadius: 66, // Fully pill-shaped
                fontSize: 48,
                lineHeight: "60px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                wordWrap: "break-word"
            }}>
                {msg.text}
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGE LIST
// ============================================================================

interface MessageListProps {
    messages: any[];
    layout?: ChatLayoutState;
}

const MessageList: React.FC<MessageListProps> = ({ messages, layout }) => {
    const chatLayout = layout?.kind === "CHAT" ? (layout as ChatLayoutState) : null;
    const scrollY = chatLayout?.scrollY || 0;
    const contentHeight = chatLayout?.contentHeight || "100%";

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: contentHeight,
                transform: `translateY(-${scrollY}px)`,
                paddingTop: 30,
                paddingBottom: 30
            }}>
                {messages.map((msg: any) => {
                    const msgLayout = chatLayout?.messageLayouts[msg.id];
                    if (!msgLayout) return null;
                    return <MessageBubble key={msg.id} msg={msg} layout={msgLayout} />;
                })}
            </div>
        </div>
    );
};

// ============================================================================
// INPUT AREA - Authentic Instagram DM Composer
// ============================================================================

interface InputAreaProps {
    text?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ text }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "24px 42px",
        gap: 24
    }}>
        {/* Input container */}
        <div style={{
            flex: 1,
            minHeight: 132,
            backgroundColor: "#262626",
            borderRadius: 66,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 18,
            border: "1px solid #363636"
        }}>
            {/* Camera button */}
            <CameraCircleIcon />

            {/* Input text */}
            <div style={{
                flex: 1,
                fontSize: 48,
                color: text ? "white" : "#A8A8A8",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                padding: "0 12px"
            }}>
                {text || "Message..."}
            </div>

            {/* Right icons - hidden when typing */}
            {!text && (
                <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                    <MicrophoneIcon />
                    <ImageIcon />
                    <StickerIcon />
                </div>
            )}
        </div>

        {/* Heart or Send button */}
        {text ? (
            <span style={{
                color: "#0095F6",
                fontSize: 48,
                fontWeight: 600,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                Send
            </span>
        ) : (
            <HeartIcon />
        )}
    </div>
);

// ============================================================================
// HOME INDICATOR
// ============================================================================

const HomeIndicator: React.FC = () => (
    <div style={{
        height: 102,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingBottom: 24
    }}>
        <div style={{
            width: 402,
            height: 15,
            backgroundColor: "white",
            borderRadius: 9,
            opacity: 0.4
        }} />
    </div>
);

// ============================================================================
// MAIN VIEW EXPORT
// ============================================================================

export const InstagramChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    return (
        <div style={{
            backgroundColor: "#000000",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: "white",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            <Header contactName="sarah.design" isActive={true} />
            <MessageList messages={messages} layout={layout} />
            <InputArea />
            <HomeIndicator />
        </div>
    );
};
````

## File: packages/episodes/src/schema.ts
````typescript
import { z } from "zod";

// --- App Icon & Home Screen ---
export const AppIconSchema = z.object({
    appId: z.string(),
    label: z.string(),
    icon: z.string(),
    badge: z.number().optional()
});

export const AppFolderSchema = z.object({
    type: z.literal("folder"),
    name: z.string(),
    apps: z.array(AppIconSchema)
});

export const HomeScreenPageSchema = z.object({
    apps: z.array(z.union([AppIconSchema, AppFolderSchema]))
});

export const HomeScreenConfigSchema = z.object({
    wallpaper: z.string().optional(),
    pages: z.array(HomeScreenPageSchema),
    dock: z.array(AppIconSchema)
});

// --- Device Events ---
export const DeviceEventSchema = z.discriminatedUnion("type", [
    // Lock/Unlock
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.enum(["LOCK", "UNLOCK"])
    }),
    // Open/Close App
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.enum(["OPEN_APP", "CLOSE_APP"]),
        appId: z.string()
    }),
    // Go Home
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("GO_HOME")
    }),
    // Set Badge
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("SET_BADGE"),
        appId: z.string(),
        count: z.number()
    }),
    // Show notification
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("SHOW_NOTIFICATION"),
        appId: z.string(),
        title: z.string(),
        body: z.string(),
        mode: z.enum(["lockscreen", "headsup", "both"]).optional(),
        icon: z.string().optional()
    }),
    // Dismiss notification
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("DISMISS_NOTIFICATION"),
        notificationId: z.string()
    }),
    // Incoming call
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("INCOMING_CALL"),
        callerId: z.string(),
        callerName: z.string(),
        callerAvatar: z.string().optional(),
        isVideo: z.boolean().optional()
    }),
    // Call answered
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("CALL_ANSWERED")
    }),
    // Call ended
    z.object({
        at: z.number(),
        kind: z.literal("DEVICE"),
        deviceId: z.string(),
        type: z.literal("CALL_ENDED")
    })
]);

// --- App Events ---
export const AppEventSchema = z.discriminatedUnion("type", [
    // Message events
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("MESSAGE_RECEIVED"),
        conversationId: z.string(),
        from: z.string(),
        text: z.string().optional()
    }),
    // Typing
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.enum(["TYPING_START", "TYPING_END"]),
        conversationId: z.string(),
        from: z.string()
    }),
    // Voice message
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("VOICE_MESSAGE_RECEIVED"),
        conversationId: z.string(),
        from: z.string(),
        duration: z.number()
    }),
    // Message read
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("MESSAGE_READ"),
        conversationId: z.string(),
        messageId: z.string()
    }),
    // Group events
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("GROUP_MEMBER_ADDED"),
        conversationId: z.string(),
        memberId: z.string(),
        memberName: z.string(),
        addedBy: z.string()
    }),
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("GROUP_MEMBER_REMOVED"),
        conversationId: z.string(),
        memberId: z.string(),
        memberName: z.string(),
        removedBy: z.string()
    }),
    // Custom event
    z.object({
        at: z.number(),
        kind: z.literal("APP"),
        appId: z.string(),
        type: z.literal("CUSTOM"),
        name: z.string(),
        payload: z.any().optional()
    })
]);

// --- Camera Events ---
export const CameraEventSchema = z.object({
    at: z.number(),
    kind: z.literal("CAMERA"),
    type: z.literal("SET_VIEW"),
    view: z.object({
        type: z.enum(["APP_VIEW", "TRANSITION"]),
        appId: z.string().optional()
    })
});

// --- Audio Events ---
export const AudioEventSchema = z.object({
    at: z.number(),
    kind: z.literal("AUDIO"),
    type: z.literal("PLAY_SOUND"),
    soundId: z.string(),
    volume: z.number().optional()
});

// --- Combined Timeline Event ---
export const TimelineEventSchema = z.union([
    DeviceEventSchema,
    AppEventSchema,
    CameraEventSchema,
    AudioEventSchema
]);

// --- Message Schema ---
export const MessageSchema = z.object({
    id: z.string(),
    from: z.string(),
    text: z.string().optional(),
    type: z.enum(["text", "image", "voice", "system"]).optional(),
    at: z.number().optional(),
    status: z.enum(["sending", "sent", "delivered", "read"]).optional(),
    // System message fields
    systemType: z.enum(["member_added", "member_removed", "admin_change", "group_created"]).optional(),
    targetMember: z.string().optional(),
    actorName: z.string().optional(),
    // Voice message fields
    duration: z.number().optional(),
    isPlaying: z.boolean().optional(),
    playProgress: z.number().optional()
});

// --- Group Member Schema ---
export const GroupMemberSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    phone: z.string().optional()
});

// --- Conversation Schema ---
export const ConversationStateSchema = z.object({
    id: z.string(),
    type: z.enum(["dm", "group"]).optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    members: z.array(GroupMemberSchema).optional(),
    admins: z.array(z.string()).optional(),
    messages: z.array(MessageSchema),
    typing: z.record(z.boolean()).optional()
});

// --- Notification Schema ---
export const NotificationSchema = z.object({
    id: z.string(),
    appId: z.string(),
    title: z.string(),
    body: z.string(),
    at: z.number(),
    dismissedAt: z.number().optional(),
    mode: z.enum(["lockscreen", "headsup", "both"]).optional(),
    icon: z.string().optional()
});

// --- Call State Schema ---
export const CallStateSchema = z.object({
    status: z.enum(["incoming", "active", "ended"]),
    callerId: z.string(),
    callerName: z.string(),
    callerAvatar: z.string().optional(),
    isVideo: z.boolean().optional(),
    startedAt: z.number().optional(),
    endedAt: z.number().optional()
});

// --- Device State Schema ---
export const DeviceStateSchema = z.object({
    id: z.string(),
    profileId: z.string(),
    isLocked: z.boolean(),
    foregroundAppId: z.string().optional(),
    notifications: z.array(NotificationSchema).optional(),
    call: CallStateSchema.optional(),
    homeScreen: HomeScreenConfigSchema.optional()
});

// --- Camera View Schema ---
export const CameraViewSchema = z.object({
    type: z.enum(["APP_VIEW", "TRANSITION"]),
    appId: z.string().optional()
});

// --- Episode Meta Schema ---
export const EpisodeMetaSchema = z.object({
    title: z.string().optional(),
    fps: z.number().optional(),
    durationInFrames: z.number().optional()
}).optional();

// --- Episode Schema ---
export const EpisodeSchema = z.object({
    meta: EpisodeMetaSchema,
    initialWorld: z.object({
        devices: z.record(DeviceStateSchema),
        conversations: z.record(ConversationStateSchema),
        appState: z.record(z.any()).optional(),
        camera: CameraViewSchema
    }),
    events: z.array(TimelineEventSchema)
});

// Type exports
export type Episode = z.infer<typeof EpisodeSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type DeviceState = z.infer<typeof DeviceStateSchema>;
export type ConversationState = z.infer<typeof ConversationStateSchema>;
export type Message = z.infer<typeof MessageSchema>;
````

## File: packages/renderer/src/layout/strategies/chat.ts
````typescript
import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout } from "../types";

// Constants for rect calculation (match WhatsApp UI)
const BUBBLE_MARGIN_HORIZONTAL = 36;
const BUBBLE_MAX_WIDTH_PERCENT = 0.78;
const TYPING_BUBBLE_WIDTH = 150;

export function computeChatLayout(ctx: LayoutContext): ChatLayoutState {
    const { world, t, activeConversationId, config, viewportHeight, viewportWidth } = ctx;
    const chatConfig = config!.chat!;

    if (!activeConversationId || !world.conversations[activeConversationId]) {
        return {
            kind: "CHAT",
            scrollY: 0,
            contentHeight: 0,
            isAtBottom: true,
            messageLayouts: {},
            meta: {}
        };
    }

    const conversation = world.conversations[activeConversationId];
    // Filter messages visible at time t
    // Messages without 'at' field (initial messages) are always visible
    // Messages with 'at' field are visible when at <= t
    const messages = conversation.messages.filter(m => m.at === undefined || m.at <= t);

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    let currentY = chatConfig.topPadding;
    let lastMessageId: string | undefined;

    // 1. Layout messages
    for (const msg of messages) {
        // Calculate height based on message type
        let height: number;
        let bubbleWidth: number;

        if (msg.type === "system") {
            // System messages are shorter (single line centered pill)
            height = 80;
            bubbleWidth = viewportWidth * 0.6; // Centered system message
        } else if (msg.type === "voice") {
            // Voice messages have fixed height
            height = 180;
            bubbleWidth = 450; // Fixed voice message width
        } else {
            // Text messages: calculate based on text length
            const textLength = msg.text?.length || 0;
            const lines = Math.ceil(Math.max(1, textLength) / chatConfig.charsPerLine);

            // Height breakdown:
            // - Top/bottom padding: 24px each = 48px (at 3x = 144)
            // - Text: lines * lineHeight
            // - Timestamp row: ~40px (at 3x = 120)
            // - Sender name (groups): additional 50px
            const basepadding = 48;         // Top + bottom padding (16px each at 3x)
            const timestampHeight = 40;     // Timestamp row
            const hasSenderName = msg.from && msg.from !== "me" && msg.from !== "system";
            const senderNameHeight = hasSenderName ? 45 : 0;

            height = basepadding + (lines * chatConfig.lineHeight) + timestampHeight + senderNameHeight;

            // Width: Use same line-wrap logic as height
            // Width based on actual content lines, not raw length
            const avgCharWidth = 14; // Approximate at 3x scale
            const maxCharsOnLine = Math.min(textLength, chatConfig.charsPerLine);
            const textWidth = maxCharsOnLine * avgCharWidth + 72; // + padding
            bubbleWidth = Math.min(viewportWidth * BUBBLE_MAX_WIDTH_PERCENT, Math.max(textWidth, 150));
        }

        // Animation: Slide in / Fade in
        const messageAt = msg.at ?? 0;
        const timeSinceAppear = t - messageAt;
        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear >= 0 && timeSinceAppear < chatConfig.messageAppearDuration) {
            const progress = timeSinceAppear / chatConfig.messageAppearDuration;
            // Simple ease-out
            const ease = 1 - Math.pow(1 - progress, 3);
            opacity = ease;
            translateY = chatConfig.messageAppearOffset * (1 - ease);
        }

        // Compute rect for director targeting
        const isMe = msg.from === "me";
        const rectX = isMe
            ? viewportWidth - BUBBLE_MARGIN_HORIZONTAL - bubbleWidth
            : BUBBLE_MARGIN_HORIZONTAL;

        messageLayouts[msg.id] = {
            id: msg.id,
            y: currentY,
            height,
            opacity,
            translateY,
            rect: {
                x: rectX,
                y: currentY,
                width: bubbleWidth,
                height,
            },
        };

        lastMessageId = msg.id;
        currentY += height + chatConfig.verticalGap;
    }

    // 2. Typing indicator
    let typingLayout: TypingLayout | null = null;
    const isTyping = Object.values(conversation.typing || {}).some(v => v);
    if (isTyping) {
        const height = chatConfig.baseBubbleHeight;
        typingLayout = {
            y: currentY,
            height,
            opacity: 1,
            rect: {
                x: BUBBLE_MARGIN_HORIZONTAL,
                y: currentY,
                width: TYPING_BUBBLE_WIDTH,
                height,
            },
        };
        currentY += height + chatConfig.verticalGap;
    }

    const contentHeight = currentY + chatConfig.bottomPadding;

    // 3. Scroll Position
    // Lock to bottom logic
    let scrollY = 0;
    if (chatConfig.lockToBottom) {
        const maxScroll = Math.max(0, contentHeight - viewportHeight);
        scrollY = maxScroll;

        // TODO: Implement smooth scrolling based on message arrival times if needed
        // For now, instant snap to bottom is robust
    }

    return {
        kind: "CHAT",
        scrollY,
        contentHeight,
        isAtBottom: Math.abs(scrollY - (contentHeight - viewportHeight)) < 10,
        messageLayouts,
        typingLayout,
        meta: {
            lastMessageId
        }
    };
}
````

## File: packages/apps-whatsapp/src/runtime.ts
````typescript
/**
 * WhatsApp Runtime Reducer
 * 
 * Handles all WhatsApp-specific events.
 * Uses explicit type checking for safer event handling.
 */

import {
    TimelineEvent,
    WorldState,
    ReducerRegistry,
    APP_IDS
} from "@tokovo/core";

/**
 * WhatsApp reducer - handles all WhatsApp events
 */
export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
    // Only handle APP events for WhatsApp
    if (event.kind !== "APP") return;

    // Type assertion for APP events
    const appEvent = event as TimelineEvent & {
        appId: string;
        conversationId?: string;
        from?: string;
        text?: string;
        message?: {
            id?: string;
            type?: string;
            text?: string;
            status?: string;
            timestamp?: string;
            imageUrl?: string;
        };
        memberId?: string;
        memberName?: string;
        addedBy?: string;
        removedBy?: string;
        duration?: number;
        messageId?: string;
    };

    if (appEvent.appId !== APP_IDS.WHATSAPP) return;

    // Get conversation ID from event
    const conversationId = appEvent.conversationId;
    if (!conversationId) return;

    // Ensure conversation exists
    if (!draft.conversations[conversationId]) {
        draft.conversations[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

    switch (event.type) {
        case "MESSAGE_RECEIVED": {
            const msgPayload = appEvent.message || {};
            conversation.messages.push({
                ...msgPayload,
                id: msgPayload.id || `msg_${event.at}_${appEvent.from}`,
                from: appEvent.from || "unknown",
                text: appEvent.text || msgPayload.text,
                type: (msgPayload.type as "text" | "image" | "voice" | "system") || "text",
                at: event.at,
                status: (msgPayload.status as "sending" | "sent" | "delivered" | "read") || "delivered",
            });
            break;
        }

        case "TYPING_START": {
            if (!conversation.typing) conversation.typing = {};
            if (appEvent.from) {
                conversation.typing[appEvent.from] = true;
            }
            break;
        }

        case "TYPING_END": {
            if (conversation.typing && appEvent.from) {
                delete conversation.typing[appEvent.from];
            }
            break;
        }

        case "GROUP_MEMBER_ADDED": {
            const addedBy = appEvent.addedBy === "me" ? "You" : appEvent.addedBy;
            conversation.messages.push({
                id: `sys_${event.at}_added_${appEvent.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_added",
                text: `${addedBy} added ${appEvent.memberName}`,
                targetMember: appEvent.memberName,
                actorName: addedBy,
                at: event.at
            });
            if (!conversation.members) conversation.members = [];
            conversation.members.push({
                id: appEvent.memberId || "",
                name: appEvent.memberName || ""
            });
            break;
        }

        case "GROUP_MEMBER_REMOVED": {
            const removedBy = appEvent.removedBy === "me" ? "You" : appEvent.removedBy;
            conversation.messages.push({
                id: `sys_${event.at}_removed_${appEvent.memberId}`,
                from: "system",
                type: "system",
                systemType: "member_removed",
                text: `${removedBy} removed ${appEvent.memberName}`,
                targetMember: appEvent.memberName,
                actorName: removedBy,
                at: event.at
            });
            if (conversation.members) {
                conversation.members = conversation.members.filter(
                    (m: { id: string }) => m.id !== appEvent.memberId
                );
            }
            break;
        }

        case "VOICE_MESSAGE_RECEIVED": {
            conversation.messages.push({
                id: `voice_${event.at}_${appEvent.from}`,
                from: appEvent.from || "unknown",
                type: "voice",
                duration: appEvent.duration,
                at: event.at,
                status: "delivered"
            });
            break;
        }

        case "MESSAGE_READ": {
            if (appEvent.messageId) {
                const msg = conversation.messages.find(m => m.id === appEvent.messageId);
                if (msg) {
                    msg.status = "read";
                }
            }
            break;
        }
    }
}

// Register the reducer with the core engine
ReducerRegistry.registerAppReducer(APP_IDS.WHATSAPP, whatsappReducer);
````

## File: packages/core/src/engine.ts
````typescript
import { produce } from "immer";
import {
    TimelineEvent,
    WorldState,
    DeviceState,
    CameraState,
    ActiveCameraEffect,
    DEFAULT_CAMERA_STATE,
    DEFAULT_CAMERA_TRANSFORM,
    DEFAULT_AUDIO_STATE,
} from "./types";
import { CameraController, createActiveEffect } from "./camera";
import { TIMING } from "./constants";

export type DeviceReducer = (state: Record<string, DeviceState>, event: TimelineEvent) => Record<string, DeviceState>;
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;

/**
 * ReducerRegistry - Manages app and device reducers
 * 
 * This registry allows apps to self-register their event handlers.
 * The engine dispatches events to the appropriate registered reducers.
 */
class ReducerRegistryClass {
    private _deviceReducer: DeviceReducer | null = null;
    private _appReducers = new Map<string, AppReducer>();

    /**
     * Register a device reducer (handles DEVICE events)
     */
    registerDeviceReducer(reducer: DeviceReducer): void {
        this._deviceReducer = reducer;
    }

    /**
     * Register an app reducer (handles APP events for a specific appId)
     */
    registerAppReducer(appId: string, reducer: AppReducer): void {
        if (this._appReducers.has(appId)) {
            console.warn(`[ReducerRegistry] Overwriting reducer for ${appId}`);
        }
        this._appReducers.set(appId, reducer);
    }

    /**
     * Get the device reducer
     */
    get deviceReducer(): DeviceReducer | null {
        return this._deviceReducer;
    }

    /**
     * Get an app reducer by appId
     */
    getAppReducer(appId: string): AppReducer | undefined {
        return this._appReducers.get(appId);
    }

    /**
     * Check if an app reducer is registered
     */
    hasAppReducer(appId: string): boolean {
        return this._appReducers.has(appId);
    }

    /**
     * Get all registered app IDs
     */
    getRegisteredApps(): string[] {
        return Array.from(this._appReducers.keys());
    }

    // Legacy compatibility - access appReducers as object
    get appReducers(): Record<string, AppReducer> {
        return Object.fromEntries(this._appReducers);
    }
}

export const ReducerRegistry = new ReducerRegistryClass();

// Camera controller instance - uses FPS from constants
const cameraController = new CameraController(TIMING.FPS_DEFAULT);

/**
 * Process camera event and update camera state
 */
function processCameraEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "CAMERA" },
    eventIndex: number
): void {
    // Ensure camera state exists with all required properties
    if (!draft.camera || !draft.camera.activeEffects) {
        draft.camera = { ...DEFAULT_CAMERA_STATE };
    }
    // Ensure layout exists
    if (!draft.camera.layout) {
        draft.camera.layout = { mode: "SINGLE", primaryDeviceId: draft.camera.activeDeviceId || Object.keys(draft.devices)[0] || "main_phone" };
    }

    switch (event.type) {
        case "SET_VIEW":
            // Legacy support - just update base view
            draft.camera.baseView = event.view.type;
            draft.camera.appId = event.view.appId;
            break;

        case "CUT":
            // Hard cut - reset all effects
            draft.camera.activeEffects = [];
            draft.camera.transform = { ...DEFAULT_CAMERA_TRANSFORM };

            // Switch to new device if specified
            if (event.toDeviceId) {
                draft.camera.activeDeviceId = event.toDeviceId;
                draft.camera.layout.primaryDeviceId = event.toDeviceId;
            }

            // Update base view if specified
            if (event.toView) {
                draft.camera.baseView = event.toView === "app" ? "APP_VIEW" : "TRANSITION";
            }
            break;

        case "LAYOUT":
            // Change view layout mode
            draft.camera.layout = {
                mode: event.mode,
                primaryDeviceId: event.primaryDeviceId,
                secondaryDeviceId: event.secondaryDeviceId,
                pipPosition: event.pipPosition,
                pipScale: event.pipScale,
            };
            // Update active device to match primary
            draft.camera.activeDeviceId = event.primaryDeviceId;
            break;

        case "ZOOM":
        case "PAN":
        case "SHAKE":
        case "FOCUS":
        case "RESET": {
            // Create active effect and add to list
            const activeEffect = createActiveEffect(event, `effect_${eventIndex}_${event.at}`);
            if (activeEffect) {
                draft.camera.activeEffects.push(activeEffect);
            }
            break;
        }
    }
}

/**
 * Process audio event and update audio state
 */
function processAudioEvent(
    draft: WorldState,
    event: TimelineEvent & { kind: "AUDIO" },
    eventIndex: number
): void {
    // Ensure audio state exists
    if (!draft.audio) {
        draft.audio = { activeSounds: {} };
    }

    switch (event.type) {
        case "PLAY_SOUND": {
            // Generate instance ID if not provided
            const instanceId = event.instanceId || `sound_${eventIndex}_${event.at}`;

            draft.audio.activeSounds[instanceId] = {
                soundId: event.soundId,
                startFrame: event.at,
                volume: event.volume ?? 1,
                loop: event.loop ?? false,
                deviceId: event.deviceId,
                duration: event.duration,
            };
            break;
        }

        case "STOP_SOUND": {
            delete draft.audio.activeSounds[event.instanceId];
            break;
        }

        case "FADE_VOLUME": {
            const sound = draft.audio.activeSounds[event.instanceId];
            if (sound) {
                // Store target volume - renderer will interpolate
                (sound as any).fadeTarget = event.toVolume;
                (sound as any).fadeDuration = event.duration;
                (sound as any).fadeStartFrame = event.at;
            }
            break;
        }

        case "BACKGROUND_MUSIC": {
            draft.audio.backgroundMusic = {
                soundId: event.soundId,
                volume: event.volume ?? 0.5,
                loop: event.loop ?? true,
                startFrame: event.at,
            };
            break;
        }
    }
}
/**
 * Replay function - computes WorldState at time t by applying all events
 * 
 * This is called every frame by Remotion. Performance is critical.
 */
export function replay(initial: WorldState, events: TimelineEvent[], t: number): WorldState {
    if (!initial) {
        console.warn("[Engine] Replay called with undefined initial state");
        return {
            devices: {},
            conversations: {},
            appState: {},
            camera: { ...DEFAULT_CAMERA_STATE },
            audio: { ...DEFAULT_AUDIO_STATE }
        };
    }

    // Ensure initial state has proper camera and audio state
    const initialWithCamera: WorldState = {
        ...initial,
        camera: initial.camera && 'activeEffects' in initial.camera
            ? initial.camera
            : {
                ...DEFAULT_CAMERA_STATE,
                baseView: (initial.camera as any)?.type || "APP_VIEW",
                appId: (initial.camera as any)?.appId,
            },
        audio: initial.audio || { ...DEFAULT_AUDIO_STATE },
    };

    // Filter events up to current time
    const relevant = events.filter(e => e.at <= t);

    // Event handlers by kind (Strategy Pattern)
    const handleEvent = (draft: WorldState, event: TimelineEvent, index: number): void => {
        switch (event.kind) {
            case "DEVICE":
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
                break;
            case "APP":
                const reducer = ReducerRegistry.getAppReducer(event.appId);
                reducer?.(draft, event);
                break;
            case "CAMERA":
                processCameraEvent(draft, event, index);
                break;
            case "AUDIO":
                processAudioEvent(draft, event, index);
                break;
        }
    };

    // Apply events to build state
    const stateAfterEvents = relevant.reduce((state, event, index) => {
        return produce(state, draft => {
            handleEvent(draft, event, index);
        });
    }, initialWithCamera);

    // Compute camera transform at current time t
    // This filters active effects and composes them, per-device
    return produce(stateAfterEvents, draft => {
        // Clean up expired effects (optimization) - use constant
        draft.camera.activeEffects = draft.camera.activeEffects.filter(
            ae => t <= ae.endFrame + TIMING.EFFECT_CLEANUP_BUFFER
        );

        // Ensure deviceTransforms exists
        if (!draft.camera.deviceTransforms) {
            draft.camera.deviceTransforms = {};
        }

        // Compute transform for each device
        for (const deviceId of Object.keys(draft.devices)) {
            // Filter effects for this device (global effects + device-specific)
            const deviceEffects = draft.camera.activeEffects.filter(
                ae => !ae.deviceId || ae.deviceId === deviceId
            );

            // Create a temporary camera state with only this device's effects
            const deviceCameraState = {
                ...draft.camera,
                activeEffects: deviceEffects,
            };

            // Compute transform for this device
            draft.camera.deviceTransforms[deviceId] = cameraController.computeTransform(deviceCameraState, t);
        }

        // Primary device transform (for backward compatibility)
        const activeDeviceId = draft.camera.activeDeviceId || Object.keys(draft.devices)[0];
        draft.camera.transform = draft.camera.deviceTransforms[activeDeviceId] || cameraController.computeTransform(draft.camera, t);
    });
}

/**
 * Get default initial world state with camera
 */
export function createInitialWorld(partial: Partial<WorldState> = {}): WorldState {
    return {
        devices: {},
        conversations: {},
        appState: {},
        camera: { ...DEFAULT_CAMERA_STATE },
        audio: { ...DEFAULT_AUDIO_STATE },
        ...partial,
    };
}
````

## File: packages/renderer/src/DeviceFrame.tsx
````typescript
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
        <FrameComponent {...frameProps} statusBar={<StatusBar time="10:41" variant={variant} />}>
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

                    {/* Notifications are now handled by NotificationOverlay via layout system */}
                    <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Placeholder for future lock screen widgets if needed */}
                    </div>
                </div>
            )}
        </FrameComponent>
    );
};
````

## File: packages/core/src/index.ts
````typescript
export * from "./types";
export * from "./engine";
export * from "./tokens";
export * from "./camera";
export * from "./sounds";
export * from "./constants";
export * from "./typeGuards";
export * from "./eventUtils";
export * from "./plugin";
export * from "./transitions";
export * from "./director-lite";
````

## File: packages/episodes/src/index.ts
````typescript
import exampleEpisode from "./examples/whatsapp-breakup-01.json";
import androidEpisode from "./examples/android-test.json";
import instagramEpisode from "./examples/instagram-test.json";
import notificationCallDemo from "./examples/notification-call-demo.json";
import homeScreenGroupDemo from "./examples/homescreen-group-demo.json";
import whatsappPsychoticDemo from "./examples/whatsapp-psychotic-demo.json";
import cameraShowcase from "./examples/camera-showcase.json";
import multiPovDemo from "./examples/multi-pov-demo.json";

export * from "./schema";
export { exampleEpisode, androidEpisode, instagramEpisode, notificationCallDemo, homeScreenGroupDemo, whatsappPsychoticDemo, cameraShowcase, multiPovDemo };
````

## File: packages/renderer/src/index.ts
````typescript
export { TokovoRenderer } from "./TokovoRenderer";
export { DeviceFrame } from "./DeviceFrame";
export { computeLayout } from "./layout";
export type { LayoutState, ChatLayoutState, ChatMessageLayout } from "./layout/types";
export { VisualDebugger } from "./VisualDebugger";
export { NotificationOverlay } from "./NotificationOverlay";
export { HeadsUpNotification } from "./HeadsUpNotification";
export { CallOverlay } from "./CallOverlay";
export { LockscreenView } from "./LockscreenView";
export { HomeScreenView } from "./HomeScreenView";
export { MultiDeviceRenderer } from "./MultiDeviceRenderer";
export { AudioLayer } from "./AudioLayer";
export { UnlockTransition } from "./AppTransition";
export { AppRegistry } from "./registry";
export * from "./layout";
````

## File: packages/renderer/src/registry.ts
````typescript
/**
 * AppRegistry - Maps app IDs to their React view components
 * 
 * Apps self-register their components here.
 * The renderer uses this registry to display the correct app view.
 */

import React from "react";
import { WorldState, APP_IDS } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";
import { InstagramApp } from "@tokovo/apps-instagram";

import { LayoutState } from "./layout/types";

/**
 * Props that all app view components receive
 */
export interface AppViewProps {
    world: WorldState;
    t?: number;
    layout?: LayoutState;
    platform?: string;
    deviceId?: string;
}

/**
 * Type for app view components
 */
export type AppViewComponent = React.FC<AppViewProps>;

/**
 * AppRegistry class - manages app view components
 */
class AppRegistryClass {
    private _views = new Map<string, AppViewComponent>();

    constructor() {
        // Register built-in apps
        this.register(APP_IDS.WHATSAPP, WhatsappChatView as AppViewComponent);
        this.register(APP_IDS.INSTAGRAM, InstagramApp as AppViewComponent);
    }

    /**
     * Register an app view component
     */
    register(appId: string, component: AppViewComponent): void {
        if (this._views.has(appId)) {
            console.warn(`[AppRegistry] Overwriting view for ${appId}`);
        }
        this._views.set(appId, component);
    }

    /**
     * Get an app view component by ID
     */
    getView(appId: string): AppViewComponent | undefined {
        return this._views.get(appId);
    }

    /**
     * Check if an app view is registered
     */
    hasView(appId: string): boolean {
        return this._views.has(appId);
    }

    /**
     * Get all registered app IDs
     */
    getRegisteredApps(): string[] {
        return Array.from(this._views.keys());
    }

    // Legacy compatibility - access views as object
    get views(): Record<string, AppViewComponent> {
        return Object.fromEntries(this._views);
    }
}

export const AppRegistry = new AppRegistryClass();
````

## File: apps/video-runner/src/Root.tsx
````typescript
import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { AndroidVideo } from "./AndroidVideo";
import { InstagramVideo } from "./InstagramVideo";
import { NotificationCallDemoVideo } from "./NotificationCallDemoVideo";
import { HomeScreenGroupDemoVideo } from "./HomeScreenGroupDemoVideo";
import { WhatsappPsychoticDemoVideo } from "./WhatsappPsychoticDemoVideo";
import { CameraShowcaseVideo } from "./CameraShowcaseVideo";
import { MultiPovDemoVideo } from "./MultiPovDemoVideo";
import { BreakupDramaDSLVideo } from "./BreakupDramaDSLVideo";

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="BreakupDramaDSL"
                component={BreakupDramaDSLVideo}
                durationInFrames={420}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="MultiPovDemo"
                component={MultiPovDemoVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="CameraShowcase"
                component={CameraShowcaseVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
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
            <Composition
                id="NotificationCallDemo"
                component={NotificationCallDemoVideo}
                durationInFrames={720}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="HomeScreenGroupDemo"
                component={HomeScreenGroupDemoVideo}
                durationInFrames={900}
                fps={30}
                width={1080}
                height={1920}
            />
            <Composition
                id="WhatsappPsychoticDemo"
                component={WhatsappPsychoticDemoVideo}
                durationInFrames={600}
                fps={30}
                width={1080}
                height={1920}
            />
        </>
    );
};
````

## File: packages/apps-whatsapp/src/ui.tsx
````typescript
import React from "react";
import { WorldState, Platform, getTokens, getTypography, getAppConfig, iOSTokens, androidTokens } from "@tokovo/core";

import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";

// Get platform-specific config
const getWhatsAppConfig = (platform: Platform) => getAppConfig("whatsapp", platform);

// ============================================================================
// AUTHENTIC iOS WHATSAPP ICONS (Pixel-Perfect SVG Replicas)
// ============================================================================

const ChevronLeftIcon = () => (
    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="84" height="60" viewBox="0 0 28 20" fill="none">
        <rect x="1" y="3" width="18" height="14" rx="3" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M19 8L26 4V16L19 12V8Z" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

const PhoneCallIcon = () => (
    <svg width="60" height="60" viewBox="0 0 20 20" fill="none">
        <path d="M18.5 14.3V16.8C18.5 17.4 18.1 17.9 17.5 18C17.1 18 16.7 18 16.3 18C8.5 17.3 2.7 11.5 2 3.7C2 3.3 2 2.9 2 2.5C2.1 1.9 2.6 1.5 3.2 1.5H5.7C6.2 1.5 6.6 1.8 6.7 2.3C6.8 3 7 3.7 7.2 4.3C7.3 4.7 7.2 5.1 6.9 5.4L5.7 6.6C6.9 8.8 8.7 10.6 10.9 11.8L12.1 10.6C12.4 10.3 12.8 10.2 13.2 10.3C13.8 10.5 14.5 10.7 15.2 10.8C15.7 10.9 16 11.3 16 11.8V14.3H18.5Z" stroke="#007AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlusCircleIcon = () => (
    <svg width="90" height="90" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="14" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M15 8V22M8 15H22" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const CameraFillIcon = () => (
    <svg width="84" height="72" viewBox="0 0 28 24" fill="#007AFF">
        <path d="M4 6C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H24C25.1 22 26 21.1 26 20V8C26 6.9 25.1 6 24 6H20L18 3H10L8 6H4ZM14 18C11.2 18 9 15.8 9 13C9 10.2 11.2 8 14 8C16.8 8 19 10.2 19 13C19 15.8 16.8 18 14 18Z" />
    </svg>
);

const MicrophoneFillIcon = () => (
    <svg width="66" height="90" viewBox="0 0 22 30" fill="#007AFF">
        <rect x="6" y="2" width="10" height="16" rx="5" />
        <path d="M4 14V15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15V14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M11 23V28M8 28H14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Double checkmark for read receipts
const DoubleCheckIcon: React.FC<{ read?: boolean }> = ({ read = false }) => (
    <svg width="48" height="30" viewBox="0 0 16 10" fill="none">
        <path d="M1 5L4 8L10 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8 8L14 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================================
// HEADER COMPONENT - Fully Configurable WhatsApp Navigation Bar
// ============================================================================

interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
    platform?: Platform;
}

const Header: React.FC<HeaderProps> = ({
    contactName,
    avatarUrl,
    status = "online",
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            height: config.headerHeight,
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `0 ${config.bubbleMarginHorizontal}px`,
            marginTop: config.statusBarHeight,
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            zIndex: 10,
            fontFamily: tokens.fontFamily
        }}>
            {/* Back button with unread count */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <ChevronLeftIcon />
                <span style={{
                    fontSize: config.headerTitleSize,
                    color: platform === "ios" ? "#007AFF" : "#FFFFFF",
                    fontWeight: "400"
                }}>
                    4
                </span>
            </div>

            {/* Avatar + Name + Status (centered group) */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: -60
            }}>
                {/* Avatar */}
                <div style={{
                    width: config.avatarSize,
                    height: config.avatarSize,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginRight: config.avatarMargin,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: config.avatarSize * 0.4,
                    fontWeight: "600"
                }}>
                    {!avatarUrl && contactName.charAt(0).toUpperCase()}
                </div>

                {/* Name & Status */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{
                        fontSize: config.headerTitleSize,
                        fontWeight: "600",
                        color: platform === "ios" ? "#000000" : "#FFFFFF",
                        letterSpacing: -0.5
                    }}>
                        {contactName}
                    </span>
                    <span style={{
                        fontSize: config.headerSubtitleSize,
                        color: platform === "ios" ? "#8E8E93" : "rgba(255,255,255,0.7)"
                    }}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Action icons */}
            <div style={{ display: "flex", gap: config.headerIconGap, alignItems: "center" }}>
                <VideoCallIcon />
                <PhoneCallIcon />
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGE BUBBLE - Authentic WhatsApp iOS Styling
// ============================================================================

interface MessageBubbleProps {
    msg: { id: string; from: string; text: string; timestamp?: string; read?: boolean };
    layout: ChatMessageLayout;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, height, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 36,
            right: isMe ? 36 : "auto",
            maxWidth: "78%",
            opacity,
            transform: `translateY(${translateY}px)`,
        }}>
            {/* Bubble with tail */}
            <div style={{
                position: "relative",
                backgroundColor: isMe ? "#E7FFDB" : "#FFFFFF",
                padding: "24px 36px",
                borderRadius: 24,
                // Asymmetric corners for tail effect
                borderTopLeftRadius: isMe ? 24 : 6,
                borderTopRightRadius: isMe ? 6 : 24,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                display: "flex",
                flexDirection: "column",
                gap: 6
            }}>
                {/* Message text */}
                <span style={{
                    fontSize: 48,
                    lineHeight: "66px",
                    color: "#111B21",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    wordWrap: "break-word"
                }}>
                    {msg.text}
                </span>

                {/* Timestamp + Read receipts */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 9,
                    marginTop: 3
                }}>
                    <span style={{
                        fontSize: 33,
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {msg.timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={msg.read !== false} />}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGE LIST - With Authentic WhatsApp Background
// ============================================================================

interface MessageListProps {
    messages: any[];
    layout?: ChatLayoutState;
    isTyping?: boolean;
    conversationType?: "dm" | "group";
    platform?: Platform;
    ownerName?: string;  // Device owner for POV - their messages appear on right
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    layout,
    isTyping,
    conversationType,
    platform = "ios",
    ownerName = "me"  // Default to "me" for backward compatibility
}) => {
    const isGroup = conversationType === "group";
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);
    const chatLayout = layout?.kind === "CHAT" ? (layout as ChatLayoutState) : null;
    const scrollY = chatLayout?.scrollY || 0;
    const contentHeight = chatLayout?.contentHeight || 1500;

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundColor: config.chatBackground,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c0b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
            {/* Scrollable content container */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: contentHeight,
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.15s ease-out"
            }}>
                {messages.map((msg: any) => {
                    const msgLayout = chatLayout?.messageLayouts[msg.id];
                    const y = msgLayout?.y ?? 0;
                    const opacity = msgLayout?.opacity ?? 1;
                    const translateY = msgLayout?.translateY ?? 0;

                    // Render system messages (centered pills)
                    if (msg.type === "system") {
                        return (
                            <div key={msg.id} style={{
                                position: "absolute",
                                top: y,
                                left: 0,
                                right: 0,
                                opacity,
                                transform: `translateY(${translateY}px)`,
                                display: "flex",
                                justifyContent: "center",
                                padding: `0 ${config.bubbleMarginHorizontal * 1.5}px`
                            }}>
                                <div style={{
                                    backgroundColor: "rgba(225, 218, 208, 0.9)",
                                    padding: `${config.bubblePadding * 0.75}px ${config.bubblePaddingHorizontal}px`,
                                    borderRadius: config.bubbleRadius
                                }}>
                                    <span style={{
                                        fontSize: config.timestampSize,
                                        color: "#54656F",
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        {msg.text}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    // Render voice messages
                    if (msg.type === "voice") {
                        const isMe = msg.from === ownerName;
                        return (
                            <div key={msg.id} style={{
                                position: "absolute",
                                top: y,
                                left: isMe ? "auto" : config.bubbleMarginHorizontal,
                                right: isMe ? config.bubbleMarginHorizontal : "auto",
                                maxWidth: config.bubbleMaxWidth,
                                opacity,
                                transform: `translateY(${translateY}px)`
                            }}>
                                <VoiceMessageBubble
                                    isMe={isMe}
                                    duration={msg.duration || 15}
                                    isPlaying={msg.isPlaying}
                                    progress={msg.playProgress || 0}
                                    read={msg.status === "read"}
                                    platform={platform} // Pass platform prop
                                />
                            </div>
                        );
                    }



                    // Render Deleted Message
                    if (msg.type === "deleted") {
                        const isMe = msg.from === ownerName;
                        return (
                            <div key={msg.id} style={{
                                position: "absolute",
                                top: y,
                                left: isMe ? "auto" : config.bubbleMarginHorizontal,
                                right: isMe ? config.bubbleMarginHorizontal : "auto",
                                maxWidth: config.bubbleMaxWidth,
                                opacity,
                                transform: `translateY(${translateY}px)`
                            }}>
                                <div style={{
                                    backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                                    padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                                    borderRadius: config.bubbleRadius,
                                    borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                                    borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                                    boxShadow: config.bubbleShadow,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    fontStyle: "italic",
                                    color: config.timestampColor
                                }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                    </svg>
                                    <span style={{ fontSize: config.messageTextSize * 0.9 }}>
                                        This message was deleted
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    // Render Screenshot Alert (Psychotic feature)
                    if (msg.type === "screenshot_alert") {
                        return (
                            <div key={msg.id} style={{
                                position: "absolute",
                                top: y,
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                opacity,
                                transform: `translateY(${translateY}px)`
                            }}>
                                <div style={{
                                    backgroundColor: config.screenshotAlertBg,
                                    padding: "15px 45px",
                                    borderRadius: 45,
                                    border: `1px solid ${config.screenshotAlertText}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 15
                                }}>
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={config.screenshotAlertText} strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <span style={{
                                        fontSize: 30,
                                        color: config.screenshotAlertText,
                                        fontWeight: 600,
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        Took a screenshot!
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    // Render Missed Call (Psychotic feature)
                    if (msg.type === "call_missed") {
                        const isMe = msg.from === ownerName; // Generally you miss calls from others, but logic holds
                        return (
                            <div key={msg.id} style={{
                                position: "absolute",
                                top: y,
                                left: "50%",
                                transform: `translateX(-50%) translateY(${translateY}px)`,
                                opacity
                            }}>
                                <div style={{
                                    backgroundColor: config.missedCallBubbleColor,
                                    padding: "24px 45px",
                                    borderRadius: 24,
                                    boxShadow: config.bubbleShadow,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 9
                                }}>
                                    <span style={{
                                        fontSize: config.messageTextSize,
                                        color: config.bubbleTextColor,
                                        fontWeight: 500,
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        Missed voice call
                                    </span>
                                    <span style={{
                                        fontSize: config.timestampSize,
                                        color: config.timestampColor
                                    }}>
                                        10:45
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    // Render regular text messages
                    const isMe = msg.from === ownerName;
                    return (
                        <div key={msg.id} style={{
                            position: "absolute",
                            top: y,
                            left: isMe ? "auto" : config.bubbleMarginHorizontal,
                            right: isMe ? config.bubbleMarginHorizontal : "auto",
                            maxWidth: config.bubbleMaxWidth,
                            opacity,
                            transform: `translateY(${translateY}px)`
                        }}>
                            <div style={{
                                backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                                padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                                borderRadius: config.bubbleRadius,
                                borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                                borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                                boxShadow: config.bubbleShadow,
                                display: "flex",
                                flexDirection: "column",
                                gap: config.bubbleGap / 2
                            }}>
                                {/* Sender name for GROUP chats only */}
                                {isGroup && !isMe && msg.from !== "system" && (
                                    <div style={{
                                        fontSize: config.senderNameSize,
                                        fontWeight: 600,
                                        color: config.senderNameColor,
                                        marginBottom: 3
                                    }}>
                                        {msg.from}
                                    </div>
                                )}

                                {/* Message text */}
                                <span style={{
                                    fontSize: config.messageTextSize,
                                    lineHeight: `${config.messageLineHeight}px`,
                                    color: config.bubbleTextColor,
                                    fontFamily: tokens.fontFamily,
                                    wordWrap: "break-word"
                                }}>
                                    {msg.text}
                                </span>

                                {/* Timestamp + Read receipts + Edited */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    gap: config.bubbleGap * 0.75,
                                    marginTop: 3
                                }}>
                                    {(msg as any).edited && (
                                        <span style={{
                                            fontSize: config.editedLabelSize,
                                            color: config.editedLabelColor,
                                            fontFamily: tokens.fontFamily,
                                            marginRight: 6
                                        }}>
                                            Edited
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: config.timestampSize,
                                        color: config.timestampColor,
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        10:42
                                    </span>
                                    {isMe && <DoubleCheckIcon read={msg.status === "read"} />}
                                </div>
                            </div>

                        </div>
                    );
                })}

                {/* Typing indicator */}
                {
                    isTyping && chatLayout?.typingLayout && (
                        <div style={{
                            position: "absolute",
                            top: chatLayout.typingLayout.y,
                            left: config.bubbleMarginHorizontal,
                            opacity: chatLayout.typingLayout.opacity
                        }}>
                            <TypingBubble platform={platform} />
                        </div>
                    )
                }
            </div >
        </div >
    );
};

// ============================================================================
// INPUT AREA - Authentic WhatsApp iOS Composer
// ============================================================================

interface InputAreaProps {
    text?: string;
}

const InputArea: React.FC<InputAreaProps & { platform?: Platform }> = ({ text, platform = "ios" }) => {
    // ... implementation ...
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `${config.bubblePadding}px 30px`,
            gap: 24,
            borderTop: "1px solid rgba(0,0,0,0.1)"
        }}>
            {/* Plus button */}
            <PlusCircleIcon />

            {/* Input field */}
            <div style={{
                flex: 1,
                minHeight: 120,
                backgroundColor: config.inputBg,
                borderRadius: config.inputBorderRadius,
                padding: "27px 48px",
                display: "flex",
                alignItems: "center",
                fontSize: 48,
                color: text ? config.inputTextColor : config.inputPlaceholderColor,
                fontFamily: tokens.fontFamily,
                border: "1px solid #E5E5EA",
                boxShadow: "0 1px 1px rgba(0,0,0,0.04)"
            }}>
                {text || "Message"}
            </div>

            {/* Right icons */}
            {text ? (
                <div style={{
                    width: 105,
                    height: 105,
                    borderRadius: "50%",
                    backgroundColor: config.sendButtonColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <svg width="54" height="54" viewBox="0 0 18 18" fill="white">
                        <path d="M2 9L9 2L16 9M9 2V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(90 9 9)" />
                    </svg>
                </div>
            ) : (
                <>
                    <CameraFillIcon />
                    <MicrophoneFillIcon />
                </>
            )}
        </div>
    );
};

// ... (HomeIndicator, SystemMessage, VoiceMessageBubble unchanged) ...

// ============================================================================
// TYPING INDICATOR BUBBLE
// ============================================================================

const TypingBubble: React.FC<{ platform?: Platform }> = ({ platform = "ios" }) => {
    const config = getAppConfig("whatsapp", platform) as any;

    return (
        <div style={{
            backgroundColor: config.typingBubbleColor,
            padding: "36px 45px",
            borderRadius: config.bubbleRadius,
            borderBottomLeftRadius: config.bubbleTailRadius,
            boxShadow: config.bubbleShadow,
            display: "flex",
            gap: 12,
            alignItems: "center",
            height: 120
        }}>
            <div className="typing-dot" style={{ width: config.typingDotSize, height: config.typingDotSize, backgroundColor: config.typingDotColor, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "-0.32s" }} />
            <div className="typing-dot" style={{ width: config.typingDotSize, height: config.typingDotSize, backgroundColor: config.typingDotColor, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "-0.16s" }} />
            <div className="typing-dot" style={{ width: config.typingDotSize, height: config.typingDotSize, backgroundColor: config.typingDotColor, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }} />
        </div>
    );
};

// ============================================================================
// HOME INDICATOR SPACER
// ============================================================================

const HomeIndicator: React.FC = () => (
    <div style={{
        height: 102,
        backgroundColor: "#F6F6F6",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingBottom: 24
    }}>
        <div style={{
            width: 402,
            height: 15,
            backgroundColor: "#000",
            borderRadius: 9,
            opacity: 0.2
        }} />
    </div>
);

// ============================================================================
// SYSTEM MESSAGE - For group events (member added/removed/admin change)
// ============================================================================

interface SystemMessageProps {
    text: string;
    timestamp?: string;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ text, timestamp }) => (
    <div style={{
        display: "flex",
        justifyContent: "center",
        padding: "18px 60px",
        marginBottom: 12
    }}>
        <div style={{
            backgroundColor: "rgba(225, 218, 208, 0.85)",
            padding: "15px 30px",
            borderRadius: 21,
            maxWidth: "85%"
        }}>
            <span style={{
                fontSize: 36,
                color: "#667781",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                textAlign: "center"
            }}>
                {text}
            </span>
        </div>
    </div>
);

// ============================================================================
// VOICE MESSAGE BUBBLE - With waveform and play button
// ============================================================================

interface VoiceMessageBubbleProps {
    isMe: boolean;
    duration: number;
    isPlaying?: boolean;
    progress?: number;
    timestamp?: string;
    read?: boolean;
}

// Play button icon
const PlayIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#25D366">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#25D366">
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
    </svg>
);

const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps & { platform?: Platform }> = ({
    isMe,
    duration,
    isPlaying = false,
    progress = 0,
    timestamp,
    read,
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;

    // Waveform simulation
    const bars = 45;
    const wave = React.useMemo(() => {
        return Array.from({ length: bars }).map(() => Math.random() * 0.6 + 0.2);
    }, []);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            padding: `6px ${config.bubbleMarginHorizontal}px`
        }}>
            <div style={{
                backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                borderRadius: config.bubbleRadius,
                borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                boxShadow: config.bubbleShadow,
                display: "flex",
                alignItems: "center",
                gap: 18,
                minWidth: 450
            }}>
                {/* Play/Pause Button */}
                <div style={{
                    width: 54, // slightly larger
                    height: 54,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </div>

                {/* Waveform */}
                <div style={{
                    flex: 1,
                    height: 54, // expanded height
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    opacity: 0.8
                }}>
                    {wave.map((h, i) => {
                        const isPlayed = (i / bars) < (progress / duration);
                        return (
                            <div key={i} style={{
                                width: 4,
                                height: `${h * 100}%`,
                                backgroundColor: isPlayed ? config.waveformActiveColor : config.waveformInactiveColor,
                                borderRadius: 2,
                                transition: "background-color 0.2s"
                            }} />
                        );
                    })}
                </div>

                {/* Duration & Profile (Avatar for Other) - mimicking new WA style */}
                <div style={{
                    position: "absolute",
                    bottom: 12,
                    left: 90,
                    fontSize: config.timestampSize,
                    color: config.timestampColor,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {formatDuration(duration)}
                </div>

                {/* Timestamp + Read receipts */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: config.bubbleGap * 0.75,
                    marginTop: 36, // Push down
                    marginLeft: 12
                }}>
                    <span style={{
                        fontSize: config.timestampSize,
                        color: config.timestampColor,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={read} />}
                </div>
            </div>
        </div>
    );
};


// ============================================================================
// GROUP HEADER - Shows group info instead of contact
// ============================================================================

interface GroupHeaderProps {
    groupName: string;
    memberCount: number;
    avatarUrl?: string;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ groupName, memberCount, avatarUrl }) => (
    <div style={{
        height: 270,
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "0 36px",
        marginTop: 144,
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        zIndex: 10
    }}>
        {/* Back button */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <ChevronLeftIcon />
            <span style={{
                fontSize: 51,
                color: "#007AFF",
                fontWeight: "400",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                4
            </span>
        </div>

        {/* Group info */}
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -60
        }}>
            {/* Group avatar */}
            <div style={{
                width: 111,
                height: 111,
                borderRadius: "50%",
                background: avatarUrl
                    ? `url(${avatarUrl}) center/cover`
                    : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                marginRight: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 45,
                fontWeight: "600"
            }}>
                {!avatarUrl && "👥"}
            </div>

            {/* Name & member count */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{
                    fontSize: 51,
                    fontWeight: "600",
                    color: "#000",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                }}>
                    {groupName}
                </span>
                <span style={{
                    fontSize: 33,
                    color: "#8E8E93",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {memberCount} members
                </span>
            </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 54, alignItems: "center" }}>
            <VideoCallIcon />
            <PhoneCallIcon />
        </div>
    </div>
);

// ============================================================================
// ROOT CONTAINER
// ============================================================================

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        backgroundColor: "#F6F6F6",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
    }}>
        {children}
    </div>
);

// ============================================================================
// EXPORTS
// ============================================================================

export const WhatsApp = {
    Root,
    Header,
    GroupHeader,
    MessageList,
    InputArea,
    SystemMessage,
    VoiceMessageBubble
};

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState; deviceId?: string }> = ({ world, t, layout, deviceId }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];
    const isTyping = conversation?.typing?.["other"] || false;
    const draftText = "";

    // Get device owner for POV alignment
    const activeDeviceId = deviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
    const device = world.devices[activeDeviceId];
    const ownerName = device?.ownerName || "me";

    // Check if it's a group
    const isGroup = conversation?.type === "group";
    const groupName = conversation?.name || "Group";
    const memberCount = conversation?.members?.length || 0;

    return (
        <WhatsApp.Root>
            {isGroup ? (
                <WhatsApp.GroupHeader groupName={groupName} memberCount={memberCount} />
            ) : (
                <WhatsApp.Header contactName={conversation?.name || "Alice"} status="online" />
            )}
            <WhatsApp.MessageList
                messages={messages}
                layout={layout}
                isTyping={isTyping}
                conversationType={conversation?.type}
                ownerName={ownerName}
            />
            <WhatsApp.InputArea text={draftText} />
            <HomeIndicator />
        </WhatsApp.Root>
    );
};
````

## File: packages/core/src/types.ts
````typescript
export type DeviceId = string;
export type AppId = string;
export type ConversationId = string;

export interface Notification {
    id: string;
    appId: string;
    title: string;
    body: string;
    at: number;
    dismissedAt?: number;         // When auto-dismissed or manually dismissed
    mode?: "lockscreen" | "headsup" | "both";  // Display mode (default: both)
    icon?: string;                // App icon URL (optional)
}

export interface CallState {
    status: "incoming" | "active" | "ended";
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
    startedAt?: number;
    endedAt?: number;
}

export interface DeviceState {
    id: string;
    profileId: string;
    ownerName?: string;            // Who owns this device (for POV - their messages on right)
    isLocked: boolean;
    foregroundAppId?: string;
    notifications: Notification[];
    call?: CallState;
    homeScreen?: HomeScreenConfig;
    sound?: {
        activeSoundId?: string;
    };
    // Theming & Configuration
    theme?: DeviceTheme;
}

// Device-level theme configuration
export interface DeviceTheme {
    platform?: "ios" | "android";          // UI style (default: ios)
    frameColor?: string;                    // Device bezel color (default: black)
    wallpaper?: string;                     // Lock/home screen wallpaper (URL or CSS gradient)
    statusBarStyle?: "light" | "dark";     // Status bar text color
    accentColor?: string;                   // App tint color override
}

// --- Home Screen Types ---

export interface HomeScreenConfig {
    wallpaper?: string;              // URL or CSS gradient
    pages: HomeScreenPage[];
    dock: AppIcon[];
}

export interface HomeScreenPage {
    apps: (AppIcon | AppFolder)[];
}

export interface AppIcon {
    appId: string;
    label: string;
    icon: string;                    // URL or emoji
    badge?: number;
}

export interface AppFolder {
    type: "folder";
    name: string;
    apps: AppIcon[];
}

export interface ConversationState {
    id: ConversationId;
    type?: "dm" | "group";
    name?: string;                   // Contact or group name
    avatar?: string;

    // Group-specific
    members?: GroupMember[];
    admins?: string[];               // Member IDs who are admins

    messages: Message[];
    typing?: Record<string, boolean>;
}

export interface GroupMember {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
}

export interface Message {
    id: string;
    from: string;                    // "me" or member ID
    text?: string;
    type?: "text" | "image" | "voice" | "system";
    at?: number;                     // Timestamp frame

    // System message
    systemType?: "member_added" | "member_removed" | "admin_change" | "group_created" | "group_name_changed";
    targetMember?: string;
    actorName?: string;

    // Voice message
    duration?: number;
    isPlaying?: boolean;
    playProgress?: number;

    // Read status
    status?: "sending" | "sent" | "delivered" | "read";
}

// =============================================================================
// CAMERA SYSTEM TYPES
// =============================================================================

// Easing types for smooth cinematic motion
export type EasingType =
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "bounce"
    | "elastic"
    | "cinematic";  // Custom S-curve for film-like motion

// =============================================================================
// TRANSITION SYSTEM TYPES
// =============================================================================

// Transition types for screen animations
export type TransitionType =
    | "FADE"
    | "SLIDE_LEFT"
    | "SLIDE_RIGHT"
    | "SLIDE_UP"
    | "SLIDE_DOWN"
    | "ZOOM_IN"
    | "ZOOM_OUT"
    | "CROSS_DISSOLVE";

// =============================================================================
// HIGHLIGHT SYSTEM TYPES
// =============================================================================

// Highlight styles for message emphasis
export type HighlightStyle =
    | "pulse"
    | "glow"
    | "shake"
    | "bounce"
    | "spotlight"
    | "scale";

// Camera effect types
export type CameraEffectType = "ZOOM" | "PAN" | "SHAKE" | "FOCUS" | "CUT" | "RESET";

// Targets for FOCUS effect - general purpose, not app-specific
export type FocusTarget =
    | { type: "app"; appId?: string }                                    // Focus on app viewport
    | { type: "notification"; notificationId?: string }                  // Focus on notification
    | { type: "message"; messageId: string; conversationId?: string }    // Focus on message bubble
    | { type: "device"; deviceId?: string }                              // Focus on device
    | { type: "element"; selector: string }                              // Focus on CSS selector
    | { type: "point"; x: number; y: number };                           // Focus on absolute point (0-1 normalized)

// Individual camera effect definitions
export interface CameraZoomEffect {
    type: "ZOOM";
    scale: number;           // 1.0 = default, >1 = zoom in, <1 = zoom out
    originX?: number;        // 0-1, default 0.5 (center)
    originY?: number;        // 0-1, default 0.5 (center)
    duration: number;        // frames
    easing?: EasingType;
}

export interface CameraPanEffect {
    type: "PAN";
    translateX: number;      // pixels (or normalized 0-1 if relative)
    translateY: number;      // pixels
    relative?: boolean;      // if true, translateX/Y are 0-1 normalized
    duration: number;        // frames
    easing?: EasingType;
}

export interface CameraShakeEffect {
    type: "SHAKE";
    intensity: number;       // amplitude in pixels
    frequency: number;       // shakes per second
    decay?: number;          // 0-1, how fast shake reduces (1 = instant stop, 0 = no decay)
    duration: number;        // frames
    seed?: number;           // for deterministic randomness
}

export interface CameraFocusEffect {
    type: "FOCUS";
    target: FocusTarget;
    scale?: number;          // zoom level when focused, default 1.5
    duration: number;        // frames
    easing?: EasingType;
    holdDuration?: number;   // frames to hold at focus before returning
}

export interface CameraCutEffect {
    type: "CUT";
    toDeviceId?: string;     // switch to different device
    toView?: "app" | "lockscreen" | "homescreen";
    fadeMs?: number;         // optional fade transition (0 = hard cut)
}

export interface CameraResetEffect {
    type: "RESET";
    duration: number;        // frames to animate back to default
    easing?: EasingType;
}

export type CameraEffect =
    | CameraZoomEffect
    | CameraPanEffect
    | CameraShakeEffect
    | CameraFocusEffect
    | CameraCutEffect
    | CameraResetEffect;

// Active camera effect (with timing info)
export interface ActiveCameraEffect {
    id: string;              // unique ID for this effect instance
    effect: CameraEffect;
    startFrame: number;
    endFrame: number;
    deviceId?: string;       // Target device (undefined = primary/active device)
}

// Computed camera transform (result of all active effects at time t)
export interface CameraTransform {
    translateX: number;
    translateY: number;
    scale: number;
    rotation: number;        // degrees
    originX: number;         // 0-1
    originY: number;         // 0-1

    // Shake offsets (added on top of main transform)
    shakeX: number;
    shakeY: number;
}

// =============================================================================
// MULTI-DEVICE / POV TYPES
// =============================================================================

// View layout modes for multi-device rendering
export type ViewLayoutMode =
    | "SINGLE"              // One device fills the frame
    | "SPLIT_HORIZONTAL"    // Side by side (left/right)
    | "SPLIT_VERTICAL"      // Stacked (top/bottom)
    | "PIP";                // Picture-in-Picture (main + small overlay)

// PIP position options
export type PIPPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

// Layout configuration for multi-device views
export interface ViewLayout {
    mode: ViewLayoutMode;
    primaryDeviceId: string;
    secondaryDeviceId?: string;
    pipPosition?: PIPPosition;
    pipScale?: number;
}

// Default view layout
export const DEFAULT_VIEW_LAYOUT: ViewLayout = {
    mode: "SINGLE",
    primaryDeviceId: "main_phone",
};

// Full camera state (stored in WorldState)
export interface CameraState {
    // Base view (for backward compatibility)
    baseView: "APP_VIEW" | "TRANSITION";
    appId?: AppId;

    // Multi-device support
    activeDeviceId: string;
    layout: ViewLayout;

    // Active effects (from timeline) - global + per-device
    activeEffects: ActiveCameraEffect[];

    // Computed transform for primary device
    transform: CameraTransform;

    // Per-device transforms (computed by engine)
    deviceTransforms: Record<DeviceId, CameraTransform>;
}

// Default camera transform
export const DEFAULT_CAMERA_TRANSFORM: CameraTransform = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotation: 0,
    originX: 0.5,
    originY: 0.5,
    shakeX: 0,
    shakeY: 0,
};

// Default camera state
export const DEFAULT_CAMERA_STATE: CameraState = {
    baseView: "APP_VIEW",
    activeDeviceId: "main_phone",
    layout: { ...DEFAULT_VIEW_LAYOUT },
    activeEffects: [],
    transform: { ...DEFAULT_CAMERA_TRANSFORM },
    deviceTransforms: {},
};

// Legacy type for backward compatibility
export interface CameraViewConfig {
    type: "APP_VIEW" | "TRANSITION";
    appId?: AppId;
}

// =============================================================================
// AUDIO SYSTEM TYPES
// =============================================================================

// Active sound instance
export interface ActiveSound {
    soundId: string;
    startFrame: number;
    volume: number;
    loop?: boolean;
    deviceId?: string;  // If set, only plays for this device's context
    duration?: number;  // Optional duration in frames
}

// Audio state (stored in WorldState)
export interface AudioState {
    activeSounds: Record<string, ActiveSound>;  // key = unique instance ID
    backgroundMusic?: {
        soundId: string;
        volume: number;
        loop: boolean;
        startFrame: number;
    };
}

// Default audio state
export const DEFAULT_AUDIO_STATE: AudioState = {
    activeSounds: {},
};

// =============================================================================
// VIDEO CONFIGURATION
// =============================================================================

// Global video configuration (applies to entire composition)
export interface VideoConfig {
    // Canvas
    backgroundColor?: string;               // Video background (default: #0a0a1a)
    width?: number;                         // Composition width (default: 1080)
    height?: number;                        // Composition height (default: 1920)
    fps?: number;                           // Frames per second (default: 30)

    // Multi-device layout theming
    layout?: {
        splitLineColor?: string;            // Divider color in split views
        splitLineWidth?: number;            // Divider thickness
        pipBorderColor?: string;            // PIP overlay border
        pipBorderWidth?: number;            // PIP border thickness
        pipShadow?: string;                 // PIP drop shadow
    };

    // Watermark (optional)
    watermark?: {
        text?: string;
        image?: string;
        position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        opacity?: number;
    };
}

// Default video config
export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
    backgroundColor: "#0a0a1a",
    width: 1080,
    height: 1920,
    fps: 30,
    layout: {
        splitLineColor: "#333333",
        splitLineWidth: 2,
        pipBorderColor: "#333333",
        pipBorderWidth: 2,
        pipShadow: "0 10px 40px rgba(0,0,0,0.5)",
    },
};

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    appState: Record<AppId, any>;
    camera: CameraState;
    audio: AudioState;
    config?: VideoConfig;                   // Global video configuration
}

// Event Union
export type TimelineEvent =
    // Device events
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP" | "GO_HOME"; appId?: AppId }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SHOW_NOTIFICATION"; appId: string; title: string; body: string; mode?: "lockscreen" | "headsup" | "both"; icon?: string }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "DISMISS_NOTIFICATION"; notificationId: string }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SET_BADGE"; appId: string; count: number }
    // Call events
    | { at: number; kind: "DEVICE"; deviceId: string; type: "INCOMING_CALL"; callerId: string; callerName: string; callerAvatar?: string; isVideo?: boolean }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CALL_ANSWERED" }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "CALL_ENDED" }
    // App events - messaging
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_READ"; conversationId: ConversationId; messageId: string }
    // App events - voice message
    | { at: number; kind: "APP"; appId: AppId; type: "VOICE_MESSAGE_RECEIVED"; conversationId: ConversationId; from: string; duration: number }
    | { at: number; kind: "APP"; appId: AppId; type: "VOICE_MESSAGE_PLAY"; conversationId: ConversationId; messageId: string }
    // App events - group
    | { at: number; kind: "APP"; appId: AppId; type: "GROUP_MEMBER_ADDED"; conversationId: ConversationId; memberId: string; memberName: string; addedBy: string }
    | { at: number; kind: "APP"; appId: AppId; type: "GROUP_MEMBER_REMOVED"; conversationId: ConversationId; memberId: string; memberName: string; removedBy: string }
    | { at: number; kind: "APP"; appId: AppId; type: "GROUP_ADMIN_CHANGE"; conversationId: ConversationId; memberId: string; isAdmin: boolean }
    // App events - custom
    | { at: number; kind: "APP"; appId: AppId; type: "CUSTOM"; name: string; payload?: any }
    // Camera events - CINEMATIC SYSTEM (deviceId optional - defaults to all/active device)
    | { at: number; kind: "CAMERA"; type: "ZOOM"; deviceId?: string; scale: number; originX?: number; originY?: number; duration: number; easing?: EasingType }
    | { at: number; kind: "CAMERA"; type: "PAN"; deviceId?: string; translateX: number; translateY: number; relative?: boolean; duration: number; easing?: EasingType }
    | { at: number; kind: "CAMERA"; type: "SHAKE"; deviceId?: string; intensity: number; frequency: number; decay?: number; duration: number; seed?: number }
    | { at: number; kind: "CAMERA"; type: "FOCUS"; deviceId?: string; target: FocusTarget; scale?: number; duration: number; easing?: EasingType; holdDuration?: number }
    | { at: number; kind: "CAMERA"; type: "CUT"; toDeviceId?: string; toView?: string; fadeMs?: number }
    | { at: number; kind: "CAMERA"; type: "RESET"; deviceId?: string; duration: number; easing?: EasingType }
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig }  // Legacy support
    // Camera events - MULTI-DEVICE / POV
    | { at: number; kind: "CAMERA"; type: "LAYOUT"; mode: ViewLayoutMode; primaryDeviceId: string; secondaryDeviceId?: string; pipPosition?: PIPPosition; pipScale?: number; duration?: number; easing?: EasingType }
    // Audio events - SOUND SYSTEM
    | { at: number; kind: "AUDIO"; type: "PLAY_SOUND"; soundId: string; instanceId?: string; volume?: number; duration?: number; loop?: boolean; deviceId?: string }
    | { at: number; kind: "AUDIO"; type: "STOP_SOUND"; instanceId: string }
    | { at: number; kind: "AUDIO"; type: "FADE_VOLUME"; instanceId: string; toVolume: number; duration: number }
    | { at: number; kind: "AUDIO"; type: "BACKGROUND_MUSIC"; soundId: string; volume?: number; loop?: boolean }
    // Transition events - SCREEN ANIMATIONS
    | { at: number; kind: "TRANSITION"; type: TransitionType; from: string; to: string; duration: number; easing?: EasingType }
    // Highlight events - MESSAGE EMPHASIS
    | { at: number; kind: "HIGHLIGHT"; type: "MESSAGE"; messageId: string; conversationId?: string; style: HighlightStyle; duration: number; color?: string }
    | { at: number; kind: "HIGHLIGHT"; type: "ELEMENT"; selector: string; style: HighlightStyle; duration: number; color?: string }
    | { at: number; kind: "HIGHLIGHT"; type: "CLEAR"; targetId?: string };

// --- Layout System Types ---

export type ViewKind =
    | "CHAT"
    | "FEED"
    | "STORY"
    | "LOCKSCREEN"
    | "HOMESCREEN"
    | "TRANSITION";

export interface LayoutContext {
    world: WorldState;
    t: number; // current frame
    activeDeviceId: string;
    activeAppId: string;
    viewKind: ViewKind;

    // View-specific selectors
    activeConversationId?: string;   // CHAT
    activeFeedId?: string;           // FEED (e.g. timeline id)
    activeStoryId?: string;          // STORY (e.g. story reel id)

    viewportWidth: number;
    viewportHeight: number;

    // Optional configuration overrides
    config?: Partial<LayoutConfig>;
}

// --- LayoutConfig ---

export interface LayoutConfig {
    // Global-ish things
    cinematicMode: "NONE" | "FOLLOW_LAST_MESSAGE" | "FOCUS_ON_RANGE";

    // Chat-specific
    chat: ChatLayoutConfig;

    // Feed-specific
    feed: FeedLayoutConfig;

    // Story-specific
    story: StoryLayoutConfig;

    // Lock screen
    lockscreen: LockscreenLayoutConfig;

    // Transitions
    transition: TransitionLayoutConfig;
}

export interface ChatLayoutConfig {
    bubbleWidth: number;
    baseBubbleHeight: number;
    charsPerLine: number;
    lineHeight: number;
    verticalGap: number;
    topPadding: number;
    bottomPadding: number;

    messageAppearDuration: number;
    messageAppearOffset: number;
    scrollEasingDuration: number;
    maxScrollCatchupSpeed: number;

    lockToBottom: boolean;
}

export interface FeedLayoutConfig {
    cardWidth: number;
    baseCardHeight: number;
    verticalGap: number;
    topPadding: number;
    bottomPadding: number;

    // For variable-height posts, same trick as chat:
    charsPerLine: number;
    lineHeight: number;

    scrollEasingDuration: number;
    maxScrollCatchupSpeed: number;

    startAtTop: boolean;      // typical feed behaviour
    autoScroll?: boolean;     // for cinematic auto-scroll episodes
}

export interface StoryLayoutConfig {
    // Each story = full-screen page
    defaultStoryDuration: number; // in frames
    progressBarHeight: number;
    storyGap: number;             // for 3D-ish page stack if needed

    // Animation
    storyTransitionDuration: number; // frames between stories
}

export interface LockscreenLayoutConfig {
    topPadding: number;
    notificationGap: number;
    notificationWidth: number;
    baseNotificationHeight: number;
    charsPerLine: number;
    lineHeight: number;

    stackMaxNotifications: number; // older ones collapsed/hidden
    appearDuration: number;
}

export interface TransitionLayoutConfig {
    // Device position in composition
    defaultScale: number;
    zoomedScale: number;
    panDuration: number;
    zoomDuration: number;

    // Optionally, per-transition presets (open app, unlock, etc.)
}

// --- LayoutState ---

export type LayoutState =
    | ChatLayoutState
    | FeedLayoutState
    | StoryLayoutState
    | LockscreenLayoutState
    | TransitionLayoutState;

export interface BaseLayoutState {
    kind: ViewKind;
}

// ChatLayoutState

export interface ChatLayoutState extends BaseLayoutState {
    kind: "CHAT";
    scrollY: number;
    contentHeight: number;
    isAtBottom: boolean;
    messageLayouts: Record<string, ChatMessageLayout>;
    typingLayout?: TypingLayout | null;
    meta: ChatLayoutMeta;
}

export interface ChatMessageLayout {
    id: string;
    y: number;
    height: number;
    opacity: number;
    translateY: number;
    // Rect for director targeting (x, y relative to content, not viewport)
    rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface TypingLayout {
    y: number;
    height: number;
    opacity: number;
    // Rect for director targeting
    rect?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface ChatLayoutMeta {
    lastMessageId?: string;
}

// FeedLayoutState

export interface FeedLayoutState extends BaseLayoutState {
    kind: "FEED";
    scrollY: number;
    contentHeight: number;
    isAtBottom: boolean;
    itemLayouts: Record<string, FeedItemLayout>;
    meta: FeedLayoutMeta;
}

export interface FeedItemLayout {
    id: string;
    y: number;
    height: number;
    opacity: number;
    translateY: number;
    scale: number;   // for subtle parallax / entry
}

export interface FeedLayoutMeta {
    firstVisibleItemId?: string;
    lastVisibleItemId?: string;
    focusedItemId?: string; // for cinematic highlight
}

// StoryLayoutState

export interface StoryLayoutState extends BaseLayoutState {
    kind: "STORY";
    activeStoryIndex: number;
    storyCount: number;
    storyProgress: number; // 0..1 within current story
    storyLayouts: StoryItemLayout[];
}

export interface StoryItemLayout {
    id: string;
    index: number;
    // For 3D card stack / page-motion effects:
    translateX: number;
    translateY: number;
    scale: number;
    opacity: number;
}

// LockscreenLayoutState

export interface LockscreenLayoutState extends BaseLayoutState {
    kind: "LOCKSCREEN";
    notificationLayouts: NotificationLayout[];
    meta: LockscreenLayoutMeta;
}

export interface NotificationLayout {
    id: string;
    y: number;
    height: number;
    opacity: number;
    translateY: number;
}

export interface LockscreenLayoutMeta {
    // Add any meta fields if needed
}

// TransitionLayoutState

export interface TransitionLayoutState extends BaseLayoutState {
    kind: "TRANSITION";
    // These values are for the outer DeviceFrame / TokovoRenderer
    deviceTranslateX: number;
    deviceTranslateY: number;
    deviceScale: number;
    deviceRotation: number;
    overlayOpacity: number;
    meta: TransitionLayoutMeta;
}

export interface TransitionLayoutMeta {
    // Add any meta fields if needed
}
````

## File: packages/renderer/src/TokovoRenderer.tsx
````typescript
import React from "react";
import {
    WorldState,
    Notification,
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
    LAYOUT,
    EventIndex,
    getEventsInRange,
    deriveDirectorEffects,
    extractSignals,
    ChatLayoutState,
} from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./layout";
import { NotificationOverlay } from "./NotificationOverlay";
import { HeadsUpNotification } from "./HeadsUpNotification";
import { CallOverlay } from "./CallOverlay";
import { LockscreenView } from "./LockscreenView";
import { HomeScreenView } from "./HomeScreenView";
import { VisualDebugger } from "./VisualDebugger";
import { Audio, staticFile } from "remotion";
import { ViewKind, LayoutContext } from "./layout/types";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices";
import { createDirectorLayoutModel } from "./layout/director-adapter";
import { applyDirectorEffects, Viewport } from "./camera-composer";

/**
 * Configuration for heads-up notification behavior
 */
interface NotificationConfig {
    headsUpDuration?: number;       // frames before auto-dismiss (default: 150 = 5s at 30fps)
    showHeadsUpWhenAppOpen?: boolean; // show when app is open (default: true)
}

/**
 * TokovoRenderer
 * Main rendering component that orchestrates device frame, app views, and overlays
 */
export const TokovoRenderer: React.FC<{
    world: WorldState;
    t: number;
    debug?: boolean;
    notificationConfig?: NotificationConfig;
    focusDeviceId?: string;  // Which device to render (for multi-device POV)
    // DirectorLite integration
    eventIndex?: EventIndex;
    directorEnabled?: boolean;
    directorDebug?: boolean;
}> = ({
    world,
    t,
    debug,
    notificationConfig = {},
    focusDeviceId,
    eventIndex,
    directorEnabled = true,
    directorDebug = false,
}) => {
        const {
            headsUpDuration = 150,
            showHeadsUpWhenAppOpen = true
        } = notificationConfig;

        // 1. Determine active device & app
        // Use focusDeviceId if provided, otherwise use camera.activeDeviceId, fallback to first device
        const deviceId = focusDeviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
        const device = world.devices[deviceId];

        if (!device) {
            console.warn(`[TokovoRenderer] Device not found: ${deviceId}`);
            return null;
        }

        const appId = device.foregroundAppId;

        // 2. Determine ViewKind
        let viewKind: ViewKind = "TRANSITION";
        let activeConversationId: string | undefined;
        let activeStoryId: string | undefined;

        if (device.isLocked) {
            viewKind = "LOCKSCREEN";
        } else if (appId) {
            if (appId === "app_whatsapp") {
                viewKind = "CHAT";
                activeConversationId = Object.keys(world.conversations)[0];
            } else if (appId === "app_instagram") {
                const appState = world.appState?.["app_instagram"];
                const currentView = appState?.currentView || "feed";

                switch (currentView) {
                    case "dm":
                        viewKind = "CHAT";
                        activeConversationId = Object.keys(world.conversations)[0];
                        break;
                    case "stories":
                        viewKind = "STORY";
                        activeStoryId = appState?.stories?.activeStoryId;
                        break;
                    case "feed":
                    case "explore":
                    case "profile":
                    case "notifications":
                    case "reels":
                    case "post":
                        viewKind = "FEED";
                        break;
                    default:
                        viewKind = "FEED";
                }
            }
        } else {
            // No app open, show home screen
            viewKind = "HOMESCREEN";
        }

        // 3. Compute Layout
        const profile = device.profileId === "pixel" ? PixelProfile : iPhone16Profile;

        // For chat views, reduce viewport height to account for header and input area
        // Use constants instead of magic numbers
        const effectiveViewportHeight = viewKind === "CHAT"
            ? profile.dimensions.height - LAYOUT.CHAT_HEADER_HEIGHT - LAYOUT.CHAT_INPUT_HEIGHT
            : profile.dimensions.height;

        const layoutContext: LayoutContext = {
            world,
            t,
            activeDeviceId: deviceId,
            activeAppId: appId || "",
            viewKind,
            activeConversationId,
            activeStoryId,
            viewportWidth: profile.dimensions.width,
            viewportHeight: effectiveViewportHeight
        };

        const layout = computeLayout(layoutContext);

        // 4. Select App View
        let AppView = null;
        if (appId && AppRegistry.views[appId]) {
            AppView = AppRegistry.views[appId];
        }

        // 5. Determine Device Variant
        const isPixel = device.profileId.includes("pixel");
        const variant = isPixel ? "android" : "ios";

        // 6. Get Base Camera Transform (from timeline events)
        const baseCameraTransform: CameraTransform =
            (world.camera?.deviceTransforms?.[deviceId]) ||
            world.camera?.transform ||
            DEFAULT_CAMERA_TRANSFORM;

        // 6b. DirectorLite Integration
        let finalCameraTransform = baseCameraTransform;

        if (directorEnabled && eventIndex && viewKind === "CHAT" && layout.kind === "CHAT") {
            // Get manual camera effects (if any active, skip director)
            const manualCameraEffects = world.camera?.activeEffects || [];

            // Signal window: past 90 frames, future 15 frames
            const windowStart = Math.max(0, t - 90);
            const windowEnd = t + 15;
            const eventsInWindow = getEventsInRange(eventIndex, windowStart, windowEnd);

            // Extract signals scoped to this device/app
            const signals = extractSignals(eventsInWindow, deviceId, appId || "");

            // Create layout model from computed layout
            const chatLayout = layout as ChatLayoutState;
            const directorLayout = createDirectorLayoutModel(
                chatLayout,
                deviceId,
                appId || "",
                activeConversationId || "",
                profile.dimensions.width,  // viewportWidth
                effectiveViewportHeight
            );

            // Derive effects (PURE FUNCTION - no state)
            const { effects, debug: directorDebugOutput, skipped } = deriveDirectorEffects({
                t,
                signals,
                layoutModel: directorLayout,
                seed: 42, // Deterministic seed
                debug: directorDebug,
                manualCameraEffects,
            });

            // Log debug info if enabled
            if (directorDebug && directorDebugOutput) {
                console.log(`[DirectorLite] t=${t}`, directorDebugOutput);
            }

            // Apply director effects if not skipped and effects exist
            if (!skipped && effects.length > 0) {
                const viewport: Viewport = {
                    width: profile.dimensions.width,
                    height: profile.dimensions.height,
                    scrollY: chatLayout.scrollY,
                };
                finalCameraTransform = applyDirectorEffects(effects, viewport);
            }
        }

        // 7. Build camera transform style
        // The transform-origin uses the originX/originY from camera to zoom toward specific point
        // Origin is in 0-1 range where (0.5, 0.5) is center
        const cameraTransformString = `
        translate(${finalCameraTransform.translateX + finalCameraTransform.shakeX}px, ${finalCameraTransform.translateY + finalCameraTransform.shakeY}px)
        scale(${finalCameraTransform.scale})
        rotate(${finalCameraTransform.rotation}deg)
    `.replace(/\s+/g, ' ').trim();

        // Camera wrapper needs explicit dimensions for transform-origin to work correctly
        // Use device profile dimensions
        const cameraStyle: React.CSSProperties = {
            width: profile.dimensions.width,
            height: profile.dimensions.height,
            transformOrigin: `${finalCameraTransform.originX * 100}% ${finalCameraTransform.originY * 100}%`,
            transform: cameraTransformString,
            // No CSS transition - we handle all animation in JS for frame-perfect sync
            transition: 'none',
        };

        // 8. Device-specific transforms (legacy layout system)
        let deviceStyle: React.CSSProperties = {};

        if (layout.kind === "TRANSITION") {
            const transLayout = layout as any;
            const { deviceScale, deviceTranslateX, deviceTranslateY, deviceRotation } = transLayout;
            if (deviceScale !== 1 || deviceTranslateX !== 0 || deviceTranslateY !== 0 || deviceRotation !== 0) {
                deviceStyle = {
                    transformOrigin: "center center",
                    transform: `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`,
                };
            }
        }

        // 9. Find active notifications for heads-up display
        const getActiveHeadsUpNotification = (): Notification | null => {
            if (!device.notifications || device.isLocked) return null;
            if (!showHeadsUpWhenAppOpen && appId) return null;

            // Find the most recent notification that should show as heads-up
            const headsUpNotifs = device.notifications.filter(n => {
                // Check mode
                const mode = n.mode || "both";
                if (mode === "lockscreen") return false;

                // Check if not dismissed and within display window
                if (n.dismissedAt !== undefined) return false;

                const timeSinceAppear = t - n.at;
                if (timeSinceAppear < 0) return false; // Not yet visible
                if (timeSinceAppear > headsUpDuration + 30) return false; // Past dismiss animation

                // Don't show notification from current app
                if (n.appId === appId) return false;

                return true;
            });

            // Return the most recent one
            return headsUpNotifs.length > 0 ? headsUpNotifs[headsUpNotifs.length - 1] : null;
        };

        const activeHeadsUp = getActiveHeadsUpNotification();

        // 10. Check for active call
        const hasActiveCall = device.call && device.call.status !== "ended";

        return (
            <div style={{
                width: profile.dimensions.width,
                height: profile.dimensions.height,
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Camera wrapper - applies cinematic transforms */}
                <div style={cameraStyle}>
                    {/* Device wrapper - applies layout transforms */}
                    <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                        <DeviceFrame profileId={device.profileId} variant={variant}>
                            {/* Call Overlay (takes precedence over everything) */}
                            {hasActiveCall && (
                                <CallOverlay
                                    call={device.call!}
                                    currentTime={t}
                                    variant={variant}
                                />
                            )}

                            {/* App View / Lockscreen / Home Screen */}
                            {!hasActiveCall && AppView && !device.isLocked ? (
                                <AppView world={world} t={t} layout={layout} platform={variant} deviceId={deviceId} />
                            ) : !hasActiveCall && device.isLocked ? (
                                <LockscreenView
                                    notifications={device.notifications}
                                    layout={layout}
                                    variant={variant}
                                />
                            ) : !hasActiveCall && device.homeScreen ? (
                                <HomeScreenView
                                    config={device.homeScreen}
                                    variant={variant}
                                />
                            ) : !hasActiveCall && (
                                <div style={{ flex: 1, backgroundColor: "black" }} />
                            )}

                            {/* Lockscreen Notification Overlay */}
                            <NotificationOverlay
                                notifications={device?.notifications}
                                variant={variant}
                                layout={layout}
                            />

                            {/* Heads-Up Notification (when unlocked) */}
                            {activeHeadsUp && !hasActiveCall && (
                                <HeadsUpNotification
                                    notification={activeHeadsUp}
                                    currentTime={t}
                                    variant={variant}
                                    autoDismissAfter={headsUpDuration}
                                />
                            )}
                        </DeviceFrame>
                    </div>
                </div>

                {debug && <VisualDebugger world={world} t={t} />}
            </div>
        );
    };
````
