/**
 * Android UI Strategy for WhatsApp
 * 
 * Implements the Android-specific look and feel for WhatsApp.
 * Uses Material Design 3 inspired dark theme.
 */

import React from "react";
import { UIStrategy, UIStrategyRegistry, HeaderProps, MessageBubbleProps, TypingIndicatorProps, InputAreaProps } from "../ui-strategy";
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
const AndroidHeaderWrapper: React.FC<HeaderProps> = ({ conversation, safeAreaTop, onBack }) => {
    return (
        <AndroidHeader
            contactName={conversation.name || "Unknown"}
            avatarUrl={conversation.avatar}
            status={conversation.type === "group" ? `${(conversation.members?.length || 0)} participants` : "online"}
            safeAreaTop={safeAreaTop}
            onBack={onBack}
        />
    );
};

/**
 * Android Typing Indicator wrapper
 */
const AndroidTypingWrapper: React.FC<TypingIndicatorProps> = ({ typingMembers, isGroupChat }) => {
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

    // Android Dark Theme Tokens
    tokens: {
        backgroundColor: "#0B141A",
        bubbleMyBg: "#005C4B",
        bubbleOtherBg: "#202C33",
        textColor: "#E9EDEF",
        secondaryColor: "#8696A0",
        accentColor: "#00A884",
        fontFamily: "Roboto, sans-serif",
        systemMessageBg: "#182229",
        systemMessageText: "#8696A0",
        doodlePattern: "",
        doodleOpacity: 0,
    }
};

// Auto-register on import
UIStrategyRegistry.register(androidStrategy);

export default androidStrategy;
