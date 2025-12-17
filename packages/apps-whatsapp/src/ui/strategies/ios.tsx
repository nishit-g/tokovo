/**
 * iOS UI Strategy for WhatsApp
 * 
 * Implements the iOS-specific look and feel for WhatsApp.
 * Uses components from components/ios/ folder.
 */

import React from "react";
import { UIStrategy, UIStrategyRegistry, HeaderProps, MessageBubbleProps, TypingIndicatorProps, InputAreaProps } from "../ui-strategy";
import { Header } from "../../components/ios/Header";
import { GroupHeader } from "../../components/ios/GroupHeader";
import { MessageBubble as IOSMessageBubble } from "../../components/ios/MessageBubble";
import { TypingIndicator as IOSTypingIndicator } from "../../components/ios/TypingIndicator";
import { GroupTypingIndicator } from "../../components/ios/GroupTypingIndicator";
import { InputArea as IOSInputArea } from "../../components/ios/InputArea";
import { WhatsAppGroupMember } from "../../types";

// =============================================================================
// iOS STRATEGY COMPONENTS
// =============================================================================

/**
 * iOS Header - switches between regular and group header based on conversation type
 */
const IOSHeader: React.FC<HeaderProps> = ({ conversation, safeAreaTop, onBack }) => {
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
const IOSTypingIndicatorWrapper: React.FC<TypingIndicatorProps> = ({ typingMembers, isGroupChat }) => {
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

    // iOS Theme Tokens
    tokens: {
        backgroundColor: "#ECE5DD",
        bubbleMyBg: "#DCF8C6",
        bubbleOtherBg: "#FFFFFF",
        textColor: "#111B21",
        secondaryColor: "#667781",
        accentColor: "#00A884",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    }
};

// Auto-register on import
UIStrategyRegistry.register(iOSStrategy);

export default iOSStrategy;
