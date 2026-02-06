/**
 * Audio Policies - Deterministic rules for audio behavior
 *
 * Handles:
 * - Spam gate (same sound repeated too fast)
 * - Concurrency limits per bus
 * - Priority-based sound selection
 */

import { SoundCue, AudioBus } from "../types.js";
import { AudioLogger } from "../engine/logger.js";

// =============================================================================
// TYPES
// =============================================================================

export interface PolicyConfig {
  spamGateFrames: number; // Min frames between same sound
  softVariant?: string | null; // Alternative sound for spam (null disables softening)
  maxConcurrentPerBus: Record<AudioBus, number>;
}

// Default policy configuration
export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  spamGateFrames: 8,
  softVariant: "_soft",
  maxConcurrentPerBus: {
    music: 1,
    ui: 3,
    sfx: 4,
    voice: 1,
    master: 10,
  },
};

// Priority levels by bus type
export const PRIORITY_LEVELS: Record<AudioBus, number> = {
  voice: 100,
  sfx: 50,
  ui: 30,
  music: 10,
  master: 0,
};

// =============================================================================
// SPAM GATE (PURE FUNCTIONS - for deterministic rendering)
// =============================================================================

export interface SpamCheckResult {
  shouldPlay: boolean;
  alternateSound?: string;
  updatedRecentSounds: Record<string, number>;
}

export function checkSpamPure(
  soundId: string,
  frame: number,
  recentSounds: Record<string, number>,
  config: PolicyConfig = DEFAULT_POLICY_CONFIG,
): SpamCheckResult {
  const updatedRecentSounds = { ...recentSounds };
  const lastFrame = recentSounds[soundId];

  if (lastFrame === undefined) {
    updatedRecentSounds[soundId] = frame;
    return { shouldPlay: true, updatedRecentSounds };
  }

  if (frame - lastFrame < config.spamGateFrames) {
    const softSuffix =
      config.softVariant === null ? null : config.softVariant || "_soft";
    if (!softSuffix) {
      return { shouldPlay: false, updatedRecentSounds: recentSounds };
    }
    return {
      shouldPlay: false,
      alternateSound: soundId + softSuffix,
      updatedRecentSounds: recentSounds,
    };
  }

  updatedRecentSounds[soundId] = frame;
  return { shouldPlay: true, updatedRecentSounds };
}

export function cleanupRecentSounds(
  recentSounds: Record<string, number>,
  currentFrame: number,
  maxAge: number = 300,
): Record<string, number> {
  const cleaned: Record<string, number> = {};
  for (const [soundId, frame] of Object.entries(recentSounds)) {
    if (currentFrame - frame <= maxAge) {
      cleaned[soundId] = frame;
    }
  }
  return cleaned;
}

// =============================================================================
// SPAM GATE (CLASS - DEPRECATED, use pure functions above)
// =============================================================================

/**
 * @deprecated Use checkSpamPure() for deterministic rendering.
 * This class maintains internal state which breaks replay determinism.
 */
export class SpamGate {
  private recentSounds: Map<string, number> = new Map();
  private config: PolicyConfig;

  constructor(config: PolicyConfig = DEFAULT_POLICY_CONFIG) {
    this.config = config;
  }

  checkSpam(
    soundId: string,
    frame: number,
  ): { shouldPlay: boolean; alternateSound?: string } {
    const lastFrame = this.recentSounds.get(soundId);

    if (lastFrame === undefined) {
      this.recentSounds.set(soundId, frame);
      return { shouldPlay: true };
    }

    if (frame - lastFrame < this.config.spamGateFrames) {
      const softSuffix =
        this.config.softVariant === null ? null : this.config.softVariant || "_soft";
      if (!softSuffix) {
        return { shouldPlay: false };
      }
      return {
        shouldPlay: false,
        alternateSound: soundId + softSuffix,
      };
    }

    this.recentSounds.set(soundId, frame);
    return { shouldPlay: true };
  }

  reset(): void {
    this.recentSounds.clear();
  }

  cleanup(currentFrame: number, maxAge: number = 300): void {
    for (const [soundId, frame] of this.recentSounds.entries()) {
      if (currentFrame - frame > maxAge) {
        this.recentSounds.delete(soundId);
      }
    }
  }
}

// =============================================================================
// CONCURRENCY LIMIT
// =============================================================================

export function enforceBusConcurrency(
  newCue: SoundCue,
  activeCues: SoundCue[],
  maxConcurrent: number,
): { shouldAdd: boolean; toRemove: string[] } {
  const sameBusCues = activeCues.filter((cue) => cue.bus === newCue.bus);

  // If under limit, allow
  if (sameBusCues.length < maxConcurrent) {
    return { shouldAdd: true, toRemove: [] };
  }

  // Sort by priority (lowest first)
  const sorted = [...sameBusCues].sort((a, b) => a.priority - b.priority);

  // If new cue has higher priority than lowest, replace it
  if (sorted.length > 0 && newCue.priority > sorted[0].priority) {
    return {
      shouldAdd: true,
      toRemove: [sorted[0].soundId],
    };
  }

  // New cue doesn't make the cut
  return { shouldAdd: false, toRemove: [] };
}

