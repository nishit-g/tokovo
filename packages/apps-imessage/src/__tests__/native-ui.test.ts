import { createElement as h, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MessageBubble } from "../components/MessageBubble.js";
import { Header } from "../components/Header.js";
import { InputBar } from "../components/InputBar.js";
import { ConversationListItem } from "../ui/index.js";
import { IMessageThemeProvider } from "../ui/ThemeContext.js";
import { getTheme } from "../config/theme.js";
import { computeMessageGap, getReplyPreview, shouldShowTail } from "../config/layout-config.js";
import type { IMessageMessage } from "../types/index.js";

vi.mock("@tokovo/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tokovo/react")>()),
  useTime: () => 30,
  useFps: () => 30,
}));
const message = (
  id: string,
  senderId = "Ava",
  extra: Partial<IMessageMessage> = {},
): IMessageMessage => ({
  id,
  senderId,
  senderName: senderId,
  conversationId: "c1",
  fromMe: senderId === "me",
  kind: "text",
  text: "Okay.",
  timestamp: 0,
  tapbacks: [],
  ...extra,
});
const render = (element: ReactElement, mode: "light" | "dark" = "light") =>
  renderToStaticMarkup(h(IMessageThemeProvider, { mode, children: element }));

describe("native iMessage UI", () => {
  it("does not expose unsent text in the conversation list", () => {
    const html = render(
      h(ConversationListItem, {
        conversation: {
          id: "c1",
          title: "Ava",
          transport: "imessage",
          participants: [],
          messages: [message("m1", "me", { text: "Private text", isUnsent: true })],
          typing: {},
          unreadCount: 0,
        },
      }),
    );
    expect(html).toContain("You unsent a message");
    expect(html).not.toContain("Private text");
  });
  it("keeps headers and composer inside their declared safe-area boxes", () => {
    expect(render(h(Header, { name: "Ava", contentInsetTop: 62 }))).toContain("height:150px");
    expect(render(h(Header, { name: "Photos", contentInsetTop: 62, compact: true }))).toContain(
      "height:106px",
    );
    const composer = render(
      h(InputBar, { contentInsetBottom: 34, draft: "On my way", isSMS: true }),
    );
    expect(composer).toContain("height:84px");
    expect(composer).toContain("box-sizing:border-box");
    expect(composer).toContain('aria-label="Send message"');
    expect(composer).toContain("#34C759");
  });

  it.each(["light", "dark"] as const)(
    "renders compact text, reactions, edit labels and unsend in %s",
    (mode) => {
      const html = render(
        h(MessageBubble, {
          message: message("m1", "me", {
            text: "First line\nSecond line",
            isEdited: true,
            tapbacks: [{ type: "heart" }],
            status: "read",
          }),
          theme: getTheme(mode),
          showStatus: true,
        }),
        mode,
      );
      expect(html).toContain("white-space:pre-wrap");
      expect(html).toContain("Edited");
      expect(html).toContain("Read");
      expect(html).toContain('aria-label="Loved"');
      expect(html).toContain('viewBox="0 0 12 20"');
      const unsent = render(
        h(MessageBubble, {
          message: message("m2", "me", { text: "Private text", isUnsent: true }),
          theme: getTheme(mode),
        }),
        mode,
      );
      expect(unsent).toContain("You unsent a message");
      expect(unsent).not.toContain("Private text");
      expect(unsent).not.toContain('viewBox="0 0 12 20"');
    },
  );

  it("renders every attachment without inventing an empty text bubble", () => {
    const html = render(
      h(MessageBubble, {
        message: message("media", "Ava", {
          text: "",
          attachments: [
            { kind: "image", url: "/one.png" },
            { kind: "image", url: "/two.png" },
          ],
        }),
      }),
    );
    expect(html.match(/<img\b/g)).toHaveLength(2);
    expect(html).not.toContain('viewBox="0 0 12 20"');
  });

  it("separates different group senders and resolves replies only against earlier messages", () => {
    const messages = [
      message("m1"),
      message("m2"),
      message("m3", "Milo", { replyTo: { index: "last" } }),
    ];
    expect(computeMessageGap(messages[0], messages[1])).toBe(2);
    expect(computeMessageGap(messages[1], messages[2])).toBe(12);
    expect(shouldShowTail(messages, 0)).toBe(false);
    expect(shouldShowTail(messages, 1)).toBe(true);
    expect(getReplyPreview(messages, 2)).toBe("Okay.");
    messages[1].isUnsent = true;
    expect(getReplyPreview(messages, 2)).toBe("Message unavailable");
    messages[2].replyTo = { id: "m3" };
    expect(getReplyPreview(messages, 2)).toBeUndefined();
  });
});
