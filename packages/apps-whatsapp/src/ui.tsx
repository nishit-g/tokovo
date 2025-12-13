import React from "react";
import { WorldState, Platform, getTokens, getTypography, getAppConfig, iOSTokens, androidTokens } from "@tokovo/core";

import { LayoutState, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";
import { ImageMessageBubble, VideoMessageBubble, GifMessageBubble } from "./components/MediaBubbles";
import { shouldShowSenderName } from "./config";

// Get platform-specific config
const getWhatsAppConfig = (platform: Platform) => getAppConfig("whatsapp", platform);

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
// HEADER COMPONENT - Fully Configurable WhatsApp Navigation Bar
// ============================================================================

interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
    platform?: Platform;
}

const Header: React.FC<HeaderProps> = ({
    contactName,
    avatarUrl,
    status = "online",
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            height: config.headerHeight,
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `0 ${config.bubbleMarginHorizontal}px`,
            marginTop: config.statusBarHeight,
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            zIndex: 10,
            fontFamily: tokens.fontFamily
        }}>
            {/* Back button with unread count */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <ChevronLeftIcon />
                <span style={{
                    fontSize: config.headerTitleSize,
                    color: platform === "ios" ? "#007AFF" : "#FFFFFF",
                    fontWeight: "400"
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
                marginLeft: -60
            }}>
                {/* Avatar */}
                <div style={{
                    width: config.avatarSize,
                    height: config.avatarSize,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginRight: config.avatarMargin,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: config.avatarSize * 0.4,
                    fontWeight: "600"
                }}>
                    {!avatarUrl && contactName.charAt(0).toUpperCase()}
                </div>

                {/* Name & Status */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{
                        fontSize: config.headerTitleSize,
                        fontWeight: "600",
                        color: platform === "ios" ? "#000000" : "#FFFFFF",
                        letterSpacing: -0.5
                    }}>
                        {contactName}
                    </span>
                    <span style={{
                        fontSize: config.headerSubtitleSize,
                        color: platform === "ios" ? "#8E8E93" : "rgba(255,255,255,0.7)"
                    }}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Action icons */}
            <div style={{ display: "flex", gap: config.headerIconGap, alignItems: "center" }}>
                <VideoCallIcon />
                <PhoneCallIcon />
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGE BUBBLE - Authentic WhatsApp iOS Styling
// ============================================================================

interface MessageBubbleProps {
    msg: {
        id: string;
        from: string;
        text: string;
        timestamp?: string;
        read?: boolean;
        reactions?: Array<{ emoji: string; count: number; fromMe?: boolean }>;
        replyTo?: { messageId: string; text: string; from: string; type?: string };
    };
    layout: ChatMessageLayout;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const { opacity, translateX, translateY, rect } = layout;

    // Safety check - layout should always have rect if computed correctly
    if (!rect) return null;

    const hasReactions = msg.reactions && msg.reactions.length > 0;

