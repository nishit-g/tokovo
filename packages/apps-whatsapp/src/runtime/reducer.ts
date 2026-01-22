/**
 * WhatsApp Runtime Reducer
 *
 * Handles all WhatsApp-specific events.
 * Uses explicit type checking for safer event handling.
 *
 * Message types supported:
 * - text: Regular text messages
 * - image: Image with optional caption
 * - video: Video with thumbnail and duration
 * - gif: Animated GIF
 * - voice: Voice note with waveform
 * - system: System messages (member added/removed, etc.)
 * - deleted: Deleted message placeholder
 * - call_missed: Missed call indicator
 * - screenshot_alert: Screenshot notification
 */

import {
  TimelineEvent,
  WorldState,
  ReducerRegistry,
  APP_IDS,
} from "@tokovo/core";

// Import WhatsApp-specific types (all app types now live in plugin)
import {
  WhatsAppMessage,
  WhatsAppConversation,
  WhatsAppState,
  WhatsAppMessageType,
  WhatsAppGroupMember,
} from "../types";

// Import group operation types
import {
  GROUP_EVENT_TYPES,
  isWhatsAppGroupEvent,
  isGroupMemberAddPayload,
  isGroupMemberRemovePayload,
  isGroupAdminChangePayload,
  GroupMemberAddPayload,
  GroupMemberRemovePayload,
  GroupAdminChangePayload,
} from "../ir/group-ops";

// =============================================================================
// TYPE-SAFE ACCESSORS
// =============================================================================

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
  (conversation.messages as any[]).push(message);
  if (!conversation.messagesById) {
    conversation.messagesById = {};
  }
  (conversation.messagesById as Record<string, WhatsAppMessage>)[message.id] =
    message;
}

function getMessageById(
  conversation: WhatsAppConversation,
  messageId: string,
): WhatsAppMessage | undefined {
  if (conversation.messagesById) {
    return (conversation.messagesById as Record<string, WhatsAppMessage>)[
      messageId
    ];
  }
  return (conversation.messages as WhatsAppMessage[]).find(
    (m) => m.id === messageId,
  );
}

/**
 * Generate a realistic timestamp string from frame number.
 *
 * ENTERPRISE PATTERN: Frame-based time simulation using world config
 * - FPS: Read from world.config.fps (defaults to 30)
 * - Base time: Read from device OS clock (defaults to 10:42)
 * - Progression: 1 timeline second = 1 story minute
 *
 * Example at 30fps from 10:42 base:
 * - frame 0   (0s timeline)  → 10:42
 * - frame 90  (3s timeline)  → 10:45 (3 min later)
 * - frame 750 (25s timeline) → 11:07 (25 min later)
 *
 * @param frame - Current frame number
 * @param draft - WorldState to read config from
 * @param deviceId - Device ID to get OS clock from (optional)
 */
