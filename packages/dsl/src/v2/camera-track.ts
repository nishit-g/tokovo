/**
 * Camera Track Builder - God mode camera control
 * 
 * @description Provides full manual control over camera position, zoom, effects.
 * Supports both instant (point) and animated (span) operations.
 * 
 * @see docs-v2/DSL_REVAMP.md#camera-track---god-mode
 */

import { CameraTrackEvent, CameraPayloads, EasingType } from "@tokovo/ir";
import { parseTimeToFrames, parseDurationToFrames } from "./utils/time.js";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export type CameraTarget =
    | string
    | {
        deviceId: string;
        anchorId: string;
    };

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
    preset?: "cinematic" | "drama" | "fast-beat" | "calm";
    scale?: number;
    smoothing?: number;
    deadZonePx?: number;
    maxVelocityPxPerSec?: number;
    predictiveLookaheadFrames?: number;
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
    spring?: string;
}

export interface CameraZoomOptions {
    scale: number;
    duration?: string | number;
    easing?: EasingType;
    originX?: number;
    originY?: number;
}

export interface CameraPanOptions {
    x: number;
    y: number;
    duration?: string | number;
    easing?: EasingType;
}

export interface CameraPunchZoomOptions {
    intensity?: number;
    direction?: "in" | "out";
    duration?: string | number;
    spring?: string;
}

export interface CameraDutchTiltOptions {
    angle: number;
    duration?: string | number;
    spring?: string;
}

export interface CameraFlashOptions {
    color?: string;
    intensity?: number;
    duration?: string | number;
}

export interface CameraWhipPanOptions {
    direction: "left" | "right" | "up" | "down";
    blur?: number;
    duration?: string | number;
}

export interface CameraLayoutOptions {
    mode: "SINGLE" | "SPLIT_HORIZONTAL" | "SPLIT_VERTICAL" | "PIP" | "split";
    primaryDeviceId: string;
    secondaryDeviceId?: string;
    pipPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    pipScale?: number;
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
     * Convenience zoom helper.
     * - zoom(1.2)
     * - zoom(1.2, "0.5s", "easeOut")
     * - zoom({ scale: 1.2, duration: "0.5s", easing: "easeOut" })
     */
    zoom(
        scaleOrOptions: number | CameraZoomOptions,
        duration?: string | number,
        easing?: EasingType,
    ): void {
        if (typeof scaleOrOptions === "number") {
            if (duration !== undefined) {
                this.animate({
                    scale: scaleOrOptions,
                    duration,
                    easing,
                });
                return;
            }
            this.set({ scale: scaleOrOptions });
            return;
        }

        const { duration: zoomDuration, easing: zoomEasing, ...rest } = scaleOrOptions;
        if (zoomDuration !== undefined) {
            this.animate({
                ...rest,
                duration: zoomDuration,
                easing: zoomEasing,
            });
            return;
        }
        this.set(rest);
    }

