import { WHATSAPP_APP_ID } from "../constants";
import { TimelineEvent, WorldState, ReducerRegistry } from "@tokovo/core";
import {
  WhatsAppMessage,
  WhatsAppConversation,
  WhatsAppState,
  WhatsAppGroupMember,
} from "../types";
import {
  parseWhatsAppEvent,
  type AnyWhatsAppEvent,
  type CustomEvent,
} from "../schemas";
import {
  getHandler,
  type HandlerContext,
  registerAllWhatsAppHandlers,
} from "../handlers";
import {
  GROUP_EVENT_TYPES,
  isWhatsAppGroupEvent,
  isGroupMemberAddPayload,
  isGroupMemberRemovePayload,
  isGroupAdminChangePayload,
} from "../ir/group-ops";

registerAllWhatsAppHandlers();

function getAppState(draft: WorldState): WhatsAppState {
  if (!draft.appState) {
    draft.appState = {};
  }
  if (!draft.appState.app_whatsapp) {
    draft.appState.app_whatsapp = { conversations: {} };
  }
  return draft.appState.app_whatsapp as WhatsAppState;
}

function getConversations(
  draft: WorldState,
): Record<string, WhatsAppConversation> {
  const appState = getAppState(draft);
  if (!appState.conversations) {
    appState.conversations = {};
  }
  return appState.conversations as Record<string, WhatsAppConversation>;
}

function addMessage(
  conversation: WhatsAppConversation,
  message: WhatsAppMessage,
): void {
  conversation.messages.push(message);
  if (!conversation.messagesById) {
    conversation.messagesById = {};
  }
  conversation.messagesById[message.id] = message;
}

function getMessageById(
  conversation: WhatsAppConversation,
  messageId: string,
): WhatsAppMessage | undefined {
  if (conversation.messagesById) {
    return conversation.messagesById[messageId];
  }
  return conversation.messages.find((m) => m.id === messageId);
}

