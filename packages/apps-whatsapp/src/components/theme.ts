/**
 * WhatsApp iOS Theme Tokens
 * 
 * Pixel-perfect colors and typography based on WhatsApp iOS 2024
 */

// =============================================================================
// WHATSAPP iOS COLOR PALETTE
// =============================================================================

export const whatsappColors = {
  // Primary brand colors
  primary: "#25D366",           // Main WhatsApp green (badges, active states)
  primaryDark: "#128C7E",       // Darker teal for accents
  primaryDarker: "#075E54",     // Header backgrounds on Android
  
  // Read receipts
  readReceipt: "#53BDEB",       // Blue double-check (read)
  sentReceipt: "#8696A0",       // Grey double-check (sent/delivered)
  
  // Text colors
  textPrimary: "#000000",       // Main text
  textSecondary: "#8E8E93",     // Timestamps, subtitles, inactive
  textTertiary: "#667781",      // Even lighter text
  
  // Backgrounds
  bgPrimary: "#FFFFFF",         // Main background
  bgSecondary: "#F2F2F7",       // Search bar, filter chips inactive
  bgTertiary: "#E8E8ED",        // Filter chips active
  bgChat: "#E5DDD5",            // Chat wallpaper
  
  // Bubbles
  bubbleOutgoing: "#DCF8C6",    // Green bubble (sent)
  bubbleIncoming: "#FFFFFF",    // White bubble (received)
  
  // UI elements
  separator: "#C6C6C8",         // Divider lines
  separatorLight: "rgba(0,0,0,0.1)", // Lighter dividers
  
  // iOS system colors
  iosBlue: "#007AFF",           // iOS default blue (NOT for WhatsApp accents)
  iosRed: "#FF3B30",            // Delete, error states
  iosGreen: "#34C759",          // iOS green (different from WA green)
  
  // Tab bar
  tabInactive: "#8E8E93",       // Inactive tab icons/text
  tabActive: "#25D366",         // Active tab (GREEN, not blue!)
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Large title (Chat list "Chats" header)
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.37,
  },
  
  // Navigation title
  title: {
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: -0.41,
  },
  
  // Chat list item name
  headline: {
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: -0.41,
  },
  
  // Chat list item message preview
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: -0.24,
  },
  
  // Timestamp
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    letterSpacing: -0.08,
  },
  
  // Tab bar labels
  tabLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    letterSpacing: 0,
  },
  
  // Badge text
  badge: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  
  // Filter chips
  chip: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
} as const;

// =============================================================================
// SPACING & SIZING
// =============================================================================

export const spacing = {
  // Chat list
  chatListItemHeight: 72,
  avatarSize: 56,
  avatarMarginLeft: 16,
  contentMarginLeft: 12,  // Gap between avatar and content
  contentMarginRight: 16,
  
  // Tab bar
  tabBarHeight: 49,
  tabIconSize: 25,
  
  // Header
  navBarHeight: 44,
  searchBarHeight: 36,
  filterChipHeight: 32,
  
  // Badges
  badgeMinWidth: 20,
  badgeHeight: 20,
  badgePadding: 6,
  
  // Border radius
  avatarRadius: 28,           // Half of avatar size = circle
  searchBarRadius: 10,
  filterChipRadius: 16,       // Pill shape
  badgeRadius: 10,            // Half of badge height = circle
} as const;

// =============================================================================
// LEGACY THEME SUPPORT (backwards compatibility)
// =============================================================================

export const iOSTokens = {
  colors: {
    primary: whatsappColors.primary,
    secondary: whatsappColors.textSecondary,
    background: whatsappColors.bgPrimary,
    headerBg: whatsappColors.bgPrimary,
    chatBg: whatsappColors.bgChat,
    bubbleMyBg: whatsappColors.bubbleOutgoing,
    bubbleOtherBg: whatsappColors.bubbleIncoming,
    bubbleText: whatsappColors.textPrimary,
    bubbleTime: whatsappColors.textSecondary,
    separator: whatsappColors.separator,
  },
  typography: {
    body: { fontSize: 16, lineHeight: "21px" },
    caption: { fontSize: 11, lineHeight: "13px" },
    headerTitle: { fontSize: 17, fontWeight: "600" },
    headerSubtitle: { fontSize: 12 },
  },
};

export type Theme = typeof iOSTokens;

export function getTheme(_platform: "ios" | "android"): Theme {
  return iOSTokens;
}

// =============================================================================
// THEME OBJECT EXPORT
// =============================================================================

export const whatsappIOSTheme = {
  colors: whatsappColors,
  typography,
  spacing,
} as const;

export type WhatsAppIOSTheme = typeof whatsappIOSTheme;
