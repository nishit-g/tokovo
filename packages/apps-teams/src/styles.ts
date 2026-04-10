import type { CSSProperties } from "react";
import type { TeamsDesignTokens } from "./config/theme.js";

export const teamsFontFamily =
  'var(--teams-font-family, "Aptos", "Segoe UI Variable", "Segoe UI", system-ui, sans-serif)';

let injected = false;

function px(value: number): string {
  return `${value}px`;
}

function token(name: string, fallback?: string): string {
  return fallback ? `var(${name}, ${fallback})` : `var(${name})`;
}

export function createTeamsRootVars(theme: TeamsDesignTokens): CSSProperties {
  return {
    "--teams-font-family": theme.typography.fontFamily,
    "--teams-font-family-mono": theme.typography.fontFamilyMono,
    "--teams-bg": theme.color.bg,
    "--teams-shell-start": theme.color.shellStart,
    "--teams-shell-end": theme.color.shellEnd,
    "--teams-shell-aurora": theme.color.shellAurora,
    "--teams-surface": theme.color.surface,
    "--teams-surface-elevated": theme.color.surfaceElevated,
    "--teams-surface-overlay": theme.color.surfaceOverlay,
    "--teams-surface-muted": theme.color.surfaceMuted,
    "--teams-border": theme.color.border,
    "--teams-border-strong": theme.color.borderStrong,
    "--teams-text-primary": theme.color.textPrimary,
    "--teams-text-secondary": theme.color.textSecondary,
    "--teams-text-muted": theme.color.textMuted,
    "--teams-text-inverse": theme.color.textInverse,
    "--teams-brand": theme.color.brand,
    "--teams-brand-strong": theme.color.brandStrong,
    "--teams-brand-soft": theme.color.brandSoft,
    "--teams-brand-glow": theme.color.brandGlow,
    "--teams-success": theme.color.success,
    "--teams-warning": theme.color.warning,
    "--teams-danger": theme.color.danger,
    "--teams-info": theme.color.info,
    "--teams-presence-available": theme.color.presenceAvailable,
    "--teams-presence-busy": theme.color.presenceBusy,
    "--teams-presence-away": theme.color.presenceAway,
    "--teams-presence-offline": theme.color.presenceOffline,
    "--teams-hover": theme.color.hover,
    "--teams-pressed": theme.color.pressed,
    "--teams-focus-ring": theme.color.focusRing,
    "--teams-selected": theme.color.selected,
    "--teams-unread-badge": theme.color.unreadBadge,
    "--teams-mention-badge": theme.color.mentionBadge,
    "--teams-sent-bubble": theme.color.sentBubble,
    "--teams-sent-bubble-border": theme.color.sentBubbleBorder,
    "--teams-received-bubble": theme.color.receivedBubble,
    "--teams-received-bubble-border": theme.color.receivedBubbleBorder,
    "--teams-reply-preview-bg": theme.color.replyPreviewBg,
    "--teams-reply-preview-text": theme.color.replyPreviewText,
    "--teams-compose-bar": theme.color.composeBar,
    "--teams-input-surface": theme.color.inputSurface,
    "--teams-input-placeholder": theme.color.inputPlaceholder,
    "--teams-tab-bar": theme.color.tabBar,
    "--teams-tab-active": theme.color.tabBarActive,
    "--teams-tab-inactive": theme.color.tabBarInactive,
    "--teams-call-backdrop-start": theme.color.callBackdropStart,
    "--teams-call-backdrop-end": theme.color.callBackdropEnd,
    "--teams-call-hero": theme.color.callHero,
    "--teams-call-tile": theme.color.callTile,
    "--teams-call-tile-border": theme.color.callTileBorder,
    "--teams-call-control": theme.color.callControl,
    "--teams-call-control-border": theme.color.callControlBorder,
    "--teams-shadow-card": theme.shadow.card,
    "--teams-shadow-panel": theme.shadow.panel,
    "--teams-shadow-overlay": theme.shadow.overlay,
    "--teams-shadow-bubble": theme.shadow.bubble,
    "--teams-shadow-glow": theme.shadow.glow,
    "--teams-space-xxs": px(theme.spacing.xxs),
    "--teams-space-xs": px(theme.spacing.xs),
    "--teams-space-sm": px(theme.spacing.sm),
    "--teams-space-md": px(theme.spacing.md),
    "--teams-space-lg": px(theme.spacing.lg),
    "--teams-space-xl": px(theme.spacing.xl),
    "--teams-space-xxl": px(theme.spacing.xxl),
    "--teams-radius-chip": px(theme.radius.chip),
    "--teams-radius-card": px(theme.radius.card),
    "--teams-radius-input": px(theme.radius.input),
    "--teams-radius-panel": px(theme.radius.panel),
    "--teams-radius-call-banner": px(theme.radius.callBanner),
    "--teams-radius-avatar": px(theme.radius.avatar),
    "--teams-radius-bubble": px(theme.radius.bubble),
    "--teams-radius-pill": px(theme.radius.pill),
    "--teams-type-title": px(theme.typography.title),
    "--teams-type-subtitle": px(theme.typography.subtitle),
    "--teams-type-body": px(theme.typography.body),
    "--teams-type-caption": px(theme.typography.caption),
    "--teams-type-meta": px(theme.typography.meta),
    "--teams-type-badge": px(theme.typography.badge),
    "--teams-type-hero": px(theme.typography.hero),
    "--teams-line-body": px(theme.typography.lineHeightBody),
    "--teams-line-caption": px(theme.typography.lineHeightCaption),
    "--teams-motion-fast": `${theme.motion.fastMs}ms`,
    "--teams-motion-normal": `${theme.motion.normalMs}ms`,
    "--teams-motion-slow": `${theme.motion.slowMs}ms`,
    "--teams-motion-easing": theme.motion.easing,
  } as CSSProperties;
}

