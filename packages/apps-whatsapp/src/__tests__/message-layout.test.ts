import { describe, expect, it } from "vitest";
import {
  calculateMessageHeight,
  LAYOUT_CONSTANTS,
  measureTextBlock,
} from "../config/layout-config.js";
import { computeConversationLayout } from "../layout/cache.js";
import type {
  WhatsAppConversation,
  WhatsAppMessage,
} from "../types/index.js";

function message(
  id: string,
  type: WhatsAppMessage["type"],
  overrides: Partial<WhatsAppMessage> = {},
): WhatsAppMessage {
  return { id, type, from: "ava", at: 0, ...overrides };
}

describe("WhatsApp deterministic message geometry", () => {
  it("measures logical points on the 393pt design surface", () => {
    const metrics = measureTextBlock("One logical line", 393);
    expect(metrics.lines).toBe(1);
    expect(metrics.bubbleWidth).toBeLessThanOrEqual(393 * 0.78);
    expect(
      calculateMessageHeight(
        { type: "text", text: "One logical line" },
        393,
      ),
    ).toBe(
      LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 +
        LAYOUT_CONSTANTS.TIMESTAMP_HEIGHT +
        LAYOUT_CONSTANTS.LINE_HEIGHT,
    );
  });

  it("keeps every message type inside the viewport with stable rectangles", () => {
    const messages: WhatsAppMessage[] = [
      message("text", "text", { text: "A line of text" }),
      message("image", "image", { imageUrl: "/photo.png" }),
      message("voice", "voice", { duration: 12 }),
      message("poll", "poll", {
        pollQuestion: "Which cut?",
        options: [{ text: "Quiet", votes: 2 }],
      }),
      message("document", "document", { fileName: "launch.pdf" }),
      message("contact", "contact", { contactName: "Ava" }),
      message("location", "location", { locationName: "Studio" }),
      message("sticker", "sticker", { stickerUrl: "/sticker.png" }),
    ];
    const conversation: WhatsAppConversation = {
      id: "geometry",
      type: "group",
      messages,
    };
    const first = computeConversationLayout(conversation, {
      viewportWidth: 393,
      viewportHeight: 852,
    });
    const second = computeConversationLayout(conversation, {
      viewportWidth: 393,
      viewportHeight: 852,
    });

    expect([...second.messageLayouts.values()]).toEqual([
      ...first.messageLayouts.values(),
    ]);
    for (const layout of first.messageLayouts.values()) {
      expect(layout.rect.x).toBeGreaterThanOrEqual(0);
      expect(layout.rect.width).toBeGreaterThan(0);
      expect(layout.rect.x + layout.rect.width).toBeLessThanOrEqual(393);
      expect(layout.rect.height).toBeGreaterThan(0);
    }
  });
});
