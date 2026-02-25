/**
 * Snapchat CSS-in-JS Styles — Pixel-accurate 1:1
 *
 * Real Snapchat visual signatures:
 * - Fully rounded pill bubbles (no squished corners)
 * - No border on either bubble (just bg color contrast)
 * - Colored vertical edge lines (blue RIGHT = sent, purple LEFT = received)
 * - SVG-style line icons (not emoji)
 * - CSS @keyframes bouncing typing dots
 * - Bottom nav: Map / Chat / Camera / Stories / Spotlight
 * - Centered-stack chat header (bitmoji centered, name below)
 */

import type { CSSProperties } from "react";
import { snapchatColors } from "./config/colors.js";
import { snapchatSpacing } from "./config/tokens.js";

const FONT = "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// =============================================================================
// HEADER — Chat List (real Snapchat: bitmoji left, "Chat" center, compose right)
// =============================================================================

export function chatListHeaderStyle(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "column",
        backgroundColor: snapchatColors.headerBackground,
        borderBottom: `0.5px solid ${snapchatColors.divider}`,
    };
}

export function chatListHeaderTopRow(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: snapchatSpacing.headerHeight,
        paddingLeft: 16,
        paddingRight: 16,
    };
}

export function chatListTitleStyle(): CSSProperties {
    return {
        fontSize: 20,
        fontWeight: 700,
        color: snapchatColors.textPrimary,
        fontFamily: FONT,
        letterSpacing: -0.3,
    };
}

export function searchBarStyle(): CSSProperties {
    return {
        height: snapchatSpacing.searchBarHeight,
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 8,
        borderRadius: 10,
        backgroundColor: snapchatColors.inputBackground,
        display: "flex",
        alignItems: "center",
        paddingLeft: 12,
        paddingRight: 12,
        gap: 6,
    };
}

// =============================================================================
// CHAT LIST ROW
// =============================================================================

export function conversationRowStyle(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: snapchatSpacing.chatListRowHeight,
        paddingLeft: 16,
        paddingRight: 16,
        gap: 12,
        borderBottom: `0.5px solid ${snapchatColors.divider}`,
    };
}

export function bitmojiCircleStyle(size: number): CSSProperties {
    return {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#F2F2F7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        border: `1.5px solid ${snapchatColors.divider}`,
    };
}

// =============================================================================
// CHAT BUBBLES — Fully rounded pills, NO border, NO squished corners
// =============================================================================

export function sentBubbleContainerStyle(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "stretch",
        gap: 0,
        marginBottom: snapchatSpacing.messageSpacing,
    };
}

export function receivedBubbleContainerStyle(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: 0,
        marginBottom: snapchatSpacing.messageSpacing,
    };
}

export function sentBubbleStyle(): CSSProperties {
    return {
        backgroundColor: snapchatColors.sentBubble,
        color: snapchatColors.sentBubbleText,
        borderRadius: snapchatSpacing.bubbleBorderRadius,
        paddingLeft: snapchatSpacing.bubblePaddingH,
        paddingRight: snapchatSpacing.bubblePaddingH,
        paddingTop: snapchatSpacing.bubblePaddingV,
        paddingBottom: snapchatSpacing.bubblePaddingV,
        maxWidth: "72%",
        fontSize: 15,
        fontFamily: FONT,
        lineHeight: "20px",
        wordBreak: "break-word" as const,
    };
}

export function receivedBubbleStyle(): CSSProperties {
    return {
        backgroundColor: snapchatColors.receivedBubble,
        color: snapchatColors.receivedBubbleText,
        borderRadius: snapchatSpacing.bubbleBorderRadius,
        paddingLeft: snapchatSpacing.bubblePaddingH,
        paddingRight: snapchatSpacing.bubblePaddingH,
        paddingTop: snapchatSpacing.bubblePaddingV,
        paddingBottom: snapchatSpacing.bubblePaddingV,
        maxWidth: "72%",
        fontSize: 15,
        fontFamily: FONT,
        lineHeight: "20px",
        wordBreak: "break-word" as const,
        // No border — real Snapchat relies on background contrast only
    };
}

/** Purple edge line — LEFT of received */
export function receivedEdgeLineStyle(): CSSProperties {
    return {
        width: snapchatSpacing.edgeLineWidth,
        borderRadius: snapchatSpacing.edgeLineRadius,
        backgroundColor: snapchatColors.receivedEdge,
        marginRight: 4,
        alignSelf: "stretch",
    };
}

/** Blue edge line — RIGHT of sent */
export function sentEdgeLineStyle(): CSSProperties {
    return {
        width: snapchatSpacing.edgeLineWidth,
        borderRadius: snapchatSpacing.edgeLineRadius,
        backgroundColor: snapchatColors.sentEdge,
        marginLeft: 4,
        alignSelf: "stretch",
    };
}