    return (
        <div style={{
            position: "absolute",
            top: rect.y,
            left: rect.x,
            width: rect.width,
            // height: rect.height, // Optional, let content dictate height unless clipping
            opacity,
            transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
            zIndex: 1, // Ensure bubbles are above background
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
                gap: 6,
                marginBottom: hasReactions ? 30 : 0,
            }}>
                {/* Reply Quote - if replying to a message */}
                {msg.replyTo && (
                    <div style={{
                        display: "flex",
                        gap: 0,
                        backgroundColor: isMe ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.03)",
                        borderRadius: 18,
                        overflow: "hidden",
                        marginBottom: 12,
                    }}>
                        {/* Colored bar */}
                        <div style={{
                            width: 12,
                            backgroundColor: msg.replyTo.from === "me" ? "#25D366" : "#34B7F1",
                            flexShrink: 0,
                        }} />
                        <div style={{ flex: 1, padding: "15px 18px" }}>
                            <div style={{
                                fontSize: 36,
                                fontWeight: 600,
                                color: msg.replyTo.from === "me" ? "#25D366" : "#34B7F1",
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                                marginBottom: 6,
                            }}>
                                {msg.replyTo.from === "me" ? "You" : msg.replyTo.from}
                            </div>
                            <div style={{
                                fontSize: 39,
                                color: "#667781",
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                                {msg.replyTo.text}
                            </div>
                        </div>
                    </div>
                )}

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

            {/* Reactions Bar - Shows below the bubble */}
            {hasReactions && (
                <div style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginTop: -18,
                    position: "relative",
                    zIndex: 1,
                }}>
                    <div style={{
                        display: "flex",
                        gap: 6,
                        backgroundColor: "#FFFFFF",
                        padding: "9px 18px",
                        borderRadius: 60,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        border: "1px solid rgba(0,0,0,0.05)",
                    }}>
                        {msg.reactions!.map((reaction, i) => (
                            <div key={i} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                backgroundColor: reaction.fromMe ? "rgba(37, 211, 102, 0.15)" : "transparent",
                                padding: "3px 9px",
                                borderRadius: 30,
                            }}>
                                <span style={{ fontSize: 42, lineHeight: 1 }}>{reaction.emoji}</span>
                                {reaction.count > 1 && (
                                    <span style={{
                                        fontSize: 33,
                                        color: "#667781",
                                        fontWeight: 500,
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                                    }}>
                                        {reaction.count}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
    typingFrom?: string;  // Who is currently typing
    conversationType?: "dm" | "group";
    platform?: Platform;
    ownerName?: string;  // Device owner for POV - their messages appear on right
}

/**
 * Standardized container that obeys layout rects exclusively.
 */
const SimpleMessageContainer: React.FC<{
    layout?: ChatMessageLayout;
    isMe: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
}> = ({ layout, isMe, children, style }) => {
    if (!layout || !layout.rect) return null;
    const { opacity, translateX, translateY, rect } = layout;

    return (
        <div style={{
            position: "absolute",
            top: rect.y,
            left: rect.x,
            width: rect.width,
            opacity,
            transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
            zIndex: 1,
            ...style
        }}>
            {children}
        </div>
    );
};

const MessageList: React.FC<MessageListProps> = ({
    messages,
    layout,
    isTyping,
    typingFrom,
    conversationType,
    platform = "ios",
    ownerName = "me"  // Default to "me" for backward compatibility
}) => {
    const isGroup = conversationType === "group";
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);
    const chatLayout = layout?.kind === "CHAT" ? (layout as ChatLayoutState) : null;
    const scrollY = chatLayout?.scrollY || 0;
    const contentHeight = chatLayout?.contentHeight || 1500;

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundColor: config.chatBackground,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c0b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
            {/* Scrollable content container */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: contentHeight,
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.15s ease-out"
            }}>
                {messages.map((msg: any, index: number) => {
                    const msgLayout = chatLayout?.messageLayouts[msg.id];
                    const y = msgLayout?.y ?? 0;
                    const opacity = msgLayout?.opacity ?? 1;
                    const translateY = msgLayout?.translateY ?? 0;

                    // Determine if sender name should be shown
                    // Must match logic in layout-config.ts calculateMessageHeight:
                    // Only for group chats, not for me, not system, and only if different from previous sender
                    const prevMsg = index > 0 ? messages[index - 1] : undefined;
                    const isMe = msg.from === ownerName;
                    const showSenderName = shouldShowSenderName({
                        from: msg.from,
                        type: msg.type,
                        isGroupChat: isGroup,
                        prevFrom: prevMsg?.from
                    });



                    // Render system messages (centered pills)
                    if (msg.type === "system") {
                        return (
                            <div key={msg.id} style={{
                                position: "absolute",
                                top: y,
                                left: 0,
                                right: 0,
                                opacity,
                                transform: `translateY(${translateY}px)`,
                                display: "flex",
                                justifyContent: "center",
                                padding: `0 ${config.bubbleMarginHorizontal * 1.5}px`
                            }}>
                                <div style={{
                                    backgroundColor: "rgba(225, 218, 208, 0.9)",
                                    padding: `${config.bubblePadding * 0.75}px ${config.bubblePaddingHorizontal}px`,
                                    borderRadius: config.bubbleRadius
                                }}>
                                    <span style={{
                                        fontSize: config.timestampSize,
                                        color: "#54656F",
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        {msg.text}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    // Render voice messages
                    if (msg.type === "voice") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe}>
                                <VoiceMessageBubble
                                    isMe={isMe}
                                    duration={msg.duration || 15}
                                    isPlaying={msg.isPlaying}
                                    progress={msg.playProgress || 0}
                                    read={msg.status === "read"}
                                    senderName={showSenderName ? msg.from : undefined}
                                    platform={platform}
                                />
                            </SimpleMessageContainer>
                        );
                    }

                    // Render Image messages
                    if (msg.type === "image") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe}>
                                <ImageMessageBubble
                                    imageUrl={msg.imageUrl || ""}
                                    caption={msg.caption}
                                    isMe={isMe}
                                    timestamp={msg.timestamp}
                                    read={msg.status === "read"}
                                    senderName={showSenderName ? msg.from : undefined}
                                    platform={platform}
                                />
                            </SimpleMessageContainer>
                        );
                    }

                    // Render Video messages
                    if (msg.type === "video") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe}>
                                <VideoMessageBubble
                                    thumbnailUrl={msg.thumbnailUrl || ""}
                                    duration={msg.duration || 0}
                                    caption={msg.caption}
                                    isMe={isMe}
                                    timestamp={msg.timestamp}
                                    read={msg.status === "read"}
                                    isPlaying={msg.isPlaying}
                                    playProgress={msg.playProgress || 0}
                                    senderName={showSenderName ? msg.from : undefined}
                                    platform={platform}
                                />
                            </SimpleMessageContainer>
                        );
                    }

                    // Render GIF messages
                    if (msg.type === "gif") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe}>
                                <GifMessageBubble
                                    gifUrl={msg.gifUrl || ""}
                                    isMe={isMe}
                                    timestamp={msg.timestamp}
                                    read={msg.status === "read"}
                                    senderName={showSenderName ? msg.from : undefined}
                                    platform={platform}
                                />
                            </SimpleMessageContainer>
                        );
                    }


                    if (msg.type === "deleted") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe}>
                                <div style={{
                                    backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                                    padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                                    borderRadius: config.bubbleRadius,
                                    borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                                    borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                                    boxShadow: config.bubbleShadow,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 6
                                }}>
                                    {/* Sender Name (Group Chat) */}
                                    {showSenderName && (
                                        <div style={{
                                            fontSize: config.senderNameSize,
                                            fontWeight: 600,
                                            color: config.senderNameColor,
                                            marginBottom: 3
                                        }}>
                                            {msg.from}
                                        </div>
                                    )}

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        fontStyle: "italic",
                                        color: config.timestampColor
                                    }}>
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                        </svg>
                                        <span style={{ fontSize: config.messageTextSize * 0.9 }}>
                                            This message was deleted
                                        </span>
                                    </div>
                                </div>
                            </SimpleMessageContainer>
                        );
                    }

                    // Render Screenshot Alert (Psychotic feature)
                    if (msg.type === "screenshot_alert") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe} style={{ display: "flex", justifyContent: "center", width: "100%", left: 0 }}>
                                <div style={{
                                    backgroundColor: config.screenshotAlertBg,
                                    padding: "15px 45px",
                                    borderRadius: 45,
                                    border: `1px solid ${config.screenshotAlertText}`,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 15
                                }}>
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={config.screenshotAlertText} strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    <span style={{
                                        fontSize: 30,
                                        color: config.screenshotAlertText,
                                        fontWeight: 600,
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        Took a screenshot!
                                    </span>
                                </div>
                            </SimpleMessageContainer>
                        );
                    }

                    // Render Missed Call (Psychotic feature)
                    if (msg.type === "call_missed") {
                        return (
                            <SimpleMessageContainer layout={msgLayout} isMe={isMe} style={{ left: "50%", width: "auto", transform: `translateX(-50%) translateY(${translateY}px)` }}>
                                <div style={{
                                    backgroundColor: config.missedCallBubbleColor,
                                    padding: "24px 45px",
                                    borderRadius: 24,
                                    boxShadow: config.bubbleShadow,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 9
                                }}>
                                    <span style={{
                                        fontSize: config.messageTextSize,
                                        color: config.bubbleTextColor,
                                        fontWeight: 500,
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        Missed voice call
                                    </span>
                                    <span style={{
                                        fontSize: config.timestampSize,
                                        color: config.timestampColor
                                    }}>
                                        10:45
                                    </span>
                                </div>
                            </SimpleMessageContainer>
                        );
                    }

                    // Render regular text messages
                    return (
                        <SimpleMessageContainer layout={msgLayout} isMe={isMe}>
                            <div style={{
                                backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                                padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                                borderRadius: config.bubbleRadius,
                                borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                                borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                                boxShadow: config.bubbleShadow,
                                display: "flex",
                                flexDirection: "column",
                                gap: config.bubbleGap / 2
                            }}>
                                {/* Sender name for GROUP chats only */}
                                {showSenderName && (
                                    <div style={{
                                        fontSize: config.senderNameSize,
                                        fontWeight: 600,
                                        color: config.senderNameColor,
                                        marginBottom: 3
                                    }}>
                                        {msg.from}
                                    </div>
                                )}

                                {/* Message text */}
                                <span style={{
                                    fontSize: config.messageTextSize,
                                    lineHeight: `${config.messageLineHeight}px`,
                                    color: config.bubbleTextColor,
                                    fontFamily: tokens.fontFamily,
                                    wordWrap: "break-word"
                                }}>
                                    {msg.text}
                                </span>

                                {/* Timestamp + Read receipts + Edited */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    gap: config.bubbleGap * 0.75,
                                    marginTop: 3
                                }}>
                                    {(msg as any).edited && (
                                        <span style={{
                                            fontSize: config.editedLabelSize,
                                            color: config.editedLabelColor,
                                            fontFamily: tokens.fontFamily,
                                            marginRight: 6
                                        }}>
                                            Edited
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: config.timestampSize,
                                        color: config.timestampColor,
                                        fontFamily: tokens.fontFamily
                                    }}>
                                        {msg.timestamp || "10:42"}
                                    </span>
                                    {isMe && <DoubleCheckIcon read={msg.status === "read"} />}
                                </div>
                            </div>

                            {/* REACTIONS BAR - Shows below the bubble */}
                            {msg.reactions && msg.reactions.length > 0 && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: isMe ? "flex-end" : "flex-start",
                                    marginTop: -12,
                                    position: "relative",
                                    zIndex: 1,
                                }}>
                                    <div style={{
                                        display: "flex",
                                        gap: 6,
                                        backgroundColor: "#FFFFFF",
                                        padding: "9px 18px",
                                        borderRadius: 60,
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                        border: "1px solid rgba(0,0,0,0.05)",
                                    }}>
                                        {msg.reactions.map((reaction: any, i: number) => (
                                            <div key={i} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                backgroundColor: reaction.fromMe ? "rgba(37, 211, 102, 0.15)" : "transparent",
                                                padding: "3px 9px",
                                                borderRadius: 30,
                                            }}>
                                                <span style={{ fontSize: 42, lineHeight: 1 }}>{reaction.emoji}</span>
                                                {reaction.count > 1 && (
                                                    <span style={{
                                                        fontSize: 33,
                                                        color: "#667781",
                                                        fontWeight: 500,
                                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                                                    }}>
                                                        {reaction.count}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </SimpleMessageContainer>
                    );
                })}

                {/* Typing indicator - position based on who is typing */}
                {
                    isTyping && chatLayout?.typingLayout && (
                        <div style={{
                            position: "absolute",
                            top: chatLayout.typingLayout.y,
                            // If owner is typing, show on right; if others typing, show on left
                            left: typingFrom === ownerName ? "auto" : config.bubbleMarginHorizontal,
                            right: typingFrom === ownerName ? config.bubbleMarginHorizontal : "auto",
                            opacity: chatLayout.typingLayout.opacity
                        }}>
                            <TypingBubble platform={platform} isMe={typingFrom === ownerName} />
                        </div>
                    )
                }
            </div >
        </div >
    );
};

