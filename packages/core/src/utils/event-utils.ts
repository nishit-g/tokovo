/**
 * Event Utilities - Performance optimizations for event processing
 *
 * These utilities help avoid O(n) filtering on every frame.
 */

import { TimelineEvent } from "../types.js";
import type { RuntimeEvent } from "../types/runtime-event.js";

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
  keyframes: Map<number, number>;
  sortedEvents: TimelineEvent[];
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
  const sortedEvents = events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => compareEvents(a.event, b.event, a.index, b.index))
    .map((entry) => entry.event);
  const keyframes = new Map<number, number>();
  let accumulatedCount = 0;

  for (const frame of base.frames) {
    const frameEvents = base.byFrame.get(frame);
    if (frameEvents) {
      accumulatedCount += frameEvents.length;
    }

    if (frame % keyframeInterval === 0 || frame === base.maxFrame) {
      keyframes.set(frame, accumulatedCount);
    }
  }

  return {
    ...base,
    keyframeInterval,
    keyframes,
    sortedEvents,
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

function binarySearchLowerBound(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

function collectEventsBetweenFrameIndexes(
  index: EventIndex,
  startIdx: number,
  endIdx: number,
): TimelineEvent[] {
  if (startIdx >= endIdx) {
    return [];
  }

  let totalEvents = 0;
  for (let i = startIdx; i < endIdx; i++) {
    const events = index.byFrame.get(index.frames[i]);
    if (events) {
      totalEvents += events.length;
    }
  }

  if (totalEvents === 0) {
    return [];
  }

  const result = new Array<TimelineEvent>(totalEvents);
  let writeIndex = 0;
  for (let i = startIdx; i < endIdx; i++) {
    const events = index.byFrame.get(index.frames[i]);
    if (!events) continue;
    for (let j = 0; j < events.length; j++) {
      result[writeIndex++] = events[j];
    }
  }

  return result;
}

export function getEventsUpTo(index: EventIndex, t: number): TimelineEvent[] {
  const cutoffIdx = binarySearchUpperBound(index.frames, t);
  return collectEventsBetweenFrameIndexes(index, 0, cutoffIdx);
}

export function getEventsUpToKeyframed(
  index: KeyframedEventIndex,
  t: number,
): TimelineEvent[] {
  const nearestKeyframe =
    Math.floor(t / index.keyframeInterval) * index.keyframeInterval;
  const cachedCount = index.keyframes.get(nearestKeyframe);

  if (!cachedCount) {
    return getEventsUpTo(index, t);
  }

  const baseEvents = index.sortedEvents.slice(0, cachedCount);
  if (t === nearestKeyframe) {
    return baseEvents;
  }

  const startIdx = binarySearchUpperBound(index.frames, nearestKeyframe);
  const endIdx = binarySearchUpperBound(index.frames, t);
  const additional = collectEventsBetweenFrameIndexes(index, startIdx, endIdx);

  if (additional.length === 0) {
    return baseEvents;
  }

  const merged = new Array<TimelineEvent>(baseEvents.length + additional.length);
  for (let i = 0; i < baseEvents.length; i++) {
    merged[i] = baseEvents[i];
  }
  for (let i = 0; i < additional.length; i++) {
    merged[baseEvents.length + i] = additional[i];
  }
  return merged;
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
  if (end < start) {
    return [];
  }
  const startIdx = binarySearchLowerBound(index.frames, start);
  const endIdx = binarySearchUpperBound(index.frames, end);
  return collectEventsBetweenFrameIndexes(index, startIdx, endIdx);
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
