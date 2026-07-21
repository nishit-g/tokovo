import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import { instagramLowering } from "../lowering/index.js";

function createContext() {
  const intents: unknown[] = [];
  const interactions: unknown[] = [];
  return {
    intents,
    interactions,
    emitNotification: (intent: unknown) => intents.push(intent),
    emitNotificationInteraction: (interaction: unknown) => interactions.push(interaction),
  };
}

function lower(event: Record<string, unknown>, ctx = createContext()): RuntimeEvent[] {
  return instagramLowering.lower(event as never, ctx);
}

describe("instagram lowering", () => {
  it("emits semantic notifications for notification add", () => {
    const ctx = createContext();
    const events = lower({
      at: 20,
      kind: "APP",
      appId: "app_instagram",
      type: "NOTIFICATION_ADD",
      deviceId: "phone",
      payload: {
        id: "nt1",
        type: "dm",
        actorId: "u2",
      },
    }, ctx);

    expect(events.some((event) => event.kind === "DEVICE")).toBe(false);
    expect(events.some((event) => event.kind === "APP" && event.type === "INSTAGRAM_ADD_NOTIFICATION")).toBe(true);
    expect(ctx.intents).toEqual([
      expect.objectContaining({ id: "nt1", appId: "app_instagram", category: "message" }),
    ]);
  });

  it("keeps composer posts app-owned after compose navigation", () => {
    const ctx = createContext();
    lower(
      {
        at: 0,
        kind: "APP",
        appId: "app_instagram",
        type: "NAVIGATE",
        deviceId: "phone",
        payload: { screen: "composer" },
      },
      ctx,
    );

    const events = lower(
      {
        at: 40,
        kind: "APP",
        appId: "app_instagram",
        type: "POST_ADD",
        deviceId: "phone",
        payload: {
          id: "p1",
          authorId: "u1",
          imageUrl: "/post.png",
          caption: "caption",
        },
      },
      ctx,
    );

    expect(events.some((event) => event.kind === "DEVICE")).toBe(false);
    expect(events.some((event) => event.kind === "APP" && event.type === "INSTAGRAM_ADD_POST")).toBe(true);
  });
});