// ============================================================================
// INPUT AREA - Authentic WhatsApp iOS Composer
// ============================================================================

interface InputAreaProps {
    text?: string;
}

const InputArea: React.FC<InputAreaProps & { platform?: Platform }> = ({ text, platform = "ios" }) => {
    // ... implementation ...
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `${config.bubblePadding}px 30px`,
            gap: 24,
            borderTop: "1px solid rgba(0,0,0,0.1)"
        }}>
            {/* Plus button */}
            <PlusCircleIcon />

            {/* Input field */}
            <div style={{
                flex: 1,
                minHeight: 120,
                backgroundColor: config.inputBg,
                borderRadius: config.inputBorderRadius,
                padding: "27px 48px",
                display: "flex",
                alignItems: "center",
                fontSize: 48,
                color: text ? config.inputTextColor : config.inputPlaceholderColor,
                fontFamily: tokens.fontFamily,
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
                    backgroundColor: config.sendButtonColor,
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
};

// ... (HomeIndicator, SystemMessage, VoiceMessageBubble unchanged) ...

// ============================================================================
// TYPING INDICATOR BUBBLE
// ============================================================================

const TypingBubble: React.FC<{ platform?: Platform; isMe?: boolean }> = ({ platform = "ios", isMe = false }) => {
    const config = getAppConfig("whatsapp", platform) as any;

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.typingBubbleColor,
            padding: "36px 45px",
            borderRadius: config.bubbleRadius,
            // Tail on correct side based on who is typing
            borderBottomLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderBottomRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            display: "flex",
            gap: 12,
            alignItems: "center",
            height: 120
        }}>
            <div className="typing-dot" style={{ width: config.typingDotSize, height: config.typingDotSize, backgroundColor: config.typingDotColor, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "-0.32s" }} />
            <div className="typing-dot" style={{ width: config.typingDotSize, height: config.typingDotSize, backgroundColor: config.typingDotColor, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "-0.16s" }} />
            <div className="typing-dot" style={{ width: config.typingDotSize, height: config.typingDotSize, backgroundColor: config.typingDotColor, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }} />
        </div>
    );
};