    /**
     * Convenience pan helper.
     * - pan({ x, y })
     * - pan({ x, y, duration: "0.5s", easing: "easeOut" })
     * - pan(x, y, "0.5s", "easeOut")
     */
    pan(
        xOrOptions: number | CameraPanOptions,
        y?: number,
        duration?: string | number,
        easing?: EasingType,
    ): void {
        if (typeof xOrOptions === "number") {
            const x = xOrOptions;
            const yVal = y ?? 0;
            if (duration !== undefined) {
                this.animate({
                    x,
                    y: yVal,
                    duration,
                    easing,
                });
                return;
            }
            this.set({ x, y: yVal });
            return;
        }

        const { duration: panDuration, easing: panEasing, ...rest } = xOrOptions;
        if (panDuration !== undefined) {
            this.animate({
                ...rest,
                duration: panDuration,
                easing: panEasing,
            });
            return;
        }
        this.set(rest);
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
    focus(target: CameraTarget, options: CameraFocusOptions = {}): void {
        const anchorId = typeof target === "string" ? target : target.anchorId;
        const deviceId = typeof target === "string" ? undefined : target.deviceId;
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : 0;

        this._events.push({
            at: this._frame,
            duration: duration || undefined,
            deviceId,
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
     * Set multi-device layout mode (SINGLE / SPLIT / PIP).
     */
    layout(options: CameraLayoutOptions): void {
        this._events.push({
            at: this._frame,
            kind: "CAMERA",
            type: "LAYOUT",
            payload: {
                mode: options.mode,
                primaryDeviceId: options.primaryDeviceId,
                secondaryDeviceId: options.secondaryDeviceId,
                pipPosition: options.pipPosition,
                pipScale: options.pipScale,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Apply screen shake effect.
     */
    shake(options: CameraShakeOptions): void;
    shake(intensity: number, duration?: string | number): void;
    shake(
        optionsOrIntensity: CameraShakeOptions | number,
        duration?: string | number,
    ): void {
        const options: CameraShakeOptions =
            typeof optionsOrIntensity === "number"
                ? {
                    intensityX: optionsOrIntensity,
                    intensityY: optionsOrIntensity,
                    duration: duration ?? "0.3s",
                }
                : optionsOrIntensity;

        const durationFrames = parseDurationToFrames(options.duration, this._fps);

        this._events.push(
            {
                at: this._frame,
                duration: durationFrames,
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
                at: this._frame + durationFrames,
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
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : 30; // Default 1 second at 30fps

        this._events.push({
            at: this._frame,
            duration,
            kind: "CAMERA",
            type: "RESET",
            payload: {
                easing: options.easing ?? "easeOut",
                spring: options.spring,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Punch zoom effect (quick impact zoom with spring bounce).
     */
    punchZoom(options: CameraPunchZoomOptions): void {
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : undefined;

        this._events.push({
            at: this._frame,
            duration,
            kind: "CAMERA",
            type: "PUNCH_ZOOM",
            payload: {
                intensity: options.intensity ?? 0.15,
                direction: options.direction ?? "in",
                spring: options.spring,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Dutch tilt effect (tilt for tension).
     */
    dutchTilt(options: CameraDutchTiltOptions): void {
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : undefined;

        this._events.push({
            at: this._frame,
            duration,
            kind: "CAMERA",
            type: "DUTCH_TILT",
            payload: {
                angle: options.angle,
                spring: options.spring,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Flash effect (screen flash overlay).
     */
    flash(options: CameraFlashOptions = {}): void {
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : undefined;

        this._events.push({
            at: this._frame,
            duration,
            kind: "CAMERA",
            type: "FLASH",
            payload: {
                color: options.color,
                intensity: options.intensity,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Whip-pan effect (fast motion blur pan).
     */
    whipPan(options: CameraWhipPanOptions): void {
        const duration = options.duration
            ? parseDurationToFrames(options.duration, this._fps)
            : undefined;

        this._events.push({
            at: this._frame,
            duration,
            kind: "CAMERA",
            type: "WHIP_PAN",
            payload: {
                direction: options.direction,
                blur: options.blur,
            },
            _declarationOrder: this._getOrder(),
        });
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
    track(target: CameraTarget, options: CameraTrackOptions = {}): void {
        const anchorId = typeof target === "string" ? target : target.anchorId;
        const deviceId = typeof target === "string" ? undefined : target.deviceId;
        this._events.push(
            {
                at: this._startFrame,
                duration: this._endFrame - this._startFrame,
                deviceId,
                kind: "CAMERA",
                type: "TRACK_START",
                payload: {
                    anchorId,
                    preset: options.preset,
                    scale: options.scale,
                    smoothing: options.smoothing,
                    deadZonePx: options.deadZonePx,
                    maxVelocityPxPerSec: options.maxVelocityPxPerSec,
                    predictiveLookaheadFrames: options.predictiveLookaheadFrames,
                },
                _declarationOrder: this._getOrder(),
            } as CameraTrackEvent,
            {
                at: this._endFrame,
                kind: "CAMERA",
                type: "TRACK_END",
                payload: {},
                _declarationOrder: this._getOrder(),
            } as CameraTrackEvent
        );
    }

    trackCinematic(anchorId: string, options: Omit<CameraTrackOptions, "preset"> = {}): void {
        this.track(anchorId, { ...options, preset: "cinematic" });
    }

    trackDrama(anchorId: string, options: Omit<CameraTrackOptions, "preset"> = {}): void {
        this.track(anchorId, { ...options, preset: "drama" });
    }

    trackFastBeat(anchorId: string, options: Omit<CameraTrackOptions, "preset"> = {}): void {
        this.track(anchorId, { ...options, preset: "fast-beat" });
    }

    trackCalm(anchorId: string, options: Omit<CameraTrackOptions, "preset"> = {}): void {
        this.track(anchorId, { ...options, preset: "calm" });
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
