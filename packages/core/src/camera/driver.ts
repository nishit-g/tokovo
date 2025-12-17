/**
 * Camera Driver - Represents a camera animation or state
 * 
 * @description Drivers are used by the conflict resolver to determine
 * which camera state wins based on priority and declaration order.
 * 
 * @see docs-v2/DSL_REVAMP.md#conflict-resolution
 */

import { EasingType } from "@tokovo/ir";

// =============================================================================
// CAMERA STATE
// =============================================================================

/**
 * V2 Camera State - Used by the conflict resolver.
 * Named differently from types.ts CameraState to avoid conflicts.
 */
export interface V2CameraState {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    originX: number;
    originY: number;
}

export const DEFAULT_V2_CAMERA_STATE: V2CameraState = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    originX: 0.5,
    originY: 0.5,
};

export const V2_CAMERA_PROPERTIES: (keyof V2CameraState)[] = [
    "x", "y", "scale", "rotation", "originX", "originY"
];

// =============================================================================
// CAMERA DRIVER
// =============================================================================

/**
 * Camera driver sources.
 */
export type CameraSource = "manual" | "focus" | "track" | "preset" | "director";

/**
 * Priority levels for camera sources.
 */
export const CAMERA_PRIORITY: Record<CameraSource, number> = {
    manual: 100,      // Manual track commands
    focus: 50,        // cam.focus() commands
    track: 50,        // cam.track() commands (span)
    preset: 50,       // Presets (shake, etc.)
    director: 10,     // DirectorLite auto-camera
};

/**
 * Camera driver - represents a single animation or state change.
 */
export interface CameraDriver {
    /** Unique ID */
    id: string;

    /** Source of this driver */
    source: CameraSource;

    /** Priority (higher wins) */
    priority: number;

    /** Property being animated */
    property: keyof CameraState;

    /** Start frame */
    startFrame: number;

    /** End frame (same as start for instants) */
    endFrame: number;

    /** Start value */
    startValue: number;

    /** End value */
    endValue: number;

    /** Easing function */
    easing: EasingType;

    /** Declaration order for tie-breaking */
    declarationOrder: number;
}

// =============================================================================
// DRIVER COLLECTION
// =============================================================================

/**
 * Collection of active camera drivers.
 */
export class CameraDriverCollection {
    private drivers: CameraDriver[] = [];

    /**
     * Add a driver.
     */
    add(driver: CameraDriver): void {
        this.drivers.push(driver);
    }

    /**
     * Remove completed drivers.
     */
    cleanup(currentFrame: number): void {
        this.drivers = this.drivers.filter(d => d.endFrame >= currentFrame);
    }

    /**
     * Get all active drivers at a frame.
     */
    getActiveAt(frame: number): CameraDriver[] {
        return this.drivers.filter(d =>
            d.startFrame <= frame && frame <= d.endFrame
        );
    }

    /**
     * Get all drivers.
     */
    getAll(): CameraDriver[] {
        return [...this.drivers];
    }

    /**
     * Clear all drivers.
     */
    clear(): void {
        this.drivers = [];
    }
}
