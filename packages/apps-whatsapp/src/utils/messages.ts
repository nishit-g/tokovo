import type { WorldState } from "@tokovo/core";
import type { WhatsAppMessage } from "../types";

type NormalizeOptions = {
  conversationId: string;
  index: number;
  baseTime?: Date;
};

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function resolveBaseTime(world: WorldState, deviceId?: string): Date {
  const resolvedDeviceId = deviceId ?? Object.keys(world.devices || {})[0];
  const clock = resolvedDeviceId
    ? world.devices?.[resolvedDeviceId]?.os?.clock
    : undefined;
  if (typeof clock === "number") {
    return new Date(clock);
  }
  return new Date();
}

function formatTimestamp(
  value: unknown,
  baseTime: Date | undefined,
): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value !== "number") return undefined;

  // If the number looks like a timestamp (ms since epoch), use it directly
  if (value > 1_000_000_000_000) {
    return formatTime(new Date(value));
  }

  // If the number looks like a timestamp in seconds since epoch
  if (value > 1_000_000_000) {
    return formatTime(new Date(value * 1000));
  }

  const base = baseTime ?? new Date();
  return formatTime(new Date(base.getTime() + value * 1000));
}

export function normalizeMessage(
  raw: Record<string, unknown>,
  { conversationId, index, baseTime }: NormalizeOptions,
): WhatsAppMessage {
  const from =
    (raw.from as string) ??
    (raw.sender as string) ??
    (raw.actor as string) ??
    "unknown";

  const type =
    (raw.type as string) ??
    (raw.messageType as string) ??
    (raw.imageUrl || raw.image ? "image" : undefined) ??
    (raw.videoUrl || raw.video ? "video" : undefined) ??
    (raw.gifUrl || raw.gif ? "gif" : undefined) ??
    (raw.stickerUrl || raw.sticker ? "sticker" : undefined) ??
    (raw.documentUrl || raw.document ? "document" : undefined) ??
    (raw.contactName || raw.contactPhone ? "contact" : undefined) ??
    (raw.locationName || raw.latitude ? "location" : undefined) ??
    (raw.voice || raw.audio ? "voice" : undefined) ??
    "text";

  const id =
    (raw.id as string) ??
    (raw.messageId as string) ??
    `${conversationId}_seed_${index}`;

  const timestamp = formatTimestamp(raw.timestamp, baseTime);

  const base: WhatsAppMessage = {
    id,
    from,
    type: type as WhatsAppMessage["type"],
    timestamp,
    at: raw.at as number | undefined,
    status: raw.status as WhatsAppMessage["status"],
    reactions: raw.reactions as WhatsAppMessage["reactions"],
    replyTo: raw.replyTo as WhatsAppMessage["replyTo"],
    senderName: raw.senderName as string | undefined,
  };

  if (base.status === undefined) {
    base.status = from === "me" ? "sent" : "delivered";
  }

  switch (base.type) {
    case "image":
      base.imageUrl = (raw.imageUrl as string) ?? (raw.image as string) ?? "";
      base.caption = raw.caption as string | undefined;
      break;
    case "video":
      base.videoUrl = (raw.videoUrl as string) ?? (raw.video as string) ?? "";
      base.thumbnailUrl = raw.thumbnailUrl as string | undefined;
      base.duration = (raw.duration as number) ?? 10;
      base.caption = raw.caption as string | undefined;
      break;
    case "gif":
      base.gifUrl = (raw.gifUrl as string) ?? (raw.gif as string) ?? "";
      break;
    case "sticker":
      base.stickerUrl =
        (raw.stickerUrl as string) ?? (raw.sticker as string) ?? "";
      break;
    case "voice":
      base.duration =
        (raw.duration as number) ??
        (raw.voiceDuration as number) ??
        5;
      base.isPlaying = raw.isPlaying as boolean | undefined;
      base.playProgress = raw.playProgress as number | undefined;
      break;
    case "document":
      base.fileName = raw.fileName as string | undefined;
      if (typeof raw.fileSize === "number") {
        base.fileSize = `${raw.fileSize}`;
      } else {
        base.fileSize = raw.fileSize as string | undefined;
      }
      base.fileType = raw.fileType as string | undefined;
      base.documentUrl = raw.documentUrl as string | undefined;
      base.pageCount = raw.pageCount as number | undefined;
      break;
    case "contact":
      base.contactName = raw.contactName as string | undefined;
      base.contactPhone = raw.contactPhone as string | undefined;
      base.contactAvatarUrl = raw.contactAvatarUrl as string | undefined;
      break;
    case "location":
      base.latitude = raw.latitude as number | undefined;
      base.longitude = raw.longitude as number | undefined;
      base.locationName = raw.locationName as string | undefined;
      base.locationAddress = raw.locationAddress as string | undefined;
      base.mapThumbnailUrl = raw.mapThumbnailUrl as string | undefined;
      break;
    case "system":
      base.systemType = raw.systemType as WhatsAppMessage["systemType"];
      base.text = raw.text as string | undefined;
      break;
    case "link":
      base.text = raw.text as string | undefined;
      base.linkPreview = raw.linkPreview as WhatsAppMessage["linkPreview"];
      break;
    case "text":
    default:
      base.text = (raw.text as string) ?? "";
      break;
  }

  return base;
}

export function normalizeMessages(
  world: WorldState,
  conversationId: string,
  messages: unknown[] = [],
  deviceId?: string,
): WhatsAppMessage[] {
  const baseTime = resolveBaseTime(world, deviceId);
  return messages.map((msg, index) =>
    normalizeMessage(msg as Record<string, unknown>, {
      conversationId,
      index,
      baseTime,
    }),
  );
}

export function getBaseTime(world: WorldState, deviceId?: string): Date {
  return resolveBaseTime(world, deviceId);
}
