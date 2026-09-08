import { describe, expect, it } from "vitest";
import {
  calculateBubbleWidth,
  calculateMessageHeight,
  LAYOUT_CONSTANTS,
  measureTextBlock,
  getThemedMessageLayout,
} from "../config/layout-config.js";
import { computeConversationLayout } from "../layout/cache.js";
import { getTheme } from "../theme/index.js";
import type { WhatsAppConversation, WhatsAppMessage } from "../types/index.js";

function message(
  id: string,
  type: WhatsAppMessage["type"],
  overrides: Partial<WhatsAppMessage> = {},
): WhatsAppMessage {
  return { id, type, from: "ava", at: 0, ...overrides };
}

describe("WhatsApp deterministic message geometry", () => {
  it("shares grapheme-safe explicit lines for mixed scripts, long words and newlines", () => {
    for (const text of [
      "A family 👨‍👩‍👧‍👦 arrives",
      "مرحبا بالعالم hello",
      "नमस्ते दुनिया",
      "A\n\nB",
      "x".repeat(200),
      "Meet me by the garden at 6:30.",
    ]) {
      const metrics = measureTextBlock(text, 280);
      expect(metrics.lines).toBe(metrics.textLines.length);
      expect(metrics.textLines.join("").replace(/\n/g, "")).toBe(
        text.replace(/\n/g, ""),
      );
      expect(metrics.bubbleWidth).toBeLessThanOrEqual(280 * 0.78);
      if (text.includes("👨‍👩‍👧‍👦"))
        expect(metrics.textLines.some((line) => line.includes("👨‍👩‍👧‍👦"))).toBe(
          true,
        );
      expect(measureTextBlock(text, 280)).toBe(metrics);
    }
  });
  it("reserves themed text, padding and metadata in both bubble and cached geometry", () => {
    const theme = getTheme("ios", false, "whatsapp-coral-studio");
    const config = getThemedMessageLayout(theme);
    const msg = message("themed", "text", {
      from: "me",
      text: "This meeting could've been an email.",
    });
    const metrics = measureTextBlock(msg.text!, 393, config);
    const height = calculateMessageHeight(msg, 393, config);
    expect(height).toBeGreaterThanOrEqual(
      theme.spacing.messagePaddingVertical * 2 +
        metrics.lines * theme.typography.messageLineHeight +
        14,
    );
    const layout = computeConversationLayout(
      { id: "themed", messages: [msg] },
      {
        viewportWidth: 393,
        viewportHeight: 852,
        layoutConfig: config,
      },
    );
    expect(layout.messageLayouts.get("themed")?.height).toBe(height);
  });
  it("measures logical points on the 393pt design surface", () => {
    const metrics = measureTextBlock("One logical line", 393);
    expect(metrics.lines).toBe(1);
    expect(metrics.bubbleWidth).toBeLessThanOrEqual(393 * 0.78);
    expect(
      calculateMessageHeight({ type: "text", text: "One logical line" }, 393),
    ).toBe(
      LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 +
        LAYOUT_CONSTANTS.TIMESTAMP_HEIGHT +
        LAYOUT_CONSTANTS.LINE_HEIGHT,
    );
  });

  it("reserves enough width for real metadata instead of overlaying short text", () => {
    expect(
      calculateBubbleWidth({ type: "text", text: "Ok", from: "me" }, 393),
    ).toBeGreaterThanOrEqual(92);
    expect(
      calculateBubbleWidth({ type: "text", text: "Hm", from: "teal" }, 393),
    ).toBeGreaterThanOrEqual(76);
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
