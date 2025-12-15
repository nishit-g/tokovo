/**
 * Camera Builder
 * 
 * Fluent API for defining camera operations in multi-POV episodes.
 * Controls cuts, layouts, and camera effects.
 * 
 * CAMERA PRIMITIVES:
 * - pan: Move camera position
 * - pushIn: Zoom toward target
 * - pullOut: Zoom out for context
 * - follow: Soft tracking with lag
 * - snap: Instant framing
 * - hold: Intentional stillness
 * - reset: Return to neutral
 */

import { SceneOp, POVSwitchOp, SplitPOVOp, POVLayout, CameraZoomOp, CameraShakeOp, AnchorFocusOp, AnchorTrackOp } from "@tokovo/ir";

// =============================================================================
// OPTION TYPES
// =============================================================================

/**
 * Camera effect options.
 */
export interface ZoomOptions {
    originX?: number;  // 0-1, default 0.5
    originY?: number;  // 0-1, default 0.5
    duration?: string;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic";
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

export interface PanOptions {
    duration?: string;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic";
}

export interface PushInOptions {
    originX?: number;
    originY?: number;
    duration?: string;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic";
}

export interface FollowOptions {
    lag?: "high" | "medium" | "low";
    duration?: string;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic";
}

export interface HoldOptions {
    duration?: string;
}

export interface ResetOptions {
    duration?: string;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic";
}

/**
 * Camera operation that will be scheduled at a specific time.
 */
export interface CameraEvent {
    at: string;            // Duration expression (e.g., "3s")
    op: SceneOp;
}

// =============================================================================
// CAMERA BUILDER
// =============================================================================

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

    // =========================================================================
    // DEVICE / LAYOUT OPERATIONS
    // =========================================================================

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

    // =========================================================================
    // CAMERA PRIMITIVES
    // =========================================================================

