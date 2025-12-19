/**
 * Shared Design Tokens & UI Primitives
 * Platform-agnostic tokens for iOS and Android rendering.
 * 
 * NOTE: App-specific configs (whatsapp, instagram, etc.) in appConfigs
 * are legacy and should be moved to their respective plugin packages.
 */

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export const iOSTokens = {
    // Colors
    colors: {
        // System colors
        primary: "#007AFF",
        success: "#34C759",
        warning: "#FF9500",
        danger: "#FF3B30",

        // Grays
        label: "#000000",
        secondaryLabel: "#8E8E93",
        tertiaryLabel: "#C7C7CC",
        background: "#FFFFFF",
        secondaryBackground: "#F2F2F7",
        separator: "rgba(60, 60, 67, 0.36)",

        // @deprecated - App colors should be in plugin packages
        // These are left for backward compatibility
    },

    // Typography (in 3x scale for Remotion)
    typography: {
        largeTitle: { fontSize: 102, fontWeight: "700" as const, lineHeight: 123 },
        title1: { fontSize: 84, fontWeight: "700" as const, lineHeight: 102 },
        title2: { fontSize: 66, fontWeight: "700" as const, lineHeight: 78 },
        title3: { fontSize: 60, fontWeight: "600" as const, lineHeight: 72 },
        headline: { fontSize: 51, fontWeight: "600" as const, lineHeight: 63 },
        body: { fontSize: 51, fontWeight: "400" as const, lineHeight: 66 },
        callout: { fontSize: 48, fontWeight: "400" as const, lineHeight: 60 },
        subhead: { fontSize: 45, fontWeight: "400" as const, lineHeight: 57 },
        footnote: { fontSize: 39, fontWeight: "400" as const, lineHeight: 51 },
        caption1: { fontSize: 36, fontWeight: "400" as const, lineHeight: 48 },
        caption2: { fontSize: 33, fontWeight: "400" as const, lineHeight: 42 },
    },

    // Spacing (in 3x scale)
    spacing: {
        xs: 12,
        sm: 24,
        md: 48,
        lg: 72,
        xl: 96,
    },

    // Radii (in 3x scale)
    radii: {
        sm: 12,
        md: 24,
        lg: 36,
        xl: 48,
        pill: 999,
    },

    // Shadows
    shadows: {
        sm: "0 3px 9px rgba(0,0,0,0.08)",
        md: "0 6px 18px rgba(0,0,0,0.12)",
        lg: "0 12px 36px rgba(0,0,0,0.16)",
    },

    // Font family
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif",
};