export function injectTeamsStyles(): void {
  if (typeof document === "undefined" || injected) return;
  const style = document.createElement("style");
  style.setAttribute("data-tokovo-teams", "true");
  style.textContent = `
    .tokovo-teams-scrollbar::-webkit-scrollbar { width: 0; height: 0; }
    .tokovo-teams, .tokovo-teams * { box-sizing: border-box; }
    .tokovo-teams {
      position: relative;
      isolation: isolate;
    }
    .tokovo-teams::before {
      content: "";
      position: absolute;
      inset: -15% -12% auto 48%;
      height: 34%;
      border-radius: 999px;
      background: radial-gradient(circle, var(--teams-shell-aurora) 0%, rgba(255,255,255,0) 72%);
      pointer-events: none;
      filter: blur(22px);
      z-index: 0;
    }
    .tokovo-teams > * {
      position: relative;
      z-index: 1;
    }
    @keyframes tokovoTeamsBlink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    @keyframes tokovoTeamsRiseIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes tokovoTeamsMessageIn {
      from { opacity: 0; transform: translateY(12px) scale(0.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes tokovoTeamsDotBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes tokovoTeamsSpeakerPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(123,131,235,0.26); }
      70% { box-shadow: 0 0 0 10px rgba(123,131,235,0); }
    }
  `;
  document.head.appendChild(style);
  injected = true;
}

export const shellStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  background: `linear-gradient(180deg, ${token("--teams-shell-start")} 0%, ${token("--teams-shell-end")} 100%)`,
  color: token("--teams-text-primary"),
  fontFamily: teamsFontFamily,
};

export const appBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
};

export const topSurfaceStyle: CSSProperties = {
  backgroundColor: token("--teams-surface-overlay"),
  backdropFilter: "blur(18px) saturate(115%)",
  borderBottom: `1px solid ${token("--teams-border")}`,
  boxShadow: token("--teams-shadow-panel"),
};

export const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: token("--teams-space-md"),
  padding: `12px ${token("--teams-space-lg")} 14px`,
};

export const headerTitleWrapStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export const titleStyle: CSSProperties = {
  fontSize: token("--teams-type-title"),
  fontWeight: 700,
  letterSpacing: -0.4,
  color: token("--teams-text-primary"),
};

export const subtitleStyle: CSSProperties = {
  fontSize: token("--teams-type-caption"),
  lineHeight: token("--teams-line-caption"),
  color: token("--teams-text-secondary"),
};

export const chipRowStyle: CSSProperties = {
  display: "flex",
  gap: token("--teams-space-sm"),
  padding: `0 ${token("--teams-space-lg")} ${token("--teams-space-sm")}`,
  overflowX: "auto",
};

export const chipStyle = (active: boolean): CSSProperties => ({
  border: `1px solid ${active ? token("--teams-border-strong") : "transparent"}`,
  background: active ? token("--teams-selected") : "transparent",
  color: active ? token("--teams-brand-strong") : token("--teams-text-secondary"),
  boxShadow: active ? token("--teams-shadow-glow") : "none",
  borderRadius: token("--teams-radius-chip"),
  padding: "6px 12px",
  fontSize: token("--teams-type-caption"),
  fontWeight: active ? 700 : 600,
  whiteSpace: "nowrap",
});

