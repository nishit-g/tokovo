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

/**
 * Get WhatsApp conversations from WorldState with type safety.
 */
function getConversations(
  draft: WorldState,
): Record<string, WhatsAppConversation> {
  return draft.conversations as Record<string, WhatsAppConversation>;
}

/**
 * Get or create WhatsApp app state with type safety.
 */
function getAppState(draft: WorldState): WhatsAppState {
  if (!draft.appState) {
    draft.appState = {};
  }
  if (!draft.appState.app_whatsapp) {
    draft.appState.app_whatsapp = {};
  }
  return draft.appState.app_whatsapp as WhatsAppState;
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
  // Handle CustomOp events with WhatsApp namespace
  if (event.kind === "Custom") {
    handleCustomOp(draft, event as any);
    return;
  }

  // Only handle APP events for WhatsApp
  if (event.kind !== "APP") return;

  // Type assertion for APP events with extended payload
  const appEvent = event as TimelineEvent & {
    appId: string;
    conversationId?: string;
    from?: string;
    text?: string;
    message?: Partial<WhatsAppMessage>;
    // Media-specific fields
    imageUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    gifUrl?: string;
    caption?: string;
    // Group-specific fields
    memberId?: string;
    memberName?: string;
    addedBy?: string;
    removedBy?: string;
    // Voice-specific fields
    duration?: number;
    // Read receipt fields
    messageId?: string;
    // Navigation fields
    screen?: string;
    // Device context
    deviceId?: string;
  };

  if (appEvent.appId !== APP_IDS.WHATSAPP) return;

  // Use string type for event.type to allow extended event types
  const eventType = event.type as string;

  // Handle navigation events (no conversation required)
  // V2 DSL uses these event types:
  //   - NAVIGATE_SCREEN: openChatList(), openProfile()
  //   - CONVERSATION_OPENED: switchTo()
  //   - GO_BACK: goBack()
  if (
    eventType === "NAVIGATE_SCREEN" ||
    eventType === "SCREEN_NAVIGATED" ||
    eventType === "GO_BACK"
  ) {
    const appState = getAppState(draft);
    const payload = (appEvent as any).payload || {};

    // Extract screen from payload (V2) or root (V1)
    const screen = payload.screen || appEvent.screen || "chat";
    appState.screen = screen;
    appState.currentScreen = screen; // UI reads this for navigation

    // Map screen to generic ViewKind
    if (screen === "chats" || screen === "chatList") {
      appState.viewMode = "LIST"; // Valid type value
    } else if (screen === "chat") {
      appState.viewMode = "CHAT";
    } else {
      appState.viewMode = "TRANSITION"; // Profile and others use transition
    }

    // WhatsApp uses dark status bar (dark icons on light bg #ECE5DD)
    appState.statusBarTheme = "dark";

    // If navigating to a specific conversation
    if (payload.conversationId || appEvent.conversationId) {
      appState.conversationId =
        payload.conversationId || appEvent.conversationId;
    }

    return;
  }

  // Handle CONVERSATION_OPENED (switchTo in DSL)
  if (eventType === "CONVERSATION_OPENED") {
    const appState = getAppState(draft);
    const payload = (appEvent as any).payload || {};
    const targetConversationId =
      payload.conversationId || appEvent.conversationId;

    if (targetConversationId) {
      appState.conversationId = targetConversationId;
      appState.screen = "chat";
      appState.currentScreen = "chat";
      appState.viewMode = "CHAT";
      appState.statusBarTheme = "dark"; // WhatsApp dark icons on light bg
    }
    return;
  }

  // Get conversation ID from event
  const conversationId = appEvent.conversationId;
  if (!conversationId) return;

  // Get conversations with type safety
  const conversations = getConversations(draft);

  // Ensure conversation exists
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      id: conversationId,
      messages: [],
    } as WhatsAppConversation;
  }
  const conversation = conversations[conversationId];

  switch (eventType) {
    case "MESSAGE_RECEIVED":
    case "MESSAGE_SENT": {
      // V2 ENTERPRISE: Read from event.payload first
      // V1 LEGACY: Fallback to root-level fields for backward compatibility
      const payload = (appEvent as any).payload || {};
      const msgPayload = appEvent.message || {};

      // Extract fields: V2 payload takes priority, then root, then message object
      const fromUser =
        eventType === "MESSAGE_SENT"
          ? "me"
          : payload.from || appEvent.from || "unknown";
      const textContent = payload.text || appEvent.text || msgPayload.text;
      const msgType = (payload.messageType ||
        msgPayload.type ||
        "text") as WhatsAppMessageType;
      const msgId =
        payload.messageId || msgPayload.id || `msg_${event.at}_${fromUser}`;

      // Generate timestamp from frame, using world config for FPS and device OS for base time
      const timestamp = generateTimestamp(event.at, draft, appEvent.deviceId);

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
            payload.url || msgPayload.imageUrl || appEvent.imageUrl;
          newMessage.caption =
            payload.caption || msgPayload.caption || appEvent.caption;
          break;
        case "video":
          newMessage.thumbnailUrl =
            msgPayload.thumbnailUrl || appEvent.thumbnailUrl;
          newMessage.videoUrl =
            payload.url || msgPayload.videoUrl || appEvent.videoUrl;
          newMessage.duration =
            payload.durationSeconds ||
            msgPayload.duration ||
            appEvent.duration ||
            0;
          newMessage.caption =
            payload.caption || msgPayload.caption || appEvent.caption;
          break;
        case "gif":
          newMessage.gifUrl =
            payload.url || msgPayload.gifUrl || appEvent.gifUrl;
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

      (conversation.messages as any[]).push(newMessage);

      break;
    }

    case "TYPING_START": {
      if (!conversation.typing) conversation.typing = {};
      // V2: payload.actor, V1: root-level from
      const typingPayload = (appEvent as any).payload || {};
      const actor = typingPayload.actor || appEvent.from;
      if (actor) {
        conversation.typing[actor] = true;
      }
      break;
    }

    case "TYPING_END": {
      // V2: payload.actor, V1: root-level from
      const typingPayload = (appEvent as any).payload || {};
      const actor = typingPayload.actor || appEvent.from;
      if (conversation.typing && actor) {
        delete conversation.typing[actor];
      }
      break;
    }

    // =====================================================================
    // MEDIA MESSAGES - Images, Videos, Voice, GIFs
    // =====================================================================

    case "IMAGE_SENT": {
      const payload = (appEvent as any).payload || {};
      const messageIndex = conversation.messages.length;
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_me_img`,
        from: "me",
        type: "image",
        imageUrl: payload.url,
        caption: payload.caption,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
        status: "sent",
        at: event.at,
      });
      break;
    }

    case "IMAGE_RECEIVED": {
      const payload = (appEvent as any).payload || {};
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${payload.from}_img`,
        from: payload.from || "unknown",
        type: "image",
        imageUrl: payload.url,
        caption: payload.caption,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
        status: "delivered",
        at: event.at,
      });
      break;
    }

    case "VIDEO_RECEIVED":
    case "VIDEO_SENT": {
      const payload = (appEvent as any).payload || {};
      const isReceived = eventType === "VIDEO_RECEIVED";
      const messageIndex = conversation.messages.length;
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_vid`,
        from: isReceived ? payload.from : "me",
        type: "video",
        thumbnailUrl: payload.url,
        videoUrl: payload.url,
        duration: payload.duration || 10,
        caption: payload.caption,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    case "VOICE_RECEIVED":
    case "VOICE_SENT": {
      const payload = (appEvent as any).payload || {};
      const isReceived = eventType === "VOICE_RECEIVED";
      const messageIndex = conversation.messages.length;
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_voice`,
        from: isReceived ? payload.from : "me",
        type: "voice",
        duration: payload.duration || 5,
        isPlaying: false,
        playProgress: 0,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    case "GIF_RECEIVED":
    case "GIF_SENT": {
      const payload = (appEvent as any).payload || {};
      const isReceived = eventType === "GIF_RECEIVED";
      const messageIndex = conversation.messages.length;
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_gif`,
        from: isReceived ? payload.from : "me",
        type: "gif",
        gifUrl: payload.url,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
        status: isReceived ? "delivered" : "sent",
        at: event.at,
      });
      break;
    }

    // =====================================================================
    // DATE SEPARATOR - "Today", "Yesterday", etc.
    // =====================================================================

    case "DATE_SEPARATOR": {
      const payload = (appEvent as any).payload || {};
      (conversation.messages as any[]).push({
        id: `sep_${event.at}_date`,
        from: "system",
        type: "system",
        systemType: "date_change",
        text: payload.text || "Today",
        at: event.at,
      });
      break;
    }

    case "GROUP_MEMBER_ADDED": {
      const addedBy = appEvent.addedBy === "me" ? "You" : appEvent.addedBy;
      (conversation.messages as any[]).push({
        id: `sys_${event.at}_added_${appEvent.memberId}`,
        from: "system",
        type: "system",
        systemType: "member_added",
        text: `${addedBy} added ${appEvent.memberName}`,
        targetMember: appEvent.memberName,
        actorName: addedBy,
        at: event.at,
      } as WhatsAppMessage);
      if (!conversation.members) conversation.members = [];
      conversation.members.push({
        id: appEvent.memberId || "",
        name: appEvent.memberName || "",
      });
      break;
    }

    case "GROUP_MEMBER_REMOVED": {
      const removedBy =
        appEvent.removedBy === "me" ? "You" : appEvent.removedBy;
      (conversation.messages as any[]).push({
        id: `sys_${event.at}_removed_${appEvent.memberId}`,
        from: "system",
        type: "system",
        systemType: "member_removed",
        text: `${removedBy} removed ${appEvent.memberName}`,
        targetMember: appEvent.memberName,
        actorName: removedBy,
        at: event.at,
      } as WhatsAppMessage);
      if (conversation.members) {
        conversation.members = conversation.members.filter(
          (m: { id: string }) => m.id !== appEvent.memberId,
        );
      }
      break;
    }

    case "VOICE_MESSAGE_RECEIVED": {
      (conversation.messages as any[]).push({
        id: `voice_${event.at}_${appEvent.from}`,
        from: appEvent.from || "unknown",
        type: "voice",
        duration: appEvent.duration,
        at: event.at,
        status: "delivered",
      } as WhatsAppMessage);
      break;
    }

    case "MESSAGE_READ": {
      if (appEvent.messageId) {
        // Cast to WhatsAppMessage[] since core's messages is now unknown[]
        const messages = conversation.messages as WhatsAppMessage[];
        const msg = messages.find((m) => m.id === appEvent.messageId);
        if (msg) {
          msg.status = "read";
        }
      }
      break;
    }

    // V2 DSL: REACT event from track builder
    // Supports symbolic refs:
    //   - { messageId: "msg_123" } - exact ID
    //   - { index: -1 } or { index: "last" } - last message
    //   - { index: -2 } - second to last
    //   - { index: 0 } - first message
    case "REACT": {
      const payload = (appEvent as any).payload || {};
      const emoji = payload.emoji || "❤️";
      const messages = conversation.messages as WhatsAppMessage[];

      let targetMsg: any = null;

      // Check for messageId first
      const messageId = payload.messageRef?.messageId || payload.messageRef?.id;
      if (messageId) {
        targetMsg = messages.find((m) => m.id === messageId);
      }

      // Check for index-based ref (supports "last", negative indices)
      const indexRef = payload.messageRef?.index;
      if (!targetMsg && indexRef !== undefined) {
        if (indexRef === "last" || indexRef === -1) {
          targetMsg = messages[messages.length - 1];
        } else if (typeof indexRef === "number" && indexRef < 0) {
          // Negative index from end
          targetMsg = messages[messages.length + indexRef];
        } else if (typeof indexRef === "number") {
          // Positive index from start
          targetMsg = messages[indexRef];
        }
      }

      // Fallback: if no ref specified, react to last message
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
      // Find the message and add/update the reaction
      if (appEvent.messageId) {
        const messages = conversation.messages as WhatsAppMessage[];
        const msg = messages.find((m) => m.id === appEvent.messageId) as any;
        if (msg) {
          // Initialize reactions array if needed
          if (!msg.reactions) {
            msg.reactions = [];
          }

          const emoji = (appEvent as any).emoji || "❤️";
          const fromMe = (appEvent as any).fromMe || false;

          // Check if this emoji already exists
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
      const text = (appEvent as any).payload?.text;
      if (conversation) {
        (conversation as any).draftText = text;
      }
      break;
    }

    // =====================================================================
    // MESSAGE_DELETED - Mark message as deleted ("This message was deleted")
    // =====================================================================
    case "MESSAGE_DELETED": {
      const payload = (appEvent as any).payload || {};
      const messages = conversation.messages as WhatsAppMessage[];

      // Support symbolic refs (like REACT)
      let targetMsg: WhatsAppMessage | undefined;

      const messageId =
        payload.messageRef?.messageId ||
        payload.messageRef?.id ||
        payload.messageId;
      if (messageId) {
        targetMsg = messages.find((m) => m.id === messageId);
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
        // Store original content for "deleted for everyone" display
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

    // =====================================================================
    // MESSAGE_EDITED - Edit an existing message
    // =====================================================================
    case "MESSAGE_EDITED": {
      const payload = (appEvent as any).payload || {};
      const messages = conversation.messages as WhatsAppMessage[];

      // Support symbolic refs
      let targetMsg: WhatsAppMessage | undefined;

      const messageId =
        payload.messageRef?.messageId ||
        payload.messageRef?.id ||
        payload.messageId;
      if (messageId) {
        targetMsg = messages.find((m) => m.id === messageId);
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

    // =====================================================================
    // MESSAGE_FORWARDED - Add forwarded label to message
    // =====================================================================
    case "MESSAGE_FORWARDED": {
      const payload = (appEvent as any).payload || {};
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
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
      };

      (newMessage as any).isForwarded = true;
      (newMessage as any).forwardedFrom = payload.forwardedFrom;

      if (sourceMsg?.imageUrl) newMessage.imageUrl = sourceMsg.imageUrl;
      if (sourceMsg?.videoUrl) newMessage.videoUrl = sourceMsg.videoUrl;
      if (sourceMsg?.gifUrl) newMessage.gifUrl = sourceMsg.gifUrl;
      if (payload.imageUrl) newMessage.imageUrl = payload.imageUrl;
      if (payload.videoUrl) newMessage.videoUrl = payload.videoUrl;
      if (payload.gifUrl) newMessage.gifUrl = payload.gifUrl;

      (conversation.messages as any[]).push(newMessage);
      break;
    }

    // =====================================================================
    // VOICE_PLAY / VOICE_PAUSE - Control voice note playback
    // =====================================================================
    case "VOICE_PLAY": {
      const payload = (appEvent as any).payload || {};
      const messages = conversation.messages as any[];

      let targetMsg = messages.find((m) => m.id === payload.messageId);
      if (!targetMsg && payload.messageRef?.index !== undefined) {
        const indexRef = payload.messageRef.index;
        if (indexRef === "last" || indexRef === -1) {
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
      const payload = (appEvent as any).payload || {};
      const messages = conversation.messages as any[];

      let targetMsg = messages.find((m) => m.id === payload.messageId);
      if (!targetMsg) {
        // Find any playing voice message
        targetMsg = messages.find((m) => m.type === "voice" && m.isPlaying);
      }

      if (targetMsg && targetMsg.type === "voice") {
        targetMsg.isPlaying = false;
      }
      break;
    }

    case "VOICE_PROGRESS": {
      const payload = (appEvent as any).payload || {};
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
      const payload = (appEvent as any).payload || {};
      const isReceived = eventType === "STICKER_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_sticker`,
        from: isReceived ? payload.from : "me",
        type: "sticker",
        stickerUrl: payload.url,
        stickerPack: payload.pack,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
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
      const payload = (appEvent as any).payload || {};
      const isReceived = eventType === "DOCUMENT_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_doc`,
        from: isReceived ? payload.from : "me",
        type: "document",
        documentUrl: payload.url,
        fileName: payload.fileName || "Document",
        fileSize: payload.fileSize,
        fileType: payload.fileType || "pdf",
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
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
      const payload = (appEvent as any).payload || {};
      const isReceived = eventType === "CONTACT_RECEIVED";
      (conversation.messages as any[]).push({
        id: `msg_${event.at}_${isReceived ? payload.from : "me"}_contact`,
        from: isReceived ? payload.from : "me",
        type: "contact",
        contactName: payload.name,
        contactPhone: payload.phone,
        contactAvatarUrl: payload.avatar,
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
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
      const payload = (appEvent as any).payload || {};
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
        timestamp: generateTimestamp(event.at, draft, appEvent.deviceId),
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
      const payload = (appEvent as any).payload || {};
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
