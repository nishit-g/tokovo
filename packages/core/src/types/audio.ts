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

export interface SoundCueMetadata {
  segmentId?: string;
  speaker?: string;
  text?: string;
  [key: string]: unknown;
}

export interface SoundCue {
  readonly soundId: string;
  readonly startFrame: number;
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
  audioStartFrom?: number;
  playbackRate?: number;
  toneFrequency?: number;
  loopVolumeCurveBehavior?: "repeat" | "extend";
  metadata?: SoundCueMetadata;
}

// =============================================================================
// MUSIC BED
// =============================================================================

export type MoodTag = "tense" | "romantic" | "chaotic" | "calm" | "dramatic";

export type CrossfadeCurve = "linear" | "easeInOut" | "easeIn" | "easeOut";

export interface MusicBed {
  readonly id?: string;
  readonly soundId: string;
  readonly startFrame: number;
  loop: boolean;
  baseGain: number;
  moodTag?: MoodTag;
  crossfadeFrames?: number;
  crossfadeCurve?: CrossfadeCurve;
  fadeOutStart?: number;
  fadeOutDuration?: number;
}

// =============================================================================
// AUDIO STATE
// =============================================================================

export interface AudioPolicyState {
  recentSounds: Map<string, number>; // For spam prevention
  nextId: number; // For deterministic ID generation
}

export interface AudioState {
  activeSounds: Record<string, SoundCue>;
  buses: {
    music: AudioBusConfig;
    ui: AudioBusConfig;
    sfx: AudioBusConfig;
    voice: AudioBusConfig;
    master?: AudioBusConfig;
  };
  musicBed?: MusicBed;
  outgoingMusicBed?: MusicBed;
  policyState: AudioPolicyState; // For deterministic policies
  autoSoundRules: unknown[]; // AutoSoundRule[] - using unknown to avoid circular dependency
}

// =============================================================================
// AUDIO STATE
// =============================================================================

export interface AudioState {
  activeSounds: Record<string, SoundCue>;
  buses: {
    music: AudioBusConfig;
    ui: AudioBusConfig;
    sfx: AudioBusConfig;
    voice: AudioBusConfig;
    master?: AudioBusConfig;
  };
  musicBed?: MusicBed;
  outgoingMusicBed?: MusicBed;
  policyState: AudioPolicyState;
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
  policyState: {
    recentSounds: new Map(),
    nextId: 0,
  },
  autoSoundRules: [],
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
