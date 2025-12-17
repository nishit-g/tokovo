/**
 * Audio Types - All audio-related types
 * 
 * @description Audio buses, sound cues, music beds, and state.
 */

// =============================================================================
// AUDIO BUS TYPES
// =============================================================================

export type AudioBus = "music" | "ui" | "sfx" | "voice" | "master";
export type SoundOrigin = "device" | "app" | "world";

export interface AudioBusConfig {
    baseGain: number;
    maxConcurrent: number;
}

// =============================================================================
// AUDIO ENVELOPE
// =============================================================================

export interface AudioEnvelope {
    attack: number;
    release: number;
    curve?: "linear" | "easeOut" | "easeIn";
}

// =============================================================================
// DUCK RULE
// =============================================================================

export interface DuckRule {
    targetBus: AudioBus;
    amount: number;
    attack: number;
    release: number;
}

// =============================================================================
// SOUND CUE
// =============================================================================

export interface SoundCue {
    soundId: string;
    startFrame: number;
    volume: number;
    loop?: boolean;
    deviceId?: string;
    duration?: number;
    bus: AudioBus;
    priority: number;
    origin?: SoundOrigin;
    envelope?: AudioEnvelope;
    duck?: DuckRule;
    fadeTarget?: number;
    fadeDuration?: number;
    fadeStartFrame?: number;
}

// =============================================================================
// ACTIVE SOUND (Legacy)
// =============================================================================

export interface ActiveSound {
    soundId: string;
    startFrame: number;
    volume: number;
    loop?: boolean;
    deviceId?: string;
    duration?: number;
}

// =============================================================================
// MUSIC BED
// =============================================================================

export interface MusicBed {
    id: string;
    soundId: string;
    startFrame: number;
    loop: boolean;
    baseGain: number;
    moodTag?: "tense" | "romantic" | "chaotic" | "calm" | "dramatic";
    crossfadeFrames?: number;
}

// =============================================================================
// AUDIO STATE
// =============================================================================

export interface AudioState {
    activeSounds: Record<string, SoundCue | ActiveSound>;
    buses: {
        music: AudioBusConfig;
        ui: AudioBusConfig;
        sfx: AudioBusConfig;
        voice: AudioBusConfig;
    };
    musicBed?: MusicBed;
    backgroundMusic?: {
        soundId: string;
        volume: number;
        loop: boolean;
        startFrame: number;
    };
}

export const DEFAULT_BUS_CONFIG: AudioState["buses"] = {
    music: { baseGain: 0.35, maxConcurrent: 1 },
    ui: { baseGain: 0.9, maxConcurrent: 3 },
    sfx: { baseGain: 0.8, maxConcurrent: 4 },
    voice: { baseGain: 1.0, maxConcurrent: 1 },
};

export const DEFAULT_AUDIO_STATE: AudioState = {
    activeSounds: {},
    buses: DEFAULT_BUS_CONFIG,
};

// =============================================================================
// VIDEO CONFIG
// =============================================================================

export interface VideoConfig {
    backgroundColor?: string;
    width?: number;
    height?: number;
    fps?: number;
    layout?: {
        splitLineColor?: string;
        splitLineWidth?: number;
        pipBorderColor?: string;
        pipBorderWidth?: number;
        pipShadow?: string;
    };
    watermark?: {
        text?: string;
        image?: string;
        position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
        opacity?: number;
    };
}

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