export const searchPillStyle: CSSProperties = {
  margin: `0 ${token("--teams-space-lg")} ${token("--teams-space-sm")}`,
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderRadius: 14,
  background: `linear-gradient(135deg, ${token("--teams-surface-muted")} 0%, ${token("--teams-surface")} 100%)`,
  border: `1px solid ${token("--teams-border")}`,
  color: token("--teams-text-secondary"),
  fontSize: token("--teams-type-caption"),
  boxShadow: token("--teams-shadow-card"),
};

export const statsRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  padding: `0 ${token("--teams-space-lg")} ${token("--teams-space-md")}`,
};

export const statCardStyle: CSSProperties = {
  padding: "12px 12px 11px",
  borderRadius: 14,
  background: token("--teams-surface-elevated"),
  border: `1px solid ${token("--teams-border")}`,
  boxShadow: "none",
};

export const statValueStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: token("--teams-text-primary"),
  letterSpacing: -0.3,
};

export const statLabelStyle: CSSProperties = {
  marginTop: 2,
  fontSize: token("--teams-type-meta"),
  color: token("--teams-text-secondary"),
};

export const contentScrollStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
};

export const sectionLabelStyle: CSSProperties = {
  fontSize: token("--teams-type-caption"),
  fontWeight: 700,
  color: token("--teams-text-secondary"),
  letterSpacing: -0.1,
  padding: `18px ${token("--teams-space-lg")} 10px`,
};

export const listSectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
  padding: `0 ${token("--teams-space-lg")} ${token("--teams-space-lg")}`,
  background: token("--teams-surface"),
  borderRadius: 18,
  overflow: "hidden",
  boxShadow: token("--teams-shadow-card"),
};

export const rowCardStyle = (
  active = false,
  emphasized = false,
): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: token("--teams-space-md"),
  padding: "12px 16px",
  borderRadius: 0,
  border: "none",
  borderBottom: `0.5px solid ${active ? token("--teams-border-strong") : token("--teams-border")}`,
  background: active ? token("--teams-selected") : "transparent",
  boxShadow: "none",
  position: "relative",
  minHeight: emphasized ? 76 : 72,
  animation: "tokovoTeamsRiseIn var(--teams-motion-normal) var(--teams-motion-easing) both",
});

export const rowMainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

export const rowTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: token("--teams-text-primary"),
};

export const rowSubtitleStyle: CSSProperties = {
  fontSize: token("--teams-type-caption"),
  lineHeight: token("--teams-line-caption"),
  color: token("--teams-text-secondary"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
};

export const rowAuxTextStyle: CSSProperties = {
  fontSize: token("--teams-type-meta"),
  color: token("--teams-text-muted"),
};

export const rowFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginTop: 4,
};

export const badgeStyle = (
  tone: "unread" | "mention" | "muted",
): CSSProperties => ({
  minWidth: tone === "muted" ? 22 : 24,
  height: 24,
  borderRadius: token("--teams-radius-pill"),
  padding: "0 8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor:
    tone === "mention"
      ? token("--teams-mention-badge")
      : tone === "muted"
        ? token("--teams-surface-muted")
        : token("--teams-unread-badge"),
  color: tone === "muted" ? token("--teams-text-secondary") : token("--teams-text-inverse"),
  fontSize: token("--teams-type-badge"),
  fontWeight: 700,
});

export const threadViewportStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: `${token("--teams-space-md")} ${token("--teams-space-lg")} ${token("--teams-space-lg")}`,
  display: "flex",
  flexDirection: "column",
  gap: token("--teams-space-md"),
};

export const threadContextCardStyle: CSSProperties = {
  marginBottom: 4,
  padding: "12px 14px",
  borderRadius: 14,
  background: token("--teams-surface"),
  border: `1px solid ${token("--teams-border")}`,
  boxShadow: token("--teams-shadow-card"),
};

export const threadContextTitleStyle: CSSProperties = {
  fontSize: token("--teams-type-caption"),
  fontWeight: 700,
  color: token("--teams-text-primary"),
};

export const threadContextMetaStyle: CSSProperties = {
  marginTop: 3,
  fontSize: token("--teams-type-meta"),
  color: token("--teams-text-secondary"),
};

export const threadDatePillStyle: CSSProperties = {
  alignSelf: "center",
  padding: "4px 10px",
  borderRadius: 999,
  background: token("--teams-surface-muted"),
  color: token("--teams-text-secondary"),
  fontSize: token("--teams-type-meta"),
  border: `1px solid ${token("--teams-border")}`,
};

