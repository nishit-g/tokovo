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
      HomeScreenGroupDemoVideo.tsx
      index.ts
      InstagramVideo.tsx
      NotificationCallDemoVideo.tsx
      Root.tsx
      Video.tsx
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
      tokens.ts
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
        homescreen-group-demo.json
        instagram-test.json
        notification-call-demo.json
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
      shared/
        Components.tsx
        index.ts
      AppTransition.tsx
      CallOverlay.tsx
      DeviceFrame.tsx
      HeadsUpNotification.tsx
      HomeScreenView.tsx
      index.ts
      LockscreenView.tsx
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

## File: packages/renderer/src/HomeScreenView.tsx
````typescript
import React from "react";
import { HomeScreenConfig, AppIcon, AppFolder } from "@tokovo/core";

// ============================================================================
// APP ICON COMPONENT
// ============================================================================

interface AppIconItemProps {
    app: AppIcon;
    size?: number;
}

const AppIconItem: React.FC<AppIconItemProps> = ({ app, size = 180 }) => {
    const isEmoji = /^\p{Emoji}/u.test(app.icon);
    const iconSize = size * 0.75;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: size,
            gap: 12
        }}>
            {/* Icon */}
            <div style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize * 0.22,
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

                {/* Badge */}
                {app.badge && app.badge > 0 && (
                    <div style={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        minWidth: 54,
                        height: 54,
                        borderRadius: 27,
                        backgroundColor: "#FF3B30",
                        color: "white",
                        fontSize: 33,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 15px",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {app.badge > 99 ? "99+" : app.badge}
                    </div>
                )}
            </div>

            {/* Label */}
            <span style={{
                fontSize: 33,
                color: "white",
                textAlign: "center",
                maxWidth: size,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
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
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, size = 180 }) => {
    const iconSize = size * 0.75;
    const miniSize = (iconSize - 30) / 3;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: size,
            gap: 12
        }}>
            {/* Folder icon with mini app previews */}
            <div style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize * 0.22,
                backgroundColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(30px)",
                display: "grid",
                gridTemplateColumns: `repeat(3, ${miniSize}px)`,
                gridTemplateRows: `repeat(3, ${miniSize}px)`,
                gap: 9,
                padding: 15
            }}>
                {folder.apps.slice(0, 9).map((app, i) => (
                    <div key={i} style={{
                        width: miniSize,
                        height: miniSize,
                        borderRadius: miniSize * 0.2,
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
                fontSize: 33,
                color: "white",
                textAlign: "center"
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
}

const Dock: React.FC<DockProps> = ({ apps }) => (
    <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        height: 270,
        borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 30px"
    }}>
        {apps.slice(0, 4).map((app, i) => (
            <AppIconItem key={i} app={app} size={150} />
        ))}
    </div>
);

// ============================================================================
// PAGE DOTS
// ============================================================================

interface PageDotsProps {
    count: number;
    activeIndex: number;
}

const PageDots: React.FC<PageDotsProps> = ({ count, activeIndex }) => (
    <div style={{
        display: "flex",
        gap: 18,
        marginBottom: 30
    }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
                width: 21,
                height: 21,
                borderRadius: "50%",
                backgroundColor: i === activeIndex ? "white" : "rgba(255,255,255,0.4)"
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
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
    config,
    variant = "ios",
    activePage = 0
}) => {
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
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(6, auto)",
                gap: "36px 0",
                padding: "240px 30px 0",
                justifyItems: "center",
                overflow: "hidden"
            }}>
                {currentPage?.apps.map((item, i) => (
                    'type' in item && item.type === "folder"
                        ? <FolderItem key={i} folder={item} />
                        : <AppIconItem key={i} app={item as AppIcon} />
                ))}
            </div>

            {/* Page Dots */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 12
            }}>
                <PageDots count={config.pages.length} activeIndex={activePage} />
            </div>

            {/* Dock */}
            <Dock apps={config.dock} />

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

