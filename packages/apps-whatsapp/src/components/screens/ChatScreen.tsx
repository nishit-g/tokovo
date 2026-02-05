import React from "react";
import { WorldState } from "@tokovo/core";
import { KeyboardAwareView } from "@tokovo/react";
import { Header as DefaultHeader } from "../Header";
import { MessageList } from "../MessageList";
import { InputArea as DefaultInputArea } from "../InputArea";
import { useTheme } from "../../theme/context";
import {
  WhatsAppState,
  MessageData,
  WhatsAppConversation,
  SystemMessage,
} from "../../types";
import { normalizeMessages } from "../../utils/messages";

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
  width,
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
  const typingMembers = Object.entries(conversation?.typing ?? {})
    .filter(([id, isTyping]) => isTyping && id !== "me")
    .map(([id]) => id);

  const memberNames = conversation?.members?.map((m) => m.name) ?? [];
  const memberCount = conversation?.members?.length ?? 0;

  const status = (() => {
    if (typingMembers.length > 0) {
      const preview = typingMembers.slice(0, 2).join(", ");
      const suffix = typingMembers.length > 2 ? "…" : "";
      return `${preview}${suffix} typing…`;
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
      case "text":
      default:
        return { ...base, type: "text" as const, text: m.text || "" };
    }
  });

  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;
  const bottomPadding =
    theme.spacing.inputAreaHeight + safeAreaBottom + 12;

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
        isGroupChat={conversation?.type === "group"}
        bottomPadding={bottomPadding}
      />

      <DefaultInputArea
        text=""
        showCursor={false}
        safeAreaBottom={safeAreaBottom}
      />
    </KeyboardAwareView>
  );
};
