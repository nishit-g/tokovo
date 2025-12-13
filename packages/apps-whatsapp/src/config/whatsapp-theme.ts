/**
 * WhatsApp Theme Configuration
 * 
 * Configurable colors, typography, and bubble styling.
 * Supports light/dark mode and custom themes.
 */

// =============================================================================
// COLOR CONFIGURATION
// =============================================================================

export interface BubbleColors {
    /** Background color for own messages */
    myBubble: string;
    /** Background color for others' messages */
    otherBubble: string;
    /** Text color for own messages */
    myText: string;
    /** Text color for others' messages */
    otherText: string;
    /** Timestamp color */
    timestamp: string;
    /** Link color */
    link: string;
}

export interface HeaderColors {
    /** Header background */
    background: string;
    /** Header title text */
    title: string;
    /** Header subtitle (status) */
    subtitle: string;
    /** Icon color */
    icons: string;
}

export interface InputColors {
    /** Input area background */
    background: string;
    /** Input field background */
    field: string;
    /** Input field border */
    border: string;
    /** Placeholder text */
    placeholder: string;
    /** Icon color */
    icons: string;
    /** Send button color */
    sendButton: string;
}

export interface SystemColors {
    /** WhatsApp accent green */
    accent: string;
    /** Read receipt blue */
    readReceipt: string;
    /** Unread badge background */
    unreadBadge: string;
    /** Online indicator */
    online: string;
    /** Chat background / wallpaper */
    chatBackground: string;
    /** System message bubble */
    systemBubble: string;
    /** System message text */
    systemText: string;
}

export interface ThemeColors {
    bubble: BubbleColors;
    header: HeaderColors;
    input: InputColors;
    system: SystemColors;
}

// =============================================================================
// TYPOGRAPHY CONFIGURATION
// =============================================================================

export interface FontConfig {
    family: string;
    size: number;
    weight: number;
    lineHeight: number;
}

export interface ThemeTypography {
    /** Message text */
    message: FontConfig;
    /** Message timestamp */
    timestamp: FontConfig;
    /** Header title */
    headerTitle: FontConfig;
    /** Header subtitle */
    headerSubtitle: FontConfig;
    /** System message */
    systemMessage: FontConfig;
    /** Input field */
    input: FontConfig;
}

// =============================================================================
// BUBBLE CONFIGURATION
// =============================================================================

export interface BubbleConfig {
    /** Border radius for bubbles */
    borderRadius: number;
    /** Maximum width as percentage of container */
    maxWidth: number;
    /** Horizontal padding inside bubble */
    horizontalPadding: number;
    /** Vertical padding inside bubble */
    verticalPadding: number;
    /** Show bubble tail */
    showTail: boolean;
    /** Tail size */
    tailSize: number;
}

// =============================================================================
// COMPLETE THEME
// =============================================================================

export interface WhatsAppTheme {
    mode: "light" | "dark";
    colors: ThemeColors;
    typography: ThemeTypography;
    bubble: BubbleConfig;
}

// =============================================================================
// iOS WHATSAPP LIGHT THEME
// =============================================================================

export const iOS_WHATSAPP_LIGHT: WhatsAppTheme = {
    mode: "light",
    colors: {
        bubble: {
            myBubble: "#DCF8C6",
            otherBubble: "#FFFFFF",
            myText: "#000000",
            otherText: "#000000",
            timestamp: "#8E8E93",
            link: "#007AFF",
        },
        header: {
            background: "#F6F6F6",
            title: "#000000",
            subtitle: "#8E8E93",
            icons: "#007AFF",
        },
        input: {
            background: "#F6F6F6",
            field: "#FFFFFF",
            border: "#E5E5EA",
            placeholder: "#8E8E93",
            icons: "#007AFF",
            sendButton: "#25D366",
        },
        system: {
            accent: "#25D366",
            readReceipt: "#53BDEB",
            unreadBadge: "#25D366",
            online: "#25D366",
            chatBackground: "#E5DDD5",
            systemBubble: "rgba(0,0,0,0.05)",
            systemText: "#8E8E93",
        },
    },
    typography: {
        message: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            size: 51,      // 17px * 3 for retina
            weight: 400,
            lineHeight: 66,
        },
        timestamp: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            size: 33,      // 11px * 3
            weight: 400,
            lineHeight: 36,
        },
        headerTitle: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            size: 51,
            weight: 600,
            lineHeight: 60,
        },
        headerSubtitle: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            size: 36,
            weight: 400,
            lineHeight: 42,
        },
        systemMessage: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            size: 39,
            weight: 400,
            lineHeight: 48,
        },
        input: {
            family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            size: 48,
            weight: 400,
            lineHeight: 60,
        },
    },
    bubble: {
        borderRadius: 54,
        maxWidth: 0.78,
        horizontalPadding: 36,
        verticalPadding: 24,
        showTail: true,
        tailSize: 24,
    },
};

// =============================================================================
// iOS WHATSAPP DARK THEME
// =============================================================================

export const iOS_WHATSAPP_DARK: WhatsAppTheme = {
    mode: "dark",
    colors: {
        bubble: {
            myBubble: "#005C4B",
            otherBubble: "#1F2C34",
            myText: "#FFFFFF",
            otherText: "#FFFFFF",
            timestamp: "#8696A0",
            link: "#53BDEB",
        },
        header: {
            background: "#1F2C34",
            title: "#FFFFFF",
            subtitle: "#8696A0",
            icons: "#53BDEB",
        },
        input: {
            background: "#1F2C34",
            field: "#2A3942",
            border: "#2A3942",
            placeholder: "#8696A0",
            icons: "#8696A0",
            sendButton: "#00A884",
        },
        system: {
            accent: "#00A884",
            readReceipt: "#53BDEB",
            unreadBadge: "#00A884",
            online: "#00A884",
            chatBackground: "#0B141A",
            systemBubble: "rgba(255,255,255,0.05)",
            systemText: "#8696A0",
        },
    },
    typography: iOS_WHATSAPP_LIGHT.typography, // Same typography
    bubble: {
        borderRadius: 48,
        maxWidth: 0.78,
        horizontalPadding: 36,
        verticalPadding: 24,
        showTail: true,
        tailSize: 24,
    },
};

// =============================================================================
// THEME HELPERS
// =============================================================================

export function getTheme(mode: "light" | "dark" = "light"): WhatsAppTheme {
    return mode === "dark" ? iOS_WHATSAPP_DARK : iOS_WHATSAPP_LIGHT;
}

/** Create custom theme by merging with base */
export function createTheme(
    base: WhatsAppTheme,
    overrides: Partial<WhatsAppTheme>
): WhatsAppTheme {
    return {
        ...base,
        ...overrides,
        colors: {
            ...base.colors,
            ...overrides.colors,
        },
        typography: {
            ...base.typography,
            ...overrides.typography,
        },
        bubble: {
            ...base.bubble,
            ...overrides.bubble,
        },
    };
}
