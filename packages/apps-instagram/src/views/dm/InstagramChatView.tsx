import React from "react";
import { WorldState } from "@tokovo/core";
import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";

// ============================================================================
// AUTHENTIC INSTAGRAM DM ICONS (Pixel-Perfect SVG Replicas)
// ============================================================================

const ChevronLeftIcon = () => (
    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="78" height="60" viewBox="0 0 26 20" fill="none">
        <rect x="1" y="3" width="17" height="14" rx="2" stroke="white" strokeWidth="1.8" />
        <path d="M18 8L25 4V16L18 12V8Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

const InfoIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.8" />
        <path d="M11 6V6.01M11 10V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const CameraCircleIcon = () => (
    <svg width="78" height="78" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12.5" fill="#0095F6" />
        <path d="M8 11C8 10.4 8.4 10 9 10H10.5L11.5 8.5H14.5L15.5 10H17C17.6 10 18 10.4 18 11V17C18 17.6 17.6 18 17 18H9C8.4 18 8 17.6 8 17V11Z" fill="white" />
        <circle cx="13" cy="13.5" r="2" fill="#0095F6" />
    </svg>
);

const MicrophoneIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <rect x="8" y="4" width="6" height="9" rx="3" stroke="white" strokeWidth="1.5" />
        <path d="M6 11V12C6 14.8 8.2 17 11 17C13.8 17 16 14.8 16 12V11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 17V20M9 20H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const ImageIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="14" rx="2" stroke="white" strokeWidth="1.5" />
        <circle cx="8" cy="9" r="1.5" stroke="white" strokeWidth="1" />
        <path d="M3 15L8 11L12 15L16 11L19 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StickerIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" />
        <path d="M7 13C7.8 15 9.2 16 11 16C12.8 16 14.2 15 15 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="9" r="1" fill="white" />
        <circle cx="14" cy="9" r="1" fill="white" />
    </svg>
);

const HeartIcon = () => (
    <svg width="66" height="66" viewBox="0 0 22 22" fill="none">
        <path d="M11 18L10.4 17.5C6 13.5 3 10.8 3 7.5C3 4.9 5 3 7.5 3C8.9 3 10.3 3.7 11 4.8C11.7 3.7 13.1 3 14.5 3C17 3 19 4.9 19 7.5C19 10.8 16 13.5 11.6 17.5L11 18Z" stroke="white" strokeWidth="1.5" />
    </svg>
);

// ============================================================================
// HEADER COMPONENT - Authentic Instagram DM Navigation
// ============================================================================

interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    isActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ contactName, avatarUrl, isActive = true }) => (
    <div style={{
        height: 180,
        display: "flex",
        alignItems: "center",
        padding: "0 42px",
        marginTop: 144, // Below dynamic island
        zIndex: 10
    }}>
        {/* Back button */}
        <ChevronLeftIcon />

        {/* Avatar + Name Group */}
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            marginLeft: 36,
            gap: 30
        }}>
            {/* Avatar with active indicator */}
            <div style={{ position: "relative" }}>
                <div style={{
                    width: 102,
                    height: 102,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 42,
                    fontWeight: "600"
                }}>
                    {!avatarUrl && contactName.charAt(0).toUpperCase()}
                </div>
                {isActive && (
                    <div style={{
                        position: "absolute",
                        bottom: 3,
                        right: 3,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: "#44D62D",
                        border: "4px solid #000"
                    }} />
                )}
            </div>

            {/* Username + Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{
                    fontSize: 48,
                    fontWeight: "600",
                    color: "white",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                }}>
                    {contactName}
                </span>
                <span style={{
                    fontSize: 36,
                    color: "#A8A8A8",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {isActive ? "Active now" : "Active 2h ago"}
                </span>
            </div>
        </div>

        {/* Action icons */}
        <div style={{ display: "flex", gap: 54, alignItems: "center" }}>
            <VideoCallIcon />
            <InfoIcon />
        </div>
    </div>
);

// ============================================================================
// MESSAGE BUBBLE - Authentic Instagram DM Styling with Gradient
// ============================================================================

interface MessageBubbleProps {
    msg: { id: string; from: string; text: string };
    layout: ChatMessageLayout;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 42,
            right: isMe ? 42 : "auto",
            maxWidth: "70%",
            opacity,
            transform: `translateY(${translateY}px)`,
        }}>
            <div style={{
                // Instagram gradient for sent messages
                background: isMe
                    ? "linear-gradient(to right, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)"
                    : "#262626",
                color: "white",
                padding: "30px 42px",
                borderRadius: 66, // Fully pill-shaped
                fontSize: 48,
                lineHeight: "60px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                wordWrap: "break-word"
            }}>
                {msg.text}
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGE LIST
// ============================================================================

interface MessageListProps {
    messages: any[];
    layout?: ChatLayoutState;
}

const MessageList: React.FC<MessageListProps> = ({ messages, layout }) => {
    const chatLayout = layout?.kind === "CHAT" ? (layout as ChatLayoutState) : null;
    const scrollY = chatLayout?.scrollY || 0;
    const contentHeight = chatLayout?.contentHeight || "100%";

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: contentHeight,
                transform: `translateY(-${scrollY}px)`,
                paddingTop: 30,
                paddingBottom: 30
            }}>
                {messages.map((msg: any) => {
                    const msgLayout = chatLayout?.messageLayouts[msg.id];
                    if (!msgLayout) return null;
                    return <MessageBubble key={msg.id} msg={msg} layout={msgLayout} />;
                })}
            </div>
        </div>
    );
};

// ============================================================================
// INPUT AREA - Authentic Instagram DM Composer
// ============================================================================

interface InputAreaProps {
    text?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ text }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: "24px 42px",
        gap: 24
    }}>
        {/* Input container */}
        <div style={{
            flex: 1,
            minHeight: 132,
            backgroundColor: "#262626",
            borderRadius: 66,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 18,
            border: "1px solid #363636"
        }}>
            {/* Camera button */}
            <CameraCircleIcon />

            {/* Input text */}
            <div style={{
                flex: 1,
                fontSize: 48,
                color: text ? "white" : "#A8A8A8",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                padding: "0 12px"
            }}>
                {text || "Message..."}
            </div>

            {/* Right icons - hidden when typing */}
            {!text && (
                <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                    <MicrophoneIcon />
                    <ImageIcon />
                    <StickerIcon />
                </div>
            )}
        </div>

        {/* Heart or Send button */}
        {text ? (
            <span style={{
                color: "#0095F6",
                fontSize: 48,
                fontWeight: 600,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                Send
            </span>
        ) : (
            <HeartIcon />
        )}
    </div>
);

// ============================================================================
// HOME INDICATOR
// ============================================================================

const HomeIndicator: React.FC = () => (
    <div style={{
        height: 102,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingBottom: 24
    }}>
        <div style={{
            width: 402,
            height: 15,
            backgroundColor: "white",
            borderRadius: 9,
            opacity: 0.4
        }} />
    </div>
);

// ============================================================================
// MAIN VIEW EXPORT
// ============================================================================

export const InstagramChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    return (
        <div style={{
            backgroundColor: "#000000",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: "white",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            <Header contactName="sarah.design" isActive={true} />
            <MessageList messages={messages} layout={layout} />
            <InputArea />
            <HomeIndicator />
        </div>
    );
};
