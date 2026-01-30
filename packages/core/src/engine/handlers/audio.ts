/**
 * Audio Handler - Enterprise-grade audio event processing
 *
 * Handles:
 * - PLAY/PLAY_SOUND: Start playing sounds (routes music to musicBed)
 * - STOP/STOP_SOUND: Stop sounds by instanceId OR soundId
 * - STOP_ALL: Stop all sounds in a bus or globally
 * - FADE_OUT/FADE_VOLUME: Fade sounds out
 * - CROSSFADE: Smooth transition between music tracks
 * - BACKGROUND_MUSIC: Legacy background music support
 * - Auto-sounds: Derived audio from semantic events
 */

import type { WorldState, TimelineEvent, AudioState } from "../../types";
import type { HandlerContext, AudioEvent } from "./types";
import {
  DEFAULT_BUS_CONFIG,
  SoundCue,
  MusicBed,
  AudioBus,
} from "../../types/audio";
import { deriveAudioInstructions, AutoSoundRule } from "../../audio/auto-sound";
import {
  checkAllPoliciesPure,
  cleanupRecentSounds,
} from "../../audio/policies";

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_FADE_DURATION = 30;
const MAX_LOOP_FRAMES = 3600;
const SPAM_GATE_FRAMES = 8;
const VOLUME_THRESHOLD = 0.001;
const DEFAULT_CROSSFADE_FRAMES = 30;

// =============================================================================
// TYPES
// =============================================================================

interface AudioEventPayload {
  instanceId?: string;
  soundId?: string;
  volume?: number;
  loop?: boolean;
  deviceId?: string;
  duration?: number;
  toVolume?: number;
  bus?: string;
  fromSoundId?: string;
  toSoundId?: string;
  crossfadeDuration?: number;
  fadeIn?: number;
  fadeOut?: number;
}

// =============================================================================
// STATE HELPERS
// =============================================================================

function createDefaultAudioState(): AudioState {
  return {
    activeSounds: {},
    buses: { ...DEFAULT_BUS_CONFIG },
    policyState: {
      recentSounds: new Map(),
      nextId: 0,
    },
    autoSoundRules: [],
  };
}

export function ensureAudioState(
  draft: WorldState,
): asserts draft is WorldState & { audio: AudioState } {
  if (!draft.audio) {
    draft.audio = createDefaultAudioState();
  }
  if (!draft.audio.activeSounds) {
    draft.audio.activeSounds = {};
  }
  if (!draft.audio.buses) {
    draft.audio.buses = { ...DEFAULT_BUS_CONFIG };
  }
  if (!draft.audio.policyState) {
    draft.audio.policyState = {
      recentSounds: new Map(),
      nextId: 0,
    };
  }
}

function deleteActiveSound(
  activeSounds: Record<string, unknown>,
  instanceId: string,
): void {
  if (instanceId in activeSounds) {
    delete activeSounds[instanceId];
  }
}

function findInstancesBySound(
  activeSounds: Record<string, SoundCue>,
  soundId: string,
): string[] {
  const matches: string[] = [];
  for (const [instanceId, sound] of Object.entries(activeSounds)) {
    if (sound.soundId === soundId) {
      matches.push(instanceId);
    }
  }
  return matches;
}

function findInstancesByBus(
  activeSounds: Record<string, SoundCue>,
  bus: string,
): string[] {
  const matches: string[] = [];
  for (const [instanceId, sound] of Object.entries(activeSounds)) {
    if (sound.bus === bus) {
      matches.push(instanceId);
    }
  }
  return matches;
}

/**
 * Determines if a sound should be routed to musicBed.
 * Only uses explicit bus assignment - loop is irrelevant.
 */
