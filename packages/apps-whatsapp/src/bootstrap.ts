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
import type { WhatsAppConversation, WhatsAppMessage, WhatsAppState } from "./types/index.js";
import { normalizeMessage } from "./utils/messages.js";

export interface WhatsAppSnapshotConversation
  extends Omit<WhatsAppConversation, "messages" | "messagesById" | "typing" | "lastMessageAt"> {
  messages?: unknown[];
  typing?: Record<string, boolean>;
}

export interface WhatsAppSnapshot {
  conversations: WhatsAppSnapshotConversation[];
}

export interface WhatsAppInitialView {
  screen: NonNullable<WhatsAppState["currentScreen"]>;
  conversationId?: string;
}

const WHATSAPP_SCREENS = [
  "main",
  "chat",
  "chats",
  "updates",
  "status",
  "calls",
  "communities",
  "settings",
  "profile",
] as const;

function validateWhatsAppSnapshot(
  input: PluginBootstrapSchemaContext<"app_whatsapp">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const root = expectObjectRecord(input.value, "snapshot", errors);
  if (!root) {
    return { errors };
  }

  const conversations = expectArray(root.conversations, "snapshot.conversations", errors);
  if (!conversations) {
    return { errors };
  }

  const seenConversationIds = new Set<string>();

  conversations.forEach((value, index) => {
    const conversation = expectObjectRecord(
      value,
      `snapshot.conversations[${index}]`,
      errors,
    );
    if (!conversation) return;

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
    expectOptionalBoolean(
      conversation.hasStatus,
      `snapshot.conversations[${index}].hasStatus`,
      errors,
    );
    expectOptionalBoolean(
      conversation.isChannel,
      `snapshot.conversations[${index}].isChannel`,
      errors,
    );
    expectOptionalBoolean(
      conversation.isFollowed,
      `snapshot.conversations[${index}].isFollowed`,
      errors,
    );
    expectOptionalBoolean(
      conversation.isVerifiedBusiness,
      `snapshot.conversations[${index}].isVerifiedBusiness`,
      errors,
    );
    expectOptionalString(
      conversation.channelDescription,
      `snapshot.conversations[${index}].channelDescription`,
      errors,
    );
    expectOptionalString(
      conversation.channelLatestSnippet,
      `snapshot.conversations[${index}].channelLatestSnippet`,
      errors,
    );
    expectOptionalString(
      conversation.channelFollowersLabel,
      `snapshot.conversations[${index}].channelFollowersLabel`,
      errors,
    );
    expectOptionalString(
      conversation.channelCategory,
      `snapshot.conversations[${index}].channelCategory`,
      errors,
    );
    expectOptionalNumber(
      conversation.channelUnreadCount,
      `snapshot.conversations[${index}].channelUnreadCount`,
      errors,
    );

    if (conversation.messages !== null && conversation.messages !== undefined) {
      const messages = expectArray(
        conversation.messages,
        `snapshot.conversations[${index}].messages`,
        errors,
      );
      messages?.forEach((messageValue, messageIndex) => {
        const message = expectObjectRecord(
          messageValue,
          `snapshot.conversations[${index}].messages[${messageIndex}]`,
          errors,
        );
        if (!message) return;
        expectOptionalString(
          message.id,
          `snapshot.conversations[${index}].messages[${messageIndex}].id`,
          errors,
        );
        expectOptionalString(
          message.from,
          `snapshot.conversations[${index}].messages[${messageIndex}].from`,
          errors,
        );
        expectOptionalString(
          message.type,
          `snapshot.conversations[${index}].messages[${messageIndex}].type`,
          errors,
        );
      });
    }
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
  expectOptionalString(view.conversationId, "initialView.conversationId", errors);

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
  const messages = [...(conversation.messages ?? [])]
    .map((message, index) => ({
      message: normalizeMessage(
        message as Record<string, unknown>,
        {
          conversationId: conversation.id,
          index,
          baseTime,
        },
      ),
      index,
    }))
    .sort((a, b) => messageSortValue(a.message, a.index) - messageSortValue(b.message, b.index))
    .map((entry) => entry.message);
  const messagesById: Record<string, WhatsAppMessage> = {};
  let lastMessageAt = 0;

  messages.forEach((message, index) => {
    messagesById[message.id] = message;
    lastMessageAt = Math.max(lastMessageAt, messageSortValue(message, index));
  });

  return {
    ...conversation,
    type: conversation.type ?? "dm",
    messages,
    messagesById,
    typing: { ...(conversation.typing ?? {}) },
    unreadCount: conversation.unreadCount ?? 0,
    isMuted: conversation.isMuted ?? false,
    isPinned: conversation.isPinned ?? false,
    hasStatus: conversation.hasStatus ?? false,
    isArchived: conversation.isArchived ?? false,
    isLocked: conversation.isLocked ?? false,
    isVerifiedBusiness: conversation.isVerifiedBusiness ?? false,
    isChannel: conversation.isChannel ?? false,
    isFollowed: conversation.isFollowed ?? false,
    channelUnreadCount: conversation.channelUnreadCount ?? 0,
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
    const initialView = context.initialView?.view as WhatsAppInitialView | undefined;
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
      initialView?.screen === "chat" &&
      initialView.conversationId &&
      !seen.has(initialView.conversationId)
    ) {
      errors.push(
        `initial view references unknown WhatsApp conversation "${initialView.conversationId}"`,
      );
    }

    return { errors };
  },
  hydrate(context): WhatsAppState {
    const snapshot = context.snapshot?.snapshot as WhatsAppSnapshot | undefined;
    const initialView = context.initialView?.view as WhatsAppInitialView | undefined;
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
    if (initialView) {
      baseState.currentScreen = initialView.screen;
      baseState.currentConversationId = initialView.conversationId;
      if (initialView.screen === "chat") {
        baseState.conversationId = initialView.conversationId;
        baseState.viewMode = "CHAT";
      } else {
        baseState.conversationId = undefined;
        baseState.viewMode = "FEED";
      }
    } else {
      baseState.currentScreen ??= "chats";
      baseState.conversationId ??= undefined;
      baseState.viewMode ??= "FEED";
    }

    return baseState;
  },
};
