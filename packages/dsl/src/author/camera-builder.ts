/**
 * Camera Builder
 * 
 * Fluent API for defining camera operations in multi-POV episodes.
 * Controls cuts, layouts, and camera effects.
 */

import { SceneOp, POVSwitchOp, SplitPOVOp, POVLayout } from "@tokovo/ir";

/**
 * Camera effect options.
 */
export interface ZoomOptions {
    originX?: number;  // 0-1, default 0.5
    originY?: number;  // 0-1, default 0.5
    duration?: string;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface ShakeOptions {
    intensity?: number;    // Pixels, default 5
    frequency?: number;    // Oscillations per second, default 10
    decay?: number;        // 0-1, how quickly to fade, default 0.5
    duration?: string;
}

export interface PIPOptions {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    scale?: number;        // 0-1, default 0.3
}

/**
 * Camera operation that will be scheduled at a specific time.
 */
export interface CameraEvent {
    at: string;            // Duration expression (e.g., "3s")
    op: SceneOp;
}

/**
 * Camera builder collects camera operations.
 */
export class CameraBuilder {
    private readonly events: CameraEvent[] = [];
    private currentTime: string = "0s";

    /**
     * Set the current time for following operations.
     */
    at(time: string): this {
        this.currentTime = time;
        return this;
    }

    /**
     * Cut to a specific device.
     */
    cut(deviceId: string, transition?: "cut" | "crossfade" | "wipe"): this {
        const op: POVSwitchOp = {
            kind: "POVSwitch",
            deviceId,
            transition: transition ?? "cut",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * Set layout with multiple devices.
     */
    layout(
        type: "SINGLE" | "SPLIT_HORIZONTAL" | "SPLIT_VERTICAL" | "PIP",
        primaryDevice: string,
        secondaryDevice?: string,
        options?: PIPOptions
    ): this {
        if (type === "SINGLE") {
            const op: POVSwitchOp = {
                kind: "POVSwitch",
                deviceId: primaryDevice,
            };
            this.events.push({ at: this.currentTime, op });
        } else {
            // Map our layout types to IR POVLayout
            const layoutMap: Record<string, POVLayout> = {
                "SPLIT_HORIZONTAL": "horizontal",
                "SPLIT_VERTICAL": "vertical",
                "PIP": "pip",
            };
            const layout: POVLayout = layoutMap[type] ?? "horizontal";

            const op: SplitPOVOp = {
                kind: "SplitPOV",
                devices: secondaryDevice ? [primaryDevice, secondaryDevice] : [primaryDevice],
                layout,
            };
            this.events.push({ at: this.currentTime, op });
        }
        return this;
    }

    /**
     * Zoom in/out.
     */
    zoom(scale: number, options?: ZoomOptions): this {
        const op = {
            kind: "CameraZoom" as const,
            scale,
            duration: options?.duration,
            originX: options?.originX,
            originY: options?.originY,
            easing: options?.easing,
        };
        this.events.push({ at: this.currentTime, op: op as any });
        return this;
    }

    /**
     * Shake effect on a device.
     */
    shake(deviceId: string, options?: ShakeOptions): this {
        const op = {
            kind: "CameraShake" as const,
            deviceId,
            intensity: options?.intensity,
            frequency: options?.frequency,
            decay: options?.decay,
            duration: options?.duration,
        };
        this.events.push({ at: this.currentTime, op: op as any });
        return this;
    }

    /**
     * Get collected camera events.
     */
    getEvents(): CameraEvent[] {
        return this.events;
    }
}
