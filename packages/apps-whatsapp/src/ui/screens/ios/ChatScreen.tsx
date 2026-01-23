import React from "react";
import { WorldState } from "@tokovo/core";
import { AppSurface } from "@tokovo/core";
import { Header as DefaultHeader } from "../../../components/ios/Header";
import { MessageList } from "../../../components/ios/MessageList";
import { InputArea as DefaultInputArea } from "../../../components/ios/InputArea";
import { TypingIndicator } from "../../../components/ios/TypingIndicator";
import { UIStrategyRegistry } from "../../ui-strategy";
import {
  WhatsAppState,
  MessageData,
  WhatsAppConversation,
  SystemMessage,
} from "../../../types";

export interface ChatScreenProps {
  world: WorldState;
  deviceId?: string;
  appTheme?: string;
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
  appTheme,
  safeAreaInsets,
  width,
  height,
}) => {
  const appState = (world.appState?.["app_whatsapp"] ||
    world.appState?.["whatsapp"]) as WhatsAppState;
  const conversations = (appState?.conversations ?? {}) as Record<
    string,
    WhatsAppConversation
  >;
  const conversationId =
    appState?.conversationId || Object.keys(conversations)[0];

  const conversation = conversations[conversationId] as
    | WhatsAppConversation
    | undefined;

  // 2. Resolve UI Strategy & Tokens
  const strategy = appTheme
    ? UIStrategyRegistry.get(appTheme)
    : UIStrategyRegistry.forPlatform("ios");
  const tokens = strategy?.tokens;

  const StrategyHeader = strategy?.Header;
  const StrategyInputArea = strategy?.InputArea;

  // 3. Prepare Data
  const contactName = conversation?.name || "Unknown";
  const rawMessages = conversation?.messages || [];

  const messages = rawMessages.map((m): MessageData => {
    const base = {
      id: m.id,
      from: m.from,
      timestamp: m.timestamp,
      status: m.status,
      at: m.at,
      reactions: m.reactions,
      replyTo: m.replyTo,
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

  // 3. Calculate Safe Areas & Scaling (Resolution Independence)
  // Design Width: 393 (Standard 1x)
  const designWidth = 393;
  const targetWidth = width || 1179; // Default fallback (iPhone 16)

  // Calculate Scale
  const scale = targetWidth / designWidth;

  // Safe Areas (Physical -> Logical)
  // If safeAreaInsets not provided, assume generous safe areas
  const physicalSafeTop = safeAreaInsets?.top ?? 177; // ~59px * 3
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102; // ~34px * 3

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: tokens?.backgroundColor || "#ECE5DD",
        position: "relative",
      }}
    >
      {StrategyHeader && conversation ? (
        <StrategyHeader conversation={conversation} safeAreaTop={safeAreaTop} />
      ) : (
        <DefaultHeader
          contactName={contactName}
          avatarUrl={conversation?.avatar}
          status="online"
          safeAreaTop={safeAreaTop}
          tokens={tokens}
        />
      )}

      <MessageList
        messages={messages}
        ownerName={world.devices?.[deviceId || "main_phone"]?.ownerName || "me"}
        isTyping={
          conversation?.typing &&
          Object.keys(conversation.typing).some((id) => id !== "me")
        }
        isGroupChat={conversation?.type === "group"}
        tokens={tokens}
      />

      {StrategyInputArea ? (
        <StrategyInputArea
          text=""
          showCursor={false}
          safeAreaBottom={safeAreaBottom}
        />
      ) : (
        <DefaultInputArea
          text=""
          showCursor={false}
          safeAreaBottom={safeAreaBottom}
          tokens={tokens}
        />
      )}
    </div>
  );
};
