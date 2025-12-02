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
    out-refactor-verify-android.mp4
    out-refactor-verify.mp4
    package.json
    remotion.config.ts
    tsconfig.json
packages/
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
      layout/
        strategies/
          chat.ts
          feed.ts
          lockscreen.ts
          story.ts
          transition.ts
        config.ts
        index.ts
        types.ts
      DeviceFrame.tsx
      index.ts
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

## File: packages/renderer/src/layout/strategies/chat.ts
````typescript
import { LayoutContext, ChatLayoutState, ChatMessageLayout, TypingLayout } from "../types";

export function computeChatLayout(ctx: LayoutContext): ChatLayoutState {
    const { world, t, activeConversationId, config, viewportHeight } = ctx;
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
    const messages = conversation.messages.filter(m => m.at <= t);

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    let currentY = chatConfig.topPadding;

    // 1. Layout messages
    for (const msg of messages) {
        // Calculate height
        // Simple heuristic: chars per line
        const textLength = msg.text?.length || 0;
        const lines = Math.ceil(Math.max(1, textLength) / chatConfig.charsPerLine);
        const height = lines * chatConfig.lineHeight + 20; // +20 for internal padding

        // Animation: Slide in / Fade in
        const timeSinceAppear = t - msg.at;
        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear < chatConfig.messageAppearDuration) {
            const progress = timeSinceAppear / chatConfig.messageAppearDuration;
            // Simple ease-out
            const ease = 1 - Math.pow(1 - progress, 3);
            opacity = ease;
            translateY = chatConfig.messageAppearOffset * (1 - ease);
        }

        messageLayouts[msg.id] = {
            id: msg.id,
            y: currentY,
            height,
            opacity,
            translateY
        };

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
            opacity: 1
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
            lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : undefined
        }
    };
}
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
        // Assuming we have an 'at' time for notifications, but the type might not have it.
        // If not, we just show them.
        // Let's assume we want them to appear instantly for now.

        notificationLayouts.push({
            id: notification.id,
            y: currentY,
            height,
            opacity: 1,
            translateY: 0
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

## File: packages/renderer/src/layout/config.ts
````typescript
import { LayoutConfig } from "./types";

export const defaultLayoutConfig: LayoutConfig = {
    cinematicMode: "NONE",
    chat: {
        bubbleWidth: 0.75, // 75% of screen width
        baseBubbleHeight: 60,
        charsPerLine: 30,
        lineHeight: 40,
        verticalGap: 15,
        topPadding: 120, // Space for header
        bottomPadding: 100, // Space for input
        messageAppearDuration: 15, // frames
        messageAppearOffset: 10, // px
        scrollEasingDuration: 20, // frames
        maxScrollCatchupSpeed: 50, // px/frame
        lockToBottom: true
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
    // Merge provided config with defaults
    const config = { ...defaultLayoutConfig, ...ctx.config };
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

## File: packages/renderer/src/layout/types.ts
````typescript
export * from "@tokovo/core";
````

## File: apps/video-runner/src/index.ts
````typescript
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
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

## File: packages/apps-instagram/src/views/profile/ProfileView.tsx
````typescript
import React from "react";
import { InstagramState } from "../../types";


const GridIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const TaggedIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const MenuIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const LockIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const PlusIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

import { LayoutState, FeedLayoutState } from "@tokovo/core";

export const ProfileView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    // Mock user data for now
    const user = {
        username: "instagram_user",
        name: "Instagram User",
        bio: "Digital Creator 📸\nLiving the dream ✨\n📍 New York",
        posts: 42,
        followers: "1.2M",
        following: 250,
        avatar: "" // TODO: Add default avatar
    };

    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // Hide native scroll
            position: "relative"
        }}>
            {/* Scrollable Content Container */}
            <div style={{
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.1s linear", // Layout engine drives this
                width: "100%",
                minHeight: "100%"
            }}>
                {/* Header */}
                <div style={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 30px",
                    marginTop: 60,
                    zIndex: 10
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <LockIcon />
                        <div style={{ fontSize: 42, fontWeight: "bold" }}>{user.username}</div>
                    </div>
                    <div style={{ display: "flex", gap: 40 }}>
                        <PlusIcon />
                        <MenuIcon />
                    </div>
                </div>

                {/* Profile Info */}
                <div style={{ padding: "20px 30px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
                        <div style={{
                            width: 180,
                            height: 180,
                            borderRadius: "50%",
                            backgroundColor: "#333",
                            backgroundImage: `url(${user.avatar})`,
                            backgroundSize: "cover",
                            marginRight: 60
                        }} />
                        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", paddingRight: 20 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold" }}>{user.posts}</div>
                                <div style={{ fontSize: 28 }}>Posts</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold" }}>{user.followers}</div>
                                <div style={{ fontSize: 28 }}>Followers</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold" }}>{user.following}</div>
                                <div style={{ fontSize: 28 }}>Following</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <div style={{ fontSize: 32, fontWeight: "bold", marginBottom: 5 }}>{user.name}</div>
                        <div style={{ fontSize: 30, whiteSpace: "pre-wrap", lineHeight: "1.3" }}>{user.bio}</div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
                        <div style={{ flex: 1, height: 70, backgroundColor: "#333", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "600" }}>
                            Edit profile
                        </div>
                        <div style={{ flex: 1, height: 70, backgroundColor: "#333", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "600" }}>
                            Share profile
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderTop: "1px solid #222", height: 100 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "2px solid white" }}>
                        <GridIcon active={true} />
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TaggedIcon active={false} />
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {state.feed.posts.map(post => (
                        <div key={post.id} style={{
                            width: "calc(33.33% - 2px)",
                            aspectRatio: "1/1",
                            backgroundColor: "#222",
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

const CameraIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const HeartIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const MusicIcon = () => (
    <div style={{ width: 60, height: 60, borderRadius: 10, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 30, height: 30, backgroundColor: "white", borderRadius: "50%" }} />
    </div>
);

export const ReelsView: React.FC<{ state: InstagramState }> = ({ state }) => {
    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column"
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
                backgroundPosition: "center",
                filter: "brightness(0.9)"
            }} />

            {/* Header */}
            <div style={{
                position: "absolute",
                top: 60,
                left: 30,
                right: 30,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10
            }}>
                <div style={{ fontSize: 42, fontWeight: "bold" }}>Reels</div>
                <CameraIcon />
            </div>

            {/* Side Actions */}
            <div style={{
                position: "absolute",
                bottom: 180, // Above bottom nav
                right: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 40,
                zIndex: 10
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <HeartIcon />
                    <div style={{ fontSize: 24, marginTop: 5 }}>123K</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CommentIcon />
                    <div style={{ fontSize: 24, marginTop: 5 }}>456</div>
                </div>
                <ShareIcon />
                <div style={{ fontSize: 32 }}>...</div>
                <MusicIcon />
            </div>

            {/* Bottom Info */}
            <div style={{
                position: "absolute",
                bottom: 180,
                left: 30,
                zIndex: 10,
                maxWidth: "70%"
            }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundImage: `url(https://i.pravatar.cc/150?u=reel)`, backgroundSize: "cover", marginRight: 20 }} />
                    <div style={{ fontSize: 32, fontWeight: "600", marginRight: 20 }}>reels_creator</div>
                    <div style={{ border: "1px solid white", borderRadius: 8, padding: "4px 12px", fontSize: 24 }}>Follow</div>
                </div>
                <div style={{ fontSize: 30, marginBottom: 20 }}>
                    Wait for the drop! 🎵🔥 #dance #viral
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 28 }}>
                    <span style={{ marginRight: 10 }}>🎵</span>
                    Original Audio - reels_creator
                </div>
            </div>
        </div>
    );
};
````

## File: packages/apps-instagram/src/views/BottomNav.tsx
````typescript
import React from "react";
import { InstagramView } from "../types";

const HomeIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const SearchIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ReelsIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const ShopIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
    <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: active ? "2px solid white" : "none",
        padding: 2
    }}>
        <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#555",
            // backgroundImage: `url(...)` // TODO: Add user avatar
        }} />
    </div>
);

