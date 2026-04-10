import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
import { useXTheme } from "./ThemeContext.js";
import { getXState } from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import { Avatar, XIcon } from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";

interface ComposeProps {
  world: WorldState;
  deviceId?: string;
  t?: number;
}

export const Compose: React.FC<ComposeProps> = ({ world, deviceId, t }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const draft = state?.composeDraft ?? "";
  const currentUser = state?.users.find((u) => u.id === state?.currentUserId);
  const focusedDevice =
    (deviceId && world.devices?.[deviceId]) ||
    world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = focusedDevice?.keyboard;
  const typedDraft =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : draft;
  const count = typedDraft.length;
  const canPost = count > 0 && count <= 280;
  const ctaBg = canPost ? theme.colors.textPrimary : theme.colors.surfaceRaised;
  const ctaFg = canPost ? theme.colors.background : theme.colors.textMuted;

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${theme.spacing.screenPadding}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 15, color: theme.colors.textPrimary }}>Cancel</span>
        <div
          style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            letterSpacing: 0.2,
          }}
        >
          Drafts
        </div>
        <div
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            backgroundColor: ctaBg,
            color: ctaFg,
            fontSize: 15,
            fontWeight: 700,
            opacity: canPost ? 1 : 0.8,
          }}
        >
          Post
        </div>
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: `${theme.spacing.screenPadding}px`,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <Avatar size={42} src={currentUser?.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.accent,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Everyone
                <XIcon name="more" size={14} color={theme.colors.accent} />
              </div>
              <div
                style={{
                  marginTop: 14,
                  minHeight: 210,
                  fontSize: 30,
                  lineHeight: 1.24,
                  letterSpacing: -0.5,
                  color: typedDraft ? theme.colors.textPrimary : theme.colors.textSecondary,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {typedDraft || "What is happening?"}
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: theme.colors.accent,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <XIcon name="grok" size={16} color={theme.colors.accent} />
                Grok it
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto", flexShrink: 0 }}>
            <div
              style={{
                margin: `0 ${theme.spacing.screenPadding}px`,
                padding: "12px 0",
                borderTop: `1px solid ${theme.colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: theme.colors.accent,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <XIcon name="compose" size={18} color={theme.colors.accent} />
                <XIcon name="mail" size={18} color={theme.colors.accent} />
                <XIcon name="grok" size={18} color={theme.colors.accent} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: count > 280 ? theme.colors.likeActive : theme.colors.textSecondary,
                  }}
                >
                  {count}/280
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: `2px solid ${count > 280 ? theme.colors.likeActive : theme.colors.borderStrong}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </ScreenTransition>
    </AppShell>
  );
};
