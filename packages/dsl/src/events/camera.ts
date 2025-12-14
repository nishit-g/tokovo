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

    // =========================================================================
    // SEMANTIC ANCHOR CAMERA (Webseries Style)
    // =========================================================================

    /**
     * Focus on a semantic anchor (one-time origin set)
     * 
     * @param at - Frame to start effect
     * @param anchor - Semantic anchor ID (lastMessage, inputArea, etc.)
     * @param preset - Shot preset (dramatic, subtle, impact, etc.)
     * @param shake - Optional shake intensity
     */
    anchorFocus: (at: number, anchor: string, preset = "message", shake = 0): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ANCHOR_FOCUS",
        anchor,
        preset,
        shake,
        duration: getPresetDuration(preset),
        easing: "ease-out",
    } as TimelineEvent),

    /**
     * Track a semantic anchor with smooth following (Webseries Camera!)
     * 
     * Unlike anchorFocus which sets origin once, anchorTrack continuously
     * follows the anchor rect with exponential smoothing.
     * 
     * @param at - Frame to start tracking
     * @param anchor - Semantic anchor ID
     * @param duration - Frames to track (default: 35)
     * @param smoothing - Smoothing factor: 0.08=slow, 0.18=operator, 0.35=snappy, 0.6=whip
     * @param preset - Optional preset for scale (default uses operatorFollow)
     */
    anchorTrack: (at: number, anchor: string, duration = 35, smoothing = 0.18, preset?: string): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "ANCHOR_TRACK",
        anchor,
        duration,
        smoothing,
        preset: preset ?? "operatorFollow",
        easing: "ease-out",
    } as TimelineEvent),

    /**
     * Hold current camera position (let viewer read)
     * 
     * @param at - Frame to start hold
     * @param duration - Frames to hold (min 12 recommended)
     */
    hold: (at: number, duration = 18): TimelineEvent => ({
        at,
        kind: "CAMERA",
        type: "HOLD",
        duration,
    } as TimelineEvent),

    /**
     * Punch + Glide: The webseries signature move
     * Fast zoom-in, then smooth follow.
     * 
     * Combines: impactPunch(10 frames) → operatorFollow(35 frames)
     * 
     * @param at - Frame to start
     * @param anchor - Semantic anchor to follow
     */
    punchGlide: (at: number, anchor: string): TimelineEvent[] => [
        // Phase 1: Punch (fast zoom + shake)
        {
            at,
            kind: "CAMERA",
            type: "ANCHOR_FOCUS",
            anchor,
            preset: "impactPunch",
            shake: 3,
            duration: 10,
            easing: "ease-out",
        } as TimelineEvent,
        // Phase 2: Glide (smooth follow)
        {
            at: at + 10,
            kind: "CAMERA",
            type: "ANCHOR_TRACK",
            anchor,
            duration: 35,
            smoothing: 0.18,
            preset: "operatorFollow",
            easing: "ease-out",
        } as TimelineEvent,
    ],
};

/**
 * Get duration from preset name (v1 locked values)
 */
function getPresetDuration(preset: string): number {
    switch (preset) {
        // v1 CORE (LOCKED)
        case "message": return 22;
        case "subtle": return 30;
        case "impact": return 14;
        case "snap": return 8;
        // v1 MOTION (LOCKED)
        case "operatorFollow": return 40;
        case "punchGlide": return 40;
        // v1 INTERRUPTION (LOCKED)
        case "interrupt": return 10;
        case "takeover": return 20;
        // v1 STRUCTURAL (LOCKED)  
        case "reset": return 20;
        case "establish": return 30;
        // v2 (feature-flagged)
        case "suspenseHold": return 50;
        case "voyeur": return 40;
        case "isolation": return 35;
        case "whipSnap": return 6;
        case "floatFollow": return 60;
        case "panic": return 12;
        case "collapse": return 40;
        // Legacy (deprecated)
        case "dramatic": return 25;
        case "impactPunch": return 10;
        case "documentaryHold": return 24;
        case "documentary": return 45;
        default: return 22;  // Default to message
    }
}

