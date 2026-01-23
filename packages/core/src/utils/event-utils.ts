/**
 * Event Utilities - Performance optimizations for event processing
 *
 * These utilities help avoid O(n) filtering on every frame.
 */

import { TimelineEvent } from "../types";
import type { RuntimeEvent } from "../types/runtime-event";

// RuntimeEvent and TimelineEvent are compatible for event indexing
// They both have { at: number, kind: string, ... }
type _IndexableEvent = TimelineEvent | RuntimeEvent;

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
  byFrame: Map<number, TimelineEvent[]>;
  maxFrame: number;
  totalEvents: number;
  frames: number[];
}

export interface KeyframedEventIndex extends EventIndex {
  keyframeInterval: number;
  keyframes: Map<number, TimelineEvent[]>;
}

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

export function createKeyframedEventIndex(
  events: TimelineEvent[],
  keyframeInterval = 300,
): KeyframedEventIndex {
  const base = createEventIndex(events);
  const keyframes = new Map<number, TimelineEvent[]>();
  let accumulated: TimelineEvent[] = [];

  for (const frame of base.frames) {
    const frameEvents = base.byFrame.get(frame) || [];
    accumulated = [...accumulated, ...frameEvents];

    if (frame % keyframeInterval === 0 || frame === base.maxFrame) {
      keyframes.set(frame, [...accumulated]);
    }
  }

  return {
    ...base,
    keyframeInterval,
    keyframes,
  };
}

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

export function getEventsUpToKeyframed(
  index: KeyframedEventIndex,
  t: number,
): TimelineEvent[] {
  const nearestKeyframe =
    Math.floor(t / index.keyframeInterval) * index.keyframeInterval;
  const cached = index.keyframes.get(nearestKeyframe);

  if (!cached) {
    return getEventsUpTo(index, t);
  }

  if (t === nearestKeyframe) {
    return cached;
  }

  const additional: TimelineEvent[] = [];
  for (const frame of index.frames) {
    if (frame <= nearestKeyframe) continue;
    if (frame > t) break;
    const events = index.byFrame.get(frame);
    if (events) {
      additional.push(...events);
    }
  }

  return [...cached, ...additional];
}

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
export function getEventsInRange(
  index: EventIndex,
  start: number,
  end: number,
): TimelineEvent[] {
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
 * Filter events by kind (type-safe)
 */
export function filterEventsByKind<K extends TimelineEvent["kind"]>(
  events: TimelineEvent[],
  kind: K,
): Extract<TimelineEvent, { kind: K }>[] {
  return events.filter((e) => e.kind === kind) as Extract<
    TimelineEvent,
    { kind: K }
  >[];
}

interface EventWithAppId {
  appId?: string;
}

interface EventWithDeviceId {
  deviceId?: string;
}

/**
 * Filter events by app ID
 */
export function filterEventsForApp(
  events: TimelineEvent[],
  appId: string,
): TimelineEvent[] {
  return events.filter(
    (e) => e.kind === "APP" && (e as EventWithAppId).appId === appId,
  );
}

/**
 * Filter events by device ID
 */
export function filterEventsForDevice(
  events: TimelineEvent[],
  deviceId: string,
): TimelineEvent[] {
  return events.filter((e) => {
    const eventWithDevice = e as EventWithDeviceId;
    if (e.kind === "DEVICE") return eventWithDevice.deviceId === deviceId;
    if (e.kind === "CAMERA" || e.kind === "AUDIO") {
      const d = eventWithDevice.deviceId;
      return !d || d === deviceId;
    }
    return true;
  });
}
