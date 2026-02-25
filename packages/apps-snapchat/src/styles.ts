/**
 * Snapchat CSS-in-JS Styles
 */

import type { CSSProperties } from "react";
import { snapchatColors } from "./config/colors.js";
import { snapchatSpacing } from "./config/tokens.js";

export function chatListHeaderStyle(scale: number): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: snapchatSpacing.headerHeight * scale,
        paddingLeft: 16 * scale,
        paddingRight: 16 * scale,
        backgroundColor: snapchatColors.headerBackground,
        borderBottom: `${0.5 * scale}px solid ${snapchatColors.divider}`,
    };
}

export function chatListTitleStyle(scale: number): CSSProperties {
    return {
        fontSize: 22 * scale,
        fontWeight: 700,
        color: snapchatColors.textPrimary,
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
    };
}

export function conversationRowStyle(scale: number): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: `${12 * scale}px ${16 * scale}px`,
        gap: 12 * scale,
    };
}

export function avatarStyle(size: number): CSSProperties {
    return {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: snapchatColors.yellow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
    };
}

export function sentBubbleStyle(scale: number): CSSProperties {
    return {
        backgroundColor: snapchatColors.sentBubble,
        color: snapchatColors.sentBubbleText,
        borderRadius: snapchatSpacing.bubbleBorderRadius * scale,
        paddingLeft: snapchatSpacing.bubblePaddingH * scale,
        paddingRight: snapchatSpacing.bubblePaddingH * scale,
        paddingTop: snapchatSpacing.bubblePaddingV * scale,
        paddingBottom: snapchatSpacing.bubblePaddingV * scale,
        maxWidth: "72%",
        alignSelf: "flex-end",
        fontSize: 15 * scale,
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        lineHeight: 1.35,
        wordBreak: "break-word" as const,
    };
}

export function receivedBubbleStyle(scale: number): CSSProperties {
    return {
        backgroundColor: snapchatColors.receivedBubble,
        color: snapchatColors.receivedBubbleText,
        borderRadius: snapchatSpacing.bubbleBorderRadius * scale,
        paddingLeft: snapchatSpacing.bubblePaddingH * scale,
        paddingRight: snapchatSpacing.bubblePaddingH * scale,
        paddingTop: snapchatSpacing.bubblePaddingV * scale,
        paddingBottom: snapchatSpacing.bubblePaddingV * scale,
        maxWidth: "72%",
        alignSelf: "flex-start",
        fontSize: 15 * scale,
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        lineHeight: 1.35,
        wordBreak: "break-word" as const,
    };
}

export function snapIndicatorStyle(scale: number, type: "sent" | "received"): CSSProperties {
    const color = type === "received" ? snapchatColors.snapRed : snapchatColors.sentIndicator;
    return {
        display: "flex",
        alignItems: "center",
        gap: 6 * scale,
        fontSize: 12 * scale,
        color,
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        padding: `${4 * scale}px 0`,
    };
}

export function streakBadgeStyle(scale: number): CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        gap: 2 * scale,
        fontSize: 12 * scale,
        color: snapchatColors.streakFire,
        fontWeight: 600,
    };
}

export function chatInputBarStyle(scale: number): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: snapchatSpacing.inputHeight * scale,
        paddingLeft: 12 * scale,
        paddingRight: 12 * scale,
        gap: 8 * scale,
        backgroundColor: snapchatColors.white,
        borderTop: `${0.5 * scale}px solid ${snapchatColors.divider}`,
    };
}

export function chatInputFieldStyle(scale: number): CSSProperties {
    return {
        flex: 1,
        height: 36 * scale,
        borderRadius: 18 * scale,
        backgroundColor: snapchatColors.inputBackground,
        paddingLeft: 16 * scale,
        paddingRight: 16 * scale,
        fontSize: 15 * scale,
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        color: snapchatColors.textPrimary,
        display: "flex",
        alignItems: "center",
    };
}

export function typingIndicatorStyle(scale: number): CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        gap: 4 * scale,
        padding: `${8 * scale}px ${16 * scale}px`,
        fontSize: 12 * scale,
        color: snapchatColors.textSecondary,
        fontFamily: "'SF Pro Text', -apple-system, sans-serif",
        fontStyle: "italic",
    };
}
