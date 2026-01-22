/**
 * Android UI Strategy for WhatsApp
 *
 * Implements the Android-specific look and feel for WhatsApp.
 * Uses Material Design 3 inspired dark theme.
 */

import React from "react";
import {
  UIStrategy,
  UIStrategyRegistry,
  HeaderProps,
  MessageBubbleProps,
  TypingIndicatorProps,
  InputAreaProps,
} from "../ui-strategy";
import { Header as AndroidHeader } from "../../components/android/Header";
import { MessageBubble as AndroidMessageBubble } from "../../components/android/MessageBubble";
import { TypingIndicator as AndroidTypingIndicator } from "../../components/android/TypingIndicator";
import { InputArea as AndroidInputArea } from "../../components/android/InputArea";

// =============================================================================
// ANDROID STRATEGY WRAPPER COMPONENTS
// =============================================================================

/**
 * Android Header wrapper - adapts HeaderProps to Android component
 */
const AndroidHeaderWrapper: React.FC<HeaderProps> = ({
  conversation,
  safeAreaTop,
  onBack,
}) => {
  return (
    <AndroidHeader
      contactName={conversation.name || "Unknown"}
      avatarUrl={conversation.avatar}
      status={
        conversation.type === "group"
          ? `${conversation.members?.length || 0} participants`
          : "online"
      }
      safeAreaTop={safeAreaTop}
      onBack={onBack}
    />
  );
};

/**
 * Android Typing Indicator wrapper
 */
const AndroidTypingWrapper: React.FC<TypingIndicatorProps> = ({
  typingMembers,
  isGroupChat,
}) => {
  return <AndroidTypingIndicator isTyping={typingMembers.length > 0} />;
};

// =============================================================================
// ANDROID STRATEGY DEFINITION
// =============================================================================

export const androidStrategy: UIStrategy = {
  id: "whatsapp-android",
  name: "WhatsApp Android",
  platform: "android",

  // Components
  Header: AndroidHeaderWrapper,
  MessageBubble: AndroidMessageBubble as React.FC<MessageBubbleProps>,
  TypingIndicator: AndroidTypingWrapper,
  InputArea: AndroidInputArea as React.FC<InputAreaProps>,

  tokens: {
    backgroundColor: "#0B141A",
    doodlePattern: "",
    doodleOpacity: 0,

    bubbleMyBg: "#005C4B",
    bubbleMyText: "#E9EDEF",
    bubbleOtherBg: "#202C33",
    bubbleOtherText: "#E9EDEF",

    headerBg: "#1F2C34",
    headerText: "#E9EDEF",
    headerSecondary: "#8696A0",
    headerIcon: "#8696A0",

    inputBg: "#1F2C34",
    inputFieldBg: "#2A3942",
    inputBorder: "transparent",
    inputText: "#E9EDEF",
    inputPlaceholder: "#8696A0",
    inputIcon: "#8696A0",
    inputButtonBg: "#00A884",
    inputButtonIcon: "#FFFFFF",

    systemMessageBg: "#182229",
    systemMessageText: "#8696A0",

    textColor: "#E9EDEF",
    secondaryColor: "#8696A0",
    accentColor: "#00A884",
    fontFamily: "Roboto, sans-serif",

    timestampColor: "#8696A0",
    linkColor: "#53BDEB",
  },
};

// Auto-register on import
UIStrategyRegistry.register(androidStrategy);

export default androidStrategy;
