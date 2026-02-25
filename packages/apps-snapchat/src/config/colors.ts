/**
 * Snapchat Brand Colors
 */

export const snapchatColors = {
    // Brand
    yellow: "#FFFC00",
    yellowDark: "#E5E200",
    black: "#000000",
    white: "#FFFFFF",

    // Chat bubbles
    sentBubble: "#0AADFF",       // Blue for sent messages
    sentBubbleText: "#FFFFFF",
    receivedBubble: "#9B59B6",   // Purple for received messages
    receivedBubbleText: "#FFFFFF",

    // UI
    background: "#FFFFFF",
    backgroundDark: "#000000",
    headerBackground: "#FFFFFF",
    chatListBackground: "#FFFFFF",
    inputBackground: "#F1F1F1",
    inputPlaceholder: "#8E8E93",
    divider: "#E5E5EA",

    // Status indicators
    sentIndicator: "#0AADFF",     // Blue arrow (sent)
    deliveredIndicator: "#0AADFF",// Filled blue (delivered)
    openedIndicator: "#9B59B6",   // Purple (opened)
    screenshotIndicator: "#FF3B30",// Red (screenshot)

    // Snap indicators  
    snapRed: "#FF3B30",           // Snap without audio
    snapPurple: "#9B59B6",       // Snap with audio
    chatBlue: "#0AADFF",         // Chat message

    // Streak
    streakFire: "#FF6B35",

    // Text
    textPrimary: "#000000",
    textSecondary: "#8E8E93",
    textTertiary: "#C7C7CC",
    textLink: "#0AADFF",

    // System
    destructive: "#FF3B30",
    success: "#34C759",
} as const;
