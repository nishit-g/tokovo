export const liColors = {
  background: "#F3F2EF",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceRaised: "#FFFFFF",

  textPrimary: "#1F2328",
  textSecondary: "#5E6B77",
  textMuted: "#8696A6",

  border: "rgba(0,0,0,0.10)",
  borderStrong: "rgba(0,0,0,0.18)",

  accent: "#0A66C2",
  accentSoft: "rgba(10,102,194,0.10)",

  success: "#2E7D32",
  danger: "#C62828",
  warning: "#B26A00",

  pill: "rgba(10,102,194,0.08)",
} as const;

export const liTypography = {
  display: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.2 },
  title: { fontSize: 18, fontWeight: "700" as const, letterSpacing: -0.15 },
  headline: { fontSize: 15, fontWeight: "600" as const, letterSpacing: -0.1 },
  body: { fontSize: 14, fontWeight: "400" as const, letterSpacing: -0.05 },
  bodyStrong: { fontSize: 14, fontWeight: "600" as const, letterSpacing: -0.05 },
  caption: { fontSize: 12, fontWeight: "500" as const, letterSpacing: 0.1 },
  micro: { fontSize: 11, fontWeight: "500" as const, letterSpacing: 0.15 },
} as const;

export const liSpacing = {
  screenPadding: 14,
  headerHeight: 54,
  navHeight: 52,
  cardPaddingH: 12,
  cardPaddingV: 12,
  cardRadius: 14,
  avatarSize: 40,
  avatarGap: 12,
  reactionRowHeight: 46,
  fabSize: 56,
  profileHeaderExtra: 86,
  commentComposerHeight: 72,
  dmComposerHeight: 76,
} as const;

export const liTheme = {
  colors: liColors,
  typography: liTypography,
  spacing: liSpacing,
} as const;

