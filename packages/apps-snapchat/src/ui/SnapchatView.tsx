/**
 * Snapchat View - Main UI Component
 *
 * Renders the Snapchat chat interface based on current screen state.
 * Handles: chat_list (conversation list), chat (conversation view), snap_view (snap viewer).
 */

import React from "react";
import type { PluginViewProps } from "@tokovo/core";
import { SNAPCHAT_APP_ID } from "../constants.js";
import type { SnapchatState } from "../types/state.js";
import type { SnapchatConversation } from "../types/conversation.js";
import type { SnapchatMessage } from "../types/messages.js";
import { snapchatColors } from "../config/colors.js";
import {
    chatListHeaderStyle,
    chatListTitleStyle,
    conversationRowStyle,
    avatarStyle,
    sentBubbleStyle,
    receivedBubbleStyle,
    snapIndicatorStyle,
    streakBadgeStyle,
    chatInputBarStyle,
    chatInputFieldStyle,
    typingIndicatorStyle,
} from "../styles.js";

// =============================================================================
// HELPERS
// =============================================================================

function getState(world: PluginViewProps["world"]): SnapchatState {
    return (world.appState?.[SNAPCHAT_APP_ID] ?? {
        viewMode: "FEED",
        currentScreen: "chat_list",
        conversations: {},
    }) as SnapchatState;
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

const AvatarCircle: React.FC<{ name: string; avatar?: string; size: number }> = ({ name, avatar, size }) => {
    if (avatar) {
        return (
            <div style={avatarStyle(size)}>
                <img
                    src={avatar}
                    alt={name}
                    style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover" }}
                />
            </div>
        );
    }
    const initial = name.charAt(0).toUpperCase();
    return (
        <div style={avatarStyle(size)}>
            <span style={{ fontSize: size * 0.4, fontWeight: 700, color: snapchatColors.black }}>
                {initial}
            </span>
        </div>
    );
};

const StreakBadge: React.FC<{ streak: number }> = ({ streak }) => {
    if (!streak || streak < 1) return null;
    return (
        <span style={streakBadgeStyle(1)}>
            🔥 {streak}
        </span>
    );
};

const SnapStatusIcon: React.FC<{ message: SnapchatMessage }> = ({ message }) => {
    if (message.kind !== "snap") return null;
    const isReceived = !message.fromMe;
    const opened = message.snapOpened;

    const color = isReceived
        ? (opened ? snapchatColors.textSecondary : snapchatColors.snapRed)
        : (opened ? snapchatColors.textSecondary : snapchatColors.sentIndicator);

    const label = isReceived
        ? (opened ? "Opened" : "New Snap")
        : (opened ? "Opened" : "Sent");

    return (
        <span style={{ ...snapIndicatorStyle(1, isReceived ? "received" : "sent"), color }}>
            {message.snapType === "video" ? "🎬" : "📷"} {label}
        </span>
    );
};

// =============================================================================
// CHAT LIST SCREEN
// =============================================================================

const ChatListScreen: React.FC<{ state: SnapchatState }> = ({ state }) => {
    const conversations = Object.values(state.conversations ?? {});

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: snapchatColors.chatListBackground,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={chatListHeaderStyle(1)}>
                <span style={chatListTitleStyle(1)}>Chat</span>
            </div>

            {/* Conversation List */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                {conversations.map((conv) => (
                    <ChatListRow key={conv.id} conversation={conv} />
                ))}
            </div>
        </div>
    );
};

const ChatListRow: React.FC<{ conversation: SnapchatConversation }> = ({ conversation }) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const name = conversation.title
        ?? conversation.participants[0]?.name
        ?? conversation.id;
    const avatar = conversation.avatar ?? conversation.participants[0]?.avatar;

    let preview = "";
    if (lastMessage) {
        if (lastMessage.kind === "snap") {
            preview = lastMessage.fromMe ? "You sent a Snap" : "New Snap";
        } else {
            preview = lastMessage.text ?? "";
        }
    }

    const hasUnread = conversation.unreadCount > 0;

    return (
        <div style={conversationRowStyle(1)}>
            <AvatarCircle name={name} avatar={avatar} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: hasUnread ? 700 : 400,
                            color: snapchatColors.textPrimary,
                            fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {name}
                    </span>
                    {conversation.streak != null && conversation.streak > 0 && (
                        <StreakBadge streak={conversation.streak} />
                    )}
                </div>
                <div
                    style={{
                        fontSize: 13,
                        color: hasUnread ? snapchatColors.textPrimary : snapchatColors.textSecondary,
                        fontWeight: hasUnread ? 600 : 400,
                        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginTop: 2,
                    }}
                >
                    {lastMessage?.kind === "snap" && <SnapStatusIcon message={lastMessage} />}
                    {lastMessage?.kind !== "snap" && preview}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// CHAT SCREEN
// =============================================================================

const ChatScreen: React.FC<{ state: SnapchatState }> = ({ state }) => {
    const conversationId = state.activeConversationId;
    const conversation = conversationId
        ? state.conversations?.[conversationId]
        : undefined;

    if (!conversation) {
        return (
            <div style={{ width: "100%", height: "100%", backgroundColor: snapchatColors.background }} />
        );
    }

    const name = conversation.title
        ?? conversation.participants[0]?.name
        ?? conversation.id;
    const avatar = conversation.avatar ?? conversation.participants[0]?.avatar;
    const messages = conversation.messages ?? [];

    // Typing indicator
    const typingActors = Object.entries(conversation.typing ?? {})
        .filter(([, isTyping]) => isTyping)
        .map(([actor]) => actor);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: snapchatColors.background,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Chat Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    borderBottom: `0.5px solid ${snapchatColors.divider}`,
                }}
            >
                <span style={{ fontSize: 20, color: snapchatColors.textSecondary }}>‹</span>
                <AvatarCircle name={name} avatar={avatar} size={36} />
                <div style={{ flex: 1 }}>
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: snapchatColors.textPrimary,
                            fontFamily: "'SF Pro Display', -apple-system, sans-serif",
                        }}
                    >
                        {name}
                    </span>
                    {conversation.streak != null && conversation.streak > 0 && (
                        <span style={{ marginLeft: 6 }}>
                            <StreakBadge streak={conversation.streak} />
                        </span>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "8px 12px",
                    gap: 2,
                    overflow: "hidden",
                }}
            >
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {typingActors.length > 0 && (
                    <div style={typingIndicatorStyle(1)}>
                        {typingActors.join(", ")} is typing...
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div style={chatInputBarStyle(1)}>
                <span style={{ fontSize: 24 }}>📷</span>
                <div style={chatInputFieldStyle(1)}>
                    <span style={{ color: snapchatColors.inputPlaceholder }}>
                        Send a chat
                    </span>
                </div>
                <span style={{ fontSize: 20 }}>🎤</span>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: SnapchatMessage }> = ({ message }) => {
    if (message.isSystem) {
        return (
            <div
                style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: snapchatColors.textSecondary,
                    fontFamily: "'SF Pro Text', -apple-system, sans-serif",
                    padding: "6px 0",
                    fontStyle: "italic",
                }}
            >
                {message.text ?? message.systemText}
            </div>
        );
    }

    if (message.kind === "snap") {
        return (
            <div
                style={{
                    alignSelf: message.fromMe ? "flex-end" : "flex-start",
                    padding: "4px 0",
                }}
            >
                <SnapStatusIcon message={message} />
            </div>
        );
    }

    const bubbleStyle = message.fromMe
        ? sentBubbleStyle(1)
        : receivedBubbleStyle(1);

    return (
        <div style={bubbleStyle}>
            {message.text}
        </div>
    );
};

// =============================================================================
// SNAP VIEW SCREEN
// =============================================================================

const SnapViewScreen: React.FC = () => {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: snapchatColors.black,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span style={{ color: snapchatColors.white, fontSize: 18, fontFamily: "'SF Pro Text', sans-serif" }}>
                Viewing Snap...
            </span>
        </div>
    );
};

// =============================================================================
// MAIN VIEW
// =============================================================================

export const SnapchatView: React.FC<PluginViewProps> = (props) => {
    const state = getState(props.world);
    const screen = state.currentScreen ?? "chat_list";

    switch (screen) {
        case "chat":
            return <ChatScreen state={state} />;
        case "snap_view":
            return <SnapViewScreen />;
        case "chat_list":
        default:
            return <ChatListScreen state={state} />;
    }
};

export default SnapchatView;
