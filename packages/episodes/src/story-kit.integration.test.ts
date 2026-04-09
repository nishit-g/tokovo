import { describe, expect, it } from "vitest";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { XPlugin } from "@tokovo/apps-x";
import {
  applyStudioStoryKitConfig,
  cozyChat,
  creatorPhonesV1,
  nightNeon,
  socialAssetsV1,
  startupChaos,
  storyEpisode,
} from "./story-kit/index.js";
import { megaXStoryKitConfig } from "./production/mega-x.story-kit.js";

describe("story-kit integration in episodes", () => {
  it("builds a WhatsApp flow with persona + style + device kit", () => {
    const ep = storyEpisode("story-kit-whatsapp-it", {
      fps: 30,
      duration: "8s",
      title: "Story Kit WhatsApp IT",
    })
      .usePacks({
        personas: startupChaos,
        assets: socialAssetsV1,
        styles: cozyChat,
        devices: creatorPhonesV1,
      })
      .cast({
        me: { persona: "builder", device: "main_phone" },
        friend: { persona: "founder", device: "main_phone" },
      })
      .device("main_phone", {
        app: "app_whatsapp",
        styleOverrides: { appThemes: { app_whatsapp: "whatsapp-ghibli" } },
      });

    const kit = ep.kit();
    const ir = ep
      .background(kit.background ?? "ambient-night")
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        theme: kit.device("main_phone").theme ?? kit.style("app_whatsapp").theme,
        conversations: [
          {
            id: "chat_1",
            name: "Ops",
            participants: [kit.actor("me").name, kit.actor("friend").name],
            avatar: kit.actor("friend").avatar,
          },
        ],
      })
      .whatsapp("phone", "chat_1", (wa) => {
        wa.switchTo("chat_1", "0s");
        wa.at("1s").receive(kit.actor("friend").name, "Build is red.");
      })
      .build();

    const plugins = [WhatsAppPlugin] as Parameters<typeof prepareTrackEpisode>[1];
    const compiled = prepareTrackEpisode(ir, plugins, {
      log: false,
      validate: true,
    });
    expect(compiled.events.length).toBeGreaterThan(0);
    expect(ir.devices[0]?.theme).toBe("whatsapp-ghibli");
  });

  it("builds an X flow using persona + style + asset aliases", () => {
    const ep = storyEpisode("story-kit-x-it", {
      fps: 30,
      duration: "9s",
      title: "Story Kit X IT",
    })
      .usePacks({
        personas: startupChaos,
        assets: socialAssetsV1,
        styles: nightNeon,
        devices: creatorPhonesV1,
      })
      .cast({
        me: { persona: "builder", device: "main_phone" },
        vc: { persona: "investor", device: "secondary_phone" },
      })
      .device("main_phone", {
        app: "app_x",
        styleOverrides: { appThemes: { app_x: "dark" } },
      })
      .device("secondary_phone", {
        app: "app_x",
      });

    const kit = ep.kit();
    const ir = ep
      .background(kit.background ?? "ambient-night")
      .device("phone", "iphone16", {
        app: "app_x",
        theme: kit.style("app_x").theme,
      })
      .x("phone", (x) => {
        x.seed({
          currentUserId: kit.actor("me").personaId,
          users: [
            {
              id: kit.actor("me").personaId,
              name: kit.actor("me").name,
              handle: kit.actor("me").handle,
              bio: kit.actor("me").bio,
              avatarUrl: kit.actor("me").avatar,
              followers: 2000,
              following: 200,
            },
            {
              id: kit.actor("vc").personaId,
              name: kit.actor("vc").name,
              handle: kit.actor("vc").handle,
              bio: kit.actor("vc").bio,
              avatarUrl: kit.actor("vc").avatar,
              followers: 5000,
              following: 80,
            },
          ],
          tweets: [
            {
              id: "tw1",
              authorId: kit.actor("me").personaId,
              text: "Alias media should resolve cleanly.",
              media: {
                type: "image",
                urls: [kit.asset("founder_whiteboard")],
              },
            },
          ],
          screen: "timeline",
        }, "0.8s");
      })
      .build();

    const plugins = [XPlugin] as Parameters<typeof prepareTrackEpisode>[1];
    const compiled = prepareTrackEpisode(ir, plugins, {
      log: false,
      validate: true,
    });
    expect(compiled.events.length).toBeGreaterThan(0);
    expect(kit.asset("founder_whiteboard")).toBe("/media/founder-whiteboard.jpg");
  });

  it("supports shared cast on one physical device in crossover flow", () => {
    const ep = storyEpisode("story-kit-crossover-it", {
      fps: 30,
      duration: "10s",
      title: "Story Kit Crossover IT",
    })
      .usePacks({
        personas: startupChaos,
        assets: socialAssetsV1,
        styles: nightNeon,
        devices: creatorPhonesV1,
      })
      .cast({
        me: { persona: "builder", device: "main_phone" },
        founder: { persona: "founder", device: "main_phone" },
      })
      .device("main_phone", {
        app: "app_whatsapp",
      });

    const kit = ep.kit();
    expect(kit.actor("me").deviceId).toBe("main_phone");
    expect(kit.actor("founder").deviceId).toBe("main_phone");

    const ir = ep
      .device("phone", "iphone16", {
        app: "app_whatsapp",
      })
      .whatsapp("phone", "chat_1", (wa) => {
        wa.switchTo("chat_1", "0s");
        wa.at("1s").receive(kit.actor("founder").name, "Push to X too.");
      })
      .x("phone", (x) => {
        x.seed({
          currentUserId: kit.actor("me").personaId,
          users: [
            {
              id: kit.actor("me").personaId,
              name: kit.actor("me").name,
              handle: kit.actor("me").handle,
              bio: kit.actor("me").bio,
              avatarUrl: kit.actor("me").avatar,
              followers: 1,
              following: 1,
            },
          ],
          tweets: [],
          screen: "timeline",
        }, "4s");
      })
      .build();

    const plugins = [WhatsAppPlugin, XPlugin] as Parameters<
      typeof prepareTrackEpisode
    >[1];
    const compiled = prepareTrackEpisode(ir, plugins, {
      log: false,
      validate: true,
    });
    expect(compiled.events.length).toBeGreaterThan(0);
  });

  it("supports the Studio sidecar pattern for canonical episodes", () => {
    const ep = applyStudioStoryKitConfig(
      storyEpisode("story-kit-sidecar-it", {
        fps: 30,
        duration: "6s",
        title: "Story Kit Sidecar IT",
      }),
      megaXStoryKitConfig,
    );

    const kit = ep.kit();
    const ir = ep
      .device("phone", "iphone16", {
        app: "app_x",
        theme: kit.style("app_x").theme,
      })
      .x("phone", (x) => {
        x.seed({
          currentUserId: kit.actor("me").personaId,
          users: [kit.project.xUser("me"), kit.project.xUser("founder")],
          tweets: [],
          screen: "timeline",
        }, "0s");
      })
      .build();

    const compiled = prepareTrackEpisode(ir, [XPlugin] as Parameters<
      typeof prepareTrackEpisode
    >[1], {
      log: false,
      validate: true,
    });
    expect(compiled.events.length).toBeGreaterThan(0);
    expect(kit.device("main_phone").app).toBe("app_x");
  });

  it("fails fast for missing persona aliases", () => {
    const ep = storyEpisode("story-kit-missing-persona-it", {
      fps: 30,
      duration: "4s",
      title: "Missing Persona",
    })
      .usePacks({
        personas: startupChaos,
        assets: socialAssetsV1,
        styles: nightNeon,
        devices: creatorPhonesV1,
      })
      .cast({
        me: { persona: "does_not_exist" },
      });

    expect(() => ep.kit()).toThrow(/unknown persona/i);
  });
});
