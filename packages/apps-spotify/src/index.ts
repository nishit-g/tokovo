/**
 * @tokovo/apps-spotify - Spotify App Package
 * 
 * Features:
 * - Now Playing widget (background music visualization)
 * - Dynamic Island widget (iOS)
 * - Status bar widget (Android)
 * - Full player UI
 * - Notification adapter for music notifications
 */

import { definePlugin, APP_IDS } from "@tokovo/core";
import { spotifyReducer } from "./runtime";
import { SpotifyPlayer } from "./ui";
import { SpotifyDynamicIslandWidget, SpotifyStatusBarWidget } from "./widgets";
import { SpotifyNotificationAdapter } from "./notification-adapter";

export * from "./runtime";
export * from "./ui";
export * from "./widgets";

export const Spotify = definePlugin({
    id: "app_spotify",
    name: "Spotify",
    version: "1.0.0",

    // 1. Metadata
    metadata: {
        name: "Spotify",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/232px-Spotify_icon.svg.png",
        themeColor: "#1DB954",
        version: "1.0.0",
    },

    // 2. Views
    appView: SpotifyPlayer as any,

    // 3. Logic
    reducer: spotifyReducer,

    // 4. Notifications
    notificationAdapter: SpotifyNotificationAdapter as any,

    // 5. Widgets
    widgets: [
        {
            mode: "dynamicIsland",
            platforms: ["ios"],
            priority: 80,
            component: SpotifyDynamicIslandWidget as any,
            expansionModes: ["minimal", "compact", "expanded"],
        },
        {
            mode: "statusBar",
            platforms: ["android"],
            priority: 80,
            component: SpotifyStatusBarWidget as any,
        }
    ],

    // 6. Assets
    sounds: {},

    // 7. Event Types
    eventTypes: ["PLAY_TRACK", "PAUSE", "RESUME", "SKIP_NEXT", "SKIP_PREVIOUS"]
});

export default Spotify;