function generateTimestamp(
  frame: number,
  draft: WorldState,
  deviceId?: string,
): string {
  // Get FPS from config (enterprise pattern - no hardcoding!)
  const fps = draft.config?.fps ?? 30;

  // Try to get base time from device OS clock
  let baseTime: Date;
  if (deviceId && draft.devices?.[deviceId]?.os?.clock) {
    baseTime = new Date(draft.devices[deviceId].os!.clock);
  } else {
    // Fallback: use 10:42 as default
    baseTime = new Date("2024-01-01T10:42:00");
  }

  const baseHour = baseTime.getHours();
  const baseMinute = baseTime.getMinutes();

  // Convert frames to "story minutes": 1 timeline second = 1 story minute
  const timelineSeconds = frame / fps;
  const storyMinutesElapsed = Math.floor(timelineSeconds);

  // Calculate final time
  const totalMinutes = baseMinute + storyMinutesElapsed;
  const hours = (baseHour + Math.floor(totalMinutes / 60)) % 24; // Wrap at 24h
  const minutes = totalMinutes % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * WhatsApp reducer - handles all WhatsApp events
 */
export function whatsappReducer(draft: WorldState, event: TimelineEvent): void {
  const e = event as any;

  if (e.kind === "Custom") {
    handleCustomOp(draft, e);
    return;
  }

  const v2KindToType: Record<string, string> = {
    MessageReceived: "MESSAGE_RECEIVED",
    MessageSent: "MESSAGE_SENT",
    TypingStarted: "TYPING_START",
    TypingEnded: "TYPING_END",
    ImageReceived: "IMAGE_RECEIVED",
    ImageSent: "IMAGE_SENT",
    VideoReceived: "VIDEO_RECEIVED",
    VideoSent: "VIDEO_SENT",
    VoiceReceived: "VOICE_RECEIVED",
    VoiceSent: "VOICE_SENT",
    GifReceived: "GIF_RECEIVED",
    GifSent: "GIF_SENT",
    StickerReceived: "STICKER_RECEIVED",
    StickerSent: "STICKER_SENT",
    DocumentReceived: "DOCUMENT_RECEIVED",
    DocumentSent: "DOCUMENT_SENT",
    ContactReceived: "CONTACT_RECEIVED",
    ContactSent: "CONTACT_SENT",
    LocationReceived: "LOCATION_RECEIVED",
    LocationSent: "LOCATION_SENT",
    React: "REACT",
    ReadMessages: "READ_MESSAGES",
    MessageDeleted: "MESSAGE_DELETED",
    MessageEdited: "MESSAGE_EDITED",
    MessageForwarded: "MESSAGE_FORWARDED",
    DateSeparator: "DATE_SEPARATOR",
    ConversationOpened: "CONVERSATION_OPENED",
    NavigateScreen: "NAVIGATE_SCREEN",
  };

  const eventType = v2KindToType[event.kind as string];
  if (!eventType) return;

  if (e.appId && e.appId !== APP_IDS.WHATSAPP) return;

  const conversationId: string | undefined = e.conversationId;

  if (
    eventType === "NAVIGATE_SCREEN" ||
    eventType === "SCREEN_NAVIGATED" ||
    eventType === "GO_BACK"
  ) {
    const appState = getAppState(draft);
    const payload = e.payload || {};

    const screen = payload.screen || e.screen || "chat";
    appState.screen = screen;
    appState.currentScreen = screen;

    if (screen === "chats" || screen === "chatList") {
      appState.viewMode = "LIST";
    } else if (screen === "chat") {
      appState.viewMode = "CHAT";
    } else {
      appState.viewMode = "TRANSITION";
    }

    appState.statusBarTheme = "dark";

    if (payload.conversationId || conversationId) {
      appState.conversationId = payload.conversationId || conversationId;
    }

    return;
  }

  if (eventType === "CONVERSATION_OPENED") {
    const appState = getAppState(draft);
    const payload = e.payload || {};
    const targetConversationId = payload.conversationId || conversationId;

    if (targetConversationId) {
      appState.conversationId = targetConversationId;
      appState.screen = "chat";
      appState.currentScreen = "chat";
      appState.viewMode = "CHAT";
      appState.statusBarTheme = "dark";
    }
    return;
  }

  if (!conversationId) return;

  const conversations = getConversations(draft);

  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      id: conversationId,
      messages: [],
      messagesById: {},
    } as WhatsAppConversation;
  }
  const conversation = conversations[conversationId];

  if (!conversation.messagesById) {
    conversation.messagesById = {};
  }

  switch (eventType) {
    case "MESSAGE_RECEIVED":
    case "MESSAGE_SENT": {
      const payload = e.payload || {};
      const msgPayload = e.message || {};

      // Extract fields: V2 payload takes priority, then root, then message object
      const fromUser =
        eventType === "MESSAGE_SENT"
          ? "me"
          : payload.from || e.from || "unknown";
      const textContent = payload.text || e.text || msgPayload.text;
      const msgType = (payload.messageType ||
        msgPayload.type ||
        "text") as WhatsAppMessageType;
      const msgId =
        payload.messageId || msgPayload.id || `msg_${event.at}_${fromUser}`;

      // Generate timestamp from frame, using world config for FPS and device OS for base time
      const timestamp = generateTimestamp(event.at, draft, e.deviceId);

      const newMessage: WhatsAppMessage = {
        id: msgId,
        from: fromUser,
        type: msgType,
        text: textContent,
        at: event.at,
        status:
          (msgPayload.status as any) ||
          (eventType === "MESSAGE_SENT" ? "sent" : "delivered"),
        edited: msgPayload.edited,
        timestamp,
      };

      // Handle media-specific fields based on type
      switch (msgType) {
        case "image":
          newMessage.imageUrl =
            payload.url || msgPayload.imageUrl || e.imageUrl;
          newMessage.caption =
            payload.caption || msgPayload.caption || e.caption;
          break;
        case "video":
          newMessage.thumbnailUrl = msgPayload.thumbnailUrl || e.thumbnailUrl;
          newMessage.videoUrl =
            payload.url || msgPayload.videoUrl || e.videoUrl;
          newMessage.duration =
            payload.durationSeconds || msgPayload.duration || e.duration || 0;
          newMessage.caption =
            payload.caption || msgPayload.caption || e.caption;
          break;
        case "gif":
          newMessage.gifUrl = payload.url || msgPayload.gifUrl || e.gifUrl;
          break;
      }

      // Handle replyTo (reply quote) - V2 payload takes priority
      if (payload.replyTo) {
        newMessage.replyTo = {
          messageId: payload.replyTo.messageId || payload.replyTo.id,
          text: payload.replyTo.text,
          from: payload.replyTo.from,
          type: payload.replyTo.type,
          thumbnailUrl: payload.replyTo.thumbnailUrl,
        };
      }

      addMessage(conversation, newMessage);

      break;
    }

    case "TYPING_START": {
      if (!conversation.typing) conversation.typing = {};
      // V2: payload.actor, V1: root-level from
      const typingPayload = (e as any).payload || {};
      const actor = typingPayload.actor || e.from;
      if (actor) {
        conversation.typing[actor] = true;
      }
      break;
    }

    case "TYPING_END": {
      // V2: payload.actor, V1: root-level from
      const typingPayload = (e as any).payload || {};
      const actor = typingPayload.actor || e.from;
      if (conversation.typing && actor) {
        delete conversation.typing[actor];
      }
      break;
    }

    // =====================================================================
    // MEDIA MESSAGES - Images, Videos, Voice, GIFs
    // =====================================================================

    case "IMAGE_SENT": {
      const payload = (e as any).payload || {};
      const msg: WhatsAppMessage = {
        id: `msg_${event.at}_me_img`,
        from: "me",
        type: "image",
        imageUrl: payload.url,
        caption: payload.caption,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: "sent",
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case "IMAGE_RECEIVED": {
      const payload = (e as any).payload || {};
      const msg: WhatsAppMessage = {
        id: `msg_${event.at}_${payload.from}_img`,
        from: payload.from || "unknown",
        type: "image",
        imageUrl: payload.url,
        caption: payload.caption,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: "delivered",
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case "VIDEO_RECEIVED":
    case "VIDEO_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "VIDEO_RECEIVED";
      const msg: WhatsAppMessage = {
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_vid`,
        from: isReceived ? payload.from : "me",
        type: "video",
        thumbnailUrl: payload.url,
        videoUrl: payload.url,
        duration: payload.duration || 10,
        caption: payload.caption,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case "VOICE_RECEIVED":
    case "VOICE_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "VOICE_RECEIVED";
      const msg: WhatsAppMessage = {
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_voice`,
        from: isReceived ? payload.from : "me",
        type: "voice",
        duration: payload.duration || 5,
        isPlaying: false,
        playProgress: 0,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    case "GIF_RECEIVED":
    case "GIF_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "GIF_RECEIVED";
      const msg: WhatsAppMessage = {
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_gif`,
        from: isReceived ? payload.from : "me",
        type: "gif",
        gifUrl: payload.url,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      };
      addMessage(conversation, msg);
      break;
    }

    // =====================================================================
    // DATE SEPARATOR - "Today", "Yesterday", etc.
    // =====================================================================

    case "DATE_SEPARATOR": {
      const payload = (e as any).payload || {};
      const msg: WhatsAppMessage = {
        id: `sep_${event.at}_date`,
        from: "system",
        type: "system",
        systemType: "date_change",
        text: payload.text || "Today",
        at: event.at,
      } as WhatsAppMessage;
      addMessage(conversation, msg);
      break;
    }

    case "GROUP_MEMBER_ADDED": {
      const addedBy = e.addedBy === "me" ? "You" : e.addedBy;
      const msg: WhatsAppMessage = {
        id: `sys_${event.at}_added_${e.memberId}`,
        from: "system",
        type: "system",
        systemType: "member_added",
        text: `${addedBy} added ${e.memberName}`,
        targetMember: e.memberName,
        actorName: addedBy,
        at: event.at,
      } as WhatsAppMessage;
      addMessage(conversation, msg);
      if (!conversation.members) conversation.members = [];
      conversation.members.push({
        id: e.memberId || "",
        name: e.memberName || "",
      });
      break;
    }

    case "GROUP_MEMBER_REMOVED": {
      const removedBy = e.removedBy === "me" ? "You" : e.removedBy;
      const msg: WhatsAppMessage = {
        id: `sys_${event.at}_removed_${e.memberId}`,
        from: "system",
        type: "system",
        systemType: "member_removed",
        text: `${removedBy} removed ${e.memberName}`,
        targetMember: e.memberName,
        actorName: removedBy,
        at: event.at,
      } as WhatsAppMessage;
      addMessage(conversation, msg);
      if (conversation.members) {
        conversation.members = conversation.members.filter(
          (m: { id: string }) => m.id !== e.memberId,
        );
      }
      break;
    }

    case "VOICE_MESSAGE_RECEIVED": {
      const msg: WhatsAppMessage = {
        id: `voice_${event.at}_${e.from}`,
        from: e.from || "unknown",
        type: "voice",
        duration: e.duration,
        at: event.at,
        status: "delivered",
      } as WhatsAppMessage;
      addMessage(conversation, msg);
      break;
    }

    case "MESSAGE_READ": {
      if (e.messageId) {
        const msg = getMessageById(conversation, e.messageId);
        if (msg) {
          msg.status = "read";
        }
      }
      break;
    }

    case "REACT": {
      const payload = (e as any).payload || {};
      const emoji = payload.emoji || "❤️";
      const messages = conversation.messages as WhatsAppMessage[];

      let targetMsg: WhatsAppMessage | undefined;

      const messageId = payload.messageRef?.messageId || payload.messageRef?.id;
      if (messageId) {
        targetMsg = getMessageById(conversation, messageId);
      }

      const indexRef = payload.messageRef?.index;
      if (!targetMsg && indexRef !== undefined) {
        if (indexRef === "last" || indexRef === -1) {
          targetMsg = messages[messages.length - 1];
        } else if (typeof indexRef === "number" && indexRef < 0) {
          targetMsg = messages[messages.length + indexRef];
        } else if (typeof indexRef === "number") {
          targetMsg = messages[indexRef];
        }
      }

      if (!targetMsg && messages.length > 0) {
        targetMsg = messages[messages.length - 1];
      }

      if (targetMsg) {
        if (!targetMsg.reactions) {
          targetMsg.reactions = [];
        }

        const existing = targetMsg.reactions.find(
          (r: any) => r.emoji === emoji,
        );
        if (existing) {
          existing.count += 1;
        } else {
          targetMsg.reactions.push({
            emoji,
            count: 1,
            fromMe: true,
          });
        }
      }
      break;
    }
    case "REACTION_ADDED": {
      if (e.messageId) {
        const msg = getMessageById(conversation, e.messageId) as any;
        if (msg) {
          if (!msg.reactions) {
            msg.reactions = [];
          }

          const emoji = (e as any).emoji || "❤️";
          const fromMe = (e as any).fromMe || false;

          const existing = msg.reactions.find((r: any) => r.emoji === emoji);
          if (existing) {
            existing.count += 1;
            if (fromMe) existing.fromMe = true;
          } else {
            msg.reactions.push({
              emoji,
              count: 1,
              fromMe,
            });
          }
        }
      }
      break;
    }

    case "INPUT_CHANGE": {
      // "OS-Level Input Management"
      // The OS has dispatched this event with the raw text from the keyboard.
      // We update the local conversation draft state.
      const text = (e as any).payload?.text;
      if (conversation) {
        (conversation as any).draftText = text;
      }
      break;
    }

    case "MESSAGE_DELETED": {
      const payload = (e as any).payload || {};
      const messages = conversation.messages as WhatsAppMessage[];

      let targetMsg: WhatsAppMessage | undefined;

      const messageId =
        payload.messageRef?.messageId ||
        payload.messageRef?.id ||
        payload.messageId;
      if (messageId) {
        targetMsg = getMessageById(conversation, messageId);
      }

      const indexRef = payload.messageRef?.index;
      if (!targetMsg && indexRef !== undefined) {
        if (indexRef === "last" || indexRef === -1) {
          targetMsg = messages[messages.length - 1];
        } else if (typeof indexRef === "number" && indexRef < 0) {
          targetMsg = messages[messages.length + indexRef];
        } else if (typeof indexRef === "number") {
          targetMsg = messages[indexRef];
        }
      }

      if (targetMsg) {
        (targetMsg as any).originalType = targetMsg.type;
        (targetMsg as any).originalText = targetMsg.text;
        targetMsg.type = "deleted";
        targetMsg.text = payload.deletedForEveryone
          ? "This message was deleted"
          : "You deleted this message";
        (targetMsg as any).deletedAt = event.at;
        (targetMsg as any).deletedBy = payload.deletedBy || "me";
      }
      break;
    }

    case "MESSAGE_EDITED": {
      const payload = (e as any).payload || {};
      const messages = conversation.messages as WhatsAppMessage[];

      let targetMsg: WhatsAppMessage | undefined;

      const messageId =
        payload.messageRef?.messageId ||
        payload.messageRef?.id ||
        payload.messageId;
      if (messageId) {
        targetMsg = getMessageById(conversation, messageId);
      }

      const indexRef = payload.messageRef?.index;
      if (!targetMsg && indexRef !== undefined) {
        if (indexRef === "last" || indexRef === -1) {
          targetMsg = messages[messages.length - 1];
        } else if (typeof indexRef === "number" && indexRef < 0) {
          targetMsg = messages[messages.length + indexRef];
        } else if (typeof indexRef === "number") {
          targetMsg = messages[indexRef];
        }
      }

      if (targetMsg && payload.newText) {
        (targetMsg as any).originalText = targetMsg.text;
        targetMsg.text = payload.newText;
        targetMsg.edited = true;
        (targetMsg as any).editedAt = event.at;
      }
      break;
    }

    case "MESSAGE_FORWARDED": {
      const payload = (e as any).payload || {};
      const messages = conversation.messages as WhatsAppMessage[];

      let sourceMsg: WhatsAppMessage | undefined;
      const indexRef = payload.messageRef?.index;
      if (indexRef !== undefined) {
        if (indexRef === "last" || indexRef === -1) {
          sourceMsg = messages[messages.length - 1];
        } else if (typeof indexRef === "number" && indexRef < 0) {
          sourceMsg = messages[messages.length + indexRef];
        } else if (typeof indexRef === "number") {
          sourceMsg = messages[indexRef];
        }
      }

      const newMessage: WhatsAppMessage = {
        id: payload.messageId || `msg_${event.at}_fwd`,
        from: "me",
        type:
          sourceMsg?.type ||
          ((payload.messageType || "text") as WhatsAppMessageType),
        text: sourceMsg?.text || payload.text,
        at: event.at,
        status: "sent",
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
      };

      (newMessage as any).isForwarded = true;
      (newMessage as any).forwardedFrom = payload.forwardedFrom;

      if (sourceMsg?.imageUrl) newMessage.imageUrl = sourceMsg.imageUrl;
      if (sourceMsg?.videoUrl) newMessage.videoUrl = sourceMsg.videoUrl;
      if (sourceMsg?.gifUrl) newMessage.gifUrl = sourceMsg.gifUrl;
      if (payload.imageUrl) newMessage.imageUrl = payload.imageUrl;
      if (payload.videoUrl) newMessage.videoUrl = payload.videoUrl;
      if (payload.gifUrl) newMessage.gifUrl = payload.gifUrl;

      addMessage(conversation, newMessage);
      break;
    }

    case "VOICE_PLAY": {
      const payload = (e as any).payload || {};

      let targetMsg = getMessageById(conversation, payload.messageId) as any;
      if (!targetMsg && payload.messageRef?.index !== undefined) {
        const indexRef = payload.messageRef.index;
        if (indexRef === "last" || indexRef === -1) {
          const messages = conversation.messages as any[];
          targetMsg = messages.filter((m) => m.type === "voice").slice(-1)[0];
        }
      }

      if (targetMsg && targetMsg.type === "voice") {
        targetMsg.isPlaying = true;
        targetMsg.playProgress = payload.startAt || 0;
      }
      break;
    }

    case "VOICE_PAUSE": {
      const payload = (e as any).payload || {};

      let targetMsg = getMessageById(conversation, payload.messageId) as any;
      if (!targetMsg) {
        const messages = conversation.messages as any[];
        targetMsg = messages.find((m) => m.type === "voice" && m.isPlaying);
      }

      if (targetMsg && targetMsg.type === "voice") {
        targetMsg.isPlaying = false;
      }
      break;
    }

    case "VOICE_PROGRESS": {
      const payload = (e as any).payload || {};
      const messages = conversation.messages as any[];

      const targetMsg = messages.find((m) => m.id === payload.messageId);
      if (targetMsg && targetMsg.type === "voice") {
        targetMsg.playProgress = payload.progress || 0;
      }
      break;
    }

    // =====================================================================
    // STICKER_RECEIVED / STICKER_SENT
    // =====================================================================
    case "STICKER_RECEIVED":
    case "STICKER_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "STICKER_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_sticker`,
        from: isReceived ? payload.from : "me",
        type: "sticker",
        stickerUrl: payload.url,
        stickerPack: payload.pack,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    // =====================================================================
    // DOCUMENT_RECEIVED / DOCUMENT_SENT
    // =====================================================================
    case "DOCUMENT_RECEIVED":
    case "DOCUMENT_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "DOCUMENT_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_doc`,
        from: isReceived ? payload.from : "me",
        type: "document",
        documentUrl: payload.url,
        fileName: payload.fileName || "Document",
        fileSize: payload.fileSize,
        fileType: payload.fileType || "pdf",
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    // =====================================================================
    // CONTACT_RECEIVED / CONTACT_SENT
    // =====================================================================
    case "CONTACT_RECEIVED":
    case "CONTACT_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "CONTACT_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_contact`,
        from: isReceived ? payload.from : "me",
        type: "contact",
        contactName: payload.name,
        contactPhone: payload.phone,
        contactAvatarUrl: payload.avatar,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    // =====================================================================
    // LOCATION_RECEIVED / LOCATION_SENT
    // =====================================================================
    case "LOCATION_RECEIVED":
    case "LOCATION_SENT": {
      const payload = (e as any).payload || {};
      const isReceived = eventType === "LOCATION_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_loc`,
        from: isReceived ? payload.from : "me",
        type: "location",
        latitude: payload.lat,
        longitude: payload.lng,
        locationName: payload.name,
        locationAddress: payload.address,
        mapThumbnailUrl: payload.mapThumbnailUrl,
        timestamp: generateTimestamp(event.at, draft, e.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    // =====================================================================
    // CONVERSATION_PINNED / UNPINNED / MUTED / UNMUTED / ARCHIVED
    // =====================================================================
    case "CONVERSATION_PINNED": {
      (conversation as any).isPinned = true;
      break;
    }

    case "CONVERSATION_UNPINNED": {
      (conversation as any).isPinned = false;
      break;
    }

    case "CONVERSATION_MUTED": {
      const payload = (e as any).payload || {};
      (conversation as any).isMuted = true;
      (conversation as any).mutedUntil = payload.until;
      break;
    }

    case "CONVERSATION_UNMUTED": {
      (conversation as any).isMuted = false;
      (conversation as any).mutedUntil = undefined;
      break;
    }

    case "CONVERSATION_ARCHIVED": {
      (conversation as any).isArchived = true;
      break;
    }

    case "CONVERSATION_UNARCHIVED": {
      (conversation as any).isArchived = false;
      break;
    }
  }
}

// =============================================================================
// CUSTOM OP HANDLERS (WhatsApp-namespaced events)
// =============================================================================

interface CustomOpEvent {
  at: number;
  kind: "Custom";
  deviceId?: string;
  appId?: string;
  eventType: string;
  payload?: Record<string, any>;
}

/**
 * Handle CustomOp events with WhatsApp namespace.
 * Uses the event factory pattern from ir/group-ops.ts
 */
function handleCustomOp(draft: WorldState, event: CustomOpEvent): void {
  // Only handle whatsapp-namespaced events
  if (!event.eventType?.startsWith("whatsapp.")) return;
  if (event.appId && event.appId !== APP_IDS.WHATSAPP) return;

  const payload = event.payload;
  if (!payload) return;

  const conversationId = payload.conversationId;
  if (!conversationId) return;

  // Get conversations with type safety
  const conversations = getConversations(draft);

  // Ensure conversation exists
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      id: conversationId,
      messages: [],
      type: "group", // CustomOps are typically group operations
    } as WhatsAppConversation;
  }
  const conversation = conversations[conversationId];

  switch (event.eventType) {
    case GROUP_EVENT_TYPES.MEMBER_ADDED: {
      if (!isGroupMemberAddPayload(event.eventType, payload)) break;

      // Add member if not already present
      if (!conversation.members) conversation.members = [];
      if (!conversation.members.find((m) => m.id === payload.member.id)) {
        conversation.members.push({
          id: payload.member.id,
          name: payload.member.name,
          avatar: payload.member.avatar,
        });
      }

      // Add system message
      const addedByName = payload.addedBy === "me" ? "You" : payload.addedBy;
      (conversation.messages as any[]).push({
        id: `sys_${event.at}_added_${payload.member.id}`,
        from: "system",
        type: "system",
        systemType: "member_added",
        text: `${addedByName} added ${payload.member.name}`,
        targetMember: payload.member.name,
        actorName: payload.addedBy,
        at: event.at,
      });
      break;
    }

    case GROUP_EVENT_TYPES.MEMBER_REMOVED: {
      if (!isGroupMemberRemovePayload(event.eventType, payload)) break;

      // Remove member from list
      if (conversation.members) {
        conversation.members = conversation.members.filter(
          (m) => m.id !== payload.memberId,
        );
      }

      // Add system message
      const wasMe = payload.memberId === "me";
      const removedByName =
        payload.removedBy === "me" ? "You" : payload.removedBy;

      const text = wasMe
        ? "You left the group"
        : `${removedByName} removed ${payload.memberName}`;

      (conversation.messages as any[]).push({
        id: `sys_${event.at}_removed_${payload.memberId}`,
        from: "system",
        type: "system",
        systemType: "member_removed",
        text,
        targetMember: payload.memberName,
        actorName: payload.removedBy,
        at: event.at,
      });
      break;
    }

    case GROUP_EVENT_TYPES.ADMIN_CHANGED: {
      if (!isGroupAdminChangePayload(event.eventType, payload)) break;

      // Update admin list
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

      // Optionally add system message for admin changes
      const changedByName =
        payload.changedBy === "me" ? "You" : payload.changedBy;
      const memberName = payload.memberName || payload.memberId;
      const action = payload.action === "promote" ? "made" : "removed";
      const role = payload.action === "promote" ? "an admin" : "as admin";

      (conversation.messages as any[]).push({
        id: `sys_${event.at}_admin_${payload.memberId}`,
        from: "system",
        type: "system",
        systemType: "admin_change",
        text: `${changedByName} ${action} ${memberName} ${role}`,
        targetMember: memberName,
        actorName: payload.changedBy,
        at: event.at,
      });
      break;
    }

    case GROUP_EVENT_TYPES.INFO_UPDATED: {
      // Handle group info updates (name, avatar, description)
      const field = payload.field;
      const newValue = payload.newValue;
      const changedByName =
        payload.changedBy === "me" ? "You" : payload.changedBy;

      if (field === "name") {
        conversation.name = newValue;
        (conversation.messages as any[]).push({
          id: `sys_${event.at}_name_changed`,
          from: "system",
          type: "system",
          systemType: "group_name_changed",
          text: `${changedByName} changed the group name to "${newValue}"`,
          at: event.at,
        });
      } else if (field === "avatar") {
        conversation.avatar = newValue;
      }
      break;
    }
  }
}
