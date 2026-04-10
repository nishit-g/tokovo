import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { createInstagramInitialState } from "../runtime/state.js";
import { InstagramView } from "../ui/index.js";

describe("instagram ui render", () => {
  it("renders feed chrome and post caption", () => {
    const world = {
      appState: {
        app_instagram: {
          ...createInstagramInitialState(),
          currentScreen: "home",
          users: [{ id: "u1", username: "mira", displayName: "Mira", followers: 0, following: 0, followerIds: [], followingIds: [], verified: false }],
          posts: [{ id: "p1", authorId: "u1", imageUrl: "/p1.png", caption: "golden hour", createdAt: 1, aspect: "portrait", likeCount: 10, commentCount: 0, commentIds: [], likedBy: [] }],
        },
      },
      devices: { phone: { id: "phone", keyboard: { visible: false } } },
      camera: DEFAULT_BASE_CAMERA_STATE,
      audio: DEFAULT_AUDIO_STATE,
    } as unknown as WorldState;

    const html = renderToStaticMarkup(
      React.createElement(InstagramView, { world, deviceId: "phone", t: 0 }),
    );

    expect(html).toContain("Instagram");
    expect(html).toContain("golden hour");
  });
});