export const BottomNav: React.FC<{ currentView: InstagramView }> = ({ currentView }) => {
    return (
        <div style={{
            height: 150,
            backgroundColor: "black",
            borderTop: "1px solid #222",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: 30 // Home indicator spacing
        }}>
            <HomeIcon active={currentView === 'feed'} />
            <SearchIcon active={currentView === 'explore'} />
            <ReelsIcon active={currentView === 'reels'} />
            <ShopIcon active={false} />
            <ProfileIcon active={currentView === 'profile'} />
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

## File: packages/apps-whatsapp/src/index.ts
````typescript
export * from "./types";
export * from "./runtime";
export * from "./ui";
````

## File: packages/apps-whatsapp/src/types.ts
````typescript
export interface WhatsAppState {
    // Add specific state if needed, for now using generic ConversationState from core
}
````

## File: packages/apps-whatsapp/src/TypingBubble.tsx
````typescript
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

## File: packages/core/src/engine.ts
````typescript
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
````

## File: packages/core/src/index.ts
````typescript
export * from "./types";
export * from "./engine";
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

## File: packages/renderer/src/index.ts
````typescript
export * from "./registry";
export * from "./LayoutEngine";
export * from "./DeviceFrame";
export * from "./TokovoRenderer";
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

## File: packages/apps-instagram/src/views/dm/InstagramChatView.tsx
````typescript
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

import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";

// ...

const MessageBubble: React.FC<{ msg: any; layout: ChatMessageLayout }> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, height, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 45,
            right: isMe ? 45 : "auto",
            height: height - 15, // Gap adjustment

            backgroundColor: isMe ? "#3797F0" : "#262626",
            color: "white",
            padding: "30px 42px",
            borderRadius: 60,
            maxWidth: "70%",
            fontSize: 48,
            lineHeight: "60px",
            opacity,
            transform: `translateY(${translateY}px)`,
            display: "flex",
            alignItems: "center"
        }}>
            {msg.text}
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; layout?: LayoutState }> = ({ messages, layout }) => {
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
                transition: "transform 0.1s linear"
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

export const InstagramChatView: React.FC<{ world: WorldState; t: number; layout?: LayoutState }> = ({ world, t, layout }) => {
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
````

## File: packages/apps-instagram/src/views/feed/FeedView.tsx
````typescript
import React from "react";
import { InstagramState, Post, StoryUser } from "../../types";
import { LayoutState, FeedLayoutState } from "@tokovo/core";

// --- Icons ---
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

const InstagramLogo = () => (
    <div style={{ fontFamily: "'Billabong', 'Grand Hotel', cursive", fontSize: 72, color: "white" }}>
        Instagram
    </div>
);

const MessengerIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        <path d="M15 10l-4 4-2-2-4 4" />
    </svg>
);

// --- Components ---

const StoryBubble: React.FC<{ user: StoryUser }> = ({ user }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 30 }}>
        <div style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            padding: 4,
            background: user.hasUnseen ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" : "#555"
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "4px solid black",
                backgroundImage: `url(${user.avatar})`,
                backgroundSize: "cover",
                backgroundColor: "#333"
            }} />
        </div>
        <div style={{ color: "white", fontSize: 24, marginTop: 10, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.username}
        </div>
    </div>
);

