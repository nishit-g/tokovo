/**
 * Spotify Types
 * 
 * Data structures for Spotify app state, tracks, and playback.
 */

// =============================================================================
// TRACK & PLAYLIST
// =============================================================================

export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt?: string;         // URL to album artwork
    durationMs: number;        // Track duration in milliseconds
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    coverArt?: string;
    tracks: SpotifyTrack[];
}

// =============================================================================
// PLAYBACK STATE
// =============================================================================

export type PlaybackState = "playing" | "paused" | "stopped";

export interface NowPlaying {
    track: SpotifyTrack;
    state: PlaybackState;
    progressMs: number;        // Current position in track
    startedAtFrame: number;    // Frame when playback started
    shuffleEnabled: boolean;
    repeatMode: "off" | "all" | "one";
}

// =============================================================================
// SPOTIFY APP STATE
// =============================================================================

export type SpotifyScreen = "home" | "search" | "library" | "player" | "playlist";

export interface SpotifyAppState {
    screen: SpotifyScreen;
    nowPlaying?: NowPlaying;
    currentPlaylist?: SpotifyPlaylist;
    recentlyPlayed: SpotifyTrack[];
    isMinimized: boolean;      // Widget mode vs full app
}

// =============================================================================
// DEFAULT STATE
// =============================================================================

export const DEFAULT_SPOTIFY_STATE: SpotifyAppState = {
    screen: "home",
    nowPlaying: undefined,
    recentlyPlayed: [],
    isMinimized: false,
};

// =============================================================================
// SAMPLE TRACKS (for demos)
// =============================================================================

export const SAMPLE_TRACKS: SpotifyTrack[] = [
    {
        id: "track_1",
        name: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        albumArt: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
        durationMs: 200000,
    },
    {
        id: "track_2",
        name: "As It Was",
        artist: "Harry Styles",
        album: "Harry's House",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14",
        durationMs: 167000,
    },
    {
        id: "track_3",
        name: "Anti-Hero",
        artist: "Taylor Swift",
        album: "Midnights",
        albumArt: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5",
        durationMs: 200000,
    },
    {
        id: "track_4",
        name: "Unholy",
        artist: "Sam Smith & Kim Petras",
        album: "Gloria",
        albumArt: "https://i.scdn.co/image/ab67616d0000b2730895066d172e1f51f520bc65",
        durationMs: 157000,
    },
];
