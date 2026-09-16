import { expect, it } from "vitest";
import { getReplyPreview, getReplyTarget } from "../config/layout-config.js";
import { dateLabel, messageGeometry, wrapMessageText } from "../layout/message.js";
import type { IMessageMessage } from "../types/index.js";

it("preserves graphemes and indexes 10,000 replies without copying history", () => {
  for (const cluster of ["👨‍👩‍👧‍👦", "👍🏽", "🇮🇳", "é"]) {
    expect(wrapMessageText(cluster, 10)).toEqual([cluster]);
  }
  const messages: IMessageMessage[] = Array.from({ length: 10_000 }, (_, index) => ({
    id: String(index), conversationId: "chat", senderId: "me", fromMe: true,
    kind: "text", text: `Message ${index}`, timestamp: 0, tapbacks: [],
    replyTo: index ? { messageId: String(index - 1) } : undefined,
  }));
  const byId = new Map(messages.map((message, index) => [message.id, index]));
  const start = process.cpuUsage();
  for (let index = 1; index < messages.length; index++) {
    const preview = getReplyPreview(messages, index, byId);
    expect(preview).toBe(messages[index - 1].text);
    const geometry = messageGeometry(messages[index], 393, preview);
    expect(messageGeometry(messages[index], 393, preview)).toBe(geometry);
  }
  const elapsed = process.cpuUsage(start);
  expect((elapsed.user + elapsed.system) / 1000).toBeLessThan(1500);
  expect(getReplyTarget([{ ...messages[0], replyTo: { messageId: "1" } }, messages[1]], 0, byId)).toBeUndefined();
  const dated = { ...messages[0], sentAt: Date.parse("2026-04-10T12:00:00Z") };
  expect(dateLabel(dated, undefined, "fr-FR")).not.toBe(dateLabel(dated));
});
