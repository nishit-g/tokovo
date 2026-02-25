/**
 * Snapchat Brand Colors — Pixel-accurate
 */

export const snapchatColors = {
    // Brand
    yellow: "#FFFC00",
    yellowDark: "#E5E200",
    black: "#000000",
    white: "#FFFFFF",

    // Chat bubbles — REAL Snapchat colors
    sentBubble: "#E9E9EB",           // Light gray for sent
    sentBubbleText: "#000000",
    receivedBubble: "#FFFFFF",       // White for received
    receivedBubbleText: "#000000",

    // Edge indicator lines (vertical bars on bubble edges)
    sentEdge: "#0AADFF",            // Blue line on right side of sent
    receivedEdge: "#9B59B6",        // Purple line on left side of received

    // Backgrounds
    background: "#FFFFFF",
    backgroundChat: "#FFFFFF",       // Pure white like real Snapchat
    headerBackground: "#FFFFFF",
    chatListBackground: "#FFFFFF",

    // Input
    inputBackground: "#F1F1F1",
    inputPlaceholder: "#8E8E93",

    // Dividers
    divider: "#EFEFEF",

    // Indicator shapes (chat list)
    indicatorRed: "#FF3C3C",         // Snap (no audio) — red filled/hollow triangle
    indicatorPurple: "#9B59B6",      // Snap (with audio) — purple filled/hollow triangle
    indicatorBlue: "#0AADFF",        // Chat — blue filled/hollow square
    indicatorGray: "#8E8E93",        // Opened/read — gray

    // Status arrow colors (sent indicators)
    arrowSent: "#0AADFF",           // Blue = sent (not opened)
    arrowDelivered: "#0AADFF",      // Blue filled = delivered
    arrowOpened: "#9B59B6",         // Purple = opened
    arrowScreenshot: "#34C759",     // Green = screenshot

    // Streak
    streakFire: "#FF6B35",

    // Text
    textPrimary: "#000000",
    textSecondary: "#8E8E93",
    textTertiary: "#C7C7CC",
    textLink: "#0AADFF",
    textTimestamp: "#ACACAC",

    // System messages
    systemScreenshot: "#34C759",     // Green text for screenshot notifications
    systemSaved: "#0AADFF",         // Blue text for saved notifications

    // System
    destructive: "#FF3B30",
    success: "#34C759",
} as const;
