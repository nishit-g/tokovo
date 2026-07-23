import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import type { NotificationIntentIR } from "@tokovo/ir";
import { xLowering } from "../lowering/index.js";
import { BASE_TIME } from "./helpers.js";

function context(intents: NotificationIntentIR[] = []) {
  return {
    emitNotification: (intent: NotificationIntentIR) => intents.push(intent),
    emitNotificationInteraction: () => undefined,
  };
}

function lower(
  event: Record<string, unknown>,
  intents: NotificationIntentIR[] = [],
): RuntimeEvent[] {
  return xLowering.lower(event as never, context(intents));
}

function payload(
  events: RuntimeEvent[],
  type: string,
): Record<string, unknown> {
  const event = events.find(
    (candidate) => candidate.kind === "APP" && candidate.type === type,
  ) as { payload?: Record<string, unknown> } | undefined;
  if (!event?.payload) throw new Error(`Missing ${type}`);
  return event.payload;
}

describe("X VNext lowering", () => {
  it("lowers navigation as one canonical route event", () => {
    const events = lower({
      at: 20,
      kind: "APP",
      appId: "app_x",
      type: "NAVIGATE",
      deviceId: "phone",
      payload: { screen: "tweet", tweetId: "tw_1" },
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "APP", type: "SET_SCREEN" });
  });

  it("preserves explicit epoch milliseconds for posts", () => {
    const events = lower({
      at: 30,
      kind: "APP",
      appId: "app_x",
      type: "TWEET_CREATE",
      deviceId: "phone",
      payload: {
        id: "tw_2",
        authorId: "u_me",
        text: "hello",
        createdAt: BASE_TIME,
      },
    });
    expect(payload(events, "ADD_TWEET").createdAt).toBe(BASE_TIME);
  });

  it.each([
    ["TWEET_UNLIKE", "UNLIKE_TWEET", { tweetId: "tw_1", userId: "u_me" }],
    [
      "TWEET_UNBOOKMARK",
      "UNBOOKMARK_TWEET",
      { tweetId: "tw_1", userId: "u_me" },
    ],
    [
      "TWEET_POLL_VOTE",
      "VOTE_POLL",
      { tweetId: "tw_1", userId: "u_me", optionId: "a" },
    ],
    [
      "TWEET_MEDIA_PLAYBACK",
      "SET_MEDIA_PLAYBACK",
      { tweetId: "tw_1", state: "playing", progress: 0.5 },
    ],
    ["SET_COMPOSER_STATUS", "SET_COMPOSER_STATUS", { status: "sending" }],
    [
      "DM_SET_DELIVERY",
      "SET_DM_DELIVERY",
      { messageId: "msg_1", delivery: "sent" },
    ],
    [
      "DM_TYPING_START",
      "START_DM_TYPING",
      { threadId: "dm_1", userId: "u_other" },
    ],
    [
      "DM_TYPING_STOP",
      "STOP_DM_TYPING",
      { threadId: "dm_1", userId: "u_other" },
    ],
    [
      "DM_REACT",
      "ADD_DM_REACTION",
      { messageId: "msg_1", userId: "u_other", emoji: "🔥" },
    ],
    [
      "DM_UNREACT",
      "REMOVE_DM_REACTION",
      { messageId: "msg_1", userId: "u_other", emoji: "🔥" },
    ],
    [
      "SET_SCROLL",
      "SET_SCROLL",
      { surface: "tweet", targetId: "tw_1", offset: 120 },
    ],
  ])("lowers %s to %s", (authoredType, runtimeType, eventPayload) => {
    const events = lower({
      at: 30,
      kind: "APP",
      appId: "app_x",
      type: authoredType,
      deviceId: "phone",
      payload: eventPayload,
    });
    expect(events).toEqual([
      expect.objectContaining({ type: runtimeType, payload: eventPayload }),
    ]);
  });

  it("rejects missing or frame-like timestamps", () => {
    const base = {
      at: 30,
      kind: "APP",
      appId: "app_x",
      type: "TWEET_CREATE",
      deviceId: "phone",
    };
    expect(() =>
      lower({
        ...base,
        payload: { id: "tw_2", authorId: "u_me", text: "hello" },
      }),
    ).toThrow(/X_TRACK_PAYLOAD_INVALID/);
    expect(() =>
      lower({
        ...base,
        payload: { id: "tw_2", authorId: "u_me", text: "hello", createdAt: 30 },
      }),
    ).toThrow(/epoch milliseconds/);
  });

  it("rejects X events without a device instead of dropping them", () => {
    expect(() =>
      lower({
        at: 1,
        kind: "APP",
        appId: "app_x",
        type: "NAVIGATE",
        payload: { screen: "timeline" },
      }),
    ).toThrow(/X_EVENT_DEVICE_REQUIRED/);
  });

  it("emits one semantic notification intent and one app event", () => {
    const intents: NotificationIntentIR[] = [];
    const events = lower(
      {
        at: 40,
        kind: "APP",
        appId: "app_x",
        type: "NOTIFICATION_ADD",
        deviceId: "phone",
        payload: {
          id: "nt_1",
          type: "mention",
          actorId: "u_other",
          tweetId: "tw_1",
          createdAt: BASE_TIME,
          title: "Avery mentioned you",
          body: "Check the thread",
        },
      },
      intents,
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "ADD_NOTIFICATION" });
    expect(intents).toMatchObject([
      {
        id: "nt_1",
        deviceId: "phone",
        appId: "app_x",
        content: { title: "Avery mentioned you", body: "Check the thread" },
      },
    ]);
  });

  it("rejects unknown owned track types", () => {
    expect(() =>
      lower({
        at: 1,
        kind: "APP",
        appId: "app_x",
        type: "OLD_LEGACY_EVENT",
        deviceId: "phone",
        payload: {},
      }),
    ).toThrow(/X_TRACK_TYPE_UNSUPPORTED/);
  });
});
