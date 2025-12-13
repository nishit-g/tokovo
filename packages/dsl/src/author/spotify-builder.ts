/**
 * Spotify Builder
 * 
 * DSL helpers for Spotify events (playback, notifications).
 */

// =============================================================================
// SPOTIFY DSL HELPERS
// =============================================================================

export interface SpotifyTrackInfo {
    name: string;
    artist: string;
    album?: string;
    albumArt?: string;
}

export const spotify = {
    /**
     * Start playing a track (starts background music visualization)
     */
    play(track: SpotifyTrackInfo) {
        return {
            kind: "APP" as const,
            appId: "app_spotify",
            type: "PLAY_TRACK" as const,
            track,
        };
    },

    /**
     * Pause current playback
     */
    pause() {
        return {
            kind: "APP" as const,
            appId: "app_spotify",
            type: "PAUSE" as const,
        };
    },

    /**
     * Resume playback
     */
    resume() {
        return {
            kind: "APP" as const,
            appId: "app_spotify",
            type: "RESUME" as const,
        };
    },

    /**
     * Skip to next track
     */
    skipNext() {
        return {
            kind: "APP" as const,
            appId: "app_spotify",
            type: "SKIP_NEXT" as const,
        };
    },

    /**
     * Skip to previous track
     */
    skipPrevious() {
        return {
            kind: "APP" as const,
            appId: "app_spotify",
            type: "SKIP_PREVIOUS" as const,
        };
    },

    /**
     * Show "Now Playing" notification
     */
    nowPlayingNotification(deviceId: string, track: SpotifyTrackInfo) {
        return {
            kind: "DEVICE" as const,
            deviceId,
            type: "SHOW_NOTIFICATION" as const,
            appId: "app_spotify",
            title: "Now Playing",
            body: `${track.name} • ${track.artist}`,
            mode: "headsup" as const,
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/232px-Spotify_icon.svg.png",
        };
    },

    /**
     * Start Spotify in background (for status bar indicator)
     */
    startBackground(deviceId: string, track: SpotifyTrackInfo) {
        return {
            kind: "DEVICE" as const,
            deviceId,
            type: "START_BACKGROUND_APP" as const,
            appId: "app_spotify",
            indicator: "music" as const,
            label: `${track.name} - ${track.artist}`,
        };
    },

    /**
     * Stop background playback
     */
    stopBackground(deviceId: string) {
        return {
            kind: "DEVICE" as const,
            deviceId,
            type: "STOP_BACKGROUND_APP" as const,
            appId: "app_spotify",
        };
    },
};

// =============================================================================
// SAMPLE TRACKS FOR DEMOS
// =============================================================================

export const DEMO_TRACKS: Record<string, SpotifyTrackInfo> = {
    blindingLights: {
        name: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        albumArt: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    },
    asItWas: {
        name: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14",
    },
    antiHero: {
        name: "Anti-Hero",
        artist: "Taylor Swift",
        album: "Midnights",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5",
    },
    heatWaves: {
        name: "Heat Waves",
        artist: "Glass Animals",
        album: "Dreamland",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273712701c5e263efc8726b1464",
    },
    stayWithMe: {
        name: "Stay With Me",
        artist: "Sam Smith",
        album: "In The Lonely Hour",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273f8dba7a87f3ae0c1c8f3c3a0",
    },
};