export const androidTokens = {
    // Colors (Material You)
    colors: {
        primary: "#1A73E8",
        success: "#34A853",
        warning: "#FBBC04",
        danger: "#EA4335",

        label: "#202124",
        secondaryLabel: "#5F6368",
        tertiaryLabel: "#9AA0A6",
        background: "#FFFFFF",
        secondaryBackground: "#F8F9FA",
        separator: "rgba(0, 0, 0, 0.12)",

        // @deprecated - App colors should be in plugin packages
    },

    // Typography (Material 3, in 3x scale)
    typography: {
        displayLarge: { fontSize: 171, fontWeight: "400" as const, lineHeight: 192 },
        displayMedium: { fontSize: 135, fontWeight: "400" as const, lineHeight: 156 },
        displaySmall: { fontSize: 108, fontWeight: "400" as const, lineHeight: 132 },
        headlineLarge: { fontSize: 96, fontWeight: "400" as const, lineHeight: 120 },
        headlineMedium: { fontSize: 84, fontWeight: "400" as const, lineHeight: 108 },
        headlineSmall: { fontSize: 72, fontWeight: "400" as const, lineHeight: 96 },
        titleLarge: { fontSize: 66, fontWeight: "400" as const, lineHeight: 84 },
        titleMedium: { fontSize: 48, fontWeight: "500" as const, lineHeight: 72 },
        titleSmall: { fontSize: 42, fontWeight: "500" as const, lineHeight: 60 },
        bodyLarge: { fontSize: 48, fontWeight: "400" as const, lineHeight: 72 },
        bodyMedium: { fontSize: 42, fontWeight: "400" as const, lineHeight: 60 },
        bodySmall: { fontSize: 36, fontWeight: "400" as const, lineHeight: 48 },
        labelLarge: { fontSize: 42, fontWeight: "500" as const, lineHeight: 60 },
        labelMedium: { fontSize: 36, fontWeight: "500" as const, lineHeight: 48 },
        labelSmall: { fontSize: 33, fontWeight: "500" as const, lineHeight: 48 },
    },

    // Spacing
    spacing: {
        xs: 12,
        sm: 24,
        md: 48,
        lg: 72,
        xl: 96,
    },

    // Radii
    radii: {
        sm: 12,
        md: 24,
        lg: 42,
        xl: 84,
        pill: 999,
    },

    // Font family
    fontFamily: "'Roboto', 'Google Sans', sans-serif",
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Import Platform from types/device to avoid duplicate exports
import type { Platform } from "./types/device";
// Re-export for backward compatibility (consumers of tokens.ts may expect it)
export type { Platform };

export function getTokens(platform: Platform) {
    return platform === "ios" ? iOSTokens : androidTokens;
}

// Unified typography that maps semantic names to platform-specific styles
type SemanticTypography = "largeTitle" | "title" | "headline" | "body" | "callout" | "caption" | "footnote";

const typographyMap: Record<SemanticTypography, { ios: keyof typeof iOSTokens.typography; android: keyof typeof androidTokens.typography }> = {
    largeTitle: { ios: "largeTitle", android: "displaySmall" },
    title: { ios: "title1", android: "headlineLarge" },
    headline: { ios: "headline", android: "titleMedium" },
    body: { ios: "body", android: "bodyLarge" },
    callout: { ios: "callout", android: "bodyMedium" },
    caption: { ios: "caption1", android: "bodySmall" },
    footnote: { ios: "footnote", android: "labelMedium" }
};

export function getTypography(platform: Platform, semantic: SemanticTypography) {
    const map = typographyMap[semantic];
    if (platform === "ios") {
        return iOSTokens.typography[map.ios];
    }
    return androidTokens.typography[map.android];
}

// =============================================================================
// SHARED STYLES
// =============================================================================

export const sharedStyles = {
    // Flexbox utilities
    flexCenter: {
        display: "flex" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    flexBetween: {
        display: "flex" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
    },
    flexColumn: {
        display: "flex" as const,
        flexDirection: "column" as const,
    },

    // Full size
    absoluteFill: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    // Text truncation
    truncate: {
        overflow: "hidden" as const,
        textOverflow: "ellipsis" as const,
        whiteSpace: "nowrap" as const,
    },
};

// =============================================================================
// APP-SPECIFIC CONFIG
// @deprecated These configs are being migrated to their respective app packages.
//             - WhatsApp: @tokovo/apps-whatsapp/src/tokens/config.ts
//             - Instagram: @tokovo/apps-instagram/src/tokens/config.ts (future)
//             These exports are kept for backward compatibility.
// =============================================================================

export const appConfigs = {
    whatsapp: {
        ios: {
            // Header
            headerHeight: 270,
            headerBg: "#F6F6F6",
            statusBarHeight: 144,
            avatarSize: 111,
            avatarMargin: 24,
            headerTitleSize: 51,
            headerSubtitleSize: 36,
            headerIconGap: 54,

            // Chat area
            chatBackground: "#ECE5DD",
            inputHeight: 180,

            // Message bubbles
            bubblePadding: 24,
            bubblePaddingHorizontal: 36,
            bubbleRadius: 24,
            bubbleTailRadius: 6,
            bubbleMaxWidth: "78%",
            bubbleMarginHorizontal: 36,
            bubbleGap: 12,  // Gap between consecutive messages
            bubbleShadow: "0 1px 0.5px rgba(0,0,0,0.13)",

            // Bubble colors
            bubbleMyColor: "#E7FFDB",
            bubbleOtherColor: "#FFFFFF",
            bubbleTextColor: "#111B21",

            // Message text
            messageTextSize: 48,
            messageLineHeight: 66,
            timestampSize: 33,
            timestampColor: "#667781",

            // Sender name (groups)
            senderNameSize: 33,
            senderNameColor: "#25D366",

            // Read receipts
            accentColor: "#25D366",
            readReceiptColor: "#53BDEB",
            unreadReceiptColor: "#8696A0",

            // Avatar (for contacts without photos)
            avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            avatarFontSize: 45,

            // Input area
            inputBg: "#FFFFFF",
            inputBorderRadius: 60,
            inputPlaceholderColor: "#8E8E93",
            inputTextColor: "#000000",
            inputIconColor: "#8E8E93",
            sendButtonColor: "#25D366",

            // Tuning indicator
            typingBubbleColor: "#FFFFFF",
            typingDotColor: "#8E8E93",
            typingDotSize: 24,

            // "Psychotic" Features
            editedLabelColor: "#8E8E93",
            editedLabelSize: 30,

            missedCallIconColor: "#FF3B30",
            missedCallBubbleColor: "#FFFFFF",

            adminBadgeColor: "#E1DAD0",
            adminTextColor: "#667781",

            waveformActiveColor: "#007AFF",
            waveformInactiveColor: "#C7C7CC",

            screenshotAlertBg: "rgba(255,59,48,0.1)",
            screenshotAlertText: "#FF3B30",
        },
        android: {
            // Header
            headerHeight: 255,
            headerBg: "#008069",
            statusBarHeight: 120,
            avatarSize: 105,
            avatarMargin: 24,
            headerTitleSize: 48,
            headerSubtitleSize: 33,
            headerIconGap: 48,

            // Chat area
            chatBackground: "#ECE5DD",
            inputHeight: 165,

            // Message bubbles
            bubblePadding: 21,
            bubblePaddingHorizontal: 33,
            bubbleRadius: 21,
            bubbleTailRadius: 6,
            bubbleMaxWidth: "78%",
            bubbleMarginHorizontal: 30,
            bubbleGap: 9,
            bubbleShadow: "0 1px 1px rgba(0,0,0,0.1)",

            // Bubble colors
            bubbleMyColor: "#E7FFDB",
            bubbleOtherColor: "#FFFFFF",
            bubbleTextColor: "#111B21",

            // Message text
            messageTextSize: 45,
            messageLineHeight: 63,
            timestampSize: 30,
            timestampColor: "#667781",

            // Sender name (groups)
            senderNameSize: 30,
            senderNameColor: "#25D366",

            // Read receipts
            accentColor: "#25D366",
            readReceiptColor: "#53BDEB",
            unreadReceiptColor: "#8696A0",

            // Avatar (for contacts without photos)
            avatarGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            avatarFontSize: 42,

            // Input area
            inputBg: "#FFFFFF",
            inputBorderRadius: 60,
            inputPlaceholderColor: "#8E8E93",
            inputTextColor: "#000000",
            inputIconColor: "#8E8E93",
            sendButtonColor: "#008069", // Android Teal

            // Typing indicator
            typingBubbleColor: "#FFFFFF",
            typingDotColor: "#8E8E93",
            typingDotSize: 21,

            // "Psychotic" Features
            editedLabelColor: "#8E8E93",
            editedLabelSize: 27,

            missedCallIconColor: "#FF3B30",
            missedCallBubbleColor: "#FFFFFF",

            adminBadgeColor: "#E1DAD0",
            adminTextColor: "#54656F",

            waveformActiveColor: "#008069",
            waveformInactiveColor: "#C7C7CC",

            screenshotAlertBg: "rgba(255,59,48,0.1)",
            screenshotAlertText: "#FF3B30",
        },
    },
    instagram: {
        ios: {
            headerHeight: 264,
            navHeight: 147,
            storySize: 210,
            accentColor: "#E4405F",
        },
        android: {
            headerHeight: 252,
            navHeight: 144,
            storySize: 200,
            accentColor: "#E4405F",
        }
    },
    imessage: {
        ios: {
            bubbleMyColor: "#007AFF",
            bubbleMyTextColor: "#FFFFFF",
            bubbleOtherColor: "#E9E9EB",
            bubbleOtherTextColor: "#000000",
            accentColor: "#007AFF",
        },
        android: {
            bubbleMyColor: "#007AFF",
            bubbleMyTextColor: "#FFFFFF",
            bubbleOtherColor: "#E9E9EB",
            bubbleOtherTextColor: "#000000",
            accentColor: "#007AFF",
        }
    },
    homescreen: {
        ios: {
            // Grid
            gridColumns: 4,
            gridRows: 6,
            gridGapRow: 36,
            gridGapCol: 0,
            gridPaddingTop: 240,
            gridPaddingHorizontal: 30,

            // Icons
            iconSize: 180,
            iconRadius: 40, // 180 * 0.22 roughly
            iconLabelSize: 33,
            iconLabelColor: "#FFFFFF",
            iconLabelGap: 12,

            // Folders
            folderBackdrop: "rgba(255,255,255,0.2)",
            folderBlur: "30px",
            folderPreviewGap: 9,
            folderMiniIconRadius: 0.2, // relative to mini size

            // Dock
            dockHeight: 270,
            dockRadius: 90,
            dockBottom: 60,
            dockWidth: "92%",
            dockBackdrop: "rgba(255,255,255,0.2)",
            dockBlur: "60px",
            dockIconSize: 150,

            // Page Dots
            dotSize: 21,
            dotGap: 18,
            dotActiveColor: "#FFFFFF",
            dotInactiveColor: "rgba(255,255,255,0.4)",
            dotMarginBottom: 30,
        },
        android: {
            // Grid
            gridColumns: 5,
            gridRows: 6,
            gridGapRow: 48,
            gridGapCol: 0,
            gridPaddingTop: 150,
            gridPaddingHorizontal: 24,

            // Icons
            iconSize: 165,
            iconRadius: 82.5, // Circular
            iconLabelSize: 30,
            iconLabelColor: "#FFFFFF",
            iconLabelGap: 15,

            // Folders
            folderBackdrop: "rgba(255,255,255,0.15)",
            folderBlur: "20px",
            folderPreviewGap: 12,
            folderMiniIconRadius: 0.5,

            // Dock (Android usually simpler / just icons)
            dockHeight: 240,
            dockRadius: 0, // No dock background conventionally
            dockBottom: 30,
            dockWidth: "100%",
            dockBackdrop: "transparent",
            dockBlur: "0px",
            dockIconSize: 165,

            // Page Dots
            dotSize: 18,
            dotGap: 24,
            dotActiveColor: "#FFFFFF",
            dotInactiveColor: "rgba(255,255,255,0.4)",
            dotMarginBottom: 45,
        }
    }
};

// =============================================================================
// EXPORT CONFIG GETTER
// =============================================================================

export function getAppConfig<T extends keyof typeof appConfigs>(
    app: T,
    platform: Platform
): typeof appConfigs[T][Platform] {
    const config = appConfigs[app];
    return (config as any)[platform] || (config as any).ios;
}
