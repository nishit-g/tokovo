import { describe, expect, it } from "vitest";
import { createAppViewportFrame, type WorldState } from "@tokovo/core";
import { computeChatLayout } from "../layout/chat.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";
import { resolveDeliveryStage } from "../utils/status.js";
import { getReactionWidth } from "../config/layout-config.js";
import { resolveAvatarWithFallback } from "../utils/avatar.js";

const messages = Array.from({ length: 30 }, (_, index) => ({
  id: `m${index}`,
  from: index % 2 ? "me" : "Ava",
  type: "text",
  text: "This is a long chat with wrapped messages and enough history to require scrolling.",
  at: index === 29 ? 60 : 0,
}));
function compute(t: number, bottom = 34, photo = false) {
  return computeChatLayout({
    world: {
      config: { fps: 30 },
      devices: {
        phone: { id: "phone", profileId: "iphone16", os: { clock: 0, appearance: "light" } },
      },
      appInstances: {
        "phone:app_whatsapp": {
          ...createWhatsAppInitialState(),
          conversationId: "chat",
          currentScreen: "chat",
          conversations: { chat: { id: "chat", name: "Ava", messages: photo ? messages.map((message, index) => index === 29 ? { ...message, type: "image", text: undefined, imageUrl: "/media/launch-board.svg" } : message) : messages } },
        },
      },
    } as unknown as WorldState,
    t,
    activeDeviceId: "phone",
    activeAppId: "app_whatsapp",
    activeConversationId: "chat",
    platform: "ios",
    viewKind: "CHAT",
    viewportWidth: 440,
    viewportHeight: 956,
    appViewport: createAppViewportFrame({
      width: 440,
      height: 956,
      interactiveInsets: { top: 62, bottom },
    }),
  });
}
describe("WhatsApp deterministic long threads", () => {
  it("keeps the same camera and UI slot above both composer and keyboard", () => {
    for (const bottom of [34, 35, 70, 170, 336]) for (const photo of [false, true]) {
      const layout = compute(90, bottom, photo);
      const last = layout.messageLayouts.m29.rect!;
      expect(last).toEqual(layout.semantic!.regions.m29.rect);
      expect(last.y + last.height).toBeLessThanOrEqual(
        layout.semantic!.regions.input_area.rect.y - 20,
      );
      const thread = layout.semantic!.regions.thread.rect;
      expect(thread.y + thread.height).toBe(layout.semantic!.regions.input_area.rect.y);
      expect(layout.scrollY).toBeGreaterThan(0);
    }
    expect(compute(63)).toEqual(compute(63));
    expect(compute(60).scrollY).toBeLessThan(compute(64).scrollY);
  });
  it("honors future receipts and bounds many reactions", () => {
    expect(resolveAvatarWithFallback("/avatars/avatar-ava.jpg", "Ava")).toBe(
      "/avatars/avatar-ava.jpg",
    );
    expect(resolveAvatarWithFallback(undefined, "Ava")).toMatch(/^data:image\/svg/);
    const message = { from: "me", status: "read" as const, at: 0, deliveredAt: 70, readAt: 90 };
    expect([69, 70, 90].map((frame) => resolveDeliveryStage(message, frame))).toEqual([
      "sent",
      "delivered",
      "read",
    ]);
    expect(getReactionWidth(Array.from({ length: 20 }, () => ({ count: 2 })))).toBeLessThan(180);
  });
});
