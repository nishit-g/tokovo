import React from "react";
import { WorldState } from "@tokovo/core";
import { KeyboardAwareView, useKeyboardState } from "@tokovo/react";
import { Header as DefaultHeader } from "../Header.js";
import { MessageList } from "../MessageList.js";
import { InputArea as DefaultInputArea } from "../InputArea.js";
import { useTheme } from "../../theme/ThemeContext.js";
import {
  WhatsAppState,
  MessageData,
  WhatsAppConversation,
  SystemMessage,
} from "../../types/index.js";
import { normalizeMessages } from "../../utils/messages.js";

export interface ChatScreenProps {
  world: WorldState;
  deviceId?: string;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  world,
  deviceId,
  safeAreaInsets,
  width: _width,
  height: _height,
}) => {
  const theme = useTheme();
  const appState = (world.appState?.["app_whatsapp"] ||
    world.appState?.["whatsapp"]) as WhatsAppState;
  const conversations = (appState?.conversations ?? {}) as Record<
    string,
    WhatsAppConversation
  >;
  const conversationIdFromMessages = (() => {
    let bestId: string | undefined;
    let bestAt = -Infinity;
    for (const [id, conv] of Object.entries(conversations)) {
      const messages = conv?.messages ?? [];
      const last = messages[messages.length - 1];
      if (!last) continue;
      const at = typeof last.at === "number" ? last.at : -Infinity;
      if (at > bestAt) {
        bestAt = at;
        bestId = id;
      }
    }
    return bestId;
  })();

  const conversationId =
    appState?.currentConversationId ||
    conversationIdFromMessages ||
    appState?.conversationId ||
    Object.keys(conversations)[0];

  const conversation = conversations[conversationId] as
    | WhatsAppConversation
    | undefined;

  const contactName = conversation?.name || "Unknown";
  const rawMessages = conversation?.messages || [];
  const normalizedMessages = normalizeMessages(
    world,
    conversationId || "unknown",
    rawMessages as unknown[],
    deviceId,
  );
  const membersById = Object.fromEntries(
    (conversation?.members ?? []).map((m) => [m.id, m]),
  );

  const typingMembers = Object.entries(conversation?.typing ?? {})
    .filter(([id, isTyping]) => isTyping && id !== "me")
    .map(([id]) => ({
      id,
      name: membersById[id]?.name ?? id,
    }));

  const memberNames = conversation?.members?.map((m) => m.name) ?? [];
  const memberCount = conversation?.members?.length ?? 0;

  const status = (() => {
    if (typingMembers.length > 0) {
      const names = typingMembers.map((m) => m.name);
      if (names.length === 1) return `${names[0]} typing…`;
      if (names.length === 2) return `${names[0]} and ${names[1]} typing…`;
      return `${names[0]} and ${names.length - 1} others typing…`;
    }
    if (conversation?.type === "group") {
      if (conversation.description) return conversation.description;
      if (memberCount > 0) return `${memberCount} members`;
      if (memberNames.length > 0) return memberNames.slice(0, 3).join(", ");
      return "Group chat";
    }
    return "online";
  })();

  const messages = normalizedMessages.map((m): MessageData => {
    const senderName =
      conversation?.type === "group" && m.from !== "me"
        ? conversation?.members?.find((member) => member.id === m.from)?.name ??
          m.senderName ??
          m.from
        : m.senderName;
    const base = {
      id: m.id,
      from: m.from,
      timestamp: m.timestamp,
      status: m.status,
      at: m.at,
      reactions: m.reactions,
      replyTo: m.replyTo,
      senderName,
    };

    switch (m.type) {
      case "image":
        return {
          ...base,
          type: "image" as const,
          imageUrl: m.imageUrl ?? "",
          caption: m.caption,
        };
      case "video":
        return {
          ...base,
          type: "video" as const,
          videoUrl: m.videoUrl ?? "",
          thumbnailUrl: m.thumbnailUrl,
          duration: m.duration,
          caption: m.caption,
        };
      case "voice":
        return { ...base, type: "voice" as const, duration: m.duration || 0 };
      case "gif":
        return {
          ...base,
          type: "gif" as const,
          gifUrl: m.gifUrl ?? "",
        };
      case "sticker":
        return {
          ...base,
          type: "sticker" as const,
          stickerUrl: m.stickerUrl ?? "",
        };
      case "document":
        return {
          ...base,
          type: "document" as const,
          fileName: m.fileName ?? "",
          fileSize: m.fileSize ?? "",
          fileType: m.fileType,
          documentUrl: m.documentUrl ?? "",
          pageCount: m.pageCount,
        };
      case "contact":
        return {
          ...base,
          type: "contact" as const,
          contactName: m.contactName ?? "",
          contactPhone: m.contactPhone,
          contactAvatarUrl: m.contactAvatarUrl,
        };
      case "location":
        return {
          ...base,
          type: "location" as const,
          latitude: m.latitude ?? 0,
          longitude: m.longitude ?? 0,
          locationName: m.locationName,
          locationAddress: m.locationAddress,
          mapThumbnailUrl: m.mapThumbnailUrl,
        };
      case "link":
        return {
          ...base,
          type: "link" as const,
          text: m.text ?? "",
          linkPreview: m.linkPreview ?? { url: "", title: "" },
        };
      case "system":
        return {
          ...base,
          type: "system" as const,
          text: m.text ?? "",
          systemType: m.systemType as SystemMessage["systemType"],
        };
      case "call":
        return {
          ...base,
          type: "call" as const,
          callType: m.callType as "voice" | "video" | undefined,
          duration: m.duration,
        };
      case "call_missed":
        return {
          ...base,
          type: "call_missed" as const,
          callType: m.callType as "voice" | "video" | undefined,
        };
      case "screenshot_alert":
        return {
          ...base,
          type: "screenshot_alert" as const,
          text: m.text ?? "Screenshot taken",
        };
      case "text":
      default:
        return { ...base, type: "text" as const, text: m.text || "" };
    }
  });

  // TokovoRenderer already provides safeAreaInsets in design coordinates.
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;
  const bottomPadding =
    theme.spacing.inputAreaHeight + safeAreaBottom + 12;
  const keyboardState = useKeyboardState();
  const composerText =
    keyboardState.isKeyboardVisible && keyboardState.inputText
      ? keyboardState.inputText
      : (conversation?.draftText ?? "");

  return (
    <KeyboardAwareView>
      <DefaultHeader
        contactName={contactName}
        avatarUrl={conversation?.avatar}
        status={status}
        safeAreaTop={safeAreaTop}
      />

      <MessageList
        messages={messages}
        ownerName={world.devices?.[deviceId || "main_phone"]?.ownerName || "me"}
        isTyping={
          conversation?.typing &&
          Object.keys(conversation.typing).some((id) => id !== "me")
        }
        typingMembers={typingMembers}
        isGroupChat={conversation?.type === "group"}
        bottomPadding={bottomPadding}
      />

      <DefaultInputArea
        text={composerText}
        showCursor={keyboardState.isKeyboardVisible}
        safeAreaBottom={safeAreaBottom}
      />
    </KeyboardAwareView>
  );
};