export const unreadDividerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  alignSelf: "center",
  gap: 8,
  padding: "5px 10px",
  borderRadius: 999,
  background: token("--teams-brand-soft"),
  color: token("--teams-brand-strong"),
  fontSize: token("--teams-type-meta"),
  fontWeight: 700,
};

export const messageClusterWrapStyle = (isMine: boolean): CSSProperties => ({
  display: "flex",
  justifyContent: isMine ? "flex-end" : "flex-start",
  animation: "tokovoTeamsMessageIn var(--teams-motion-normal) var(--teams-motion-easing) both",
});

export const messageCardStyle = (isMine: boolean): CSSProperties => ({
  maxWidth: "86%",
  display: "flex",
  gap: 10,
  alignItems: "flex-end",
  flexDirection: isMine ? "row-reverse" : "row",
});

export const bubbleStyle = (
  isMine: boolean,
  clusterPosition: "single" | "start" | "middle" | "end" = "single",
): CSSProperties => ({
  padding: "10px 12px",
  borderRadius:
    clusterPosition === "single"
      ? isMine
        ? "18px 18px 4px 18px"
        : "18px 18px 18px 4px"
      : clusterPosition === "start"
        ? isMine
          ? "18px 18px 4px 18px"
          : "18px 18px 18px 4px"
        : clusterPosition === "middle"
          ? isMine
            ? "18px 4px 4px 18px"
            : "4px 18px 18px 4px"
          : isMine
            ? "18px 4px 18px 18px"
            : "4px 18px 18px 18px",
  background: isMine ? token("--teams-sent-bubble") : token("--teams-received-bubble"),
  color: token("--teams-text-primary"),
  border: `1px solid ${
    isMine ? token("--teams-sent-bubble-border") : token("--teams-received-bubble-border")
  }`,
  boxShadow: token("--teams-shadow-bubble"),
});

export const bubbleSenderStyle = (isMine: boolean): CSSProperties => ({
  fontSize: token("--teams-type-meta"),
  fontWeight: 700,
  marginBottom: 4,
  color: isMine ? "rgba(255,255,255,0.92)" : token("--teams-brand"),
});

export const replyPreviewStyle = (isMine: boolean): CSSProperties => ({
  padding: "7px 9px",
  borderRadius: 10,
  background: isMine ? token("--teams-surface") : token("--teams-reply-preview-bg"),
  color: token("--teams-reply-preview-text"),
  marginBottom: 8,
  fontSize: token("--teams-type-meta"),
  lineHeight: "15px",
});

export const bubbleTextStyle = (isMine: boolean): CSSProperties => ({
  fontSize: token("--teams-type-body"),
  lineHeight: token("--teams-line-body"),
  color: isMine ? token("--teams-text-inverse") : token("--teams-text-primary"),
  whiteSpace: "pre-wrap",
});

export const bubbleMetaStyle = (isMine: boolean): CSSProperties => ({
  marginTop: 6,
  fontSize: token("--teams-type-meta"),
  color: isMine ? "rgba(249,251,255,0.78)" : token("--teams-text-muted"),
  opacity: 1,
  textAlign: "right",
});

export const reactionBarStyle = (isMine: boolean): CSSProperties => ({
  display: "flex",
  justifyContent: isMine ? "flex-end" : "flex-start",
  gap: 4,
  marginTop: -8,
  marginLeft: isMine ? 0 : 42,
  marginRight: isMine ? 42 : 0,
  position: "relative",
  zIndex: 2,
});

export const reactionChipStyle = (active = false): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "3px 7px",
  borderRadius: 999,
  background: active ? token("--teams-brand-soft") : token("--teams-surface"),
  border: `1px solid ${active ? token("--teams-border-strong") : token("--teams-border")}`,
  boxShadow: "0 2px 6px rgba(16,24,40,0.08)",
  fontSize: 11,
  fontWeight: 700,
  lineHeight: 1,
  color: active ? token("--teams-brand-strong") : token("--teams-text-secondary"),
});

export const typingStripStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: token("--teams-radius-pill"),
  background: token("--teams-surface"),
  border: `1px solid ${token("--teams-border")}`,
  fontSize: token("--teams-type-caption"),
  color: token("--teams-text-secondary"),
  boxShadow: token("--teams-shadow-card"),
};

export const typingDotsStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

export const typingDotStyle = (delayMs: number): CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: 999,
  background: token("--teams-brand"),
  animation: `tokovoTeamsDotBounce 1.1s ease-in-out ${delayMs}ms infinite`,
});