function generateTimestamp(
  frame: number,
  draft: WorldState,
  deviceId?: string,
): string {
  const fps = draft.config?.fps ?? 30;

  let baseHour = 10;
  let baseMinute = 42;

  if (deviceId && draft.devices?.[deviceId]) {
    const osState = draft.devices[deviceId].os;
    if (osState?.clock && typeof osState.clock === "number") {
      const clockDate = new Date(osState.clock);
      baseHour = clockDate.getHours();
      baseMinute = clockDate.getMinutes();
    }
  }

  const totalSeconds = Math.floor(frame / fps);
  const minutesElapsed = totalSeconds;

  const totalMinutes = baseHour * 60 + baseMinute + minutesElapsed;
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function handleCustomOp(draft: WorldState, event: CustomEvent): void {
  const payload = event.payload ?? {};
  const conversationId = payload.conversationId as string | undefined;
  if (!conversationId) return;

  const conversations = getConversations(draft);
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      id: conversationId,
      messages: [],
    };
  }
  const conversation = conversations[conversationId];

  if (!isWhatsAppGroupEvent(event.eventType)) return;

  switch (event.eventType) {
    case GROUP_EVENT_TYPES.MEMBER_ADDED: {
      if (!isGroupMemberAddPayload(event.eventType, payload)) break;

      if (!conversation.members) conversation.members = [];
      if (!conversation.members.find((m) => m.id === payload.member.id)) {
        conversation.members.push({
          id: payload.member.id,
          name: payload.member.name,
          avatar: payload.member.avatar,
        });
      }

      const addedByName = payload.addedBy === "me" ? "You" : payload.addedBy;
      const msg: WhatsAppMessage = {
        id: `sys_${event.at}_added_${payload.member.id}`,
        from: "system",
        type: "system",
        systemType: "member_added",
        text: `${addedByName} added ${payload.member.name}`,
        targetMember: payload.member.name,
        actorName: payload.addedBy,
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case GROUP_EVENT_TYPES.MEMBER_REMOVED: {
      if (!isGroupMemberRemovePayload(event.eventType, payload)) break;

      if (conversation.members) {
        conversation.members = conversation.members.filter(
          (m) => m.id !== payload.memberId,
        );
      }

      const wasMe = payload.memberId === "me";
      const removedByName =
        payload.removedBy === "me" ? "You" : payload.removedBy;

      const text = wasMe
        ? "You left the group"
        : `${removedByName} removed ${payload.memberName}`;

      const msg: WhatsAppMessage = {
        id: `sys_${event.at}_removed_${payload.memberId}`,
        from: "system",
        type: "system",
        systemType: "member_removed",
        text,
        targetMember: payload.memberName,
        actorName: payload.removedBy,
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case GROUP_EVENT_TYPES.ADMIN_CHANGED: {
      if (!isGroupAdminChangePayload(event.eventType, payload)) break;

      if (!conversation.admins) conversation.admins = [];

      if (payload.action === "promote") {
        if (!conversation.admins.includes(payload.memberId)) {
          conversation.admins.push(payload.memberId);
        }
      } else {
        conversation.admins = conversation.admins.filter(
          (id) => id !== payload.memberId,
        );
      }

      const changedByName =
        payload.changedBy === "me" ? "You" : payload.changedBy;
      const memberName = payload.memberName || payload.memberId;
      const action = payload.action === "promote" ? "made" : "removed";
      const role = payload.action === "promote" ? "an admin" : "as admin";

      const msg: WhatsAppMessage = {
        id: `sys_${event.at}_admin_${payload.memberId}`,
        from: "system",
        type: "system",
        systemType: "admin_change",
        text: `${changedByName} ${action} ${memberName} ${role}`,
        targetMember: memberName,
        actorName: payload.changedBy,
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case GROUP_EVENT_TYPES.INFO_UPDATED: {
      const field = payload.field as string;
      const newValue = payload.newValue as string;
      const changedByName =
        (payload.changedBy as string) === "me"
          ? "You"
          : (payload.changedBy as string);

      if (field === "name") {
        conversation.name = newValue;
        const msg: WhatsAppMessage = {
          id: `sys_${event.at}_name_changed`,
          from: "system",
          type: "system",
          systemType: "group_name_changed",
          text: `${changedByName} changed the group name to "${newValue}"`,
          at: event.at,
        };
        addMessage(conversation, msg);
      } else if (field === "avatar") {
        conversation.avatar = newValue;
      }
      break;
    }
  }
}

export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
  const parsed = parseWhatsAppEvent(event);
  if (!parsed) {
    return;
  }

  if (parsed.kind === "Custom") {
    handleCustomOp(draft, parsed);
    return;
  }

  const handler = getHandler(parsed.kind);
  if (!handler) {
    return;
  }

  const conversationId = parsed.conversationId;

  // Some events (like NavigateScreen) don't require a conversationId
  // Handle them with a minimal context
  if (!conversationId) {
    const ctx: HandlerContext = {
      draft,
      event: parsed,
      conversation: { id: "", messages: [] } as WhatsAppConversation,
      addMessage: () => {},
      getMessageById: () => undefined,
      generateTimestamp: (at) => generateTimestamp(at, draft, parsed.deviceId),
    };
    handler(ctx, parsed);
    return;
  }

  const conversations = getConversations(draft);
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      id: conversationId,
      messages: [],
    };
  }
  const conversation = conversations[conversationId];

  const ctx: HandlerContext = {
    draft,
    event: parsed,
    conversation,
    addMessage: (msg) => addMessage(conversation, msg),
    getMessageById: (id) => getMessageById(conversation, id),
    generateTimestamp: (at) => generateTimestamp(at, draft, parsed.deviceId),
  };

  handler(ctx, parsed);
}

ReducerRegistry.registerAppReducer(WHATSAPP_APP_ID, whatsappReducer);
