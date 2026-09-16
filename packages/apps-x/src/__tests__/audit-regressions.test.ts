import { describe, expect, it } from "vitest";
import { createAppViewportFrame } from "@tokovo/core";
import { xNotificationAdapter } from "../notifications/adapter.js";
import { xLowering } from "../lowering/index.js";
import { requireXState, selectProfileTweets } from "../runtime/selectors.js";
import { projectXMotion } from "../runtime/motion.js";
import { xPostBudget } from "../presentation/text.js";
import {
  measureXPost,
  measureXMessage,
  measureXNotification,
  measureXProfile,
  xComposerHeight,
} from "../layout/measure.js";
import { projectXThread } from "../layout/project.js";
import { computeXFeedLayout, computeXChatLayout } from "../layout/index.js";
import { xTextTokens } from "../layout/tokens.js";
import { resolveXExperience } from "../experience/resolver.js";
import {
  BASE_TIME,
  appEvent,
  createTestState,
  createTestWorld,
  reduce,
  testTweet,
} from "./helpers.js";

const experience = resolveXExperience({
  platform: "ios",
  appearance: "light",
  locale: "en-US",
  reducedMotion: false,
  increasedContrast: false,
  textScale: 1,
});
const notice = {
  id: "n1",
  type: "mention" as const,
  actorId: "u_other",
  tweetId: "tw_1",
  createdAt: BASE_TIME,
  read: false,
};
function context(state = createTestState()) {
  return {
    world: createTestWorld(state),
    t: 60,
    activeDeviceId: "phone",
    activeAppId: "app_x",
    platform: "ios" as const,
    viewKind: "FEED" as const,
    viewportWidth: 393,
    viewportHeight: 852,
    appViewport: createAppViewportFrame({
      width: 393,
      height: 852,
      interactiveInsets: { top: 47, bottom: 34 },
    }),
  };
}

