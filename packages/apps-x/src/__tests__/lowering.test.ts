import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import { xLowering } from "../lowering/index.js";

function lower(event: Record<string, unknown>, ctx: object = {}): RuntimeEvent[] {
  return xLowering.lower(event as any, ctx);
}

function appEvents(events: RuntimeEvent[], type: string): RuntimeEvent[] {
  return events.filter(
    (event) => event.kind === "APP" && event.appId === "app_x" && event.type === type,
  );
}

function appPayload(events: RuntimeEvent[], type: string): Record<string, unknown> | undefined {
  const event = appEvents(events, type)[0] as { payload?: Record<string, unknown> } | undefined;
  return event?.payload;
}

describe("X lowering", () => {
  it("does not auto-increment views on NAVIGATE with tweetId", () => {
    const events = lower({
      at: 20,
      kind: "APP",
      appId: "app_x",
      type: "NAVIGATE",
      deviceId: "device-1",
      payload: { screen: "tweet", tweetId: "tw-1" },
    });

    expect(appEvents(events, "SET_SCREEN")).toHaveLength(1);
    expect(appEvents(events, "SET_ACTIVE_TWEET")).toHaveLength(1);
    expect(appEvents(events, "VIEW_TWEET")).toHaveLength(0);
  });

  it("falls back to direct ADD_TWEET when typed create has no compose-open timing", () => {
    const events = lower({
      at: 30,
      kind: "APP",
      appId: "app_x",
      type: "TWEET_CREATE",
      deviceId: "device-1",
      payload: {
        id: "tw-1",
        authorId: "u1",
        text: "hello",
        typed: true,
      },
    });

    expect(appEvents(events, "ADD_TWEET")).toHaveLength(1);
    expect(events.some((event) => event.kind === "DEVICE")).toBe(false);
  });

  it("supports typed create/reply/quote after compose navigation", () => {
    const ctx = {};
    lower(
      {
        at: 10,
        kind: "APP",
        appId: "app_x",
        type: "NAVIGATE",
        deviceId: "device-1",
        payload: { screen: "compose" },
      },
      ctx,
    );

    const createEvents = lower(
      {
        at: 30,
        kind: "APP",
        appId: "app_x",
        type: "TWEET_CREATE",
        deviceId: "device-1",
        payload: {
          id: "tw-create",
          authorId: "u1",
          text: "create",
          typed: true,
        },
      },
      ctx,
    );

    const replyEvents = lower(
      {
        at: 60,
        kind: "APP",
        appId: "app_x",
        type: "TWEET_REPLY",
        deviceId: "device-1",
        payload: {
          id: "tw-reply",
          authorId: "u1",
          text: "reply",
          replyToId: "tw-create",
          typed: true,
        },
      },
      ctx,
    );

    const quoteEvents = lower(
      {
        at: 90,
        kind: "APP",
        appId: "app_x",
        type: "TWEET_QUOTE",
        deviceId: "device-1",
        payload: {
          id: "tw-quote",
          authorId: "u1",
          text: "quote",
          quoteTweetId: "tw-create",
          typed: true,
        },
      },
      ctx,
    );

    expect(createEvents.some((event) => event.kind === "DEVICE")).toBe(true);
    expect(replyEvents.some((event) => event.kind === "DEVICE")).toBe(true);
    expect(quoteEvents.some((event) => event.kind === "DEVICE")).toBe(true);

    expect((appPayload(replyEvents, "ADD_TWEET") as { replyToId?: string } | undefined)?.replyToId).toBe(
      "tw-create",
    );
    expect(
      (appPayload(quoteEvents, "ADD_TWEET") as { quoteTweetId?: string } | undefined)?.quoteTweetId,
    ).toBe("tw-create");
  });
});
