/**
 * Twitter/X Theme Configuration
 * 
 * Based on the latest X iOS app (2024) dark mode design.
 * Features the signature black background with blue/white accents.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const twitterColors = {
    // Primary backgrounds
    background: {
        primary: "#000000",         // Pure black (X's signature)
        secondary: "#16181C",       // Slightly lighter for cards
        elevated: "#1D1F23",        // Modal/sheet backgrounds
        hover: "#080808",           // Hover states
    },

    // Text colors
    text: {
        primary: "#E7E9EA",         // Main text (off-white)
        secondary: "#71767B",       // Muted text (handles, timestamps)
        tertiary: "#536471",        // Even more muted
        inverse: "#0F1419",         // Text on light backgrounds
    },

    // Brand colors
    brand: {
        blue: "#1D9BF0",            // Twitter/X blue (interactions)
        green: "#00BA7C",           // Success, retweets
        pink: "#F91880",            // Likes (pink heart)
        orange: "#FF7A00",          // Warnings
        purple: "#7856FF",          // Spaces
    },

    // Verified badge colors
    verified: {
        blue: "#1D9BF0",            // Twitter Blue/verified
        gold: "#E2B719",            // Organizations
        grey: "#829AAB",            // Government/multilateral
    },

    // UI elements
    ui: {
        border: "#2F3336",          // Dividers, borders
        borderLight: "#38444D",     // Lighter borders
        separator: "#1D1F23",       // Section separators
    },

    // Engagement colors
    engagement: {
        reply: "#71767B",           // Reply icon
        retweet: "#00BA7C",         // Retweet (green)
        like: "#F91880",            // Like (pink)
        view: "#71767B",            // View count
        share: "#71767B",           // Share/bookmark
    },
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const twitterTypography = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
    fontFamilyDisplay: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",

    // Font sizes (at 3x scale for Remotion)
    sizes: {
        displayName: 45,            // Bold name
        handle: 42,                 // @handle
        tweetText: 45,              // Main tweet text
        tweetTextLarge: 54,         // Large tweet (detail view)
        timestamp: 42,              // Relative time
        engagement: 39,             // Like/retweet counts
        engagementLarge: 48,        // Detail view counts
        tabLabel: 42,               // Navigation tabs
        buttonText: 42,             // Button labels
        badge: 33,                  // Notification badges
    },

    // Line heights
    lineHeights: {
        tweetText: 63,              // 1.4x font size
        tweetTextLarge: 75,
        displayName: 54,
    },

    // Font weights
    weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        heavy: 800,
    },
};

// =============================================================================
// SPACING (at 3x scale)
// =============================================================================

export const twitterSpacing = {
    // Padding
    tweetPadding: 48,               // Tweet horizontal padding
    tweetPaddingVertical: 36,       // Tweet vertical padding
    avatarGap: 36,                  // Gap between avatar and content

    // Avatar sizes
    avatarSize: 120,                // Standard avatar (40dp × 3)
    avatarSizeSmall: 90,            // Reply thread avatars
    avatarSizeLarge: 144,           // Profile view

    // Engagement bar
    engagementGap: 48,              // Gap between engagement buttons
    engagementIconSize: 54,         // Icon size

    // Media
    mediaRadius: 36,                // Image/video border radius
    mediagap: 6,                    // Gap between media items

    // Thread line
    threadLineWidth: 6,             // Reply thread connector
    threadLineGap: 12,              // Gap from avatar
};

// =============================================================================
// LAYOUT DIMENSIONS
// =============================================================================

export const twitterLayout = {
    // Device dimensions (iPhone 16 Pro at 3x)
    screenWidth: 1179,
    screenHeight: 2556,

    // Header
    headerHeight: 156,              // Top header
    tabBarHeight: 132,              // For You / Following tabs

    // Bottom navigation
    bottomNavHeight: 147,           // Bottom tab bar

    // Safe areas (iPhone with notch)
    safeAreaTop: 141,               // Status bar + notch
    safeAreaBottom: 102,            // Home indicator

    // Tweet sizing
    tweetMinHeight: 180,            // Minimum tweet height
    mediaMaxHeight: 900,            // Max height for single image
};

// =============================================================================
// THEME EXPORT
// =============================================================================

export interface TwitterTheme {
    mode: "dark" | "dim" | "light";
    colors: typeof twitterColors;
    typography: typeof twitterTypography;
    spacing: typeof twitterSpacing;
    layout: typeof twitterLayout;
}

export const darkTheme: TwitterTheme = {
    mode: "dark",
    colors: twitterColors,
    typography: twitterTypography,
    spacing: twitterSpacing,
    layout: twitterLayout,
};

// Dim theme (dark blue)
export const dimTheme: TwitterTheme = {
    ...darkTheme,
    mode: "dim",
    colors: {
        ...twitterColors,
        background: {
            primary: "#15202B",
            secondary: "#192734",
            elevated: "#1E2732",
            hover: "#1C2732",
        },
    },
};

export default darkTheme;
