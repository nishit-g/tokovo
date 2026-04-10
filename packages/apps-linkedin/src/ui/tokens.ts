/**
 * LinkedIn Design Tokens
 * =======================
 * Comprehensive token system for LinkedIn-like UI. All components should use these tokens
 * exclusively - no hardcoded values allowed.
 */

// =============================================================================
// SPACING
// =============================================================================
export const liSpacing = {
  // Base scale
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Component-specific
  screenPadding: 14,
  headerHeight: 56,
  navHeight: 58,
  cardPadding: 14,
  avatarGap: 12,
  sectionGap: 16,

  // Avatar sizes
  avatarXs: 28,
  avatarSm: 36,
  avatarMd: 44,
  avatarLg: 52,
  avatarXl: 88,

  // Profile specific
  bannerHeight: 116,
  profileAvatarOffset: -44,
  profileHeroHeight: 228,
  profileHighlightsHeight: 124,
  profileActionsHeight: 48,
  profilePostsTopGap: 18,

  // Input/composer
  inputHeight: 42,
  composerHeight: 58,
  buttonHeight: 36,
  feedComposerHeight: 116,
  sortRowHeight: 34,
  listRowHeight: 78,
  messageHeaderHeight: 64,

  // Action bar
  actionBarHeight: 48,
  actionIconSize: 22,
  postMediaHeight: 224,
  postCardHeight: 404,
  postCardExpandedHeight: 476,

  // Layout-system backwards compatible aliases
  cardPaddingH: 14,
  cardPaddingV: 14,
  cardRadius: 8,
  fabSize: 56,
  reactionRowHeight: 48,
  profileHeaderExtra: 132,
  commentComposerHeight: 84,
  dmComposerHeight: 84,
} as const;

// =============================================================================
// RADIUS
// =============================================================================
export const liRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,

  // Component-specific
  card: 8,
  button: 9999,
  avatar: 9999,
  input: 8,
  badge: 9999,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================
export const liShadows = {
  none: "none",
  sm: "0 1px 2px rgba(0, 0, 0, 0.08)",
  md: "0 2px 8px rgba(0, 0, 0, 0.10)",
  lg: "0 4px 16px rgba(0, 0, 0, 0.12)",
  xl: "0 8px 32px rgba(0, 0, 0, 0.16)",

  // Component-specific
  card: "0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
  cardHover: "0 0 0 1px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.08)",
  modal: "0 8px 32px rgba(0, 0, 0, 0.20)",
  fab: "0 4px 16px rgba(0, 102, 194, 0.24)",
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================
export const liTypography = {
  // Font family
  fontFamily:
    "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Fira Sans', Ubuntu, Oxygen, 'Oxygen Sans', Cantarell, 'Droid Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Lucida Grande', Helvetica, Arial, sans-serif",

  // Text styles
  displayLg: { fontSize: 24, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.2 },
  display: { fontSize: 20, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.15 },
  title: { fontSize: 16, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.1 },
  headline: { fontSize: 14, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
  caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0 },
  captionSemibold: { fontSize: 12, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0 },
  micro: { fontSize: 10, fontWeight: 500, lineHeight: 1.2, letterSpacing: 0.1 },
} as const;

// =============================================================================
// COLORS - Light Mode
// =============================================================================
export const liColorsLight = {
  // Backgrounds
  background: "#F4F2EE", // LinkedIn's signature warm gray
  surface: "#FFFFFF",
  surfaceHover: "#F5F5F5",
  surfaceActive: "#EBEBEB",

  // Text
  textPrimary: "rgba(0, 0, 0, 0.9)",
  textSecondary: "rgba(0, 0, 0, 0.6)",
  textTertiary: "rgba(0, 0, 0, 0.4)",
  textDisabled: "rgba(0, 0, 0, 0.3)",
  textInverse: "#FFFFFF",

  // Borders
  border: "rgba(0, 0, 0, 0.08)",
  borderStrong: "rgba(0, 0, 0, 0.15)",
  borderHover: "rgba(0, 0, 0, 0.25)",

  // Brand
  accent: "#0A66C2", // LinkedIn Blue
  accentHover: "#004182",
  accentLight: "rgba(10, 102, 194, 0.1)",

  // Reactions
  reactionLike: "#378FE9",
  reactionCelebrate: "#6DAE4F",
  reactionLove: "#DF704D",
  reactionInsightful: "#B28B28",
  reactionCurious: "#915DA3",
  reactionSupport: "#7B5782",

  // States
  success: "#057642",
  successLight: "rgba(5, 118, 66, 0.1)",
  error: "#CC1016",
  errorLight: "rgba(204, 16, 22, 0.1)",
  warning: "#915907",
  warningLight: "rgba(145, 89, 7, 0.1)",

  // Special
  online: "#057642",
  badge: "#CC1016",
  skeleton: "rgba(0, 0, 0, 0.08)",
} as const;

// =============================================================================
// COLORS - Dark Mode
// =============================================================================
export const liColorsDark = {
  // Backgrounds
  background: "#1D2226",
  surface: "#1D2226",
  surfaceHover: "#2C3338",
  surfaceActive: "#3A4148",

  // Text
  textPrimary: "rgba(255, 255, 255, 0.9)",
  textSecondary: "rgba(255, 255, 255, 0.6)",
  textTertiary: "rgba(255, 255, 255, 0.4)",
  textDisabled: "rgba(255, 255, 255, 0.3)",
  textInverse: "#000000",

  // Borders
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.15)",
  borderHover: "rgba(255, 255, 255, 0.25)",

  // Brand
  accent: "#70B5F9",
  accentHover: "#9DCAFC",
  accentLight: "rgba(112, 181, 249, 0.15)",

  // Reactions (same as light mode - they're emoji-based)
  reactionLike: "#378FE9",
  reactionCelebrate: "#6DAE4F",
  reactionLove: "#DF704D",
  reactionInsightful: "#B28B28",
  reactionCurious: "#915DA3",
  reactionSupport: "#7B5782",

  // States
  success: "#44B267",
  successLight: "rgba(68, 178, 103, 0.15)",
  error: "#F5625D",
  errorLight: "rgba(245, 98, 93, 0.15)",
  warning: "#E7A33E",
  warningLight: "rgba(231, 163, 62, 0.15)",

  // Special
  online: "#44B267",
  badge: "#F5625D",
  skeleton: "rgba(255, 255, 255, 0.08)",
} as const;

// =============================================================================
// ANIMATION
// =============================================================================
export const liAnimation = {
  // Durations
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",

  // Easings
  easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
  easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",

  // Common transitions
  color: "color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)",
  background: "background-color 200ms cubic-bezier(0.4, 0.0, 0.2, 1)",
  transform: "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)",
  opacity: "opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)",
  all: "all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)",
} as const;

// =============================================================================
// COMBINED THEME EXPORT (for backwards compatibility)
// =============================================================================
export const liColors = liColorsLight;

export const liTheme = {
  colors: liColors,
  typography: liTypography,
  spacing: liSpacing,
  radius: liRadius,
  shadows: liShadows,
  animation: liAnimation,
} as const;
