import type { WorldState } from "@tokovo/core";
import type { WhatsAppConversation, WhatsAppMessage } from "../types/index.js";

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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateLabel(date: Date, baseTime: Date): string {
  const baseDay = startOfDay(baseTime).getTime();
  const dateDay = startOfDay(date).getTime();
  const diffDays = Math.round((baseDay - dateDay) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  if (date.getFullYear() === baseTime.getFullYear()) {
    return `${day} ${month}`;
  }
  return `${day} ${month} ${date.getFullYear()}`;
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

function resolveMessageDate(
  raw: Record<string, unknown>,
  baseTime: Date,
  fps: number,
): Date | undefined {
  const timestamp = raw.timestamp;
  if (typeof timestamp === "number") {
    if (timestamp > 1_000_000_000_000) {
      return new Date(timestamp);
    }
    if (timestamp > 1_000_000_000) {
      return new Date(timestamp * 1000);
    }
    return new Date(baseTime.getTime() + timestamp * 1000);
  }

  const at = raw.at;
  if (typeof at === "number") {
    const date = new Date(baseTime);
    date.setMinutes(date.getMinutes() + Math.floor(at / fps));
    return date;
  }

  return undefined;
}

export function normalizeMessage(
  raw: Record<string, unknown>,
  { conversationId, index, baseTime }: NormalizeOptions,
): WhatsAppMessage {
  const rawFrom =
    (raw.from as string) ??
    (raw.sender as string) ??
    (raw.actor as string) ??
    "unknown";
  const from =
    rawFrom === "Me" || rawFrom === "You"
      ? "me"
      : rawFrom;

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
    (raw.systemType ? "system" : undefined) ??
    (raw.callType || raw.callDuration || raw.call ? "call" : undefined) ??
    "text";

  const id =
    (raw.id as string) ??
    (raw.messageId as string) ??
    `${conversationId}_seed_${index}`;

  const resolvedDate = resolveRelativeDate(raw.timestamp, baseTime);
  const timestamp = formatTimestamp(raw.timestamp, baseTime);

  const base: WhatsAppMessage = {
    id,
    from,
    type: type as WhatsAppMessage["type"],
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
    case "poll":
      base.pollQuestion =
        (raw.pollQuestion as string) ??
        (raw.question as string) ??
        "";
      base.options =
        ((raw.options as Array<{ text: string; votes?: number }>) ?? []).map(
          (option) => ({
            text: option.text,
            votes: option.votes,
          }),
        );
      base.totalVotes = raw.totalVotes as number | undefined;
      base.pollStatus = raw.pollStatus as string | undefined;
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
    case "call": {
      const callType =
        (raw.callType as WhatsAppMessage["callType"]) ??
        (raw.isVideo ? "video" : raw.isVoice ? "voice" : undefined);
      base.callType = callType;
      base.duration =
        (raw.callDuration as number) ??
        (raw.duration as number) ??
        undefined;
      base.text = raw.text as string | undefined;
      break;
    }
    case "call_missed": {
      const callType =
        (raw.callType as WhatsAppMessage["callType"]) ??
        (raw.isVideo ? "video" : raw.isVoice ? "voice" : undefined);
      base.callType = callType;
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

export function normalizeMessagesForChat(
  world: WorldState,
  conversationId: string,
  messages: unknown[] = [],
  deviceId?: string,
  conversation?: WhatsAppConversation,
): WhatsAppMessage[] {
  const normalized = normalizeMessages(world, conversationId, messages, deviceId);
  if (normalized.some((msg) => msg.type === "system" && msg.systemType === "date_change")) {
    return normalized;
  }

  const baseTime = resolveBaseTime(world, deviceId);
  const fps = world.config?.fps ?? 30;
  const timeline: WhatsAppMessage[] = [];
  let lastDateKey: string | undefined;
  const unreadCount = Math.max(0, conversation?.unreadCount ?? 0);
  const unreadDividerMessageId = conversation?.unreadDividerMessageId;
  let unreadDividerIndex = -1;

  if (unreadDividerMessageId) {
    unreadDividerIndex = normalized.findIndex(
      (message) => message.id === unreadDividerMessageId,
    );
  }

  if (unreadDividerIndex === -1 && unreadCount > 0) {
    let remainingUnread = unreadCount;
    for (let i = normalized.length - 1; i >= 0; i--) {
      const message = normalized[i];
      if (message.type === "system" || message.from === "me") {
        continue;
      }
      remainingUnread -= 1;
      if (remainingUnread <= 0) {
        unreadDividerIndex = i;
        break;
      }
    }
  }

  normalized.forEach((message, index) => {
    const raw = messages[index] as Record<string, unknown> | undefined;
    if (raw) {
      const date = resolveMessageDate(raw, baseTime, fps);
      if (date) {
        const key = startOfDay(date).toISOString();
        if (key !== lastDateKey) {
          timeline.push({
            id: `${conversationId}_auto_date_${key}_${index}`,
            from: "system",
            type: "system",
            systemType: "date_change",
            text: formatDateLabel(date, baseTime),
            at: message.at,
          });
          lastDateKey = key;
        }
      }
    }
    if (index === unreadDividerIndex) {
      timeline.push({
        id: `${conversationId}_auto_unread_${index}`,
        from: "system",
        type: "system",
        systemType: "unread_divider",
        text: "Unread messages",
        at: message.at,
      });
    }
    timeline.push(message);
  });

  if (
    conversation?.disappearingMessagesLabel &&
    !timeline.some(
      (msg) =>
        msg.type === "system" &&
        msg.systemType === "disappearing_messages",
    )
  ) {
    timeline.splice(0, 0, {
      id: `${conversationId}_auto_disappearing`,
      from: "system",
      type: "system",
      systemType: "disappearing_messages",
      text: conversation.disappearingMessagesLabel,
      at: timeline[0]?.at,
    });
  }

  return timeline;
}

export function getBaseTime(world: WorldState, deviceId?: string): Date {
  return resolveBaseTime(world, deviceId);
}

export function formatConversationListTimestamp(
  timestampMs: number | undefined,
  baseTime: Date,
): string {
  if (typeof timestampMs !== "number") return "";

  const date = new Date(timestampMs);
  const baseDay = startOfDay(baseTime).getTime();
  const dateDay = startOfDay(date).getTime();
  const diffDays = Math.round((baseDay - dateDay) / 86_400_000);

  if (diffDays === 0) {
    return formatTime(date);
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (date.getFullYear() === baseTime.getFullYear()) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });
  }
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
