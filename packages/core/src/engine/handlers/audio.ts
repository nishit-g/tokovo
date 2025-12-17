/**
 * Audio Handler - Processes AUDIO events and AutoSounds
 * 
 * @description Handles sound effects, background music, and derived audio.
 */

import type { WorldState, TimelineEvent } from "../../types";
import type { AudioEvent, HandlerContext } from "./types";
import { deriveAudioInstructions, AutoSoundRegistry } from "../../audio/auto-sound";

// Default audio state for initialization
const DEFAULT_AUDIO_BUSES = {
    music: { baseGain: 0.5, maxConcurrent: 1 },
    ui: { baseGain: 0.7, maxConcurrent: 5 },
    sfx: { baseGain: 1, maxConcurrent: 8 },
    voice: { baseGain: 1, maxConcurrent: 2 },
};

/**
 * Ensure audio state is initialized
 */
function ensureAudioState(draft: WorldState): void {
    if (!draft.audio) {
        draft.audio = {
            activeSounds: {},
            buses: { ...DEFAULT_AUDIO_BUSES },
        };
    }
}

/**
 * Process audio event and update audio state
 */
export function processAudioEvent(
    draft: WorldState,
    event: AudioEvent,
    ctx: HandlerContext
): void {
    ensureAudioState(draft);

    const e = event as any;

    switch (event.type) {
        case "PLAY_SOUND": {
            const instanceId = e.instanceId || `sound_${ctx.eventIndex}_${event.at}`;
            draft.audio!.activeSounds[instanceId] = {
                soundId: e.soundId,
                startFrame: event.at,
                volume: e.volume ?? 1,
                loop: e.loop ?? false,
                deviceId: e.deviceId,
                duration: e.duration,
            };
            break;
        }

        case "STOP_SOUND": {
            delete draft.audio!.activeSounds[e.instanceId];
            break;
        }

        case "FADE_VOLUME": {
            const sound = draft.audio!.activeSounds[e.instanceId];
            if (sound) {
                (sound as any).fadeTarget = e.toVolume;
                (sound as any).fadeDuration = e.duration;
                (sound as any).fadeStartFrame = event.at;
            }
            break;
        }

        case "BACKGROUND_MUSIC": {
            draft.audio!.backgroundMusic = {
                soundId: e.soundId,
                volume: e.volume ?? 0.5,
                loop: e.loop ?? true,
                startFrame: event.at,
            };
            break;
        }
    }
}

/**
 * Handle AutoSound derivation from any event type.
 * 
 * This runs for ALL events and derives audio cues based on registered rules.
 */
export function handleAutoSounds(
    draft: WorldState,
    event: TimelineEvent,
    ctx: HandlerContext
): void {
    ensureAudioState(draft);

    // Only fetch rules relevant to this event kind
    const rules = AutoSoundRegistry.getRulesForKind(event.kind);
    const instructions = deriveAudioInstructions(event, rules);

    for (const instruction of instructions) {
        const instanceId = instruction.instanceId || `auto_${ctx.eventIndex}_${event.at}`;

        if (instruction.action === "PLAY_ONE_SHOT" || instruction.action === "START_LOOP") {
            if (instruction.cue && instruction.soundId) {
                draft.audio!.activeSounds[instanceId] = {
                    soundId: instruction.soundId,
                    startFrame: event.at,
                    volume: instruction.cue.volume,
                    loop: instruction.cue.loop ?? false,
                    deviceId: instruction.cue.deviceId,
                    duration: instruction.cue.duration,
                    bus: instruction.cue.bus as any,
                } as any;
            }
        } else if (instruction.action === "STOP_SOUND") {
            if (instruction.instanceId) {
                delete draft.audio!.activeSounds[instruction.instanceId];
            }
        }
    }
}
