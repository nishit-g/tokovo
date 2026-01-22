/**
 * TrackEpisodeIR - Intermediate representation from DSL build()
 *
 * This is what ep.build() returns.
 * It contains devices, tracks, markers, and director config.
 * prepareEpisode() transforms this into CompiledEpisode.
 */

import type { TrackEvent } from "./track-event";

// =============================================================================
// DEVICE CONFIG
// =============================================================================

export interface ConversationConfig {
    id: string;
    name: string;
    avatar?: string;
    type?: "dm" | "group";
    participants?: string[];
    unreadCount?: number;
    isMuted?: boolean;
    isPinned?: boolean;
    hasStatus?: boolean;
}

export interface OSConfig {
    time?: Date | number;
    battery?: number;
    charging?: boolean;
    network?: "wifi" | "5G" | "4G" | "3G" | "none";
    strength?: number;
    dnd?: boolean;
}

export interface DeviceConfig {
    id: string;
    profile: string;
    app: string;
    conversations?: ConversationConfig[];
    os?: OSConfig;
    /** UI theme/strategy to use (e.g., "whatsapp-ghibli") */
    theme?: string;
}

// =============================================================================
// MARKER/SECTION
// =============================================================================

export interface Marker {
    id: string;
    frame: number;
}

export interface Section {
    id: string;
    startFrame: number;
    endFrame: number;
}

// =============================================================================
// DIRECTOR STYLE
// =============================================================================

export type DirectorStyle = "ViralDramaV1" | "Cinematic" | "Documentary";

// =============================================================================
// TRACK EPISODE IR
// =============================================================================

/**
 * TrackEpisodeIR - The output of ep.build()
 *
 * This is the intermediate representation that the DSL produces.
 * It gets passed to prepareEpisode() along with plugins to create CompiledEpisode.
 */
export interface TrackEpisodeIR {
    /** Episode ID */
    id: string;

    /** Frames per second */
    fps: number;

    /** Total duration in frames */
    durationInFrames: number;

    /** Episode title (metadata) */
    title?: string;

    /** Episode description (metadata) */
    description?: string;

    /** Device configurations */
    devices: DeviceConfig[];

    /** All track events (sorted by frame + declaration order) */
    events: TrackEvent[];

    /** Point markers for debugging */
    markers: Marker[];

    /** Section markers for debugging */
    sections: Section[];

    /** Optional director style for auto-camera */
    director?: DirectorStyle;
}

// =============================================================================
// EPISODE CONFIG
// =============================================================================

/**
 * Config passed to episode() function
 */
export interface TrackEpisodeConfig {
    fps: number;
    duration: string | number;
    title?: string;
    description?: string;
}
