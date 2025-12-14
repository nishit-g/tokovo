/**
 * Audio Event Factories
 * 
 * Low-level event creators for sound effects and music.
 */

import { TimelineEvent } from "@tokovo/core";

export interface PlayOptions {
    loop?: boolean;
    duration?: number;
    instanceId?: string;
    deviceId?: string;
}

export interface FadeOptions {
    easing?: string;
}

/**
 * Audio event factories
 */
export const audio = {
    /**
     * Play a sound effect
     */
    play: (at: number, soundId: string, volume = 1.0, opts: PlayOptions = {}): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "PLAY_SOUND",
        soundId,
        volume,
        loop: opts.loop,
        duration: opts.duration,
        instanceId: opts.instanceId,
        deviceId: opts.deviceId,
    } as TimelineEvent),

    /**
     * Stop a sound
     */
    stop: (at: number, instanceId: string): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "STOP_SOUND",
        instanceId,
    } as TimelineEvent),

    /**
     * Fade volume
     */
    fade: (at: number, instanceId: string, toVolume: number, duration: number): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "FADE_VOLUME",
        instanceId,
        toVolume,
        duration,
    } as TimelineEvent),

    /**
     * Play background music
     */
    backgroundMusic: (at: number, soundId: string, volume = 0.5, loop = true): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "BACKGROUND_MUSIC",
        soundId,
        volume,
        loop,
    } as TimelineEvent),
};
