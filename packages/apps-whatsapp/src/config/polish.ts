/**
 * WhatsApp Pixel-Perfect Polish
 * 
 * CSS-in-JS values for authentic WhatsApp iOS styling.
 * All values at 3x retina scale.
 */

// =============================================================================
// AUTHENTIC BUBBLE STYLING (iOS WhatsApp)
// =============================================================================

export const BUBBLE_POLISH = {
    // My messages (right side, green)
    my: {
        backgroundColor: "#E7FFDB",
        borderRadius: {
            topLeft: 54,
            topRight: 18,      // Smaller for tail effect
            bottomLeft: 54,
            bottomRight: 54,
        },
        padding: {
            vertical: 27,
            horizontal: 36,
        },
        shadow: "0 1px 0.5px rgba(0,0,0,0.13)",
    },

    // Other's messages (left side, white)
    other: {
        backgroundColor: "#FFFFFF",
        borderRadius: {
            topLeft: 18,       // Smaller for tail effect
            topRight: 54,
            bottomLeft: 54,
            bottomRight: 54,
        },
        padding: {
            vertical: 27,
            horizontal: 36,
        },
        shadow: "0 1px 0.5px rgba(0,0,0,0.13)",
    },
};

// =============================================================================
// TYPOGRAPHY (iOS WhatsApp - SF Pro)
// =============================================================================

export const TYPOGRAPHY_POLISH = {
    message: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        fontSize: 51,           // 17px * 3
        lineHeight: 69,         // 23px * 3
        fontWeight: 400,
        color: "#111B21",
    },

    timestamp: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        fontSize: 33,           // 11px * 3
        lineHeight: 39,
        fontWeight: 400,
        color: "#667781",
    },

    senderName: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        fontSize: 39,           // 13px * 3
        lineHeight: 48,
        fontWeight: 600,
        color: "#1F7AEB",       // Blue for sender names in groups
    },

    headerTitle: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        fontSize: 51,
        lineHeight: 60,
        fontWeight: 600,
        color: "#000000",
    },

    headerSubtitle: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        fontSize: 36,
        lineHeight: 42,
        fontWeight: 400,
        color: "#8E8E93",
    },
};

// =============================================================================
// SPACING (iOS WhatsApp)
// =============================================================================

export const SPACING_POLISH = {
    bubbleMargin: 36,           // From edge
    bubbleGap: 6,               // Between messages from same sender
    bubbleGroupGap: 18,         // Between message groups
    timestampGap: 9,            // Between timestamp and checkmarks
    headerHeight: 270,          // Header height at 3x
    inputHeight: 156,           // Input area height at 3x
    statusBarHeight: 144,       // iOS status bar at 3x
    safeAreaBottom: 102,        // Home indicator area
};

// =============================================================================
// ICONS (iOS WhatsApp)
// =============================================================================

export const ICONS_POLISH = {
    checkmarks: {
        size: 42,               // Double check size
        colorSent: "#8E8E93",   // Gray for sent
        colorRead: "#53BDEB",   // Blue for read
    },

    headerIcons: {
        size: 66,               // Video/call icons
        color: "#007AFF",       // iOS blue
        spacing: 48,            // Between icons
    },
};

// =============================================================================
// ANIMATION PRESETS
// =============================================================================

export const ANIMATION_POLISH = {
    messageAppear: {
        duration: 12,           // Frames (0.4s at 30fps)
        offset: 30,             // Pixels to slide
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    },

    typingBubble: {
        dotSize: 24,
        dotGap: 12,
        cycleDuration: 42,      // Frames per cycle
    },

    scrollSmooth: {
        duration: 15,           // Frames
        easing: "ease-out",
    },
};
