import { describe, expect, it, vi } from "vitest";
import { createReducerRegistry } from "../engine/registry.js";

describe("ReducerRegistry", () => {
  it("registers and retrieves device reducer", () => {
    const registry = createReducerRegistry();
    const reducer = vi.fn((state) => state);
    registry.registerDeviceReducer(reducer);

    expect(registry.deviceReducer).toBe(reducer);
    registry.reset();
  });

  it("rejects duplicate app reducers", () => {
    const registry = createReducerRegistry();

    const reducer = vi.fn();
    const reducer2 = vi.fn();
    registry.registerAppReducer("app", reducer);
    expect(() => registry.registerAppReducer("app", reducer2)).toThrow(
      'App reducer "app" is already registered',
    );

    expect(registry.getAppReducer("app")).toBe(reducer);
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
    expect(registry.getAppReducer("app")).toBeDefined();

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
