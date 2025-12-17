/**
 * Audio Track Builder - Background music, sound effects, crossfades
 *
 * Provides control over audio playback including
 * background music spans, one-shot sounds, crossfades, and fades.
 */

import type { AudioTrackEvent } from "@tokovo/ir";
import { parseTimeToFrames, parseDurationToFrames } from "../../utils/time";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface BgmOptions {
    volume?: number;
    fadeIn?: string | number;
    fadeOut?: string | number;
}

export interface PlayOptions {
    volume?: number;
    loop?: boolean;
}

export interface CrossfadeOptions {
    duration: string | number;
    volume?: number;
}

export interface FadeOutOptions {
    duration: string | number;
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class AudioPointBuilder {
    private readonly frame: number;
    private readonly fps: number;
    private readonly events: AudioTrackEvent[];
    private readonly getOrder: GetDeclarationOrder;

    constructor(
        frame: number,
        fps: number,
        events: AudioTrackEvent[],
        getOrder: GetDeclarationOrder
    ) {
        this.frame = frame;
        this.fps = fps;
        this.events = events;
        this.getOrder = getOrder;
    }

    /**
     * Play a one-shot sound effect.
     */
    play(soundId: string, options: PlayOptions = {}): void {
        const event: AudioTrackEvent = {
            at: this.frame,
            kind: "AUDIO",
            type: "PLAY",
            payload: {
                soundId,
                volume: options.volume,
                loop: options.loop,
            },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Stop a specific sound.
     */
    stop(soundId: string): void {
        const event: AudioTrackEvent = {
            at: this.frame,
            kind: "AUDIO",
            type: "STOP",
            payload: { soundId },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Stop all sounds.
     */
    stopAll(): void {
        const event: AudioTrackEvent = {
            at: this.frame,
            kind: "AUDIO",
            type: "STOP_ALL",
            payload: {},
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Crossfade to a new track.
     */
    crossfade(soundId: string, options: CrossfadeOptions): void {
        const duration = parseDurationToFrames(options.duration, this.fps);
        const event: AudioTrackEvent = {
            at: this.frame,
            duration,
            kind: "AUDIO",
            type: "CROSSFADE",
            payload: {
                soundId,
                volume: options.volume ?? 1,
                duration,
            },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Fade out all audio.
     */
    fadeOut(options: FadeOutOptions): void {
        const duration = parseDurationToFrames(options.duration, this.fps);
        const event: AudioTrackEvent = {
            at: this.frame,
            duration,
            kind: "AUDIO",
            type: "FADE_OUT",
            payload: { duration },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class AudioSpanBuilder {
    private readonly startFrame: number;
    private readonly endFrame: number;
    private readonly fps: number;
    private readonly events: AudioTrackEvent[];
    private readonly getOrder: GetDeclarationOrder;

    constructor(
        startFrame: number,
        endFrame: number,
        fps: number,
        events: AudioTrackEvent[],
        getOrder: GetDeclarationOrder
    ) {
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.fps = fps;
        this.events = events;
        this.getOrder = getOrder;
    }

    /**
     * Play background music for the span duration.
     */
    bgm(soundId: string, options: BgmOptions = {}): void {
        const duration = this.endFrame - this.startFrame;
        const fadeIn = options.fadeIn !== undefined
            ? parseDurationToFrames(options.fadeIn, this.fps)
            : undefined;
        const fadeOut = options.fadeOut !== undefined
            ? parseDurationToFrames(options.fadeOut, this.fps)
            : undefined;

        const startEvent: AudioTrackEvent = {
            at: this.startFrame,
            duration,
            kind: "AUDIO",
            type: "BGM_START",
            payload: {
                soundId,
                volume: options.volume ?? 0.3,
                fadeIn,
            },
            _declarationOrder: this.getOrder(),
        };

        const endEvent: AudioTrackEvent = {
            at: this.endFrame,
            kind: "AUDIO",
            type: "BGM_END",
            payload: { fadeOut },
            _declarationOrder: this.getOrder(),
        };

        this.events.push(startEvent, endEvent);
    }
}

// =============================================================================
// AUDIO TRACK BUILDER
// =============================================================================

export class AudioTrackBuilder {
    readonly _events: AudioTrackEvent[] = [];
    private readonly fps: number;
    private readonly getOrder: GetDeclarationOrder;

    constructor(fps: number, getOrder: GetDeclarationOrder) {
        this.fps = fps;
        this.getOrder = getOrder;
    }

    /**
     * Create a point (instant) operation at a specific time.
     */
    at(time: string | number): AudioPointBuilder {
        const frame = parseTimeToFrames(time, this.fps);
        return new AudioPointBuilder(frame, this.fps, this._events, this.getOrder);
    }

    /**
     * Create a span (duration) operation between two times.
     */
    span(start: string | number, end: string | number): AudioSpanBuilder {
        const startFrame = parseTimeToFrames(start, this.fps);
        const endFrame = parseTimeToFrames(end, this.fps);
        return new AudioSpanBuilder(startFrame, endFrame, this.fps, this._events, this.getOrder);
    }
}
