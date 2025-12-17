/**
 * Camera Conflict Resolver - Priority-based camera state resolution
 * 
 * @description Resolves conflicts when multiple sources want to control
 * the camera. Higher priority wins. Per-property resolution.
 * 
 * Rules:
 * 1. Higher priority CAN interrupt lower priority mid-animation
 * 2. Per-property resolution (scale from one source, x from another)
 * 3. Same priority: later declaration order wins
 * 
 * @see docs-v2/DSL_REVAMP.md#conflict-resolution
 */

import {
    CameraDriver,
    V2CameraState,
    DEFAULT_V2_CAMERA_STATE,
    V2_CAMERA_PROPERTIES
} from "./driver";

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

const EASING_FUNCTIONS: Record<string, (t: number) => number> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    cinematic: (t) => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

// =============================================================================
// RESOLVER
// =============================================================================

/**
 * Resolve camera state at a specific frame.
 * 
 * @param drivers - All active camera drivers
 * @param frame - Current frame
 * @returns Resolved camera state
 */
export function resolveCameraState(
    drivers: CameraDriver[],
    frame: number
): V2CameraState {
    const result: V2CameraState = { ...DEFAULT_V2_CAMERA_STATE };

    // Resolve each property independently
    for (const prop of V2_CAMERA_PROPERTIES) {
        // Get drivers affecting this property at this frame
        const active = drivers
            .filter(d =>
                d.property === prop &&
                d.startFrame <= frame &&
                frame <= d.endFrame
            )
            .sort((a, b) => {
                // 1. Higher priority wins
                if (b.priority !== a.priority) {
                    return b.priority - a.priority;
                }
                // 2. Same priority: later declaration wins
                return b.declarationOrder - a.declarationOrder;
            });

        if (active.length > 0) {
            const winner = active[0];
            result[prop] = interpolateValue(winner, frame);
        }
    }

    return result;
}

/**
 * Interpolate a driver's value at a specific frame.
 */
function interpolateValue(driver: CameraDriver, frame: number): number {
    // Instant (no duration)
    if (driver.startFrame === driver.endFrame) {
        return driver.endValue;
    }

    const easingFn = EASING_FUNCTIONS[driver.easing] ?? EASING_FUNCTIONS.linear;

    // Calculate progress
    const progress = (frame - driver.startFrame) / (driver.endFrame - driver.startFrame);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const easedProgress = easingFn(clampedProgress);

    // Interpolate between start and end values
    return driver.startValue + (driver.endValue - driver.startValue) * easedProgress;
}

/**
 * Check if a higher priority source can interrupt current animations.
 * 
 * @returns True if the new driver should interrupt existing ones
 */
export function canInterrupt(
    existingDrivers: CameraDriver[],
    newDriver: CameraDriver,
    frame: number
): boolean {
    const activeOnSameProperty = existingDrivers.filter(d =>
        d.property === newDriver.property &&
        d.startFrame <= frame &&
        frame <= d.endFrame
    );

    // No competition - can always apply
    if (activeOnSameProperty.length === 0) {
        return true;
    }

    // Check if new driver has higher priority than all existing
    const highestExistingPriority = Math.max(
        ...activeOnSameProperty.map(d => d.priority)
    );

    return newDriver.priority >= highestExistingPriority;
}

/**
 * Merge a new driver into the collection, handling interruptions.
 */
export function mergeDriver(
    existingDrivers: CameraDriver[],
    newDriver: CameraDriver,
    frame: number
): CameraDriver[] {
    // If can't interrupt, just add (lower priority will lose anyway)
    if (!canInterrupt(existingDrivers, newDriver, frame)) {
        return [...existingDrivers, newDriver];
    }

    // Remove any lower-priority drivers on the same property that are active
    const filtered = existingDrivers.filter(d => {
        if (d.property !== newDriver.property) return true;
        if (d.startFrame > frame || frame > d.endFrame) return true;
        return d.priority >= newDriver.priority;
    });

    return [...filtered, newDriver];
}
