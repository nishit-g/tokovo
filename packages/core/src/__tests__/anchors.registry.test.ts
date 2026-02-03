import { describe, expect, it } from "vitest";
import type { WorldState } from "../types";
import {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  hasAnchorProvider,
  getRegisteredAppIds,
  getProviderCount,
  getAnchorsForApp,
  getAnchorFraming,
  clearAnchors,
  resolveAnchor,
  hasAnchor,
  DEFAULT_FRAMING,
} from "../anchors/registry";
import type { AnchorProvider } from "../types/anchor";

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
    expect(getAnchorsForApp("missing", {}, {}, "device")).toBeDefined();

    registerAnchorProvider(provider);
    expect(hasAnchorProvider("app_test")).toBe(true);
    expect(getAnchorProvider("app_test")).toBe(provider);
    expect(getRegisteredAppIds()).toEqual(["app_test"]);
    expect(getProviderCount()).toBe(1);

    const snapshot = getAnchorsForApp("app_test", {}, {}, "device");
    expect(snapshot.anchors?.["app_test:header"]).toBeDefined();

    const framing = getAnchorFraming("app_test", "app_test:header");
    expect(framing.padding).toBe(10);

    const noProviderFraming = getAnchorFraming("missing", "header");
    expect(noProviderFraming).toEqual(DEFAULT_FRAMING);

    const missingFraming = getAnchorFraming("app_test", "missing");
    expect(missingFraming).toEqual(DEFAULT_FRAMING);

    const world = {
      devices: {
        phone: { id: "phone" },
      },
    } as WorldState;

    expect(resolveAnchor("app_test:header", world, "phone")).toEqual({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });

    expect(resolveAnchor("app_test:missing", world, "phone")).toBeNull();
    expect(resolveAnchor("app_missing:header", world, "phone")).toBeNull();
    expect(resolveAnchor("unknown:header", world, "phone")).toBeNull();
    expect(resolveAnchor("app_test:header", world, "missing")).toBeNull();

    expect(hasAnchor("app_test:header")).toBe(true);
    expect(hasAnchor("header")).toBe(false);

    unregisterAnchorProvider("app_test");
    expect(hasAnchorProvider("app_test")).toBe(false);

    clearAnchors();
    expect(getProviderCount()).toBe(0);
  });
});
