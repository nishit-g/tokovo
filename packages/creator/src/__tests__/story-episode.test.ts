import { describe, expect, it } from "vitest";
import {
  createPackRegistry,
  defineAssetPack,
  defineDeviceKit,
  definePersonaPack,
  defineStyleKit,
} from "@tokovo/packs";
import { storyEpisode, type ResolvedStoryKit } from "../index.js";

type Assert<T extends true> = T;
type IsExact<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

function assertTrackChainRetainsStoryBuilder(): ResolvedStoryKit {
  return storyEpisode("story-fluent-track", {
    fps: 30,
    duration: "1s",
  })
    .track(
      "custom_story_track",
      () => ({
        _events: [],
        at: () => undefined,
        span: () => undefined,
      }),
      () => {},
    )
    .kit();
}

type TrackChainKeepsStoryHelpers = Assert<
  IsExact<ReturnType<typeof assertTrackChainRetainsStoryBuilder>, ResolvedStoryKit>
>;

const personaPack = definePersonaPack({
  id: "test-personas",
  name: "Test Personas",
  personas: {
    builder: {
      id: "builder",
      name: "Kabir",
      handle: "@kabir",
      bio: "ships fast",
      avatar: "builder_avatar",
      defaultAppMetadata: {
        app_x: {
          verified: true,
          followerCount: 21400,
          followingCount: 540,
        },
      },
    },
    placeholder: {
      id: "placeholder",
      name: "Temp",
      handle: "@temp",
      bio: "placeholder",
      avatar: "placeholder_avatar",
    },
  },
});

const assetPack = defineAssetPack({
  id: "test-assets",
  name: "Test Assets",
  assets: {
    avatars: {
      builder_avatar: "/avatars/builder.png",
      placeholder_avatar: "/placeholders/avatar.png",
    },
    wallpapers: {
      warm: "/wallpapers/warm.png",
      neon: "/wallpapers/neon.png",
    },
    backgrounds: {
      bg1: "/backgrounds/bg1.jpg",
    },
  },
});

const styleKit = defineStyleKit({
  id: "test-style",
  name: "Test Style",
  background: "ambient-night",
  deviceDefaults: {
    ios_style: {
      profile: "iphone16",
      wallpaper: "wallpapers:neon",
      screenRecording: true,
    },
  },
  appThemes: {
    app_x: "pack-theme",
  },
});

const deviceKit = defineDeviceKit({
  id: "test-devices",
  name: "Test Devices",
  devices: {
    main_phone: {
      profile: "iphone15",
      styleRef: "ios_style",
      installedApps: ["app_x"],
      wallpaper: "wallpapers:warm",
    },
  },
});

const registry = createPackRegistry({
  personaPacks: [personaPack],
  assetPacks: [assetPack],
  styleKits: [styleKit],
  deviceKits: [deviceKit],
});

