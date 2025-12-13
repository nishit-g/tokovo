import React from "react";
import { Platform, getAppConfig, getTokens, ChatLayoutState, ChatMessageLayout } from "@tokovo/core";
import { MessageBubble } from "./MessageBubble";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { ImageMessageBubble } from "./ImageMessageBubble";
import { VideoMessageBubble } from "./VideoMessageBubble";
import { TypingBubble } from "./TypingBubble";

interface MessageListProps {
    messages: any[];
    layout?: ChatLayoutState;
    isTyping?: boolean;
    conversationType?: "dm" | "group";
    platform?: Platform;
    ownerName?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    layout,
    isTyping,
    conversationType,
    platform = "ios",
    ownerName = "me"
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
                transition: "transform 0.15s ease-out",
                // If no layout provided (e.g. basic list view mode without advanced layout engine),
                // we should just stack them. But Tokovo usually provides layout.
                // If not, we can fallback to flex column?
                // For now assuming layout is mostly handled or we use absolute positioning if layout exists.
                // If layout is missing, we might want a simple flex stack for "preview" or simpler usage.
                display: layout ? "block" : "flex",
                flexDirection: layout ? "initial" : "column",
                paddingBottom: layout ? 0 : 20
            }}>
                {messages.map((msg: any, index: number) => {
                    const msgLayout = chatLayout?.messageLayouts[msg.id];
                    // If no layout, stack them simply
                    const style: React.CSSProperties = layout ? {
                        position: "absolute",
                        top: msgLayout?.y ?? 0,
                        left: 0, // Positioning handled by child margins usually, or we set left/right here
                        width: "100%", // Container width
                        opacity: msgLayout?.opacity ?? 1,
                        transform: `translateY(${msgLayout?.translateY ?? 0}px)`
                    } : {
                        position: "relative",
                        marginTop: 10,
                        marginBottom: 10,
                        width: "100%"
                    };

                    const isMe = msg.from === ownerName;

                    // Wrapper to position the bubble left/right
                    const bubbleWrapperStyle: React.CSSProperties = {
                         display: "flex",
                         justifyContent: msg.type === "system" ? "center" : (isMe ? "flex-end" : "flex-start"),
                         paddingLeft: isMe ? 0 : config.bubbleMarginHorizontal,
                         paddingRight: isMe ? config.bubbleMarginHorizontal : 0,
                         width: "100%",
                         boxSizing: "border-box"
                    };

                    // Render system messages
                    if (msg.type === "system") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={bubbleWrapperStyle}>
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
                            </div>
                        );
                    }

                    // Render Deleted Message
                    if (msg.type === "deleted") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={bubbleWrapperStyle}>
                                    <div style={{
                                        backgroundColor: isMe ? config.bubbleMyColor : config.bubbleOtherColor,
                                        padding: `${config.bubblePadding}px ${config.bubblePaddingHorizontal}px`,
                                        borderRadius: config.bubbleRadius,
                                        borderTopLeftRadius: isMe ? config.bubbleRadius : config.bubbleTailRadius,
                                        borderTopRightRadius: isMe ? config.bubbleTailRadius : config.bubbleRadius,
                                        boxShadow: config.bubbleShadow,
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
                            </div>
                        );
                    }

                    // Render Screenshot Alert (Psychotic feature)
                    if (msg.type === "screenshot_alert") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "100%"
                                }}>
                                    <div style={{
                                        backgroundColor: config.screenshotAlertBg || "#FFF3CD",
                                        padding: "15px 45px",
                                        borderRadius: 45,
                                        border: `1px solid ${config.screenshotAlertText || "#856404"}`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 15
                                    }}>
                                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={config.screenshotAlertText || "#856404"} strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        <span style={{
                                            fontSize: 30,
                                            color: config.screenshotAlertText || "#856404",
                                            fontWeight: 600,
                                            fontFamily: tokens.fontFamily
                                        }}>
                                            Took a screenshot!
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Render Missed Call (Psychotic feature)
                    if (msg.type === "call_missed") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "100%"
                                }}>
                                    <div style={{
                                        backgroundColor: config.missedCallBubbleColor || "#FFF",
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
                                </div>
                            </div>
                        );
                    }

                    // Render voice messages
                    if (msg.type === "voice") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={bubbleWrapperStyle}>
                                    <VoiceMessageBubble
                                        isMe={isMe}
                                        duration={msg.duration || 15}
                                        isPlaying={msg.isPlaying}
                                        progress={msg.playProgress || 0}
                                        read={msg.status === "read"}
                                        platform={platform}
                                        timestamp={msg.timestamp}
                                    />
                                </div>
                            </div>
                        );
                    }

                    // Render Image messages
                    if (msg.type === "image") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={bubbleWrapperStyle}>
                                    <ImageMessageBubble
                                        isMe={isMe}
                                        imageUrl={msg.imageUrl || "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY2J6eHl5aDdxNHl5aDdxNHl5aDdxNHl5aDdxNHl5aDdxNHl5YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKr3nzbh5TQTTz2/giphy.gif"} // Fallback
                                        caption={msg.text}
                                        read={msg.status === "read"}
                                        platform={platform}
                                        timestamp={msg.timestamp}
                                    />
                                </div>
                            </div>
                        );
                    }

                    // Render Video messages
                    if (msg.type === "video") {
                        return (
                            <div key={msg.id} style={style}>
                                <div style={bubbleWrapperStyle}>
                                    <VideoMessageBubble
                                        isMe={isMe}
                                        thumbnailUrl={msg.thumbnailUrl}
                                        caption={msg.text}
                                        read={msg.status === "read"}
                                        platform={platform}
                                        timestamp={msg.timestamp}
                                        duration={msg.durationText}
                                    />
                                </div>
                            </div>
                        );
                    }

                    // Default: Text Message
                    // We reuse the existing MessageBubble logic but wrapped in our list item
                    // Or we can import MessageBubble (if we extract it)
                    // Let's assume we use the MessageBubble component we extracted (or will extract)

                    return (
                        <div key={msg.id} style={style}>
                           <div style={bubbleWrapperStyle}>
                               <MessageBubble
                                    msg={msg}
                                    isMe={isMe}
                                    isGroup={isGroup}
                                    platform={platform}
                                    // Pass layout-specifics if needed inside, but we handled positioning here
                                />
                           </div>
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {/*
                    If we have specific layout for typing, use it.
                    If not (and isTyping is true), append it at bottom?
                    Usually layout engine handles typing bubble position.
                    If layout is missing, we append at end.
                */}
                {isTyping && (
                    <div style={layout?.typingLayout ? {
                        position: "absolute",
                        top: layout.typingLayout.y,
                        left: config.bubbleMarginHorizontal,
                        opacity: layout.typingLayout.opacity,
                        transition: "opacity 0.2s"
                    } : {
                        position: "relative",
                        marginTop: 10,
                        marginLeft: config.bubbleMarginHorizontal
                    }}>
                        <TypingBubble platform={platform} />
                    </div>
                )}
            </div>
        </div>
    );
};
