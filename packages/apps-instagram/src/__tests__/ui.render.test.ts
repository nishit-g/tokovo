import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WorldState } from "@tokovo/core";
import { createAppViewportFrame, createDefaultAudioState, resolvePlatformVisuals } from "@tokovo/core";
import { TokovoProvider } from "@tokovo/react";
import { createInstagramInitialState } from "../runtime/state.js";
import { InstagramView } from "../ui/index.js";

describe("instagram ui render", () => {
  it("renders feed chrome and post caption", () => {
    const world = {
      appInstances: {
        "phone:app_instagram": {
          ...createInstagramInitialState(),
          currentScreen: "home",
          users: [
            {
              id: "u1",
              username: "mira",
              displayName: "Mira",
              followers: 0,
              following: 0,
              followerIds: [],
              followingIds: [],
              verified: false,
            },
          ],
          posts: [
            {
              id: "p1",
              authorId: "u1",
              imageUrl: "/p1.png",
              caption: "golden hour",
              createdAt: 1,
              aspect: "portrait",
              likeCount: 10,
              commentCount: 0,
              commentIds: [],
              likedBy: [],
            },
          ],
        },
      },
      capabilityState: {},
      devices: { phone: { id: "phone", keyboard: { visible: false } } },
      audio: createDefaultAudioState(),
    } as unknown as WorldState;

    const appViewport = createAppViewportFrame({
      width: 393,
      height: 852,
      interactiveInsets: { top: 47, bottom: 34 },
    });
    const platformVisuals = resolvePlatformVisuals({
      platformProfileId: "ios:liquid-glass@1",
      appearance: "light",
      locale: "en-US",
      direction: "ltr",
      textScale: 1,
      contrast: "standard",
      motion: "full",
      transparency: "standard",
      materialPreference: "automatic",
    });
    const html = renderToStaticMarkup(
      React.createElement(TokovoProvider, {
        world,
        deviceId: "phone",
        appId: "app_instagram",
        t: 0,
        fps: 30,
        platform: "ios",
        appViewport,
        platformVisuals,
        children: React.createElement(InstagramView, {
          world,
          deviceId: "phone",
          t: 0,
          platform: "ios",
          width: 393,
          height: 852,
          appViewport,
        }),
      }),
    );

    expect(html).toContain("Instagram");
    expect(html).toContain("golden hour");
  });
});
