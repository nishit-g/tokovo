import {
  expectArray,
  expectObjectRecord,
  expectOneOf,
  expectOptionalBoolean,
  expectOptionalNumber,
  expectOptionalString,
  expectString,
} from "@tokovo/core";
import type {
  PluginBootstrapContract,
  PluginBootstrapValidationResult,
  PluginBootstrapSchemaContext,
} from "@tokovo/core";
import type {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppState,
  WhatsAppStatusUpdate,
  WhatsAppChannel,
  WhatsAppCallLogEntry,
  WhatsAppCommunity,
  WhatsAppAccountProfile,
  WhatsAppSettings,
} from "./types/index.js";
import { hydrateSnapshotMessage } from "./utils/messages.js";

export interface WhatsAppSnapshotConversation extends Omit<
  WhatsAppConversation,
  "messages" | "typing" | "lastMessageAt"
> {
  messages?: unknown[];
  typing?: Record<string, boolean>;
}

export interface WhatsAppSnapshot {
  locale?: WhatsAppState["locale"];
  conversations: WhatsAppSnapshotConversation[];
  statuses?: WhatsAppStatusUpdate[];
  channels?: WhatsAppChannel[];
  callLog?: WhatsAppCallLogEntry[];
  communities?: WhatsAppCommunity[];
  profile?: WhatsAppAccountProfile;
  settings?: WhatsAppSettings;
}

export interface WhatsAppInitialView {
  screen: NonNullable<WhatsAppState["currentScreen"]>;
  conversationId?: string;
  chatFilter?: WhatsAppState["chatFilter"];
}

const WHATSAPP_SCREENS = [
  "chat",
  "chats",
  "updates",
  "calls",
  "communities",
  "settings",
  "profile",
] as const;

const WHATSAPP_MESSAGE_TYPES = [
  "text",
  "image",
  "video",
  "voice",
  "poll",
  "system",
  "gif",
  "link",
  "deleted",
  "sticker",
  "call",
  "call_missed",
  "screenshot_alert",
  "document",
  "contact",
  "location",
] as const;

const AUTHORED_SYSTEM_MESSAGE_TYPES = [
  "member_added",
  "member_removed",
  "admin_change",
  "group_created",
  "group_name_changed",
  "encryption_notice",
  "business_notice",
  "safety_code_changed",
  "disappearing_messages",
  "group_description_changed",
  "group_icon_changed",
  "phone_number_changed",
  "pinned_message",
] as const;

