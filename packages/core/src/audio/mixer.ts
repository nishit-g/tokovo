/**
 * Audio Mixer - Production-grade audio mixing for Tokovo
 *
 * Handles:
 * - Bus-based volume routing
 * - Ducking (UI/voice lowers music)
 * - Attack/release envelopes
 * - Per-frame volume computation
 */

import { SoundCue, AudioBus, AudioState } from "../types";

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

function validateVolume(volume: number, context: string): number {
  if (typeof volume !== "number" || isNaN(volume) || volume < 0 || volume > 1) {
    console.warn(
      `[Audio] Invalid volume (${volume}) in ${context}, clamping to [0,1]`,
    );
    return Math.max(0, Math.min(1, volume || 0));
  }
  return volume;
}

function validateDuration(
  duration: number | undefined,
  context: string,
): number | undefined {
  if (duration === undefined) return undefined;
  if (typeof duration !== "number" || isNaN(duration) || duration < 0) {
    console.warn(
      `[Audio] Invalid duration (${duration}) in ${context}, using undefined`,
    );
    return undefined;
  }
  return duration;
}

// =============================================================================
// TYPES
// =============================================================================

export interface BusState {
  baseGain: number;
  duckMultiplier: number;
}

export interface MixerContext {
  frame: number;
  buses: Record<AudioBus, BusState>;
  allCues: SoundCue[];
}

// =============================================================================
// ENVELOPE FUNCTIONS
// =============================================================================

/**
 * Apply envelope (attack/release) to compute volume multiplier
 */
export function applyEnvelope(cue: SoundCue, frame: number): number {
  if (!cue.envelope) {
    return 1.0;
  }

  const { attack, release, curve = "linear" } = cue.envelope;
  const elapsed = frame - cue.startFrame;
  const endFrame = cue.duration ? cue.startFrame + cue.duration : Infinity;
  const remaining = endFrame - frame;

  let multiplier = 1.0;

  // Attack phase (fade in)
  if (elapsed < attack && attack > 0) {
    const progress = elapsed / attack;
    multiplier = applyCurve(progress, curve);
  }

  // Release phase (fade out)
  if (remaining < release && release > 0) {
    const progress = remaining / release;
    multiplier *= applyCurve(progress, curve);
  }

  return Math.max(0, Math.min(1, multiplier));
}

/**
 * Apply easing curve to a 0-1 progress value
 */
function applyCurve(
  progress: number,
  curve: "linear" | "easeOut" | "easeIn",
): number {
  switch (curve) {
    case "easeOut":
      return 1 - Math.pow(1 - progress, 2);
    case "easeIn":
      return Math.pow(progress, 2);
    case "linear":
    default:
      return progress;
  }
}

// =============================================================================
// DUCKING FUNCTIONS
// =============================================================================

interface ActiveDucker {
  targetBus: AudioBus;
  duckAmount: number;
}

function extractActiveDuckers(
  frame: number,
  allCues: SoundCue[],
): ActiveDucker[] {
  const duckers: ActiveDucker[] = [];

  for (const cue of allCues) {
    if (!cue.duck) continue;

    const cueStart = cue.startFrame;
    const cueEnd = cue.duration ? cue.startFrame + cue.duration : Infinity;

    if (frame < cueStart || frame > cueEnd + cue.duck.release) {
      continue;
    }

    let duckAmount = cue.duck.amount;

    if (frame < cueStart + cue.duck.attack && cue.duck.attack > 0) {
      const progress = (frame - cueStart) / cue.duck.attack;
      duckAmount = 1.0 - (1.0 - cue.duck.amount) * progress;
    }

    if (frame > cueEnd && cue.duck.release > 0) {
      const releaseProgress = (frame - cueEnd) / cue.duck.release;
      duckAmount =
        cue.duck.amount +
        (1.0 - cue.duck.amount) * Math.min(1, releaseProgress);
    }

    duckers.push({ targetBus: cue.duck.targetBus, duckAmount });
  }

  return duckers;
}

function computeDuckMultiplierFromDuckers(
  targetBus: AudioBus,
  duckers: ActiveDucker[],
): number {
  let minMultiplier = 1.0;
  for (const d of duckers) {
    if (d.targetBus === targetBus) {
      minMultiplier = Math.min(minMultiplier, d.duckAmount);
    }
  }
  return minMultiplier;
}

