import { describe, expect, it } from "vitest";
import { createAppViewportFrame, type ChatLayoutState, type WorldState } from "@tokovo/core";
import { iMessageLayoutStrategies } from "../layout/index.js";
import { createIMessageInitialState } from "../runtime/initial-state.js";
import {
  composerExtraHeight,
  dateLabel,
  deliveryStatus,
  messageGeometry,
} from "../layout/message.js";
import type { IMessageMessage } from "../types/index.js";

const messages: IMessageMessage[] = Array.from({ length: 30 }, (_, index) => ({
  id: `m${index}`,
  conversationId: "chat",
  senderId: index % 2 ? "me" : "Ava",
  fromMe: index % 2 === 1,
  kind: "text",
  text: "A longer message that wraps across more than one line without running into the composer.",
  timestamp: index === 29 ? 60 : 0,
  tapbacks: [],
}));
const compute = (frame: number, bottom = 34, draft = "") =>
  iMessageLayoutStrategies
    .find((strategy) => strategy.viewKind === "CHAT")!
    .computeLayout({
      world: {
        config: { fps: 30 },
        appInstances: {
          "phone:app_imessage": {
            ...createIMessageInitialState(),
            activeConversationId: "chat",
            conversations: {
              chat: { id: "chat", messages, participants: [], typing: {}, unreadCount: 0 },
            },
          },
        },
      } as unknown as WorldState,
      t: frame,
      activeDeviceId: "phone",
      activeAppId: "app_imessage",
      platform: "ios",
      viewKind: "CHAT",
      viewportWidth: 440,
      viewportHeight: 956,
      appViewport: createAppViewportFrame({
        width: 440,
        height: 956,
        interactiveInsets: { top: 62, bottom },
      }),
      inputValues: { composer: draft },
    }) as ChatLayoutState;

describe("iMessage deterministic long threads", () => {
  it("shares exact message slots with camera subjects and stays above the keyboard/composer", () => {
    for (const bottom of [34, 35, 60, 170, 335, 336]) {
      const layout = compute(90, bottom);
      const last = layout.messageLayouts.m29.rect!;
      expect(last).toEqual(layout.semantic!.regions.imessage_last_message.rect);
      expect(last.y + last.height).toBeLessThanOrEqual(
        layout.semantic!.regions.imessage_composer.rect.y - 16,
      );
      expect(layout.scrollY).toBeGreaterThan(0);
    }
  });
  it("settles without previous-frame state, including reverse seeks", () => {
    const forward = [60, 63, 68, 90].map((frame) => compute(frame));
    const reverse = [90, 68, 63, 60].map((frame) => compute(frame)).reverse();
    expect(reverse).toEqual(forward);
    expect(forward[0].scrollY).toBeLessThan(forward[1].scrollY);
    expect(forward[1].messageLayouts.m29.opacity).toBeLessThan(1);
  });
  it("reserves multiline drafts and keeps authored receipts and dates deterministic", () => {
    expect(messageGeometry({ ...messages[0], text: "Here?" }, 440).textLines).toEqual(["Here?"]);
    const draft = "First line\nSecond line\nThird line";
    expect(compute(90, 336, draft).semantic!.regions.imessage_composer.rect.y).toBe(
      compute(90, 336).semantic!.regions.imessage_composer.rect.y - composerExtraHeight(draft, 440),
    );
    const message = {
      ...messages[0],
      status: "sent" as const,
      deliveredAt: 70,
      readAt: 90,
      sentAt: Date.parse("2026-04-10T23:59:00Z"),
    };
    expect([69, 70, 90].map((frame) => deliveryStatus(message, frame))).toEqual([
      "sent",
      "delivered",
      "read",
    ]);
    expect(dateLabel(message)).toBe("Apr 10, 2026");
    expect(dateLabel(message, message)).toBeUndefined();
    const media = messageGeometry(
      {
        ...message,
        text: "",
        attachments: [{ kind: "image", url: "/photo.png", width: 260, height: 180 }],
      },
      440,
      "Photo",
      false,
      false,
    );
    expect(media.height).toBeGreaterThan(180);
    expect(media.width).toBeLessThanOrEqual((440 - 32) * 0.75);
  });
});