// =============================================================================
// PRIORITY SYSTEM
// =============================================================================

/**
 * Get default priority for a bus type
 */
export function getDefaultPriority(bus: AudioBus): number {
  return PRIORITY_LEVELS[bus] ?? 50;
}

/**
 * Sort sounds by priority (highest first)
 */
export function sortByPriority(sounds: SoundCue[]): SoundCue[] {
  return [...sounds].sort((a, b) => b.priority - a.priority);
}

/**
 * Check if a new sound should interrupt/replace an existing one
 */
export function shouldInterrupt(
  existing: SoundCue,
  incoming: SoundCue,
): boolean {
  // Voice always wins
  if (incoming.bus === "voice") {
    return true;
  }

  // Higher priority wins
  if (incoming.priority > existing.priority) {
    return true;
  }

  return false;
}

// =============================================================================
// COMBINED POLICY CHECK
// =============================================================================

export interface PolicyResult {
  shouldPlay: boolean;
  soundId: string;
  toRemove: string[];
  reason?: string;
  updatedRecentSounds?: Record<string, number>;
}

export function checkAllPoliciesPure(
  cue: SoundCue,
  frame: number,
  activeCues: SoundCue[],
  recentSounds: Record<string, number>,
  config: PolicyConfig = DEFAULT_POLICY_CONFIG,
): PolicyResult {
  const spamResult = checkSpamPure(cue.soundId, frame, recentSounds, config);

  if (!spamResult.shouldPlay) {
    if (spamResult.alternateSound) {
      return {
        shouldPlay: true,
        soundId: spamResult.alternateSound,
        toRemove: [],
        reason: "spam_softened",
        updatedRecentSounds: spamResult.updatedRecentSounds,
      };
    }
    return {
      shouldPlay: false,
      soundId: cue.soundId,
      toRemove: [],
      reason: "spam_dropped",
      updatedRecentSounds: spamResult.updatedRecentSounds,
    };
  }

  const maxConcurrent = config.maxConcurrentPerBus[cue.bus] ?? 10;
  const concurrencyResult = enforceBusConcurrency(
    cue,
    activeCues,
    maxConcurrent,
  );

  if (!concurrencyResult.shouldAdd) {
    return {
      shouldPlay: false,
      soundId: cue.soundId,
      toRemove: [],
      reason: "concurrency_limit",
      updatedRecentSounds: spamResult.updatedRecentSounds,
    };
  }

  return {
    shouldPlay: true,
    soundId: cue.soundId,
    toRemove: concurrencyResult.toRemove,
    updatedRecentSounds: spamResult.updatedRecentSounds,
  };
}

/**
 * @deprecated Use checkAllPoliciesPure() for deterministic rendering.
 * This function uses the mutable SpamGate class which breaks replay.
 */
export function checkAllPolicies(
  cue: SoundCue,
  frame: number,
  activeCues: SoundCue[],
  spamGate: SpamGate,
  config: PolicyConfig = DEFAULT_POLICY_CONFIG,
): PolicyResult {
  const spamResult = spamGate.checkSpam(cue.soundId, frame);
  if (!spamResult.shouldPlay) {
    if (spamResult.alternateSound) {
      AudioLogger.policyDrop({
        soundId: cue.soundId,
        bus: cue.bus,
        frame,
        reason: "spam_softened",
        alternateSound: spamResult.alternateSound,
      });
      return {
        shouldPlay: true,
        soundId: spamResult.alternateSound,
        toRemove: [],
        reason: "spam_softened",
      };
    }
    AudioLogger.policyDrop({
      soundId: cue.soundId,
      bus: cue.bus,
      frame,
      reason: "spam_gate",
    });
    return {
      shouldPlay: false,
      soundId: cue.soundId,
      toRemove: [],
      reason: "spam_dropped",
    };
  }

  const maxConcurrent = config.maxConcurrentPerBus[cue.bus] ?? 10;
  const concurrencyResult = enforceBusConcurrency(
    cue,
    activeCues,
    maxConcurrent,
  );
  if (!concurrencyResult.shouldAdd) {
    AudioLogger.policyDrop({
      soundId: cue.soundId,
      bus: cue.bus,
      frame,
      reason: "concurrency_limit",
    });
    return {
      shouldPlay: false,
      soundId: cue.soundId,
      toRemove: [],
      reason: "concurrency_limit",
    };
  }

  if (concurrencyResult.toRemove.length > 0) {
    for (const removed of concurrencyResult.toRemove) {
      AudioLogger.policyDrop({
        soundId: removed,
        bus: cue.bus,
        frame,
        reason: "priority_too_low",
        replacedBy: cue.soundId,
      });
    }
  }

  return {
    shouldPlay: true,
    soundId: cue.soundId,
    toRemove: concurrencyResult.toRemove,
  };
}