// =============================================================================
// TYPING INDICATOR — CSS animated bouncing dots
// =============================================================================

export function typingIndicatorContainerStyle(): CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        gap: 4,
        paddingLeft: 4,
        paddingTop: 4,
        paddingBottom: 4,
    };
}

export function typingDotStyle(index: number): CSSProperties {
    return {
        width: snapchatSpacing.typingDotSize,
        height: snapchatSpacing.typingDotSize,
        borderRadius: snapchatSpacing.typingDotSize / 2,
        backgroundColor: snapchatColors.indicatorPurple,
        animation: `snapchat-dot-bounce 1.4s ease-in-out ${index * 0.16}s infinite`,
    };
}

/** Inject @keyframes into document — call once */
export function injectSnapchatStyles(): void {
    if (typeof document === "undefined") return;
    const id = "snapchat-css-animations";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
    @keyframes snapchat-dot-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-6px); opacity: 1; }
    }
  `;
    document.head.appendChild(style);
}

// =============================================================================
// INPUT BAR
// =============================================================================

export function chatInputBarStyle(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: snapchatSpacing.inputHeight,
        paddingLeft: 12,
        paddingRight: 12,
        gap: 8,
        backgroundColor: snapchatColors.white,
        borderTop: `0.5px solid ${snapchatColors.divider}`,
    };
}

export function chatInputFieldStyle(): CSSProperties {
    return {
        flex: 1,
        height: 36,
        borderRadius: 18,
        backgroundColor: snapchatColors.inputBackground,
        paddingLeft: 14,
        paddingRight: 14,
        fontSize: 14,
        fontFamily: FONT,
        color: snapchatColors.inputPlaceholder,
        display: "flex",
        alignItems: "center",
    };
}

// =============================================================================
// SNAP INDICATOR SHAPES
// =============================================================================

export function indicatorShapeStyle(
    type: "snap" | "chat",
    opened: boolean,
): CSSProperties {
    const size = snapchatSpacing.indicatorSize;
    if (type === "snap") {
        const color = opened ? "transparent" : snapchatColors.indicatorRed;
        const border = opened ? snapchatColors.indicatorGray : snapchatColors.indicatorRed;
        return {
            width: 0,
            height: 0,
            borderLeft: `${size}px solid ${color}`,
            borderTop: `${size / 2}px solid transparent`,
            borderBottom: `${size / 2}px solid transparent`,
            ...(opened ? { borderLeftColor: border } : {}),
        };
    }
    const color = opened ? "transparent" : snapchatColors.indicatorBlue;
    const borderColor = opened ? snapchatColors.indicatorGray : snapchatColors.indicatorBlue;
    return {
        width: size,
        height: size,
        backgroundColor: color,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 1,
    };
}

// =============================================================================
// BOTTOM NAV BAR (Map / Chat / Camera / Stories / Spotlight)
// =============================================================================

export function bottomNavBarStyle(): CSSProperties {
    return {
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: snapchatColors.white,
        borderTop: `0.5px solid ${snapchatColors.divider}`,
        flexShrink: 0,
    };
}

export function bottomNavItemStyle(active: boolean): CSSProperties {
    return {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        color: active ? snapchatColors.textPrimary : snapchatColors.textSecondary,
        fontSize: 10,
        fontWeight: active ? 600 : 400,
        fontFamily: FONT,
        flex: 1,
    };
}

// =============================================================================
// CENTERED CHAT HEADER (bitmoji centered, name below)
// =============================================================================

export function chatHeaderCenteredStyle(): CSSProperties {
    return {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: snapchatColors.headerBackground,
        borderBottom: `0.5px solid ${snapchatColors.divider}`,
        paddingTop: 8,
        paddingBottom: 8,
        position: "relative",
    };
}

export function chatHeaderSideIconsStyle(): CSSProperties {
    return {
        position: "absolute",
        top: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
    };
}

// =============================================================================
// STREAK BADGE
// =============================================================================

export function streakBadgeStyle(): CSSProperties {
    return {
        display: "flex",
        alignItems: "center",
        gap: 2,
        fontSize: 12,
        color: snapchatColors.streakFire,
        fontWeight: 600,
        fontFamily: FONT,
    };
}

// =============================================================================
// SYSTEM MESSAGES
// =============================================================================

export function systemMessageStyle(type?: string): CSSProperties {
    let color: string = snapchatColors.textSecondary;
    if (type === "screenshot") color = snapchatColors.systemScreenshot;
    if (type === "saved") color = snapchatColors.systemSaved;

    return {
        textAlign: "center",
        fontSize: 11,
        color,
        fontFamily: FONT,
        padding: "6px 0",
        fontWeight: 600,
        letterSpacing: 0.2,
        textTransform: "uppercase" as const,
    };
}
