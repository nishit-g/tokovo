/**
 * Instagram Theme Configuration
 * 
 * Colors, fonts, spacing for iOS Instagram style.
 */

// =============================================================================
// COLORS
// =============================================================================

export const instagramColors = {
    // Backgrounds
    background: "#FFFFFF",
    backgroundSecondary: "#FAFAFA",

    // Text
    textPrimary: "#262626",
    textSecondary: "#8E8E8E",
    textLink: "#0095F6",

    // Brand
    brandPrimary: "#E1306C", // Instagram gradient pink
    brandSecondary: "#833AB4", // Purple
    brandTertiary: "#FD1D1D", // Red-orange
    brandBlue: "#0095F6", // Link blue

    // UI Elements
    border: "#DBDBDB",
    divider: "#EFEFEF",
    icon: "#262626",
    iconSecondary: "#8E8E8E",

    // Stories gradient ring
    storiesGradient: "linear-gradient(45deg, #FD1D1D 0%, #E1306C 33%, #833AB4 66%, #405DE6 100%)",

    // DM bubbles
    dmBubbleIncoming: "#EFEFEF",
    dmBubbleOutgoing: "#0095F6",
    dmTextIncoming: "#262626",
    dmTextOutgoing: "#FFFFFF",
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const instagramTypography = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",

    // Sizes (logical pixels)
    username: { fontSize: 14, fontWeight: 600 },
    caption: { fontSize: 14, fontWeight: 400 },
    timestamp: { fontSize: 11, fontWeight: 400 },
    likes: { fontSize: 14, fontWeight: 600 },
    comment: { fontSize: 14, fontWeight: 400 },
    navIcon: { fontSize: 24 },
};

// =============================================================================
// SPACING
// =============================================================================

export const instagramSpacing = {
    screenPadding: 16,
    postPadding: 12,
    avatarSize: 32,
    storyAvatarSize: 64,
    iconSize: 24,
    bottomNavHeight: 50,
    headerHeight: 44,
};

// =============================================================================
// THEME OBJECT
// =============================================================================

export const instagramTheme = {
    colors: instagramColors,
    typography: instagramTypography,
    spacing: instagramSpacing,
};

export type InstagramTheme = typeof instagramTheme;