## File: packages/core/src/index.ts
````typescript
export * from "./types";
export * from "./engine";
export * from "./tokens";
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

            // Typing indicator
            typingBubbleColor: "#FFFFFF",
            typingDotColor: "#8E8E93",
            typingDotSize: 24,
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
    // Messages without 'at' field (initial messages) are always visible
    // Messages with 'at' field are visible when at <= t
    const messages = conversation.messages.filter(m => m.at === undefined || m.at <= t);

    const messageLayouts: Record<string, ChatMessageLayout> = {};
    let currentY = chatConfig.topPadding;

    // 1. Layout messages
    for (const msg of messages) {
        // Calculate height based on message type
        let height: number;

        if (msg.type === "system") {
            // System messages are shorter (single line centered pill)
            height = 80;
        } else if (msg.type === "voice") {
            // Voice messages have fixed height
            height = 180;
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

## File: packages/apps-whatsapp/src/runtime.ts
````typescript
import { produce } from "immer";
import { TimelineEvent, WorldState, ReducerRegistry } from "@tokovo/core";

export function whatsappReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_whatsapp") return;

    const conversationId = (event as any).conversationId;
    if (!conversationId) return;

    if (!draft.conversations[conversationId]) {
        draft.conversations[conversationId] = { id: conversationId, messages: [] };
    }
    const conversation = draft.conversations[conversationId];

    switch (event.type) {
        case "MESSAGE_RECEIVED":
            conversation.messages.push({
                id: `msg_${event.at}_${(event as any).from}_${(event as any).text?.substring(0, 5)}`,
                from: (event as any).from,
                text: (event as any).text,
                type: "text",
                at: event.at,
                status: "delivered"
            });
            break;

        case "TYPING_START":
            if (!conversation.typing) conversation.typing = {};
            conversation.typing[(event as any).from] = true;
            break;

        case "TYPING_END":
            if (conversation.typing) {
                delete conversation.typing[(event as any).from];
            }
            break;

        case "GROUP_MEMBER_ADDED":
            // Add system message
            const addedBy = (event as any).addedBy === "me" ? "You" : (event as any).addedBy;
            conversation.messages.push({
                id: `sys_${event.at}_added_${(event as any).memberId}`,
                from: "system",
                type: "system",
                systemType: "member_added",
                text: `${addedBy} added ${(event as any).memberName}`,
                targetMember: (event as any).memberName,
                actorName: addedBy,
                at: event.at
            });
            // Add member to list
            if (!conversation.members) conversation.members = [];
            conversation.members.push({
                id: (event as any).memberId,
                name: (event as any).memberName
            });
            break;

        case "GROUP_MEMBER_REMOVED":
            const removedBy = (event as any).removedBy === "me" ? "You" : (event as any).removedBy;
            conversation.messages.push({
                id: `sys_${event.at}_removed_${(event as any).memberId}`,
                from: "system",
                type: "system",
                systemType: "member_removed",
                text: `${removedBy} removed ${(event as any).memberName}`,
                targetMember: (event as any).memberName,
                actorName: removedBy,
                at: event.at
            });
            // Remove member from list
            if (conversation.members) {
                conversation.members = conversation.members.filter(
                    (m: any) => m.id !== (event as any).memberId
                );
            }
            break;

        case "VOICE_MESSAGE_RECEIVED":
            conversation.messages.push({
                id: `voice_${event.at}_${(event as any).from}`,
                from: (event as any).from,
                type: "voice",
                duration: (event as any).duration,
                at: event.at,
                status: "delivered"
            });
            break;

        case "MESSAGE_READ":
            const msg = conversation.messages.find((m: any) => m.id === (event as any).messageId);
            if (msg) {
                msg.status = "read";
            }
            break;
    }
}

// Register itself
ReducerRegistry.registerAppReducer("app_whatsapp", whatsappReducer);
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

## File: packages/episodes/src/index.ts
````typescript
import exampleEpisode from "./examples/whatsapp-breakup-01.json";
import androidEpisode from "./examples/android-test.json";
import instagramEpisode from "./examples/instagram-test.json";
import notificationCallDemo from "./examples/notification-call-demo.json";
import homeScreenGroupDemo from "./examples/homescreen-group-demo.json";

export * from "./schema";
export { exampleEpisode, androidEpisode, instagramEpisode, notificationCallDemo, homeScreenGroupDemo };
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

## File: packages/renderer/src/index.ts
````typescript
export { TokovoRenderer } from "./TokovoRenderer";
export { DeviceFrame } from "./DeviceFrame";
export { NotificationOverlay } from "./NotificationOverlay";
export { HeadsUpNotification } from "./HeadsUpNotification";
export { CallOverlay } from "./CallOverlay";
export { LockscreenView } from "./LockscreenView";
export { HomeScreenView } from "./HomeScreenView";
export { AppTransition, FaceIDAnimation, UnlockTransition } from "./AppTransition";
export { AppRegistry } from "./registry";
export * from "./layout";
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

## File: apps/video-runner/src/Root.tsx
````typescript
import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { AndroidVideo } from "./AndroidVideo";
import { InstagramVideo } from "./InstagramVideo";
import { NotificationCallDemoVideo } from "./NotificationCallDemoVideo";
import { HomeScreenGroupDemoVideo } from "./HomeScreenGroupDemoVideo";

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
        </>
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
    isLocked: boolean;
    foregroundAppId?: string;
    notifications: Notification[];
    call?: CallState;
    homeScreen?: HomeScreenConfig;
    sound?: {
        activeSoundId?: string;
    };
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
    // Camera events
    | { at: number; kind: "CAMERA"; type: "SET_VIEW"; view: CameraViewConfig }
    // Audio events
    | { at: number; kind: "AUDIO"; type: "PLAY_SOUND"; soundId: string; volume?: number };

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
import { WorldState, Notification } from "@tokovo/core";
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
}> = ({ world, t, debug, notificationConfig = {} }) => {
    const {
        headsUpDuration = 150,
        showHeadsUpWhenAppOpen = true
    } = notificationConfig;

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
    // Header: ~414px (270px header + 144px status bar area)
    // Input: ~272px (input field + home indicator)
    const chatHeaderHeight = 414;
    const chatInputHeight = 272;
    const effectiveViewportHeight = viewKind === "CHAT"
        ? profile.dimensions.height - chatHeaderHeight - chatInputHeight
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

    // 6. Apply Device Transforms
    let deviceStyle: React.CSSProperties = {
        transformOrigin: "center center",
        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)"
    };

    if (layout.kind === "TRANSITION") {
        const transLayout = layout as any;
        const { deviceScale, deviceTranslateX, deviceTranslateY, deviceRotation } = transLayout;
        deviceStyle.transform = `translate(${deviceTranslateX}px, ${deviceTranslateY}px) scale(${deviceScale}) rotate(${deviceRotation}deg)`;
    }

    // 7. Find active notifications for heads-up display
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

    // 8. Check for active call
    const hasActiveCall = device.call && device.call.status !== "ended";

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
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
                        <AppView world={world} t={t} layout={layout} />
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

            {debug && <VisualDebugger world={world} t={t} />}
        </div>
    );
};
````

