/**
 * Snapchat View — 1:1 Pixel-accurate
 *
 * Every detail matches real Snapchat mobile:
 * - Bottom nav: Map / Chat / Camera (center circle) / Stories / Spotlight
 * - Centered-stack chat header: bitmoji centered, name below, back + icons flanking
 * - Fully rounded pill bubbles, no border on received
 * - CSS-animated bouncing typing dots
 * - SVG line icons (no emoji)
 * - Colored indicator subtitles (red for snaps, blue for chats)
 * - Dynamic timestamps from message data
 * - Safe area insets + keyboard-aware layout
 */

import React, { useEffect, useRef } from "react";
import { useSafeAreaInsets, useKeyboardHeight } from "@tokovo/react";
import type { PluginViewProps } from "@tokovo/core";
import { SNAPCHAT_APP_ID } from "../constants.js";
import type { SnapchatState } from "../types/state.js";
import type { SnapchatConversation } from "../types/conversation.js";
import type { SnapchatMessage } from "../types/messages.js";
import { snapchatColors } from "../config/colors.js";
import { snapchatSpacing } from "../config/tokens.js";
import {
    chatListHeaderStyle,
    chatListHeaderTopRow,
    chatListTitleStyle,
    searchBarStyle,
    conversationRowStyle,
    bitmojiCircleStyle,
    sentBubbleContainerStyle,
    receivedBubbleContainerStyle,
    sentBubbleStyle,
    receivedBubbleStyle,
    sentEdgeLineStyle,
    receivedEdgeLineStyle,
    typingIndicatorContainerStyle,
    typingDotStyle,
    chatInputBarStyle,
    chatInputFieldStyle,
    indicatorShapeStyle,
    streakBadgeStyle,
    systemMessageStyle,
    bottomNavBarStyle,
    bottomNavItemStyle,
    chatHeaderCenteredStyle,
    chatHeaderSideIconsStyle,
    injectSnapchatStyles,
} from "../styles.js";

const FONT = "'Avenir Next', 'Avenir', -apple-system, sans-serif";

// =============================================================================
// SVG ICONS (thin stroke, matching Snapchat's SF Symbol style)
// =============================================================================

const SearchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = snapchatColors.inputPlaceholder }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const PhoneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = snapchatColors.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
);

const VideoIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = snapchatColors.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const CameraIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = snapchatColors.black }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const MicIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = snapchatColors.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const SmileyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = snapchatColors.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);

const BackArrowIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = snapchatColors.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ComposeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = snapchatColors.textSecondary }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="12" y1="7" x2="12" y2="13" />
    </svg>
);

// Bottom nav icons
const MapPinIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ChatBubbleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);

const StoriesIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const SpotlightIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

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

