import { describe, expect, it } from "vitest";
import type { TimelineEvent, WorldState } from "../types";
import {
  EventHandlerRegistry,
  registerEventHandler,
  defineEventHandler,
} from "../engine/event-handlers";

describe("EventHandlerRegistry", () => {
  it("registers handlers with priority order", () => {
    const calls: string[] = [];
    const unsubHigh = EventHandlerRegistry.register({
      kind: "TEST",
      priority: 10,
      handler: () => calls.push("high"),
    });
    const unsubLow = EventHandlerRegistry.register({
      kind: "TEST",
      priority: 1,
      handler: () => calls.push("low"),
    });

    const handled = EventHandlerRegistry.handle(
      {} as WorldState,
      { kind: "TEST" } as TimelineEvent,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );

    expect(handled).toBe(true);
    expect(calls).toEqual(["high", "low"]);

    unsubHigh();
    unsubLow();
    EventHandlerRegistry.clear();
  });

  it("continues after handler errors and supports unregister", () => {
    const calls: string[] = [];
    const unsub = EventHandlerRegistry.register({
      kind: "ERR",
      handler: () => {
        throw new Error("boom");
      },
    });
    EventHandlerRegistry.register({
      kind: "ERR",
      handler: () => calls.push("after"),
    });

    EventHandlerRegistry.handle(
      {} as WorldState,
      { kind: "ERR" } as TimelineEvent,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );

    expect(calls).toEqual(["after"]);
    unsub();
    EventHandlerRegistry.clear();
  });

  it("exposes handler metadata", () => {
    EventHandlerRegistry.register({
      kind: "META",
      handler: () => undefined,
    });

    expect(EventHandlerRegistry.hasHandler("META")).toBe(true);
    expect(EventHandlerRegistry.getRegisteredKinds()).toContain("META");

    EventHandlerRegistry.clear();
    expect(EventHandlerRegistry.hasHandler("META")).toBe(false);
  });

  it("supports registerMany and helpers", () => {
    const calls: string[] = [];
    const unsubscribe = EventHandlerRegistry.registerMany([
      defineEventHandler("MANY", () => calls.push("one")),
      defineEventHandler("MANY", () => calls.push("two"), { priority: 1 }),
    ]);

    registerEventHandler("MANY", () => calls.push("three"), 2);

    EventHandlerRegistry.handle(
      {} as WorldState,
      { kind: "MANY" } as TimelineEvent,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );

    expect(calls).toEqual(["three", "two", "one"]);

    unsubscribe();
    EventHandlerRegistry.clear();
  });

  it("returns false when no handlers are registered", () => {
    EventHandlerRegistry.clear();
    const handled = EventHandlerRegistry.handle(
      {} as any,
      { kind: "MISSING" } as any,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );
    expect(handled).toBe(false);
  });
});
