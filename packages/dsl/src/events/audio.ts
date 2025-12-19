/**
 * Audio Event Factories
 * 
 * Low-level event creators for sound effects and music.
 */

import { TimelineEvent } from "@tokovo/core";
import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

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
        trace: createTrace(Tracer.capture()),
        soundId,
        volume,
        loop: opts.loop,
        duration: opts.duration,
        instanceId: opts.instanceId,
        deviceId: opts.deviceId,
    } as any),

    /**
     * Stop a sound
     */
    stop: (at: number, instanceId: string): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "STOP_SOUND",
        trace: createTrace(Tracer.capture()),
        instanceId,
    } as any),

    /**
     * Fade volume
     */
    fade: (at: number, instanceId: string, toVolume: number, duration: number): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "FADE_VOLUME",
        trace: createTrace(Tracer.capture()),
        instanceId,
        toVolume,
        duration,
    } as any),

    /**
     * Play background music
     */
    backgroundMusic: (at: number, soundId: string, volume = 0.5, loop = true): TimelineEvent => ({
        at,
        kind: "AUDIO",
        type: "BACKGROUND_MUSIC",
        trace: createTrace(Tracer.capture()),
        soundId,
        volume,
        loop,
    } as any),
};
