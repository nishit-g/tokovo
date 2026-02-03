import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../types";
import {
  createEventIndex,
  createKeyframedEventIndex,
  getEventsUpTo,
  getEventsUpToKeyframed,
  getEventsAt,
  getEventsInRange,
  filterEventsByKind,
  filterEventsForApp,
  filterEventsForDevice,
} from "../utils/event-utils";

describe("event utils", () => {
  const events: TimelineEvent[] = [
    { at: 0, kind: "DEVICE", deviceId: "phone", type: "LOCK" } as any,
    { at: 5, kind: "APP", appId: "chat", type: "MESSAGE" } as any,
    { at: 5, kind: "AUDIO", deviceId: "phone", type: "PLAY" } as any,
    { at: 6, kind: "AUDIO", type: "PLAY" } as any,
    { at: 7, kind: "CAMERA", deviceId: "tablet", type: "PAN" } as any,
  ];

  it("indexes and retrieves events by frame", () => {
    const index = createEventIndex(events);
    expect(index.totalEvents).toBe(events.length);
    expect(index.frames).toEqual([0, 5, 6, 7]);

    expect(getEventsAt(index, 5)).toHaveLength(2);
    expect(getEventsAt(index, 99)).toEqual([]);
    expect(getEventsUpTo(index, 5)).toHaveLength(3);
    expect(getEventsInRange(index, 5, 6)).toHaveLength(3);
  });

  it("handles keyframed indexing with cached and fallback paths", () => {
    const keyframed = createKeyframedEventIndex(events, 5);
    expect(keyframed.keyframes.has(5)).toBe(true);

    const exact = getEventsUpToKeyframed(keyframed, 5);
    expect(exact).toHaveLength(3);

    const withAdditional = getEventsUpToKeyframed(keyframed, 6);
    expect(withAdditional).toHaveLength(4);

    const sparseEvents: TimelineEvent[] = [
      { at: 3, kind: "APP", appId: "chat" } as any,
      { at: 7, kind: "DEVICE", deviceId: "phone" } as any,
    ];
    const sparse = createKeyframedEventIndex(sparseEvents, 5);
    expect(getEventsUpToKeyframed(sparse, 4)).toHaveLength(1);
  });

  it("filters events by kind, app, and device", () => {
    expect(filterEventsByKind(events, "APP")).toHaveLength(1);
    expect(filterEventsForApp(events, "chat")).toHaveLength(1);

    const deviceFiltered = filterEventsForDevice(events, "phone");
    expect(deviceFiltered).toHaveLength(4);
    const tabletFiltered = filterEventsForDevice(events, "tablet");
    expect(tabletFiltered).toHaveLength(3);
  });

  it("orders same-frame events using kind priority and declaration order", () => {
    const sameFrame: TimelineEvent[] = [
      { at: 0, kind: "AUDIO", type: "PLAY", _declarationOrder: 2 } as any,
      { at: 0, kind: "DEVICE", type: "LOCK", _declarationOrder: 3 } as any,
      { at: 0, kind: "APP", appId: "app", type: "OPEN", _declarationOrder: 1 } as any,
    ];

    const index = createEventIndex(sameFrame);
    const ordered = getEventsAt(index, 0);
    expect(ordered[0].kind).toBe("DEVICE");
    expect(ordered[1].kind).toBe("APP");
    expect(ordered[2].kind).toBe("AUDIO");
  });
});