/** Format timestamp to relative time string */
function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d`;
}

/** Get indicator color for subtitle text */
function getSubtitleColor(lastMessage?: SnapchatMessage, hasUnread?: boolean): string {
    if (!lastMessage || !hasUnread) return snapchatColors.textSecondary;
    if (lastMessage.kind === "snap") return snapchatColors.indicatorRed;
    return snapchatColors.indicatorBlue;
}

// =============================================================================
// SHARED SUBCOMPONENTS
// =============================================================================

const BitmojiAvatar: React.FC<{ name: string; avatar?: string; size: number }> = ({ name, avatar, size }) => {
    const initial = name.charAt(0).toUpperCase();
    return (
        <div style={bitmojiCircleStyle(size)}>
            {avatar ? (
                <img
                    src={avatar}
                    alt={name}
                    style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover" }}
                />
            ) : (
                <span
                    style={{
                        fontSize: size * 0.38,
                        fontWeight: 700,
                        color: snapchatColors.textSecondary,
                        fontFamily: FONT,
                    }}
                >
                    {initial}
                </span>
            )}
        </div>
    );
};

/** Group chat: stacked overlapping avatars */
const GroupAvatar: React.FC<{ participants: Array<{ name: string; avatar?: string }>; size: number }> = ({
    participants,
    size,
}) => {
    const miniSize = size * 0.65;
    const shown = participants.slice(0, 2);
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            {shown.map((p, i) => (
                <div
                    key={p.name + i}
                    style={{
                        position: "absolute",
                        top: i === 0 ? 0 : size - miniSize,
                        left: i === 0 ? 0 : size - miniSize,
                        zIndex: i === 0 ? 1 : 2,
                    }}
                >
                    <BitmojiAvatar name={p.name} avatar={p.avatar} size={miniSize} />
                </div>
            ))}
        </div>
    );
};

const StreakBadge: React.FC<{ streak: number }> = ({ streak }) => {
    if (!streak || streak < 1) return null;
    return <span style={streakBadgeStyle()}>🔥 {streak}</span>;
};

/** CSS-animated bouncing typing dots */
const TypingDots: React.FC = () => (
    <div style={typingIndicatorContainerStyle()}>
        <div style={receivedEdgeLineStyle()} />
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: snapchatSpacing.typingDotGap,
                padding: "8px 12px",
                backgroundColor: snapchatColors.receivedBubble,
                borderRadius: snapchatSpacing.bubbleBorderRadius,
            }}
        >
            <div style={typingDotStyle(0)} />
            <div style={typingDotStyle(1)} />
            <div style={typingDotStyle(2)} />
        </div>
    </div>
);

const IndicatorShape: React.FC<{ lastMessage?: SnapchatMessage }> = ({ lastMessage }) => {
    if (!lastMessage) return null;
    const isSnap = lastMessage.kind === "snap";
    const isOpened = isSnap ? lastMessage.snapOpened : lastMessage.status === "opened";
    return <div style={indicatorShapeStyle(isSnap ? "snap" : "chat", !!isOpened)} />;
};

// =============================================================================
// BOTTOM NAV BAR — Map / Chat / Camera / Stories / Spotlight
// =============================================================================

const NAV_ITEMS = [
    { id: "map", label: "Map", Icon: MapPinIcon },
    { id: "chat", label: "Chat", Icon: ChatBubbleIcon },
    { id: "camera", label: "", Icon: CameraIcon },
    { id: "stories", label: "Stories", Icon: StoriesIcon },
    { id: "spotlight", label: "Spotlight", Icon: SpotlightIcon },
] as const;

const BottomNavBar: React.FC<{ activeTab?: string }> = ({ activeTab = "chat" }) => (
    <div style={bottomNavBarStyle()}>
        {NAV_ITEMS.map((item) => {
            const active = item.id === activeTab;
            const isCamera = item.id === "camera";
            const color = active ? snapchatColors.textPrimary : snapchatColors.textSecondary;

            if (isCamera) {
                return (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: snapchatColors.yellow,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            }}
                        >
                            <CameraIcon size={22} color={snapchatColors.black} />
                        </div>
                    </div>
                );
            }

            return (
                <div key={item.id} style={bottomNavItemStyle(active)}>
                    <item.Icon size={22} color={color} />
                    <span>{item.label}</span>
                </div>
            );
        })}
    </div>
);

// =============================================================================
// CHAT LIST SCREEN
// =============================================================================

const ChatListScreen: React.FC<{ state: SnapchatState; safeTop: number; safeBottom: number }> = ({
    state,
    safeTop,
    safeBottom,
}) => {
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
                paddingTop: safeTop,
                boxSizing: "border-box",
            }}
        >
            {/* Header */}
            <div style={chatListHeaderStyle()}>
                <div style={chatListHeaderTopRow()}>
                    <BitmojiAvatar name="Me" size={30} />
                    <span style={chatListTitleStyle()}>Chat</span>
                    <ComposeIcon size={24} color={snapchatColors.textSecondary} />
                </div>
                <div style={searchBarStyle()}>
                    <SearchIcon size={14} color={snapchatColors.inputPlaceholder} />
                    <span style={{ fontSize: 14, color: snapchatColors.inputPlaceholder, fontFamily: FONT }}>
                        Search
                    </span>
                </div>
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                {conversations.map((conv) => (
                    <ChatListRow key={conv.id} conversation={conv} />
                ))}
            </div>

            {/* Bottom nav */}
            <div style={{ paddingBottom: safeBottom }}>
                <BottomNavBar activeTab="chat" />
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
    const isGroup = conversation.isGroup && conversation.participants.length > 1;

    let subtitle = "";
    if (lastMessage) {
        if (lastMessage.kind === "snap") {
            subtitle = lastMessage.fromMe
                ? (lastMessage.snapOpened ? "Opened" : "Delivered")
                : (lastMessage.snapOpened ? "Opened" : "New Snap");
        } else if (lastMessage.isSystem) {
            subtitle = lastMessage.systemText ?? lastMessage.text ?? "";
        } else {
            subtitle = lastMessage.fromMe
                ? (lastMessage.status === "opened" ? "Opened" : "Delivered")
                : "New Chat";
        }
    }

    const hasUnread = conversation.unreadCount > 0;
    const subtitleColor = getSubtitleColor(lastMessage, hasUnread);
    const timeStr = lastMessage ? formatRelativeTime(lastMessage.timestamp) : "";

    return (
        <div style={conversationRowStyle()}>
            {isGroup ? (
                <GroupAvatar participants={conversation.participants} size={snapchatSpacing.bitmojiSizeList} />
            ) : (
                <BitmojiAvatar name={name} avatar={avatar} size={snapchatSpacing.bitmojiSizeList} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: hasUnread ? 700 : 400,
                            color: snapchatColors.textPrimary,
                            fontFamily: FONT,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                        }}
                    >
                        {name}
                    </span>
                    {/* Streak right-aligned */}
                    {conversation.streak !== null && conversation.streak !== undefined && conversation.streak > 0 && (
                        <StreakBadge streak={conversation.streak} />
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <IndicatorShape lastMessage={lastMessage} />
                    <span
                        style={{
                            fontSize: 12,
                            color: hasUnread ? subtitleColor : snapchatColors.textSecondary,
                            fontWeight: hasUnread ? 600 : 400,
                            fontFamily: FONT,
                        }}
                    >
                        {subtitle}
                    </span>
                    {timeStr && (
                        <span style={{ fontSize: 11, color: snapchatColors.textTimestamp, fontFamily: FONT }}>
                            · {timeStr}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// CHAT SCREEN — Centered header, keyboard-aware
// =============================================================================

const ChatScreen: React.FC<{
    state: SnapchatState;
    safeTop: number;
    safeBottom: number;
    keyboardHeight: number;
}> = ({ state, safeTop, safeBottom, keyboardHeight }) => {
    const conversationId = state.activeConversationId;
    const conversation = conversationId ? state.conversations?.[conversationId] : undefined;

    if (!conversation) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: snapchatColors.backgroundChat,
                    paddingTop: safeTop,
                    paddingBottom: safeBottom,
                    boxSizing: "border-box",
                }}
            />
        );
    }

    const name = conversation.title ?? conversation.participants[0]?.name ?? conversation.id;
    const avatar = conversation.avatar ?? conversation.participants[0]?.avatar;
    const messages = conversation.messages ?? [];
    const typingActors = Object.entries(conversation.typing ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k);

    const messageListRef = useRef<HTMLDivElement>(null);
    const lastMessageId = messages[messages.length - 1]?.id;

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages.length, lastMessageId, typingActors.length, keyboardHeight]);

    return (
        <div
            style={{
                width: "100%",
                height: keyboardHeight > 0 ? `calc(100% - ${keyboardHeight}px)` : "100%",
                backgroundColor: snapchatColors.backgroundChat,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                paddingTop: safeTop,
                paddingBottom: keyboardHeight > 0 ? 0 : safeBottom,
                boxSizing: "border-box",
            }}
        >
            {/* Centered chat header */}
            <div style={chatHeaderCenteredStyle()}>
                {/* Left side icons */}
                <div style={{ ...chatHeaderSideIconsStyle(), left: 14 }}>
                    <BackArrowIcon size={22} color={snapchatColors.textSecondary} />
                </div>

                {/* Center: bitmoji + name */}
                <BitmojiAvatar name={name} avatar={avatar} size={snapchatSpacing.avatarSizeChat} />
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 3,
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: snapchatColors.textPrimary,
                            fontFamily: FONT,
                        }}
                    >
                        {name}
                    </span>
                    {conversation.streak !== null && conversation.streak !== undefined && conversation.streak > 0 && (
                        <StreakBadge streak={conversation.streak} />
                    )}
                </div>

                {/* Right side icons */}
                <div style={{ ...chatHeaderSideIconsStyle(), right: 14 }}>
                    <PhoneIcon size={20} color={snapchatColors.textSecondary} />
                    <VideoIcon size={20} color={snapchatColors.textSecondary} />
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messageListRef}
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "8px 14px",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                {messages.map((msg, i) => {
                    const prev = messages[i - 1];
                    const showGroupGap = prev && prev.fromMe !== msg.fromMe;
                    return (
                        <div key={msg.id} style={{ marginTop: showGroupGap ? snapchatSpacing.groupSpacing : 0 }}>
                            <MessageRow message={msg} />
                        </div>
                    );
                })}
                {typingActors.length > 0 && (
                    <div style={{ marginTop: snapchatSpacing.groupSpacing }}>
                        <TypingDots />
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div style={chatInputBarStyle()}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: snapchatColors.yellow,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <CameraIcon size={18} color={snapchatColors.black} />
                </div>
                <div style={chatInputFieldStyle()}>
                    <span>Send a chat</span>
                </div>
                <SmileyIcon size={22} color={snapchatColors.textSecondary} />
                <MicIcon size={20} color={snapchatColors.textSecondary} />
            </div>
        </div>
    );
};

/** Single message row */
const MessageRow: React.FC<{ message: SnapchatMessage }> = ({ message }) => {
    if (message.isSystem) {
        return (
            <div style={systemMessageStyle(message.systemType)}>
                {message.text ?? message.systemText ?? ""}
            </div>
        );
    }

    if (message.kind === "snap") {
        const isReceived = !message.fromMe;
        const opened = message.snapOpened;
        const color = isReceived
            ? (opened ? snapchatColors.indicatorGray : snapchatColors.indicatorRed)
            : (opened ? snapchatColors.indicatorGray : snapchatColors.arrowSent);
        const label = isReceived
            ? (opened ? "Opened" : message.snapType === "video" ? "New Video" : "New Snap")
            : (opened ? "Opened" : "Delivered");

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 0",
                    justifyContent: "flex-start",
                }}
            >
                <div
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: `8px solid ${color}`,
                        borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent",
                    }}
                />
                <span style={{ fontSize: 12, color, fontFamily: FONT, fontWeight: 500 }}>
                    {label}
                </span>
            </div>
        );
    }

    if (message.fromMe) {
        return (
            <div style={sentBubbleContainerStyle()}>
                <div style={sentBubbleStyle()}>{message.text}</div>
                <div style={sentEdgeLineStyle()} />
            </div>
        );
    }

    return (
        <div style={receivedBubbleContainerStyle()}>
            <div style={receivedEdgeLineStyle()} />
            <div style={receivedBubbleStyle()}>{message.text}</div>
        </div>
    );
};

// =============================================================================
// SNAP VIEW
// =============================================================================

const SnapViewScreen: React.FC = () => (
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
        <span style={{ color: snapchatColors.white, fontSize: 18, fontFamily: FONT }}>
            Viewing Snap...
        </span>
    </div>
);

// =============================================================================
// MAIN
// =============================================================================

export const SnapchatView: React.FC<PluginViewProps> = (props) => {
    const state = getState(props.world);
    const screen = state.currentScreen ?? "chat_list";
    const safeArea = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();

    // Inject CSS animations on mount
    useEffect(() => {
        injectSnapchatStyles();
    }, []);

    switch (screen) {
        case "chat":
            return (
                <ChatScreen
                    state={state}
                    safeTop={safeArea.top}
                    safeBottom={safeArea.bottom}
                    keyboardHeight={keyboardHeight}
                />
            );
        case "snap_view":
            return <SnapViewScreen />;
        case "chat_list":
        default:
            return (
                <ChatListScreen
                    state={state}
                    safeTop={safeArea.top}
                    safeBottom={safeArea.bottom}
                />
            );
    }
};

export default SnapchatView;
