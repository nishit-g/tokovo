/**
 * Touch Event Factories
 * 
 * Low-level event creators for gesture visualization.
 */

import { TimelineEvent } from "@tokovo/core";

/**
 * Touch event factories
 */
export const touch = {
    /**
     * Tap at coordinates (shows brief circle)
     */
    tap: (at: number, x: number, y: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "TOUCH",
        type: "TAP",
        deviceId,
        x,
        y,
    } as TimelineEvent),

    /**
     * Long press at coordinates
     */
    longPress: (at: number, x: number, y: number, duration: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "TOUCH",
        type: "LONG_PRESS",
        deviceId,
        x,
        y,
        duration,
    } as TimelineEvent),

    /**
     * Drag from start to end coordinates
     */
    drag: (at: number, startX: number, startY: number, endX: number, endY: number, duration: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "TOUCH",
        type: "DRAG",
        deviceId,
        startX,
        startY,
        endX,
        endY,
        duration,
    } as TimelineEvent),

    /**
     * Scroll vertically
     */
    scroll: (at: number, y: number, velocity?: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "TOUCH",
        type: "SCROLL",
        deviceId,
        y,
        velocity,
    } as TimelineEvent),
};