## File: packages/apps-whatsapp/src/ui.tsx
````typescript
import React from "react";
import { WorldState, Platform, getTokens, getTypography, getAppConfig, iOSTokens, androidTokens } from "@tokovo/core";
import { TypingBubble } from "./TypingBubble";
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
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    layout,
    isTyping,
    conversationType,
    platform = "ios"
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
                        const isMe = msg.from === "me";
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
                                />
                            </div>
                        );
                    }

                    // Render regular text messages
                    const isMe = msg.from === "me";
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

                                {/* Timestamp + Read receipts */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    gap: config.bubbleGap * 0.75,
                                    marginTop: 3
                                }}>
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
                {isTyping && chatLayout?.typingLayout && (
                    <div style={{
                        position: "absolute",
                        top: chatLayout.typingLayout.y,
                        left: config.bubbleMarginHorizontal,
                        opacity: chatLayout.typingLayout.opacity
                    }}>
                        <TypingBubble />
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// INPUT AREA - Authentic WhatsApp iOS Composer
// ============================================================================

interface InputAreaProps {
    text?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ text }) => (
    <div style={{
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "24px 30px",
        gap: 24,
        borderTop: "1px solid rgba(0,0,0,0.1)"
    }}>
        {/* Plus button */}
        <PlusCircleIcon />

        {/* Input field */}
        <div style={{
            flex: 1,
            minHeight: 120,
            backgroundColor: "#FFFFFF",
            borderRadius: 60,
            padding: "27px 48px",
            display: "flex",
            alignItems: "center",
            fontSize: 48,
            color: text ? "#111B21" : "#8E8E93",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
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
                backgroundColor: "#25D366",
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

const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
    isMe,
    duration,
    isPlaying = false,
    progress = 0,
    timestamp,
    read
}) => {
    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            padding: "6px 36px"
        }}>
            <div style={{
                backgroundColor: isMe ? "#E7FFDB" : "#FFFFFF",
                padding: "24px 30px",
                borderRadius: 24,
                borderTopLeftRadius: isMe ? 24 : 6,
                borderTopRightRadius: isMe ? 6 : 24,
                boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                display: "flex",
                alignItems: "center",
                gap: 18,
                minWidth: 450
            }}>
                {/* Play/Pause Button */}
                <div style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    backgroundColor: isMe ? "#D4F5C8" : "#F0F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </div>

                {/* Waveform */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        height: 60
                    }}>
                        {Array.from({ length: 30 }).map((_, i) => {
                            const height = Math.sin(i * 0.6) * 20 + 25;
                            const isActive = i < 30 * progress;
                            return (
                                <div key={i} style={{
                                    width: 6,
                                    height: `${height}px`,
                                    backgroundColor: isActive ? "#25D366" : "#92B09E",
                                    borderRadius: 3
                                }} />
                            );
                        })}
                    </div>

                    {/* Duration + Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 30, color: "#667781" }}>
                            {formatDuration(Math.floor(duration * (isPlaying ? progress : 1)))}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <span style={{ fontSize: 30, color: "#667781" }}>
                                {timestamp || "10:42"}
                            </span>
                            {isMe && <DoubleCheckIcon read={read !== false} />}
                        </div>
                    </div>
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

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];
    const isTyping = conversation?.typing?.["other"] || false;
    const draftText = "";

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
            />
            <WhatsApp.InputArea text={draftText} />
            <HomeIndicator />
        </WhatsApp.Root>
    );
};
````
