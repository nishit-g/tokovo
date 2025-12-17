/**
 * Camera Track Builder - God mode camera control
 * 
 * @description Provides full manual control over camera position, zoom, effects.
 * Supports both instant (point) and animated (span) operations.
 * 
 * @see docs-v2/DSL_REVAMP.md#camera-track---god-mode
 */

import { CameraTrackEvent, CameraPayloads, EasingType } from "@tokovo/ir";
import { parseTimeToFrames, parseDurationToFrames } from "./utils/time";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface CameraSetOptions {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    originX?: number;
    originY?: number;
}

export interface CameraAnimateOptions extends CameraSetOptions {
    duration: string | number;
    easing?: EasingType;
}

export interface CameraFocusOptions {
    scale?: number;
    padding?: number;
    duration?: string | number;
    easing?: EasingType;
}

export interface CameraTrackOptions {
    scale?: number;
    lag?: number;
}

export interface CameraShakeOptions {
    intensityX: number;
    intensityY: number;
    frequency?: number;
    decay?: number;
    duration: string | number;
}

export interface CameraResetOptions {
    duration?: string | number;
    easing?: EasingType;
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class CameraPointBuilder {
    constructor(
        private _frame: number,
        private _fps: number,
        private _events: CameraTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Set camera state instantly.
     */
    set(options: CameraSetOptions): void {
        this._events.push({
            at: this._frame,
            kind: "CAMERA",
            type: "SET",
            payload: {
                x: options.x,
                y: options.y,
                scale: options.scale,
                rotation: options.rotation,
                originX: options.originX,
                originY: options.originY,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Animate camera to new state.
     */
    animate(options: CameraAnimateOptions): void {
        const duration = parseDurationToFrames(options.duration, this._fps);

        this._events.push(
            {
                at: this._frame,
                duration,
                kind: "CAMERA",
                type: "ANIMATE_START",
                payload: {
                    x: options.x,
                    y: options.y,
                    scale: options.scale,
                    rotation: options.rotation,
                    originX: options.originX,
                    originY: options.originY,
                    easing: options.easing ?? "linear",
                },
                _declarationOrder: this._getOrder(),
            },
            {
                at: this._frame + duration,
                kind: "CAMERA",
                type: "ANIMATE_END",
                payload: {},
                _declarationOrder: this._getOrder(),
            }
        );
    }

    /**
     * Focus on an anchor.
     */
    focus(anchorId: string, options: CameraFocusOptions = {}): void {
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : 0;

        this._events.push({
            at: this._frame,
            duration: duration || undefined,
            kind: "CAMERA",
            type: "FOCUS",
            payload: {
                anchorId,
                scale: options.scale,
                padding: options.padding,
                easing: options.easing,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Apply screen shake effect.
     */
    shake(options: CameraShakeOptions): void {
        const duration = parseDurationToFrames(options.duration, this._fps);

        this._events.push(
            {
                at: this._frame,
                duration,
                kind: "CAMERA",
                type: "SHAKE_START",
                payload: {
                    intensityX: options.intensityX,
                    intensityY: options.intensityY,
                    frequency: options.frequency,
                    decay: options.decay,
                },
                _declarationOrder: this._getOrder(),
            },
            {
                at: this._frame + duration,
                kind: "CAMERA",
                type: "SHAKE_END",
                payload: {},
                _declarationOrder: this._getOrder(),
            }
        );
    }

    /**
     * Reset camera to default state.
     */
    reset(options: CameraResetOptions = {}): void {
        if (options.duration) {
            const duration = parseDurationToFrames(options.duration, this._fps);
            this._events.push(
                {
                    at: this._frame,
                    duration,
                    kind: "CAMERA",
                    type: "ANIMATE_START",
                    payload: {
                        x: 0,
                        y: 0,
                        scale: 1,
                        rotation: 0,
                        originX: 0.5,
                        originY: 0.5,
                        easing: options.easing ?? "easeOut",
                    },
                    _declarationOrder: this._getOrder(),
                },
                {
                    at: this._frame + duration,
                    kind: "CAMERA",
                    type: "ANIMATE_END",
                    payload: {},
                    _declarationOrder: this._getOrder(),
                }
            );
        } else {
            this._events.push({
                at: this._frame,
                kind: "CAMERA",
                type: "RESET",
                payload: {
                    easing: options.easing,
                },
                _declarationOrder: this._getOrder(),
            });
        }
    }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class CameraSpanBuilder {
    constructor(
        private _startFrame: number,
        private _endFrame: number,
        private _fps: number,
        private _events: CameraTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Track an anchor continuously.
     */
    track(anchorId: string, options: CameraTrackOptions = {}): void {
        this._events.push(
            {
                at: this._startFrame,
                duration: this._endFrame - this._startFrame,
                kind: "CAMERA",
                type: "TRACK_START",
                payload: {
                    anchorId,
                    scale: options.scale,
                    lag: options.lag,
                },
                _declarationOrder: this._getOrder(),
            },
            {
                at: this._endFrame,
                kind: "CAMERA",
                type: "TRACK_END",
                payload: {},
                _declarationOrder: this._getOrder(),
            }
        );
    }
}

// =============================================================================
// CAMERA TRACK BUILDER
// =============================================================================

export class CameraTrackBuilder {
    _events: CameraTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Create a point (instant) operation at a specific time.
     */
    at(time: string | number): CameraPointBuilder {
        const frame = parseTimeToFrames(time, this._fps);
        return new CameraPointBuilder(frame, this._fps, this._events, this._getOrder);
    }

    /**
     * Create a span (duration) operation between two times.
     */
    span(start: string | number, end: string | number): CameraSpanBuilder {
        const startFrame = parseTimeToFrames(start, this._fps);
        const endFrame = parseTimeToFrames(end, this._fps);
        return new CameraSpanBuilder(startFrame, endFrame, this._fps, this._events, this._getOrder);
    }
}
