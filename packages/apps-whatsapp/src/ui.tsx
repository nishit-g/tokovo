import React from "react";
import { WorldState } from "@tokovo/core";
import { TypingBubble } from "./TypingBubble";
import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";

// ============================================================================
// AUTHENTIC iOS WHATSAPP ICONS (Pixel-Perfect SVG Replicas)
// ============================================================================

const ChevronLeftIcon = () => (
    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
        <path d="M10 2L2 10L10 18" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="84" height="60" viewBox="0 0 28 20" fill="none">
        <rect x="1" y="3" width="18" height="14" rx="3" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M19 8L26 4V16L19 12V8Z" stroke="#007AFF" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
);

const PhoneCallIcon = () => (
    <svg width="60" height="60" viewBox="0 0 20 20" fill="none">
        <path d="M18.5 14.3V16.8C18.5 17.4 18.1 17.9 17.5 18C17.1 18 16.7 18 16.3 18C8.5 17.3 2.7 11.5 2 3.7C2 3.3 2 2.9 2 2.5C2.1 1.9 2.6 1.5 3.2 1.5H5.7C6.2 1.5 6.6 1.8 6.7 2.3C6.8 3 7 3.7 7.2 4.3C7.3 4.7 7.2 5.1 6.9 5.4L5.7 6.6C6.9 8.8 8.7 10.6 10.9 11.8L12.1 10.6C12.4 10.3 12.8 10.2 13.2 10.3C13.8 10.5 14.5 10.7 15.2 10.8C15.7 10.9 16 11.3 16 11.8V14.3H18.5Z" stroke="#007AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlusCircleIcon = () => (
    <svg width="90" height="90" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="14" stroke="#007AFF" strokeWidth="1.8" />
        <path d="M15 8V22M8 15H22" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const CameraFillIcon = () => (
    <svg width="84" height="72" viewBox="0 0 28 24" fill="#007AFF">
        <path d="M4 6C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H24C25.1 22 26 21.1 26 20V8C26 6.9 25.1 6 24 6H20L18 3H10L8 6H4ZM14 18C11.2 18 9 15.8 9 13C9 10.2 11.2 8 14 8C16.8 8 19 10.2 19 13C19 15.8 16.8 18 14 18Z" />
    </svg>
);

const MicrophoneFillIcon = () => (
    <svg width="66" height="90" viewBox="0 0 22 30" fill="#007AFF">
        <rect x="6" y="2" width="10" height="16" rx="5" />
        <path d="M4 14V15C4 19.4 7.6 23 12 23C16.4 23 20 19.4 20 15V14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M11 23V28M8 28H14" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Double checkmark for read receipts
const DoubleCheckIcon: React.FC<{ read?: boolean }> = ({ read = false }) => (
    <svg width="48" height="30" viewBox="0 0 16 10" fill="none">
        <path d="M1 5L4 8L10 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8 8L14 2" stroke={read ? "#53BDEB" : "#8696A0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================================
// HEADER COMPONENT - Authentic WhatsApp iOS Navigation Bar
// ============================================================================

interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
}

const Header: React.FC<HeaderProps> = ({ contactName, avatarUrl, status = "online" }) => (
    <div style={{
        height: 270, // 90pt * 3
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "0 36px",
        marginTop: 144, // Below dynamic island
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        zIndex: 10
    }}>
        {/* Back button with unread count */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <ChevronLeftIcon />
            <span style={{
                fontSize: 51,
                color: "#007AFF",
                fontWeight: "400",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                4
            </span>
        </div>

        {/* Avatar + Name + Status (centered group) */}
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -60 // Offset for visual centering
        }}>
            {/* Avatar */}
            <div style={{
                width: 111,
                height: 111,
                borderRadius: "50%",
                background: avatarUrl
                    ? `url(${avatarUrl}) center/cover`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                marginRight: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 45,
                fontWeight: "600"
            }}>
                {!avatarUrl && contactName.charAt(0).toUpperCase()}
            </div>

            {/* Name & Status */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{
                    fontSize: 51,
                    fontWeight: "600",
                    color: "#000",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                    letterSpacing: -0.5
                }}>
                    {contactName}
                </span>
                <span style={{
                    fontSize: 36,
                    color: "#8E8E93",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {status}
                </span>
            </div>
        </div>

        {/* Action icons */}
        <div style={{ display: "flex", gap: 54, alignItems: "center" }}>
            <VideoCallIcon />
            <PhoneCallIcon />
        </div>
    </div>
);

// ============================================================================
// MESSAGE BUBBLE - Authentic WhatsApp iOS Styling
// ============================================================================

interface MessageBubbleProps {
    msg: { id: string; from: string; text: string; timestamp?: string; read?: boolean };
    layout: ChatMessageLayout;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateY, height, y } = layout;

    return (
        <div style={{
            position: "absolute",
            top: y,
            left: isMe ? "auto" : 36,
            right: isMe ? 36 : "auto",
            maxWidth: "78%",
            opacity,
            transform: `translateY(${translateY}px)`,
        }}>
            {/* Bubble with tail */}
            <div style={{
                position: "relative",
                backgroundColor: isMe ? "#E7FFDB" : "#FFFFFF",
                padding: "24px 36px",
                borderRadius: 24,
                // Asymmetric corners for tail effect
                borderTopLeftRadius: isMe ? 24 : 6,
                borderTopRightRadius: isMe ? 6 : 24,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                display: "flex",
                flexDirection: "column",
                gap: 6
            }}>
                {/* Message text */}
                <span style={{
                    fontSize: 48,
                    lineHeight: "66px",
                    color: "#111B21",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    wordWrap: "break-word"
                }}>
                    {msg.text}
                </span>

                {/* Timestamp + Read receipts */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 9,
                    marginTop: 3
                }}>
                    <span style={{
                        fontSize: 33,
                        color: "#667781",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {msg.timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={msg.read !== false} />}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGE LIST - With Authentic WhatsApp Background
// ============================================================================

interface MessageListProps {
    messages: any[];
    layout?: ChatLayoutState;
    isTyping?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, layout, isTyping }) => {
    const chatLayout = layout?.kind === "CHAT" ? (layout as ChatLayoutState) : null;
    const scrollY = chatLayout?.scrollY || 0;
    const contentHeight = chatLayout?.contentHeight || "100%";

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            // Authentic WhatsApp iOS background (beige/cream with subtle pattern)
            backgroundColor: "#ECE5DD",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c0b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
                {isTyping && (
                    <div style={{ marginLeft: 36, marginTop: 15 }}>
                        <TypingBubble />
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// INPUT AREA - Authentic WhatsApp iOS Composer
// ============================================================================

interface InputAreaProps {
    text?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ text }) => (
    <div style={{
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "24px 30px",
        gap: 24,
        borderTop: "1px solid rgba(0,0,0,0.1)"
    }}>
        {/* Plus button */}
        <PlusCircleIcon />

        {/* Input field */}
        <div style={{
            flex: 1,
            minHeight: 120,
            backgroundColor: "#FFFFFF",
            borderRadius: 60,
            padding: "27px 48px",
            display: "flex",
            alignItems: "center",
            fontSize: 48,
            color: text ? "#111B21" : "#8E8E93",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            border: "1px solid #E5E5EA",
            boxShadow: "0 1px 1px rgba(0,0,0,0.04)"
        }}>
            {text || "Message"}
        </div>

        {/* Right icons */}
        {text ? (
            <div style={{
                width: 105,
                height: 105,
                borderRadius: "50%",
                backgroundColor: "#25D366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <svg width="54" height="54" viewBox="0 0 18 18" fill="white">
                    <path d="M2 9L9 2L16 9M9 2V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(90 9 9)" />
                </svg>
            </div>
        ) : (
            <>
                <CameraFillIcon />
                <MicrophoneFillIcon />
            </>
        )}
    </div>
);

// ============================================================================
// HOME INDICATOR SPACER
// ============================================================================

const HomeIndicator: React.FC = () => (
    <div style={{
        height: 102, // 34pt * 3
        backgroundColor: "#F6F6F6",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingBottom: 24
    }}>
        <div style={{
            width: 402,
            height: 15,
            backgroundColor: "#000",
            borderRadius: 9,
            opacity: 0.2
        }} />
    </div>
);

// ============================================================================
// ROOT CONTAINER
// ============================================================================

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        backgroundColor: "#F6F6F6",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
    }}>
        {children}
    </div>
);

// ============================================================================
// EXPORTS
// ============================================================================

export const WhatsApp = {
    Root,
    Header,
    MessageList,
    InputArea
};

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];
    const isTyping = conversation?.typing?.["other"] || false;
    const draftText = "";

    return (
        <WhatsApp.Root>
            <WhatsApp.Header contactName="Alice" status="online" />
            <WhatsApp.MessageList messages={messages} layout={layout} isTyping={isTyping} />
            <WhatsApp.InputArea text={draftText} />
            <HomeIndicator />
        </WhatsApp.Root>
    );
};
