import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WorldState } from "@tokovo/core";
import { createAppViewportFrame, DEFAULT_AUDIO_STATE } from "@tokovo/core";
import { TokovoProvider } from "@tokovo/react";
import { createInstagramInitialState } from "../runtime/state.js";
import { InstagramView } from "../ui/index.js";

describe("instagram ui render", () => {
  it("renders feed chrome and post caption", () => {
    const world = {
      appState: {
        app_instagram: {
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
      devices: { phone: { id: "phone", keyboard: { visible: false } } },
      audio: DEFAULT_AUDIO_STATE,
    } as unknown as WorldState;

    const appViewport = createAppViewportFrame({
      width: 393,
      height: 852,
      contentInsets: { top: 47, bottom: 34 },
    });
    const html = renderToStaticMarkup(
      React.createElement(TokovoProvider, {
        world,
        deviceId: "phone",
        appId: "app_instagram",
        t: 0,
        appViewport,
        children: React.createElement(InstagramView, {
          world,
          deviceId: "phone",
          t: 0,
          appViewport,
        }),
      }),
    );

    expect(html).toContain("Instagram");
    expect(html).toContain("golden hour");
  });
});
