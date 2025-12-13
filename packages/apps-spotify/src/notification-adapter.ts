/**
 * Spotify Notification Adapter
 * 
 * Converts Spotify events into notification content.
 * OS surfaces render this using NotificationOverlay/HeadsUpNotification.
 */

import { SpotifyAppState, NowPlaying, SpotifyTrack } from "./types";

// =============================================================================
// NOTIFICATION ADAPTER INTERFACE
// =============================================================================

export interface NotificationContent {
    appId: string;
    appName: string;
    appIcon: string;
    accentColor: string;
    title: string;
    body: string;
    preview?: {
        kind: "text" | "image";
        value: string;
    };
    threadId?: string;
    soundId?: string;
}

// =============================================================================
// SPOTIFY ADAPTER
// =============================================================================

export const SPOTIFY_APP_ID = "app_spotify";
export const SPOTIFY_APP_NAME = "Spotify";
export const SPOTIFY_ICON = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/232px-Spotify_icon.svg.png";
export const SPOTIFY_ACCENT = "#1DB954";

/**
 * Format a Spotify Now Playing state into notification content
 */
export function formatSpotifyNotification(
    nowPlaying: NowPlaying,
    type: "now_playing" | "track_change" | "liked"
): NotificationContent {
    const { track } = nowPlaying;

    switch (type) {
        case "now_playing":
            return {
                appId: SPOTIFY_APP_ID,
                appName: SPOTIFY_APP_NAME,
                appIcon: SPOTIFY_ICON,
                accentColor: SPOTIFY_ACCENT,
                title: "Now Playing",
                body: `${track.name} • ${track.artist}`,
                preview: track.albumArt
                    ? { kind: "image", value: track.albumArt }
                    : undefined,
                threadId: "spotify_playback",
            };

        case "track_change":
            return {
                appId: SPOTIFY_APP_ID,
                appName: SPOTIFY_APP_NAME,
                appIcon: SPOTIFY_ICON,
                accentColor: SPOTIFY_ACCENT,
                title: track.name,
                body: `${track.artist} • ${track.album}`,
                preview: track.albumArt
                    ? { kind: "image", value: track.albumArt }
                    : undefined,
                threadId: "spotify_playback",
            };

        case "liked":
            return {
                appId: SPOTIFY_APP_ID,
                appName: SPOTIFY_APP_NAME,
                appIcon: SPOTIFY_ICON,
                accentColor: SPOTIFY_ACCENT,
                title: "Added to Liked Songs",
                body: `${track.name} by ${track.artist}`,
                threadId: "spotify_likes",
            };
    }
}

/**
 * Create a simple text notification from Spotify
 */
export function createSpotifyTextNotification(
    title: string,
    body: string
): NotificationContent {
    return {
        appId: SPOTIFY_APP_ID,
        appName: SPOTIFY_APP_NAME,
        appIcon: SPOTIFY_ICON,
        accentColor: SPOTIFY_ACCENT,
        title,
        body,
    };
}

// =============================================================================
// SPOTIFY NOTIFICATION ADAPTER (for global registry)
// =============================================================================

export const SpotifyNotificationAdapter = {
    appId: SPOTIFY_APP_ID,
    appName: SPOTIFY_APP_NAME,
    appIcon: SPOTIFY_ICON,
    accentColor: SPOTIFY_ACCENT,

    /**
     * Format notification from raw event
     */
    format(event: { title: string; body: string; preview?: string }): NotificationContent {
        return {
            appId: SPOTIFY_APP_ID,
            appName: SPOTIFY_APP_NAME,
            appIcon: SPOTIFY_ICON,
            accentColor: SPOTIFY_ACCENT,
            title: event.title,
            body: event.body,
            preview: event.preview
                ? { kind: "image", value: event.preview }
                : undefined,
        };
    },
};
