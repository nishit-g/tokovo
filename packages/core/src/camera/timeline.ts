/**
 * Camera Timeline - Compose Sequences of Camera Primitives
 * 
 * The timeline enables time-based composite moves like:
 * - "hold → pan → micro push" (message arrival)
 * - "hold → subtle push → hold" (typing anticipation)
 * - "fast follow → tighter zoom" (argument escalation)
 * 
 * DESIGN PHILOSOPHY:
 * - Timelines are PURE DATA describing motion sequences
 * - No app logic, no layout coupling
 * - Evaluating a timeline at time t produces a CameraTransform
 */

import {
    CameraTransform,
    DEFAULT_CAMERA_TRANSFORM,
    EasingType,
} from "../types";
import { applyEasing } from "./index";

// =============================================================================
// TIMELINE TYPES
// =============================================================================

/**
 * Camera primitive types for timeline steps
 */
export type CameraPrimitive =
    | "PAN"
    | "PUSH_IN"
    | "PULL_OUT"
    | "FOLLOW"
    | "SNAP"
    | "HOLD";

/**
 * Target specification for camera focus
 */
export interface CameraTarget {
    /** Target rectangle in world coordinates */
    rect?: { x: number; y: number; width: number; height: number };
    /** Normalized target point (0-1) */
    point?: { x: number; y: number };
}

/**
 * A single step in a camera timeline
 */
export interface TimelineStep {
    /** Which primitive to execute */
    primitive: CameraPrimitive;

    /** Duration in frames */
    duration: number;

    /** Easing function for this step */
    easing?: EasingType;

    // === PAN parameters ===
    /** X translation in pixels */
    translateX?: number;
    /** Y translation in pixels */
    translateY?: number;

    // === PUSH_IN / PULL_OUT parameters ===
    /** Target scale (1.0 = no zoom, 1.2 = 20% zoom in, 0.8 = 20% zoom out) */
    scale?: number;
    /** Target for zoom origin */
    target?: CameraTarget;

    // === FOLLOW parameters ===
    /** Lag factor 0.1 (tight) to 0.9 (loose) */
    lagFactor?: number;

    // === HOLD parameters ===
    // (none - just duration)
}

/**
 * A complete camera timeline (sequence of steps)
 */
export interface CameraTimeline {
    /** Unique ID for this timeline */
    id: string;

    /** Sequence of steps */
    steps: TimelineStep[];

    /** Total duration in frames (computed) */
    totalDuration: number;

    /** Loop behavior */
    loop?: boolean;
}

// =============================================================================
// TIMELINE COMPOSITION
// =============================================================================

/**
 * Compose a timeline from a list of steps
 * Calculates total duration and validates steps
 */
export function composeTimeline(
    id: string,
    steps: TimelineStep[],
    options?: { loop?: boolean }
): CameraTimeline {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

    return {
        id,
        steps,
        totalDuration,
        loop: options?.loop,
    };
}

// =============================================================================
// TIMELINE EVALUATION
// =============================================================================

/**
 * Evaluate a timeline at time t to produce a CameraTransform
 * 
 * @param timeline - The timeline to evaluate
 * @param t - Frame number relative to timeline start (0 = start)
 * @returns CameraTransform at time t
 */
export function evaluateTimeline(
    timeline: CameraTimeline,
    t: number
): CameraTransform {
    // Handle loop
    let localT = t;
    if (timeline.loop && timeline.totalDuration > 0) {
        localT = t % timeline.totalDuration;
    }

    // Clamp to timeline bounds
    if (localT < 0) localT = 0;
    if (localT >= timeline.totalDuration) localT = timeline.totalDuration - 1;

    // Find which step we're in and the progress within it
    let accumulated = 0;
    let currentStep: TimelineStep | null = null;
    let stepProgress = 0;

    for (const step of timeline.steps) {
        const stepEnd = accumulated + step.duration;

        if (localT < stepEnd) {
            currentStep = step;
            stepProgress = step.duration > 0
                ? (localT - accumulated) / step.duration
                : 1;
            break;
        }

        accumulated = stepEnd;
    }

    // If no step found (edge case), return default
    if (!currentStep) {
        return { ...DEFAULT_CAMERA_TRANSFORM };
    }

    // Apply easing to progress
    const easedProgress = applyEasing(
        stepProgress,
        currentStep.easing || "ease-out"
    );

    // Evaluate the step
    return evaluateStep(currentStep, easedProgress);
}

/**
 * Evaluate a single step at a given progress (0-1)
 */
