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

export const EVENT_KIND_PRIORITY: Record<string, number> = {
  DEVICE: 1,
  APP: 2,
  CAMERA: 3,
  AUDIO: 4,
  KEYBOARD: 5,
};

export function getEventKindPriority(kind: string): number {
  return EVENT_KIND_PRIORITY[kind] ?? 10;
}

export function getDeclarationOrder(
  event: TimelineEvent,
  fallback: number,
): number {
  const order = (event as { _declarationOrder?: number })._declarationOrder;
  if (typeof order === "number" && Number.isFinite(order)) {
    return order;
  }
  return fallback;
}

export function compareEvents(
  a: TimelineEvent,
  b: TimelineEvent,
  aIndex: number,
  bIndex: number,
): number {
  if (a.at !== b.at) {
    return a.at - b.at;
  }
  const priorityA = getEventKindPriority(a.kind as string);
  const priorityB = getEventKindPriority(b.kind as string);
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }
  const orderA = getDeclarationOrder(a, aIndex);
  const orderB = getDeclarationOrder(b, bIndex);
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return aIndex - bIndex;
}

export function createEventIndex(events: TimelineEvent[]): EventIndex {
  const byFrameEntries = new Map<
    number,
    Array<{ event: TimelineEvent; index: number }>
  >();
  let maxFrame = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const frameEvents = byFrameEntries.get(event.at) || [];
    frameEvents.push({ event, index: i });
    byFrameEntries.set(event.at, frameEvents);
    maxFrame = Math.max(maxFrame, event.at);
  }

  const byFrame = new Map<number, TimelineEvent[]>();
  for (const [frame, frameEvents] of byFrameEntries) {
    if (frameEvents.length > 1) {
      frameEvents.sort((a, b) =>
        compareEvents(a.event, b.event, a.index, b.index),
      );
    }
    byFrame.set(
      frame,
      frameEvents.map((entry) => entry.event),
    );
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
  const accumulated: TimelineEvent[] = [];

  for (const frame of base.frames) {
    const frameEvents = base.byFrame.get(frame);
    if (frameEvents) {
      accumulated.push(...frameEvents);
    }

    if (frame % keyframeInterval === 0 || frame === base.maxFrame) {
      keyframes.set(frame, accumulated.slice());
    }
  }

  return {
    ...base,
    keyframeInterval,
    keyframes,
  };
}

/**
 * Binary search for upper bound index in sorted array
 */
function binarySearchUpperBound(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (arr[mid] <= target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

export function getEventsUpTo(index: EventIndex, t: number): TimelineEvent[] {
  const cutoffIdx = binarySearchUpperBound(index.frames, t);
  const result: TimelineEvent[] = [];

  for (let i = 0; i < cutoffIdx; i++) {
    const events = index.byFrame.get(index.frames[i]);
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
  const startIdx = binarySearchUpperBound(index.frames, nearestKeyframe);
  const endIdx = binarySearchUpperBound(index.frames, t);

  for (let i = startIdx; i < endIdx; i++) {
    const frame = index.frames[i];
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
