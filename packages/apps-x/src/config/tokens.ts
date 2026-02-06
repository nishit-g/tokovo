export const xColors = {
  // Core backgrounds - X Lights Out theme
  background: "#000000",
  surface: "#16181C",
  surfaceElevated: "#1D1F23",
  surfaceRaised: "#202327",

  // Text hierarchy
  textPrimary: "#E7E9EA",
  textSecondary: "#71767B",
  textMuted: "#536471",
  textFaint: "#3D4144",

  // Borders
  border: "#2F3336",
  borderStrong: "#3E4245",

  // Brand accent
  accent: "#1D9BF0",
  accentSoft: "rgba(29,155,240,0.1)",

  // Action states
  replyActive: "#1D9BF0",
  repostActive: "#00BA7C",
  likeActive: "#F91880",
  bookmarkActive: "#1D9BF0",

  // Status colors
  success: "#00BA7C",
  danger: "#F91880",
  warning: "#FFAD1F",

  // Links
  link: "#1D9BF0",

  // Pills/chips
  pill: "rgba(239,243,244,0.1)",
} as const;

export const xTypography = {
  display: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.3 },
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.25 },
  headline: { fontSize: 16, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "400" as const, letterSpacing: -0.1 },
  bodyStrong: { fontSize: 15, fontWeight: "600" as const, letterSpacing: -0.1 },
  caption: { fontSize: 12, fontWeight: "500" as const, letterSpacing: 0.1 },
  micro: { fontSize: 11, fontWeight: "500" as const, letterSpacing: 0.2 },
} as const;

export const xSpacing = {
  screenPadding: 16,
  tweetPaddingH: 16,
  tweetPaddingV: 12,
  cardGap: 0,
  headerHeight: 53,
  avatarSize: 40,
  avatarGap: 12,
  actionIconSize: 18,
  actionGap: 48,
  navHeight: 50,
  fabSize: 56,
  bannerHeight: 125,
  tabBarHeight: 44,
} as const;

export const xTheme = {
  colors: xColors,
  typography: xTypography,
  spacing: xSpacing,
} as const;
