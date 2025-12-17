import React from "react";
import { getAppConfig, Platform } from "@tokovo/core";

// Stub for getTokens (to be implemented properly)
const getTokens = (_platform: Platform) => ({
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
});

// ============================================================================
// CHATS LIST SCREEN - Production-Grade WhatsApp iOS Screen
// ============================================================================

export interface ChatPreview {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    time: string;
    unreadCount?: number;
    isPinned?: boolean;
    isMuted?: boolean;
    isArchived?: boolean;
    isTyping?: boolean;
    isGroup?: boolean;
}

interface ChatsListScreenProps {
    chats: ChatPreview[];
    archivedCount?: number;
    platform?: Platform;
    onChatSelect?: (chatId: string) => void;
}

/**
 * ChatsListScreen - WhatsApp Chats List
 * 
 * NOTE: This component does NOT include a status bar.
 * The status bar comes from the device frame (TokovoRenderer -> DeviceFrame).
 * This follows our architecture: Device provides chrome, App provides content.
 */
export const ChatsListScreen: React.FC<ChatsListScreenProps> = ({
    chats,
    archivedCount = 0,
    platform = "ios",
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    // Separate pinned and regular chats
    const pinnedChats = chats.filter(c => c.isPinned && !c.isArchived);
    const regularChats = chats.filter(c => !c.isPinned && !c.isArchived);

    return (
        <div style={{
            backgroundColor: "#F6F6F6",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            fontFamily: tokens.fontFamily,
        }}>
            {/* Navigation Header */}
            <ChatsHeader />

            {/* Search Bar */}
            <SearchBar platform={platform} />

            {/* Chat List */}
            <div style={{
                flex: 1,
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
            }}>
                {/* Archived Section */}
                {archivedCount > 0 && (
                    <ArchivedSection count={archivedCount} platform={platform} />
                )}

                {/* Pinned Chats */}
                {pinnedChats.map(chat => (
                    <ChatRow key={chat.id} chat={chat} platform={platform} />
                ))}

                {/* Regular Chats */}
                {regularChats.map(chat => (
                    <ChatRow key={chat.id} chat={chat} platform={platform} />
                ))}
            </div>

            {/* Tab Bar */}
            <TabBar platform={platform} activeTab="chats" />
        </div>
    );
};

// ============================================================================
// NAVIGATION HEADER - WhatsApp Chats List Header
// ============================================================================

const ChatsHeader: React.FC = () => (
    <div style={{
        marginTop: 144,  // Match statusBarHeight from config (same as chat Header)
        padding: "12px 45px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F6F6F6",
    }}>
        {/* Edit button */}
        <span style={{
            fontSize: 51,
            color: "#007AFF",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        }}>
            Edit
        </span>

        {/* Title */}
        <span style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#000",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            letterSpacing: -1,
        }}>
            Chats
        </span>

        {/* Action icons */}
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
        }}>
            {/* Camera icon */}
            <svg width="72" height="60" viewBox="0 0 24 20" fill="none">
                <path d="M4 5C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5H17L15 2H9L7 5H4ZM12 15C9.8 15 8 13.2 8 11C8 8.8 9.8 7 12 7C14.2 7 16 8.8 16 11C16 13.2 14.2 15 12 15Z" fill="#007AFF" />
            </svg>
            {/* New chat icon */}
            <svg width="66" height="60" viewBox="0 0 22 20" fill="none">
                <path d="M21 1L1 8L9 11M21 1L14 19L9 11M21 1L9 11" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    </div>
);

// ============================================================================
// SEARCH BAR
// ============================================================================

interface SearchBarProps {
    platform: Platform;
}

const SearchBar: React.FC<SearchBarProps> = ({ platform }) => {
    const tokens = getTokens(platform);

    return (
        <div style={{
            padding: "12px 30px 18px",
            backgroundColor: "#F6F6F6",
        }}>
            <div style={{
                backgroundColor: "rgba(118, 118, 128, 0.12)",
                borderRadius: 30,
                padding: "24px 36px",
                display: "flex",
                alignItems: "center",
                gap: 18,
            }}>
                {/* Search icon */}
                <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#8E8E93" strokeWidth="2" />
                    <path d="M14 14L18 18" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{
                    fontSize: 48,
                    color: "#8E8E93",
                    fontFamily: tokens.fontFamily,
                }}>
                    Ask Meta AI or Search
                </span>
            </div>
        </div>
    );
};

// ============================================================================
// ARCHIVED SECTION
// ============================================================================

interface ArchivedSectionProps {
    count: number;
    platform: Platform;
}

