import type { IMessageMessage } from "../types/index.js";

export const LAYOUT_CONFIG = {
  GAP_MINIMAL: 2,
  GAP_RUN_BREAK: 6,
  GAP_NORMAL: 12,
};

export function computeMessageGap(
  previous: IMessageMessage | undefined,
  current: IMessageMessage,
): number {
  const tapbackOffset = (current.tapbacks?.length ?? 0) > 0 ? 24 : 0;
  if (!previous) return tapbackOffset;
  if (previous.isSystem || current.isSystem || previous.isUnsent || current.isUnsent)
    return LAYOUT_CONFIG.GAP_NORMAL + tapbackOffset;

  const sameSender = previous.fromMe === current.fromMe && previous.senderId === current.senderId;
  const prevHasMeta =
    (previous.tapbacks?.length ?? 0) > 0 ||
    !!previous.replyTo ||
    previous.isEdited ||
    (previous.attachments?.length ?? 0) > 0;
  const currHasMeta =
    (current.tapbacks?.length ?? 0) > 0 ||
    !!current.replyTo ||
    (current.attachments?.length ?? 0) > 0;

  if (sameSender && !prevHasMeta && !currHasMeta) {
    return LAYOUT_CONFIG.GAP_MINIMAL + tapbackOffset;
  }

  if (sameSender) {
    return LAYOUT_CONFIG.GAP_RUN_BREAK + tapbackOffset;
  }

  return LAYOUT_CONFIG.GAP_NORMAL + tapbackOffset;
}

export function shouldShowTail(messages: IMessageMessage[], index: number): boolean {
  const current = messages[index];
  const next = messages[index + 1];
  return (
    !next ||
    next.isSystem === true ||
    next.isUnsent === true ||
    current.fromMe !== next.fromMe ||
    current.senderId !== next.senderId
  );
}

export function getReplyPreview(messages: IMessageMessage[], index: number): string | undefined {
  const reference = messages[index]?.replyTo;
  if (!reference) return undefined;
  const id = reference.messageId ?? reference.id;
  const target = id
    ? messages.slice(0, index).find((message) => message.id === id)
    : reference.index === "last"
      ? messages[index - 1]
      : typeof reference.index === "number" && reference.index < index
        ? messages[reference.index]
        : undefined;
  if (!target) return undefined;
  if (target.isUnsent) return "Message unavailable";
  const attachment = target.attachments?.[0];
  return (
    target.text ||
    target.systemText ||
    (attachment
      ? attachment.kind === "image"
        ? "Photo"
        : attachment.kind === "video"
          ? "Video"
          : attachment.kind === "voice"
            ? "Audio message"
            : "Attachment"
      : undefined)
  );
}
