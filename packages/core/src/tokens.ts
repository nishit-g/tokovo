/**
 * Shared Design Tokens & UI Primitives
 * Ensures consistent styling across WhatsApp, Instagram, and future apps
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

        // App-specific
        whatsappGreen: "#25D366",
        whatsappTeal: "#128C7E",
        instagramPink: "#E4405F",
        instagramPurple: "#833AB4",
        iMessageBlue: "#007AFF",
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

        whatsappGreen: "#25D366",
        instagramPink: "#E4405F",
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

export type Platform = "ios" | "android";

export function getTokens(platform: Platform) {
    return platform === "ios" ? iOSTokens : androidTokens;
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
// =============================================================================

export const appConfigs = {
    whatsapp: {
        ios: {
            headerHeight: 270,
            inputHeight: 180,
            bubbleMyColor: "#E7FFDB",
            bubbleOtherColor: "#FFFFFF",
            chatBackground: "#ECE5DD",
            accentColor: "#25D366",
        },
        android: {
            headerHeight: 255,
            inputHeight: 165,
            bubbleMyColor: "#E7FFDB",
            bubbleOtherColor: "#FFFFFF",
            chatBackground: "#ECE5DD",
            accentColor: "#25D366",
        }
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
