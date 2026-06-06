import {
  expectArray,
  expectObjectRecord,
  expectOneOf,
  expectOptionalString,
  expectString,
} from "@tokovo/core";
import type {
  PluginBootstrapContract,
  PluginBootstrapSchemaContext,
  PluginBootstrapValidationResult,
} from "@tokovo/core";
import type { IMessageConversation, IMessageMessage, IMessageState } from "./types/index.js";

export interface IMessageSnapshotConversation
  extends Omit<IMessageConversation, "messages" | "messagesById" | "typing" | "lastMessageAt"> {
  messages?: IMessageMessage[];
  typing?: Record<string, boolean>;
}

export interface IMessageSnapshot {
  conversations: IMessageSnapshotConversation[];
}

export interface IMessageInitialView {
  screen: NonNullable<IMessageState["currentScreen"]>;
  conversationId?: string;
  themeMode?: IMessageState["themeMode"];
}

const IMESSAGE_SCREENS = ["list", "chat", "info", "media"] as const;
const IMESSAGE_THEME_MODES = ["light", "dark"] as const;

function validateIMessageSnapshot(
  input: PluginBootstrapSchemaContext<"app_imessage">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const snapshot = expectObjectRecord(input.value, "snapshot", errors);
  if (!snapshot) {
    return { errors };
  }

  const conversations = expectArray(snapshot.conversations, "snapshot.conversations", errors);
  if (!conversations) {
    return { errors };
  }

  const conversationIds = new Set<string>();

  conversations.forEach((value, index) => {
    const conversation = expectObjectRecord(
      value,
      `snapshot.conversations[${index}]`,
      errors,
    );
    if (!conversation) return;

    const id = expectString(conversation.id, `snapshot.conversations[${index}].id`, errors);
    const participants = expectArray(
      conversation.participants,
      `snapshot.conversations[${index}].participants`,
      errors,
    );
    participants?.forEach((participant, participantIndex) => {
      expectString(
        participant,
        `snapshot.conversations[${index}].participants[${participantIndex}]`,
        errors,
      );
    });

    if (id) {
      if (conversationIds.has(id)) {
        errors.push(`snapshot.conversations[${index}].id duplicates "${id}"`);
      }
      conversationIds.add(id);
    }

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
        expectString(
          message.id,
          `snapshot.conversations[${index}].messages[${messageIndex}].id`,
          errors,
        );
        expectOptionalString(
          message.sender,
          `snapshot.conversations[${index}].messages[${messageIndex}].sender`,
          errors,
        );
      });
    }
  });

  return { errors };
}

function validateIMessageInitialView(
  input: PluginBootstrapSchemaContext<"app_imessage">,
): PluginBootstrapValidationResult {
  const errors: string[] = [];
  const view = expectObjectRecord(input.value, "initialView", errors);
  if (!view) {
    return { errors };
  }

  expectOneOf(view.screen, IMESSAGE_SCREENS, "initialView.screen", errors);
  expectOptionalString(view.conversationId, "initialView.conversationId", errors);
  if (view.themeMode !== null && view.themeMode !== undefined) {
    expectOneOf(view.themeMode, IMESSAGE_THEME_MODES, "initialView.themeMode", errors);
  }

  return { errors };
}

function hydrateConversation(
  conversation: IMessageSnapshotConversation,
): IMessageConversation {
  const messages = [...(conversation.messages ?? [])].sort(
    (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
  );
  const messagesById = Object.fromEntries(messages.map((message) => [message.id, message]));
  return {
    ...conversation,
    transport: conversation.transport ?? "imessage",
    participants: [...conversation.participants],
    messages,
    messagesById,
    typing: { ...(conversation.typing ?? {}) },
    unreadCount: conversation.unreadCount ?? 0,
    isGroup: conversation.isGroup ?? false,
    lastMessageAt: messages[messages.length - 1]?.timestamp,
  };
}

export const iMessageBootstrap: PluginBootstrapContract<"app_imessage"> = {
  snapshot: {
    currentVersion: 1,
    validate: validateIMessageSnapshot,
  },
  view: {
    currentVersion: 1,
    validate: validateIMessageInitialView,
  },
  validate(context): PluginBootstrapValidationResult {
    const snapshot = context.snapshot?.snapshot as IMessageSnapshot | undefined;
    const initialView = context.initialView?.view as IMessageInitialView | undefined;
    const errors: string[] = [];
    const conversationIds = new Set((snapshot?.conversations ?? []).map((conversation) => conversation.id));

    if (
      initialView?.conversationId &&
      !conversationIds.has(initialView.conversationId)
    ) {
      errors.push(
        `initialView.conversationId references unknown conversation "${initialView.conversationId}"`,
      );
    }

    return { errors };
  },
  hydrate(context): IMessageState {
    const snapshot = context.snapshot?.snapshot as IMessageSnapshot | undefined;
    const initialView = context.initialView?.view as IMessageInitialView | undefined;
    const state: IMessageState = {
      ...(context.baseState as IMessageState),
      conversations: Object.fromEntries(
        (snapshot?.conversations ?? []).map((conversation) => [
          conversation.id,
          hydrateConversation(conversation),
        ]),
      ),
    };

    if (initialView) {
      state.currentScreen = initialView.screen;
      state.activeConversationId = initialView.conversationId;
      state.themeMode = initialView.themeMode ?? state.themeMode;
      state.viewMode =
        initialView.screen === "chat"
          ? "CHAT"
          : initialView.screen === "info" || initialView.screen === "media"
            ? "FULLSCREEN"
            : "FEED";
      state.conversationId = initialView.screen === "chat" ? initialView.conversationId : undefined;
    }

    return state;
  },
};
