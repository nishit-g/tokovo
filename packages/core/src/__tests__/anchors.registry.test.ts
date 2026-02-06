import { describe, expect, it } from "vitest";
import type { WorldState } from "../types.js";
import {
  createAnchorRegistry,
  DEFAULT_FRAMING,
} from "../anchors/registry.js";
import type { AnchorProvider } from "../types/anchor.js";

const provider: AnchorProvider = {
  appId: "app_test",
  framing: {
    header: { padding: 10, mode: "tight" },
  },
  getAnchors: (_world, _layout, _deviceId) => ({
    anchors: {
      "app_test:header": { x: 1, y: 2, width: 3, height: 4 },
    },
  }),
};

describe("Anchor registry", () => {
  it("registers, resolves, and clears providers", () => {
    const registry = createAnchorRegistry();
    expect(
      registry.getAnchorsForApp("missing", {} as WorldState, {}, "device"),
    ).toBeDefined();

    registry.register(provider);
    expect(registry.has("app_test")).toBe(true);
    expect(registry.get("app_test")).toBe(provider);
    expect(registry.getRegisteredApps()).toEqual(["app_test"]);
    expect(registry.getProviderCount()).toBe(1);

    const snapshot = registry.getAnchorsForApp(
      "app_test",
      {} as WorldState,
      {},
      "device",
    );
    expect(snapshot.anchors?.["app_test:header"]).toBeDefined();

    const framing = registry.getFraming("app_test", "app_test:header");
    expect(framing.padding).toBe(10);

    const noProviderFraming = registry.getFraming("missing", "header");
    expect(noProviderFraming).toEqual(DEFAULT_FRAMING);

    const missingFraming = registry.getFraming("app_test", "missing");
    expect(missingFraming).toEqual(DEFAULT_FRAMING);

    const world = {
      devices: {
        phone: { id: "phone" },
      },
    } as WorldState;

    expect(registry.resolveAnchor("app_test:header", world, "phone")).toEqual({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });

    expect(registry.resolveAnchor("app_test:missing", world, "phone")).toBeNull();
    expect(registry.resolveAnchor("app_missing:header", world, "phone")).toBeNull();
    expect(registry.resolveAnchor("unknown:header", world, "phone")).toBeNull();
    expect(registry.resolveAnchor("app_test:header", world, "missing")).toBeNull();

    expect(registry.hasAnchor("app_test:header")).toBe(true);
    expect(registry.hasAnchor("header")).toBe(false);

    registry.unregister("app_test");
    expect(registry.has("app_test")).toBe(false);

    registry.clear();
    expect(registry.getProviderCount()).toBe(0);
  });
});
