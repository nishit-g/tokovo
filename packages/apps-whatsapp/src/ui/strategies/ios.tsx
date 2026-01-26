/**
 * iOS UI Strategy for WhatsApp
 *
 * Implements the iOS-specific look and feel for WhatsApp.
 * Uses components from components/ios/ folder.
 */

import React from "react";
import {
  UIStrategy,
  HeaderProps,
  MessageBubbleProps,
  TypingIndicatorProps,
  InputAreaProps,
} from "../ui-strategy";
import { Header } from "../../components/Header";
import { GroupHeader } from "../../components/ios/GroupHeader";
import { MessageBubble as IOSMessageBubble } from "../../components/MessageBubble";
import { TypingIndicator as IOSTypingIndicator } from "../../components/TypingIndicator";
import { GroupTypingIndicator } from "../../components/ios/GroupTypingIndicator";
import { InputArea as IOSInputArea } from "../../components/InputArea";
import { WhatsAppGroupMember } from "../../types";

const WHATSAPP_DOODLE_PATTERN = `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.06'%3E%3Cpath d='M20 15c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z'/%3E%3Cpath d='M60 45l-3 8h6l-3-8zm-1 3h2l-1 2.5-1-2.5z'/%3E%3Cpath d='M100 25c-3 0-5 2-5 5v3h2v-3c0-1.7 1.3-3 3-3s3 1.3 3 3v3h2v-3c0-3-2-5-5-5z'/%3E%3Cpath d='M140 55c0-2.2-1.8-4-4-4h-8v8h8c2.2 0 4-1.8 4-4zm-10-2h6c1.1 0 2 .9 2 2s-.9 2-2 2h-6v-4z'/%3E%3Cpath d='M180 15l-5 5 5 5 5-5-5-5zm0 2.8l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2z'/%3E%3Cpath d='M25 75a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z'/%3E%3Cpath d='M65 95l4-6h-8l4 6z'/%3E%3Cpath d='M105 85h-6v2h6v4h2v-4h-2v-2z'/%3E%3Cpath d='M145 75c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z'/%3E%3Cpath d='M185 95c0-3-2-5-5-5s-5 2-5 5 2 5 5 5 5-2 5-5z'/%3E%3Cpath d='M30 135l-5 10h10l-5-10z'/%3E%3Cpath d='M70 145c-3 0-5 2-5 5h10c0-3-2-5-5-5z'/%3E%3Cpath d='M110 135v10h2v-10h-2z'/%3E%3Cpath d='M150 140h-10v2h10v-2z'/%3E%3Cpath d='M190 135c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5z'/%3E%3Cpath d='M35 175l3-3-3-3-3 3 3 3z'/%3E%3Cpath d='M75 180a4 4 0 100-8 4 4 0 000 8z'/%3E%3Cpath d='M115 170h-6v6h6v-6zm-4 2h2v2h-2v-2z'/%3E%3Cpath d='M155 175c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z'/%3E%3Cpath d='M195 170l-5 5v-10l5 5z'/%3E%3C/g%3E%3C/svg%3E")`;

// =============================================================================
// iOS STRATEGY COMPONENTS
// =============================================================================

/**
 * iOS Header - switches between regular and group header based on conversation type
 */
const IOSHeader: React.FC<HeaderProps> = ({
  conversation,
  safeAreaTop,
  onBack,
}) => {
  const isGroup = conversation.type === "group";

  if (isGroup) {
    // Use GroupHeader for group chats
    return (
      <GroupHeader
        groupName={conversation.name || "Group"}
        members={(conversation.members || []) as WhatsAppGroupMember[]}
        groupAvatar={conversation.avatar}
        safeAreaTop={safeAreaTop}
        onBack={onBack}
      />
    );
  }

  // Regular header for DMs
  return (
    <Header
      contactName={conversation.name || "Unknown"}
      avatarUrl={conversation.avatar}
      status="online"
      safeAreaTop={safeAreaTop}
    />
  );
};

/**
 * iOS Typing Indicator - switches between single and group typing
 */
const IOSTypingIndicatorWrapper: React.FC<TypingIndicatorProps> = ({
  typingMembers,
  isGroupChat,
}) => {
  // Don't render if no one is typing
  if (typingMembers.length === 0) {
    return null;
  }

  if (isGroupChat && typingMembers.length > 0) {
    return <GroupTypingIndicator typingMembers={typingMembers} />;
  }

  // IOSTypingIndicator doesn't take props - just render when typing
  return <IOSTypingIndicator />;
};

// =============================================================================
// IOS STRATEGY DEFINITION
// =============================================================================

export const iOSStrategy: UIStrategy = {
  id: "whatsapp-ios",
  name: "WhatsApp iOS",
  platform: "ios",

  // Components
  Header: IOSHeader,
  MessageBubble: IOSMessageBubble as React.FC<MessageBubbleProps>,
  TypingIndicator: IOSTypingIndicatorWrapper,
  InputArea: IOSInputArea as React.FC<InputAreaProps>,

  // iOS Theme Tokens - Complete token set
  tokens: {
    // Chat background
    backgroundColor: "#ECE5DD",
    doodlePattern: WHATSAPP_DOODLE_PATTERN,
    doodleOpacity: 0.06,

    // Message bubbles
    bubbleMyBg: "#DCF8C6",
    bubbleMyText: "#111B21",
    bubbleOtherBg: "#FFFFFF",
    bubbleOtherText: "#111B21",

    // Header
    headerBg: "#F6F6F6",
    headerText: "#111B21",
    headerSecondary: "#667781",
    headerIcon: "#007AFF",

    // Input area
    inputBg: "#F6F6F6",
    inputFieldBg: "#FFFFFF",
    inputBorder: "transparent",
    inputText: "#111B21",
    inputPlaceholder: "#8E8E93",
    inputIcon: "#8E8E93",
    inputButtonBg: "#007AFF",
    inputButtonIcon: "#FFFFFF",

    // System messages
    systemMessageBg: "#FDF4C5",
    systemMessageText: "#54656F",

    // General
    textColor: "#111B21",
    secondaryColor: "#667781",
    accentColor: "#00A884",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",

    // Timestamps & metadata
    timestampColor: "#667781",
    linkColor: "#027EB5",
  },
};

export default iOSStrategy;
