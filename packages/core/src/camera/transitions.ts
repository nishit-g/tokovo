/**
 * Transition System - Screen transition rendering and state
 * 
 * Handles animated transitions between screens/apps.
 */

import { TransitionType, EasingType } from "../types";

// =============================================================================
// TRANSITION STATE
// =============================================================================

/**
 * Active transition state
 */
export interface TransitionState {
    active?: {
        type: TransitionType;
        from: string;
        to: string;
        startFrame: number;
        duration: number;
        easing?: EasingType;
    };
}

/**
 * Default transition state
 */
export const DEFAULT_TRANSITION_STATE: TransitionState = {};

// =============================================================================
// TRANSITION COMPUTATION
// =============================================================================

/**
 * Compute transition progress at frame t
 * Returns 0-1 progress value with easing applied
 */
export function computeTransitionProgress(
    transition: TransitionState["active"],
    t: number,
    applyEasing: (progress: number, easing: EasingType) => number
): number {
    if (!transition) return 1;

    const { startFrame, duration, easing = "ease-out" } = transition;
    const endFrame = startFrame + duration;

    if (t < startFrame) return 0;
    if (t >= endFrame) return 1;

    const rawProgress = (t - startFrame) / duration;
    return applyEasing(rawProgress, easing);
}

// =============================================================================
// TRANSITION STYLES
// =============================================================================

/**
 * CSS Properties type (compatible with React.CSSProperties)
 */
type CSSProperties = Record<string, string | number | undefined>;

/**
 * CSS transform/opacity for transition animations
 */
export interface TransitionStyles {
    from: CSSProperties;
    to: CSSProperties;
}

/**
 * Get CSS styles for a transition type at given progress
 */
export function getTransitionStyles(
    type: TransitionType,
    progress: number,
    isFrom: boolean
): CSSProperties {
    // Progress 0 = transition start, 1 = transition end
    // For "from" view: starts at 1 opacity, ends at 0
    // For "to" view: starts at 0 opacity, ends at 1

    const t = isFrom ? 1 - progress : progress;

    switch (type) {
        case "FADE":
            return {
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_LEFT":
            return {
                transform: isFrom
                    ? `translateX(${-progress * 100}%)`
                    : `translateX(${(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_RIGHT":
            return {
                transform: isFrom
                    ? `translateX(${progress * 100}%)`
                    : `translateX(${-(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_UP":
            return {
                transform: isFrom
                    ? `translateY(${-progress * 100}%)`
                    : `translateY(${(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "SLIDE_DOWN":
            return {
                transform: isFrom
                    ? `translateY(${progress * 100}%)`
                    : `translateY(${-(1 - progress) * 100}%)`,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "ZOOM_IN":
            return {
                transform: isFrom
                    ? `scale(${1 + progress * 0.2})`
                    : `scale(${0.8 + progress * 0.2})`,
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "ZOOM_OUT":
            return {
                transform: isFrom
                    ? `scale(${1 - progress * 0.2})`
                    : `scale(${1.2 - progress * 0.2})`,
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };

        case "CROSS_DISSOLVE":
            return {
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                mixBlendMode: "normal" as const,
            };

        default:
            return {
                opacity: t,
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            };
    }
}

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

/**
 * Common transition presets
 */
export const TRANSITION_PRESETS = {
    /** iOS app open animation */
    appOpen: {
        type: "ZOOM_IN" as TransitionType,
        duration: 15,
        easing: "ease-out" as EasingType,
    },

    /** iOS app close animation */
    appClose: {
        type: "ZOOM_OUT" as TransitionType,
        duration: 12,
        easing: "ease-in" as EasingType,
    },

    /** Standard navigation push */
    push: {
        type: "SLIDE_LEFT" as TransitionType,
        duration: 18,
        easing: "ease-out" as EasingType,
    },

    /** Standard navigation pop */
    pop: {
        type: "SLIDE_RIGHT" as TransitionType,
        duration: 18,
        easing: "ease-out" as EasingType,
    },

    /** Modal presentation */
    modal: {
        type: "SLIDE_UP" as TransitionType,
        duration: 20,
        easing: "ease-out" as EasingType,
    },

    /** Lock screen unlock */
    unlock: {
        type: "FADE" as TransitionType,
        duration: 10,
        easing: "ease-out" as EasingType,
    },
} as const;