describe("storyEpisode", () => {
  it("resolves precedence and compiles into current DSL device/background fields", () => {
    const ep = storyEpisode("story-precedence", {
      fps: 30,
      duration: "5s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
        styles: "test-style",
        devices: "test-devices",
      })
      .cast({
        me: {
          persona: "builder",
          device: "main_phone",
          styleOverrides: {
            appThemes: {
              app_x: "cast-theme",
            },
          },
        },
      })
      .device("main_phone", {
        app: "app_x",
        styleOverrides: {
          appThemes: {
            app_x: "episode-theme",
          },
        },
        wallpaper: "warm",
      });

    const kit = ep.kit();
    expect(kit.actor("me").avatar).toBe("/avatars/builder.png");
    expect(ep.device("main_phone").theme).toBe("episode-theme");
    expect(ep.device("main_phone").profile).toBe("iphone16");
    expect(ep.device("main_phone").homeScreen?.wallpaper).toBe("/wallpapers/warm.png");

    const ir = ep.build();
    const main = ir.devices.find((d) => d.id === "main_phone");
    expect(main?.profile).toBe("iphone16");
    expect(main?.theme).toBe("episode-theme");
    expect(main?.homeScreen?.wallpaper).toBe("/wallpapers/warm.png");
    expect(ir.background).toBe("ambient-night");
  });

  it("keeps explicit episode background above style-kit defaults", () => {
    const ep = storyEpisode("story-bg", {
      fps: 30,
      duration: "3s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
        styles: "test-style",
        devices: "test-devices",
      })
      .cast({
        me: { persona: "builder", device: "main_phone" },
      })
      .device("main_phone", { app: "app_x" })
      .background("ambient-mesh");

    const ir = ep.build();
    expect(ir.background).toBe("ambient-mesh");
  });

  it("does not auto-materialize story-kit devices when explicit DSL devices exist", () => {
    const ep = storyEpisode("story-manual-device-wins", {
      fps: 30,
      duration: "3s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
        styles: "test-style",
        devices: "test-devices",
      })
      .cast({
        me: { persona: "builder", device: "main_phone" },
      })
      .device("main_phone", { app: "app_x" })
      .device("phone", "iphone16", {
        app: "app_x",
        theme: "manual-theme",
      });

    const ir = ep.build();
    expect(ir.devices).toHaveLength(1);
    expect(ir.devices[0]).toMatchObject({
      id: "phone",
      profile: "iphone16",
      app: "app_x",
      theme: "manual-theme",
    });
  });

  it("fails on missing persona ids and unknown style app refs", () => {
    const badStyleRegistry = createPackRegistry({
      personaPacks: [personaPack],
      assetPacks: [assetPack],
      styleKits: [
        defineStyleKit({
          id: "bad-style",
          name: "Bad Style",
          appThemes: {
            app_unknown: "broken",
          },
        }),
      ],
      deviceKits: [deviceKit],
    });

    const missingPersona = storyEpisode("story-missing-persona", {
      fps: 30,
      duration: "2s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
      })
      .cast({
        me: { persona: "does-not-exist" },
      });

    expect(() => missingPersona.kit()).toThrow(/unknown persona/i);

    const badStyle = storyEpisode("story-bad-style", {
      fps: 30,
      duration: "2s",
    })
      .usePacks({
        registry: badStyleRegistry,
        personas: "test-personas",
        styles: "bad-style",
      })
      .cast({
        me: { persona: "builder" },
      });

    expect(() => badStyle.kit()).toThrow(/unknown style app ref/i);
  });

  it("emits creator-side lint warnings", () => {
    const ep = storyEpisode("story-lint", {
      fps: 30,
      duration: "2s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
      })
      .cast({
        me: {
          persona: "placeholder",
          overrides: {
            name: "Temp2",
            handle: "@temp2",
            bio: "bio2",
            voice: "v1",
            traits: ["x"],
          },
          appOverrides: {
            app_x: { verified: true },
          },
        },
      });

    const warnings = ep.lint({
      rawUsers: [{ handle: "@temp2" }],
    });
    expect(warnings.some((w) => /placeholder-like avatar/i.test(w))).toBe(true);
    expect(warnings.some((w) => /many inline overrides/i.test(w))).toBe(true);
    expect(warnings.some((w) => /Raw user object overlaps cast role/i.test(w))).toBe(
      true,
    );
  });

  it("projects X users from actor identity plus pack metadata", () => {
    const kit = storyEpisode("story-project-x", {
      fps: 30,
      duration: "2s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
      })
      .cast({
        me: { persona: "builder" },
      })
      .kit();

    expect(kit.project.xUser("me")).toEqual({
      id: "builder",
      name: "Kabir",
      handle: "@kabir",
      bio: "ships fast",
      avatarUrl: "/avatars/builder.png",
      followers: 21400,
      following: 540,
      verified: "blue",
    });

    expect(
      kit.project.xUser("me", {
        verified: "gold",
        followers: 999,
      }),
    ).toMatchObject({
      verified: "gold",
      followers: 999,
    });
  });

  it("projects WhatsApp conversations and reusable device configs", () => {
    const kit = storyEpisode("story-project-wa", {
      fps: 30,
      duration: "2s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
        styles: "test-style",
        devices: "test-devices",
      })
      .cast({
        me: { persona: "builder", device: "main_phone" },
        friend: { persona: "placeholder", device: "main_phone" },
      })
      .device("main_phone", { app: "app_whatsapp" })
      .kit();

    expect(
      kit.project.whatsappConversation({
        id: "chat_1",
        name: "Launch Room",
        type: "group",
        participantRoles: ["me", "friend"],
        avatarRole: "friend",
        unreadCount: 4,
      }),
    ).toEqual({
      id: "chat_1",
      name: "Launch Room",
      type: "group",
      participants: ["Kabir", "Temp"],
      avatar: "/placeholders/avatar.png",
      unreadCount: 4,
    });

    expect(
      kit.project.device("main_phone", {
        app: "app_whatsapp",
        conversations: [
          kit.project.whatsappConversation({
            id: "chat_1",
            name: "Launch Room",
            participantRoles: ["me", "friend"],
            avatarAsset: "builder_avatar",
          }),
        ],
      }),
    ).toEqual({
      profile: "iphone16",
      options: {
        app: "app_whatsapp",
        conversations: [
          {
            id: "chat_1",
            name: "Launch Room",
            participants: ["Kabir", "Temp"],
            avatar: "/avatars/builder.png",
          },
        ],
        os: undefined,
        theme: undefined,
        locked: undefined,
        installedApps: ["app_x"],
        homeScreen: {
          wallpaper: "/wallpapers/neon.png",
        },
        screenRecording: true,
      },
    });
  });

  it("projects LinkedIn users and generic conversation helpers", () => {
    const kit = storyEpisode("story-project-expanded", {
      fps: 30,
      duration: "4s",
    })
      .usePacks({
        registry,
        personas: "test-personas",
        assets: "test-assets",
        styles: "test-style",
        devices: "test-devices",
      })
      .cast({
        me: {
          persona: "builder",
          device: "main_phone",
          appOverrides: {
            app_linkedin: {
              headline: "Builder in public",
              connections: 880,
            },
          },
        },
        friend: { persona: "placeholder", device: "main_phone" },
      })
      .device("main_phone", { app: "app_linkedin" })
      .kit();

    expect(kit.project.linkedinUser("me")).toEqual({
      id: "builder",
      name: "Kabir",
      handle: "@kabir",
      headline: "Builder in public",
      avatarUrl: "/avatars/builder.png",
      connections: 880,
      followers: undefined,
    });

    expect(
      kit.project.imessageConversation({
        id: "imessage-1",
        name: "Build Thread",
        participantRoles: ["me", "friend"],
        avatarRole: "friend",
      }),
    ).toEqual({
      id: "imessage-1",
      name: "Build Thread",
      participants: ["Kabir", "Temp"],
      avatar: "/placeholders/avatar.png",
    });

    expect(
      kit.project.snapchatConversation({
        id: "snap-1",
        name: "Snap Ops",
        participants: ["Kabir", "Temp"],
        avatarAsset: "builder_avatar",
      }),
    ).toEqual({
      id: "snap-1",
      name: "Snap Ops",
      participants: ["Kabir", "Temp"],
      avatar: "/avatars/builder.png",
    });
  });
});
