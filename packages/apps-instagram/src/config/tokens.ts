export const instagramColors = {
  background: "#FFFFFF",
  backgroundAlt: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceRaised: "#F4F4F5",
  border: "#DBDBDB",
  borderStrong: "#C7C7CC",
  textPrimary: "#111111",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  accent: "#E1306C",
  accentSoft: "rgba(225,48,108,0.12)",
  accentWarm: "#F77737",
  accentCool: "#5851DB",
  success: "#16A34A",
  storyRingA: "#F9CE34",
  storyRingB: "#EE2A7B",
  storyRingC: "#6228D7",
} as const;

export const instagramTypography = {
  display: { fontSize: 26, fontWeight: "700" as const, letterSpacing: -0.45 },
  title: { fontSize: 18, fontWeight: "700" as const, letterSpacing: -0.2 },
  headline: { fontSize: 16, fontWeight: "600" as const, letterSpacing: -0.15 },
  body: { fontSize: 14, fontWeight: "400" as const, letterSpacing: -0.05 },
  bodyStrong: { fontSize: 14, fontWeight: "600" as const, letterSpacing: -0.05 },
  caption: { fontSize: 12, fontWeight: "500" as const, letterSpacing: 0.1 },
} as const;

export const instagramSpacing = {
  screenPadding: 16,
  headerHeight: 58,
  tabBarHeight: 58,
  storyTrayHeight: 112,
  avatarSize: 36,
  storyAvatarSize: 68,
  storyGap: 16,
  postGap: 16,
  composerHeight: 96,
} as const;
