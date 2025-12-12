/**
 * Event Utilities - Performance optimizations for event processing
 * 
 * These utilities help avoid O(n) filtering on every frame.
 */

import { TimelineEvent } from "./types";

// =============================================================================
// EVENT INDEXING
// =============================================================================

/**
 * EventIndex - Pre-processed event lookup for efficient frame-based access
 * 
 * Instead of filtering all events on every frame, events are indexed by
 * their `at` value for O(1) lookup per unique frame.
 */
export interface EventIndex {
    /** Events indexed by frame number */
    byFrame: Map<number, TimelineEvent[]>;

    /** Maximum frame number in the events */
    maxFrame: number;

    /** Total event count */
    totalEvents: number;

    /** Sorted unique frame numbers */
    frames: number[];
}

/**
 * Create an event index from a list of events
 * 
 * @param events - Array of timeline events
 * @returns Indexed events for efficient lookup
 */
export function createEventIndex(events: TimelineEvent[]): EventIndex {
    const byFrame = new Map<number, TimelineEvent[]>();
    let maxFrame = 0;

    for (const event of events) {
        const frameEvents = byFrame.get(event.at) || [];
        frameEvents.push(event);
        byFrame.set(event.at, frameEvents);
        maxFrame = Math.max(maxFrame, event.at);
    }

    const frames = Array.from(byFrame.keys()).sort((a, b) => a - b);

    return {
        byFrame,
        maxFrame,
        totalEvents: events.length,
        frames,
    };
}

/**
 * Get all events up to and including frame t
 * 
 * @param index - Pre-computed event index
 * @param t - Current frame number
 * @returns All events with `at <= t`
 */
export function getEventsUpTo(index: EventIndex, t: number): TimelineEvent[] {
    const result: TimelineEvent[] = [];

    for (const frame of index.frames) {
        if (frame > t) break;
        const events = index.byFrame.get(frame);
        if (events) {
            result.push(...events);
        }
    }

    return result;
}

/**
 * Get events that occur exactly at frame t
 * 
 * @param index - Pre-computed event index
 * @param t - Frame number to query
 * @returns Events at frame t (or empty array)
 */
export function getEventsAt(index: EventIndex, t: number): TimelineEvent[] {
    return index.byFrame.get(t) || [];
}

/**
 * Get events within a frame range (inclusive)
 * 
 * @param index - Pre-computed event index
 * @param start - Start frame
 * @param end - End frame
 * @returns Events where `start <= at <= end`
 */
export function getEventsInRange(index: EventIndex, start: number, end: number): TimelineEvent[] {
    const result: TimelineEvent[] = [];

    for (const frame of index.frames) {
        if (frame < start) continue;
        if (frame > end) break;
        const events = index.byFrame.get(frame);
        if (events) {
            result.push(...events);
        }
    }

    return result;
}

// =============================================================================
// EVENT FILTERING UTILITIES  
// =============================================================================

/**
 * Filter events by kind
 */
export function filterEventsByKind<K extends TimelineEvent["kind"]>(
    events: TimelineEvent[],
    kind: K
): Extract<TimelineEvent, { kind: K }>[] {
    return events.filter(e => e.kind === kind) as any;
}

/**
 * Filter events by app ID
 */
export function filterEventsForApp(events: TimelineEvent[], appId: string): TimelineEvent[] {
    return events.filter(e => e.kind === "APP" && (e as any).appId === appId);
}

/**
 * Filter events by device ID
 */
export function filterEventsForDevice(events: TimelineEvent[], deviceId: string): TimelineEvent[] {
    return events.filter(e => {
        if (e.kind === "DEVICE") return (e as any).deviceId === deviceId;
        if (e.kind === "CAMERA" || e.kind === "AUDIO") {
            const d = (e as any).deviceId;
            return !d || d === deviceId;
        }
        return true;
    });
}
