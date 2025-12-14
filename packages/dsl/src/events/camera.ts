/**
 * Camera Event Factories
 * 
 * Low-level event creators for camera movements.
 */

import { TimelineEvent } from "@tokovo/core";

export interface ZoomOptions {
    originX?: number;
    originY?: number;
    easing?: string;
}

export interface PanOptions {
    easing?: string;
}

export interface ShakeOptions {
    frequency?: number;
    decay?: number;
}

/**
 * Camera event factories
 */
export const camera = {
    /**
     * Zoom in/out
     */
    zoom: (at: number, scale: number, duration: number, opts: ZoomOptions = {}): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ZOOM",
        scale,
        duration,
        originX: opts.originX ?? 0.5,
        originY: opts.originY ?? 0.5,
        easing: opts.easing ?? "ease-out",
    } as TimelineEvent),

    /**
     * Pan to position
     */
    pan: (at: number, translateX: number, translateY: number, duration: number, opts: PanOptions = {}): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "PAN",
        translateX,
        translateY,
        duration,
        easing: opts.easing ?? "ease-out",
    } as TimelineEvent),

    /**
     * Camera shake effect
     */
    shake: (at: number, intensity: number, duration: number, opts: ShakeOptions = {}): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "SHAKE",
        intensity,
        duration,
        frequency: opts.frequency ?? 18,
        decay: opts.decay ?? 0.5,
    } as TimelineEvent),

    /**
     * Reset camera to default
     */
    reset: (at: number, duration: number, easing = "ease-out"): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "RESET",
        duration,
        easing,
    } as TimelineEvent),
};
