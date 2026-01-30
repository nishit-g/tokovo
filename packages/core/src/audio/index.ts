/**
 * Audio System - Production-grade audio mixing for Tokovo
 *
 * Exports all audio-related modules:
 * - Mixer: Bus routing, ducking, envelopes
 * - Policies: Spam gate, concurrency, priority
 * - Auto-Sound: Derive sounds from events
 * - Music Bed: Background music with crossfade
 */

// Mixer
export {
  computeSoundVolume,
  computeBusStates,
  computeBusDuckMultiplier,
  applyEnvelope,
  createSoundCue,
  createUISoundCue,
  createVoiceSoundCue,
  type BusState,
  type MixerContext,
} from "./mixer";

// Policies
export {
  SpamGate,
  enforceBusConcurrency,
  getDefaultPriority,
  sortByPriority,
  shouldInterrupt,
  checkAllPolicies,
  DEFAULT_POLICY_CONFIG,
  PRIORITY_LEVELS,
  type PolicyConfig,
  type PolicyResult,
} from "./policies";

// Auto-Sound
export {
  AutoSoundRegistry,
  deriveAudioInstructions,
  type AutoSoundRule,
  type AutoSoundAction,
  type AudioInstruction,
} from "./auto-sound";

// Music Bed
export {
  computeCrossfade,
  createMusicBed,
  createTenseMusicBed,
  createDramaticMusicBed,
  createCalmMusicBed,
  getMusicByMood,
  suggestMood,
  type CrossfadeState,
  type CrossfadeResult,
} from "./music-bed";

// Sound paths
export { getSoundPath } from "./sounds";
