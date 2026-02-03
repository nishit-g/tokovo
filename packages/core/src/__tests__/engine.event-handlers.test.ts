import { describe, expect, it } from "vitest";
import type { TimelineEvent, WorldState } from "../types";
import {
  createEventHandlerRegistry,
  registerEventHandler,
  defineEventHandler,
} from "../engine/event-handlers";

describe("EventHandlerRegistry", () => {
  it("registers handlers with priority order", () => {
    const registry = createEventHandlerRegistry();
    const calls: string[] = [];
    const unsubHigh = registry.register({
      kind: "TEST",
      priority: 10,
      handler: () => calls.push("high"),
    });
    const unsubLow = registry.register({
      kind: "TEST",
      priority: 1,
      handler: () => calls.push("low"),
    });

    const handled = registry.handle(
      {} as WorldState,
      { kind: "TEST" } as TimelineEvent,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );

    expect(handled).toBe(true);
    expect(calls).toEqual(["high", "low"]);

    unsubHigh();
    unsubLow();
    registry.clear();
  });

  it("propagates handler errors and supports unregister", () => {
    const registry = createEventHandlerRegistry();
    const calls: string[] = [];
    const unsub = registry.register({
      kind: "ERR",
      handler: () => {
        throw new Error("boom");
      },
    });
    registry.register({
      kind: "ERR",
      handler: () => calls.push("after"),
    });

    expect(() =>
      registry.handle(
        {} as WorldState,
        { kind: "ERR" } as TimelineEvent,
        { frame: 0, eventIndex: 0, mode: "preview" },
      ),
    ).toThrow("boom");

    expect(calls).toEqual([]);
    unsub();
    registry.clear();
  });

  it("exposes handler metadata", () => {
    const registry = createEventHandlerRegistry();
    registry.register({
      kind: "META",
      handler: () => undefined,
    });

    expect(registry.hasHandler("META")).toBe(true);
    expect(registry.getRegisteredKinds()).toContain("META");

    registry.clear();
    expect(registry.hasHandler("META")).toBe(false);
  });

  it("supports registerMany and helpers", () => {
    const registry = createEventHandlerRegistry();
    const calls: string[] = [];
    const unsubscribe = registry.registerMany([
      defineEventHandler("MANY", () => calls.push("one")),
      defineEventHandler("MANY", () => calls.push("two"), { priority: 1 }),
    ]);

    registerEventHandler(registry, "MANY", () => calls.push("three"), 2);

    registry.handle(
      {} as WorldState,
      { kind: "MANY" } as TimelineEvent,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );

    expect(calls).toEqual(["three", "two", "one"]);

    unsubscribe();
    registry.clear();
  });

  it("returns false when no handlers are registered", () => {
    const registry = createEventHandlerRegistry();
    registry.clear();
    const handled = registry.handle(
      {} as any,
      { kind: "MISSING" } as any,
      { frame: 0, eventIndex: 0, mode: "preview" },
    );
    expect(handled).toBe(false);
  });
});
