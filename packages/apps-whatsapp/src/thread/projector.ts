import type {
  ReplyToData,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppReaction,
  WhatsAppSystemMessageType,
} from "../types/index.js";
import {
  resolveParticipantName,
  resolveReplyPreview,
} from "../utils/participants.js";
import type { WhatsAppLocale } from "../localization/index.js";
import {
  formatWhatsAppNumber,
  translateWhatsApp,
} from "../localization/index.js";

const RUN_GAP_MS = 60_000;
const LOCAL_ACTOR_IDS = new Set(["me"]);

export type MessageRunPosition = "single" | "start" | "middle" | "end";
export type ReplyResolution = "resolved" | "snapshot" | "missing";

export interface ProjectedReply extends ReplyToData {
  resolution: ReplyResolution;
}

export interface ProjectedThreadMessage extends WhatsAppMessage {
  senderName?: string;
  replyTo?: ProjectedReply;
  reactions?: WhatsAppReaction[];
}

export interface ThreadMessageItem {
  kind: "message";
  message: ProjectedThreadMessage;
  order: number;
  isMe: boolean;
  position: MessageRunPosition;
  showSenderName: boolean;
}

export interface ThreadMessageRun {
  kind: "run";
  id: string;
  senderId: string;
  isMe: boolean;
  items: ThreadMessageItem[];
}

export interface ThreadSystemBlock {
  kind: "system";
  id: string;
  order: number;
  message: ProjectedThreadMessage;
}

export type WhatsAppThreadBlock = ThreadMessageRun | ThreadSystemBlock;

export interface WhatsAppThreadProjection {
  conversationId: string;
  blocks: WhatsAppThreadBlock[];
  messagesById: ReadonlyMap<string, ProjectedThreadMessage>;
  messageCount: number;
}

export interface ProjectWhatsAppThreadInput {
  conversationId: string;
  messages: readonly WhatsAppMessage[];
  conversation?: WhatsAppConversation;
  ownerName?: string;
  baseTime: Date;
  fps: number;
  locale: WhatsAppLocale;
}

interface OrderedMessage {
  message: WhatsAppMessage;
  authoredIndex: number;
  effectiveTimeMs?: number;
}

interface ProjectionCacheEntry {
  messages: readonly WhatsAppMessage[];
  variantKey: string;
  projection: WhatsAppThreadProjection;
}

const projectionCache = new WeakMap<WhatsAppConversation, ProjectionCacheEntry>();

function projectionVariantKey(input: ProjectWhatsAppThreadInput, fps: number): string {
  return [
    input.conversationId,
    input.ownerName ?? "",
    input.baseTime.getTime(),
    fps,
    input.locale,
  ].join("|");
}

