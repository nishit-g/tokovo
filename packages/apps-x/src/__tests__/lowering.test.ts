import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import type { NotificationIntentIR } from "@tokovo/ir";
import { xLowering } from "../lowering/index.js";

function createContext(intents: NotificationIntentIR[] = []) {
  return {
    emitNotification: (intent: NotificationIntentIR) => intents.push(intent),
    emitNotificationInteraction: () => undefined,
  };
}

function lower(event: Record<string, unknown>, ctx = createContext()): RuntimeEvent[] {
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

  it("lowers creates directly to ADD_TWEET", () => {
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
      },
    });

    expect(appEvents(events, "ADD_TWEET")).toHaveLength(1);
    expect(events.some((event) => event.kind === "DEVICE")).toBe(false);
  });

  it("preserves create, reply, and quote semantics after compose navigation", () => {
    const ctx = createContext();
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
        },
      },
      ctx,
    );

    expect(createEvents.some((event) => event.kind === "DEVICE")).toBe(false);
    expect(replyEvents.some((event) => event.kind === "DEVICE")).toBe(false);
    expect(quoteEvents.some((event) => event.kind === "DEVICE")).toBe(false);

    expect((appPayload(replyEvents, "ADD_TWEET") as { replyToId?: string } | undefined)?.replyToId).toBe(
      "tw-create",
    );
    expect(
      (appPayload(quoteEvents, "ADD_TWEET") as { quoteTweetId?: string } | undefined)?.quoteTweetId,
    ).toBe("tw-create");
  });

  it("preserves replies after opening tweet detail", () => {
    const ctx = createContext();
    lower(
      {
        at: 10,
        kind: "APP",
        appId: "app_x",
        type: "NAVIGATE",
        deviceId: "device-1",
        payload: { screen: "tweet", tweetId: "tw-1" },
      },
      ctx,
    );

    const events = lower(
      {
        at: 30,
        kind: "APP",
        appId: "app_x",
        type: "TWEET_REPLY",
        deviceId: "device-1",
        payload: {
          id: "tw-2",
          authorId: "u1",
          text: "reply",
          replyToId: "tw-1",
        },
      },
      ctx,
    );

    expect(events.some((event) => event.kind === "DEVICE")).toBe(false);
    expect((appPayload(events, "ADD_TWEET") as { replyToId?: string } | undefined)?.replyToId).toBe(
      "tw-1",
    );
  });

  it("lowers app activity and emits one semantic notification intent", () => {
    const intents: NotificationIntentIR[] = [];
    const events = lower({
      at: 40,
      kind: "APP",
      appId: "app_x",
      type: "NOTIFICATION_ADD",
      deviceId: "device-1",
      payload: {
        id: "nt-1",
        type: "mention",
        actorId: "u2",
        tweetId: "tw-1",
        title: "Avery mentioned you",
        body: "Check the thread",
      },
    }, createContext(intents));

    expect(appEvents(events, "ADD_NOTIFICATION")).toHaveLength(1);
    expect(events.some((event) => event.kind === "DEVICE")).toBe(false);
    expect(intents).toMatchObject([
      {
        id: "nt-1",
        deviceId: "device-1",
        appId: "app_x",
        content: {
          title: "Avery mentioned you",
          body: "Check the thread",
        },
      },
    ]);
  });
});