function evaluateStep(step: TimelineStep, progress: number): CameraTransform {
    const transform: CameraTransform = { ...DEFAULT_CAMERA_TRANSFORM };

    switch (step.primitive) {
        case "PAN":
            transform.translateX = (step.translateX ?? 0) * progress;
            transform.translateY = (step.translateY ?? 0) * progress;
            break;

        case "PUSH_IN":
            // Scale from 1.0 toward target
            const pushScale = step.scale ?? 1.1;
            transform.scale = 1 + (pushScale - 1) * progress;

            // Set origin if target specified
            if (step.target?.point) {
                transform.originX = step.target.point.x;
                transform.originY = step.target.point.y;
            } else if (step.target?.rect) {
                // Center on rect
                transform.originX = (step.target.rect.x + step.target.rect.width / 2);
                transform.originY = (step.target.rect.y + step.target.rect.height / 2);
            }
            break;

        case "PULL_OUT":
            // Scale from current toward target (< 1.0)
            const pullScale = step.scale ?? 0.9;
            transform.scale = 1 + (pullScale - 1) * progress;
            // Origin stays centered for pullback
            transform.originX = 0.5;
            transform.originY = 0.5;
            break;

        case "FOLLOW":
            // Soft tracking with lag
            if (step.target?.point) {
                const lag = step.lagFactor ?? 0.5;
                const effectiveProgress = progress * (1 - lag);
                transform.originX = 0.5 + (step.target.point.x - 0.5) * effectiveProgress;
                transform.originY = 0.5 + (step.target.point.y - 0.5) * effectiveProgress;
            }
            // Slight zoom toward target
            if (step.scale) {
                transform.scale = 1 + (step.scale - 1) * progress;
            }
            break;

        case "SNAP":
            // Instant or very fast framing
            if (step.target?.point) {
                transform.originX = step.target.point.x;
                transform.originY = step.target.point.y;
            }
            if (step.scale) {
                transform.scale = step.scale;
            }
            break;

        case "HOLD":
            // No movement - return defaults
            break;
    }

    return transform;
}

// =============================================================================
// PRE-BUILT COMPOSITE MOVES
// =============================================================================

/**
 * Message Arrival Shot
 * hold → pan down → micro push
 */
export function createMessageArrivalTimeline(
    targetY: number,
    fps: number = 30
): CameraTimeline {
    return composeTimeline("message-arrival", [
        {
            primitive: "HOLD",
            duration: Math.round(fps * 0.1), // 100ms hold
        },
        {
            primitive: "PAN",
            duration: Math.round(fps * 0.4), // 400ms pan
            translateY: -targetY * 0.1, // Subtle pan toward target
            easing: "cinematic",
        },
        {
            primitive: "PUSH_IN",
            duration: Math.round(fps * 0.3), // 300ms push
            scale: 1.02, // Very subtle 2% zoom
            target: { point: { x: 0.5, y: 0.8 } }, // Bottom of screen
            easing: "ease-out",
        },
    ]);
}

/**
 * Typing Anticipation
 * hold → subtle push → hold
 */
export function createTypingAnticipationTimeline(
    fps: number = 30
): CameraTimeline {
    return composeTimeline("typing-anticipation", [
        {
            primitive: "HOLD",
            duration: Math.round(fps * 0.2), // 200ms initial hold
        },
        {
            primitive: "PUSH_IN",
            duration: Math.round(fps * 0.5), // 500ms subtle push
            scale: 1.015, // Very subtle 1.5% zoom
            target: { point: { x: 0.5, y: 0.95 } }, // Input area
            easing: "ease-out",
        },
        {
            primitive: "HOLD",
            duration: Math.round(fps * 1), // 1s hold at zoom
        },
    ]);
}

/**
 * Argument Escalation
 * fast follow → reduced lag → tighter zoom
 */
export function createEscalationTimeline(
    fps: number = 30
): CameraTimeline {
    return composeTimeline("escalation", [
        {
            primitive: "FOLLOW",
            duration: Math.round(fps * 0.3), // 300ms fast follow
            lagFactor: 0.2, // Low lag = reactive
            scale: 1.05,
            easing: "ease-in-out",
        },
        {
            primitive: "PUSH_IN",
            duration: Math.round(fps * 0.5), // 500ms tighter zoom
            scale: 1.1, // 10% zoom
            target: { point: { x: 0.5, y: 0.7 } },
            easing: "ease-out",
        },
    ]);
}

/**
 * Calm Reset
 * Smooth return to neutral
 */
export function createResetTimeline(
    fps: number = 30
): CameraTimeline {
    return composeTimeline("reset", [
        {
            primitive: "PULL_OUT",
            duration: Math.round(fps * 0.6), // 600ms pullout
            scale: 1.0, // Return to neutral
            easing: "cinematic",
        },
    ]);
}