describe("X audit regressions", () => {
  it("replays social notification destinations and only reads the selected activity", () => {
    const state = createTestState();
    state.notificationsById = { n1: notice, n2: { ...notice, id: "n2" } };
    state.notificationIds = ["n1", "n2"];
    const action = xNotificationAdapter.defaultAction?.({
      id: "n1",
      deviceId: "phone",
      appId: "app_x",
      deliverAtFrame: 0,
      category: "social",
      threadId: "tweet:tw_1",
      metadata: { kind: "mention", tweetId: "tw_1" },
      content: { title: "X", body: "Mention" },
    });
    const event = action?.appEvent;
    if (!event) throw new Error("Missing notification app event");
    const result = requireXState(
      reduce(createTestWorld(state), appEvent(event.type, event.payload)),
      "phone",
    );
    expect(result.route).toEqual({ screen: "tweet", tweetId: "tw_1" });
    expect(result.notificationsById.n1.read).toBe(true);
    expect(result.notificationsById.n2.read).toBe(false);
    const follow = xNotificationAdapter.defaultAction?.({
      id: "follow",
      deviceId: "phone",
      appId: "app_x",
      deliverAtFrame: 0,
      category: "social",
      threadId: "user:u_other",
      metadata: { kind: "follow", actorId: "u_other" },
      content: { title: "X", body: "Follow" },
    });
    expect(follow?.appEvent?.payload).toMatchObject({ screen: "profile", userId: "u_other" });
  });

  it.each(["background", "locked"])(
    "preserves unread DMs when the remembered route is %s",
    (mode) => {
      const state = createTestState();
      state.route = { screen: "thread", threadId: "dm_1" };
      const world = createTestWorld(state);
      if (mode === "background") world.devices.phone.foregroundAppId = "app_whatsapp";
      else world.devices.phone.isLocked = true;
      const result = reduce(
        world,
        appEvent("ADD_DM_MESSAGE_INCOMING", {
          id: "m2",
          threadId: "dm_1",
          senderId: "u_other",
          text: "Hello",
          createdAt: BASE_TIME,
        }),
      );
      expect(requireXState(result, "phone").dmThreadsById.dm_1.unreadCount).toBe(1);
    },
  );

  it("does not mark a notifications tab read and supports explicit acknowledgement", () => {
    const state = createTestState();
    state.notificationsById.n1 = notice;
    state.notificationIds = ["n1"];
    const world = reduce(
      createTestWorld(state),
      appEvent("SET_SCREEN", { screen: "notifications" }),
    );
    expect(requireXState(world, "phone").notificationsById.n1.read).toBe(false);
    expect(
      requireXState(reduce(world, appEvent("MARK_NOTIFICATION_READ", { id: "n1" })), "phone")
        .notificationsById.n1.read,
    ).toBe(true);
    const interactions: unknown[] = [];
    xLowering.lower(
      {
        kind: "APP",
        appId: "app_x",
        deviceId: "phone",
        at: 30,
        type: "MARK_NOTIFICATION_READ",
        payload: { id: "n1", badgeCount: 7 },
      } as never,
      {
        emitNotification: () => undefined,
        emitNotificationInteraction: (value) => interactions.push(value),
      },
    );
    expect(interactions[0]).toMatchObject({
      type: "markRead",
      badgeCount: 7,
      readTarget: { type: "MARK_NOTIFICATION_READ", payload: { id: "n1" } },
    });
  });

  it("measures glyph widths, scale, complete detail text, and combined attachments", () => {
    expect(measureXMessage("WWWWWWWW", 393).bubbleWidth).toBeGreaterThan(
      measureXMessage("iiiiiiii", 393).bubbleWidth,
    );
    const tweet = testTweet("long", {
      text: "A long readable sentence. ".repeat(60),
      quoteTweetId: "tw_1",
      media: {
        type: "image",
        urls: ["/media/launch-board.svg"],
        aspect: "wide",
        sensitive: false,
        playback: null,
      },
    });
    const feed = measureXPost(tweet, 393);
    const detail = measureXPost(tweet, 393, true);
    expect(feed.contentWidth).toBe(309);
    expect(feed.truncated).toBe(true);
    expect(detail.bodyLines).toBeGreaterThan(12);
    expect(detail.truncated).toBe(false);
    expect(feed.attachmentHeight).toBe(feed.primaryAttachmentHeight + feed.quoteHeight + 10);
    expect(measureXPost(tweet, 393, true, xTextTokens(1.5)).totalHeight).toBeGreaterThan(
      detail.totalHeight,
    );
    expect(xComposerHeight("line\n".repeat(8), 393)).toBeGreaterThan(xComposerHeight("Hi", 393));
  });

  it("rejects a vote at the authored expiry boundary", () => {
    const state = createTestState();
    state.tweetsById.tw_1.poll = {
      endsAt: BASE_TIME,
      totalVotes: 0,
      selectedOptionId: null,
      options: [
        { id: "a", label: "A", votes: 0 },
        { id: "b", label: "B", votes: 0 },
      ],
    };
    expect(() =>
      reduce(
        createTestWorld(state),
        appEvent("VOTE_POLL", { tweetId: "tw_1", userId: "u_me", optionId: "a" }),
      ),
    ).toThrow(/X_POLL_ENDED/);
  });

  it("uses X URL, NFC, CJK and joined-emoji character weights", () => {
    expect(xPostBudget("https://example.com/a/very/long/path").remaining).toBe(257);
    expect(xPostBudget("👨‍👩‍👧‍👦").remaining).toBe(278);
    expect(xPostBudget("🧑‍🚀🙂‍↔️").remaining).toBe(276);
    expect(xPostBudget("©").remaining).toBe(279);
    expect(xPostBudget("©️1️⃣").remaining).toBe(276);
    expect(xPostBudget("https://example.com/🧑‍🚀").remaining).toBe(255);
    expect(xPostBudget("https://example.com/%F0%9F%A7%91").remaining).toBe(257);
    expect(xPostBudget("你好").remaining).toBe(276);
    expect(xPostBudget("cafe\u0301")).toEqual(xPostBudget("café"));
    expect(xPostBudget("x".repeat(281)).valid).toBe(false);
    expect(xPostBudget("x".repeat(281), 25000).valid).toBe(true);
  });

  it("includes liked posts by other authors and measures profile/notification content", () => {
    const state = createTestState();
    state.profileTab = "likes";
    state.tweetsById.tw_1.likedBy = ["u_me"];
    expect(selectProfileTweets(createTestWorld(state), "phone", "u_me").map((t) => t.id)).toEqual([
      "tw_1",
    ]);
    const short = measureXProfile(state.usersById.u_me, 393);
    const long = measureXProfile(
      { ...state.usersById.u_me, bio: "A longer bio. ".repeat(18) },
      393,
    );
    expect(long.height).toBeGreaterThan(short.height);
    const activity = measureXNotification(
      { ...notice, title: "Ava mentioned you", body: "The clean cut is winning." },
      state,
      393,
      experience,
    );
    expect(activity.lines.join(" ")).toBe("Ava mentioned you");
    expect(activity.previewLines.join(" ")).toBe("The clean cut is winning.");
    expect(
      measureXNotification(
        { ...notice, body: "Long activity body. ".repeat(20) },
        state,
        393,
        experience,
      ).height,
    ).toBeGreaterThan(116);
  });

  it("mirrors semantic rectangles without destroying offscreen coordinates", () => {
    const state = createTestState();
    const ltr = computeXFeedLayout(context(state)).semantic?.regions["x.post.tw_1.body"]?.rect;
    state.locale = "ar-SA";
    const rtl = computeXFeedLayout(context(state)).semantic?.regions["x.post.tw_1.body"]?.rect;
    expect(rtl?.x).toBe(393 - (ltr?.x ?? 0) - (ltr?.width ?? 0));
    state.scroll.timeline = 180;
    expect(
      computeXFeedLayout(context(state)).semantic?.regions["x.post.tw_1"]?.rect.y,
    ).toBeLessThan(0);
  });

  it("reserves typing/composer room and replays interrupted scrolling deterministically", () => {
    const state = createTestState();
    state.route = { screen: "thread", threadId: "dm_1" };
    state.threadDrafts.dm_1 = "line\n".repeat(6);
    state.dmThreadsById.dm_1.typingUserIds = ["u_other"];
    const layout = computeXChatLayout({
      ...context(state),
      viewKind: "CHAT",
      activeConversationId: "dm_1",
    });
    expect(layout.semantic?.regions["x.thread.composer"]?.rect.height).toBe(
      xComposerHeight(state.threadDrafts.dm_1, 393),
    );
    let world = reduce(createTestWorld(), {
      ...appEvent("SET_SCROLL", { surface: "timeline", offset: 300, durationFrames: 12 }),
      at: 10,
    });
    const middle = projectXMotion(requireXState(world, "phone"), 16).scroll.timeline;
    expect(middle).toBeGreaterThan(0);
    expect(middle).toBeLessThan(300);
    world = reduce(world, {
      ...appEvent("SET_SCROLL", { surface: "timeline", offset: 50, durationFrames: 12 }),
      at: 16,
    });
    expect(projectXMotion(requireXState(world, "phone"), 16).scroll.timeline).toBe(middle);
    expect(projectXMotion(requireXState(world, "phone"), 16, true).scroll.timeline).toBe(50);
  });

  it("settles arrivals using frame-derived geometry and respects reduced motion", () => {
    const state = createTestState();
    state.dmMessagesById.msg_1.arrivedAtFrame = 10;
    const input = {
      state,
      threadId: "dm_1",
      messages: [state.dmMessagesById.msg_1],
      width: 393,
      viewportHeight: 600,
    };
    expect(projectXThread({ ...input, frame: 10 }).contentHeight).toBeLessThan(
      projectXThread({ ...input, frame: 16 }).contentHeight,
    );
    expect(projectXThread({ ...input, frame: 10, reducedMotion: true }).contentHeight).toBe(
      projectXThread({ ...input, frame: 30 }).contentHeight,
    );
  });
});
