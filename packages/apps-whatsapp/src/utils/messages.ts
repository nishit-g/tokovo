import type { WorldState } from "@tokovo/core";
import type {
  WhatsAppMediaLifecycle,
  WhatsAppMessage,
} from "../types/index.js";
import type { WhatsAppLocale } from "../localization/index.js";
import { translateWhatsApp } from "../localization/index.js";
import { formatFileSize } from "./file-size.js";

type SnapshotHydrationOptions = {
  baseTime?: Date;
};

function formatTime(date: Date): string {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function resolveRelativeDate(
  value: unknown,
  baseTime: Date | undefined,
): Date | undefined {
  if (!(baseTime instanceof Date) || Number.isNaN(baseTime.getTime())) {
    return undefined;
  }
  if (typeof value !== "number") return undefined;

  if (value > 1_000_000_000_000) {
    return new Date(value);
  }
  if (value > 1_000_000_000) {
    return new Date(value * 1000);
  }

  return new Date(baseTime.getTime() + value * 1000);
}

function resolveBaseTime(world: WorldState, deviceId?: string): Date {
  const resolvedDeviceId = deviceId ?? Object.keys(world.devices || {})[0];
  const clock = resolvedDeviceId
    ? world.devices?.[resolvedDeviceId]?.os?.clock
    : undefined;
  if (typeof clock === "number") {
    return new Date(clock);
  }
  return new Date(0);
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

  const base = baseTime ?? new Date(0);
  return formatTime(new Date(base.getTime() + value * 1000));
}

function isLifecycleMediaType(type: WhatsAppMessage["type"]): boolean {
  return [
    "image",
    "video",
    "voice",
    "gif",
    "sticker",
    "document",
    "location",
  ].includes(type);
}

function hydrateMediaLifecycle(
  raw: Record<string, unknown>,
  hasSource: boolean,
): WhatsAppMediaLifecycle {
  const media = raw.media as Partial<WhatsAppMediaLifecycle> | undefined;
  const transferState = media?.transferState ?? (hasSource ? "ready" : "remote");
  return {
    transferState,
    transferProgress:
      media?.transferProgress ?? (transferState === "ready" ? 1 : 0),
    playbackState: media?.playbackState ?? "idle",
    playbackProgress: media?.playbackProgress ?? 0,
    failureReason: media?.failureReason,
  };
}

export function hydrateSnapshotMessage(
  raw: Record<string, unknown>,
  { baseTime }: SnapshotHydrationOptions,
): WhatsAppMessage {
  const id = raw.id as string;
  const from = raw.from as string;
  const type = raw.type as WhatsAppMessage["type"];

  const resolvedDate =
    typeof raw.timestampMs === "number"
      ? new Date(raw.timestampMs)
      : resolveRelativeDate(raw.timestamp, baseTime);
  const timestamp = formatTimestamp(raw.timestamp, baseTime);

  const base: WhatsAppMessage = {
    id,
    from,
    type,
    timestamp,
    timestampMs: resolvedDate?.getTime(),
    at: raw.at as number | undefined,
    status: raw.status as WhatsAppMessage["status"],
    reactions: raw.reactions as WhatsAppMessage["reactions"],
    replyTo: raw.replyTo as WhatsAppMessage["replyTo"],
    senderName: raw.senderName as string | undefined,
    starred: raw.starred as boolean | undefined,
    deliveredAt: raw.deliveredAt as number | undefined,
    readAt: raw.readAt as number | undefined,
  };

  if (base.status === undefined) {
    base.status = from === "me" ? "sent" : "delivered";
  }

  switch (base.type) {
    case "image":
      base.imageUrl = raw.imageUrl as string | undefined;
      base.caption = raw.caption as string | undefined;
      break;
    case "video":
      base.videoUrl = raw.videoUrl as string | undefined;
      base.thumbnailUrl = raw.thumbnailUrl as string | undefined;
      base.duration = (raw.duration as number) ?? 10;
      base.caption = raw.caption as string | undefined;
      break;
    case "gif":
      base.gifUrl = raw.gifUrl as string | undefined;
      break;
    case "sticker":
      base.stickerUrl = raw.stickerUrl as string | undefined;
      break;
    case "voice":
      base.duration = (raw.duration as number) ?? 5;
      break;
    case "poll":
      base.pollQuestion = (raw.pollQuestion as string) ?? "";
      base.options = (
        (raw.options as Array<{ text: string; votes?: number }>) ?? []
      ).map((option) => ({
        text: option.text,
        votes: option.votes,
      }));
      base.totalVotes = raw.totalVotes as number | undefined;
      base.pollStatus = raw.pollStatus as string | undefined;
      break;
    case "document":
      base.fileName = raw.fileName as string | undefined;
      if (typeof raw.fileSize === "number") {
        base.fileSize = formatFileSize(raw.fileSize);
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
    case "call": {
      base.callType = raw.callType as WhatsAppMessage["callType"];
      base.duration =
        (raw.callDuration as number) ?? (raw.duration as number) ?? undefined;
      base.text = raw.text as string | undefined;
      break;
    }
    case "call_missed": {
      base.callType = raw.callType as WhatsAppMessage["callType"];
      base.text = raw.text as string | undefined;
      break;
    }
    case "screenshot_alert":
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

  if (isLifecycleMediaType(base.type)) {
    const hasSource = Boolean(
      base.imageUrl ??
        base.videoUrl ??
        base.thumbnailUrl ??
        base.gifUrl ??
        base.stickerUrl ??
        base.documentUrl ??
        base.mapThumbnailUrl ??
        (base.type === "voice"),
    );
    base.media = hydrateMediaLifecycle(raw, hasSource);
  }

  return base;
}

export function getBaseTime(world: WorldState, deviceId?: string): Date {
  return resolveBaseTime(world, deviceId);
}

export function formatConversationListTimestamp(
  timestampMs: number | undefined,
  baseTime: Date,
  locale: WhatsAppLocale,
): string {
  if (typeof timestampMs !== "number") return "";

  const date = new Date(timestampMs);
  const baseDay = startOfDay(baseTime).getTime();
  const dateDay = startOfDay(date).getTime();
  const diffDays = Math.round((baseDay - dateDay) / 86_400_000);

  if (diffDays === 0) {
    return localizeTimestampDigits(formatTime(date), locale);
  }
  if (diffDays === 1) {
    return translateWhatsApp(locale, "status.yesterday");
  }
  if (diffDays > 1 && diffDays < 7) {
    const weekdays =
      locale === "ar"
        ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[date.getUTCDay()];
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  if (date.getUTCFullYear() === baseTime.getUTCFullYear()) {
    return localizeTimestampDigits(`${day}/${month}`, locale);
  }
  const year = String(date.getUTCFullYear()).slice(-2);
  return localizeTimestampDigits(`${day}/${month}/${year}`, locale);
}

function localizeTimestampDigits(value: string, locale: WhatsAppLocale): string {
  if (locale !== "ar") return value;
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return value.replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)] ?? digit);
}