export const composerWrapStyle: CSSProperties = {
  padding: `10px ${token("--teams-space-lg")} 14px`,
  background: token("--teams-compose-bar"),
  borderTop: `1px solid ${token("--teams-border")}`,
  backdropFilter: "blur(18px) saturate(110%)",
};

export const composerToolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  paddingBottom: 8,
  overflowX: "auto",
};

export const composerToolStyle = (active = false): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 28,
  height: 28,
  borderRadius: 8,
  border: `1px solid ${active ? token("--teams-border-strong") : "transparent"}`,
  background: active ? token("--teams-selected") : "transparent",
  color: active ? token("--teams-brand-strong") : token("--teams-text-secondary"),
  fontSize: token("--teams-type-meta"),
  fontWeight: 700,
});

export const composerInnerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 10,
  borderRadius: 12,
  background: token("--teams-input-surface"),
  border: `1px solid ${token("--teams-border")}`,
  boxShadow: token("--teams-shadow-card"),
};

export const composerInputStyle = (hasText: boolean): CSSProperties => ({
  flex: 1,
  minHeight: 24,
  display: "flex",
  alignItems: "center",
  gap: 2,
  fontSize: token("--teams-type-body"),
  lineHeight: token("--teams-line-body"),
  color: hasText ? token("--teams-text-primary") : token("--teams-input-placeholder"),
  whiteSpace: "pre-wrap",
});

export const composerCursorStyle: CSSProperties = {
  width: 1.5,
  height: 18,
  background: token("--teams-brand"),
  borderRadius: 999,
  animation: "tokovoTeamsBlink 1s steps(1) infinite",
  flexShrink: 0,
};

export const composerActionsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  paddingTop: 10,
  color: token("--teams-text-secondary"),
};

export const composerSendButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: token("--teams-brand"),
  color: token("--teams-text-inverse"),
  boxShadow: token("--teams-shadow-glow"),
};

export const tabBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  padding: "6px 10px calc(6px + env(safe-area-inset-bottom, 0px))",
  background: token("--teams-tab-bar"),
  borderTop: `1px solid ${token("--teams-border")}`,
  backdropFilter: "blur(18px) saturate(110%)",
};

export const tabItemStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  color: active ? token("--teams-tab-active") : token("--teams-tab-inactive"),
  fontSize: 10,
  fontWeight: active ? 700 : 600,
});

export const callSurfaceStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: 20,
  background: `radial-gradient(circle at top, ${token("--teams-call-backdrop-start")} 0%, ${token("--teams-call-backdrop-end")} 58%, #04060c 100%)`,
  color: token("--teams-text-inverse"),
};

export const callHeroStyle: CSSProperties = {
  padding: "18px 16px",
  borderRadius: token("--teams-radius-panel"),
  border: `1px solid ${token("--teams-call-tile-border")}`,
  background: token("--teams-call-hero"),
  backdropFilter: "blur(28px) saturate(135%)",
  boxShadow: token("--teams-shadow-overlay"),
};

export const callGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginTop: 20,
  flex: 1,
};

export const callTileStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: 8,
  minHeight: 140,
  borderRadius: token("--teams-radius-panel"),
  padding: 16,
  background: token("--teams-call-tile"),
  border: `1px solid ${token("--teams-call-tile-border")}`,
  boxShadow: token("--teams-shadow-overlay"),
  backdropFilter: "blur(20px) saturate(120%)",
};

export const callSpeakerRingStyle = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  borderRadius: 999,
  padding: 4,
  border: active ? `1px solid ${token("--teams-brand")}` : "1px solid transparent",
  animation: active ? "tokovoTeamsSpeakerPulse 1.4s ease-out infinite" : "none",
});

export const callWaveformStyle = (active: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "flex-end",
  gap: 3,
  height: 14,
  opacity: active ? 1 : 0.4,
});

export const callWaveBarStyle = (height: number, delayMs: number): CSSProperties => ({
  width: 3,
  height,
  borderRadius: 999,
  background: "rgba(255,255,255,0.88)",
  animation: `tokovoTeamsDotBounce 1.1s ease-in-out ${delayMs}ms infinite`,
});

export const callControlsWrapStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  paddingTop: 18,
};

export const callControlStyle = (critical = false): CSSProperties => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: "12px 8px",
  borderRadius: 18,
  color: token("--teams-text-inverse"),
  background: critical ? token("--teams-danger") : token("--teams-call-control"),
  border: critical ? "none" : `1px solid ${token("--teams-call-control-border")}`,
});