function normalizeActor(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isLocalActor(actor: string, ownerName: string | undefined): boolean {
  const normalized = normalizeActor(actor);
  const normalizedOwner = normalizeActor(ownerName);
  return (
    LOCAL_ACTOR_IDS.has(normalized) ||
    (normalizedOwner.length > 0 && normalized === normalizedOwner)
  );
}

function isSystemMessage(message: WhatsAppMessage): boolean {
  return message.type === "system" || message.type === "screenshot_alert";
}

function getEffectiveTimeMs(
  message: WhatsAppMessage,
  baseTime: Date,
  fps: number,
): number | undefined {
  if (Number.isFinite(message.timestampMs)) {
    return message.timestampMs;
  }
  if (Number.isFinite(message.at)) {
    return baseTime.getTime() + Math.floor(((message.at ?? 0) / fps) * 1000);
  }
  return undefined;
}

function orderMessages(
  messages: readonly WhatsAppMessage[],
  baseTime: Date,
  fps: number,
): OrderedMessage[] {
  const seenIds = new Set<string>();
  const ordered = messages.map((message, authoredIndex): OrderedMessage => {
    if (!message.id || message.id.trim().length === 0) {
      throw new Error(`WhatsApp message at index ${authoredIndex} has no id`);
    }
    if (seenIds.has(message.id)) {
      throw new Error(`Duplicate WhatsApp message id "${message.id}"`);
    }
    seenIds.add(message.id);
    return {
      message,
      authoredIndex,
      effectiveTimeMs: getEffectiveTimeMs(message, baseTime, fps),
    };
  });

  return ordered.sort((left, right) => {
    if (
      left.effectiveTimeMs !== undefined &&
      right.effectiveTimeMs !== undefined &&
      left.effectiveTimeMs !== right.effectiveTimeMs
    ) {
      return left.effectiveTimeMs - right.effectiveTimeMs;
    }
    return left.authoredIndex - right.authoredIndex;
  });
}

function normalizeReactions(
  reactions: readonly WhatsAppReaction[] | undefined,
): WhatsAppReaction[] | undefined {
  if (!reactions?.length) return undefined;

  const byEmoji = new Map<string, WhatsAppReaction>();
  for (const reaction of reactions) {
    const emoji = reaction.emoji.trim();
    if (!emoji || !Number.isFinite(reaction.count) || reaction.count <= 0) {
      continue;
    }
    const existing = byEmoji.get(emoji);
    byEmoji.set(emoji, {
      emoji,
      count: (existing?.count ?? 0) + Math.floor(reaction.count),
      fromMe: Boolean(existing?.fromMe || reaction.fromMe),
    });
  }

  return byEmoji.size > 0 ? [...byEmoji.values()] : undefined;
}

function getReplyFallbackText(
  message: WhatsAppMessage,
  locale: WhatsAppLocale,
): string | undefined {
  if (message.text) return message.text;
  if (message.caption) return message.caption;
  switch (message.type) {
    case "image":
      return translateWhatsApp(locale, "message.photo");
    case "video":
      return translateWhatsApp(locale, "message.video");
    case "voice":
      return translateWhatsApp(locale, "message.voice");
    case "gif":
      return translateWhatsApp(locale, "message.gif");
    case "sticker":
      return translateWhatsApp(locale, "message.sticker");
    case "document":
      return message.fileName ?? translateWhatsApp(locale, "message.document");
    case "contact":
      return message.contactName ?? translateWhatsApp(locale, "message.contact");
    case "location":
      return message.locationName ?? translateWhatsApp(locale, "message.location");
    case "poll":
      return message.pollQuestion ?? translateWhatsApp(locale, "message.poll");
    case "deleted":
      return translateWhatsApp(locale, "message.deleted");
    default:
      return undefined;
  }
}

function getReplyThumbnail(message: WhatsAppMessage): string | undefined {
  if (message.type === "image") return message.imageUrl;
  if (message.type === "video") return message.thumbnailUrl;
  if (message.type === "gif") return message.gifUrl;
  if (message.type === "sticker") return message.stickerUrl;
  if (message.type === "location") return message.mapThumbnailUrl;
  if (message.type === "contact") return message.contactAvatarUrl;
  return undefined;
}

function projectReply(
  replyTo: ReplyToData | undefined,
  messagesById: ReadonlyMap<string, WhatsAppMessage>,
  conversation: WhatsAppConversation | undefined,
  locale: WhatsAppLocale,
): ProjectedReply | undefined {
  if (!replyTo) return undefined;

  const target = messagesById.get(replyTo.messageId);
  const resolved = resolveReplyPreview(conversation, replyTo);

  if (target) {
    return {
      ...resolved,
      messageId: target.id,
      text: resolved?.text ?? getReplyFallbackText(target, locale),
      from:
        resolved?.from ??
        resolveParticipantName(conversation, target.senderName ?? target.from),
      type: resolved?.type ?? target.type,
      thumbnailUrl: resolved?.thumbnailUrl ?? getReplyThumbnail(target),
      resolution: "resolved",
    };
  }

  const hasSnapshot = Boolean(
    resolved?.text || resolved?.from || resolved?.type || resolved?.thumbnailUrl,
  );
  return {
    ...resolved,
    messageId: replyTo.messageId,
    resolution: hasSnapshot ? "snapshot" : "missing",
  };
}

function projectMessage(
  message: WhatsAppMessage,
  messagesById: ReadonlyMap<string, WhatsAppMessage>,
  conversation: WhatsAppConversation | undefined,
  locale: WhatsAppLocale,
): ProjectedThreadMessage {
  const participantName = resolveParticipantName(
    conversation,
    message.senderName ?? message.from,
  );
  return {
    ...message,
    senderName: participantName ?? message.senderName,
    replyTo: projectReply(message.replyTo, messagesById, conversation, locale),
    reactions: normalizeReactions(message.reactions),
  };
}

function startOfUtcDay(value: Date): number {
  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

function formatDateLabel(
  value: Date,
  baseTime: Date,
  locale: WhatsAppLocale,
): string {
  const dayDelta = Math.round(
    (startOfUtcDay(baseTime) - startOfUtcDay(value)) / 86_400_000,
  );
  if (dayDelta === 0) return translateWhatsApp(locale, "status.today");
  if (dayDelta === 1) return translateWhatsApp(locale, "status.yesterday");
  const monthNames =
    locale === "ar"
      ? [
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ]
      : [
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
  const year =
    value.getUTCFullYear() === baseTime.getUTCFullYear()
      ? ""
      : ` ${formatWhatsAppNumber(locale, value.getUTCFullYear())}`;
  return `${formatWhatsAppNumber(locale, value.getUTCDate())} ${monthNames[value.getUTCMonth()]}${year}`;
}

function createSystemMessage(
  id: string,
  systemType: WhatsAppSystemMessageType,
  text: string,
  at?: number,
): WhatsAppMessage {
  return { id, from: "system", type: "system", systemType, text, at };
}

function decorateTimeline(
  ordered: readonly OrderedMessage[],
  input: ProjectWhatsAppThreadInput,
): OrderedMessage[] {
  const hasDisappearingBanner = ordered.some(
    ({ message }) =>
      message.type === "system" &&
      message.systemType === "disappearing_messages",
  );
  const hasEncryptionBanner = ordered.some(
    ({ message }) =>
      message.type === "system" && message.systemType === "encryption_notice",
  );
  const hasBusinessBanner = ordered.some(
    ({ message }) =>
      message.type === "system" && message.systemType === "business_notice",
  );
  const hasSafetyCodeBanner = ordered.some(
    ({ message }) =>
      message.type === "system" && message.systemType === "safety_code_changed",
  );
  const unreadCount = Math.max(0, input.conversation?.unreadCount ?? 0);
  const authoredUnreadId = input.conversation?.unreadDividerMessageId;
  let unreadTargetId = authoredUnreadId;

  if (!unreadTargetId && unreadCount > 0) {
    const incoming = ordered.filter(
      ({ message }) =>
        !isSystemMessage(message) &&
        !isLocalActor(message.from, input.ownerName),
    );
    unreadTargetId = incoming[Math.max(0, incoming.length - unreadCount)]?.message.id;
  }

  const timeline: OrderedMessage[] = [];
  let lastDateKey: string | undefined;

  if (input.conversation?.trust?.endToEndEncrypted && !hasEncryptionBanner) {
    const message = createSystemMessage(
      `${input.conversationId}:system:encryption`,
      "encryption_notice",
      translateWhatsApp(input.locale, "system.encryptionBody"),
      ordered[0]?.message.at,
    );
    timeline.push({
      message,
      authoredIndex: -5,
      effectiveTimeMs: ordered[0]?.effectiveTimeMs,
    });
  }

  if (input.conversation?.trust?.businessNotice && !hasBusinessBanner) {
    const message = createSystemMessage(
      `${input.conversationId}:system:business`,
      "business_notice",
      input.conversation.trust.businessNotice,
      ordered[0]?.message.at,
    );
    timeline.push({
      message,
      authoredIndex: -4,
      effectiveTimeMs: ordered[0]?.effectiveTimeMs,
    });
  }

  if (input.conversation?.trust?.safetyCodeNotice && !hasSafetyCodeBanner) {
    const message = createSystemMessage(
      `${input.conversationId}:system:safety-code`,
      "safety_code_changed",
      input.conversation.trust.safetyCodeNotice,
      ordered[0]?.message.at,
    );
    timeline.push({
      message,
      authoredIndex: -3,
      effectiveTimeMs: ordered[0]?.effectiveTimeMs,
    });
  }

  if (
    input.conversation?.preferences?.disappearingMessages &&
    !hasDisappearingBanner
  ) {
    const message = createSystemMessage(
      `${input.conversationId}:system:disappearing`,
      "disappearing_messages",
      translateWhatsApp(input.locale, "system.disappearingAfter", {
        duration: input.conversation.preferences.disappearingMessages,
      }),
      ordered[0]?.message.at,
    );
    timeline.push({
      message,
      authoredIndex: -2,
      effectiveTimeMs: ordered[0]?.effectiveTimeMs,
    });
  }

  ordered.forEach((entry) => {
    const { message, effectiveTimeMs } = entry;
    if (effectiveTimeMs !== undefined) {
      const value = new Date(effectiveTimeMs);
      const dateKey = startOfUtcDay(value).toString();
      if (dateKey !== lastDateKey) {
        const dateMessage = createSystemMessage(
          `${input.conversationId}:system:date:${dateKey}`,
          "date_change",
          formatDateLabel(value, input.baseTime, input.locale),
          message.at,
        );
        timeline.push({
          message: dateMessage,
          authoredIndex: entry.authoredIndex - 0.2,
          effectiveTimeMs,
        });
        lastDateKey = dateKey;
      }
    }

    if (message.id === unreadTargetId) {
      const unreadMessage = createSystemMessage(
        `${input.conversationId}:system:unread:${message.id}`,
        "unread_divider",
        translateWhatsApp(input.locale, "system.unreadMessages"),
        message.at,
      );
      timeline.push({
        message: unreadMessage,
        authoredIndex: entry.authoredIndex - 0.1,
        effectiveTimeMs,
      });
    }
    timeline.push(entry);
  });

  return timeline;
}

function canContinueRun(
  previous: OrderedMessage,
  next: OrderedMessage,
  previousSenderId: string,
  nextSenderId: string,
): boolean {
  if (previousSenderId !== nextSenderId) return false;
  if (
    previous.effectiveTimeMs === undefined ||
    next.effectiveTimeMs === undefined
  ) {
    return true;
  }
  const gap = next.effectiveTimeMs - previous.effectiveTimeMs;
  return gap >= 0 && gap < RUN_GAP_MS;
}

function assignRunPositions(run: ThreadMessageRun): void {
  if (run.items.length === 1) {
    run.items[0].position = "single";
    return;
  }
  run.items.forEach((item, index) => {
    item.position =
      index === 0 ? "start" : index === run.items.length - 1 ? "end" : "middle";
  });
}

export function projectWhatsAppThread(
  input: ProjectWhatsAppThreadInput,
): WhatsAppThreadProjection {
  const fps = Number.isFinite(input.fps) && input.fps > 0 ? input.fps : 30;
  const variantKey = projectionVariantKey(input, fps);
  if (input.conversation) {
    const cached = projectionCache.get(input.conversation);
    if (
      cached &&
      cached.messages === input.messages &&
      cached.variantKey === variantKey
    ) {
      return cached.projection;
    }
  }
  const ordered = orderMessages(input.messages, input.baseTime, fps);
  const sourceById = new Map(
    ordered.map(({ message }) => [message.id, message] as const),
  );
  const timeline = decorateTimeline(ordered, { ...input, fps });
  const projectedById = new Map<string, ProjectedThreadMessage>();
  const blocks: WhatsAppThreadBlock[] = [];
  let activeRun: ThreadMessageRun | undefined;
  let previousEntry: OrderedMessage | undefined;
  let order = 0;

  for (const entry of timeline) {
    const message = projectMessage(
      entry.message,
      sourceById,
      input.conversation,
      input.locale,
    );
    projectedById.set(message.id, message);

    if (isSystemMessage(message)) {
      if (activeRun) assignRunPositions(activeRun);
      activeRun = undefined;
      blocks.push({ kind: "system", id: message.id, order, message });
      previousEntry = entry;
      order += 1;
      continue;
    }

    const isMe = isLocalActor(message.from, input.ownerName);
    const senderId = isMe ? "me" : normalizeActor(message.from);
    const shouldContinue =
      activeRun &&
      previousEntry &&
      canContinueRun(previousEntry, entry, activeRun.senderId, senderId);

    if (!shouldContinue) {
      if (activeRun) assignRunPositions(activeRun);
      activeRun = {
        kind: "run",
        id: `run:${message.id}`,
        senderId,
        isMe,
        items: [],
      };
      blocks.push(activeRun);
    }

    const run = activeRun;
    if (!run) {
      throw new Error(`Failed to create WhatsApp message run for "${message.id}"`);
    }
    run.items.push({
      kind: "message",
      message,
      order,
      isMe,
      position: "single",
      showSenderName:
        Boolean(input.conversation?.type === "group" && !isMe) &&
        run.items.length === 0,
    });
    previousEntry = entry;
    order += 1;
  }

  if (activeRun) assignRunPositions(activeRun);

  const projection: WhatsAppThreadProjection = {
    conversationId: input.conversationId,
    blocks,
    messagesById: projectedById,
    messageCount: order,
  };
  if (input.conversation) {
    projectionCache.set(input.conversation, {
      messages: input.messages,
      variantKey,
      projection,
    });
  }
  return projection;
}