const ArchivedSection: React.FC<ArchivedSectionProps> = ({ count, platform }) => {
    const tokens = getTokens(platform);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "30px 45px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}>
            {/* Archive icon */}
            <div style={{
                width: 90,
                height: 90,
                backgroundColor: "#8E8E93",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 36,
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5z" />
                </svg>
            </div>
            <div style={{ flex: 1 }}>
                <span style={{
                    fontSize: 48,
                    color: "#000",
                    fontFamily: tokens.fontFamily,
                }}>
                    Archived
                </span>
            </div>
            <span style={{
                fontSize: 42,
                color: "#8E8E93",
                fontFamily: tokens.fontFamily,
            }}>
                {count}
            </span>
            {/* Chevron */}
            <svg width="30" height="48" viewBox="0 0 10 16" fill="none" style={{ marginLeft: 12 }}>
                <path d="M2 2L8 8L2 14" stroke="#C7C7CC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

// ============================================================================
// CHAT ROW
// ============================================================================

interface ChatRowProps {
    chat: ChatPreview;
    platform: Platform;
}

const ChatRow: React.FC<ChatRowProps> = ({ chat, platform }) => {
    const tokens = getTokens(platform);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "24px 45px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "#FFFFFF",
        }}>
            {/* Avatar */}
            <div style={{
                width: 144,
                height: 144,
                borderRadius: "50%",
                background: chat.avatar
                    ? `url(${chat.avatar}) center/cover`
                    : chat.isGroup
                        ? "linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                marginRight: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 54,
                fontWeight: 600,
                flexShrink: 0,
            }}>
                {!chat.avatar && (chat.isGroup ? "👥" : chat.name.charAt(0).toUpperCase())}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 9,
            }}>
                {/* Name row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span style={{
                        fontSize: 51,
                        fontWeight: 500,
                        color: "#000",
                        fontFamily: tokens.fontFamily,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {chat.name}
                    </span>
                    <span style={{
                        fontSize: 39,
                        color: chat.unreadCount ? "#007AFF" : "#8E8E93",
                        fontFamily: tokens.fontFamily,
                        flexShrink: 0,
                        marginLeft: 18,
                    }}>
                        {chat.time}
                    </span>
                </div>

                {/* Message preview row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <span style={{
                        fontSize: 45,
                        color: "#8E8E93",
                        fontFamily: tokens.fontFamily,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                    }}>
                        {chat.isTyping ? "typing..." : chat.lastMessage}
                    </span>

                    {/* Right indicators */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        marginLeft: 18,
                        flexShrink: 0,
                    }}>
                        {/* Muted icon */}
                        {chat.isMuted && (
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="#8E8E93">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                        )}

                        {/* Pinned icon */}
                        {chat.isPinned && (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="#8E8E93">
                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                            </svg>
                        )}

                        {/* Unread badge */}
                        {chat.unreadCount && chat.unreadCount > 0 && (
                            <div style={{
                                minWidth: 60,
                                height: 60,
                                backgroundColor: "#25D366",
                                borderRadius: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0 18px",
                            }}>
                                <span style={{
                                    fontSize: 39,
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                    fontFamily: tokens.fontFamily,
                                }}>
                                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                </span>
                            </div>
                        )}

                        {/* Chevron */}
                        <svg width="24" height="42" viewBox="0 0 8 14" fill="none">
                            <path d="M1 1L7 7L1 13" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// TAB BAR
// ============================================================================

interface TabBarProps {
    platform: Platform;
    activeTab: "status" | "calls" | "communities" | "chats" | "settings";
}

const TabBar: React.FC<TabBarProps> = ({ platform, activeTab }) => {
    const tabs = [
        { id: "status", label: "Status", icon: StatusIcon },
        { id: "calls", label: "Calls", icon: CallsIcon },
        { id: "communities", label: "Communities", icon: CommunitiesIcon },
        { id: "chats", label: "Chats", icon: ChatsIcon },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ] as const;

    return (
        <div style={{
            height: 246,
            backgroundColor: "#F6F6F6",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-around",
            paddingTop: 24,
        }}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;

                return (
                    <div key={tab.id} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 9,
                        width: 180,
                    }}>
                        <IconComponent active={isActive} />
                        <span style={{
                            fontSize: 33,
                            color: isActive ? "#007AFF" : "#8E8E93",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        }}>
                            {tab.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// Tab Icons
const StatusIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={active ? "#007AFF" : "#8E8E93"} strokeWidth="2" strokeDasharray="4 2" />
    </svg>
);

const CallsIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={active ? "#007AFF" : "#8E8E93"}>
        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
    </svg>
);

const CommunitiesIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={active ? "#007AFF" : "#8E8E93"}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
);

const ChatsIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={active ? "#007AFF" : "#8E8E93"}>
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
    </svg>
);

const SettingsIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={active ? "#007AFF" : "#8E8E93"}>
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
);

export default ChatsListScreen;
