import type { IMessageMessage } from "../types/index.js";

function textAdvance(text: string, size = 17): number {
  return [...text].reduce(
    (sum, char) =>
      sum +
      (/\s/u.test(char)
        ? 0.32
        : /[ilI.,'!:;]/u.test(char)
          ? 0.3
          : /[MW@]/u.test(char)
            ? 0.9
            : (char.codePointAt(0) ?? 0) > 255
              ? 1
              : 0.57) *
        size,
    0,
  );
}

/** Headless wrapping shared by the bubble and camera layout. */
export function wrapMessageText(text: string, width: number, size = 17): string[] {
  // ponytail: conservative glyph advances, not font shaping. Explicit shared
  // line breaks keep the rendered slot and headless anchor in agreement.
  const advance = (value: string) => textAdvance(value, size);
  return text.split("\n").flatMap((paragraph) => {
    const lines: string[] = [];
    let line = "";
    for (const word of paragraph.split(/(\s+)/u)) {
      if (line && advance(line + word) > width + 0.5) {
        lines.push(line.trimEnd());
        line = "";
      }
      for (const char of word) {
        if (line && advance(line + char) > width + 0.5) {
          lines.push(line);
          line = "";
        }
        if (line || !/\s/u.test(char)) line += char;
      }
    }
    lines.push(line);
    return lines;
  });
}

export function messageGeometry(
  message: IMessageMessage,
  viewportWidth: number,
  reply?: string,
  sender = false,
  status = false,
) {
  const maxWidth = (viewportWidth - 32) * 0.75;
  const lines = wrapMessageText(message.text ?? "", maxWidth - 24);
  const textWidth = Math.min(
    maxWidth,
    Math.max(42, ...lines.map((line) => Math.ceil(textAdvance(line) + 24))),
  );
  const media = message.attachments ?? [];
  const width =
    message.isSystem || message.isUnsent
      ? viewportWidth - 32
      : Math.min(
          maxWidth,
          Math.max(
            textWidth,
            media.length || message.linkPreview ? 270 : 0,
            reply ? 220 : 0,
            Math.min(4, message.tapbacks?.length ?? 0) * 32,
          ),
        );
  const textLines = wrapMessageText(message.text ?? "", width - 24);
  const replyLines = reply ? wrapMessageText(reply, width - 36, 11).slice(0, 3) : [];
  const attachmentHeights = media.map((attachment) => {
    switch (attachment.kind) {
      case "image":
        return Math.min(
          320,
          Math.min(260, width) * ((attachment.height ?? 180) / (attachment.width ?? 260)),
        );
      case "gif":
      case "video":
        return 180;
      case "sticker":
        return 130;
      case "voice":
        return 52;
      case "link":
        return attachment.preview.thumbnail ? 240 : 116;
      case "contact":
        return 140;
      case "calendar":
        return 200;
      case "location":
        return 90;
      case "payment":
        return 96;
    }
  });
  const height =
    message.isSystem || message.isUnsent
      ? 32
      : (sender ? 18 : 0) +
        (reply ? replyLines.length * 14 + 34 : 0) +
        attachmentHeights.reduce((sum, value) => sum + value + 8, 0) +
        (message.linkPreview && !media.some((item) => item.kind === "link") ? 240 : 0) +
        (message.text ? textLines.length * 22 + 16 : 0) +
        (message.isEdited ? 17 : 0) +
        (status && message.status ? 16 : 0);
  return { width, height: Math.max(32, height), textLines, replyLines, attachmentHeights };
}

export function dateLabel(
  message: IMessageMessage,
  previous?: IMessageMessage,
): string | undefined {
  if (message.sentAt === undefined) return undefined;
  const date = new Date(message.sentAt);
  if (
    previous?.sentAt !== undefined &&
    new Date(previous.sentAt).toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
  )
    return undefined;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function deliveryStatus(message: IMessageMessage, frame: number) {
  if (message.readAt !== undefined && frame >= message.readAt) return "read";
  if (message.deliveredAt !== undefined && frame >= message.deliveredAt) return "delivered";
  if (message.readAt !== undefined && message.status === "read") return "sent";
  if (message.deliveredAt !== undefined && message.status === "delivered") return "sent";
  return message.status;
}

export function composerExtraHeight(text: string, width: number) {
  return (Math.min(4, wrapMessageText(text, Math.max(40, width - 112)).length) - 1) * 22;
}
