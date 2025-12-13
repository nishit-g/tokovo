/**
 * Music Bed System - Background music with crossfade support
 * 
 * Handles:
 * - Persistent background music
 * - Mood-based selection
 * - Crossfade between tracks
 */

import { MusicBed } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface CrossfadeState {
    outgoing?: MusicBed;
    incoming?: MusicBed;
    progress: number;  // 0-1
}

// =============================================================================
// CROSSFADE FUNCTIONS
// =============================================================================

/**
 * Compute volumes for crossfading between two music beds
 */
export function computeCrossfade(
    outgoing: MusicBed | undefined,
    incoming: MusicBed | undefined,
    frame: number
): { outVolume: number; inVolume: number } {
    if (!outgoing && !incoming) {
        return { outVolume: 0, inVolume: 0 };
    }

    if (!outgoing && incoming) {
        // Just incoming - fade in
        const fadeFrames = incoming.crossfadeFrames || 30;
        const elapsed = frame - incoming.startFrame;
        const progress = Math.min(1, elapsed / fadeFrames);
        return { outVolume: 0, inVolume: incoming.baseGain * progress };
    }

    if (outgoing && !incoming) {
        // Just outgoing - normal play
        return { outVolume: outgoing.baseGain, inVolume: 0 };
    }

    // Both - crossfade
    const crossfadeFrames = incoming!.crossfadeFrames || 30;
    const elapsed = frame - incoming!.startFrame;
    const progress = Math.min(1, elapsed / crossfadeFrames);

    // Smooth curve for crossfade
    const smoothProgress = smoothstep(progress);

    return {
        outVolume: outgoing!.baseGain * (1 - smoothProgress),
        inVolume: incoming!.baseGain * smoothProgress,
    };
}

/**
 * Smoothstep function for natural crossfade
 */
function smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
}

// =============================================================================
// MUSIC BED HELPERS
// =============================================================================

/**
 * Create a music bed with sensible defaults
 */
export function createMusicBed(
    soundId: string,
    startFrame: number,
    options: Partial<Omit<MusicBed, "id" | "soundId" | "startFrame">> = {}
): MusicBed {
    return {
        id: `music_${soundId}_${startFrame}`,
        soundId,
        startFrame,
        loop: options.loop ?? true,
        baseGain: options.baseGain ?? 0.35,
        moodTag: options.moodTag,
        crossfadeFrames: options.crossfadeFrames ?? 30,
    };
}

/**
 * Create a tense atmosphere music bed
 */
export function createTenseMusicBed(
    soundId: string,
    startFrame: number
): MusicBed {
    return createMusicBed(soundId, startFrame, {
        moodTag: "tense",
        baseGain: 0.3,
        crossfadeFrames: 45,
    });
}

/**
 * Create a dramatic music bed
 */
export function createDramaticMusicBed(
    soundId: string,
    startFrame: number
): MusicBed {
    return createMusicBed(soundId, startFrame, {
        moodTag: "dramatic",
        baseGain: 0.4,
        crossfadeFrames: 20,
    });
}

/**
 * Create a calm music bed
 */
export function createCalmMusicBed(
    soundId: string,
    startFrame: number
): MusicBed {
    return createMusicBed(soundId, startFrame, {
        moodTag: "calm",
        baseGain: 0.25,
        crossfadeFrames: 60,
    });
}

// =============================================================================
// MOOD SELECTION
// =============================================================================

export type MoodTag = "tense" | "romantic" | "chaotic" | "calm" | "dramatic";

/**
 * Get music bed by mood (from a library)
 */
export function getMusicByMood(
    mood: MoodTag,
    library: MusicBed[]
): MusicBed | undefined {
    return library.find((bed) => bed.moodTag === mood);
}

/**
 * Suggest mood based on conversation intensity
 */
export function suggestMood(params: {
    messageRate: number;     // Messages per second
    typingDuration: number;  // Frames of typing
    hasConflict: boolean;    // Keywords detected
}): MoodTag {
    if (params.hasConflict) {
        return "dramatic";
    }

    if (params.messageRate > 2) {
        return "chaotic";
    }

    if (params.typingDuration > 60) {
        return "tense";
    }

    return "calm";
}