const PostItem: React.FC<{ post: Post }> = ({ post }) => (
    <div style={{ marginBottom: 60 }}>
        {/* Header */}
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

        {/* Image */}
        <div style={{
            width: "100%",
            aspectRatio: "1/1",
            backgroundColor: "#222",
            backgroundImage: `url(${post.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
        }} />

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 30px" }}>
            <div style={{ display: "flex", gap: 40 }}>
                <HeartIcon filled={post.liked} />
                <CommentIcon />
                <ShareIcon />
            </div>
            <BookmarkIcon filled={post.saved} />
        </div>

        {/* Likes & Caption */}
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
        </div>
    </div>
);

export const FeedView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

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
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 30px",
                marginTop: 60, // Status bar spacing
                zIndex: 10,
                backgroundColor: "black"
            }}>
                <InstagramLogo />
                <div style={{ display: "flex", gap: 40 }}>
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
                    transform: `translateY(-${scrollY}px)`,
                    transition: "transform 0.1s linear"
                }}>
                    {/* Stories */}
                    <div style={{
                        display: "flex",
                        padding: "20px 30px",
                        borderBottom: "1px solid #222",
                        marginBottom: 20,
                        overflowX: "hidden" // Should be scrollable in real app, but fixed for video usually
                    }}>
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

const CloseIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MoreIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

const ProgressBar: React.FC<{ count: number; activeIndex: number; progress: number }> = ({ count, activeIndex, progress }) => (
    <div style={{ display: "flex", gap: 8, padding: "20px 10px" }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                    height: "100%",
                    width: i < activeIndex ? "100%" : i === activeIndex ? `${progress * 100}%` : "0%",
                    backgroundColor: "white"
                }} />
            </div>
        ))}
    </div>
);
// ... (Icons remain same)

export const StoriesView: React.FC<{ state: InstagramState; t: number; layout?: LayoutState }> = ({ state, t, layout }) => {
    const storyLayout = layout?.kind === "STORY" ? (layout as StoryLayoutState) : null;

    // Fallback if no layout provided (shouldn't happen in new system)
    if (!storyLayout) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeUser = state.stories.users.find(u => u.username === state.stories.activeStoryId?.split(':')[0]);
    // Or derive from layout if we stored user info there? 
    // LayoutEngine stores IDs. We can look up the user/story from state using the ID in layout.
    // For now, let's stick to state lookup for data, layout for position/timing.

    if (!activeUser) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeIndex = storyLayout.activeStoryIndex;
    const progress = storyLayout.storyProgress;
    const activeStory = activeUser.stories[activeIndex];

    if (!activeStory) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    return (
        <div style={{
            backgroundColor: "#111",
            height: "100%",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden" // Important for transitions
        }}>
            {/* Render all stories that have layout info (for transitions) */}
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
                        filter: "brightness(0.9)",
                        opacity: sl.opacity,
                        transform: `translateX(${sl.translateX}%) scale(${sl.scale})`,
                        transition: "none" // Layout engine handles animation
                    }} />
                );
            })}

            {/* Overlay Content (UI doesn't transition, just stays on top) */}
            <div style={{ position: "relative", zIndex: 10, paddingTop: 60, paddingLeft: 20, paddingRight: 20 }}>
                <ProgressBar count={activeUser.stories.length} activeIndex={activeIndex} progress={progress} />

                <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundImage: `url(${activeUser.avatar})`, backgroundSize: "cover", marginRight: 20 }} />
                    <div style={{ fontSize: 28, fontWeight: "600", marginRight: 20 }}>{activeUser.username}</div>
                    <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)" }}>12h</div>
                    <div style={{ flex: 1 }} />
                    <MoreIcon />
                    <div style={{ width: 20 }} />
                    <CloseIcon />
                </div>
            </div>

            {/* Input / Reactions */}
            <div style={{ marginTop: "auto", padding: "40px 30px", display: "flex", alignItems: "center", gap: 30, position: "relative", zIndex: 10 }}>
                <div style={{
                    flex: 1,
                    height: 100,
                    borderRadius: 50,
                    border: "2px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 40px",
                    fontSize: 32,
                    color: "white"
                }}>
                    Send message
                </div>
                <HeartIcon />
                <ShareIcon />
            </div>
        </div>
    );
};

const HeartIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
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

## File: packages/devices/src/iphone16/Frame.tsx
````typescript
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
````

## File: packages/devices/src/pixel/Frame.tsx
````typescript
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
````

## File: packages/devices/src/reducer.ts
````typescript
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
````

## File: packages/devices/src/StatusBar.tsx
````typescript
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

## File: packages/apps-whatsapp/src/runtime.ts
````typescript
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
````

## File: packages/episodes/src/examples/instagram-test.json
````json
{
    "initialState": {
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
    "timeline": [
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
````

## File: packages/episodes/src/index.ts
````typescript
import exampleEpisode from "./examples/whatsapp-breakup-01.json";

import androidEpisode from "./examples/android-test.json";

import instagramEpisode from "./examples/instagram-test.json";

export * from "./schema";
export { exampleEpisode, androidEpisode, instagramEpisode };
````

## File: packages/episodes/src/schema.ts
````typescript
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

## File: apps/video-runner/src/Root.tsx
````typescript
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

                    {/* Notifications are now handled by NotificationOverlay via LayoutEngine */}
                    <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Placeholder for future lock screen widgets if needed */}
                    </div>
                </div>
            )}
        </FrameComponent>
    );
};
````

## File: packages/renderer/src/registry.ts
````typescript
import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";
import { InstagramApp } from "@tokovo/apps-instagram";

import { LayoutState } from "./layout/types";

export const AppRegistry = {
    views: {
        "app_whatsapp": WhatsappChatView,
        "app_instagram": InstagramApp
    } as Record<string, React.FC<{ world: WorldState; t?: number; layout?: LayoutState }>>,

    getView(appId: string) {
        return this.views[appId];
    }
};
````

## File: packages/apps-whatsapp/src/ui.tsx
````typescript
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

import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";

// ...

const MessageBubble: React.FC<{ msg: any; layout: ChatMessageLayout }> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, height, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 48,
            right: isMe ? 48 : "auto",
            height: height - 20, // Subtract internal padding/gap if needed, or just use height
            // Actually height from layout includes gap? No, layout engine adds gap to currentY.
            // height is the bubble height.

            backgroundColor: isMe ? "#DCF8C6" : "#FFFFFF",
            padding: "24px 36px",
            borderRadius: 48,
            borderTopLeftRadius: !isMe ? 12 : 48,
            borderTopRightRadius: isMe ? 12 : 48,
            maxWidth: "75%",
            fontSize: 51,
            lineHeight: "66px",
            boxShadow: "0 3px 3px rgba(0,0,0,0.1)",
            opacity,
            transform: `translateY(${translateY}px)`,
            display: "flex",
            flexDirection: "column"
        }}>
            <div>{msg.text}</div>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 12,
                marginTop: 6,
                fontSize: 33,
                color: "rgba(0,0,0,0.45)"
            }}>
                <span>10:42</span>
                {isMe && <CheckIcon />}
            </div>
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; layout?: LayoutState; isTyping?: boolean }> = ({ messages, layout, isTyping }) => {
    const chatLayout = layout?.kind === "CHAT" ? (layout as ChatLayoutState) : null;
    const scrollY = chatLayout?.scrollY || 0;
    const contentHeight = chatLayout?.contentHeight || "100%";

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
            backgroundSize: "cover"
        }}>
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: contentHeight, // Set height to allow scrolling if we were using native scroll, but we use transform
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.1s linear", // Layout engine handles easing? Or we do it here?
                // Spec says "scrollEasingDuration" in config. Layout engine computes target scrollY?
                // If layout engine returns instantaneous scrollY, we might want CSS transition.
                // But layout engine might return interpolated scrollY.
                // Let's assume layout engine returns the frame-perfect scrollY.
            }}>
                {messages.map((msg: any) => {
                    const msgLayout = chatLayout?.messageLayouts[msg.id];
                    if (!msgLayout) return null;
                    return <MessageBubble key={msg.id} msg={msg} layout={msgLayout} />;
                })}
                {/* Typing indicator would also need layout info */}
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

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: LayoutState }> = ({ world, t, layout }) => {
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
    type: "APP_VIEW" | "TRANSITION"; // Updated to include TRANSITION
    appId?: AppId;
}

export interface WorldState {
    devices: Record<DeviceId, DeviceState>;
    conversations: Record<ConversationId, ConversationState>;
    appState: Record<AppId, any>; // Generic state for apps (e.g. Instagram feed, stories)
    camera: CameraViewConfig;
}

// Event Union
export type TimelineEvent =
    | { at: number; kind: "DEVICE"; deviceId: string; type: "LOCK" | "UNLOCK" | "OPEN_APP" | "CLOSE_APP"; appId?: AppId }
    | { at: number; kind: "DEVICE"; deviceId: string; type: "SHOW_NOTIFICATION"; appId: string; title: string; body: string }
    | { at: number; kind: "APP"; appId: AppId; type: "MESSAGE_RECEIVED" | "TYPING_START" | "TYPING_END"; conversationId: ConversationId; from: string; text?: string }
    | { at: number; kind: "APP"; appId: AppId; type: "CUSTOM"; name: string; payload?: any }
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig }
    | { at: number; kind: "AUDIO"; type: "PLAY_SOUND"; soundId: string; volume?: number };

// --- Layout System Types ---

export type ViewKind =
    | "CHAT"
    | "FEED"
    | "STORY"
    | "LOCKSCREEN"
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
}

export interface TypingLayout {
    y: number;
    height: number;
    opacity: number;
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
import { WorldState } from "@tokovo/core";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./layout";
import { NotificationOverlay } from "./NotificationOverlay";
import { VisualDebugger } from "./VisualDebugger";
import { Audio, staticFile } from "remotion";
import { ViewKind, LayoutContext } from "./layout/types";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices";

export const TokovoRenderer: React.FC<{ world: WorldState; t: number; debug?: boolean }> = ({ world, t, debug }) => {
    // 1. Determine active device & app
    const deviceId = Object.keys(world.devices)[0];
    const device = world.devices[deviceId];
    const appId = device?.foregroundAppId;

    // 2. Determine ViewKind
    let viewKind: ViewKind = "TRANSITION";
    let activeConversationId: string | undefined;
    let activeStoryId: string | undefined;

    if (device.isLocked) {
        viewKind = "LOCKSCREEN";
    } else if (appId) {
        if (appId === "app_whatsapp") {
            viewKind = "CHAT";
            // Heuristic: active conversation is the one receiving events or just the first one
            // Ideally this should be in appState
            activeConversationId = Object.keys(world.conversations)[0];
        } else if (appId === "app_instagram") {
            const appState = world.appState?.["app_instagram"];
            const currentView = appState?.currentView || "feed";

            switch (currentView) {
                case "dm":
                    viewKind = "CHAT";
                    activeConversationId = Object.keys(world.conversations)[0]; // Simplified
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
                    viewKind = "FEED"; // Most of these are feed-like lists
                    break;
                default:
                    viewKind = "FEED";
            }
        }
    }

    // 3. Compute Layout
    // Select profile for dimensions
    const profile = device.profileId === "pixel" ? PixelProfile : iPhone16Profile;

    const layoutContext: LayoutContext = {
        world,
        t,
        activeDeviceId: deviceId,
        activeAppId: appId || "",
        viewKind,
        activeConversationId,
        activeStoryId,
        viewportWidth: profile.dimensions.width,
        viewportHeight: profile.dimensions.height
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

    // 6. Apply Device Transforms (from TransitionLayoutState or default)
    let deviceStyle: React.CSSProperties = {
        transformOrigin: "center center",
        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)" // Smooth default transition
    };

    if (layout.kind === "TRANSITION") {
        const transLayout = layout as any; // Cast to TransitionLayoutState (or use type guard)
        // Note: We need to import TransitionLayoutState to cast properly, or just access props if we trust it.
        // Better to be safe.
        const { deviceScale, deviceTranslateX, deviceTranslateY, deviceRotation } = transLayout;

        deviceStyle.transform = `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`;
    }

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <div style={{ width: "100%", height: "100%", ...deviceStyle }}>
                <DeviceFrame profileId={device.profileId} variant={variant}>
                    {AppView && !device.isLocked ? (
                        <AppView world={world} t={t} layout={layout} />
                    ) : (
                        <div style={{ flex: 1, backgroundColor: "black" }} /> // Lock screen / Home
                    )}

                    {/* Overlays */}
                    <NotificationOverlay notifications={device?.notifications} variant={variant} layout={layout} />
                </DeviceFrame>
            </div>

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
````