// ============================================================================
// HOME INDICATOR SPACER
// ============================================================================

const HomeIndicator: React.FC = () => (
    <div style={{
        height: 102,
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
// SYSTEM MESSAGE - For group events (member added/removed/admin change)
// ============================================================================

interface SystemMessageProps {
    text: string;
    timestamp?: string;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ text, timestamp }) => (
    <div style={{
        display: "flex",
        justifyContent: "center",
        padding: "18px 60px",
        marginBottom: 12
    }}>
        <div style={{
            backgroundColor: "rgba(225, 218, 208, 0.85)",
            padding: "15px 30px",
            borderRadius: 21,
            maxWidth: "85%"
        }}>
            <span style={{
                fontSize: 36,
                color: "#667781",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                textAlign: "center"
            }}>
                {text}
            </span>
        </div>
    </div>
);

// ============================================================================
// VOICE MESSAGE BUBBLE - With waveform and play button
// ============================================================================

interface VoiceMessageBubbleProps {
    isMe: boolean;
    duration: number;
    isPlaying?: boolean;
    progress?: number;
    timestamp?: string;
    read?: boolean;
}

// Play button icon
const PlayIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#25D366">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#25D366">
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
    </svg>
);

const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps & { platform?: Platform; senderName?: string }> = ({
    isMe,
    duration,
    isPlaying = false,
    progress = 0,
    timestamp,
    read,
    senderName,
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    // Waveform simulation
    const bars = 45;
    const wave = React.useMemo(() => {
        return Array.from({ length: bars }).map(() => Math.random() * 0.6 + 0.2);
    }, []);

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
            padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
            borderRadius: config.bubbleRadius,
            borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
            borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
            boxShadow: config.bubbleShadow,
            display: "flex",
            flexDirection: "column",
            minWidth: 450,
            maxWidth: config.bubbleMaxWidth,
        }}>
            {/* Sender Name (Group Chat) */}
            {senderName && !isMe && (
                <div style={{
                    marginBottom: 6,
                    backgroundColor: "transparent"
                }}>
                    <span style={{
                        fontSize: config.senderNameSize,
                        fontWeight: 600,
                        color: config.senderNameColor,
                        fontFamily: tokens.fontFamily,
                        display: "block",
                    }}>
                        {senderName}
                    </span>
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                {/* Play/Pause Button - Circular */}
                <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    backgroundColor: isMe ? "#25D366" : "#E5E5EA", // Accent color or grey
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </div>

                {/* Waveform */}
                <div style={{
                    flex: 1,
                    height: 54,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    opacity: 0.8
                }}>
                    {wave.map((h, i) => {
                        const isPlayed = (i / bars) < (progress / duration);
                        return (
                            <div key={i} style={{
                                width: 4,
                                height: `${h * 100}%`,
                                backgroundColor: isPlayed ? (isMe ? "#54656F" : "#25D366") : "#B4B4B4",
                                borderRadius: 2,
                                transition: "background-color 0.2s"
                            }} />
                        );
                    })}
                </div>
            </div>

            {/* Footer: Duration & Time */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6
            }}>
                <span style={{
                    fontSize: config.timestampSize,
                    color: config.timestampColor,
                    fontFamily: tokens.fontFamily,
                    marginLeft: 72 // Align with waveform start
                }}>
                    {formatDuration(duration)}
                </span>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: config.bubbleGap * 0.75
                }}>
                    <span style={{
                        fontSize: config.timestampSize,
                        color: config.timestampColor,
                        fontFamily: tokens.fontFamily
                    }}>
                        {timestamp || "10:42"}
                    </span>
                    {isMe && <DoubleCheckIcon read={read} />}
                </div>
            </div>
        </div>
    );
};


