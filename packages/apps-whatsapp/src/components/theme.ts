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
  textSecondary: "#667781",     // Timestamps, subtitles, inactive
  textTertiary: "#A1A8AE",      // Even lighter text
  
  // Backgrounds
  bgPrimary: "#FFFFFF",         // Main background
  bgSecondary: "#F6F7F9",       // Search bar, filter chips inactive
  bgTertiary: "#E9EEF1",        // Filter chips active
  bgElevated: "#FBFBFD",        // Header/Tab blur surface
  bgList: "#F9FAFB",            // Chat list base
  bgChat: "#E5DDD5",            // Chat wallpaper
  
  // Bubbles
  bubbleOutgoing: "#DCF8C6",    // Green bubble (sent)
  bubbleIncoming: "#FFFFFF",    // White bubble (received)
  
  // UI elements
  separator: "#E4E6EB",         // Divider lines
  separatorLight: "rgba(0,0,0,0.06)", // Lighter dividers
  separatorUltraLight: "rgba(0,0,0,0.04)",

  // Surfaces
  surfaceGlass: "rgba(251, 251, 253, 0.96)",

  // Avatars
  avatarPlaceholder: "#E0E0E0",
  avatarBorder: "#FFFFFF",

  // Accent shadows
  primaryGlow: "rgba(37,211,102,0.24)",

  // Media viewer
  mediaViewerBg: "#000000",
  mediaViewerText: "#FFFFFF",
  mediaViewerTextMuted: "rgba(255,255,255,0.7)",
  mediaViewerControlsBg: "rgba(0,0,0,0.4)",
  
  // iOS system colors
  iosBlue: "#007AFF",           // iOS default blue (NOT for WhatsApp accents)
  iosRed: "#FF3B30",            // Delete, error states
  iosGreen: "#34C759",          // iOS green (different from WA green)
  
  // Tab bar
  tabInactive: "#8E8E93",       // Inactive tab icons/text
  tabActive: "#25D366",         // Active tab (GREEN, not blue!)
  badgeMuted: "#98A1A8",        // Muted badge
  unreadBadgeText: "#FFFFFF",
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
  chatListItemHeight: 78,
  avatarSize: 56,
  avatarMarginLeft: 16,
  contentMarginLeft: 12,  // Gap between avatar and content
  contentMarginRight: 16,
  pagePaddingX: 16,
  pagePaddingWide: 20,
  headerActionGap: 20,
  filterChipPaddingX: 14,
  filterChipPaddingY: 6,
  filterChipGap: 8,
  searchPaddingX: 10,
  searchIconGap: 8,
  sectionGap: 16,
  
  // Tab bar
  tabBarHeight: 49,
  tabIconSize: 25,
  tabPaddingTop: 6,
  tabBadgeOffsetTop: -4,
  tabBadgeOffsetRight: -8,
  
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
  searchBarRadius: 12,
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

export const senderColors = [
  "#1D9BF0",
  "#00A884",
  "#D93025",
  "#9333EA",
  "#F59E0B",
  "#0EA5E9",
] as const;
