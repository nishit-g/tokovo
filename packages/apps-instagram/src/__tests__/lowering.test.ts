import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import { instagramLowering } from "../lowering/index.js";

function lower(event: Record<string, unknown>, ctx: object = {}): RuntimeEvent[] {
  return instagramLowering.lower(event as never, ctx);
}

describe("instagram lowering", () => {
  it("emits device notifications for notification add", () => {
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
    });

    expect(events.some((event) => event.kind === "DEVICE" && event.type === "SHOW_NOTIFICATION")).toBe(true);
    expect(events.some((event) => event.kind === "APP" && event.type === "INSTAGRAM_ADD_NOTIFICATION")).toBe(true);
  });

  it("uses keyboard lowering for typed composer posts after compose navigation", () => {
    const ctx = {};
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
          caption: "typed caption",
          typed: true,
        },
      },
      ctx,
    );

    expect(events.some((event) => event.kind === "DEVICE")).toBe(true);
    expect(events.some((event) => event.kind === "APP" && event.type === "INSTAGRAM_ADD_POST")).toBe(true);
  });
});
