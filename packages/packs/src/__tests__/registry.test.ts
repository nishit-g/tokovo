import { describe, expect, it } from "vitest";

import {
  ASSET_BUCKETS,
  createPackRegistry,
  defineAssetPack,
  defineDeviceKit,
  definePersonaPack,
  defineStyleKit,
} from "../index.js";
import {
  cozyChatStyleKit,
  creatorPhonesV1,
  nightNeonStyleKit,
  socialAssetsV1,
  startupChaosPersonaPack,
} from "../starter/index.js";

describe("@tokovo/packs", () => {
  it("normalizes asset buckets with deterministic empty defaults", () => {
    const pack = defineAssetPack({
      id: "assets",
      name: "Assets",
      assets: {
        media: {
          b: "/b.jpg",
          a: "/a.jpg",
        },
      },
    });

    expect(Object.keys(pack.assets.media)).toEqual(["a", "b"]);
    expect(Object.keys(pack.assets)).toEqual([...ASSET_BUCKETS]);
    expect(pack.assets.avatars).toEqual({});
    expect(Object.isFrozen(pack.assets)).toBe(true);
  });

  it("validates persona key/id alignment", () => {
    expect(() =>
      definePersonaPack({
        id: "personas",
        name: "Personas",
        personas: {
          founder: {
            id: "wrong-id",
            name: "Founder",
            handle: "@founder",
            bio: "bio",
            avatar: "/avatars/founder.png",
          },
        },
      }),
    ).toThrowError(/mismatched persona key/);
  });

  it("creates deterministic, sorted registry ids", () => {
    const one = definePersonaPack({
      id: "z-pack",
      name: "Z Pack",
      personas: {
        a: {
          id: "a",
          name: "A",
          handle: "@a",
          bio: "bio",
          avatar: "/avatars/a.png",
        },
      },
    });
    const two = definePersonaPack({
      id: "a-pack",
      name: "A Pack",
      personas: {
        b: {
          id: "b",
          name: "B",
          handle: "@b",
          bio: "bio",
          avatar: "/avatars/b.png",
        },
      },
    });

    const registry = createPackRegistry({
      personaPacks: [one, two],
    });

    expect(registry.listPersonaPackIds()).toEqual(["a-pack", "z-pack"]);
    expect(Object.isFrozen(registry)).toBe(true);
  });

  it("rejects duplicate registry ids", () => {
    const style = defineStyleKit({
      id: "dup",
      name: "Duplicate",
      appThemes: { app_x: "dark" },
    });

    expect(() =>
      createPackRegistry({
        styleKits: [style, style],
      }),
    ).toThrowError(/Duplicate style kit id/);
  });

  it("resolves personas and asset aliases from starter manifests", () => {
    const registry = createPackRegistry({
      personaPacks: [startupChaosPersonaPack],
      assetPacks: [socialAssetsV1],
      styleKits: [nightNeonStyleKit, cozyChatStyleKit],
      deviceKits: [creatorPhonesV1],
    });

    expect(registry.getPersona("startup-chaos", "founder")?.handle).toBe(
      "@arjunfounder",
    );
    expect(
      registry.resolveAsset("social-assets-v1", "media", "founder_whiteboard"),
    ).toBe("/media/founder-whiteboard.jpg");
    expect(registry.getStyleKit("night-neon")?.appThemes?.app_x).toBe("dark");
    expect(registry.getDeviceKit("creator-phones-v1")?.devices.main_phone.profile).toBe(
      "iphone_16_pro",
    );
  });

  it("normalizes installed apps deterministically in device kits", () => {
    const kit = defineDeviceKit({
      id: "devices",
      name: "Devices",
      devices: {
        main_phone: {
          profile: "iphone_16_pro",
          installedApps: ["app_x", "app_whatsapp", "app_x", "app_imessage"],
        },
      },
    });

    expect(kit.devices.main_phone.installedApps).toEqual([
      "app_imessage",
      "app_whatsapp",
      "app_x",
    ]);
  });
});
