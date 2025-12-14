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
    ActiveSound,
    MusicBed,
    DEFAULT_BUS_CONFIG,
    computeBusStates,
    BusState,
    computeCrossfade,
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
    /** Pre-computed bus states with ducking */
    busStates: Record<string, BusState>;
    /** Filtered active sounds (array of [id, sound]) */
    activeSounds: Array<[string, SoundCue | ActiveSound]>;
    /** Current music bed (if any) */
    musicBed: MusicBed | null;
    /** Crossfade volumes for music */
    musicCrossfade: { outVolume: number; inVolume: number };
    /** Legacy background music (if no musicBed) */
    backgroundMusic: WorldState["audio"]["backgroundMusic"] | null;
    /** Whether audio state exists */
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
    backgroundMusic: null,
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
        const audio = rawAudio.buses ? rawAudio : { ...rawAudio, buses: DEFAULT_BUS_CONFIG };

        // 3. Compute bus states (with ducking)
        const busStates = computeBusStates(audio, t);

        // 4. Filter sounds by device
        const activeSounds = Object.entries(audio.activeSounds || {}).filter(([_, sound]) => {
            // Global sounds (no deviceId) always play
            if (!sound.deviceId) return true;
            // If no focusDeviceId specified, play all sounds
            if (!focusDeviceId) return true;
            // Only play if device matches
            return sound.deviceId === focusDeviceId;
        });

        // 5. Music crossfade
        const musicBed = audio.musicBed || null;
        const musicCrossfade = musicBed
            ? computeCrossfade(undefined, musicBed, t)
            : { outVolume: 0, inVolume: 0 };

        // 6. Legacy background music
        const backgroundMusic = audio.backgroundMusic && !musicBed ? audio.backgroundMusic : null;

        return {
            busStates,
            activeSounds,
            musicBed,
            musicCrossfade,
            backgroundMusic,
            hasAudio: true,
        };
    }, [world.audio, t, focusDeviceId]);
}