    /**
     * Zoom in/out.
     */
    zoom(scale: number, options?: ZoomOptions): this {
        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale,
            duration: options?.duration,
            originX: options?.originX,
            originY: options?.originY,
            easing: options?.easing,
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * PAN - Move camera position without changing zoom.
     * 
     * @param dx - Horizontal translation in pixels
     * @param dy - Vertical translation in pixels
     * @param options - Pan options
     */
    pan(dx: number, dy: number, options?: PanOptions): this {
        // Pan is represented as a CameraZoom with translate
        const op = {
            kind: "CameraZoom" as const,
            scale: 1.0, // No zoom
            originX: 0.5 + (dx / 1000), // Approximate origin shift
            originY: 0.5 + (dy / 1000),
            duration: options?.duration,
            easing: options?.easing,
        };
        this.events.push({ at: this.currentTime, op: op as any });
        return this;
    }

    /**
     * PUSH IN - Zoom toward target.
     * 
     * @param intensity - Zoom intensity (0.01 = subtle, 0.2 = dramatic)
     * @param options - Push in options
     */
    pushIn(intensity: number = 0.1, options?: PushInOptions): this {
        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale: 1 + intensity,
            originX: options?.originX ?? 0.5,
            originY: options?.originY ?? 0.8, // Default toward bottom (messages)
            duration: options?.duration ?? "0.5s",
            easing: options?.easing ?? "ease-out",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * PULL OUT - Zoom out for context.
     * 
     * @param intensity - How much to pull out (0.05 = subtle, 0.2 = dramatic)
     * @param options - Pull out options
     */
    pullOut(intensity: number = 0.1, options?: ZoomOptions): this {
        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale: 1 - intensity,
            originX: options?.originX ?? 0.5,
            originY: options?.originY ?? 0.5,
            duration: options?.duration ?? "0.5s",
            easing: options?.easing ?? "ease-out",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * FOLLOW - Soft tracking with lag.
     * Camera follows target with delay for cinematic feel.
     * 
     * @param originX - Target X position (0-1)
     * @param originY - Target Y position (0-1)
     * @param options - Follow options
     */
    follow(originX: number, originY: number, options?: FollowOptions): this {
        // Follow is a slow zoom toward target
        const lagDuration = options?.lag === "high" ? "0.8s"
            : options?.lag === "low" ? "0.2s"
                : "0.5s";

        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale: 1.02, // Very subtle zoom
            originX,
            originY,
            duration: options?.duration ?? lagDuration,
            easing: options?.easing ?? "cinematic",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * SNAP - Instant or very fast framing.
     * 
     * @param originX - Target X position (0-1)
     * @param originY - Target Y position (0-1)
     */
    snap(originX: number, originY: number): this {
        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale: 1.05,
            originX,
            originY,
            duration: "0.1s",
            easing: "ease-out",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * HOLD - Intentional stillness.
     * No camera movement for specified duration.
     * 
     * @param duration - How long to hold (e.g., "1s")
     */
    hold(duration: string = "1s"): this {
        // Hold is a zoom at scale 1.0 (neutral)
        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale: 1.0,
            duration,
            easing: "linear",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * RESET - Return to neutral camera position.
     * 
     * @param options - Reset options
     */
    reset(options?: ResetOptions): this {
        const op: CameraZoomOp = {
            kind: "CameraZoom",
            scale: 1.0,
            originX: 0.5,
            originY: 0.5,
            duration: options?.duration ?? "0.6s",
            easing: options?.easing ?? "cinematic",
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * Shake effect on a device.
     */
    shake(deviceId: string, options?: ShakeOptions): this {
        const op: CameraShakeOp = {
            kind: "CameraShake",
            deviceId,
            intensity: options?.intensity,
            frequency: options?.frequency,
            decay: options?.decay,
            duration: options?.duration,
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    // =========================================================================
    // SEMANTIC CAMERA (ANCHORS)
    // =========================================================================

    /**
     * Focus on a semantic anchor (e.g., "lastMessage", "header").
     * One-shot movement to frame the target.
     */
    focus(anchor: string, options?: { preset?: string; duration?: string; easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic" }): this {
        const op: AnchorFocusOp = {
            kind: "AnchorFocus",
            anchor,
            preset: options?.preset,
            duration: options?.duration,
            easing: options?.easing,
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * Continuously track a semantic anchor.
     * Camera will follow the target as it moves/grows.
     */
    track(anchor: string, options?: { duration?: string; smoothing?: number; preset?: string; easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "cinematic" }): this {
        const op: AnchorTrackOp = {
            kind: "AnchorTrack",
            anchor,
            duration: options?.duration,
            smoothing: options?.smoothing,
            preset: options?.preset,
            easing: options?.easing,
        };
        this.events.push({ at: this.currentTime, op });
        return this;
    }

    /**
     * PUNCH GLIDE - Rapid push-in then smooth track.
     * Cinematic emphasis on a new element.
     */
    punchGlide(anchor: string, options?: { intensity?: number }): this {
        // This is a composite of PushIn + Track
        this.pushIn(options?.intensity ?? 0.05, { duration: "0.2s" });
        this.track(anchor, { duration: "2s", smoothing: 0.1 });
        return this;
    }

    // =========================================================================
    // COMPOSITE MOVES (Pre-built Sequences)
    // =========================================================================

    /**
     * MESSAGE ARRIVAL SHOT
     * hold → pan down → micro push
     */
    messageArrival(): this {
        // Add hold
        this.hold("0.1s");

        // TODO: Advance time properly - for now this is a simplified version
        // The full implementation would track internal time cursor

        // Add subtle push toward bottom
        this.pushIn(0.02, { originY: 0.85 });

        return this;
    }

    /**
     * TYPING ANTICIPATION
     * hold → subtle push → hold
     */
    typingAnticipation(): this {
        this.hold("0.2s");
        this.pushIn(0.015, { originY: 0.95, duration: "0.5s" });
        return this;
    }

    /**
     * ARGUMENT ESCALATION
     * fast follow → tighter zoom
     */
    escalation(): this {
        this.pushIn(0.08, { duration: "0.3s", easing: "ease-in-out" });
        return this;
    }

    /**
     * CALM RESET
     * Smooth return to neutral
     */
    calmReset(): this {
        this.reset({ duration: "0.8s", easing: "cinematic" });
        return this;
    }

    // =========================================================================
    // OUTPUT
    // =========================================================================

    /**
     * Get collected camera events.
     */
    getEvents(): CameraEvent[] {
        return this.events;
    }
}

