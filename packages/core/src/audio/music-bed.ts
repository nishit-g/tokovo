/**
 * Music Bed System - Background music with crossfade support
 *
 * Handles:
 * - Persistent background music
 * - Mood-based selection
 * - Crossfade between tracks with configurable easing
 */

import { MusicBed, CrossfadeCurve, MoodTag } from "../types/audio";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CROSSFADE_FRAMES = 30;

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

const EASING_FUNCTIONS: Record<CrossfadeCurve, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => t * t * (3 - 2 * t),
};

function applyEasing(
  progress: number,
  curve: CrossfadeCurve = "easeInOut",
): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return EASING_FUNCTIONS[curve](clampedProgress);
}

// =============================================================================
// TYPES
// =============================================================================

export interface CrossfadeState {
  outgoing?: MusicBed;
  incoming?: MusicBed;
  progress: number;
}

export interface CrossfadeResult {
  readonly outVolume: number;
  readonly inVolume: number;
}

// =============================================================================
// CROSSFADE FUNCTIONS
// =============================================================================

export function computeCrossfade(
  outgoing: MusicBed | undefined,
  incoming: MusicBed | undefined,
  frame: number,
): CrossfadeResult {
  if (!outgoing && !incoming) {
    return { outVolume: 0, inVolume: 0 };
  }

  if (!outgoing && incoming) {
    const fadeFrames = incoming.crossfadeFrames || DEFAULT_CROSSFADE_FRAMES;
    const elapsed = frame - incoming.startFrame;
    const rawProgress = Math.min(1, Math.max(0, elapsed / fadeFrames));
    const progress = applyEasing(rawProgress, incoming.crossfadeCurve);
    return { outVolume: 0, inVolume: incoming.baseGain * progress };
  }

  if (outgoing && !incoming) {
    if (
      outgoing.fadeOutStart !== undefined &&
      outgoing.fadeOutDuration !== undefined
    ) {
      const fadeElapsed = frame - outgoing.fadeOutStart;
      const fadeProgress = Math.min(
        1,
        Math.max(0, fadeElapsed / outgoing.fadeOutDuration),
      );
      return { outVolume: outgoing.baseGain * (1 - fadeProgress), inVolume: 0 };
    }
    return { outVolume: outgoing.baseGain, inVolume: 0 };
  }

  const crossfadeFrames = incoming.crossfadeFrames || DEFAULT_CROSSFADE_FRAMES;
  const elapsed = frame - incoming.startFrame;
  const rawProgress = Math.min(1, Math.max(0, elapsed / crossfadeFrames));
  const smoothProgress = applyEasing(rawProgress, incoming.crossfadeCurve);

  let outVol = outgoing.baseGain * (1 - smoothProgress);
  if (
    outgoing.fadeOutStart !== undefined &&
    outgoing.fadeOutDuration !== undefined
  ) {
    const fadeElapsed = frame - outgoing.fadeOutStart;
    const fadeProgress = Math.min(
      1,
      Math.max(0, fadeElapsed / outgoing.fadeOutDuration),
    );
    outVol *= 1 - fadeProgress;
  }

  return {
    outVolume: outVol,
    inVolume: incoming.baseGain * smoothProgress,
  };
}

// =============================================================================
// MUSIC BED HELPERS
// =============================================================================

export function createMusicBed(
  soundId: string,
  startFrame: number,
  options: Partial<Omit<MusicBed, "id" | "soundId" | "startFrame">> = {},
): MusicBed {
  return {
    id: `music_${soundId}_${startFrame}`,
    soundId,
    startFrame,
    loop: options.loop ?? true,
    baseGain: options.baseGain ?? 0.35,
    moodTag: options.moodTag,
    crossfadeFrames: options.crossfadeFrames ?? DEFAULT_CROSSFADE_FRAMES,
    crossfadeCurve: options.crossfadeCurve ?? "easeInOut",
  };
}

export function createTenseMusicBed(
  soundId: string,
  startFrame: number,
): MusicBed {
  return createMusicBed(soundId, startFrame, {
    moodTag: "tense",
    baseGain: 0.3,
    crossfadeFrames: 45,
  });
}

export function createDramaticMusicBed(
  soundId: string,
  startFrame: number,
): MusicBed {
  return createMusicBed(soundId, startFrame, {
    moodTag: "dramatic",
    baseGain: 0.4,
    crossfadeFrames: 20,
  });
}

export function createCalmMusicBed(
  soundId: string,
  startFrame: number,
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

export function getMusicByMood(
  mood: MoodTag,
  library: MusicBed[],
): MusicBed | undefined {
  return library.find((bed) => bed.moodTag === mood);
}

export function suggestMood(params: {
  messageRate: number;
  typingDuration: number;
  hasConflict: boolean;
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
