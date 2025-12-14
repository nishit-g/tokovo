/**
 * Spotify Runtime Reducer
 * 
 * Handles Spotify-specific events and state updates.
 */

import { produce } from "immer";
import { WorldState, TimelineEvent, PluginManager } from "@tokovo/core";
import { SpotifyAppState, DEFAULT_SPOTIFY_STATE, SAMPLE_TRACKS } from "./types";

// =============================================================================
// EVENT TYPES
// =============================================================================

export interface SpotifyPlayEvent extends TimelineEvent {
    kind: "APP";
    appId: "app_spotify";
    type: "PLAY_TRACK";
    trackId?: string;
    track?: {
        name: string;
        artist: string;
        album?: string;
        albumArt?: string;
    };
}

export interface SpotifyPauseEvent extends TimelineEvent {
    kind: "APP";
    appId: "app_spotify";
    type: "PAUSE";
}

export interface SpotifyResumeEvent extends TimelineEvent {
    kind: "APP";
    appId: "app_spotify";
    type: "RESUME";
}

export interface SpotifySkipEvent extends TimelineEvent {
    kind: "APP";
    appId: "app_spotify";
    type: "SKIP_NEXT" | "SKIP_PREVIOUS";
}

// =============================================================================
// REDUCER
// =============================================================================

export function spotifyReducer(
    world: WorldState,
    event: TimelineEvent
): WorldState {
    if (event.kind !== "APP" || (event as any).appId !== "app_spotify") {
        return world;
    }

    return produce(world, (draft) => {
        // Ensure spotify app state exists
        if (!draft.appState.app_spotify) {
            draft.appState.app_spotify = { ...DEFAULT_SPOTIFY_STATE };
        }

        const spotify = draft.appState.app_spotify as SpotifyAppState;
        const eventType = (event as any).type;

        switch (eventType) {
            case "PLAY_TRACK": {
                const playEvent = event as SpotifyPlayEvent;

                // Find track by ID or use provided track data
                let track = SAMPLE_TRACKS.find(t => t.id === playEvent.trackId);

                if (!track && playEvent.track) {
                    // Create track from event data
                    track = {
                        id: `track_${event.at}`,
                        name: playEvent.track.name,
                        artist: playEvent.track.artist,
                        album: playEvent.track.album || "Unknown Album",
                        albumArt: playEvent.track.albumArt,
                        durationMs: 180000, // Default 3 min
                    };
                }

                if (track) {
                    spotify.nowPlaying = {
                        track,
                        state: "playing",
                        progressMs: 0,
                        startedAtFrame: event.at,
                        shuffleEnabled: false,
                        repeatMode: "off",
                    };
                }
                break;
            }

            case "PAUSE": {
                if (spotify.nowPlaying) {
                    spotify.nowPlaying.state = "paused";
                }
                break;
            }

            case "RESUME": {
                if (spotify.nowPlaying) {
                    spotify.nowPlaying.state = "playing";
                }
                break;
            }

            case "SKIP_NEXT": {
                // For demo, just switch to next sample track
                if (spotify.nowPlaying) {
                    const currentIdx = SAMPLE_TRACKS.findIndex(
                        t => t.id === spotify.nowPlaying?.track.id
                    );
                    const nextIdx = (currentIdx + 1) % SAMPLE_TRACKS.length;
                    spotify.nowPlaying = {
                        track: SAMPLE_TRACKS[nextIdx],
                        state: "playing",
                        progressMs: 0,
                        startedAtFrame: event.at,
                        shuffleEnabled: spotify.nowPlaying.shuffleEnabled,
                        repeatMode: spotify.nowPlaying.repeatMode,
                    };
                }
                break;
            }

            case "NAVIGATE": {
                const screen = (event as any).screen;
                if (screen) {
                    spotify.screen = screen;
                }
                break;
            }

            case "MINIMIZE": {
                spotify.isMinimized = true;
                break;
            }

            case "MAXIMIZE": {
                spotify.isMinimized = false;
                break;
            }
        }
    });
}

// =============================================================================
// REGISTER PLUGIN
// =============================================================================

import { SpotifyDynamicIslandWidget, SpotifyStatusBarWidget } from "./widgets";

// Register Spotify as a plugin with widgets
PluginManager.register({
    id: "app_spotify",
    name: "Spotify",
    version: "1.0.0",
    icon: "♪",
    primaryColor: "#1DB954",
    reducer: spotifyReducer,

    // Platform-specific widgets
    widgets: [
        {
            mode: "dynamicIsland",
            platforms: ["ios"],
            priority: 80,  // Music gets high priority
            component: SpotifyDynamicIslandWidget as any,
            expansionModes: ["minimal", "compact", "expanded"],
        },
        {
            mode: "statusBar",
            platforms: ["android"],
            priority: 80,
            component: SpotifyStatusBarWidget as any,
        },
    ],
});
