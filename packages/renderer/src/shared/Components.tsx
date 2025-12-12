/**
 * Shared UI Components
 * Reusable primitives that work across iOS and Android
 */

import React from "react";
import { iOSTokens, androidTokens, Platform, getTokens, sharedStyles } from "@tokovo/core";

// =============================================================================
// CHAT BUBBLE - Universal message bubble component
// =============================================================================

interface ChatBubbleProps {
    platform: Platform;
    isMe: boolean;
    senderName?: string;
    showSender?: boolean;
    timestamp?: string;
    status?: "sending" | "sent" | "delivered" | "read";
    children: React.ReactNode;
    customColors?: {
        myBubble?: string;
        otherBubble?: string;
    };
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    platform,
    isMe,
    senderName,
    showSender = false,
    timestamp,
    status,
    children,
    customColors
}) => {
    const tokens = getTokens(platform);
    const defaultMyColor = platform === "ios" ? "#E7FFDB" : "#E7FFDB";
    const defaultOtherColor = platform === "ios" ? "#FFFFFF" : "#FFFFFF";

    const bubbleColor = isMe
        ? (customColors?.myBubble || defaultMyColor)
        : (customColors?.otherBubble || defaultOtherColor);

    return (
        <div style={{
            display: "flex",
            justifyContent: isMe ? "flex-end" : "flex-start",
            padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`
        }}>
            <div style={{
                backgroundColor: bubbleColor,
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                borderRadius: tokens.radii.lg,
                borderTopLeftRadius: isMe ? tokens.radii.lg : tokens.radii.sm,
                borderTopRightRadius: isMe ? tokens.radii.sm : tokens.radii.lg,
                boxShadow: tokens.shadows.sm,
                maxWidth: "78%",
                display: "flex",
                flexDirection: "column",
                gap: tokens.spacing.xs
            }}>
                {/* Sender name */}
                {showSender && senderName && !isMe && (
                    <div style={{
                        ...tokens.typography.footnote,
                        fontFamily: tokens.fontFamily,
                        color: iOSTokens.colors.whatsappGreen,
                        fontWeight: 600
                    }}>
                        {senderName}
                    </div>
                )}

                {/* Content */}
                <div style={{
                    ...tokens.typography.body,
                    fontFamily: tokens.fontFamily,
                    color: tokens.colors.label
                }}>
                    {children}
                </div>

                {/* Footer: timestamp + status */}
                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: tokens.spacing.xs
                }}>
                    {timestamp && (
                        <span style={{
                            ...tokens.typography.caption2,
                            fontFamily: tokens.fontFamily,
                            color: tokens.colors.secondaryLabel
                        }}>
                            {timestamp}
                        </span>
                    )}
                    {isMe && status && (
                        <ReadReceipt status={status} platform={platform} />
                    )}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// READ RECEIPT - Check marks for message status
// =============================================================================

interface ReadReceiptProps {
    status: "sending" | "sent" | "delivered" | "read";
    platform: Platform;
}

const ReadReceipt: React.FC<ReadReceiptProps> = ({ status, platform }) => {
    const color = status === "read" ? "#53BDEB" : "#667781";
    const size = platform === "ios" ? 48 : 42;

    if (status === "sending") {
        return (
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill={color}>
                <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" opacity="0.3" />
            </svg>
        );
    }

    const showDouble = status === "delivered" || status === "read";

    return (
        <svg width={size} height={size * 0.6} viewBox="0 0 24 14" fill="none">
            <path
                d={showDouble ? "M3 7l3.5 3.5L13 4" : "M5 7l4 4L18 2"}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {showDouble && (
                <path
                    d="M9 7l3.5 3.5L19 4"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
};

// =============================================================================
// APP HEADER - Universal header with back button
// =============================================================================

interface AppHeaderProps {
    platform: Platform;
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    avatarEmoji?: string;
    showBack?: boolean;
    backCount?: number;
    rightActions?: React.ReactNode;
    backgroundColor?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    platform,
    title,
    subtitle,
    avatarUrl,
    avatarEmoji,
    showBack = true,
    backCount,
    rightActions,
    backgroundColor
}) => {
    const tokens = getTokens(platform);
    const headerHeight = platform === "ios" ? 270 : 255;
    const statusBarHeight = platform === "ios" ? 144 : 120;

    return (
        <div style={{
            height: headerHeight,
            backgroundColor: backgroundColor || tokens.colors.background,
            marginTop: statusBarHeight,
            display: "flex",
            alignItems: "center",
            padding: `0 ${tokens.spacing.md}px`,
            borderBottom: `1px solid ${tokens.colors.separator}`,
            fontFamily: tokens.fontFamily
        }}>
            {/* Back button */}
            {showBack && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    color: tokens.colors.primary
                }}>
                    <svg width="36" height="60" viewBox="0 0 12 20" fill="none">
                        <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {backCount !== undefined && (
                        <span style={tokens.typography.body}>{backCount}</span>
                    )}
                </div>
            )}

            {/* Center content */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: showBack ? -60 : 0
            }}>
                {/* Avatar */}
                {(avatarUrl || avatarEmoji) && (
                    <div style={{
                        width: platform === "ios" ? 111 : 105,
                        height: platform === "ios" ? 111 : 105,
                        borderRadius: "50%",
                        background: avatarUrl
                            ? `url(${avatarUrl}) center/cover`
                            : `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.secondaryLabel} 100%)`,
                        marginRight: tokens.spacing.sm,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 45,
                        color: "white"
                    }}>
                        {!avatarUrl && avatarEmoji}
                    </div>
                )}

                {/* Title & subtitle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: avatarUrl || avatarEmoji ? "flex-start" : "center" }}>
                    <span style={{
                        ...tokens.typography.headline,
                        color: tokens.colors.label
                    }}>
                        {title}
                    </span>
                    {subtitle && (
                        <span style={{
                            ...tokens.typography.caption1,
                            color: tokens.colors.secondaryLabel
                        }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Right actions */}
            {rightActions && (
                <div style={{ display: "flex", gap: tokens.spacing.lg }}>
                    {rightActions}
                </div>
            )}
        </div>
    );
};

// =============================================================================
// TYPING INDICATOR - Universal typing dots
// =============================================================================

interface TypingIndicatorProps {
    platform: Platform;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ platform }) => {
    const tokens = getTokens(platform);
    const dotSize = platform === "ios" ? 24 : 21;

    return (
        <div style={{
            backgroundColor: tokens.colors.secondaryBackground,
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            borderRadius: tokens.radii.lg,
            borderTopLeftRadius: tokens.radii.sm,
            display: "inline-flex",
            gap: tokens.spacing.xs,
            alignItems: "center"
        }}>
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: "50%",
                        backgroundColor: tokens.colors.tertiaryLabel,
                        opacity: 0.6
                    }}
                />
            ))}
        </div>
    );
};

// =============================================================================
// SYSTEM MESSAGE - Centered info pill
// =============================================================================

interface SystemMessageProps {
    platform: Platform;
    text: string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ platform, text }) => {
    const tokens = getTokens(platform);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            padding: `${tokens.spacing.sm}px ${tokens.spacing.xl}px`
        }}>
            <div style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                padding: `${tokens.spacing.xs}px ${tokens.spacing.md}px`,
                borderRadius: tokens.radii.pill
            }}>
                <span style={{
                    ...tokens.typography.caption1,
                    fontFamily: tokens.fontFamily,
                    color: tokens.colors.secondaryLabel
                }}>
                    {text}
                </span>
            </div>
        </div>
    );
};
