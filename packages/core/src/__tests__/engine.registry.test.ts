import { describe, expect, it, vi } from "vitest";
import type { TimelineEvent, WorldState } from "../types.js";
import { createReducerRegistry } from "../engine/registry.js";
import { createLogger, LogCollector, setLogger } from "../logger/index.js";

describe("ReducerRegistry", () => {
  it("registers and retrieves device reducer", () => {
    const registry = createReducerRegistry();
    const reducer = vi.fn((state) => state);
    registry.registerDeviceReducer(reducer);

    expect(registry.deviceReducer).toBe(reducer);
    registry.reset();
  });

  it("registers app reducer and warns on overwrite", () => {
    const collector = new LogCollector();
    const logger = createLogger({ consoleOutput: false });
    logger.addSink(collector);
    setLogger(logger);
    const registry = createReducerRegistry();

    const reducer = vi.fn();
    const reducer2 = vi.fn();
    registry.registerAppReducer("app", reducer);
    registry.registerAppReducer("app", reducer2);

    expect(registry.getAppReducer("app")).toBe(reducer2);
    expect(
      collector.peek().some((entry) => entry.event === "engine.warn"),
    ).toBe(true);
    registry.reset();
  });

  it("registers scoped app reducer with initial state", () => {
    const registry = createReducerRegistry();
    registry.registerScopedAppReducer(
      "scoped",
      (state: { count: number }, event: TimelineEvent) => {
        if (event.kind === "APP") {
          state.count += 1;
        }
      },
      () => ({ count: 0 }),
    );

    const reducer = registry.getAppReducer("scoped");
    const draft = {} as WorldState;
    reducer?.(draft, { kind: "APP" } as TimelineEvent);

    expect((draft.appState as { scoped: { count: number } }).scoped.count).toBe(
      1,
    );

    registry.reset();
  });

  it("registers feature reducers", () => {
    const registry = createReducerRegistry();
    const feature = vi.fn();
    registry.registerFeatureReducer("FEATURE", feature);
    expect(registry.getFeatureReducer("FEATURE")).toBe(feature);
    registry.reset();
  });

  it("tracks event kinds and prevents duplicates", () => {
    const registry = createReducerRegistry();
    registry.registerEventKinds("appA", ["KIND_A"]);
    registry.registerEventKinds("appA", ["KIND_A"]);

    expect(registry.isAppEventKind("KIND_A")).toBe(true);
    expect(registry.getAppIdForEventKind("KIND_A")).toBe("appA");

    expect(() => {
      registry.registerEventKinds("appB", ["KIND_A"]);
    }).toThrow();

    expect(registry.getEventKindsForApp("appA")).toEqual(["KIND_A"]);

    registry.unregisterEventKinds("appA");
    expect(registry.isAppEventKind("KIND_A")).toBe(false);

    registry.reset();
  });

  it("exposes app reducers and reset clears", () => {
    const registry = createReducerRegistry();
    registry.registerAppReducer("app", vi.fn());
    expect(registry.hasAppReducer("app")).toBe(true);
    expect(registry.getRegisteredApps()).toContain("app");
    expect(registry.appReducers.app).toBeDefined();

    registry.unregisterAppReducer("app");
    expect(registry.hasAppReducer("app")).toBe(false);

    registry.reset();
  });

  it("creates isolated reducer registries", () => {
    const registry = createReducerRegistry();
    registry.registerAppReducer("app", vi.fn());
    expect(registry.hasAppReducer("app")).toBe(true);
    registry.reset();
    expect(registry.hasAppReducer("app")).toBe(false);
  });
});
