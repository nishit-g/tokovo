/**
 * Snapchat Spacing Tokens — Pixel-accurate
 */

export const snapchatSpacing = {
    /** Header height (includes safe area) */
    headerHeight: 56,
    /** Search bar height */
    searchBarHeight: 36,
    /** Chat input bar height */
    inputHeight: 52,
    /** Avatar/Bitmoji size in conversation list */
    bitmojiSizeList: 48,
    /** Avatar size in chat header */
    avatarSizeChat: 34,
    /** Bubble max width ratio */
    bubbleMaxWidthRatio: 0.72,
    /** Bubble padding horizontal */
    bubblePaddingH: 12,
    /** Bubble padding vertical */
    bubblePaddingV: 9,
    /** Bubble border radius */
    bubbleBorderRadius: 18,
    /** Edge indicator line width */
    edgeLineWidth: 3,
    /** Edge indicator line height (matches bubble) */
    edgeLineRadius: 2,
    /** Streak badge size */
    streakBadgeSize: 18,
    /** Message spacing (same sender) */
    messageSpacing: 2,
    /** Message group spacing (different sender) */
    groupSpacing: 8,
    /** Chat list row height */
    chatListRowHeight: 72,
    /** Chat list indicator size */
    indicatorSize: 10,
    /** Typing indicator dot size */
    typingDotSize: 7,
    /** Typing indicator dot gap */
    typingDotGap: 3,
} as const;
