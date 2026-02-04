export const xColors = {
  background: "#000000",
  surface: "#0B0B0F",
  surfaceElevated: "#111318",
  surfaceRaised: "#161A21",
  textPrimary: "#FFFFFF",
  textSecondary: "#C7CDD6",
  textMuted: "#6B7280",
  textFaint: "#4B5563",
  border: "#1F242C",
  borderStrong: "#2A313C",
  accent: "#1D9BF0",
  accentSoft: "rgba(29,155,240,0.18)",
  success: "#00BA7C",
  danger: "#F91880",
  warning: "#F5A524",
  link: "#6EE7FF",
  pill: "rgba(255,255,255,0.08)",
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
  cardPadding: 14,
  cardGap: 14,
  headerHeight: 54,
  avatarSize: 36,
  iconSize: 14,
  navHeight: 60,
  fabSize: 52,
} as const;

export const xTheme = {
  colors: xColors,
  typography: xTypography,
  spacing: xSpacing,
} as const;
