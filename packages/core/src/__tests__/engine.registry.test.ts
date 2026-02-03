import { describe, expect, it, vi } from "vitest";
import type { TimelineEvent, WorldState } from "../types";
import { ReducerRegistry, createReducerRegistry } from "../engine/registry";
import { EngineLogger } from "../engine/logger";

describe("ReducerRegistry", () => {
  it("registers and retrieves device reducer", () => {
    const reducer = vi.fn((state) => state);
    ReducerRegistry.registerDeviceReducer(reducer);

    expect(ReducerRegistry.deviceReducer).toBe(reducer);
    ReducerRegistry.reset();
  });

  it("registers app reducer and warns on overwrite", () => {
    const warn = vi.spyOn(EngineLogger, "warn").mockImplementation(() => undefined);

    const reducer = vi.fn();
    const reducer2 = vi.fn();
    ReducerRegistry.registerAppReducer("app", reducer);
    ReducerRegistry.registerAppReducer("app", reducer2);

    expect(ReducerRegistry.getAppReducer("app")).toBe(reducer2);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
    ReducerRegistry.reset();
  });

  it("registers scoped app reducer with initial state", () => {
    ReducerRegistry.registerScopedAppReducer(
      "scoped",
      (state: { count: number }, event: TimelineEvent) => {
        if (event.kind === "APP") {
          state.count += 1;
        }
      },
      { count: 0 },
    );

    const reducer = ReducerRegistry.getAppReducer("scoped");
    const draft = {} as WorldState;
    reducer?.(draft, { kind: "APP" } as TimelineEvent);

    expect((draft.appState as { scoped: { count: number } }).scoped.count).toBe(
      1,
    );

    ReducerRegistry.reset();
  });

  it("registers feature reducers", () => {
    const feature = vi.fn();
    ReducerRegistry.registerFeatureReducer("FEATURE", feature);
    expect(ReducerRegistry.getFeatureReducer("FEATURE")).toBe(feature);
    ReducerRegistry.reset();
  });

  it("tracks event kinds and prevents duplicates", () => {
    ReducerRegistry.registerEventKinds("appA", ["KIND_A"]);
    ReducerRegistry.registerEventKinds("appA", ["KIND_A"]);

    expect(ReducerRegistry.isAppEventKind("KIND_A")).toBe(true);
    expect(ReducerRegistry.getAppIdForEventKind("KIND_A")).toBe("appA");

    expect(() => {
      ReducerRegistry.registerEventKinds("appB", ["KIND_A"]);
    }).toThrow();

    expect(ReducerRegistry.getEventKindsForApp("appA")).toEqual(["KIND_A"]);

    ReducerRegistry.unregisterEventKinds("appA");
    expect(ReducerRegistry.isAppEventKind("KIND_A")).toBe(false);

    ReducerRegistry.reset();
  });

  it("exposes app reducers and reset clears", () => {
    ReducerRegistry.registerAppReducer("app", vi.fn());
    expect(ReducerRegistry.hasAppReducer("app")).toBe(true);
    expect(ReducerRegistry.getRegisteredApps()).toContain("app");
    expect(ReducerRegistry.appReducers.app).toBeDefined();

    ReducerRegistry.unregisterAppReducer("app");
    expect(ReducerRegistry.hasAppReducer("app")).toBe(false);

    ReducerRegistry.reset();
  });

  it("creates isolated reducer registries", () => {
    const registry = createReducerRegistry();
    registry.registerAppReducer("app", vi.fn());
    expect(registry.hasAppReducer("app")).toBe(true);
    registry.reset();
    expect(registry.hasAppReducer("app")).toBe(false);
  });
});
