/**
 * Touch Event Factories
 * 
 * Low-level event creators for gesture visualization.
 */

import { TimelineEvent } from "@tokovo/core";
import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

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
        trace: createTrace(Tracer.capture()),
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
        trace: createTrace(Tracer.capture()),
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
        trace: createTrace(Tracer.capture()),
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
        trace: createTrace(Tracer.capture()),
        deviceId,
        y,
        velocity,
    } as TimelineEvent),
};
