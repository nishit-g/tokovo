/**
 * iMessage Design Tokens
 * 
 * Comprehensive tokenization of all spacing, typography, and layout values
 * based on iOS 17 Human Interface Guidelines.
 */

// =============================================================================
// SPACING TOKENS
// =============================================================================

export const iMessageSpacing = {
    // Base unit (4pt grid)
    unit: 4,

    // Screen-level
    screenPaddingH: 16,
    safeAreaTop: 47,
    safeAreaBottom: 34,

    // Header
    headerHeight: 88,
    headerPaddingH: 16,
    headerBackButtonWidth: 44,
    headerAvatarSize: 40,
    headerAvatarGap: 8,

    // Message bubbles
    bubblePaddingH: 12,
    bubblePaddingV: 8,
    bubbleRadius: 18,
    bubbleMaxWidthRatio: 0.75,
    bubbleTailWidth: 8,
    bubbleTailHeight: 10,

    // Message gaps (between bubbles)
    messageGapMinimal: 2,      // Same sender, no metadata
    messageGapRun: 6,          // Same sender with metadata
    messageGapNormal: 12,      // Different sender
    messageGapWithTapback: 24, // Extra space for tapback badge

    // Tapback badge
    tapbackSize: 30,
    tapbackIconSize: 16,
    tapbackOffsetY: -15,
    tapbackOffsetX: 8,

    // Typing indicator
    typingDotSize: 8,
    typingDotGap: 4,
    typingBubblePaddingH: 16,
    typingBubblePaddingV: 12,

    // Input bar
    inputHeight: 50,
    inputFieldHeight: 34,
    inputPaddingH: 10,
    inputPaddingV: 8,
    inputBorderRadius: 18,
    inputIconSize: 24,
    inputIconGap: 8,

    // Conversation list
    listItemHeight: 75,
    listAvatarSize: 50,
    listPaddingH: 16,
    listPaddingV: 12,
    listGap: 0,
    listAvatarGap: 12,
    listUnreadBadgeSize: 20,

    // Search bar
    searchBarHeight: 36,
    searchBarMarginH: 16,
    searchBarMarginV: 8,
    searchBarRadius: 10,

    // Section headers
    sectionHeaderHeight: 28,
    sectionHeaderPaddingH: 16,
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

const SF_PRO = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif";

export const iMessageTypography = {
    fontFamily: SF_PRO,

    // Message text (17pt - iOS HIG)
    message: {
        fontFamily: SF_PRO,
        fontSize: 17,
        fontWeight: 400 as const,
        lineHeight: 22,
        letterSpacing: -0.41,
    },

    // Timestamp (11pt)
    timestamp: {
        fontFamily: SF_PRO,
        fontSize: 11,
        fontWeight: 400 as const,
        lineHeight: 13,
        letterSpacing: 0.07,
    },

    // Header title (17pt semibold)
    headerTitle: {
        fontFamily: SF_PRO,
        fontSize: 17,
        fontWeight: 600 as const,
        lineHeight: 22,
        letterSpacing: -0.41,
    },

    // Header subtitle (13pt)
    headerSubtitle: {
        fontFamily: SF_PRO,
        fontSize: 13,
        fontWeight: 400 as const,
        lineHeight: 16,
        letterSpacing: -0.08,
    },

    // Large title (34pt - for list header)
    largeTitle: {
        fontFamily: SF_PRO,
        fontSize: 34,
        fontWeight: 700 as const,
        lineHeight: 41,
        letterSpacing: 0.37,
    },

    // List item title (17pt semibold)
    listTitle: {
        fontFamily: SF_PRO,
        fontSize: 17,
        fontWeight: 600 as const,
        lineHeight: 22,
        letterSpacing: -0.41,
    },

    // List item preview (15pt)
    listPreview: {
        fontFamily: SF_PRO,
        fontSize: 15,
        fontWeight: 400 as const,
        lineHeight: 20,
        letterSpacing: -0.24,
    },

    // Caption (12pt)
    caption: {
        fontFamily: SF_PRO,
        fontSize: 12,
        fontWeight: 400 as const,
        lineHeight: 16,
        letterSpacing: 0,
    },

    // System message (13pt)
    system: {
        fontFamily: SF_PRO,
        fontSize: 13,
        fontWeight: 400 as const,
        lineHeight: 18,
        letterSpacing: -0.08,
    },

    // Input field (17pt)
    input: {
        fontFamily: SF_PRO,
        fontSize: 17,
        fontWeight: 400 as const,
        lineHeight: 22,
        letterSpacing: -0.41,
    },

    // Unread badge (12pt bold)
    badge: {
        fontFamily: SF_PRO,
        fontSize: 12,
        fontWeight: 600 as const,
        lineHeight: 14,
        letterSpacing: 0,
    },
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export const iMessageAnimations = {
    // Transitions
    transitionFast: "150ms ease-out",
    transitionNormal: "250ms ease-out",
    transitionSlow: "400ms ease-out",

    // Spring animations
    springBounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    springSmooth: "cubic-bezier(0.4, 0, 0.2, 1)",

    // Typing indicator
    typingDotDelay: 150, // ms between dots
    typingDotDuration: 600, // ms per dot animation
} as const;

// =============================================================================
// LAYOUT HELPERS
// =============================================================================

export const iMessageLayout = {
    screenWidth: 393,  // iPhone 14 Pro
    screenHeight: 852,

    // Content sizing helpers
    getMaxBubbleWidth: (screenWidth: number) =>
        Math.floor(screenWidth * iMessageSpacing.bubbleMaxWidthRatio),

    // Computed heights
    getChatAreaHeight: (screenHeight: number, safeTop: number, safeBottom: number) =>
        screenHeight - iMessageSpacing.headerHeight - iMessageSpacing.inputHeight - safeTop - safeBottom,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type IMessageSpacing = typeof iMessageSpacing;
export type IMessageTypography = typeof iMessageTypography;
export type IMessageAnimations = typeof iMessageAnimations;