// ============================================================================
// GROUP HEADER - Shows group info instead of contact
// ============================================================================

interface GroupHeaderProps {
    groupName: string;
    memberCount: number;
    avatarUrl?: string;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ groupName, memberCount, avatarUrl }) => (
    <div style={{
        height: 270,
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "0 36px",
        marginTop: 144,
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        zIndex: 10
    }}>
        {/* Back button */}
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

        {/* Group info */}
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -60
        }}>
            {/* Group avatar */}
            <div style={{
                width: 111,
                height: 111,
                borderRadius: "50%",
                background: avatarUrl
                    ? `url(${avatarUrl}) center/cover`
                    : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                marginRight: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 45,
                fontWeight: "600"
            }}>
                {!avatarUrl && "👥"}
            </div>

            {/* Name & member count */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{
                    fontSize: 51,
                    fontWeight: "600",
                    color: "#000",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                }}>
                    {groupName}
                </span>
                <span style={{
                    fontSize: 33,
                    color: "#8E8E93",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {memberCount} members
                </span>
            </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 54, alignItems: "center" }}>
            <VideoCallIcon />
            <PhoneCallIcon />
        </div>
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
    GroupHeader,
    MessageList,
    InputArea,
    SystemMessage,
    VoiceMessageBubble
};

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState; deviceId?: string }> = ({ world, t, layout, deviceId }) => {
    // Get device and app state
    const activeDeviceId = deviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
    const device = world.devices[activeDeviceId];
    const appState = world.appState?.app_whatsapp;

    // Check which screen to show
    const currentScreen = appState?.screen || "chat";

    // =========================================================================
    // CHATS LIST SCREEN
    // =========================================================================
    if (currentScreen === "chats-list") {
        // Convert conversations to ChatPreview format
        const chats = Object.values(world.conversations).map(conv => ({
            id: conv.id,
            name: conv.name || "Unknown",
            avatar: conv.avatar,
            lastMessage: conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1].text || "📷 Photo"
                : "No messages",
            time: "Now",
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            isArchived: false,
            isTyping: Object.keys(conv.typing || {}).length > 0,
            isGroup: conv.type === "group",
        }));

        // Import ChatsListScreen dynamically to avoid circular deps
        const { ChatsListScreen } = require("./components/ChatsListScreen");
        return <ChatsListScreen chats={chats} platform="ios" />;
    }

    // =========================================================================
    // CHAT DETAIL SCREEN (default)
    // =========================================================================
    const conversationId = appState?.conversationId || Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];
    const isTyping = conversation?.typing && Object.keys(conversation.typing).length > 0;
    // Get who is typing (first key in typing map)
    const typingFrom = isTyping && conversation?.typing ? Object.keys(conversation.typing)[0] : undefined;
    const draftText = "";
    const ownerName = device?.ownerName || "me";

    // Check if it's a group
    const isGroup = conversation?.type === "group";
    const groupName = conversation?.name || "Group";
    const memberCount = conversation?.members?.length || 0;

    return (
        <WhatsApp.Root>
            {isGroup ? (
                <WhatsApp.GroupHeader groupName={groupName} memberCount={memberCount} />
            ) : (
                <WhatsApp.Header contactName={conversation?.name || "Alice"} status="online" />
            )}
            <WhatsApp.MessageList
                messages={messages}
                layout={layout}
                isTyping={isTyping}
                typingFrom={typingFrom}
                conversationType={conversation?.type}
                ownerName={ownerName}
            />
            <WhatsApp.InputArea text={draftText} />
            <HomeIndicator />
        </WhatsApp.Root>
    );
};