function expectFiniteNumber(
  value: unknown,
  path: string,
  errors: string[],
): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${path} must be a finite number`);
    return null;
  }
  return value;
}

function validateFileSize(
  value: unknown,
  path: string,
  errors: string[],
): void {
  if (typeof value === "string" && value.trim().length > 0) return;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return;
  errors.push(`${path} must be a non-empty string or non-negative byte count`);
}

function validatePollOptions(
  value: unknown,
  path: string,
  errors: string[],
): void {
  const options = expectArray(value, path, errors);
  if (!options) return;
  if (options.length < 2) {
    errors.push(`${path} must contain at least two options`);
  }
  options.forEach((optionValue, index) => {
    const option = expectObjectRecord(
      optionValue,
      `${path}[${index}]`,
      errors,
    );
    if (!option) return;
    expectString(option.text, `${path}[${index}].text`, errors);
    const votes = expectOptionalNumber(
      option.votes,
      `${path}[${index}].votes`,
      errors,
    );
    if (votes !== undefined && (!Number.isFinite(votes) || votes < 0)) {
      errors.push(`${path}[${index}].votes must be a non-negative number`);
    }
  });
}

function validateMessagePayload(
  message: Record<string, unknown>,
  path: string,
  errors: string[],
): void {
  const type = expectOneOf(message.type, WHATSAPP_MESSAGE_TYPES, `${path}.type`, errors);
  if (!type) return;

  switch (type) {
    case "text":
      expectString(message.text, `${path}.text`, errors);
      break;
    case "image":
      expectOptionalString(message.imageUrl, `${path}.imageUrl`, errors);
      expectOptionalString(message.thumbnailUrl, `${path}.thumbnailUrl`, errors);
      break;
    case "video":
      expectOptionalString(message.videoUrl, `${path}.videoUrl`, errors);
      expectOptionalString(message.thumbnailUrl, `${path}.thumbnailUrl`, errors);
      break;
    case "voice": {
      const duration = expectFiniteNumber(message.duration, `${path}.duration`, errors);
      if (duration !== null && duration <= 0) {
        errors.push(`${path}.duration must be greater than zero`);
      }
      break;
    }
    case "poll":
      expectString(message.pollQuestion, `${path}.pollQuestion`, errors);
      validatePollOptions(message.options, `${path}.options`, errors);
      break;
    case "system":
      expectOneOf(
        message.systemType,
        AUTHORED_SYSTEM_MESSAGE_TYPES,
        `${path}.systemType`,
        errors,
      );
      break;
    case "gif":
      expectOptionalString(message.gifUrl, `${path}.gifUrl`, errors);
      break;
    case "link": {
      const preview = expectObjectRecord(
        message.linkPreview,
        `${path}.linkPreview`,
        errors,
      );
      if (preview) {
        expectString(preview.url, `${path}.linkPreview.url`, errors);
      }
      break;
    }
    case "sticker":
      expectOptionalString(message.stickerUrl, `${path}.stickerUrl`, errors);
      break;
    case "call":
    case "call_missed":
      expectOneOf(
        message.callType,
        ["voice", "video"] as const,
        `${path}.callType`,
        errors,
      );
      break;
    case "document":
      expectString(message.fileName, `${path}.fileName`, errors);
      validateFileSize(message.fileSize, `${path}.fileSize`, errors);
      break;
    case "contact":
      expectString(message.contactName, `${path}.contactName`, errors);
      break;
    case "location": {
      const latitude = expectFiniteNumber(message.latitude, `${path}.latitude`, errors);
      const longitude = expectFiniteNumber(message.longitude, `${path}.longitude`, errors);
      if (latitude !== null && (latitude < -90 || latitude > 90)) {
        errors.push(`${path}.latitude must be between -90 and 90`);
      }
      if (longitude !== null && (longitude < -180 || longitude > 180)) {
        errors.push(`${path}.longitude must be between -180 and 180`);
      }
      break;
    }
    case "deleted":
      expectOptionalBoolean(
        message.deletedForEveryone,
        `${path}.deletedForEveryone`,
        errors,
      );
      break;
    case "screenshot_alert":
      expectOptionalString(message.text, `${path}.text`, errors);
      break;
  }
}

function validateWhatsAppSnapshot(
  input: PluginBootstrapSchemaContext<"app_whatsapp">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const root = expectObjectRecord(input.value, "snapshot", errors);
  if (!root) {
    return { errors };
  }

  const conversations = expectArray(
    root.conversations,
    "snapshot.conversations",
    errors,
  );
  if (!conversations) {
    return { errors };
  }

  if (root.locale !== undefined) {
    expectOneOf(
      root.locale,
      ["en-US", "ar"] as const,
      "snapshot.locale",
      errors,
    );
  }

  const seenConversationIds = new Set<string>();

  conversations.forEach((value, index) => {
    const conversation = expectObjectRecord(
      value,
      `snapshot.conversations[${index}]`,
      errors,
    );
    if (!conversation) return;
    expectOptionalBoolean(conversation.isFavorite, `snapshot.conversations[${index}].isFavorite`, errors);

    const id = expectString(
      conversation.id,
      `snapshot.conversations[${index}].id`,
      errors,
    );
    if (id) {
      if (seenConversationIds.has(id)) {
        errors.push(`snapshot.conversations[${index}].id duplicates "${id}"`);
      }
      seenConversationIds.add(id);
    }

    expectOptionalString(
      conversation.name,
      `snapshot.conversations[${index}].name`,
      errors,
    );
    expectOptionalString(
      conversation.avatar,
      `snapshot.conversations[${index}].avatar`,
      errors,
    );
    if (conversation.messages !== null && conversation.messages !== undefined) {
      const messages = expectArray(
        conversation.messages,
        `snapshot.conversations[${index}].messages`,
        errors,
      );
      const seenMessageIds = new Set<string>();
      messages?.forEach((messageValue, messageIndex) => {
        const message = expectObjectRecord(
          messageValue,
          `snapshot.conversations[${index}].messages[${messageIndex}]`,
          errors,
        );
        if (!message) return;
        const messageId = expectString(
          message.id,
          `snapshot.conversations[${index}].messages[${messageIndex}].id`,
          errors,
        );
        if (messageId) {
          if (seenMessageIds.has(messageId)) {
            errors.push(
              `snapshot.conversations[${index}].messages[${messageIndex}].id duplicates "${messageId}"`,
            );
          }
          seenMessageIds.add(messageId);
        }
        expectString(
          message.from,
          `snapshot.conversations[${index}].messages[${messageIndex}].from`,
          errors,
        );
        const messagePath =
          `snapshot.conversations[${index}].messages[${messageIndex}]`;
        validateMessagePayload(message, messagePath, errors);
        if ("isPlaying" in message || "playProgress" in message) {
          errors.push(
            `snapshot.conversations[${index}].messages[${messageIndex}] uses removed voice-only playback fields; declare media lifecycle instead`,
          );
        }
        if (message.media !== undefined) {
          const media = expectObjectRecord(
            message.media,
            `snapshot.conversations[${index}].messages[${messageIndex}].media`,
            errors,
          );
          if (media) {
            expectOneOf(
              media.transferState,
              ["remote", "downloading", "ready", "failed"] as const,
              `snapshot.conversations[${index}].messages[${messageIndex}].media.transferState`,
              errors,
            );
            expectOneOf(
              media.playbackState,
              ["idle", "playing", "paused", "complete"] as const,
              `snapshot.conversations[${index}].messages[${messageIndex}].media.playbackState`,
              errors,
            );
            for (const field of [
              "transferProgress",
              "playbackProgress",
            ] as const) {
              const value = media[field];
              if (
                typeof value !== "number" ||
                !Number.isFinite(value) ||
                value < 0 ||
                value > 1
              ) {
                errors.push(
                  `snapshot.conversations[${index}].messages[${messageIndex}].media.${field} must be a number from 0 to 1`,
                );
              }
            }
          }
        }
      });
    }
  });

  const validateEntities = (
    key: "statuses" | "channels" | "callLog" | "communities",
    requiredStrings: string[],
  ) => {
    if (root[key] === undefined) return;
    const values = expectArray(root[key], `snapshot.${key}`, errors);
    const seenIds = new Set<string>();
    values?.forEach((value, index) => {
      const entity = expectObjectRecord(
        value,
        `snapshot.${key}[${index}]`,
        errors,
      );
      if (!entity) return;
      for (const field of requiredStrings) {
        expectString(
          entity[field],
          `snapshot.${key}[${index}].${field}`,
          errors,
        );
      }
      const id = typeof entity.id === "string" ? entity.id : undefined;
      if (id && seenIds.has(id)) {
        errors.push(`snapshot.${key}[${index}].id duplicates "${id}"`);
      }
      if (id) seenIds.add(id);
    });
  };

  validateEntities("statuses", ["id", "authorId", "authorName"]);
  validateEntities("channels", ["id", "name", "description", "followersLabel"]);
  validateEntities("callLog", ["id", "name", "direction", "mode"]);
  validateEntities("communities", ["id", "name"]);

  const statuses = Array.isArray(root.statuses) ? root.statuses : [];
  statuses.forEach((value, index) => {
    const path = `snapshot.statuses[${index}]`;
    const status = expectObjectRecord(value, path, errors);
    if (!status) return;
    expectFiniteNumber(status.postedAt, `${path}.postedAt`, errors);
    const media = expectObjectRecord(status.media, `${path}.media`, errors);
    if (!media) return;
    const mediaType = expectOneOf(
      media.type,
      ["text", "image", "video"] as const,
      `${path}.media.type`,
      errors,
    );
    if (mediaType === "text") {
      expectString(media.text, `${path}.media.text`, errors);
    } else if (mediaType === "image") {
      expectString(media.src, `${path}.media.src`, errors);
    } else if (mediaType === "video") {
      expectString(media.src, `${path}.media.src`, errors);
      const duration = expectFiniteNumber(
        media.duration,
        `${path}.media.duration`,
        errors,
      );
      if (duration !== null && duration <= 0) {
        errors.push(`${path}.media.duration must be greater than zero`);
      }
    }
  });

  const channels = Array.isArray(root.channels) ? root.channels : [];
  channels.forEach((value, index) => {
    const path = `snapshot.channels[${index}]`;
    const channel = expectObjectRecord(value, path, errors);
    if (!channel) return;
    expectOptionalBoolean(channel.followed, `${path}.followed`, errors);
    const unreadCount = expectOptionalNumber(
      channel.unreadCount,
      `${path}.unreadCount`,
      errors,
    );
    if (unreadCount !== undefined && (!Number.isInteger(unreadCount) || unreadCount < 0)) {
      errors.push(`${path}.unreadCount must be a non-negative integer`);
    }
    if (channel.latestUpdate !== undefined) {
      const update = expectObjectRecord(
        channel.latestUpdate,
        `${path}.latestUpdate`,
        errors,
      );
      if (update) {
        expectString(update.id, `${path}.latestUpdate.id`, errors);
        expectString(update.text, `${path}.latestUpdate.text`, errors);
        expectFiniteNumber(
          update.postedAt,
          `${path}.latestUpdate.postedAt`,
          errors,
        );
      }
    }
  });

  const callLog = Array.isArray(root.callLog) ? root.callLog : [];
  callLog.forEach((value, index) => {
    const path = `snapshot.callLog[${index}]`;
    const call = expectObjectRecord(value, path, errors);
    if (!call) return;
    expectOneOf(
      call.direction,
      ["incoming", "outgoing", "missed"] as const,
      `${path}.direction`,
      errors,
    );
    expectOneOf(
      call.mode,
      ["voice", "video"] as const,
      `${path}.mode`,
      errors,
    );
    expectFiniteNumber(call.startedAt, `${path}.startedAt`, errors);
  });

  const communities = Array.isArray(root.communities) ? root.communities : [];
  communities.forEach((value, index) => {
    const path = `snapshot.communities[${index}]`;
    const community = expectObjectRecord(value, path, errors);
    if (!community) return;
    const groupIds = expectArray(
      community.groupConversationIds,
      `${path}.groupConversationIds`,
      errors,
    );
    groupIds?.forEach((groupId, groupIndex) => {
      expectString(
        groupId,
        `${path}.groupConversationIds[${groupIndex}]`,
        errors,
      );
    });
  });

  return { errors };
}

function validateWhatsAppInitialView(
  input: PluginBootstrapSchemaContext<"app_whatsapp">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(input.value, "initialView", errors);
  if (!view) {
    return { errors };
  }

  expectOneOf(view.screen, WHATSAPP_SCREENS, "initialView.screen", errors);
  expectOptionalString(
    view.conversationId,
    "initialView.conversationId",
    errors,
  );
  if (view.chatFilter !== undefined) {
    expectOneOf(
      view.chatFilter,
      ["all", "unread", "favorites", "groups", "drafts"] as const,
      "initialView.chatFilter",
      errors,
    );
  }

  return { errors };
}

function messageSortValue(message: WhatsAppMessage, index: number): number {
  return (
    message.timestampMs ??
    message.readAt ??
    message.deliveredAt ??
    message.at ??
    index
  );
}

function hydrateConversation(
  conversation: WhatsAppSnapshotConversation,
  baseTime: Date | undefined,
): WhatsAppConversation {
  const members = conversation.members?.map((member) => ({ ...member }));
  const messages = [...(conversation.messages ?? [])]
    .map((message, index) => ({
      message: hydrateSnapshotMessage(message as Record<string, unknown>, {
        baseTime,
      }),
      index,
    }))
    .sort(
      (a, b) =>
        messageSortValue(a.message, a.index) -
        messageSortValue(b.message, b.index),
    )
    .map((entry) => entry.message);
  let lastMessageAt = 0;

  messages.forEach((message, index) => {
    lastMessageAt = Math.max(lastMessageAt, messageSortValue(message, index));
  });

  return {
    ...conversation,
    members,
    type: conversation.type ?? "dm",
    messages,
    typing: { ...(conversation.typing ?? {}) },
    unreadCount: conversation.unreadCount ?? 0,
    isMuted: conversation.isMuted ?? false,
    isPinned: conversation.isPinned ?? false,
    isFavorite: conversation.isFavorite ?? false,
    isArchived: conversation.isArchived ?? false,
    lastMessageAt,
  };
}

export const whatsappBootstrap: PluginBootstrapContract<"app_whatsapp"> = {
  snapshot: {
    currentVersion: 1,
    validate: validateWhatsAppSnapshot,
  },
  view: {
    currentVersion: 1,
    validate: validateWhatsAppInitialView,
  },
  validate(context): PluginBootstrapValidationResult {
    const snapshot = context.snapshot?.snapshot as WhatsAppSnapshot | undefined;
    const initialView = context.initialView?.view as
      | WhatsAppInitialView
      | undefined;
    if (!snapshot) return {};
    const seen = new Set<string>();
    const errors: string[] = [];

    for (const conversation of snapshot.conversations ?? []) {
      if (seen.has(conversation.id)) {
        errors.push(`duplicate WhatsApp conversation id "${conversation.id}"`);
      }
      seen.add(conversation.id);
    }

    if (
      (initialView?.screen === "chat" || initialView?.screen === "profile") &&
      initialView.conversationId &&
      !seen.has(initialView.conversationId)
    ) {
      errors.push(
        `initial view references unknown WhatsApp conversation "${initialView.conversationId}"`,
      );
    }

    for (const community of snapshot.communities ?? []) {
      const referencedConversationIds = [
        community.announcementConversationId,
        ...community.groupConversationIds,
      ].filter((value): value is string => Boolean(value));
      for (const conversationId of referencedConversationIds) {
        if (!seen.has(conversationId)) {
          errors.push(
            `WhatsApp community "${community.id}" references unknown conversation "${conversationId}"`,
          );
        }
      }
    }

    for (const call of snapshot.callLog ?? []) {
      if (call.conversationId && !seen.has(call.conversationId)) {
        errors.push(
          `WhatsApp call "${call.id}" references unknown conversation "${call.conversationId}"`,
        );
      }
    }

    return { errors };
  },
  hydrate(context): WhatsAppState {
    const snapshot = context.snapshot?.snapshot as WhatsAppSnapshot | undefined;
    const initialView = context.initialView?.view as
      | WhatsAppInitialView
      | undefined;
    const baseState = {
      ...(context.baseState as WhatsAppState),
    };
    const rawDeviceTime = context.device.os?.time;
    const baseTime =
      rawDeviceTime instanceof Date
        ? rawDeviceTime
        : typeof rawDeviceTime === "number"
          ? new Date(rawDeviceTime)
          : undefined;

    const conversations = Object.fromEntries(
      (snapshot?.conversations ?? []).map((conversation) => [
        conversation.id,
        hydrateConversation(conversation, baseTime),
      ]),
    );

    baseState.conversations = conversations;
    baseState.locale = snapshot?.locale ?? baseState.locale ?? "en-US";
    baseState.statuses = (snapshot?.statuses ?? []).map((status) => ({
      ...status,
      media: { ...status.media },
    }));
    baseState.channels = (snapshot?.channels ?? []).map((channel) => ({
      ...channel,
      latestUpdate: channel.latestUpdate
        ? { ...channel.latestUpdate }
        : undefined,
    }));
    baseState.callLog = (snapshot?.callLog ?? []).map((entry) => ({
      ...entry,
    }));
    baseState.communities = (snapshot?.communities ?? []).map((community) => ({
      ...community,
      groupConversationIds: [...community.groupConversationIds],
    }));
    baseState.profile = snapshot?.profile
      ? { ...snapshot.profile }
      : baseState.profile;
    baseState.settings = {
      ...(baseState.settings ?? {}),
      ...(snapshot?.settings ?? {}),
    };
    if (initialView) {
      baseState.currentScreen = initialView.screen;
      baseState.chatFilter = initialView.chatFilter ?? "all";
      baseState.conversationId = initialView.conversationId;
      if (initialView.screen === "chat") {
        baseState.viewMode = "CHAT";
      } else {
        baseState.viewMode = "FEED";
      }
    } else {
      baseState.currentScreen ??= "chats";
      baseState.chatFilter ??= "all";
      baseState.conversationId ??= undefined;
      baseState.viewMode ??= "FEED";
    }

    return baseState;
  },
};
