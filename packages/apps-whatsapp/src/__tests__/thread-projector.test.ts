import { describe, expect, it } from "vitest";
import { projectWhatsAppThread } from "../thread/projector.js";
import { createWhatsAppThreadWindow } from "../thread/window.js";
import type { WhatsAppConversation, WhatsAppMessage } from "../types/index.js";

const baseTime = new Date("2026-07-20T10:00:00.000Z");

function message(
  id: string,
  from: string,
  at: number,
  overrides: Partial<WhatsAppMessage> = {},
): WhatsAppMessage {
  return {
    id,
    from,
    at,
    timestamp: "10:00",
    type: "text",
    text: id,
    ...overrides,
  };
}

function project(
  messages: WhatsAppMessage[],
  conversation: Partial<WhatsAppConversation> = {},
) {
  return projectWhatsAppThread({
    conversationId: "launch-room",
    messages,
    conversation: {
      id: "launch-room",
      type: "group",
      messages,
      members: [
        { id: "ava", name: "Ava" },
        { id: "noor", name: "Noor" },
      ],
      ...conversation,
    },
    ownerName: "Owner",
    baseTime,
    fps: 60,
    locale: "en-US",
  });
}

describe("WhatsApp thread projection", () => {
  it("reuses projections for immutable conversation state", () => {
    const messages = [message("stable", "ava", 0)];
    const conversation: WhatsAppConversation = {
      id: "launch-room",
      type: "group",
      messages,
    };
    const input = {
      conversationId: conversation.id,
      messages,
      conversation,
      ownerName: "Owner",
      baseTime,
      fps: 60,
      locale: "en-US" as const,
    };

    expect(projectWhatsAppThread(input)).toBe(projectWhatsAppThread(input));
  });

  it("uses stable chronology and sender runs with explicit positions", () => {
    const result = project([
      message("second", "ava", 60),
      message("first", "ava", 0),
      message("third", "ava", 3_599),
      message("fourth", "ava", 7_200),
    ]);
    const runs = result.blocks.filter((block) => block.kind === "run");

    expect(runs).toHaveLength(2);
    expect(runs[0].items.map((item) => item.message.id)).toEqual([
      "first",
      "second",
      "third",
    ]);
    expect(runs[0].items.map((item) => item.position)).toEqual([
      "start",
      "middle",
      "end",
    ]);
    expect(runs[1].items[0].position).toBe("single");
  });

  it("fails loudly for duplicate IDs instead of producing ambiguous subjects", () => {
    expect(() =>
      project([message("duplicate", "ava", 0), message("duplicate", "me", 1)]),
    ).toThrow('Duplicate WhatsApp message id "duplicate"');
  });

  it("resolves reply semantics from the target and marks broken references", () => {
    const result = project([
      message("photo", "ava", 0, {
        type: "image",
        text: undefined,
        imageUrl: "/photo.png",
      }),
      message("reply", "me", 30, {
        replyTo: { messageId: "photo" },
      }),
      message("broken", "ava", 60, {
        replyTo: { messageId: "not-present" },
      }),
    ]);

    expect(result.messagesById.get("reply")?.replyTo).toEqual({
      messageId: "photo",
      text: "Photo",
      from: "Ava",
      type: "image",
      thumbnailUrl: "/photo.png",
      resolution: "resolved",
    });
    expect(result.messagesById.get("broken")?.replyTo?.resolution).toBe(
      "missing",
    );
  });

  it("merges reactions and drops invalid reaction data deterministically", () => {
    const result = project([
      message("reacted", "ava", 0, {
        reactions: [
          { emoji: "🔥", count: 1 },
          { emoji: "🔥", count: 2, fromMe: true },
          { emoji: "", count: 20 },
          { emoji: "👍", count: 0 },
        ],
      }),
    ]);

    expect(result.messagesById.get("reacted")?.reactions).toEqual([
      { emoji: "🔥", count: 3, fromMe: true },
    ]);
  });

  it("derives dates while inserting unread and disappearing system blocks", () => {
    const result = project(
      [message("read", "ava", 30), message("unread", "noor", 60)],
      {
        unreadCount: 1,
        preferences: {
          disappearingMessages: "24 hours",
        },
      },
    );
    const systemTypes = result.blocks
      .filter((block) => block.kind === "system")
      .map((block) => block.message.systemType);

    expect(systemTypes).toEqual([
      "disappearing_messages",
      "date_change",
      "unread_divider",
    ]);
    expect(
      result.blocks.find(
        (block) =>
          block.kind === "system" &&
          block.message.systemType === "disappearing_messages",
      )?.message.text,
    ).toBe("Messages disappear after 24 hours.");
  });

  it("uses owner identity consistently for authored local messages", () => {
    const result = project([message("mine", "Owner", 0)]);
    const run = result.blocks.find((block) => block.kind === "run");

    expect(run?.kind).toBe("run");
    if (run?.kind === "run") expect(run.isMe).toBe(true);
  });

  it("fails loudly when a semantic render-window subject is missing", () => {
    const result = project([message("present", "ava", 0)]);

    expect(() =>
      createWhatsAppThreadWindow(result, {
        focusMessageId: "missing",
        maxMessages: 1,
      }),
    ).toThrow('thread window focus message "missing" does not exist');

    const largeResult = project(
      Array.from({ length: 8 }, (_, index) =>
        message(`message-${index}`, index % 2 === 0 ? "ava" : "noor", index),
      ),
    );
    expect(() =>
      createWhatsAppThreadWindow(largeResult, {
        focusMessageId: "missing",
        maxMessages: 3,
      }),
    ).toThrow('thread window focus message "missing" does not exist');
  });
});
