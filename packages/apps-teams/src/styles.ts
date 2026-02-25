/**
 * Microsoft Teams CSS-in-JS Styles — 1:1 Pixel-accurate
 *
 * Real Teams mobile visual signatures:
 * - Segoe UI Variable font stack
 * - Fluent UI color tokens
 * - Linear message feed (ALL messages left-aligned with avatar, name, text)
 * - No sent/received bubble color distinction — flat cards
 * - Header: hamburger left, title left-aligned, bell + avatar right
 * - All/Unread/Muted filter tabs (not Chat/Channels)
 * - Compose bar: paperclip, text, smiley, mic/send
 * - Bottom tab bar with Fluent icons
 * - Avatar circles with presence indicator dots
 */

import type { CSSProperties } from "react";
import { TEAMS_THEME_PRESETS } from "./config/theme.js";

const t = TEAMS_THEME_PRESETS.light;

export const teamsTheme = t;

const FONT = "'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif";

// =============================================================================
// SHELL
// =============================================================================

export const shellBaseStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  color: t.color.textPrimary,
  fontFamily: FONT,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  overflow: "hidden",
  backgroundColor: t.color.bg,
};

export const appBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
};

// =============================================================================
// HEADER — hamburger left, title left, bell + avatar right
// =============================================================================

export const headerStyle: CSSProperties = {
  minHeight: 48,
  display: "flex",
  alignItems: "center",
  padding: `0 ${t.spacing.lg}px`,
  backgroundColor: t.color.surface,
  borderBottom: `1px solid ${t.color.border}`,
  gap: t.spacing.md,
};

export const headerTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  fontFamily: FONT,
  color: t.color.textPrimary,
  letterSpacing: -0.3,
  flex: 1,
};

export const headerMetaStyle: CSSProperties = {
  fontSize: t.typography.caption,
  color: t.color.textSecondary,
  fontFamily: FONT,
};

// =============================================================================
// FILTER TABS — All / Unread / Muted
// =============================================================================

export const filterTabsContainerStyle: CSSProperties = {
  display: "flex",
  gap: 0,
  padding: `0 ${t.spacing.lg}px`,
  backgroundColor: t.color.surface,
  borderBottom: `1px solid ${t.color.border}`,
};

export const filterTabStyle = (active: boolean): CSSProperties => ({
  fontSize: 14,
  fontWeight: active ? 600 : 400,
  color: active ? t.color.brand : t.color.textSecondary,
  fontFamily: FONT,
  padding: `${t.spacing.sm}px ${t.spacing.lg}px`,
  borderBottom: active ? `2px solid ${t.color.brand}` : "2px solid transparent",
  cursor: "pointer",
});

// =============================================================================
// CHAT LIST
// =============================================================================

export const listViewportStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

export const chatRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: t.spacing.md,
  padding: `${t.spacing.md}px ${t.spacing.lg}px`,
  minHeight: 64,
  borderBottom: `0.5px solid ${t.color.border}`,
};

export const unreadBadgeStyle: CSSProperties = {
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  padding: "0 5px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: t.color.unreadBadge,
  color: "#ffffff",
  fontSize: t.typography.badge,
  fontWeight: 700,
  fontFamily: FONT,
};

export const rowMetaStyle: CSSProperties = {
  fontSize: t.typography.caption,
  color: t.color.textSecondary,
  fontFamily: FONT,
};

// =============================================================================
// THREAD — LINEAR MESSAGE FEED (all left-aligned)
// =============================================================================

export const threadPaneStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: `${t.spacing.sm}px 0`,
  backgroundColor: t.color.bg,
};

/** Each message is a full-width row: avatar | name+text+time */
export const messageRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: t.spacing.sm,
  padding: `${t.spacing.sm}px ${t.spacing.lg}px`,
};

export const messageSenderStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: t.color.textPrimary,
  fontFamily: FONT,
};

export const messageTextStyle: CSSProperties = {
  fontSize: t.typography.body,
  lineHeight: "20px",
  fontFamily: FONT,
  color: t.color.textPrimary,
  marginTop: 2,
};

export const messageTimeStyle: CSSProperties = {
  fontSize: t.typography.meta,
  color: t.color.textMuted,
  marginTop: 2,
  fontFamily: FONT,
};

// =============================================================================
// COMPOSE BAR — paperclip, text field, smiley, mic/send
// =============================================================================

export const composerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: t.spacing.sm,
  padding: `${t.spacing.sm}px ${t.spacing.lg}px`,
  backgroundColor: t.color.composeBar,
  borderTop: `1px solid ${t.color.border}`,
};

export const composerInputStyle: CSSProperties = {
  flex: 1,
  height: 38,
  borderRadius: t.radius.input,
  backgroundColor: t.color.hover,
  border: `1px solid ${t.color.border}`,
  display: "flex",
  alignItems: "center",
  padding: `0 ${t.spacing.md}px`,
  color: t.color.textMuted,
  fontSize: t.typography.body,
  fontFamily: FONT,
};

// =============================================================================
// BOTTOM TAB BAR
// =============================================================================

export const tabBarStyle: CSSProperties = {
  height: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  backgroundColor: t.color.tabBar,
  borderTop: `1px solid ${t.color.border}`,
  flexShrink: 0,
};

export const tabItemStyle = (active: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  color: active ? t.color.tabBarActive : t.color.tabBarInactive,
  fontSize: 10,
  fontWeight: active ? 600 : 400,
  fontFamily: FONT,
  flex: 1,
  position: "relative",
});

// =============================================================================
// AVATAR + PRESENCE DOT
// =============================================================================

export const avatarStyle = (size: number): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: t.color.brand,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: size * 0.38,
  fontFamily: FONT,
  position: "relative",
  flexShrink: 0,
});

export const presenceDotStyle = (status: string, avatarSize: number): CSSProperties => {
  const dotSize = Math.max(10, avatarSize * 0.28);
  let bg = t.color.presenceOffline;
  if (status === "available") bg = t.color.presenceAvailable;
  if (status === "busy") bg = t.color.presenceBusy;
  if (status === "away") bg = t.color.presenceAway;

  return {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: bg,
    border: `2px solid ${t.color.surface}`,
  };
};

// =============================================================================
// CALL OVERLAY
// =============================================================================

export const callSurfaceStyle: CSSProperties = {
  flex: 1,
  background: "linear-gradient(180deg, #292b4a 0%, #1b1d33 50%, #141527 100%)",
  display: "flex",
  flexDirection: "column",
};

export const callHeaderStyle: CSSProperties = {
  minHeight: 64,
  padding: `${t.spacing.sm}px ${t.spacing.lg}px`,
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

export const callGridStyle: CSSProperties = {
  flex: 1,
  padding: `${t.spacing.lg}px ${t.spacing.md}px`,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: t.spacing.md,
  alignContent: "start",
};

export const participantCardStyle: CSSProperties = {
  minHeight: 140,
  borderRadius: t.radius.panel,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: "#ffffff",
  fontFamily: FONT,
};

export const callControlsWrapStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: t.spacing.lg,
  padding: `${t.spacing.md}px ${t.spacing.lg}px ${t.spacing.xl}px`,
};

export const callControlStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 24,
  background: "rgba(255,255,255,0.12)",
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  fontSize: 10,
  fontFamily: FONT,
};

export const endCallControlStyle: CSSProperties = {
  ...callControlStyle,
  width: 56,
  borderRadius: 28,
  background: t.color.danger,
};

/** Inject @keyframes for any Teams CSS animations */
export function injectTeamsStyles(): void {
  if (typeof document === "undefined") return;
  const id = "teams-css-animations";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @keyframes teams-presence-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}
