import { describe, expect, it } from "vitest";
import { createAppViewportFrame, type LayoutContext, type ViewKind, type WorldState } from "@tokovo/core";
import { XCinematicSubjects } from "../camera/subjects.js";
import { xLayoutStrategies } from "../layout/index.js";
import { measureXMessage, measureXPost } from "../layout/measure.js";
import type { XState } from "../runtime/state.js";
import { BASE_TIME, createTestState, createTestWorld } from "./helpers.js";

function context(world: WorldState, viewKind: ViewKind): LayoutContext {
  return {
    world,
    t: 60,
    activeDeviceId: "phone",
    activeAppId: "app_x",
    activeConversationId: viewKind === "CHAT" ? "dm_1" : undefined,
    platform: "ios",
    viewKind,
    viewportWidth: 393,
    viewportHeight: 852,
    appViewport: createAppViewportFrame({
      width: 393,
      height: 852,
      interactiveInsets: { top: 47, bottom: 34 },
    }),
  };
}

function layoutFor(state: XState, viewKind: ViewKind) {
  const world = createTestWorld(state);
  const strategy = xLayoutStrategies.find((candidate) => candidate.viewKind === viewKind);
  if (!strategy) throw new Error(`Missing ${viewKind} layout`);
  const layout = strategy.computeLayout(context(world, viewKind));
  return { layout, world };
}

describe("X VNext canonical layout and cinematic subjects", () => {
  it("projects exact entity regions for a visible timeline post", () => {
    const state = createTestState();
    state.tweetsById.tw_1.media = {
      type: "image",
      urls: ["/media/x-test.jpg"],
      aspect: "wide",
      sensitive: false,
      playback: null,
    };
    const { layout, world } = layoutFor(state, "FEED");
    const measurement = measureXPost(state.tweetsById.tw_1, 393);
    const post = layout.semantic?.regions["x.post.tw_1"];
    expect(post?.rect.height).toBe(measurement.totalHeight);
    expect(layout.semantic?.regions["x.post.tw_1.media"]).toBeDefined();
    const projected = XCinematicSubjects.project(world, layout, "phone");
    expect(projected).toContainEqual(expect.objectContaining({
      ref: expect.objectContaining({
        kind: "entity",
        entityType: "tweet",
        entityId: "tw_1",
        region: "media",
      }),
      rect: layout.semantic?.regions["x.post.tw_1.media"].rect,
      sourceVersion: 2,
    }));
  });

  it("does not emit removed singleton geometry", () => {
    const { layout } = layoutFor(createTestState(), "FEED");
    expect(layout.semantic?.regions.tweet_card).toBeUndefined();
    expect(layout.semantic?.regions.dm_message_latest).toBeUndefined();
    expect(layout.semantic?.regions["x.timeline.feed"]).toBeDefined();
  });

  it("publishes notification and DM thread entity rows", () => {
    const notifications = createTestState();
    notifications.route = { screen: "notifications" };
    notifications.notificationsById.nt_1 = {
      id: "nt_1",
      type: "mention",
      actorId: "u_other",
      tweetId: "tw_1",
      createdAt: BASE_TIME,
      read: false,
    };
    notifications.notificationIds = ["nt_1"];
    expect(layoutFor(notifications, "FEED").layout.semantic?.regions["x.notification.nt_1"]).toBeDefined();

    const messages = createTestState();
    messages.route = { screen: "messages" };
    expect(layoutFor(messages, "FEED").layout.semantic?.regions["x.dm.dm_1"]).toBeDefined();
  });

  it("matches thread message measurement and entity projection", () => {
    const state = createTestState();
    state.route = { screen: "thread", threadId: "dm_1" };
    state.viewMode = "CHAT";
    state.conversationId = "dm_1";
    const { layout, world } = layoutFor(state, "CHAT");
    const expected = measureXMessage(state.dmMessagesById.msg_1.text, 393);
    expect((layout as any).messageLayouts.msg_1.height).toBe(expected.height);
    expect(layout.semantic?.regions["x.dm.dm_1.message.msg_1"]).toBeDefined();
    expect(XCinematicSubjects.project(world, layout, "phone")).toContainEqual(
      expect.objectContaining({
        ref: expect.objectContaining({ kind: "entity", entityType: "message", entityId: "msg_1", region: "bubble" }),
      }),
    );
  });

  it("publishes compose regions only from fullscreen layout", () => {
    const state = createTestState();
    state.route = { screen: "compose" };
    state.viewMode = "FULLSCREEN";
    const { layout } = layoutFor(state, "FULLSCREEN");
    expect(layout.semantic?.regions["x.composer.editor"]).toBeDefined();
    expect(layout.semantic?.regions["x.composer.actions"]).toBeDefined();
  });
});
