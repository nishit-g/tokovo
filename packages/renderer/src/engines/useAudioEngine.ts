/**
 * Audio Engine
 *
 * Pure computation layer that determines:
 * - Bus states (ducking multipliers)
 * - Active sounds filtered by device
 * - Music bed crossfade state
 *
 * Input: world + time + focusDeviceId
 * Output: pre-computed audio state (no JSX)
 *
 * NOTE: This runs every frame. Keep it fast.
 */

import { useMemo } from "react";
import {
  WorldState,
  SoundCue,
  MusicBed,
  DEFAULT_BUS_CONFIG,
  computeBusStates,
  BusState,
  computeCrossfade,
  AudioBus,
} from "@tokovo/core";

// =============================================================================
// INPUT / OUTPUT TYPES
// =============================================================================

export interface AudioEngineInput {
  world: WorldState;
  t: number;
  focusDeviceId?: string;
}

export interface AudioEngineOutput {
  busStates: Partial<Record<AudioBus, BusState>>;
  activeSounds: Array<[string, SoundCue]>;
  musicBed: MusicBed | null;
  musicCrossfade: { outVolume: number; inVolume: number };
  hasAudio: boolean;
}

// =============================================================================
// NULL OUTPUT (when no audio)
// =============================================================================

export const NULL_AUDIO_OUTPUT: AudioEngineOutput = {
  busStates: {},
  activeSounds: [],
  musicBed: null,
  musicCrossfade: { outVolume: 0, inVolume: 0 },
  hasAudio: false,
};

// =============================================================================
// AUDIO ENGINE HOOK
// =============================================================================

export function useAudioEngine(input: AudioEngineInput): AudioEngineOutput {
  const { world, t, focusDeviceId } = input;

  return useMemo(() => {
    // 1. Early exit if no audio
    const rawAudio = world.audio;
    if (!rawAudio) {
      return NULL_AUDIO_OUTPUT;
    }

    // 2. Ensure buses exist (backward compatibility)
    const audio = rawAudio.buses
      ? rawAudio
      : { ...rawAudio, buses: DEFAULT_BUS_CONFIG };

    // 3. Compute bus states (with ducking)
    const busStates = computeBusStates(audio, t);

    // 4. Filter sounds by device
    const activeSounds = Object.entries(audio.activeSounds || {}).filter(
      ([_, sound]) => {
        // Global sounds (no deviceId) always play
        if (!sound.deviceId) return true;
        // If no focusDeviceId specified, play all sounds
        if (!focusDeviceId) return true;
        // Only play if device matches
        return sound.deviceId === focusDeviceId;
      },
    );

    // 5. Music crossfade
    const musicBed = audio.musicBed || null;
    const outgoingMusicBed = audio.outgoingMusicBed || undefined;
    const musicCrossfade = musicBed
      ? computeCrossfade(outgoingMusicBed, musicBed, t)
      : { outVolume: 0, inVolume: 0 };

    return {
      busStates,
      activeSounds,
      musicBed,
      musicCrossfade,
      hasAudio: true,
    };
  }, [world.audio, t, focusDeviceId]);
}
