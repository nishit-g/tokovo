/**
 * Audio Handler - Processes AUDIO events and AutoSounds
 *
 * @description Handles sound effects, background music, and derived audio.
 */

import type { WorldState, TimelineEvent } from "../../types";
import type { AudioEvent, HandlerContext } from "./types";
import {
  deriveAudioInstructions,
  AutoSoundRegistry,
} from "../../audio/auto-sound";

const DEFAULT_AUDIO_BUSES = {
  music: { baseGain: 0.5, maxConcurrent: 1 },
  ui: { baseGain: 0.7, maxConcurrent: 5 },
  sfx: { baseGain: 1, maxConcurrent: 8 },
  voice: { baseGain: 1, maxConcurrent: 2 },
};

interface AudioEventPayload {
  instanceId?: string;
  soundId?: string;
  volume?: number;
  loop?: boolean;
  deviceId?: string;
  duration?: number;
  toVolume?: number;
}

interface ActiveSoundState {
  soundId: string;
  startFrame: number;
  volume: number;
  loop: boolean;
  deviceId?: string;
  duration?: number;
  bus?: string;
  fadeTarget?: number;
  fadeDuration?: number;
  fadeStartFrame?: number;
}

function ensureAudioState(draft: WorldState): void {
  if (!draft.audio) {
    draft.audio = {
      activeSounds: {},
      buses: { ...DEFAULT_AUDIO_BUSES },
    };
  }
}

export function processAudioEvent(
  draft: WorldState,
  event: AudioEvent,
  ctx: HandlerContext,
): void {
  ensureAudioState(draft);

  const payload = event as AudioEvent & AudioEventPayload;

  switch (event.type) {
    case "PLAY_SOUND": {
      const instanceId =
        payload.instanceId || `sound_${ctx.eventIndex}_${event.at}`;
      draft.audio!.activeSounds[instanceId] = {
        soundId: payload.soundId || "",
        startFrame: event.at,
        volume: payload.volume ?? 1,
        loop: payload.loop ?? false,
        deviceId: payload.deviceId,
        duration: payload.duration,
      };
      break;
    }

    case "STOP_SOUND": {
      if (payload.instanceId) {
        delete draft.audio!.activeSounds[payload.instanceId];
      }
      break;
    }

    case "FADE_VOLUME": {
      if (payload.instanceId) {
        const sound = draft.audio!.activeSounds[payload.instanceId] as
          | ActiveSoundState
          | undefined;
        if (sound) {
          sound.fadeTarget = payload.toVolume;
          sound.fadeDuration = payload.duration;
          sound.fadeStartFrame = event.at;
        }
      }
      break;
    }

    case "BACKGROUND_MUSIC": {
      draft.audio!.backgroundMusic = {
        soundId: payload.soundId || "",
        volume: payload.volume ?? 0.5,
        loop: payload.loop ?? true,
        startFrame: event.at,
      };
      break;
    }
  }
}

export function handleAutoSounds(
  draft: WorldState,
  event: TimelineEvent,
  ctx: HandlerContext,
): void {
  ensureAudioState(draft);

  const rules = AutoSoundRegistry.getRulesForKind(event.kind);
  const instructions = deriveAudioInstructions(event, rules);

  for (const instruction of instructions) {
    const instanceId =
      instruction.instanceId || `auto_${ctx.eventIndex}_${event.at}`;

    if (
      instruction.action === "PLAY_ONE_SHOT" ||
      instruction.action === "START_LOOP"
    ) {
      if (instruction.cue && instruction.soundId) {
        const sound: ActiveSoundState = {
          soundId: instruction.soundId,
          startFrame: event.at,
          volume: instruction.cue.volume,
          loop: instruction.cue.loop ?? false,
          deviceId: instruction.cue.deviceId,
          duration: instruction.cue.duration,
          bus: instruction.cue.bus,
        };
        draft.audio!.activeSounds[instanceId] = sound;
      }
    } else if (instruction.action === "STOP_SOUND") {
      if (instruction.instanceId) {
        delete draft.audio!.activeSounds[instruction.instanceId];
      }
    }
  }
}