export function computeBusDuckMultiplier(
  targetBus: AudioBus,
  frame: number,
  allCues: SoundCue[],
): number {
  let minMultiplier = 1.0;

  for (const cue of allCues) {
    if (!cue.duck) continue;
    if (cue.duck.targetBus !== targetBus) continue;

    // Check if this ducker is active
    const cueStart = cue.startFrame;
    const cueEnd = cue.duration ? cue.startFrame + cue.duration : Infinity;

    if (frame < cueStart || frame > cueEnd + cue.duck.release) {
      continue; // Ducker not active
    }

    // Compute duck amount with attack/release
    let duckAmount = cue.duck.amount;

    // Attack: ramp down to duck amount
    if (frame < cueStart + cue.duck.attack && cue.duck.attack > 0) {
      const progress = (frame - cueStart) / cue.duck.attack;
      duckAmount = 1.0 - (1.0 - cue.duck.amount) * progress;
    }

    // Release: ramp back up after cue ends
    if (frame > cueEnd && cue.duck.release > 0) {
      const releaseProgress = (frame - cueEnd) / cue.duck.release;
      duckAmount =
        cue.duck.amount +
        (1.0 - cue.duck.amount) * Math.min(1, releaseProgress);
    }

    minMultiplier = Math.min(minMultiplier, duckAmount);
  }

  return minMultiplier;
}

// =============================================================================
// MAIN MIXER FUNCTIONS
// =============================================================================

/**
 * Compute bus states for current frame
 */
export function computeBusStates(
  audioState: AudioState,
  frame: number,
): Record<AudioBus, BusState> {
  const allCues = Object.values(audioState.activeSounds);
  const activeDuckers = extractActiveDuckers(frame, allCues);

  const busStates: Record<AudioBus, BusState> = {
    music: {
      baseGain: audioState.buses.music.baseGain,
      duckMultiplier: computeDuckMultiplierFromDuckers("music", activeDuckers),
    },
    ui: {
      baseGain: audioState.buses.ui.baseGain,
      duckMultiplier: computeDuckMultiplierFromDuckers("ui", activeDuckers),
    },
    sfx: {
      baseGain: audioState.buses.sfx.baseGain,
      duckMultiplier: computeDuckMultiplierFromDuckers("sfx", activeDuckers),
    },
    voice: {
      baseGain: audioState.buses.voice.baseGain,
      duckMultiplier: computeDuckMultiplierFromDuckers("voice", activeDuckers),
    },
    master: {
      baseGain: 1.0,
      duckMultiplier: 1.0,
    },
  };

  return busStates;
}

/**
 * Compute final volume for a sound at a given frame
 *
 * Formula: finalVolume = cueGain * busBase * duckMultiplier * envelope
 */
export function computeSoundVolume(
  sound: SoundCue,
  frame: number,
  busStates: Record<AudioBus, BusState>,
): number {
  const cueVolume = sound.volume;
  const busState = busStates[sound.bus] ?? busStates.master;
  const envelopeMult = applyEnvelope(sound, frame);

  let baseVolume = cueVolume;
  if (
    sound.fadeTarget !== undefined &&
    sound.fadeStartFrame !== undefined &&
    sound.fadeDuration
  ) {
    const fadeProgress = Math.min(
      1,
      (frame - sound.fadeStartFrame) / sound.fadeDuration,
    );
    baseVolume = cueVolume + (sound.fadeTarget - cueVolume) * fadeProgress;
  }

  const finalVolume =
    baseVolume * busState.baseGain * busState.duckMultiplier * envelopeMult;

  return clamp01(finalVolume);
}

/**
 * Clamp value between 0 and 1
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a SoundCue with sensible defaults
 */
export function createSoundCue(
  soundId: string,
  startFrame: number,
  options: Partial<Omit<SoundCue, "soundId" | "startFrame">> = {},
): SoundCue {
  return {
    soundId,
    startFrame,
    volume: validateVolume(options.volume ?? 1.0, `createSoundCue(${soundId})`),
    bus: options.bus ?? "sfx",
    priority: options.priority ?? 50,
    loop: options.loop,
    duration: validateDuration(options.duration, `createSoundCue(${soundId})`),
    deviceId: options.deviceId,
    origin: options.origin,
    envelope: options.envelope,
    duck: options.duck,
  };
}

/**
 * Create a UI sound that ducks music
 */
export function createUISoundCue(
  soundId: string,
  startFrame: number,
  options: Partial<Omit<SoundCue, "soundId" | "startFrame" | "bus">> = {},
): SoundCue {
  return createSoundCue(soundId, startFrame, {
    ...options,
    bus: "ui",
    priority: 30,
    volume: validateVolume(
      options.volume ?? 1.0,
      `createUISoundCue(${soundId})`,
    ),
    duck: options.duck ?? {
      targetBus: "music",
      amount: 0.25,
      attack: 3,
      release: 20,
    },
  });
}

/**
 * Create a voice sound that ducks everything
 */
export function createVoiceSoundCue(
  soundId: string,
  startFrame: number,
  options: Partial<Omit<SoundCue, "soundId" | "startFrame" | "bus">> = {},
): SoundCue {
  return createSoundCue(soundId, startFrame, {
    ...options,
    bus: "voice",
    priority: 100,
    volume: validateVolume(
      options.volume ?? 1.0,
      `createVoiceSoundCue(${soundId})`,
    ),
    duck: options.duck ?? {
      targetBus: "music",
      amount: 0.15,
      attack: 5,
      release: 40,
    },
  });
}
