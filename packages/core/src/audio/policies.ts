/**
 * Audio Policies - Deterministic rules for audio behavior
 * 
 * Handles:
 * - Spam gate (same sound repeated too fast)
 * - Concurrency limits per bus
 * - Priority-based sound selection
 */

import { SoundCue, AudioBus, AudioBusConfig, ActiveSound } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface PolicyConfig {
    spamGateFrames: number;           // Min frames between same sound
    softVariant?: string;             // Alternative sound for spam
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
// SPAM GATE
// =============================================================================

/**
 * Track recent sounds for spam detection
 */
export class SpamGate {
    private recentSounds: Map<string, number> = new Map();
    private config: PolicyConfig;

    constructor(config: PolicyConfig = DEFAULT_POLICY_CONFIG) {
        this.config = config;
    }

    /**
     * Check if a sound should be dropped or softened due to spam
     */
    checkSpam(
        soundId: string,
        frame: number
    ): { shouldPlay: boolean; alternateSound?: string } {
        const lastFrame = this.recentSounds.get(soundId);

        // Record this sound's frame
        this.recentSounds.set(soundId, frame);

        // First occurrence - always play
        if (lastFrame === undefined) {
            return { shouldPlay: true };
        }

        // Check if too soon
        if (frame - lastFrame < this.config.spamGateFrames) {
            // Try soft variant if available
            const softId = soundId + (this.config.softVariant || "_soft");
            return {
                shouldPlay: false,
                alternateSound: softId,
            };
        }

        return { shouldPlay: true };
    }

    /**
     * Reset spam tracking (for new episode)
     */
    reset(): void {
        this.recentSounds.clear();
    }

    /**
     * Clean old entries (call periodically)
     */
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

/**
 * Check if a sound cue is a SoundCue (not legacy ActiveSound)
 */
function isSoundCue(sound: SoundCue | ActiveSound): sound is SoundCue {
    return "bus" in sound;
}

/**
 * Enforce concurrency limit per bus
 * Returns the sounds that should continue playing (drops lowest priority)
 */
export function enforceBusConcurrency(
    newCue: SoundCue,
    activeCues: (SoundCue | ActiveSound)[],
    maxConcurrent: number
): { shouldAdd: boolean; toRemove: string[] } {
    // Get active cues on same bus
    const sameBusCues = activeCues.filter((cue): cue is SoundCue => {
        return isSoundCue(cue) && cue.bus === newCue.bus;
    });

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
    incoming: SoundCue
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
    soundId: string;        // May be altered (soft variant)
    toRemove: string[];     // Sounds to stop
    reason?: string;        // For debugging
}

/**
 * Run all policies on a sound before playing
 */
export function checkAllPolicies(
    cue: SoundCue,
    frame: number,
    activeCues: (SoundCue | ActiveSound)[],
    spamGate: SpamGate,
    config: PolicyConfig = DEFAULT_POLICY_CONFIG
): PolicyResult {
    // 1. Spam gate
    const spamResult = spamGate.checkSpam(cue.soundId, frame);
    if (!spamResult.shouldPlay) {
        if (spamResult.alternateSound) {
            // Try soft variant
            return {
                shouldPlay: true,
                soundId: spamResult.alternateSound,
                toRemove: [],
                reason: "spam_softened",
            };
        }
        return {
            shouldPlay: false,
            soundId: cue.soundId,
            toRemove: [],
            reason: "spam_dropped",
        };
    }

    // 2. Concurrency limit
    const maxConcurrent = config.maxConcurrentPerBus[cue.bus] ?? 10;
    const concurrencyResult = enforceBusConcurrency(cue, activeCues, maxConcurrent);
    if (!concurrencyResult.shouldAdd) {
        return {
            shouldPlay: false,
            soundId: cue.soundId,
            toRemove: [],
            reason: "concurrency_limit",
        };
    }

    return {
        shouldPlay: true,
        soundId: cue.soundId,
        toRemove: concurrencyResult.toRemove,
    };
}