function isMusic(bus?: string, loop?: boolean): boolean {
  return bus === "music";
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

function handlePlay(
  draft: WorldState,
  event: AudioEvent,
  payload: AudioEventPayload,
  ctx: HandlerContext,
): void {
  const instanceId = `sound_${draft.audio!.policyState.nextId++}`;

  if (isMusic(payload.bus, payload.loop)) {
    draft.audio!.musicBed = {
      soundId: payload.soundId || "",
      baseGain: payload.volume ?? 0.35,
      loop: payload.loop ?? true,
      startFrame: event.at,
      crossfadeFrames: payload.fadeIn,
      crossfadeCurve: payload.fadeIn ? "easeInOut" : undefined,
    };
  } else {
    const tempCue: SoundCue = {
      soundId: payload.soundId || "",
      startFrame: event.at,
      volume: payload.volume ?? 1,
      loop: payload.loop ?? false,
      deviceId: payload.deviceId,
      duration: payload.duration,
      bus: (payload.bus ?? "sfx") as AudioBus,
      priority: 50,
    };

    const policyResult = checkAllPoliciesPure(
      tempCue,
      event.at,
      Object.values(draft.audio!.activeSounds),
      draft.audio!.policyState.recentSounds,
    );

    if (!policyResult.shouldPlay) {
      return;
    }

    for (const id of policyResult.toRemove) {
      deleteActiveSound(draft.audio!.activeSounds, id);
    }

    if (policyResult.updatedRecentSounds) {
      draft.audio!.policyState.recentSounds = policyResult.updatedRecentSounds;
    }

    const finalCue: SoundCue = {
      ...tempCue,
      soundId: policyResult.soundId,
    };
    draft.audio!.activeSounds[instanceId] = finalCue;
  }
}

function handleStop(draft: WorldState, payload: AudioEventPayload): void {
  if (payload.instanceId) {
    deleteActiveSound(draft.audio!.activeSounds, payload.instanceId);
  } else if (payload.soundId) {
    const instances = findInstancesBySound(
      draft.audio!.activeSounds,
      payload.soundId,
    );
    for (const instanceId of instances) {
      deleteActiveSound(draft.audio!.activeSounds, instanceId);
    }
    if (draft.audio!.musicBed?.soundId === payload.soundId) {
      draft.audio!.musicBed = undefined;
    }
  }
}

function handleStopAll(draft: WorldState, payload: AudioEventPayload): void {
  if (payload.bus) {
    const instances = findInstancesByBus(
      draft.audio!.activeSounds,
      payload.bus,
    );
    for (const instanceId of instances) {
      deleteActiveSound(draft.audio!.activeSounds, instanceId);
    }
    if (payload.bus === "music") {
      draft.audio!.musicBed = undefined;
      draft.audio!.outgoingMusicBed = undefined;
    }
  } else {
    draft.audio!.activeSounds = {};
    draft.audio!.musicBed = undefined;
    draft.audio!.outgoingMusicBed = undefined;
  }
}

function handleFade(
  draft: WorldState,
  event: AudioEvent,
  payload: AudioEventPayload,
): void {
  let duration = payload.duration ?? DEFAULT_FADE_DURATION;
  const toVolume = payload.toVolume ?? 0;

  if (payload.instanceId) {
    const sound = draft.audio!.activeSounds[payload.instanceId];
    if (sound) {
      if (sound.duration) {
        const remaining = sound.duration - (event.at - sound.startFrame);
        duration = Math.min(duration, Math.max(0, remaining));
      }
      sound.fadeTarget = toVolume;
      sound.fadeDuration = duration;
      sound.fadeStartFrame = event.at;
    }
  } else if (payload.soundId) {
    const instances = findInstancesBySound(
      draft.audio!.activeSounds,
      payload.soundId,
    );
    for (const instanceId of instances) {
      const sound = draft.audio!.activeSounds[instanceId];
      if (sound && "bus" in sound) {
        let soundDuration = duration;
        if (sound.duration) {
          const remaining = sound.duration - (event.at - sound.startFrame);
          soundDuration = Math.min(soundDuration, Math.max(0, remaining));
        }
        sound.fadeTarget = toVolume;
        sound.fadeDuration = soundDuration;
        sound.fadeStartFrame = event.at;
      }
    }
  }

  if (draft.audio!.musicBed) {
    if (!payload.instanceId && !payload.soundId) {
      draft.audio!.musicBed.fadeOutStart = event.at;
      draft.audio!.musicBed.fadeOutDuration = duration;
    } else if (payload.soundId === draft.audio!.musicBed.soundId) {
      draft.audio!.musicBed.fadeOutStart = event.at;
      draft.audio!.musicBed.fadeOutDuration = duration;
    }
  }
}

function handleCrossfade(
  draft: WorldState,
  event: AudioEvent,
  payload: AudioEventPayload,
): void {
  const duration = payload.crossfadeDuration ?? payload.duration ?? 60;

  if (draft.audio!.musicBed) {
    draft.audio!.outgoingMusicBed = {
      ...draft.audio!.musicBed,
      fadeOutStart: event.at,
      fadeOutDuration: duration,
    };
  }

  const targetSoundId = payload.toSoundId || payload.soundId;
  if (targetSoundId) {
    draft.audio!.musicBed = {
      soundId: targetSoundId,
      baseGain: payload.volume ?? 0.35,
      loop: true,
      startFrame: event.at,
      crossfadeFrames: duration,
    };
  }
}

// =============================================================================
// MAIN PROCESSOR
// =============================================================================

export function processAudioEvent(
  draft: WorldState,
  event: AudioEvent,
  ctx: HandlerContext,
): void {
  ensureAudioState(draft);

  const payload = event as AudioEvent & AudioEventPayload;

  switch (event.type) {
    case "PLAY":
    case "PLAY_SOUND":
      handlePlay(draft, event, payload, ctx);
      break;

    case "STOP":
    case "STOP_SOUND":
      handleStop(draft, payload);
      break;

    case "STOP_ALL":
      handleStopAll(draft, payload);
      break;

    case "FADE_OUT":
    case "FADE_VOLUME":
      handleFade(draft, event, payload);
      break;

    case "CROSSFADE":
      handleCrossfade(draft, event, payload);
      break;

    default: {
      // Silently ignore - may be auto-sound trigger events
      const unhandled = event.type as string;
      break;
    }
  }
}

// =============================================================================
// CLEANUP
// =============================================================================

export function cleanupExpiredSounds(
  draft: WorldState,
  currentFrame: number,
): void {
  if (!draft.audio?.activeSounds) return;

  const toDelete: string[] = [];

  for (const [instanceId, sound] of Object.entries(draft.audio.activeSounds)) {
    if (sound.loop) {
      const elapsed = currentFrame - sound.startFrame;
      if (elapsed > MAX_LOOP_FRAMES) {
        toDelete.push(instanceId);
        continue;
      }
    }

    if (sound.fadeTarget !== undefined && sound.fadeStartFrame !== undefined) {
      const fadeEnd =
        sound.fadeStartFrame + (sound.fadeDuration ?? DEFAULT_FADE_DURATION);
      if (currentFrame >= fadeEnd && sound.fadeTarget === 0) {
        toDelete.push(instanceId);
        continue;
      }
    }

    if (!sound.loop && sound.duration !== undefined) {
      const endFrame = sound.startFrame + sound.duration;
      if (currentFrame >= endFrame) {
        toDelete.push(instanceId);
      }
    }
  }

  for (const instanceId of toDelete) {
    deleteActiveSound(draft.audio.activeSounds, instanceId);
  }

  if (draft.audio.outgoingMusicBed) {
    const ob = draft.audio.outgoingMusicBed;
    if (ob.fadeOutStart !== undefined && ob.fadeOutDuration !== undefined) {
      const fadeEnd = ob.fadeOutStart + ob.fadeOutDuration;
      if (currentFrame >= fadeEnd) {
        draft.audio.outgoingMusicBed = undefined;
      }
    }
  }

  draft.audio.policyState.recentSounds = cleanupRecentSounds(
    draft.audio.policyState.recentSounds,
    currentFrame,
  );
}

// =============================================================================
// AUTO-SOUNDS
// =============================================================================

export function handleAutoSounds(
  draft: WorldState,
  event: TimelineEvent,
  ctx: HandlerContext,
): void {
  ensureAudioState(draft);

  const instructions = deriveAudioInstructions(
    event,
    draft.audio.autoSoundRules as AutoSoundRule[],
  );

  for (const instruction of instructions) {
    const instanceId = `sound_${draft.audio!.policyState.nextId++}`;

    if (
      instruction.action === "PLAY_ONE_SHOT" ||
      instruction.action === "START_LOOP"
    ) {
      if (instruction.cue && instruction.soundId) {
        const sound: SoundCue = {
          soundId: instruction.soundId,
          startFrame: event.at,
          volume: instruction.cue.volume,
          loop: instruction.cue.loop ?? false,
          deviceId: instruction.cue.deviceId,
          duration: instruction.cue.duration,
          bus: instruction.cue.bus,
          priority: instruction.cue.priority ?? 50,
        };
        draft.audio!.activeSounds[instanceId] = sound;
      }
    } else if (instruction.action === "STOP_SOUND") {
      if (instruction.instanceId) {
        deleteActiveSound(draft.audio!.activeSounds, instruction.instanceId);
      } else if (instruction.soundId) {
        const instances = findInstancesBySound(
          draft.audio!.activeSounds,
          instruction.soundId,
        );
        for (const id of instances) {
          deleteActiveSound(draft.audio!.activeSounds, id);
        }
      }
    }
  }
}
