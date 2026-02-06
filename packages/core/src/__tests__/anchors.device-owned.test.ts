import { describe, expect, it } from "vitest";

import { createAnchorRegistry } from "../anchors/registry.js";
import { DeviceAnchorProvider } from "../anchors/device-provider.js";
import type { AnchorProvider } from "../types/anchor.js";

describe("device-owned anchors", () => {
  it("merges device anchors into app snapshots (device/app always present)", () => {
    const registry = createAnchorRegistry();
    registry.register(DeviceAnchorProvider);

    const fakeAppProvider: AnchorProvider = {
      appId: "app_fake",
      framing: {},
      getAnchors: () => ({
        anchors: {
          lastMessage: { x: 10, y: 10, width: 100, height: 50 },
        },
        deviceId: "phone",
        appId: "app_fake",
      }),
    };
    registry.register(fakeAppProvider);

    const world = {
      devices: {
        phone: {
          profileId: "iphone16",
          isLocked: false,
          notifications: [],
          keyboard: { visible: false },
        },
      },
      appState: {},
      camera: {},
      audio: {},
    } as any;

    const snapshot = registry.getAnchorsForApp("app_fake", world, {}, "phone", {
      getDeviceProfile: () => ({
        platform: "ios",
        dimensions: { width: 430, height: 932 },
        safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
      }),
    });

    expect(snapshot.anchors.device).toBeTruthy();
    expect(snapshot.anchors.app).toBeTruthy();
    expect(snapshot.anchors.lastMessage).toBeTruthy();
  });
});

