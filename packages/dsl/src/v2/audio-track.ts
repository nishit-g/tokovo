/**
 * Audio Track Builder - Background music, sound effects, crossfades
 * 
 * @description Provides control over audio playback including
 * background music spans, one-shot sounds, crossfades, and fades.
 * 
 * @see docs-v2/DSL_REVAMP.md#audio-track
 */

import { AudioTrackEvent } from "@tokovo/ir";
import { parseTimeToFrames, parseDurationToFrames } from "./utils/time.js";

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
    constructor(
        private _frame: number,
        private _fps: number,
        private _events: AudioTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Play a one-shot sound effect.
     */
    play(soundId: string, options: PlayOptions = {}): void {
        this._events.push({
            at: this._frame,
            kind: "AUDIO",
            type: "PLAY",
            payload: {
                soundId,
                volume: options.volume,
                loop: options.loop,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Stop a specific sound.
     */
    stop(soundId: string): void {
        this._events.push({
            at: this._frame,
            kind: "AUDIO",
            type: "STOP",
            payload: { soundId },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Stop all sounds.
     */
    stopAll(): void {
        this._events.push({
            at: this._frame,
            kind: "AUDIO",
            type: "STOP_ALL",
            payload: {},
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Crossfade to a new track.
     */
    crossfade(soundId: string, options: CrossfadeOptions): void {
        const duration = parseDurationToFrames(options.duration, this._fps);
        this._events.push({
            at: this._frame,
            duration,
            kind: "AUDIO",
            type: "CROSSFADE",
            payload: {
                soundId,
                volume: options.volume ?? 1,
                duration,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Fade out all audio.
     */
    fadeOut(options: FadeOutOptions): void {
        const duration = parseDurationToFrames(options.duration, this._fps);
        this._events.push({
            at: this._frame,
            duration,
            kind: "AUDIO",
            type: "FADE_OUT",
            payload: { duration },
            _declarationOrder: this._getOrder(),
        });
    }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class AudioSpanBuilder {
    constructor(
        private _startFrame: number,
        private _endFrame: number,
        private _fps: number,
        private _events: AudioTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Play background music for the span duration.
     */
    bgm(soundId: string, options: BgmOptions = {}): void {
        const duration = this._endFrame - this._startFrame;
        const fadeIn = options.fadeIn
            ? parseDurationToFrames(options.fadeIn, this._fps)
            : undefined;
        const fadeOut = options.fadeOut
            ? parseDurationToFrames(options.fadeOut, this._fps)
            : undefined;

        this._events.push(
            {
                at: this._startFrame,
                duration,
                kind: "AUDIO",
                type: "BGM_START",
                payload: {
                    soundId,
                    volume: options.volume ?? 0.3,
                    fadeIn,
                },
                _declarationOrder: this._getOrder(),
            },
            {
                at: this._endFrame,
                kind: "AUDIO",
                type: "BGM_END",
                payload: { fadeOut },
                _declarationOrder: this._getOrder(),
            }
        );
    }
}

// =============================================================================
// AUDIO TRACK BUILDER
// =============================================================================

export class AudioTrackBuilder {
    _events: AudioTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Create a point (instant) operation at a specific time.
     */
    at(time: string | number): AudioPointBuilder {
        const frame = parseTimeToFrames(time, this._fps);
        return new AudioPointBuilder(frame, this._fps, this._events, this._getOrder);
    }

    /**
     * Create a span (duration) operation between two times.
     */
    span(start: string | number, end: string | number): AudioSpanBuilder {
        const startFrame = parseTimeToFrames(start, this._fps);
        const endFrame = parseTimeToFrames(end, this._fps);
        return new AudioSpanBuilder(startFrame, endFrame, this._fps, this._events, this._getOrder);
    }
}
