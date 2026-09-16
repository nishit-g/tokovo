import type { IMessageMessage } from "../types/index.js";
import { measureBodyText } from "@tokovo/core";

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
const graphemes = (text: string) => /^[\x20-\x7e]*$/.test(text) ? [...text] : [...segmenter.segment(text)].map((part) => part.segment);
const wrappedText = new Map<string, string[]>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function textAdvance(text: string, size = 17): number {
  return measureBodyText(text, size);
}

/** Headless wrapping shared by the bubble and camera layout. */
export function wrapMessageText(text: string, width: number, size = 17): string[] {
  const key = JSON.stringify([text, width, size]);
  const cached = wrappedText.get(key);
  if (cached) return cached;
  // Shape complete runs so kerning and ligatures match the painted line.
  const advance = (value: string) => textAdvance(value, size);
  const result = text.split("\n").flatMap((paragraph) => {
    const lines: string[] = [];
    let line = "";
    for (const word of paragraph.split(/(\s+)/u)) {
      if (line && advance(line + word) > width + 0.5) {
        lines.push(line.trimEnd());
        line = "";
      }
      if (advance(word) <= width + 0.5) {
        if (line || !/^\s+$/u.test(word)) line += word;
        continue;
      }
      for (const char of graphemes(word)) {
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
  if (wrappedText.size >= 1024) wrappedText.delete(wrappedText.keys().next().value!);
  wrappedText.set(key, result);
  return result;
}

type Geometry = ReturnType<typeof computeMessageGeometry>;
const geometries = new WeakMap<IMessageMessage, Map<string, Geometry>>();

export function messageGeometry(message: IMessageMessage, viewportWidth: number, reply?: string, sender = false, status = false): Geometry {
  let cache = geometries.get(message);
  if (!cache) { cache = new Map(); geometries.set(message, cache); }
  const key = JSON.stringify([viewportWidth, reply, sender, status]);
  const found = cache.get(key);
  if (found) return found;
  const value = computeMessageGeometry(message, viewportWidth, reply, sender, status);
  if (cache.size >= 8) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
}

function computeMessageGeometry(
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
  locale = "en-US",
): string | undefined {
  if (message.sentAt === undefined) return undefined;
  const date = new Date(message.sentAt);
  if (
    previous?.sentAt !== undefined &&
    new Date(previous.sentAt).toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
  )
    return undefined;
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    if (dateFormatters.size >= 64) dateFormatters.clear();
    dateFormatters.set(locale, formatter);
  }
  return formatter.format(date);
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
